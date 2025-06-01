import React from 'react';
import NostrWalletConnect from './NostrWalletConnect';

const NostrWalletConnectPage = () => {
  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: 24, textAlign: 'center' }}>Nostr Wallet Connect</h1>
      <p style={{ textAlign: 'center', marginBottom: 40 }}>
        Connect your Lightning wallet using Nostr Wallet Connect (NWC) protocol
      </p>
      
      <div style={{ 
        background: 'rgba(0,0,0,0.05)', 
        padding: '15px 20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '10px' }}>Enhanced Nostr Integration</h3>
        <p>
          Our unified event manager now seamlessly integrates marketplace purchases, 
          payments, and progress tracking across multiple NIPs (15, 57, 78, 94).
        </p>
      </div>
      
      <NostrWalletConnect />
    </div>
  );
};

export default NostrWalletConnectPage;