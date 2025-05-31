import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBadgeDefinitions } from '../lib/badges';
import { BadgeDisplay } from './BadgeDisplay';
import './BadgeGallery.css';

const BadgeGallery = () => {
  const { courseId } = useParams();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issuerPubkey, setIssuerPubkey] = useState('');
  
  useEffect(() => {
    // Get the academy pubkey from environment variables
    const academyPubkey = import.meta.env.VITE_CITADEL_PUBKEY || '';
    setIssuerPubkey(academyPubkey);
    
    loadBadges(academyPubkey);
  }, [courseId]);
  
  const loadBadges = async (pubkey) => {
    if (!pubkey) {
      setLoading(false);
      setError('No issuer public key provided');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const badgeDefinitions = await fetchBadgeDefinitions(pubkey);
      
      // Filter badges by courseId if provided
      const filteredBadges = courseId 
        ? badgeDefinitions.filter(badge => {
            const badgeCourseId = badge.tags.find(tag => tag[0] === 'course')?.[1];
            return badgeCourseId === courseId;
          })
        : badgeDefinitions;
      
      setBadges(filteredBadges);
    } catch (err) {
      console.error('Error loading badges:', err);
      setError('Failed to load badges: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="badge-gallery-container">
      <div className="gallery-header">
        <h1>{courseId ? 'Course Badges' : 'All Badges'}</h1>
        
        <div className="gallery-actions">
          <Link to={courseId ? `/courses/${courseId}/award-badge` : '/award-badge'} className="action-button award">
            Award Badge
          </Link>
          <Link to={courseId ? `/courses/${courseId}/create-badge` : '/create-badge'} className="action-button create">
            Create Badge
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="gallery-loading">
          <div className="loading-spinner"></div>
          <p>Loading badges...</p>
        </div>
      ) : error ? (
        <div className="gallery-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <BadgeDisplay badges={badges} />
          
          {badges.length === 0 && (
            <div className="no-badges-message">
              <p>No badges found for this {courseId ? 'course' : 'academy'}.</p>
              <Link to={courseId ? `/courses/${courseId}/create-badge` : '/create-badge'} className="create-badge-link">
                Create your first badge
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BadgeGallery;