import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const HeroSection = ({ mobile }) => {
  // Define styles using CSS variables from citadel-theme.css
  const heroContainerStyle = {
    background: 'linear-gradient(135deg, rgba(42, 0, 102, 0.9) 0%, rgba(0, 83, 159, 0.8) 100%)',
    padding: mobile ? '40px 16px' : '80px 60px',
    borderRadius: 12,
    marginBottom: 40,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  };

  const heroBackgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80") center/cover no-repeat',
    opacity: 0.15,
    zIndex: -1
  };

  const primaryButtonStyle = {
    display: 'inline-block',
    background: '#F59E0B',
    color: '#000',
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 'bold',
    textDecoration: 'none',
    marginRight: 16,
    marginBottom: mobile ? 16 : 0,
    transition: 'all 0.2s ease',
    border: '2px solid #F59E0B'
  };

  const secondaryButtonStyle = {
    display: 'inline-block',
    background: 'transparent',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 'bold',
    textDecoration: 'none',
    marginRight: 16,
    border: '2px solid rgba(255, 255, 255, 0.5)',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: mobile ? '0 16px' : '0 60px',
      marginTop: mobile ? 20 : 40
    }}>
      <div style={heroContainerStyle}>
        <div style={heroBackgroundStyle}></div>
        
        <h1 style={{ 
          fontSize: mobile ? 32 : 48, 
          color: '#fff', 
          marginBottom: 16,
          fontWeight: 'bold'
        }}>
          Bitcoin Education for the Whole Family
        </h1>
        
        <p style={{ 
          fontSize: mobile ? 16 : 20, 
          color: '#fff', 
          marginBottom: 32,
          maxWidth: 800,
          margin: '0 auto 32px auto',
          opacity: 0.9
        }}>
          Empower your family with the knowledge to build generational wealth and sovereignty through Bitcoin education.
        </p>
        
        <div style={{ marginTop: 40 }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: mobile ? 'column' : 'row',
            justifyContent: 'center',
            marginBottom: 24
          }}>
            <Link to="/n/family-hub" style={primaryButtonStyle}>
              <Icon name="users" /> Create Family Learning Pod
            </Link>
            
            <Link to="/courses" style={secondaryButtonStyle}>
              <Icon name="book" /> Browse Courses
            </Link>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: mobile ? 'column' : 'row',
            justifyContent: 'center'
          }}>
            <Link to="/register" style={{
              ...secondaryButtonStyle,
              background: 'rgba(255, 255, 255, 0.1)',
              marginBottom: mobile ? 16 : 0
            }}>
              <Icon name="user plus" /> Join Free
            </Link>
            
            <Link to="#" style={{
              ...secondaryButtonStyle,
              background: 'rgba(255, 255, 255, 0.1)'
            }}>
              <Icon name="play circle" /> Watch Demo
            </Link>
          </div>
        </div>
        
        <div style={{ 
          marginTop: 48,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '12px 24px', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Icon name="bitcoin" style={{ marginRight: 8, color: '#F59E0B' }} />
            <span>Family-focused curriculum</span>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '12px 24px', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Icon name="shield" style={{ marginRight: 8, color: '#F59E0B' }} />
            <span>Self-custody education</span>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '12px 24px', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Icon name="users" style={{ marginRight: 8, color: '#F59E0B' }} />
            <span>Multi-generational learning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default connect(mapState)(HeroSection);