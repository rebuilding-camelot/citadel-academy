import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link, withRouter } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import QuickActions from './QuickActions';
import CurrentCourses from './CurrentCourses';
import FamilyProgress from './FamilyProgress';
import Achievements from './Achievements';
import LightningWallet from './LightningWallet';
import Settings from './Settings';
import AddFamilyMember from './AddFamilyMember';
import CreateCourse from './CreateCourse';

const DashboardPage = ({ mobile, location, pubkey }) => {
  // Determine active section from URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'courses';
    const section = path.split('/')[2];
    return section || 'courses';
  };
  
  const activeSection = getActiveSection();

  // For development purposes, we'll allow access even without pubkey
  // In production, uncomment the following block to require authentication
  /*
  // If user is not logged in, show login prompt
  if (!pubkey) {
    return (
      <div style={{
        padding: mobile ? '20px 16px' : '40px 60px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{ 
          background: 'rgba(42, 0, 102, 0.3)',
          padding: 24,
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <Icon name="lock" style={{ fontSize: 48, marginBottom: 16 }} />
          <h2>Login Required</h2>
          <p>Please sign in with your Nostr account to access your dashboard.</p>
          <Link to="/auth" style={{
            display: 'inline-block',
            background: 'var(--citadel-blue)',
            color: 'var(--citadel-white)',
            padding: '8px 16px',
            borderRadius: 4,
            textDecoration: 'none',
            marginTop: 16
          }}>
            <Icon name="sign in" /> Sign In
          </Link>
        </div>
      </div>
    );
  }
  */

  // Render the appropriate content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case 'courses':
        return <CurrentCourses />;
      case 'family-progress':
        return <FamilyProgress />;
      case 'achievements':
        return <Achievements />;
      case 'wallet':
        return <LightningWallet />;
      case 'settings':
        return <Settings />;
      case 'add-family':
        return <AddFamilyMember />;
      case 'create-course':
        return <CreateCourse />;
      default:
        return <CurrentCourses />;
    }
  };

  return (
    <div style={{
      padding: mobile ? '20px 16px' : '40px 60px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: '#F59E0B', marginBottom: 0 }}>My Academy</h1>
        {!mobile && <QuickActions mobile={mobile} />}
      </div>
      
      {mobile && <QuickActions mobile={mobile} />}
      
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '20px' : '0' }}>
        {/* Left Sidebar */}
        <DashboardSidebar mobile={mobile} activeSection={activeSection} />
        
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const mapState = ({ app, nostr }) => ({
  mobile: app.mobile,
  pubkey: nostr ? nostr.pubkey : null
});

export default withRouter(connect(mapState)(DashboardPage));
