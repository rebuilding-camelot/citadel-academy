import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserBadges } from '../lib/badges';
import { normalizePublicKey } from '../lib/nostrUtils';
import { BadgeDisplay } from './BadgeDisplay';
import './UserBadges.css';

const UserBadges = ({ userPubkey }) => {
  const { pubkey: urlPubkey } = useParams();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use either the prop or URL parameter
  const targetPubkey = userPubkey || urlPubkey;
  
  useEffect(() => {
    if (targetPubkey) {
      loadUserBadges(targetPubkey);
    } else {
      setLoading(false);
      setError('No user public key provided');
    }
  }, [targetPubkey]);
  
  const loadUserBadges = async (pubkey) => {
    setLoading(true);
    setError(null);
    
    try {
      const normalizedPubkey = normalizePublicKey(pubkey);
      if (!normalizedPubkey) {
        throw new Error('Invalid public key format');
      }
      
      const badgeEvents = await fetchUserBadges(normalizedPubkey);
      setBadges(badgeEvents);
    } catch (err) {
      console.error('Error loading user badges:', err);
      setError('Failed to load badges: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-badges-container">
      <h1>My Badges</h1>
      
      {loading ? (
        <div className="badges-loading">
          <div className="loading-spinner"></div>
          <p>Loading badges...</p>
        </div>
      ) : error ? (
        <div className="badges-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <BadgeDisplay badges={badges} />
          
          {badges.length === 0 && (
            <div className="no-badges-message">
              <p>You haven't earned any badges yet.</p>
              <p>Complete courses to earn badges!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserBadges;