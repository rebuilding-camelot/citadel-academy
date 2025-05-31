import React, { useState, useEffect } from 'react';
import { CohortManager } from './CohortManager';
import { normalizePrivateKey } from '../lib/nostrUtils';

function CohortPage() {
  const [courseId, setCourseId] = useState('bitcoin-basics-101');
  const [instructorPubkey, setInstructorPubkey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [hasNip07, setHasNip07] = useState(false);
  
  // Check for NIP-07 extension on component mount
  useEffect(() => {
    setHasNip07(!!window.nostr);
    
    // Try to get instructor pubkey from environment variable
    const envPubkey = import.meta.env.VITE_CITADEL_PUBKEY;
    if (envPubkey) {
      setInstructorPubkey(envPubkey);
    }
    
    // If NIP-07 is available, get the public key
    if (window.nostr) {
      window.nostr.getPublicKey().then(pubkey => {
        setInstructorPubkey(pubkey);
      }).catch(error => {
        console.error('Error getting public key from extension:', error);
      });
    }
  }, []);
  
  // Handle private key input
  const handlePrivateKeyChange = (e) => {
    const key = e.target.value;
    setPrivateKey(key);
    
    // If a valid private key is entered, derive the public key
    if (key) {
      try {
        const normalizedKey = normalizePrivateKey(key);
        if (normalizedKey) {
          const pubkey = window.client.getPublicKey(normalizedKey);
          setInstructorPubkey(pubkey);
        }
      } catch (error) {
        console.error('Error deriving public key:', error);
      }
    }
  };
  
  return (
    <div className="cohort-page">
      <h1>Course Cohorts</h1>
      
      {!instructorPubkey && !hasNip07 && (
        <div className="setup-section">
          <h2>Setup</h2>
          <p>
            To manage course cohorts, you need to provide your Nostr private key or use a NIP-07 compatible extension.
          </p>
          
          <div className="private-key-input">
            <label htmlFor="privateKey">Private Key (nsec or hex):</label>
            <input
              type="password"
              id="privateKey"
              value={privateKey}
              onChange={handlePrivateKeyChange}
              placeholder="Your private key (will not be stored)"
            />
            <p className="help-text">
              Your private key is only used locally to sign events and is never sent to any server.
            </p>
          </div>
        </div>
      )}
      
      {instructorPubkey && (
        <CohortManager
          courseId={courseId}
          instructorPubkey={instructorPubkey}
          instructorPrivateKey={normalizePrivateKey(privateKey)}
        />
      )}
    </div>
  );
}

export default CohortPage;