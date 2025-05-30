import React from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const DashboardSidebar = ({ mobile, activeSection = 'courses' }) => {
  const sidebarStyle = {
    background: 'rgba(42, 0, 102, 0.5)',
    borderRadius: 8,
    padding: 20,
    width: mobile ? '100%' : 240,
    marginRight: mobile ? 0 : 30,
    marginBottom: mobile ? 30 : 0
  };

  const sidebarItemStyle = (active = false) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 6,
    marginBottom: 8,
    background: active ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
    color: active ? '#F59E0B' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  });

  const sidebarSectionStyle = {
    marginBottom: 24
  };

  const sidebarSectionTitleStyle = {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    paddingLeft: 16,
    fontFamily: 'JetBrains-Mono-Bold'
  };

  return (
    <div style={sidebarStyle}>
      {/* Current Courses Section */}
      <div style={sidebarSectionStyle}>
        <div style={sidebarSectionTitleStyle}>DASHBOARD</div>
        
        <Link to="/dashboard/courses" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'courses')}>
            <Icon name="book" style={{ marginRight: 12 }} />
            <span>Current Courses</span>
          </div>
        </Link>
        
        <Link to="/dashboard/family-progress" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'family-progress')}>
            <Icon name="users" style={{ marginRight: 12 }} />
            <span>Family Progress</span>
          </div>
        </Link>
        
        <Link to="/dashboard/achievements" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'achievements')}>
            <Icon name="trophy" style={{ marginRight: 12 }} />
            <span>Achievements</span>
          </div>
        </Link>
        
        <Link to="/dashboard/wallet" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'wallet')}>
            <Icon name="bolt" style={{ marginRight: 12 }} />
            <span>Lightning Wallet</span>
          </div>
        </Link>
        
        <Link to="/dashboard/settings" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'settings')}>
            <Icon name="cog" style={{ marginRight: 12 }} />
            <span>Settings</span>
          </div>
        </Link>
      </div>

      {/* Resources Section */}
      <div style={sidebarSectionStyle}>
        <div style={sidebarSectionTitleStyle}>RESOURCES</div>
        
        <Link to="/dashboard/materials" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'materials')}>
            <Icon name="file alternate" style={{ marginRight: 12 }} />
            <span>Learning Materials</span>
          </div>
        </Link>
        
        <Link to="/dashboard/tutorials" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'tutorials')}>
            <Icon name="video" style={{ marginRight: 12 }} />
            <span>Video Tutorials</span>
          </div>
        </Link>
      </div>

      {/* Community Section */}
      <div style={sidebarSectionStyle}>
        <div style={sidebarSectionTitleStyle}>COMMUNITY</div>
        
        <Link to="/dashboard/forums" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'forums')}>
            <Icon name="comments" style={{ marginRight: 12 }} />
            <span>Discussion Forums</span>
          </div>
        </Link>
        
        <Link to="/dashboard/events" style={{ textDecoration: 'none' }}>
          <div style={sidebarItemStyle(activeSection === 'events')}>
            <Icon name="calendar alternate" style={{ marginRight: 12 }} />
            <span>Events</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;