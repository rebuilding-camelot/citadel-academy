import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { viewSidePanel } from '../../actions';
import { COLORS } from '../../constants';

const Footer = ({ mobile, viewSidePanel }) => {
  // Function to open the Legal side panel
  const openLegalPanel = () => {
    viewSidePanel('legal');
  };

  console.log('Footer component rendering');

  // Create a very obvious footer that can't be missed
  return (
    <footer style={{
      backgroundColor: 'red', // Very obvious color
      color: 'white',
      padding: mobile ? '20px 16px' : '30px 0',
      marginTop: 'auto',
      borderTop: '5px solid black',
      width: '100%',
      position: 'relative',
      zIndex: 9999, // Very high z-index to ensure visibility
      minHeight: '150px', // Ensure it has height
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: mobile ? 'flex-start' : 'center',
        width: '100%'
      }}>
        <div style={{ marginBottom: mobile ? 20 : 0 }}>
          <h3 style={{ 
            fontSize: 24, 
            marginBottom: 10,
            fontWeight: 'bold'
          }}>
            FOOTER - Citadel Academy
          </h3>
          <p style={{ 
            fontSize: 16, 
            maxWidth: 400,
            lineHeight: 1.5,
            fontWeight: 'bold'
          }}>
            Where Families Forge Their Dynastic Legacies
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          gap: mobile ? '15px' : '30px'
        }}>
          <Link to="/about" style={{ 
            color: 'white', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            <Icon name="info circle" style={{ marginRight: 8 }} />
            <span>About</span>
          </Link>
          
          <Link to="/support" style={{ 
            color: 'white', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            <Icon name="question circle" style={{ marginRight: 8 }} />
            <span>Support</span>
          </Link>
          
          <div 
            onClick={openLegalPanel}
            style={{ 
              color: 'white', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            <Icon name="gavel" style={{ marginRight: 8 }} />
            <span>Legal</span>
          </div>
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: 20, 
        fontSize: 16,
        fontWeight: 'bold'
      }}>
        <p>© {new Date().getFullYear()} Citadel Academy. All rights reserved.</p>
      </div>
    </footer>
  );
};

const mapState = ({ app }) => {
  return {
    mobile: app.mobile
  };
};

export default connect(mapState, { viewSidePanel })(Footer);