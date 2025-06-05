import React, { useState, useEffect, useRef } from 'react';
import '../../styles/atomic-swap.css';

// Define the AtomicSwap interface to match the one in lib/atomic-swap.ts
interface AtomicSwap {
  id: string;
  invoice: string;
  contentId: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
}

interface AtomicSwapProps {
  contentId: string;
  priceSats: number;
  onPaymentComplete?: (swapId: string) => void;
}

export const AtomicSwap: React.FC<AtomicSwapProps> = ({ 
  contentId, 
  priceSats,
  onPaymentComplete 
}) => {
  const [swap, setSwap] = useState<AtomicSwap | null>(null);
  const [status, setStatus] = useState('idle');
  const [copySuccess, setCopySuccess] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initiateSwap = async () => {
    setStatus('creating');
    try {
      const response = await fetch('/api/create-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, priceSats })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create swap: ${response.statusText}`);
      }
      
      const newSwap = await response.json();
      setSwap(newSwap);
      setStatus('pending');
      startPolling(newSwap.id);
    } catch (error) {
      console.error('Error creating swap:', error);
      setStatus('error');
    }
  };

  const startPolling = (swapId: string) => {
    // Clear any existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    // Start a new polling interval
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/check-swap?swapId=${swapId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to check swap: ${response.statusText}`);
        }
        
        const swapStatus = await response.json();
        setSwap(prevSwap => ({ ...prevSwap, ...swapStatus }));
        
        if (swapStatus.status === 'paid') {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatus('paid');
          
          // Call the onPaymentComplete callback if provided
          if (onPaymentComplete) {
            onPaymentComplete(swapId);
          }
        } else if (swapStatus.status === 'expired') {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatus('expired');
        }
      } catch (error) {
        console.error('Error checking swap status:', error);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setStatus('error');
      }
    }, 3000);

    // Store the interval ID
    intervalRef.current = interval;
  };

  const copyToClipboard = async () => {
    if (swap) {
      try {
        await navigator.clipboard.writeText(swap.invoice);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy invoice:', err);
      }
    }
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="purchase-container">
      {!swap ? (
        <button 
          onClick={initiateSwap}
          disabled={status !== 'idle'}
          className="purchase-btn"
        >
          {status === 'creating' ? 'Creating Swap...' : `Purchase for ${priceSats} sats`}
        </button>
      ) : (
        <div className="swap-details">
          <div className={`status-indicator ${swap.status}`}>
            {swap.status.toUpperCase()}
          </div>
          
          {swap.status === 'pending' && (
            <div className="lightning-invoice">
              <p>Scan or copy this Lightning invoice to pay:</p>
              <code>{swap.invoice}</code>
              <button 
                onClick={copyToClipboard}
                className="copy-btn"
              >
                {copySuccess ? 'Copied!' : 'Copy Invoice'}
              </button>
              <p className="expiry-note">
                Invoice created at {formatDate(swap.createdAt)} and expires in 1 hour
              </p>
            </div>
          )}
          
          {swap.status === 'paid' && (
            <div className="success-message">
              <p>Payment received! Your content is now available.</p>
              <p>Transaction ID: {swap.id}</p>
              <p>Completed at: {formatDate(swap.createdAt)}</p>
            </div>
          )}
          
          {swap.status === 'expired' && (
            <div className="expired-message">
              <p>Invoice expired. Please try again.</p>
              <button 
                onClick={initiateSwap}
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="error-message">
              <p>An error occurred while processing your payment.</p>
              <button 
                onClick={initiateSwap}
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};