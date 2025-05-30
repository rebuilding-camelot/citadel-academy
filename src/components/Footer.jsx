import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

// Import the logo
import logo from '../assets/citadel-logo.png';

const Footer = () => {
  console.log('Footer rendering');
  
  return (
    <div style={{
      backgroundColor: '#2a0066', // Dark purple to match header
      color: '#F59E0B', // Gold text
      padding: '20px',
      borderTop: '1px solid #F59E0B', // Gold border
      textAlign: 'center',
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '10px'
      }}>
        <Link to="/about" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="info circle" style={{ marginRight: 5, color: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>About</span>
          </div>
        </Link>
        
        <Link to="/support" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="help circle" style={{ marginRight: 5, color: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>Support</span>
          </div>
        </Link>
        
        <Link to="/privacy" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="shield" style={{ marginRight: 5, color: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>Privacy</span>
          </div>
        </Link>
        
        <Link to="/terms" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="file alternate" style={{ marginRight: 5, color: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>Terms</span>
          </div>
        </Link>
        
        <Link to="/contact" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="mail" style={{ marginRight: 5, color: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>Contact</span>
          </div>
        </Link>
      </div>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{ 
          color: '#8B5CF6', /* Nostr purple - same as academy-title */
          fontFamily: 'Lexend-Deca-Regular, sans-serif',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          © 2025 CITADEL ACADEMY
        </div>
        <img 
          src={logo} 
          alt="Citadel Academy Logo" 
          style={{ 
            height: '30px',
            marginLeft: '10px'
          }} 
        />
      </div>
    </div>
  );
};

export default Footer;