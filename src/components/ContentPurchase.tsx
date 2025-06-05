import React, { useState, useEffect, useRef } from 'react';
import '../styles/ContentPurchase.css';
import { WebMobileIntegration } from '../../lib/mobile-integration';

// Define the AtomicSwap interface to match the one in lib/atomic-swap.ts
interface AtomicSwap {
  id: string;
  invoice: string;
  contentId: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  // Note: The full interface in lib/atomic-swap.ts includes additional fields
  // like preimage and hash that are not needed in the frontend component
}

export const ContentPurchase: React.FC<{ contentId: string, priceSats: number }> = 
({ contentId, priceSats }) => {
  const [swap, setSwap] = useState<AtomicSwap | null>(null);
  const [status, setStatus] = useState('idle');
  const intervalRef = useRef<number | null>(null);
  const [mobileIntegration, setMobileIntegration] = useState<WebMobileIntegration | null>(null);

  // Clean up interval on component unmount
  useEffect(() => {
    // Initialize mobile integration if Nostr client is available
    if (window.nostrClient && window.userKeys) {
      setMobileIntegration(new WebMobileIntegration(window.nostrClient, window.userKeys));
    }
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Function to deliver content and notify mobile app
  const deliverContent = async (contentId: string) => {
    try {
      // Deliver content in web app (implementation depends on your app)
      console.log(`Delivering content: ${contentId}`);
      
      // Notify mobile app about the purchase
      if (mobileIntegration) {
        // Try to open the course in mobile app
        await mobileIntegration.openCourseInMobile(contentId);
        
        // Also sync the purchase as progress data
        await mobileIntegration.syncProgressToMobile(contentId, 0); // 0% progress for new purchase
      }
    } catch (error) {
      console.error('Error delivering content:', error);
    }
  };

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
          // Trigger content delivery
          deliverContent(contentId);
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
        setStatus('error'); // Note: 'error' is a UI state, not a server-side swap status
      }
    }, 3000);

    // Store the interval ID
    intervalRef.current = interval;
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
          <div className={`status-indicator ${status}`}>
            {status.toUpperCase()}
          </div>
          {status === 'pending' && (
            <div className="lightning-invoice">
              <p>Scan or copy this Lightning invoice to pay:</p>
              <code>{swap.invoice}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(swap.invoice)}
                className="copy-btn"
              >
                Copy Invoice
              </button>
              <p className="expiry-note">Invoice expires in 1 hour</p>
            </div>
          )}
          {status === 'paid' && (
            <div className="success-message">
              <p>Payment received! Your content is now available.</p>
              <p>Transaction ID: {swap.id}</p>
            </div>
          )}
          {status === 'expired' && (
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