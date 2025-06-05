import React from 'react';
import AtomicSwapPurchase from '../components/AtomicSwapPurchase';

const AtomicSwapExample: React.FC = () => {
  return (
    <div className="container">
      <h1>Atomic Swap Purchase Example</h1>
      <p>
        This page demonstrates how to use the Atomic Swap API to purchase digital content
        with Lightning Network payments. The payment is atomic, meaning the content is only
        delivered after the payment is confirmed.
      </p>
      
      <div className="example-content">
        <AtomicSwapPurchase
          contentId="premium-course-123"
          priceSats={1000}
          title="Premium Bitcoin Course"
          description="Learn advanced Bitcoin concepts with our premium course. This course covers Lightning Network, Taproot, and more."
        />
      </div>
      
      <div className="technical-details">
        <h2>How It Works</h2>
        <ol>
          <li>
            <strong>Create Swap:</strong> When you click "Purchase with Lightning", the app calls
            the <code>/api/create-swap</code> endpoint to create a new atomic swap.
          </li>
          <li>
            <strong>Lightning Invoice:</strong> The server generates a Lightning invoice with a
            payment hash derived from a secret preimage.
          </li>
          <li>
            <strong>Nostr Event:</strong> The swap details are published to the Nostr network
            as a commerce event (NIP-2312).
          </li>
          <li>
            <strong>Payment Monitoring:</strong> The app periodically checks the payment status
            using the <code>/api/check-swap</code> endpoint.
          </li>
          <li>
            <strong>Content Delivery:</strong> Once payment is confirmed, the content is unlocked
            and the Nostr event is updated with the new status.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default AtomicSwapExample;