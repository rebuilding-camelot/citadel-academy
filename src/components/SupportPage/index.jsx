import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

const SupportPage = ({ mobile }) => {
  // Define styles using CSS variables from citadel-theme.css
  const sectionStyle = {
    flex: 1, 
    background: 'rgba(42, 0, 102, 0.3)', 
    padding: 24, 
    borderRadius: 8,
    marginBottom: mobile ? 20 : 0
  };

  const linkStyle = {
    color: '#F59E0B', // Using the Nostr gold color from branding.css
    marginLeft: 8
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

  return (
    <div style={{
      padding: mobile ? '20px 16px' : '40px 60px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#F59E0B', marginBottom: 30 }}>Support</h1>
      
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '30px' }}>
        <section style={sectionStyle}>
          <h2><Icon name="book" /> Documentation</h2>
          <p>Find answers to common questions in our comprehensive documentation:</p>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: 12 }}>
              <Icon name="arrow right" />
              <a href="#" style={linkStyle}>Getting Started Guide</a>
            </li>
            <li style={{ marginBottom: 12 }}>
              <Icon name="arrow right" />
              <a href="#" style={linkStyle}>Family Account Setup</a>
            </li>
            <li style={{ marginBottom: 12 }}>
              <Icon name="arrow right" />
              <a href="#" style={linkStyle}>Course Navigation</a>
            </li>
            <li style={{ marginBottom: 12 }}>
              <Icon name="arrow right" />
              <a href="#" style={linkStyle}>Bitcoin Basics</a>
            </li>
            <li>
              <Icon name="arrow right" />
              <a href="#" style={linkStyle}>Troubleshooting</a>
            </li>
          </ul>
        </section>
        
        <section style={{...sectionStyle, marginBottom: 0}}>
          <h2><Icon name="chat" /> Community Support</h2>
          <p>Connect with our community and support team:</p>
          
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18 }}>Community Chat</h3>
            <p>Join our Nostr community channels for peer support and discussions:</p>
            <a href="https://iris.to/npub1p9a5sclpw5prjhx0c0u4ufjnwmnt2pxcvpa4lxnf4wn53vawuatqkmzxyt" style={buttonStyle} target="_blank" rel="noopener noreferrer">
              <Icon name="users" /> Join Community Chat
            </a>
          </div>
          
          <div>
            <h3 style={{ fontSize: 18 }}>Direct Support</h3>
            <p>Need personalized help? Our support team is ready to assist:</p>
            <a href="https://iris.to/npub1qq50zturtx4ns2uf2adt26pcpmez47ur9ds6a4fwaax5u5evr3nsnu2qvm" style={buttonStyle} target="_blank" rel="noopener noreferrer">
              <Icon name="mail" /> Contact Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default connect(mapState)(SupportPage);