import React, { useState, useEffect } from 'react';
import { Event } from 'nostr-tools';
import { StudentProgress, fetchStudentProgress, parseProgressEvent } from '../lib/progress';
import './ProgressDashboard.css';

interface ProgressDashboardProps {
  studentPubkey: string;
}

export function ProgressDashboard({ studentPubkey }: ProgressDashboardProps) {
  const [progressData, setProgressData] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch progress events for student
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const events = await fetchStudentProgress(studentPubkey);
        
        // Group events by course and get the latest for each course
        const courseMap = new Map<string, Event>();
        events.forEach(event => {
          const courseId = event.tags.find(tag => tag[0] === 'course')?.[1];
          if (!courseId) return;
          
          const existingEvent = courseMap.get(courseId);
          if (!existingEvent || existingEvent.created_at < event.created_at) {
            courseMap.set(courseId, event);
          }
        });
        
        // Parse events into progress objects
        const progress = Array.from(courseMap.values()).map(parseProgressEvent);
        setProgressData(progress);
        setError(null);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setError('Failed to load progress data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (studentPubkey) {
      fetchProgress();
    }
  }, [studentPubkey]);

  // Format time spent in hours and minutes
  const formatTimeSpent = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get course name from ID (in a real app, you would fetch this from a course catalog)
  const getCourseNameFromId = (courseId: string): string => {
    const courseNames: Record<string, string> = {
      'bitcoin-basics': 'Bitcoin Basics',
      'lightning-network': 'Lightning Network',
      'nostr-protocol': 'Nostr Protocol',
      // Add more course mappings as needed
    };
    
    return courseNames[courseId] || courseId;
  };

  if (loading) {
    return <div className="progress-loading">Loading your progress...</div>;
  }

  return (
    <div className="progress-dashboard">
      <h2>Your Learning Progress</h2>
      
      {error && <div className="progress-error">{error}</div>}
      
      {progressData.length === 0 ? (
        <div className="no-progress">
          <p>No course progress found. Start learning to track your progress!</p>
        </div>
      ) : (
        progressData.map(course => (
          <div key={course.courseId} className="course-progress">
            <h3>{getCourseNameFromId(course.courseId)}</h3>
            
            <div className="progress-details">
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${course.progressPercentage}%` }}
                  />
                </div>
                <p className="progress-percentage">{course.progressPercentage}% Complete</p>
              </div>
              
              <div className="progress-stats">
                <p>Current Lesson: {course.currentLesson}</p>
                <p>Time Spent: {formatTimeSpent(course.timeSpent)}</p>
                <p>Last Accessed: {course.lastAccessed.toLocaleDateString()}</p>
                <p>Completed Lessons: {course.completedLessons.length}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}