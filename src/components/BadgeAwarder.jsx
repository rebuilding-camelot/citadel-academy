import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchBadgeDefinitions, publishBadgeAward } from '../lib/badges';
import { normalizePrivateKey, normalizePublicKey } from '../lib/nostrUtils';
import './BadgeAwarder.css';

const BadgeAwarder = () => {
  const { courseId } = useParams();
  const history = useHistory();
  const [privateKey, setPrivateKey] = useState('');
  const [recipientKey, setRecipientKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [badges, setBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [loading, setLoading] = useState(false);
  const [awarding, setAwarding] = useState(false);
  
  useEffect(() => {
    if (!showKeyInput && privateKey) {
      loadBadges();
    }
  }, [showKeyInput, privateKey]);
  
  const loadBadges = async () => {
    setLoading(true);
    try {
      const pubkey = normalizePrivateKey(privateKey);
      if (!pubkey) {
        throw new Error('Invalid private key');
      }
      
      const badgeDefinitions = await fetchBadgeDefinitions(pubkey);
      
      // Filter badges by courseId if provided
      const filteredBadges = courseId 
        ? badgeDefinitions.filter(badge => {
            const badgeCourseId = badge.tags.find(tag => tag[0] === 'course')?.[1];
            return badgeCourseId === courseId;
          })
        : badgeDefinitions;
      
      setBadges(filteredBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
      alert('Failed to load badges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitKey = () => {
    if (!privateKey.trim()) {
      alert('Please enter your private key');
      return;
    }
    
    const normalizedKey = normalizePrivateKey(privateKey);
    if (!normalizedKey) {
      alert('Invalid private key format. Please enter a valid nsec or hex key.');
      return;
    }
    
    setPrivateKey(normalizedKey);
    setShowKeyInput(false);
  };
  
  const handleAwardBadge = async () => {
    if (!selectedBadge) {
      alert('Please select a badge to award');
      return;
    }
    
    if (!recipientKey.trim()) {
      alert('Please enter recipient public key');
      return;
    }
    
    const normalizedRecipientKey = normalizePublicKey(recipientKey);
    if (!normalizedRecipientKey) {
      alert('Invalid recipient key format. Please enter a valid npub or hex key.');
      return;
    }
    
    setAwarding(true);
    
    try {
      // Get the badge ID from the selected badge
      const selectedBadgeEvent = badges.find(badge => badge.id === selectedBadge);
      if (!selectedBadgeEvent) {
        throw new Error('Selected badge not found');
      }
      
      const badgeId = selectedBadgeEvent.tags.find(tag => tag[0] === 'd')?.[1];
      if (!badgeId) {
        throw new Error('Badge ID not found in badge definition');
      }
      
      await publishBadgeAward(badgeId, normalizedRecipientKey, privateKey);
      alert('Badge awarded successfully!');
      
      // Redirect back to course page or badges list
      if (courseId) {
        history.push(`/courses/${courseId}/badges`);
      } else {
        history.push('/badges');
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
      alert('Failed to award badge: ' + error.message);
    } finally {
      setAwarding(false);
    }
  };
  
  return (
    <div className="badge-awarder-container">
      <h1>Award Badge to Student</h1>
      
      {showKeyInput ? (
        <div className="private-key-form">
          <p>
            To award a badge, you need to provide your Nostr private key. 
            This key will be used to sign the badge award.
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
          
          <button 
            className="submit-key-button"
            onClick={handleSubmitKey}
          >
            Continue to Badge Awarder
          </button>
        </div>
      ) : (
        <div className="award-form">
          {loading ? (
            <div className="loading-badges">
              <div className="loading-spinner"></div>
              <p>Loading your badges...</p>
            </div>
          ) : badges.length === 0 ? (
            <div className="no-badges-message">
              <p>You don't have any badges to award. Create badges first.</p>
              <button 
                onClick={() => history.push(courseId ? `/courses/${courseId}/create-badge` : '/create-badge')}
                className="create-badge-button"
              >
                Create a Badge
              </button>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="selectedBadge">Select Badge to Award *</label>
                <select
                  id="selectedBadge"
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  required
                >
                  <option value="">-- Select a Badge --</option>
                  {badges.map(badge => {
                    const name = badge.tags.find(tag => tag[0] === 'name')?.[1] || 'Unnamed Badge';
                    const badgeId = badge.tags.find(tag => tag[0] === 'd')?.[1] || badge.id;
                    return (
                      <option key={badge.id} value={badge.id}>
                        {name} ({badgeId})
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {selectedBadge && (
                <div className="selected-badge-preview">
                  {(() => {
                    const badge = badges.find(b => b.id === selectedBadge);
                    if (!badge) return null;
                    
                    const name = badge.tags.find(tag => tag[0] === 'name')?.[1] || 'Unnamed Badge';
                    const description = badge.tags.find(tag => tag[0] === 'description')?.[1] || '';
                    const image = badge.tags.find(tag => tag[0] === 'image')?.[1];
                    
                    return (
                      <>
                        {image && (
                          <div className="badge-image-container">
                            <img src={image} alt={name} />
                          </div>
                        )}
                        <div className="badge-info">
                          <h3>{name}</h3>
                          <p>{description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="recipientKey">Recipient Public Key (npub or hex) *</label>
                <input
                  type="text"
                  id="recipientKey"
                  value={recipientKey}
                  onChange={(e) => setRecipientKey(e.target.value)}
                  placeholder="Enter recipient's public key"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="award-button"
                  onClick={handleAwardBadge}
                  disabled={awarding || !selectedBadge || !recipientKey}
                >
                  {awarding ? 'Awarding...' : 'Award Badge'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeAwarder;