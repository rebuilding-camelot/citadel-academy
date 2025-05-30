import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const CourseViewerPage = ({ mobile }) => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [courseType, setCourseType] = useState('free');
  
  // Define styles using CSS variables from citadel-theme.css
  const sectionStyle = {
    background: 'rgba(42, 0, 102, 0.3)',
    padding: 24,
    borderRadius: 8,
    marginBottom: 30
  };
  
  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: isActive ? 'rgba(0, 83, 159, 0.7)' : 'rgba(0, 83, 159, 0.2)',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal'
  });
  
  const courseTypeStyle = (isActive) => ({
    padding: '8px 16px',
    background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    border: isActive ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.2)',
    marginRight: 12
  });
  
  const courseCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };
  
  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 8
  };
  
  const renderFreeCourses = () => (
    <div>
      <div style={courseCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Intro to My First Bitcoin</h3>
              <span style={{ 
                background: '#F59E0B', 
                color: '#000', 
                padding: '2px 8px', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>FREE</span>
            </div>
            <p style={{ marginBottom: 16 }}>A beginner-friendly introduction to Bitcoin for all family members, including children.</p>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}><Icon name="clock" /> 5 Chapters</span>
              <span style={{ marginRight: 16 }}><Icon name="user" /> All Ages</span>
              <span><Icon name="star" /> Beginner</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>What you'll learn:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>What is money and why Bitcoin is better</li>
                <li>How to explain Bitcoin to children</li>
                <li>Setting up your first wallet as a family</li>
                <li>Securing your family's future with Bitcoin</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: mobile ? 16 : 0 }}>
            <Link to="#" style={buttonStyle}>
              <Icon name="play" /> Start Course
            </Link>
          </div>
        </div>
      </div>
      
      <div style={courseCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Bitcoin for Families</h3>
              <span style={{ 
                background: '#F59E0B', 
                color: '#000', 
                padding: '2px 8px', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>FREE</span>
            </div>
            <p style={{ marginBottom: 16 }}>Learn how to integrate Bitcoin into your family's financial planning and education.</p>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}><Icon name="clock" /> 5 Modules</span>
              <span style={{ marginRight: 16 }}><Icon name="user" /> Parents</span>
              <span><Icon name="star" /> Intermediate</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>What you'll learn:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Creating a family Bitcoin savings plan</li>
                <li>Teaching financial responsibility with Bitcoin</li>
                <li>Multi-generational wealth planning</li>
                <li>Setting up inheritance solutions</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: mobile ? 16 : 0 }}>
            <Link to="#" style={buttonStyle}>
              <Icon name="play" /> Start Course
            </Link>
          </div>
        </div>
      </div>
      
      <div style={courseCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Bitcoin for Grandparents</h3>
              <span style={{ 
                background: '#F59E0B', 
                color: '#000', 
                padding: '2px 8px', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>FREE</span>
            </div>
            <p style={{ marginBottom: 16 }}>A specialized course for older generations to understand and participate in Bitcoin.</p>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}><Icon name="clock" /> 3 Modules</span>
              <span style={{ marginRight: 16 }}><Icon name="user" /> Seniors</span>
              <span><Icon name="star" /> Beginner</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>What you'll learn:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Bitcoin basics with familiar analogies</li>
                <li>Simple and secure wallet options</li>
                <li>Legacy planning with Bitcoin</li>
                <li>Gifting Bitcoin to grandchildren</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: mobile ? 16 : 0 }}>
            <Link to="#" style={buttonStyle}>
              <Icon name="play" /> Start Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPaidCourses = () => (
    <div>
      <div style={courseCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Advanced Bitcoin Security</h3>
              <span style={{ 
                background: '#8B5CF6', 
                color: '#fff', 
                padding: '2px 8px', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>PREMIUM</span>
            </div>
            <p style={{ marginBottom: 16 }}>Advanced security practices to protect your family's Bitcoin holdings.</p>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}><Icon name="clock" /> 8 Modules</span>
              <span style={{ marginRight: 16 }}><Icon name="user" /> Parents</span>
              <span style={{ marginRight: 16 }}><Icon name="star" /> Advanced</span>
              <span><Icon name="bitcoin" /> 0.001 BTC</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>What you'll learn:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Multi-signature wallet setup for families</li>
                <li>Creating secure backup solutions</li>
                <li>Privacy practices for the whole family</li>
                <li>Emergency access protocols</li>
                <li>Hardware wallet best practices</li>
                <li>Inheritance planning with advanced tools</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: mobile ? 16 : 0 }}>
            <Link to="#" style={{
              ...buttonStyle,
              background: '#8B5CF6'
            }}>
              <Icon name="cart" /> Purchase Course
            </Link>
          </div>
        </div>
      </div>
      
      <div style={courseCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Family Wealth Planning</h3>
              <span style={{ 
                background: '#8B5CF6', 
                color: '#fff', 
                padding: '2px 8px', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>PREMIUM</span>
            </div>
            <p style={{ marginBottom: 16 }}>Comprehensive strategies for building and preserving multi-generational wealth with Bitcoin.</p>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}><Icon name="clock" /> 6 Modules</span>
              <span style={{ marginRight: 16 }}><Icon name="user" /> Parents</span>
              <span style={{ marginRight: 16 }}><Icon name="star" /> Intermediate</span>
              <span><Icon name="bitcoin" /> 0.0008 BTC</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>What you'll learn:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Creating a family Bitcoin savings plan</li>
                <li>Tax-efficient Bitcoin strategies</li>
                <li>Setting up trusts and inheritance solutions</li>
                <li>Balancing Bitcoin with traditional assets</li>
                <li>Teaching children about wealth preservation</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: mobile ? 16 : 0 }}>
            <Link to="#" style={{
              ...buttonStyle,
              background: '#8B5CF6'
            }}>
              <Icon name="cart" /> Purchase Course
            </Link>
          </div>
        </div>
      </div>
      
      <div style={courseCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Bitcoin for Business Owners</h3>
              <span style={{ 
                background: '#8B5CF6', 
                color: '#fff', 
                padding: '2px 8px', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: 'bold'
              }}>PREMIUM</span>
            </div>
            <p style={{ marginBottom: 16 }}>Integrating Bitcoin into your family business and entrepreneurial ventures.</p>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}><Icon name="clock" /> 7 Modules</span>
              <span style={{ marginRight: 16 }}><Icon name="user" /> Business Owners</span>
              <span style={{ marginRight: 16 }}><Icon name="star" /> Advanced</span>
              <span><Icon name="bitcoin" /> 0.0012 BTC</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>What you'll learn:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Bitcoin treasury strategies for small businesses</li>
                <li>Accepting Bitcoin payments</li>
                <li>Accounting and tax considerations</li>
                <li>Succession planning with Bitcoin</li>
                <li>Leveraging Bitcoin in family businesses</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: mobile ? 16 : 0 }}>
            <Link to="#" style={{
              ...buttonStyle,
              background: '#8B5CF6'
            }}>
              <Icon name="cart" /> Purchase Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCatalog = () => (
    <div>
      <div style={{ display: 'flex', marginBottom: 24 }}>
        <div 
          style={courseTypeStyle(courseType === 'free')}
          onClick={() => setCourseType('free')}
        >
          <Icon name="unlock" /> Free Courses
        </div>
        <div 
          style={courseTypeStyle(courseType === 'paid')}
          onClick={() => setCourseType('paid')}
        >
          <Icon name="lock" /> Premium Courses
        </div>
      </div>
      
      <h2 style={{ marginBottom: 24 }}>
        {courseType === 'free' ? 'Family-Focused Bitcoin Curriculum' : 'Premium Bitcoin Education'}
      </h2>
      
      {courseType === 'free' ? renderFreeCourses() : renderPaidCourses()}
    </div>
  );
  
  const renderCourseContent = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Intro to My First Bitcoin</h2>
        <div>
          <span style={{ marginRight: 16 }}><Icon name="clock" /> 5 Chapters</span>
          <span><Icon name="star" /> Beginner</span>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={{ color: '#F59E0B' }}>Chapter 1: Introduction to Bitcoin</h3>
        <p>Welcome to My First Bitcoin! This course will guide you through the basics of Bitcoin in a way that's accessible for the whole family.</p>
        
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 18 }}>What is Money?</h4>
          <p>To understand Bitcoin, it's helpful to first understand money. Money is a medium of exchange, a unit of account, and a store of value.</p>
          <p>Throughout history, families have used different forms of money to save for the future and pass wealth to the next generation. Bitcoin represents the next evolution in money.</p>
        </div>
        
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 18 }}>Why Bitcoin Matters for Families</h4>
          <p>Bitcoin offers unique benefits for families looking to build and preserve wealth:</p>
          <ul>
            <li>It cannot be devalued through inflation</li>
            <li>It can be securely passed down through generations</li>
            <li>It teaches important lessons about saving and financial responsibility</li>
            <li>It provides financial sovereignty in an uncertain world</li>
          </ul>
        </div>
        
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 18 }}>How to Use This Course</h4>
          <p>This course is designed to be accessible for all family members. We recommend:</p>
          <ul>
            <li>Parents and children go through the material together</li>
            <li>Complete the family activities at the end of each chapter</li>
            <li>Use the simplified explanations for younger children</li>
            <li>Take your time and revisit concepts as needed</li>
          </ul>
        </div>
        
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          <div></div>
          <Link to="#" style={buttonStyle}>
            Next Chapter <Icon name="arrow right" />
          </Link>
        </div>
      </div>
    </div>
  );
  
  return (
    <div style={{
      padding: mobile ? '20px 16px' : '40px 60px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#F59E0B', marginBottom: 30 }}>Start Learning</h1>
      
      <div style={{ display: 'flex', marginBottom: 24 }}>
        <div 
          style={tabStyle(activeTab === 'catalog')}
          onClick={() => setActiveTab('catalog')}
        >
          Course Catalog
        </div>
        <div 
          style={tabStyle(activeTab === 'content')}
          onClick={() => setActiveTab('content')}
        >
          Current Course
        </div>
      </div>
      
      <div style={sectionStyle}>
        {activeTab === 'catalog' ? renderCatalog() : renderCourseContent()}
      </div>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default connect(mapState)(CourseViewerPage);
