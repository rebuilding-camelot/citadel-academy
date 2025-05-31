import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { verifyNip05Identifier } from '../../actions/Nostr';

const MembersOnlyPage = ({ 
  mobile, 
  pubkey, 
  nip05Verification, 
  verifyNip05Identifier 
}) => {
  const [nip05Identifier, setNip05Identifier] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Define styles using CSS variables from citadel-theme.css
  const sectionStyle = {
    flex: 1, 
    background: 'rgba(42, 0, 102, 0.3)', 
    padding: 24, 
    borderRadius: 8,
    marginBottom: mobile ? 20 : 0
  };

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 8,
    cursor: 'pointer',
    border: 'none'
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: 300,
    marginRight: 10
  };

  const handleVerify = async () => {
    if (!nip05Identifier) return;
    
    setIsVerifying(true);
    await verifyNip05Identifier(nip05Identifier);
    setIsVerifying(false);
  };

  return (
    <div style={{
      padding: mobile ? '20px 16px' : '40px 60px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#F59E0B', marginBottom: 30 }}>Members' Only Area</h1>
      
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '30px' }}>
        {nip05Verification.verified ? (
          <section style={sectionStyle}>
            <h2><Icon name="check circle" color="green" /> Welcome, Verified Member!</h2>
            <p>You have been verified as a member with the following details:</p>
            <ul>
              <li><strong>Username:</strong> {nip05Verification.user.username}</li>
              <li><strong>Public Key:</strong> {nip05Verification.user.pubkey.substring(0, 8)}...{nip05Verification.user.pubkey.substring(nip05Verification.user.pubkey.length - 8)}</li>
            </ul>
            <p>You now have access to exclusive member content and features.</p>
            
            <div style={{ marginTop: 20 }}>
              <h3>Member Resources</h3>
              <ul>
                <li>Advanced Bitcoin Tutorials</li>
                <li>Private Community Forums</li>
                <li>Exclusive Webinars</li>
                <li>Early Access to New Courses</li>
              </ul>
            </div>
          </section>
        ) : (
          <section style={sectionStyle}>
            <h2><Icon name="lock" /> Members' Only Verification</h2>
            <p>Please verify your membership using your NIP-05 identifier from satnam.pub:</p>
            
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <input 
                type="text" 
                placeholder="username@satnam.pub" 
                value={nip05Identifier}
                onChange={(e) => setNip05Identifier(e.target.value)}
                style={inputStyle}
              />
              <button 
                onClick={handleVerify} 
                style={buttonStyle}
                disabled={isVerifying || !nip05Identifier}
              >
                {isVerifying ? 'Verifying...' : 'Verify Membership'}
              </button>
            </div>
            
            {nip05Verification.error && (
              <div style={{ color: 'red', marginTop: 10 }}>
                <Icon name="warning sign" /> {nip05Verification.error}
              </div>
            )}
            
            <div style={{ marginTop: 20 }}>
              <h3>Don't have a satnam.pub identifier?</h3>
              <p>Currently, we only support NIP-05 verification with satnam.pub identifiers.</p>
              <p>If you're a member but don't have a satnam.pub identifier, please contact support.</p>
            </div>
          </section>
        )}
        
        <section style={{...sectionStyle, marginBottom: 0}}>
          <h2><Icon name="info circle" /> About Membership</h2>
          <p>The Citadel Academy membership provides exclusive access to premium educational content and community features.</p>
          
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18 }}>Membership Benefits</h3>
            <ul>
              <li>Access to all premium courses</li>
              <li>Private community channels</li>
              <li>Direct support from instructors</li>
              <li>Early access to new content</li>
              <li>Exclusive webinars and events</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: 18 }}>How Verification Works</h3>
            <p>We use NIP-05 verification to authenticate members. This is a secure, decentralized way to verify your identity using the Nostr protocol.</p>
            <p>Your NIP-05 identifier (username@satnam.pub) is checked against our membership whitelist to grant you access.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const mapState = ({ app, nostr }) => ({
  mobile: app.mobile,
  pubkey: nostr.pubkey,
  nip05Verification: nostr.nip05Verification
});

const mapDispatch = {
  verifyNip05Identifier
};

export default connect(mapState, mapDispatch)(MembersOnlyPage);