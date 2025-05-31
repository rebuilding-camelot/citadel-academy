import React, { useState } from 'react';
import { publishLesson } from '../lib/courseContent';
import { normalizePrivateKey, getRelays } from '../lib/nostrUtils';
import './LessonEditor.css';

export function LessonEditor({ courseId, initialLesson, onSave, privateKey }) {
  const [lesson, setLesson] = useState(initialLesson || {
    id: `lesson-${Date.now()}`,
    title: '',
    content: '',
    courseId: courseId || '',
    order: 1,
    tags: []
  });
  
  const [tag, setTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLesson(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = () => {
    if (tag && !lesson.tags.includes(tag)) {
      setLesson(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setLesson(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };
  
  const handleSave = async () => {
    if (!lesson.title || !lesson.content || !lesson.courseId) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // If privateKey is provided, publish to relays
      if (privateKey) {
        const normalizedKey = normalizePrivateKey(privateKey);
        if (!normalizedKey) {
          throw new Error('Invalid private key format');
        }
        
        const relays = getRelays();
        await publishLesson(lesson, normalizedKey, relays);
      }
      
      // Call the onSave callback with the lesson data
      if (onSave) {
        onSave(lesson);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="lesson-editor">
      <div className="editor-header">
        <h2>{initialLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
        <div className="editor-tabs">
          <button 
            className={`editor-tab ${!previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(false)}
          >
            Edit
          </button>
          <button 
            className={`editor-tab ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(true)}
          >
            Preview
          </button>
        </div>
      </div>
      
      {!previewMode ? (
        <div className="editor-form">
          <div className="form-group">
            <label htmlFor="title">Lesson Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={lesson.title}
              onChange={handleChange}
              placeholder="Enter lesson title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="courseId">Course ID *</label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={lesson.courseId}
              onChange={handleChange}
              placeholder="Enter course ID"
              required
              disabled={!!courseId}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="order">Lesson Order *</label>
            <input
              type="number"
              id="order"
              name="order"
              value={lesson.order}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tag-input">
              <input
                type="text"
                id="tags"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Add a tag"
              />
              <button type="button" onClick={handleAddTag}>Add</button>
            </div>
            
            {lesson.tags.length > 0 && (
              <div className="tags-list">
                {lesson.tags.map(t => (
                  <span key={t} className="tag">
                    {t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Lesson Content (Markdown) *</label>
            <textarea
              id="content"
              name="content"
              value={lesson.content}
              onChange={handleChange}
              placeholder="Write your lesson content in Markdown format"
              rows="15"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="save-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className="preview-header">
            <span className="preview-label">PREVIEW MODE</span>
          </div>
          
          <div className="lesson-preview">
            <h1>{lesson.title || 'Untitled Lesson'}</h1>
            
            {lesson.tags.length > 0 && (
              <div className="preview-tags">
                {lesson.tags.map(t => (
                  <span key={t} className="preview-tag">#{t}</span>
                ))}
              </div>
            )}
            
            <div className="preview-content">
              {/* In a real app, you would use a Markdown renderer here */}
              <pre>{lesson.content}</pre>
            </div>
            
            <div className="preview-meta">
              Course: {lesson.courseId || 'Unknown'} | Order: {lesson.order}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}