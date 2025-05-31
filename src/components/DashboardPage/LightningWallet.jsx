import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useNostrWalletConnect } from '../../hooks/useNostrWalletConnect';
import QRCode from 'react-qr-code';
import NostrWalletConnect from '../NostrWalletConnect';

const LightningWallet = ({ mobile }) => {
  const [activeTab, setActiveTab] = useState('balance');
  const [invoiceAmount, setInvoiceAmount] = useState(100);
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoice, setInvoice] = useState('');
  const [paymentInvoice, setPaymentInvoice] = useState('');
  const [connectionInput, setConnectionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
  
  // Refresh wallet info when tab changes to balance
  useEffect(() => {
    if (activeTab === 'balance' && connected) {
      getWalletInfo().catch(err => {
        console.error('Failed to refresh wallet info:', err);
      });
    }
  }, [activeTab, connected, getWalletInfo]);
  
  // Handle wallet connection
  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await connect(connectionInput);
      if (success) {
        setSuccess('Wallet connected successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setConnectionInput('');
      } else {
        setError('Failed to connect wallet. Please check your connection string.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle invoice creation
  const handleCreateInvoice = async () => {
    setLoading(true);
    setError('');
    setInvoice('');
    try {
      const result = await makeInvoice(invoiceAmount, invoiceDescription);
      setInvoice(result.bolt11);
      setSuccess('Invoice created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle payment
  const handlePayInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      await payInvoice(paymentInvoice);
      setPaymentInvoice('');
      setSuccess('Payment sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };
  
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

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 16,
    border: 'none',
    cursor: 'pointer'
  };

  const transactionStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };
  
  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    padding: '8px 12px',
    color: '#fff',
    width: '100%',
    marginBottom: 16
  };
  
  const alertStyle = (type) => ({
    padding: '12px 16px',
    borderRadius: 4,
    marginBottom: 16,
    background: type === 'error' ? 'rgba(255, 100, 100, 0.2)' : 'rgba(0, 200, 83, 0.2)',
    border: `1px solid ${type === 'error' ? 'rgba(255, 100, 100, 0.5)' : 'rgba(0, 200, 83, 0.5)'}`,
    color: type === 'error' ? '#FF6464' : '#00C853'
  });

  // Mock data for wallet balance (used when not connected to real wallet)
  const walletData = {
    balance: connected ? balance : 21000,
    pendingPayments: 0,
    courseRewards: 15000,
    zapRewards: 6000
  };

  // Mock data for transactions
  const transactions = [
    {
      id: 1,
      type: 'received',
      amount: 5000,
      description: 'Course completion reward: Bitcoin Basics',
      date: '2023-05-10T14:30:00Z'
    },
    {
      id: 2,
      type: 'received',
      amount: 1000,
      description: 'Zap reward from community post',
      date: '2023-05-08T09:15:00Z'
    },
    {
      id: 3,
      type: 'sent',
      amount: 500,
      description: 'Zap to community post',
      date: '2023-05-05T16:45:00Z'
    },
    {
      id: 4,
      type: 'received',
      amount: 10000,
      description: 'Course completion reward: Family Bitcoin Planning',
      date: '2023-04-28T11:20:00Z'
    },
    {
      id: 5,
      type: 'received',
      amount: 5000,
      description: 'Zap rewards from multiple posts',
      date: '2023-04-20T13:10:00Z'
    }
  ];

  // Format satoshis to display with commas
  const formatSats = (sats) => {
    return sats.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          style={tabStyle(activeTab === 'zaps')}
          onClick={() => setActiveTab('zaps')}
        >
          <Icon name="thumbs up" /> Zap Rewards
        </div>
        <div 
          style={tabStyle(activeTab === 'nwc')}
          onClick={() => setActiveTab('nwc')}
        >
          <Icon name="plug" /> Nostr Wallet Connect
        </div>
        {connected && (
          <>
            <div 
              style={tabStyle(activeTab === 'send')}
              onClick={() => setActiveTab('send')}
            >
              <Icon name="arrow up" /> Send
            </div>
            <div 
              style={tabStyle(activeTab === 'receive')}
              onClick={() => setActiveTab('receive')}
            >
              <Icon name="arrow down" /> Receive
            </div>
          </>
        )}
      </div>
      
      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div>
          <section style={sectionStyle}>
            <h3><Icon name="wallet" /> Wallet Balance</h3>
            
            {error && (
              <div style={alertStyle('error')}>
                <Icon name="warning sign" /> {error}
              </div>
            )}
            
            {success && (
              <div style={alertStyle('success')}>
                <Icon name="check circle" /> {success}
              </div>
            )}
            
            {!connected ? (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 8, 
                padding: 24,
                marginTop: 24,
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <h4>Connect Your Lightning Wallet</h4>
                <p>Connect your Nostr Wallet Connect (NWC) compatible wallet to manage your sats.</p>
                
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>NWC Connection String</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    placeholder="nostr+walletconnect://..."
                    value={connectionInput}
                    onChange={(e) => setConnectionInput(e.target.value)}
                  />
                  
                  <button 
                    style={buttonStyle}
                    onClick={handleConnect}
                    disabled={loading}
                  >
                    {loading ? <Icon name="spinner" loading /> : <Icon name="plug" />} Connect Wallet
                  </button>
                </div>
                
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: 8, 
                  padding: 16,
                  marginTop: 24,
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Icon name="info circle" style={{ marginRight: 8 }} />
                  <span>Compatible wallets include Alby, Mutiny, and other NWC-enabled Lightning wallets.</span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: 8, 
                  padding: 24,
                  marginTop: 24,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 48, fontWeight: 'bold', color: '#F59E0B', marginBottom: 8 }}>
                    {formatSats(walletData.balance)} <span style={{ fontSize: 24 }}>sats</span>
                  </div>
                  <div style={{ fontSize: 16 }}>Available Balance</div>
                  
                  {walletData.pendingPayments > 0 && (
                    <div style={{ marginTop: 12, fontSize: 14 }}>
                      + {formatSats(walletData.pendingPayments)} sats pending
                    </div>
                  )}
                  
                  <div style={{ marginTop: 16, fontSize: 14 }}>
                    <Icon name="check circle" style={{ color: '#00C853' }} /> Connected to wallet
                    <button 
                      onClick={disconnect}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#FF6464',
                        cursor: 'pointer',
                        marginLeft: 16,
                        textDecoration: 'underline',
                        fontSize: 14
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 20, 
                  marginTop: 24 
                }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 8, 
                    padding: 20,
                    flex: 1,
                    minWidth: mobile ? '100%' : '200px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <Icon name="book" style={{ fontSize: 24, color: '#F59E0B', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatSats(walletData.courseRewards)} <span style={{ fontSize: 14 }}>sats</span>
                    </div>
                    <div>Course Rewards</div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 8, 
                    padding: 20,
                    flex: 1,
                    minWidth: mobile ? '100%' : '200px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    <Icon name="thumbs up" style={{ fontSize: 24, color: '#F59E0B', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatSats(walletData.zapRewards)} <span style={{ fontSize: 14 }}>sats</span>
                    </div>
                    <div>Zap Rewards</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 16 }}>
                  <button 
                    style={{
                      ...buttonStyle,
                      background: 'transparent',
                      border: '1px solid var(--citadel-blue)'
                    }}
                    onClick={() => setActiveTab('receive')}
                  >
                    <Icon name="arrow down" /> Receive
                  </button>
                  <button 
                    style={buttonStyle}
                    onClick={() => setActiveTab('send')}
                  >
                    <Icon name="arrow up" /> Send
                  </button>
                  <button style={{
                    ...buttonStyle,
                    background: 'transparent',
                    border: '1px solid var(--citadel-blue)'
                  }}>
                    <Icon name="exchange" /> Withdraw
                  </button>
                </div>
              </>
            )}
          </section>
          
          <section style={sectionStyle}>
            <h3><Icon name="star" /> Earning Opportunities</h3>
            
            <div style={{ marginTop: 24 }}>
              <div style={transactionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Complete Bitcoin Basics Course</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Earn 10,000 sats upon completion</p>
                  </div>
                  <Link to="/courses/bitcoin-basics" style={buttonStyle}>
                    Start Course
                  </Link>
                </div>
              </div>
              
              <div style={transactionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Contribute to Community Discussions</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Earn zaps from community members</p>
                  </div>
                  <Link to="/n/family-hub" style={buttonStyle}>
                    Join Discussion
                  </Link>
                </div>
              </div>
              
              <div style={transactionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Refer a Family Member</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Earn 5,000 sats for each referral</p>
                  </div>
                  <Link to="/dashboard/add-family" style={buttonStyle}>
                    Invite Family
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <section style={sectionStyle}>
          <h3><Icon name="exchange" /> Transaction History</h3>
          
          <div style={{ marginTop: 24 }}>
            {transactions.map(tx => (
              <div key={tx.id} style={transactionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: tx.type === 'received' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 100, 100, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Icon 
                        name={tx.type === 'received' ? 'arrow down' : 'arrow up'} 
                        style={{ 
                          color: tx.type === 'received' ? '#00C853' : '#FF6464',
                          margin: 0
                        }} 
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {tx.type === 'received' ? 'Received' : 'Sent'} {formatSats(tx.amount)} sats
                      </div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>{tx.description}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14 }}>{formatDate(tx.date)}</div>
                    <Link to={`/dashboard/transaction/${tx.id}`} style={{ 
                      color: 'var(--citadel-blue)', 
                      textDecoration: 'none',
                      fontSize: 12,
                      marginTop: 4,
                      display: 'inline-block'
                    }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button style={{
              ...buttonStyle,
              background: 'transparent',
              border: '1px solid var(--citadel-blue)'
            }}>
              <Icon name="download" /> Export Transaction History
            </button>
          </div>
        </section>
      )}
      
      {/* Zaps Tab */}
      {activeTab === 'zaps' && (
        <section style={sectionStyle}>
          <h3><Icon name="thumbs up" /> Zap Rewards</h3>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 24,
            marginTop: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h4>What are Zaps?</h4>
            <p>
              Zaps are Bitcoin Lightning Network payments that can be sent to content creators and community members
              as a form of appreciation. When your posts or comments receive zaps, you earn sats directly to your wallet.
            </p>
            
            <h4 style={{ marginTop: 24 }}>Your Zap Stats</h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 20, 
              marginTop: 16 
            }}>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                borderRadius: 8, 
                padding: 16,
                flex: 1,
                minWidth: mobile ? '100%' : '150px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
                  6,000
                </div>
                <div style={{ fontSize: 14 }}>Total Sats Received</div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 8, 
                padding: 16,
                flex: 1,
                minWidth: mobile ? '100%' : '150px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  12
                </div>
                <div style={{ fontSize: 14 }}>Posts Zapped</div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 8, 
                padding: 16,
                flex: 1,
                minWidth: mobile ? '100%' : '150px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                  500
                </div>
                <div style={{ fontSize: 14 }}>Sats Sent</div>
              </div>
            </div>
            
            <h4 style={{ marginTop: 24 }}>Most Zapped Content</h4>
            <div style={{ marginTop: 16 }}>
              <div style={transactionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>How I Taught My Kids About Bitcoin</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Posted in Family Hub • 3 weeks ago</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      background: '#F59E0B', 
                      color: '#000', 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      fontSize: 12,
                      display: 'inline-block',
                      marginBottom: 8
                    }}>
                      <Icon name="bolt" /> 3,000 sats
                    </div>
                    <div>
                      <Link to="/n/family-hub/post/123" style={{ 
                        color: 'var(--citadel-blue)', 
                        textDecoration: 'none',
                        fontSize: 12
                      }}>
                        View Post
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={transactionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>My Bitcoin Inheritance Plan</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Posted in Family Hub • 1 month ago</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      background: '#F59E0B', 
                      color: '#000', 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      fontSize: 12,
                      display: 'inline-block',
                      marginBottom: 8
                    }}>
                      <Icon name="bolt" /> 2,000 sats
                    </div>
                    <div>
                      <Link to="/n/family-hub/post/456" style={{ 
                        color: 'var(--citadel-blue)', 
                        textDecoration: 'none',
                        fontSize: 12
                      }}>
                        View Post
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/n/family-hub" style={buttonStyle}>
                <Icon name="pencil" /> Create New Post
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Send Tab */}
      {activeTab === 'send' && (
        <section style={sectionStyle}>
          <h3><Icon name="arrow up" /> Send Payment</h3>
          
          {error && (
            <div style={alertStyle('error')}>
              <Icon name="warning sign" /> {error}
            </div>
          )}
          
          {success && (
            <div style={alertStyle('success')}>
              <Icon name="check circle" /> {success}
            </div>
          )}
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 24,
            marginTop: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h4>Pay Lightning Invoice</h4>
            <p>Enter a Lightning invoice to make a payment.</p>
            
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Lightning Invoice</label>
              <textarea 
                style={{
                  ...inputStyle,
                  height: 100,
                  resize: 'vertical'
                }} 
                placeholder="lnbc..."
                value={paymentInvoice}
                onChange={(e) => setPaymentInvoice(e.target.value)}
              />
              
              <button 
                style={buttonStyle}
                onClick={handlePayInvoice}
                disabled={loading || !paymentInvoice}
              >
                {loading ? <Icon name="spinner" loading /> : <Icon name="arrow up" />} Send Payment
              </button>
            </div>
            
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: 8, 
              padding: 16,
              marginTop: 24,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <Icon name="info circle" style={{ marginRight: 8 }} />
              <span>Your wallet balance: {formatSats(walletData.balance)} sats</span>
            </div>
          </div>
        </section>
      )}
      
      {/* Receive Tab */}
      {activeTab === 'receive' && (
        <section style={sectionStyle}>
          <h3><Icon name="arrow down" /> Receive Payment</h3>
          
          {error && (
            <div style={alertStyle('error')}>
              <Icon name="warning sign" /> {error}
            </div>
          )}
          
          {success && (
            <div style={alertStyle('success')}>
              <Icon name="check circle" /> {success}
            </div>
          )}
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 24,
            marginTop: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h4>Create Invoice</h4>
            <p>Generate a Lightning invoice to receive payment.</p>
            
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Amount (sats)</label>
              <input 
                type="number" 
                style={inputStyle} 
                placeholder="Amount in sats"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(parseInt(e.target.value) || 0)}
                min="1"
              />
              
              <label style={{ display: 'block', marginBottom: 8 }}>Description (optional)</label>
              <input 
                type="text" 
                style={inputStyle} 
                placeholder="What is this payment for?"
                value={invoiceDescription}
                onChange={(e) => setInvoiceDescription(e.target.value)}
              />
              
              <button 
                style={buttonStyle}
                onClick={handleCreateInvoice}
                disabled={loading || invoiceAmount <= 0}
              >
                {loading ? <Icon name="spinner" loading /> : <Icon name="bolt" />} Create Invoice
              </button>
            </div>
            
            {invoice && (
              <div style={{ marginTop: 24 }}>
                <h4>Your Invoice</h4>
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  padding: 16, 
                  borderRadius: 8,
                  overflowWrap: 'break-word',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  marginBottom: 16
                }}>
                  {invoice}
                </div>
                
                <div style={{ 
                  background: '#fff', 
                  padding: 16, 
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <QRCode 
                    value={invoice}
                    size={200}
                    level="M"
                  />
                </div>
                
                <button 
                  style={{
                    ...buttonStyle,
                    background: 'transparent',
                    border: '1px solid var(--citadel-blue)'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(invoice);
                    setSuccess('Invoice copied to clipboard!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                >
                  <Icon name="copy" /> Copy Invoice
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Nostr Wallet Connect Tab */}
      {activeTab === 'nwc' && (
        <section style={sectionStyle}>
          <NostrWalletConnect />
        </section>
      )}
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app ? app.mobile : false
});

export default connect(mapState)(LightningWallet);