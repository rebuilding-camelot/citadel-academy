// File: components/common/EventManagerDemo.tsx
// A simple demo component showing how to use the CitadelEventManager
import React, { useState } from 'react';
import { Event } from 'nostr-tools';
import { useCitadelEventManager } from '../../hooks/useCitadelEventManager';

interface EventManagerDemoProps {
  productEvent?: Event;
}

const EventManagerDemo: React.FC<EventManagerDemoProps> = ({ productEvent }) => {
  const { manager, loading, error, purchaseProduct } = useCitadelEventManager();
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'fedimint'>('lightning');
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sample product event for demonstration
  const sampleProductEvent: Event = productEvent || {
    kind: 30017,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', 'sample-product-123'],
      ['title', 'Sample Digital Product'],
      ['price', '1000'],
      ['url', 'https://example.com/sample-file.pdf']
    ],
    content: 'Sample product description',
    pubkey: '00000000000000000000000000000000000000000000000000000000000000000',
    id: 'sample-id-123',
    sig: 'sample-sig-123'
  };

  const handlePurchase = async () => {
    if (loading) return;
    
    setPurchaseStatus('loading');
    try {
      await purchaseProduct(sampleProductEvent, paymentMethod);
      setPurchaseStatus('success');
    } catch (err) {
      setPurchaseStatus('error');
      setErrorMessage((err as Error).message);
    }
  };

  return (
    <div className="event-manager-demo" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h3>Unified Event Manager Demo</h3>
      
      {loading && <p>Loading event manager...</p>}
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error initializing event manager: {error.message}
        </div>
      )}
      
      {manager && (
        <>
          <div style={{ margin: '15px 0' }}>
            <p><strong>Status:</strong> Ready to use</p>
            <p><strong>Payment Method:</strong></p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setPaymentMethod('lightning')}
                style={{ 
                  background: paymentMethod === 'lightning' ? '#3498db' : '#f1f1f1',
                  color: paymentMethod === 'lightning' ? 'white' : 'black',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ⚡ Lightning
              </button>
              <button 
                onClick={() => setPaymentMethod('fedimint')}
                style={{ 
                  background: paymentMethod === 'fedimint' ? '#3498db' : '#f1f1f1',
                  color: paymentMethod === 'fedimint' ? 'white' : 'black',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔐 Fedimint
              </button>
            </div>
          </div>
          
          <div style={{ margin: '15px 0' }}>
            <h4>Sample Product:</h4>
            <p><strong>Title:</strong> {sampleProductEvent.tags.find(tag => tag[0] === 'title')?.[1]}</p>
            <p><strong>Price:</strong> {sampleProductEvent.tags.find(tag => tag[0] === 'price')?.[1]} sats</p>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={purchaseStatus === 'loading'}
            style={{
              background: '#2ecc71',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: purchaseStatus === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            {purchaseStatus === 'loading' ? 'Processing...' : 'Purchase with Unified Flow'}
          </button>
          
          {purchaseStatus === 'success' && (
            <div style={{ color: 'green', margin: '10px 0' }}>
              Purchase successful! The unified event manager handled:
              <ul>
                <li>NIP-57 zap request creation</li>
                <li>Payment processing</li>
                <li>NIP-15 purchase order creation</li>
                <li>NIP-78 progress tracking update</li>
                <li>NIP-94 file access granting</li>
              </ul>
            </div>
          )}
          
          {purchaseStatus === 'error' && (
            <div style={{ color: 'red', margin: '10px 0' }}>
              Purchase failed: {errorMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventManagerDemo;