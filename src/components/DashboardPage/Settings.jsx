import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Settings = ({ mobile }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSettings, setNotificationSettings] = useState({
    courseUpdates: true,
    familyActivity: true,
    achievements: true,
    zapNotifications: true,
    emailDigest: false
  });
  
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

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 16,
    border: 'none',
    cursor: 'pointer'
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    padding: '8px 12px',
    color: '#fff',
    width: '100%',
    marginBottom: 16
  };

  const toggleStyle = (enabled) => ({
    width: 50,
    height: 24,
    background: enabled ? 'var(--citadel-blue)' : 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  });

  const toggleKnobStyle = (enabled) => ({
    width: 20,
    height: 20,
    background: '#fff',
    borderRadius: '50%',
    position: 'absolute',
    top: 2,
    left: enabled ? 28 : 2,
    transition: 'left 0.2s ease'
  });

  // Toggle notification setting
  const toggleNotification = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };

  // Mock user profile data
  const userProfile = {
    name: 'Alex Satoshi',
    email: 'alex@example.com',
    nostrPubkey: 'npub1abcdef123456789...',
    nip05: 'alex@satnam.pub'
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Settings</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
        <div 
          style={tabStyle(activeTab === 'profile')}
          onClick={() => setActiveTab('profile')}
        >
          <Icon name="user" /> Profile
        </div>
        <div 
          style={tabStyle(activeTab === 'notifications')}
          onClick={() => setActiveTab('notifications')}
        >
          <Icon name="bell" /> Notifications
        </div>
        <div 
          style={tabStyle(activeTab === 'family')}
          onClick={() => setActiveTab('family')}
        >
          <Icon name="users" /> Family Invites
        </div>
        <div 
          style={tabStyle(activeTab === 'nostr')}
          onClick={() => setActiveTab('nostr')}
        >
          <Icon name="key" /> Nostr Settings
        </div>
      </div>
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <section style={sectionStyle}>
          <h3><Icon name="user" /> Profile Settings</h3>
          
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'rgba(0, 83, 159, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 24
              }}>
                <Icon name="user" style={{ fontSize: 40 }} />
              </div>
              <button style={{
                ...buttonStyle,
                marginTop: 0,
                background: 'transparent',
                border: '1px solid var(--citadel-blue)'
              }}>
                <Icon name="upload" /> Change Avatar
              </button>
            </div>
            
            <form>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>Display Name</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  defaultValue={userProfile.name}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
                <input 
                  type="email" 
                  style={inputStyle} 
                  defaultValue={userProfile.email}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>Bio</label>
                <textarea 
                  style={{
                    ...inputStyle,
                    height: 100,
                    resize: 'vertical'
                  }} 
                  defaultValue="Bitcoin enthusiast and family education advocate. Learning and teaching about Bitcoin with my family."
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>Location</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  defaultValue="Bitcoin Beach, El Salvador"
                />
              </div>
              
              <button style={buttonStyle}>
                <Icon name="save" /> Save Profile
              </button>
            </form>
          </div>
        </section>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <section style={sectionStyle}>
          <h3><Icon name="bell" /> Notification Settings</h3>
          
          <div style={{ marginTop: 24 }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginBottom: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Course Updates</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>Notifications about new lessons and course updates</p>
                </div>
                <div 
                  style={toggleStyle(notificationSettings.courseUpdates)}
                  onClick={() => toggleNotification('courseUpdates')}
                >
                  <div style={toggleKnobStyle(notificationSettings.courseUpdates)} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Family Activity</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>Notifications about your family members' progress</p>
                </div>
                <div 
                  style={toggleStyle(notificationSettings.familyActivity)}
                  onClick={() => toggleNotification('familyActivity')}
                >
                  <div style={toggleKnobStyle(notificationSettings.familyActivity)} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Achievements</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>Notifications about new badges and certificates</p>
                </div>
                <div 
                  style={toggleStyle(notificationSettings.achievements)}
                  onClick={() => toggleNotification('achievements')}
                >
                  <div style={toggleKnobStyle(notificationSettings.achievements)} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Zap Notifications</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>Notifications when you receive zaps on your content</p>
                </div>
                <div 
                  style={toggleStyle(notificationSettings.zapNotifications)}
                  onClick={() => toggleNotification('zapNotifications')}
                >
                  <div style={toggleKnobStyle(notificationSettings.zapNotifications)} />
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Email Digest</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>Weekly email summary of your family's progress</p>
                </div>
                <div 
                  style={toggleStyle(notificationSettings.emailDigest)}
                  onClick={() => toggleNotification('emailDigest')}
                >
                  <div style={toggleKnobStyle(notificationSettings.emailDigest)} />
                </div>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>Email Frequency</label>
                <select style={inputStyle}>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <button style={{...buttonStyle, marginTop: 24}}>
              <Icon name="save" /> Save Notification Settings
            </button>
          </div>
        </section>
      )}
      
      {/* Family Invites Tab */}
      {activeTab === 'family' && (
        <section style={sectionStyle}>
          <h3><Icon name="users" /> Family Invites</h3>
          
          <div style={{ marginTop: 24 }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginBottom: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Pending Invites</h4>
              
              <div style={{ 
                padding: 16, 
                borderRadius: 8, 
                background: 'rgba(245, 158, 11, 0.1)',
                marginTop: 16,
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>Invite for: sarah@example.com</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Sent on: May 10, 2023</p>
                  </div>
                  <div>
                    <button style={{
                      ...buttonStyle,
                      marginTop: 0,
                      background: 'transparent',
                      border: '1px solid var(--citadel-blue)',
                      padding: '6px 12px',
                      fontSize: 12
                    }}>
                      <Icon name="redo" /> Resend
                    </button>
                    <button style={{
                      ...buttonStyle,
                      marginTop: 0,
                      background: 'transparent',
                      border: '1px solid #FF6464',
                      padding: '6px 12px',
                      fontSize: 12,
                      color: '#FF6464',
                      marginLeft: 8
                    }}>
                      <Icon name="trash" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                padding: 16, 
                borderRadius: 8, 
                background: 'rgba(245, 158, 11, 0.1)',
                marginTop: 16,
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>Invite for: john@example.com</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Sent on: May 8, 2023</p>
                  </div>
                  <div>
                    <button style={{
                      ...buttonStyle,
                      marginTop: 0,
                      background: 'transparent',
                      border: '1px solid var(--citadel-blue)',
                      padding: '6px 12px',
                      fontSize: 12
                    }}>
                      <Icon name="redo" /> Resend
                    </button>
                    <button style={{
                      ...buttonStyle,
                      marginTop: 0,
                      background: 'transparent',
                      border: '1px solid #FF6464',
                      padding: '6px 12px',
                      fontSize: 12,
                      color: '#FF6464',
                      marginLeft: 8
                    }}>
                      <Icon name="trash" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Invite a Family Member</h4>
              
              <form style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
                  <input 
                    type="email" 
                    style={inputStyle} 
                    placeholder="Enter email address"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Relationship</label>
                  <select style={inputStyle}>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other Family Member</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Personal Message</label>
                  <textarea 
                    style={{
                      ...inputStyle,
                      height: 100,
                      resize: 'vertical'
                    }} 
                    placeholder="Add a personal message to your invitation"
                    defaultValue="I'd like to invite you to join our family group on Citadel Academy to learn about Bitcoin together!"
                  />
                </div>
                
                <button style={buttonStyle}>
                  <Icon name="send" /> Send Invitation
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
      
      {/* Nostr Settings Tab */}
      {activeTab === 'nostr' && (
        <section style={sectionStyle}>
          <h3><Icon name="key" /> Nostr Settings</h3>
          
          <div style={{ marginTop: 24 }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginBottom: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Your Nostr Identity</h4>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Public Key</label>
                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.2)', 
                    padding: 12, 
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {userProfile.nostrPubkey}
                  </div>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>NIP-05 Identifier</label>
                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.2)', 
                    padding: 12, 
                    borderRadius: 4,
                    fontFamily: 'monospace'
                  }}>
                    {userProfile.nip05}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: 8, 
                  padding: 16,
                  marginTop: 16,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon name="check circle" style={{ color: '#F59E0B', fontSize: 24, marginRight: 12 }} />
                  <div>
                    <strong>NIP-05 Verified</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: 14 }}>Your Nostr identity has been verified</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginBottom: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Nostr Relays</h4>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  padding: 12, 
                  borderRadius: 4,
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code>wss://relay.nostr.band</code>
                    <span style={{ 
                      background: '#00C853', 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      fontSize: 12 
                    }}>Connected</span>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  padding: 12, 
                  borderRadius: 4,
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code>wss://relay.damus.io</code>
                    <span style={{ 
                      background: '#00C853', 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      fontSize: 12 
                    }}>Connected</span>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  padding: 12, 
                  borderRadius: 4
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code>wss://nos.lol</code>
                    <span style={{ 
                      background: '#FF6464', 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      fontSize: 12 
                    }}>Disconnected</span>
                  </div>
                </div>
                
                <div style={{ marginTop: 16 }}>
                  <button style={{
                    ...buttonStyle,
                    background: 'transparent',
                    border: '1px solid var(--citadel-blue)'
                  }}>
                    <Icon name="plus" /> Add Relay
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Privacy Settings</h4>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>Share Achievements on Nostr</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Publish your badges and certificates to your Nostr profile</p>
                  </div>
                  <div 
                    style={toggleStyle(true)}
                    onClick={() => {}}
                  >
                    <div style={toggleKnobStyle(true)} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>Share Course Progress</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Share your course progress with your family group</p>
                  </div>
                  <div 
                    style={toggleStyle(true)}
                    onClick={() => {}}
                  >
                    <div style={toggleKnobStyle(true)} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>Public Profile</h4>
                    <p style={{ margin: 0, fontSize: 14 }}>Make your profile visible to other Citadel Academy users</p>
                  </div>
                  <div 
                    style={toggleStyle(true)}
                    onClick={() => {}}
                  >
                    <div style={toggleKnobStyle(true)} />
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button style={buttonStyle}>
                <Icon name="save" /> Save Nostr Settings
              </button>
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

export default connect(mapState)(Settings);