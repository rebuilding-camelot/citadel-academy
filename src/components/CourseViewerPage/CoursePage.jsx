import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import CoursePayment from '../CoursePayment';
import CourseAccess from '../CourseAccess';
import './CourseDetails.css';

const CoursePage = () => {
  const mobile = useSelector(state => state.app.mobile);
  const user = useSelector(state => state.user);
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch the course data from an API
    // For now, we'll use sample data
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Sample course data
      const courseData = {
        id: courseId || 'bitcoin-basics',
        title: 'Bitcoin Basics',
        description: 'Learn the fundamentals of Bitcoin and how it works. This comprehensive course covers everything from the basics of blockchain technology to setting up your first wallet and making transactions.',
        price: 10000, // 10,000 sats
        lessons: [
          { id: 'lesson-1', title: 'What is Bitcoin?', duration: '15 min' },
          { id: 'lesson-2', title: 'How Bitcoin Works', duration: '20 min' },
          { id: 'lesson-3', title: 'Setting Up a Wallet', duration: '25 min' },
          { id: 'lesson-4', title: 'Making Your First Transaction', duration: '15 min' },
        ]
      };
      
      setCourse(courseData);
      setLoading(false);
    }, 1000);
  }, [courseId]);
  
  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    setPurchased(true);
  };
  
  if (loading) {
    return (
      <div className="course-loading">
        <div className="loading-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="course-error">
        <h2>Course Not Found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses" className="back-to-courses">
          Browse Courses
        </Link>
      </div>
    );
  }
  
  return (
    <div style={{
      padding: mobile ? '20px 16px' : '40px 60px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#F59E0B', marginBottom: 30 }}>{course.title}</h1>
      
      <div style={{ 
        background: 'rgba(42, 0, 102, 0.3)',
        padding: 24,
        borderRadius: 8,
        marginBottom: 30
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ marginRight: 16 }}><Icon name="clock" /> {course.lessons.length} Lessons</span>
            <span style={{ marginRight: 16 }}><Icon name="user" /> All Ages</span>
            <span><Icon name="star" /> Beginner</span>
          </div>
        </div>
        
        <p className="course-description">{course.description}</p>
        
        {!purchased ? (
          <CoursePayment 
            courseId={course.id}
            coursePrice={course.price} 
            courseName={course.title}
            onPaymentSuccess={handlePaymentSuccess}
          />
        ) : (
          <div className="course-access">
            <h2>Course Content</h2>
            <ul className="lesson-list">
              {course.lessons.map(lesson => (
                <li key={lesson.id} className="lesson-item">
                  <Link to={`/courses/${course.id}/lessons/${lesson.id}`} className="lesson-link">
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-duration">{lesson.duration}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="course-actions">
              <Link to={`/courses/${course.id}/module`} className="view-all-lessons">
                View All Lessons
              </Link>
              <Link to={`/courses/${course.id}/badges`} className="view-badges">
                View Course Badges
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="course-modules">
        <h2>What You'll Learn</h2>
        
        <CourseAccess 
          courseId={course.id}
          courseName={course.title}
          coursePrice={course.price}
        >
          <div className="module-preview">
            <h3>Module 1: Introduction to Bitcoin</h3>
            <ul className="module-lessons">
              {course.lessons.slice(0, 2).map(lesson => (
                <li key={lesson.id}>
                  <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                    {lesson.title}
                  </Link>
                  <span className="lesson-duration">{lesson.duration}</span>
                </li>
              ))}
            </ul>
            
            <h3>Module 2: Using Bitcoin</h3>
            <ul className="module-lessons">
              {course.lessons.slice(2).map(lesson => (
                <li key={lesson.id}>
                  <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>
                    {lesson.title}
                  </Link>
                  <span className="lesson-duration">{lesson.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </CourseAccess>
      </div>
    </div>
  );
};

export default CoursePage;