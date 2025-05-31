import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Achievements = ({ mobile }) => {
  const [activeTab, setActiveTab] = useState('badges');
  
  // Define styles
  const sectionStyle = {
    background: 'rgba(42, 0, 102, 0.3)',
    padding: 24,
    borderRadius: 8,
    marginBottom: 30
  };

  const tabStyle = (active) => ({
    padding: '12px 20px',
    background: active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
    cursor: 'pointer',
    color: active ? '#F59E0B' : '#fff',
    fontWeight: active ? 'bold' : 'normal',
    border: active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)'
  });

  const badgeStyle = (earned = true) => ({
    background: earned ? 'rgba(0, 83, 159, 0.3)' : 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 8,
    width: mobile ? '100%' : 'calc(33.333% - 16px)',
    textAlign: 'center',
    border: earned ? '1px solid rgba(0, 83, 159, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
    opacity: earned ? 1 : 0.6,
    position: 'relative'
  });

  const certificateStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    border: '1px solid rgba(255, 255, 255, 0.05)'
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

  // Mock data for badges (NIP-58 compatible)
  const badges = [
    {
      id: 1,
      name: 'Bitcoin Beginner',
      description: 'Completed MFB Chapter 1',
      icon: 'bitcoin',
      earned: true,
      date: '2023-04-10',
      nip58Id: 'badge:30009:bitcoin-beginner'
    },
    {
      id: 2,
      name: 'Self-Custody',
      description: 'Created first wallet',
      icon: 'key',
      earned: true,
      date: '2023-04-15',
      nip58Id: 'badge:30009:self-custody'
    },
    {
      id: 3,
      name: 'Family Leader',
      description: 'Created family group',
      icon: 'users',
      earned: true,
      date: '2023-04-20',
      nip58Id: 'badge:30009:family-leader'
    },
    {
      id: 4,
      name: 'Nostr Identity',
      description: 'Verified NIP-05',
      icon: 'id card',
      earned: true,
      date: '2023-04-25',
      nip58Id: 'badge:30009:nostr-identity'
    },
    {
      id: 5,
      name: 'Lightning User',
      description: 'Sent first Lightning payment',
      icon: 'bolt',
      earned: false,
      nip58Id: 'badge:30009:lightning-user'
    },
    {
      id: 6,
      name: 'Bitcoin Historian',
      description: 'Completed Bitcoin History course',
      icon: 'history',
      earned: false,
      nip58Id: 'badge:30009:bitcoin-historian'
    },
    {
      id: 7,
      name: 'Multisig Master',
      description: 'Set up a multisig wallet',
      icon: 'shield',
      earned: false,
      nip58Id: 'badge:30009:multisig-master'
    },
    {
      id: 8,
      name: 'Node Runner',
      description: 'Set up a Bitcoin node',
      icon: 'server',
      earned: false,
      nip58Id: 'badge:30009:node-runner'
    }
  ];

  // Mock data for certificates
  const certificates = [
    {
      id: 1,
      name: 'Bitcoin Basics',
      issueDate: 'April 15, 2023',
      courseId: 'bitcoin-basics',
      instructor: 'Dr. Bitcoin',
      nip58Id: 'cert:30009:bitcoin-basics'
    },
    {
      id: 2,
      name: 'Family Bitcoin Planning',
      issueDate: 'May 5, 2023',
      courseId: 'family-bitcoin',
      instructor: 'Sarah Satoshi',
      nip58Id: 'cert:30009:family-bitcoin'
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Achievements</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
        <div 
          style={tabStyle(activeTab === 'badges')}
          onClick={() => setActiveTab('badges')}
        >
          <Icon name="trophy" /> Badges
        </div>
        <div 
          style={tabStyle(activeTab === 'certificates')}
          onClick={() => setActiveTab('certificates')}
        >
          <Icon name="certificate" /> Certificates
        </div>
        <div 
          style={tabStyle(activeTab === 'nostr')}
          onClick={() => setActiveTab('nostr')}
        >
          <Icon name="id badge" /> Nostr Verification
        </div>
      </div>
      
      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><Icon name="trophy" /> NIP-58 Badges</h3>
            <span style={{ fontSize: 14 }}>
              {badges.filter(b => b.earned).length} of {badges.length} Earned
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 24, 
            marginTop: 24 
          }}>
            {badges.map(badge => (
              <div key={badge.id} style={badgeStyle(badge.earned)}>
                {badge.earned && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    background: '#F59E0B',
                    color: '#000',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon name="check" style={{ margin: 0 }} />
                  </div>
                )}
                
                <Icon name={badge.icon} style={{ 
                  fontSize: 48, 
                  color: badge.earned ? '#F59E0B' : 'rgba(255, 255, 255, 0.5)', 
                  marginBottom: 16 
                }} />
                <h3 style={{ fontSize: 16, margin: '0 0 8px 0' }}>{badge.name}</h3>
                <p style={{ fontSize: 14, margin: '0 0 12px 0' }}>{badge.description}</p>
                
                {badge.earned ? (
                  <div style={{ fontSize: 12 }}>
                    Earned on {new Date(badge.date).toLocaleDateString()}
                  </div>
                ) : (
                  <Link to={`/courses/badge/${badge.id}`} style={{
                    color: 'var(--citadel-blue)',
                    textDecoration: 'none',
                    fontSize: 14
                  }}>
                    How to earn this badge
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/courses" style={buttonStyle}>
              <Icon name="book" /> Explore More Courses to Earn Badges
            </Link>
          </div>
        </section>
      )}
      
      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <section style={sectionStyle}>
          <h3><Icon name="certificate" /> Course Certificates</h3>
          
          <div style={{ marginTop: 24 }}>
            {certificates.map(cert => (
              <div key={cert.id} style={certificateStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: mobile ? '100%' : 0 }}>
                    <h3 style={{ fontSize: 20, margin: '0 0 8px 0' }}>{cert.name} Certificate</h3>
                    <p style={{ margin: '0 0 4px 0' }}>
                      <strong>Issued:</strong> {cert.issueDate}
                    </p>
                    <p style={{ margin: '0 0 4px 0' }}>
                      <strong>Instructor:</strong> {cert.instructor}
                    </p>
                    <p style={{ margin: '0 0 16px 0' }}>
                      <strong>NIP-58 ID:</strong> <code>{cert.nip58Id}</code>
                    </p>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    marginTop: mobile ? 16 : 0
                  }}>
                    <Link to={`/certificate/${cert.id}`} style={buttonStyle}>
                      <Icon name="eye" /> View Certificate
                    </Link>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <Link to={`/certificate/${cert.id}/download`} style={{
                        color: 'var(--citadel-blue)',
                        textDecoration: 'none',
                        fontSize: 14
                      }}>
                        <Icon name="download" /> Download
                      </Link>
                      <Link to={`/certificate/${cert.id}/share`} style={{
                        color: 'var(--citadel-blue)',
                        textDecoration: 'none',
                        fontSize: 14
                      }}>
                        <Icon name="share alternate" /> Share
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {certificates.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: 40, 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8
            }}>
              <Icon name="info circle" style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
              <h3>No Certificates Yet</h3>
              <p>Complete courses to earn certificates that you can share on your Nostr profile.</p>
              <Link to="/courses" style={buttonStyle}>
                <Icon name="book" /> Browse Courses
              </Link>
            </div>
          )}
        </section>
      )}
      
      {/* Nostr Verification Tab */}
      {activeTab === 'nostr' && (
        <section style={sectionStyle}>
          <h3><Icon name="id badge" /> Nostr Verification</h3>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 24,
            marginTop: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: 'rgba(0, 83, 159, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 20
              }}>
                <Icon name="user" style={{ fontSize: 32 }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Your Nostr Identity</h3>
                <p style={{ margin: 0, fontSize: 14 }}>
                  <code>npub1abcdef123456789...</code>
                </p>
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: 8, 
              padding: 16,
              marginBottom: 24,
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Icon name="check circle" style={{ color: '#F59E0B', fontSize: 24, marginRight: 12 }} />
              <div>
                <strong>NIP-05 Verified:</strong> username@satnam.pub
              </div>
            </div>
            
            <h4>Your Achievements on Nostr</h4>
            <p>All your badges and certificates are published to your Nostr profile using NIP-58.</p>
            
            <div style={{ marginTop: 24 }}>
              <Link to="/members" style={buttonStyle}>
                <Icon name="lock" /> Access Members-Only Content
              </Link>
              <Link to="/dashboard/settings" style={{
                ...buttonStyle,
                background: 'transparent',
                border: '1px solid var(--citadel-blue)',
                marginLeft: 12
              }}>
                <Icon name="cog" /> Manage Nostr Settings
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app ? app.mobile : false
});

export default connect(mapState)(Achievements);