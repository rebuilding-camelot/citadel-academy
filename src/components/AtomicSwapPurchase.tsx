import React, { useState } from 'react';
import './ContentPurchase.css'; // Reusing existing styles

interface AtomicSwapPurchaseProps {
  contentId: string;
  priceSats: number;
  title: string;
  description: string;
}

const AtomicSwapPurchase: React.FC<AtomicSwapPurchaseProps> = ({
  contentId,
  priceSats,
  title,
  description
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swap, setSwap] = useState<any | null>(null);
  const [status, setStatus] = useState<'initial' | 'pending' | 'paid' | 'expired'>('initial');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Create a new atomic swap
  const initiateSwap = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/create-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          priceSats,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create swap');
      }
      
      const swapData = await response.json();
      setSwap(swapData);
      setStatus('pending');
      
      // Start checking the status periodically
      const interval = setInterval(() => checkSwapStatus(swapData.id), 5000);
      setStatusCheckInterval(interval);
      
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Check the status of an existing swap
  const checkSwapStatus = async (swapId: string) => {
    try {
      const response = await fetch(`/api/check-swap?swapId=${swapId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check swap status');
      }
      
      const swapData = await response.json();
      
      // Update the status
      setStatus(swapData.status);
      
      // If the swap is no longer pending, stop checking
      if (swapData.status !== 'pending') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        // If paid, show success message or redirect to content
        if (swapData.status === 'paid') {
          // You could redirect to the content or show a success message
          console.log('Payment confirmed! Unlocking content...');
        }
      }
      
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to check swap status'
      );
      
      // Stop checking on error
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
    }
  };
  
  // Clean up interval on component unmount
  React.useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);
  
  // Render QR code for the invoice
  const renderQRCode = () => {
    if (!swap || !swap.invoice) return null;
    
    // This assumes you have a QR code component
    // You could use a library like qrcode.react
    return (
      <div className="qr-container">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=lightning:${swap.invoice}`} 
          alt="Lightning Invoice QR Code" 
        />
        <div className="invoice-text">
          <p>Invoice: {swap.invoice}</p>
          <button 
            onClick={() => navigator.clipboard.writeText(swap.invoice)}
            className="copy-button"
          >
            Copy Invoice
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="content-purchase-container">
      <h2>{title}</h2>
      <p className="content-description">{description}</p>
      <div className="price-tag">{priceSats} sats</div>
      
      {error && <div className="error-message">{error}</div>}
      
      {status === 'initial' && (
        <button 
          onClick={initiateSwap} 
          disabled={loading}
          className="purchase-button"
        >
          {loading ? 'Creating Invoice...' : 'Purchase with Lightning'}
        </button>
      )}
      
      {status === 'pending' && (
        <div className="payment-pending">
          <h3>Waiting for Payment</h3>
          {renderQRCode()}
          <p>Scan the QR code with your Lightning wallet to complete the purchase.</p>
        </div>
      )}
      
      {status === 'paid' && (
        <div className="payment-success">
          <h3>Payment Received!</h3>
          <p>Your content is now available.</p>
          <button className="access-button">Access Content</button>
        </div>
      )}
      
      {status === 'expired' && (
        <div className="payment-expired">
          <h3>Payment Expired</h3>
          <p>The payment window has expired. Please try again.</p>
          <button 
            onClick={initiateSwap}
            className="purchase-button"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AtomicSwapPurchase;