import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LessonViewer } from './LessonViewer';
import { fetchLesson } from '../lib/courseContent';
import { getRelays, normalizePrivateKey } from '../lib/nostrUtils';
import { updateStudentProgress, publishProgressEvent } from '../lib/progress';
import './CourseLesson.css';

const CourseLesson = () => {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [progressUpdated, setProgressUpdated] = useState(false);
  
  // Get user pubkey from local storage or NIP-07 extension
  const getUserPubkey = async () => {
    if (localStorage.getItem('userPubkey')) {
      return localStorage.getItem('userPubkey');
    } else if (window.nostr) {
      try {
        return await window.nostr.getPublicKey();
      } catch (err) {
        console.error('Error getting pubkey from extension:', err);
        return null;
      }
    }
    return null;
  };
  
  // Track time spent on lesson
  useEffect(() => {
    setStartTime(Date.now());
    
    const interval = setInterval(() => {
      const currentTimeSpent = Math.floor((Date.now() - startTime) / 60000); // Convert to minutes
      setTimeSpent(currentTimeSpent);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lessonId]);
  
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get relays from utility function
        const relays = getRelays();
        
        const lessonEvent = await fetchLesson(lessonId, relays);
        
        if (lessonEvent) {
          setLesson(lessonEvent);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError('Failed to load lesson: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadLesson();
  }, [lessonId]);
  
  // Update progress when user completes the lesson
  const markLessonComplete = async () => {
    try {
      const userPubkey = await getUserPubkey();
      
      if (!userPubkey) {
        setError('User not authenticated. Please sign in to track progress.');
        return;
      }
      
      // Get course metadata from lesson or params
      const course = courseId || lesson.tags.find(tag => tag[0] === 'course')?.[1];
      
      if (!course) {
        console.error('Course ID not found');
        return;
      }
      
      // Create progress object
      const progress = {
        studentPubkey: userPubkey,
        courseId: course,
        completedLessons: [lessonId],
        currentLesson: lessonId,
        progressPercentage: 10, // This would be calculated based on course structure
        timeSpent: timeSpent || 1, // Minimum 1 minute
        lastAccessed: new Date()
      };
      
      let progressEvent;
      
      // Use private key from local storage or NIP-07 extension
      const privateKey = localStorage.getItem('userPrivateKey');
      
      if (privateKey) {
        // Use stored private key
        const normalizedKey = normalizePrivateKey(privateKey);
        progressEvent = updateStudentProgress(progress, normalizedKey);
      } else if (window.nostr) {
        // Use NIP-07 extension
        const unsignedEvent = updateStudentProgress(progress, '');
        progressEvent = await window.nostr.signEvent(unsignedEvent);
      } else {
        throw new Error('No signing method available');
      }
      
      // Publish to relays
      await publishProgressEvent(progressEvent);
      
      setProgressUpdated(true);
      
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress: ' + err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="course-lesson-container">
        <div className="lesson-loading">
          <div className="loading-spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="course-lesson-container">
        <div className="lesson-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-lesson-container">
      <LessonViewer lessonEvent={lesson} />
      
      <div className="lesson-completion">
        {progressUpdated ? (
          <div className="progress-updated">
            <p>✅ Progress updated successfully!</p>
          </div>
        ) : (
          <button 
            className="complete-button"
            onClick={markLessonComplete}
          >
            Mark as Complete
          </button>
        )}
      </div>
      
      <div className="lesson-navigation">
        <button className="nav-button prev">
          Previous Lesson
        </button>
        <button className="nav-button next">
          Next Lesson
        </button>
      </div>
    </div>
  );
};

export default CourseLesson;