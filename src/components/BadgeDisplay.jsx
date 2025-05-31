import React from 'react';
import './BadgeDisplay.css';

export function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="no-badges">
        <p>No badges earned yet. Complete courses to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="badge-collection">
      {badges.map(badge => {
        const name = badge.tags.find(tag => tag[0] === 'name')?.[1] || 'Unnamed Badge';
        const description = badge.tags.find(tag => tag[0] === 'description')?.[1] || '';
        const image = badge.tags.find(tag => tag[0] === 'image')?.[1];
        const courseId = badge.tags.find(tag => tag[0] === 'course')?.[1];
        
        return (
          <div key={badge.id} className="badge-item">
            {image && (
              <div className="badge-image-container">
                <img src={image} alt={name} className="badge-image" />
              </div>
            )}
            <div className="badge-content">
              <h3 className="badge-name">{name}</h3>
              {description && <p className="badge-description">{description}</p>}
              {courseId && <span className="badge-course">Course: {courseId}</span>}
              <span className="badge-date">
                Earned: {new Date(badge.created_at * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}