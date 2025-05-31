import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCourseLessons } from '../lib/courseContent';
import { getRelays } from '../lib/nostrUtils';
import './CourseModule.css';

const CourseModule = () => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseInfo, setCourseInfo] = useState({
    title: '',
    description: '',
    image: '',
    author: ''
  });
  
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get relays from utility function
        const relays = getRelays();
        
        // Fetch course lessons
        const lessonEvents = await fetchCourseLessons(courseId, relays);
        
        if (lessonEvents.length > 0) {
          setLessons(lessonEvents);
          
          // Extract course info from the first lesson
          const firstLesson = lessonEvents[0];
          const courseTitle = firstLesson.tags.find(tag => tag[0] === 'course_title')?.[1] || courseId;
          const courseDescription = firstLesson.tags.find(tag => tag[0] === 'course_description')?.[1] || '';
          const courseImage = firstLesson.tags.find(tag => tag[0] === 'course_image')?.[1] || '';
          const courseAuthor = firstLesson.tags.find(tag => tag[0] === 'course_author')?.[1] || firstLesson.pubkey;
          
          setCourseInfo({
            title: courseTitle,
            description: courseDescription,
            image: courseImage,
            author: courseAuthor
          });
        } else {
          setError('No lessons found for this course');
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Failed to load course: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId]);
  
  if (loading) {
    return (
      <div className="course-module-container">
        <div className="module-loading">
          <div className="loading-spinner"></div>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="course-module-container">
        <div className="module-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-module-container">
      <div className="course-header">
        {courseInfo.image && (
          <div className="course-image">
            <img src={courseInfo.image} alt={courseInfo.title} />
          </div>
        )}
        
        <h1 className="course-title">{courseInfo.title}</h1>
        
        {courseInfo.description && (
          <p className="course-description">{courseInfo.description}</p>
        )}
        
        <div className="course-meta">
          <span className="course-author">
            By: {typeof courseInfo.author === 'string' && courseInfo.author.startsWith('npub') 
              ? `${courseInfo.author.slice(0, 8)}...${courseInfo.author.slice(-4)}` 
              : courseInfo.author}
          </span>
          <span className="lesson-count">{lessons.length} Lessons</span>
        </div>
        
        <div className="course-actions">
          <Link to={`/courses/${courseId}/badges`} className="course-badges-link">
            View Course Badges
          </Link>
        </div>
      </div>
      
      <div className="lessons-list">
        <div className="lessons-header">
          <h2>Course Content</h2>
          <Link to={`/courses/${courseId}/create-lesson`} className="create-lesson-button">
            Create New Lesson
          </Link>
        </div>
        
        {lessons.map((lesson, index) => {
          const lessonId = lesson.tags.find(tag => tag[0] === 'd')?.[1];
          const title = lesson.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled Lesson';
          const order = lesson.tags.find(tag => tag[0] === 'order')?.[1] || (index + 1).toString();
          
          return (
            <Link 
              key={lesson.id} 
              to={`/courses/${courseId}/lessons/${lessonId}`} 
              className="lesson-item"
            >
              <div className="lesson-number">{order}</div>
              <div className="lesson-info">
                <h3>{title}</h3>
                <div className="lesson-meta">
                  <span className="lesson-date">
                    {new Date(lesson.created_at * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CourseModule;