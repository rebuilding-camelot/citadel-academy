import React, { useState } from 'react';
import { useNostrWalletConnect } from '../hooks/useNostrWalletConnect';
import QRCode from 'react-qr-code';
import './NostrWalletConnect.css';

const NostrWalletConnect = () => {
  const {
    connected,
    walletPubkey,
    balance,
    connect,
    disconnect,
    payInvoice,
    makeInvoice,
    getWalletInfo
  } = useNostrWalletConnect();
  const [connectionInput, setConnectionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      const success = await connect(connectionInput);
      if (success) {
        setConnectionInput('');
        alert('Wallet connected successfully!');
      } else {
        alert('Failed to connect wallet');
      }
    } catch (error) {
      alert('Connection error: ' + error.message);
    }
    setLoading(false);
  };

  const handlePayInvoice = async () => {
    if (!invoice.trim()) return;
    
    setLoading(true);
    try {
      const result = await payInvoice(invoice);
      alert('Payment successful! Preimage: ' + result.preimage);
      setInvoice('');
    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleCreateInvoice = async () => {
    if (!amount || !description.trim()) return;
    
    setLoading(true);
    try {
      const result = await makeInvoice(parseInt(amount), description);
      setGeneratedInvoice(result.invoice);
    } catch (error) {
      alert('Invoice creation failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleRefreshBalance = async () => {
    setLoading(true);
    try {
      await getWalletInfo();
    } catch (error) {
      alert('Failed to refresh balance: ' + error.message);
    }
    setLoading(false);
  };

  if (!connected) {
    return (
      <div className="nwc-container">
        <h2>Connect Your Lightning Wallet</h2>
        <p>Connect your Alby, Mutiny, or other NWC-compatible wallet to Citadel Academy</p>
        
        <div className="connection-form">
          <input
            type="text"
            placeholder="Paste your NWC connection string here..."
            value={connectionInput}
            onChange={(e) => setConnectionInput(e.target.value)}
            className="connection-input"
          />
          <button 
            onClick={handleConnect} 
            disabled={loading || !connectionInput.trim()}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
        <div className="connection-help">
          <h3>How to get your connection string:</h3>
          <ul>
            <li><strong>Alby:</strong> Go to Apps → Create new app → Copy connection string</li>
            <li><strong>Mutiny:</strong> Settings → Nostr Wallet Connect → Create connection</li>
            <li><strong>Other wallets:</strong> Look for "NWC" or "Nostr Wallet Connect" in settings</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="nwc-container">
      <div className="wallet-status">
        <h2>⚡ Wallet Connected</h2>
        <p><strong>Pubkey:</strong> {walletPubkey.slice(0, 16)}...</p>
        <p><strong>Balance:</strong> {balance.toLocaleString()} sats</p>
        <button onClick={handleRefreshBalance} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Balance'}
        </button>
        <button onClick={disconnect} className="disconnect-button">
          Disconnect
        </button>
      </div>

      <div className="payment-section">
        <h3>Pay Lightning Invoice</h3>
        <div className="payment-form">
          <input
            type="text"
            placeholder="Paste lightning invoice here..."
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            className="invoice-input"
          />
          <button 
            onClick={handlePayInvoice} 
            disabled={loading || !invoice.trim()}
            className="pay-button"
          >
            {loading ? 'Paying...' : 'Pay Invoice'}
          </button>
        </div>
      </div>

      <div className="invoice-section">
        <h3>Create Invoice</h3>
        <div className="invoice-form">
          <input
            type="number"
            placeholder="Amount (sats)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="amount-input"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="description-input"
          />
          <button 
            onClick={handleCreateInvoice} 
            disabled={loading || !amount || !description.trim()}
            className="create-invoice-button"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
        {generatedInvoice && (
          <div className="generated-invoice">
            <h4>Generated Invoice:</h4>
            <QRCode value={generatedInvoice} size={200} />
            <textarea
              value={generatedInvoice}
              readOnly
              className="invoice-text"
              onClick={(e) => e.target.select()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NostrWalletConnect;