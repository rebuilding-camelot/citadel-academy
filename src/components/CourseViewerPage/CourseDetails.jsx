import React, { useState } from 'react';
import CoursePayment from '../CoursePayment';
import './CourseDetails.css';

const CourseDetails = ({ course }) => {
  const [purchased, setPurchased] = useState(false);
  
  // Sample course data
  const sampleCourse = {
    id: 'bitcoin-basics',
    title: 'Bitcoin Basics',
    description: 'Learn the fundamentals of Bitcoin and how it works.',
    price: 10000, // 10,000 sats
    lessons: [
      { id: 'lesson-1', title: 'What is Bitcoin?', duration: '15 min' },
      { id: 'lesson-2', title: 'How Bitcoin Works', duration: '20 min' },
      { id: 'lesson-3', title: 'Setting Up a Wallet', duration: '25 min' },
      { id: 'lesson-4', title: 'Making Your First Transaction', duration: '15 min' },
    ]
  };
  
  const courseData = course || sampleCourse;
  
  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    setPurchased(true);
  };
  
  return (
    <div className="course-details">
      <h1>{courseData.title}</h1>
      <p className="course-description">{courseData.description}</p>
      
      {!purchased ? (
        <CoursePayment 
          coursePrice={courseData.price} 
          courseName={courseData.title}
          onPaymentSuccess={handlePaymentSuccess}
        />
      ) : (
        <div className="course-access">
          <h2>Course Content</h2>
          <ul className="lesson-list">
            {courseData.lessons.map(lesson => (
              <li key={lesson.id} className="lesson-item">
                <span className="lesson-title">{lesson.title}</span>
                <span className="lesson-duration">{lesson.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;