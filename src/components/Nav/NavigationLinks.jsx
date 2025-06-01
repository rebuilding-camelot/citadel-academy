import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import { transition } from '../../helpers';

// Primary Navigation Links Component
export const PrimaryNavLinks = ({ mobile, activeRoute, onHover, hoverState }) => {
  const linkStyle = (route) => ({
    cursor: 'pointer',
    color: activeRoute === route ? '#F59E0B' : '#fff', // Using Nostr gold from branding.css
    opacity: hoverState === route ? 1 : 0.85,
    marginLeft: mobile ? 8 : 16,
    marginRight: mobile ? 8 : 16,
    fontSize: mobile ? 12 : 13,
    fontFamily: 'Lexend-Deca-Regular',
    fontWeight: 'bold',
    borderBottom: mobile ? 'none' : `2px solid ${activeRoute === route ? '#F59E0B' : 'transparent'}`,
    paddingBottom: mobile ? 0 : 2,
    display: 'flex',
    alignItems: 'center',
    ...transition(0.2, 'ease', ['opacity', 'color'])
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Link to="/courses" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('courses')}
          onMouseOver={() => onHover('courses')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="book" style={{ marginRight: 5 }} />
          {mobile ? null : "Start Learning"}
        </div>
      </Link>
      
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('dashboard')}
          onMouseOver={() => onHover('dashboard')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="user" style={{ marginRight: 5 }} />
          {mobile ? null : "My Academy"}
        </div>
      </Link>
      
      <Link to="/n/family-hub" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('n')}
          onMouseOver={() => onHover('n')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="users" style={{ marginRight: 5 }} />
          {mobile ? null : "Family Hub"}
        </div>
      </Link>
      
      <Link to="https://satnam.pub" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('identity')}
          onMouseOver={() => onHover('identity')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="id card" style={{ marginRight: 5 }} />
          {mobile ? null : "Identity Forge"}
        </div>
      </Link>
      
      <Link to="/badges" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('badges')}
          onMouseOver={() => onHover('badges')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="certificate" style={{ marginRight: 5 }} />
          {mobile ? null : "Badges"}
        </div>
      </Link>
      
      <Link to="/academystore" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('academystore')}
          onMouseOver={() => onHover('academystore')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="shopping basket" style={{ marginRight: 5 }} />
          {mobile ? null : "Academy Store"}
        </div>
      </Link>
      
      <Link to="/members" style={{ textDecoration: 'none' }}>
        <div 
          style={linkStyle('members')}
          onMouseOver={() => onHover('members')}
          onMouseOut={() => onHover('')}
        >
          <Icon name="lock" style={{ marginRight: 5 }} />
          {mobile ? null : "Members' Only"}
        </div>
      </Link>
    </div>
  );
};

// Secondary Navigation Links Component
export const SecondaryNavLinks = ({ mobile, activeRoute, onHover, hoverState }) => {
  // This component is now empty as the links have been moved to the right side menu
  return null;
};