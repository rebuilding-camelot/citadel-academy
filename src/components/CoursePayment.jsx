import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNostrWalletConnect } from '../hooks/useNostrWalletConnect';
import { createCourseInvoice, listenForZapReceipt } from '../lib/lightning';
import { normalizePrivateKey } from '../lib/nostrUtils';
import { QRCodeSVG } from 'qrcode.react';
import './CoursePayment.css';

const CoursePayment = ({ courseId = '', coursePrice, courseName, onPaymentSuccess }) => {
  const user = useSelector(state => state.nostr ? state.nostr.user : {});
  const { connected, payInvoice } = useNostrWalletConnect();
  const [paymentMethod, setPaymentMethod] = useState('nwc'); // 'nwc' or 'manual'
  const [invoice, setInvoice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('initial'); // initial, loading, invoice, paid, error
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [privateKey, setPrivateKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  
  useEffect(() => {
    let timer;
    if (paymentStatus === 'invoice' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, paymentStatus]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSubmitKey = () => {
    if (!privateKey.trim()) {
      setError('Please enter your private key');
      return;
    }
    
    const normalizedKey = normalizePrivateKey(privateKey);
    if (!normalizedKey) {
      setError('Invalid private key format. Please enter a valid nsec or hex key.');
      return;
    }
    
    setPrivateKey(normalizedKey);
    setShowKeyInput(false);
    setError('');
    generateManualInvoice(normalizedKey);
  };
  
  const generateManualInvoice = async (key) => {
    setPaymentStatus('loading');
    setError('');
    
    try {
      // Create payment object
      const payment = {
        courseId: courseId || 'general-course',
        amount: coursePrice,
        description: `Purchase of ${courseName}`,
        studentPubkey: user.pubkey || ''
      };
      
      // Generate invoice
      const invoiceStr = await createCourseInvoice(payment, key);
      setInvoice(invoiceStr);
      setPaymentStatus('invoice');
      
      // Start listening for payment
      listenForPayment(payment.studentPubkey);
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(`Failed to generate invoice: ${err.message}`);
      setPaymentStatus('error');
    }
  };
  
  const handleNWCPurchase = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setPaymentStatus('loading');
    setError('');
    
    try {
      // In a real app, you'd get this invoice from your backend
      const invoiceResponse = await fetch('/api/create-course-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: coursePrice, 
          description: `Purchase: ${courseName}`,
          courseId: courseId || 'general-course'
        })
      });
      
      if (!invoiceResponse.ok) {
        const errorData = await invoiceResponse.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }
      
      const { payment_request } = await invoiceResponse.json();
      const result = await payInvoice(payment_request);
      
      setPaymentStatus('paid');
      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setError(`Payment failed: ${error.message}`);
      setPaymentStatus('error');
    }
  };
  
  const listenForPayment = async (pubkey) => {
    try {
      const receipt = await listenForZapReceipt(courseId, pubkey);
      
      if (receipt) {
        setPaymentStatus('paid');
        if (onPaymentSuccess) {
          onPaymentSuccess(receipt);
        }
      } else {
        // Timeout occurred
        setError('Payment verification timed out. If you paid, please contact support.');
        setPaymentStatus('error');
      }
    } catch (err) {
      console.error('Error listening for payment:', err);
      setError(`Payment verification error: ${err.message}`);
      setPaymentStatus('error');
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(invoice);
  };
  
  const switchToManualPayment = () => {
    setPaymentMethod('manual');
    setShowKeyInput(true);
    setPaymentStatus('initial');
  };
  
  return (
    <div className="course-payment">
      <div className="price-display">
        <span className="price">{coursePrice.toLocaleString()} sats</span>
        <span className="course-name">{courseName}</span>
      </div>
      
      {paymentMethod === 'nwc' ? (
        <>
          {paymentStatus === 'initial' && (
            <div className="payment-options">
              <button 
                onClick={handleNWCPurchase}
                disabled={!connected || paymentStatus === 'loading'}
                className="purchase-button"
              >
                {paymentStatus === 'loading' ? 'Processing...' : connected ? '⚡ Purchase with NWC' : 'Connect Wallet First'}
              </button>
              
              <div className="payment-divider">
                <span>OR</span>
              </div>
              
              <button 
                onClick={switchToManualPayment}
                className="manual-payment-button"
              >
                Pay with Lightning Invoice
              </button>
            </div>
          )}
          
          {paymentStatus === 'loading' && (
            <div className="loading-payment">
              <div className="loading-spinner"></div>
              <p>Processing payment...</p>
            </div>
          )}
          
          {paymentStatus === 'paid' && (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h3>Payment Successful!</h3>
              <p>Thank you for your purchase. You now have access to this course.</p>
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="payment-error">
              <h3>Payment Error</h3>
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => setPaymentStatus('initial')}
              >
                Try Again
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {showKeyInput ? (
            <div className="key-input-section">
              <h3>Connect with your Nostr key</h3>
              <p>
                To purchase this course, you need to provide your Nostr private key.
                This key will be used to sign the zap request.
              </p>
              
              <div className="key-warning">
                <strong>Warning:</strong> Your private key is sensitive information.
                This app does not store your key, but you should be careful about where you enter it.
                For maximum security, use a dedicated device or consider using a signing extension.
              </div>
              
              <div className="form-group">
                <label htmlFor="privateKey">Private Key (nsec or hex)</label>
                <input
                  type="password"
                  id="privateKey"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="key-input-actions">
                <button 
                  className="submit-key-button"
                  onClick={handleSubmitKey}
                >
                  Continue to Payment
                </button>
                
                <button 
                  className="back-button"
                  onClick={() => {
                    setPaymentMethod('nwc');
                    setShowKeyInput(false);
                    setPaymentStatus('initial');
                  }}
                >
                  Back to Payment Options
                </button>
              </div>
            </div>
          ) : (
            <>
              {paymentStatus === 'loading' && (
                <div className="loading-payment">
                  <div className="loading-spinner"></div>
                  <p>Generating invoice...</p>
                </div>
              )}
              
              {paymentStatus === 'invoice' && (
                <div className="invoice-container">
                  <div className="qr-container">
                    <QRCodeSVG value={invoice} size={200} level="M" />
                  </div>
                  
                  <div className="invoice-details">
                    <p className="invoice-instruction">
                      Scan this QR code with your Lightning wallet or copy the invoice below
                    </p>
                    
                    <div className="invoice-text">
                      <textarea readOnly value={invoice} />
                      <button className="copy-button" onClick={copyToClipboard}>
                        Copy
                      </button>
                    </div>
                    
                    <div className="invoice-expiry">
                      <p>Invoice expires in: {formatTime(countdown)}</p>
                    </div>
                    
                    <button 
                      className="back-button"
                      onClick={() => {
                        setPaymentMethod('nwc');
                        setShowKeyInput(false);
                        setPaymentStatus('initial');
                      }}
                    >
                      Cancel and Go Back
                    </button>
                  </div>
                </div>
              )}
              
              {paymentStatus === 'paid' && (
                <div className="payment-success">
                  <div className="success-icon">✓</div>
                  <h3>Payment Successful!</h3>
                  <p>Thank you for your purchase. You now have access to this course.</p>
                </div>
              )}
              
              {paymentStatus === 'error' && (
                <div className="payment-error">
                  <h3>Payment Error</h3>
                  <p>{error}</p>
                  <div className="error-actions">
                    <button 
                      className="retry-button"
                      onClick={() => {
                        setPaymentStatus('initial');
                        generateManualInvoice(privateKey);
                      }}
                    >
                      Try Again
                    </button>
                    
                    <button 
                      className="back-button"
                      onClick={() => {
                        setPaymentMethod('nwc');
                        setShowKeyInput(false);
                        setPaymentStatus('initial');
                      }}
                    >
                      Back to Payment Options
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CoursePayment;