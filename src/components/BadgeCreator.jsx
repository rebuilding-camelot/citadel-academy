import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { publishBadgeDefinition } from '../lib/badges';
import { normalizePrivateKey } from '../lib/nostrUtils';
import './BadgeCreator.css';

const BadgeCreator = () => {
  const { courseId } = useParams();
  const history = useHistory();
  const [privateKey, setPrivateKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [badge, setBadge] = useState({
    badgeId: `badge-${Date.now()}`,
    name: '',
    description: '',
    image: '',
    courseId: courseId || '',
    requirements: []
  });
  const [requirement, setRequirement] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBadge(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddRequirement = () => {
    if (requirement && !badge.requirements.includes(requirement)) {
      setBadge(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirement]
      }));
      setRequirement('');
    }
  };
  
  const handleRemoveRequirement = (reqToRemove) => {
    setBadge(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
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
  
  const handleCreateBadge = async () => {
    if (!badge.name || !badge.description || !badge.image || !badge.courseId) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (badge.requirements.length === 0) {
      alert('Please add at least one requirement');
      return;
    }
    
    setIsCreating(true);
    
    try {
      await publishBadgeDefinition(badge, privateKey);
      alert('Badge created successfully!');
      history.push(`/courses/${courseId}/badges`);
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Failed to create badge: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="badge-creator-container">
      <h1>Create Course Badge</h1>
      
      {showKeyInput ? (
        <div className="private-key-form">
          <p>
            To create a badge, you need to provide your Nostr private key. 
            This key will be used to sign the badge definition.
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
            Continue to Badge Creator
          </button>
        </div>
      ) : (
        <div className="badge-form">
          <div className="form-group">
            <label htmlFor="name">Badge Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={badge.name}
              onChange={handleChange}
              placeholder="Enter badge name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Badge Description *</label>
            <textarea
              id="description"
              name="description"
              value={badge.description}
              onChange={handleChange}
              placeholder="Enter badge description"
              rows="3"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Badge Image URL *</label>
            <input
              type="url"
              id="image"
              name="image"
              value={badge.image}
              onChange={handleChange}
              placeholder="Enter badge image URL"
              required
            />
            {badge.image && (
              <div className="image-preview">
                <img src={badge.image} alt="Badge Preview" />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="courseId">Course ID *</label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={badge.courseId}
              onChange={handleChange}
              placeholder="Enter course ID"
              required
              disabled={!!courseId}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="requirements">Requirements *</label>
            <div className="requirement-input">
              <input
                type="text"
                id="requirements"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Add a requirement"
              />
              <button type="button" onClick={handleAddRequirement}>Add</button>
            </div>
            
            {badge.requirements.length > 0 && (
              <div className="requirements-list">
                {badge.requirements.map(req => (
                  <div key={req} className="requirement-item">
                    <span>{req}</span>
                    <button type="button" onClick={() => handleRemoveRequirement(req)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="create-button"
              onClick={handleCreateBadge}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Badge'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCreator;