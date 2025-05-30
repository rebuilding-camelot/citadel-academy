import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link, withRouter } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import QuickActions from './QuickActions';

const DashboardPage = ({ mobile, location }) => {
  // Determine active section from URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'courses';
    const section = path.split('/')[2];
    return section || 'courses';
  };
  
  const activeSection = getActiveSection();
  // Define styles using CSS variables from citadel-theme.css
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

  const badgeStyle = {
    background: 'rgba(0, 83, 159, 0.3)',
    padding: 16,
    borderRadius: 8,
    width: mobile ? '100%' : 180,
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 16
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
          <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '30px' }}>
            {/* Left column */}
            <div style={{ flex: 2 }}>
              {/* Learning Progress Section */}
              <section style={sectionStyle}>
                <h2><Icon name="book" /> Learning Progress</h2>
                
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 18, margin: 0 }}>My First Bitcoin</h3>
                    <span>60% Complete</span>
                  </div>
                  <div style={progressBarStyle}>
                    <div style={progressFillStyle(60)}></div>
                  </div>
                  <p>You've completed 3 of 5 chapters. Continue where you left off:</p>
                  <Link to="/courses" style={buttonStyle}>
                    <Icon name="arrow right" /> Continue Learning
                  </Link>
                </div>
                
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 18, margin: 0 }}>Bitcoin for Families</h3>
                    <span>20% Complete</span>
                  </div>
                  <div style={progressBarStyle}>
                    <div style={progressFillStyle(20)}></div>
                  </div>
                  <p>You've completed 1 of 5 modules.</p>
                  <Link to="/courses" style={buttonStyle}>
                    <Icon name="arrow right" /> Continue Learning
                  </Link>
                </div>
              </section>
              
              {/* Family Groups Section */}
              <section style={sectionStyle}>
                <h2><Icon name="users" /> Family Groups</h2>
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ 
                    padding: 16, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.1)',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: 18, margin: 0 }}>Satoshi Family</h3>
                      <span style={{ 
                        background: '#F59E0B', 
                        color: '#000', 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: 12 
                      }}>Admin</span>
                    </div>
                    <p style={{ marginTop: 8 }}>4 members • 2 active courses</p>
                    <Link to="/n/family-hub" style={buttonStyle}>
                      <Icon name="arrow right" /> Manage Group
                    </Link>
                  </div>
                  
                  <div style={{ 
                    padding: 16, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: 18, margin: 0 }}>Bitcoin Study Group</h3>
                      <span style={{ 
                        background: 'rgba(255, 255, 255, 0.2)', 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: 12 
                      }}>Member</span>
                    </div>
                    <p style={{ marginTop: 8 }}>12 members • 3 active courses</p>
                    <Link to="/n/family-hub" style={buttonStyle}>
                      <Icon name="arrow right" /> View Group
                    </Link>
                  </div>
                  
                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Link to="/n/family-hub" style={{
                      ...buttonStyle,
                      background: 'transparent',
                      border: '1px dashed rgba(255, 255, 255, 0.3)'
                    }}>
                      <Icon name="plus" /> Create New Family Group
                    </Link>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Right column */}
            <div style={{ flex: 1 }}>
              {/* Badges Section */}
              <section style={sectionStyle}>
                <h2><Icon name="trophy" /> My Badges</h2>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 16, 
                  marginTop: 16,
                  justifyContent: mobile ? 'center' : 'flex-start'
                }}>
                  <div style={badgeStyle}>
                    <Icon name="bitcoin" style={{ fontSize: 32, color: '#F59E0B', marginBottom: 8 }} />
                    <h3 style={{ fontSize: 16, margin: '8px 0' }}>Bitcoin Beginner</h3>
                    <p style={{ fontSize: 12, margin: 0 }}>Completed MFB Chapter 1</p>
                  </div>
                  
                  <div style={badgeStyle}>
                    <Icon name="key" style={{ fontSize: 32, color: '#F59E0B', marginBottom: 8 }} />
                    <h3 style={{ fontSize: 16, margin: '8px 0' }}>Self-Custody</h3>
                    <p style={{ fontSize: 12, margin: 0 }}>Created first wallet</p>
                  </div>
                  
                  <div style={badgeStyle}>
                    <Icon name="users" style={{ fontSize: 32, color: '#F59E0B', marginBottom: 8 }} />
                    <h3 style={{ fontSize: 16, margin: '8px 0' }}>Family Leader</h3>
                    <p style={{ fontSize: 12, margin: 0 }}>Created family group</p>
                  </div>
                  
                  <div style={badgeStyle}>
                    <Icon name="id card" style={{ fontSize: 32, color: '#F59E0B', marginBottom: 8 }} />
                    <h3 style={{ fontSize: 16, margin: '8px 0' }}>Nostr Identity</h3>
                    <p style={{ fontSize: 12, margin: 0 }}>Verified NIP-05</p>
                  </div>
                </div>
              </section>
              
              {/* Upcoming Events Section */}
              <section style={sectionStyle}>
                <h2><Icon name="calendar" /> Upcoming Events</h2>
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ 
                    padding: 16, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.1)',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: 16, margin: 0 }}>Family Bitcoin Workshop</h3>
                      <span style={{ fontSize: 14 }}>May 21</span>
                    </div>
                    <p style={{ marginTop: 8, fontSize: 14 }}>Learn how to set up wallets for your children</p>
                  </div>
                  
                  <div style={{ 
                    padding: 16, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: 16, margin: 0 }}>Inheritance Planning</h3>
                      <span style={{ fontSize: 14 }}>June 5</span>
                    </div>
                    <p style={{ marginTop: 8, fontSize: 14 }}>Secure your family's bitcoin for generations</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default withRouter(connect(mapState)(DashboardPage));
