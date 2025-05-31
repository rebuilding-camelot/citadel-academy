import React from 'react';
import ReactMarkdown from 'react-markdown';
import './LessonViewer.css';

export function LessonViewer({ lessonEvent }) {
  if (!lessonEvent) {
    return <div className="lesson-viewer-loading">Loading lesson...</div>;
  }

  const title = lessonEvent.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled Lesson';
  const courseId = lessonEvent.tags.find(tag => tag[0] === 'course')?.[1] || 'Unknown Course';
  const order = lessonEvent.tags.find(tag => tag[0] === 'order')?.[1] || '0';
  const tags = lessonEvent.tags.filter(tag => tag[0] === 't').map(tag => tag[1]);

  return (
    <div className="lesson-viewer">
      <div className="lesson-header">
        <span className="lesson-number">Lesson {order}</span>
        <h1 className="lesson-title">{title}</h1>
        {tags.length > 0 && (
          <div className="lesson-tags">
            {tags.map(tag => (
              <span key={tag} className="lesson-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="lesson-content">
        <ReactMarkdown>{lessonEvent.content}</ReactMarkdown>
      </div>
      
      <div className="lesson-meta">
        <div>Course: {courseId}</div>
        <div>Created: {new Date(lessonEvent.created_at * 1000).toLocaleDateString()}</div>
        <div className="lesson-pubkey">
          Author: {lessonEvent.pubkey.slice(0, 8)}...{lessonEvent.pubkey.slice(-8)}
        </div>
      </div>
    </div>
  );
}