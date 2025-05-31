import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NostrWalletConnect from './NostrWalletConnect';
import { ProgressDashboard } from './ProgressDashboard';
import './Dashboard.css';

export default function Dashboard() {
  const [userPubkey, setUserPubkey] = useState('');
  
  useEffect(() => {
    // Get user pubkey from local storage or NIP-07 extension
    const getUserPubkey = async () => {
      if (localStorage.getItem('userPubkey')) {
        setUserPubkey(localStorage.getItem('userPubkey'));
      } else if (window.nostr) {
        try {
          const pubkey = await window.nostr.getPublicKey();
          setUserPubkey(pubkey);
          // Store for future use
          localStorage.setItem('userPubkey', pubkey);
        } catch (err) {
          console.error('Error getting pubkey from extension:', err);
        }
      }
    };
    
    getUserPubkey();
  }, []);
  
  return (
    <div className="dashboard">
      <h1>Citadel Academy Dashboard</h1>
      
      {/* Dashboard sections */}
      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>My Courses</h2>
          <p>View your enrolled courses and track your progress.</p>
          <Link to="/courses" className="dashboard-link">Browse Courses</Link>
        </section>
        
        <section className="dashboard-section">
          <h2>My Badges</h2>
          <p>View badges you've earned by completing courses.</p>
          <Link to="/my-badges" className="dashboard-link">View Badges</Link>
        </section>
      </div>
      
      {userPubkey && (
        <section className="progress-section">
          <h2>My Learning Progress</h2>
          <ProgressDashboard studentPubkey={userPubkey} />
        </section>
      )}
      
      <section className="wallet-section">
        <h2>Lightning Wallet</h2>
        <NostrWalletConnect />
      </section>
    </div>
  );
}