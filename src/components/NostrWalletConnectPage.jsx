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
      
      <NostrWalletConnect />
    </div>
  );
};

export default NostrWalletConnectPage;