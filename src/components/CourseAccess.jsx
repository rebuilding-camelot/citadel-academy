import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { hasUserPurchasedCourse } from '../lib/lightning';
import './CourseAccess.css';

const CourseAccess = ({ courseId, courseName, coursePrice, children }) => {
  const [accessStatus, setAccessStatus] = useState('checking'); // checking, granted, denied
  const [loading, setLoading] = useState(true);
  
  const user = useSelector(state => state.user);
  
  useEffect(() => {
    checkAccess();
  }, [courseId, user.pubkey]);
  
  const checkAccess = async () => {
    setLoading(true);
    
    try {
      // If user is not logged in, deny access
      if (!user.pubkey) {
        setAccessStatus('denied');
        return;
      }
      
      // Check if user has purchased the course
      const hasPurchased = await hasUserPurchasedCourse(courseId, user.pubkey);
      
      // Check if user is an admin or instructor
      const isAdmin = user.roles && (user.roles.includes('admin') || user.roles.includes('instructor'));
      
      if (hasPurchased || isAdmin) {
        setAccessStatus('granted');
      } else {
        setAccessStatus('denied');
      }
    } catch (error) {
      console.error('Error checking course access:', error);
      setAccessStatus('denied');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="course-access-loading">
        <div className="loading-spinner"></div>
        <p>Checking access...</p>
      </div>
    );
  }
  
  if (accessStatus === 'granted') {
    return children;
  }
  
  return (
    <div className="course-access-denied">
      <div className="access-denied-content">
        <h2>Course Access Required</h2>
        <p>You need to purchase this course to access its content.</p>
        
        <div className="course-info">
          <h3>{courseName}</h3>
          <p className="course-price">{coursePrice.toLocaleString()} sats</p>
        </div>
        
        <div className="access-actions">
          <Link to={`/courses/${courseId}`} className="purchase-link">
            Purchase Course
          </Link>
          
          <Link to="/courses" className="browse-link">
            Browse Other Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseAccess;