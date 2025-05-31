import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import NostrWalletConnect from '../NostrWalletConnect';

const LightningWalletWithNWC = ({ mobile }) => {
  const [activeTab, setActiveTab] = useState('balance');

  // Define styles
  const sectionStyle = {
    background: 'rgba(42, 0, 102, 0.3)',
    padding: 24,
    borderRadius: 8,
    marginBottom: 30
  };

  const tabStyle = (active) => ({
    padding: '12px 20px',
    background: active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
    cursor: 'pointer',
    color: active ? '#F59E0B' : '#fff',
    fontWeight: active ? 'bold' : 'normal',
    border: active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)'
  });

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Lightning Wallet</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
        <div 
          style={tabStyle(activeTab === 'balance')}
          onClick={() => setActiveTab('balance')}
        >
          <Icon name="bolt" /> Balance & Rewards
        </div>
        <div 
          style={tabStyle(activeTab === 'transactions')}
          onClick={() => setActiveTab('transactions')}
        >
          <Icon name="exchange" /> Transactions
        </div>
        <div 
          style={tabStyle(activeTab === 'nwc')}
          onClick={() => setActiveTab('nwc')}
        >
          <Icon name="plug" /> Nostr Wallet Connect
        </div>
      </div>
      
      {/* NWC Tab */}
      {activeTab === 'nwc' && (
        <div>
          <section style={sectionStyle}>
            <NostrWalletConnect />
          </section>
        </div>
      )}
      
      {/* Other tabs would go here */}
      {activeTab !== 'nwc' && (
        <div style={sectionStyle}>
          <h3>This tab is not implemented in this example</h3>
          <p>Please switch to the "Nostr Wallet Connect" tab to see the NWC implementation.</p>
        </div>
      )}
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default connect(mapState)(LightningWalletWithNWC);