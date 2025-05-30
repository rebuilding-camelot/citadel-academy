import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import { COLORS } from '../../constants';

const Legal = () => {
  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#fff',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const iconStyle = {
    marginRight: 12,
    color: COLORS.secondaryBright
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ padding: '0 24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h3 style={{ fontSize: 18, marginBottom: 12 }}>Legal & Information</h3>
        <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
          Important information about Citadel Academy's terms, privacy, and open source code.
        </p>
      </div>

      <Link to="/privacy" style={linkStyle}>
        <Icon name="shield" style={iconStyle} />
        <span>Privacy Policy</span>
      </Link>

      <Link to="/terms" style={linkStyle}>
        <Icon name="file alternate" style={iconStyle} />
        <span>Terms of Service</span>
      </Link>

      <a href="https://github.com/lovvtide/satellite-web" target="_blank" rel="noopener noreferrer" style={linkStyle}>
        <Icon name="github" style={iconStyle} />
        <span>Open Source</span>
      </a>

      <Link to="/contact" style={linkStyle}>
        <Icon name="envelope" style={iconStyle} />
        <span>Contact Us</span>
      </Link>

      <div style={{ padding: '24px', fontSize: 13, opacity: 0.5, textAlign: 'center' }}>
        <p>© {new Date().getFullYear()} Citadel Academy</p>
        <p style={{ marginTop: 8 }}>Building Bitcoin education for families</p>
      </div>
    </div>
  );
};

export default Legal;