import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { LessonEditor } from './LessonEditor';
import { normalizePrivateKey } from '../lib/nostrUtils';
import './LessonCreator.css';

const LessonCreator = () => {
  const { courseId } = useParams();
  const history = useHistory();
  const [privateKey, setPrivateKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  
  const handleSave = (lesson) => {
    // In a real app, you might want to redirect to the lesson view
    alert('Lesson saved successfully!');
    history.push(`/courses/${courseId}/module`);
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
  
  return (
    <div className="lesson-creator-container">
      <h1>Create New Lesson</h1>
      
      {showKeyInput ? (
        <div className="private-key-form">
          <p>
            To create a lesson, you need to provide your Nostr private key. 
            This key will be used to sign the lesson content.
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
            Continue to Lesson Editor
          </button>
        </div>
      ) : (
        <LessonEditor
          courseId={courseId}
          onSave={handleSave}
          privateKey={privateKey}
        />
      )}
    </div>
  );
};

export default LessonCreator;