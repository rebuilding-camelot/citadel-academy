import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const AddFamilyMember = ({ mobile }) => {
  const [inviteMethod, setInviteMethod] = useState('email');
  const [relationship, setRelationship] = useState('parent');
  const [ageGroup, setAgeGroup] = useState('adult');
  
  // Define styles
  const sectionStyle = {
    background: 'rgba(42, 0, 102, 0.3)',
    padding: 24,
    borderRadius: 8,
    marginBottom: 30
  };

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

  const methodTabStyle = (active) => ({
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

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Add Family Member</h2>
      
      <section style={sectionStyle}>
        <h3><Icon name="user plus" /> Invite a Family Member</h3>
        
        <div style={{ marginTop: 24 }}>
          <p>Add a family member to your Citadel Academy account to track their progress and learn together.</p>
          
          <div style={{ marginTop: 24 }}>
            <h4>Invitation Method</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 12 }}>
              <div 
                style={methodTabStyle(inviteMethod === 'email')}
                onClick={() => setInviteMethod('email')}
              >
                <Icon name="mail" /> Email Invitation
              </div>
              <div 
                style={methodTabStyle(inviteMethod === 'nostr')}
                onClick={() => setInviteMethod('nostr')}
              >
                <Icon name="key" /> Nostr Verification
              </div>
              <div 
                style={methodTabStyle(inviteMethod === 'manual')}
                onClick={() => setInviteMethod('manual')}
              >
                <Icon name="pencil" /> Manual Setup
              </div>
            </div>
          </div>
          
          {/* Email Invitation Form */}
          {inviteMethod === 'email' && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginTop: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Email Invitation</h4>
              
              <form style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
                  <input 
                    type="email" 
                    style={inputStyle} 
                    placeholder="Enter family member's email"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Name</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    placeholder="Enter family member's name"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Relationship</label>
                  <select 
                    style={inputStyle}
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                  >
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="spouse">Spouse</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="other">Other Family Member</option>
                  </select>
                </div>
                
                {relationship === 'child' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>Age Group</label>
                    <select 
                      style={inputStyle}
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                    >
                      <option value="0-6">0-6 years</option>
                      <option value="7-12">7-12 years</option>
                      <option value="13-17">13-17 years</option>
                      <option value="adult">18+ years</option>
                    </select>
                  </div>
                )}
                
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
          )}
          
          {/* Nostr Verification Form */}
          {inviteMethod === 'nostr' && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginTop: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Nostr Verification</h4>
              <p>Invite a family member using their Nostr public key or NIP-05 identifier.</p>
              
              <form style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Nostr Public Key or NIP-05</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    placeholder="npub... or name@domain.com"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Relationship</label>
                  <select 
                    style={inputStyle}
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                  >
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="spouse">Spouse</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="other">Other Family Member</option>
                  </select>
                </div>
                
                {relationship === 'child' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>Age Group</label>
                    <select 
                      style={inputStyle}
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                    >
                      <option value="0-6">0-6 years</option>
                      <option value="7-12">7-12 years</option>
                      <option value="13-17">13-17 years</option>
                      <option value="adult">18+ years</option>
                    </select>
                  </div>
                )}
                
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: 8, 
                  padding: 16,
                  marginBottom: 16,
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Icon name="info circle" style={{ marginRight: 8 }} />
                  The invitation will be sent as a direct message to this Nostr account. They will need to accept it to join your family group.
                </div>
                
                <button style={buttonStyle}>
                  <Icon name="send" /> Send Nostr Invitation
                </button>
              </form>
            </div>
          )}
          
          {/* Manual Setup Form */}
          {inviteMethod === 'manual' && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginTop: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Manual Setup</h4>
              <p>Create an account for a family member that you'll manage yourself (ideal for younger children).</p>
              
              <form style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Name</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    placeholder="Enter family member's name"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Relationship</label>
                  <select 
                    style={inputStyle}
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                  >
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="spouse">Spouse</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="other">Other Family Member</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Age Group</label>
                  <select 
                    style={inputStyle}
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                  >
                    <option value="0-6">0-6 years</option>
                    <option value="7-12">7-12 years</option>
                    <option value="13-17">13-17 years</option>
                    <option value="adult">18+ years</option>
                  </select>
                </div>
                
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: 8, 
                  padding: 16,
                  marginBottom: 16,
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Icon name="info circle" style={{ marginRight: 8 }} />
                  You'll be able to manage this account, track progress, and assign courses. This is ideal for younger children who don't have their own email or Nostr account.
                </div>
                
                <button style={buttonStyle}>
                  <Icon name="plus" /> Create Family Member Account
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
      
      <section style={sectionStyle}>
        <h3><Icon name="users" /> Family Group Management</h3>
        
        <div style={{ marginTop: 24 }}>
          <p>You can also create or join a family group to manage all your family members in one place.</p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 20, 
            marginTop: 24 
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              flex: 1,
              minWidth: mobile ? '100%' : '200px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              textAlign: 'center'
            }}>
              <Icon name="plus circle" style={{ fontSize: 48, color: '#F59E0B', marginBottom: 16 }} />
              <h4>Create New Family Group</h4>
              <p>Start a new family group and invite members to join.</p>
              <Link to="/n/family-hub/create" style={buttonStyle}>
                Create Group
              </Link>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              flex: 1,
              minWidth: mobile ? '100%' : '200px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              textAlign: 'center'
            }}>
              <Icon name="sign in" style={{ fontSize: 48, color: '#F59E0B', marginBottom: 16 }} />
              <h4>Join Existing Group</h4>
              <p>Join a family group using an invitation code.</p>
              <Link to="/n/family-hub/join" style={buttonStyle}>
                Join Group
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section style={sectionStyle}>
        <h3><Icon name="question circle" /> Frequently Asked Questions</h3>
        
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h4>What is a family group?</h4>
            <p>A family group allows you to connect with family members on Citadel Academy, track their progress, and learn together.</p>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <h4>How many family members can I add?</h4>
            <p>You can add up to 10 family members to your account. For larger groups, please contact support.</p>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <h4>Can I add children without email addresses?</h4>
            <p>Yes, you can use the "Manual Setup" option to create managed accounts for younger children.</p>
          </div>
          
          <div>
            <h4>How does Nostr verification work?</h4>
            <p>Nostr verification uses the decentralized Nostr protocol to securely connect family members without requiring email addresses.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app ? app.mobile : false
});

export default connect(mapState)(AddFamilyMember);