import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const CurrentCourses = ({ mobile }) => {
  // Define styles
  const sectionStyle = {
    background: 'rgba(42, 0, 102, 0.3)',
    padding: 24,
    borderRadius: 8,
    marginBottom: 30
  };

  const progressBarStyle = {
    height: 8,
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden'
  };

  const progressFillStyle = (percent) => ({
    height: '100%',
    width: `${percent}%`,
    background: 'var(--citadel-blue)',
    borderRadius: 4
  });

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 16
  };

  const courseCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  // Mock data for courses
  const courses = [
    {
      id: 1,
      title: 'My First Bitcoin',
      progress: 60,
      chaptersCompleted: 3,
      totalChapters: 5,
      lastActivity: '2 days ago',
      nextChapter: 'Chapter 4: Bitcoin Security'
    },
    {
      id: 2,
      title: 'Bitcoin for Families',
      progress: 20,
      chaptersCompleted: 1,
      totalChapters: 5,
      lastActivity: '1 week ago',
      nextChapter: 'Chapter 2: Setting Up Family Wallets'
    },
    {
      id: 3,
      title: 'Advanced Self-Custody',
      progress: 10,
      chaptersCompleted: 1,
      totalChapters: 10,
      lastActivity: '3 weeks ago',
      nextChapter: 'Chapter 2: Multi-signature Wallets'
    }
  ];

  // Mock data for recommended courses
  const recommendedCourses = [
    {
      id: 4,
      title: 'Bitcoin Privacy Techniques',
      description: 'Learn how to protect your privacy when using Bitcoin',
      level: 'Intermediate',
      duration: '4 weeks'
    },
    {
      id: 5,
      title: 'Lightning Network Basics',
      description: 'Get started with Bitcoin\'s Layer 2 scaling solution',
      level: 'Beginner',
      duration: '2 weeks'
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Current Courses</h2>
      
      {/* Active Courses */}
      <section style={sectionStyle}>
        <h3><Icon name="book" /> Active Learning Paths</h3>
        
        {courses.map(course => (
          <div key={course.id} style={courseCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 20, margin: 0 }}>{course.title}</h3>
              <span style={{ 
                background: '#F59E0B', 
                color: '#000', 
                padding: '4px 8px', 
                borderRadius: 4, 
                fontSize: 12 
              }}>{course.progress}% Complete</span>
            </div>
            
            <div style={progressBarStyle}>
              <div style={progressFillStyle(course.progress)}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Progress:</strong> {course.chaptersCompleted} of {course.totalChapters} chapters
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Last activity:</strong> {course.lastActivity}
                </p>
                <p style={{ margin: '0 0 16px 0' }}>
                  <strong>Next up:</strong> {course.nextChapter}
                </p>
                <Link to={`/courses/${course.id}`} style={buttonStyle}>
                  <Icon name="arrow right" /> Continue Learning
                </Link>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: mobile ? 20 : 0
              }}>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: 'rgba(0, 83, 159, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Icon name="bitcoin" style={{ fontSize: 32, color: '#F59E0B' }} />
                </div>
                <Link to={`/courses/${course.id}/resources`} style={{ 
                  color: 'var(--citadel-blue)', 
                  textDecoration: 'none',
                  fontSize: 14
                }}>
                  View Resources
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
      
      {/* Recommended Courses */}
      <section style={sectionStyle}>
        <h3><Icon name="lightbulb" /> Recommended for You</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 16 }}>
          {recommendedCourses.map(course => (
            <div key={course.id} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 20,
              width: mobile ? '100%' : 'calc(50% - 10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h3 style={{ fontSize: 18, margin: '0 0 12px 0' }}>{course.title}</h3>
              <p style={{ margin: '0 0 16px 0' }}>{course.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 14 }}>
                  <Icon name="signal" /> {course.level}
                </span>
                <span style={{ fontSize: 14 }}>
                  <Icon name="clock" /> {course.duration}
                </span>
              </div>
              <Link to={`/courses/${course.id}`} style={{
                ...buttonStyle,
                background: 'transparent',
                border: '1px solid var(--citadel-blue)',
                textAlign: 'center',
                display: 'block'
              }}>
                <Icon name="plus" /> Add to My Courses
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      {/* Course Completion */}
      <section style={sectionStyle}>
        <h3><Icon name="certificate" /> Recently Completed</h3>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: 20,
          marginTop: 16,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: mobile ? 'wrap' : 'nowrap'
        }}>
          <div style={{ flex: 1, minWidth: mobile ? '100%' : 0 }}>
            <h3 style={{ fontSize: 18, margin: '0 0 8px 0' }}>Bitcoin Basics</h3>
            <p style={{ margin: '0 0 8px 0' }}>Completed on April 15, 2023</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Icon name="trophy" style={{ color: '#F59E0B', marginRight: 8 }} />
              <span>Certificate Earned</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            marginTop: mobile ? 20 : 0
          }}>
            <Link to="/dashboard/achievements" style={buttonStyle}>
              <Icon name="eye" /> View Certificate
            </Link>
            <Link to="/courses/bitcoin-basics/review" style={{ 
              color: 'var(--citadel-blue)', 
              textDecoration: 'none',
              fontSize: 14,
              marginTop: 8
            }}>
              Review Course Materials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app ? app.mobile : false
});

export default connect(mapState)(CurrentCourses);