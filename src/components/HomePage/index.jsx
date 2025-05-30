import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import HeroSection from '../HeroSection';

const HomePage = ({ mobile }) => {
  // Define styles using CSS variables from citadel-theme.css
  const sectionStyle = {
    background: 'rgba(42, 0, 102, 0.3)',
    padding: 24,
    borderRadius: 8,
    marginBottom: 30
  };

  const featureCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 24,
    flex: 1,
    minWidth: mobile ? '100%' : '250px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  const courseCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
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

  return (
    <div style={{
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: mobile ? '0 16px' : '0 60px',
        marginBottom: 60
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: 40,
          color: '#F59E0B'
        }}>
          Why Choose Citadel Academy
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 24,
          justifyContent: 'center'
        }}>
          <div style={featureCardStyle}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Icon name="users" style={{ fontSize: 36, color: '#F59E0B' }} />
            </div>
            <h3 style={{ textAlign: 'center' }}>Family-Focused Learning</h3>
            <p>
              Our curriculum is designed for all family members, with age-appropriate content for children, parents, and grandparents.
            </p>
          </div>
          
          <div style={featureCardStyle}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Icon name="shield" style={{ fontSize: 36, color: '#F59E0B' }} />
            </div>
            <h3 style={{ textAlign: 'center' }}>Self-Custody Education</h3>
            <p>
              Learn how to securely store and manage your family's Bitcoin without relying on third parties.
            </p>
          </div>
          
          <div style={featureCardStyle}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Icon name="bitcoin" style={{ fontSize: 36, color: '#F59E0B' }} />
            </div>
            <h3 style={{ textAlign: 'center' }}>Generational Wealth</h3>
            <p>
              Discover strategies for building and preserving wealth across multiple generations using Bitcoin.
            </p>
          </div>
        </div>
      </div>
      
      {/* Featured Courses Section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: mobile ? '0 16px' : '0 60px',
        marginBottom: 60
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: 40,
          color: '#F59E0B'
        }}>
          Featured Courses
        </h2>
        
        <div style={courseCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Intro to My First Bitcoin</h3>
                <span style={{ 
                  background: '#F59E0B', 
                  color: '#000', 
                  padding: '2px 8px', 
                  borderRadius: 4, 
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>FREE</span>
              </div>
              <p style={{ marginBottom: 16 }}>A beginner-friendly introduction to Bitcoin for all family members, including children.</p>
              
              <div style={{ marginBottom: 16 }}>
                <span style={{ marginRight: 16 }}><Icon name="clock" /> 5 Chapters</span>
                <span style={{ marginRight: 16 }}><Icon name="user" /> All Ages</span>
                <span><Icon name="star" /> Beginner</span>
              </div>
            </div>
            
            <div style={{ marginTop: mobile ? 16 : 0 }}>
              <Link to="/courses" style={buttonStyle}>
                <Icon name="play" /> Start Course
              </Link>
            </div>
          </div>
        </div>
        
        <div style={courseCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ color: '#F59E0B', marginTop: 0, marginBottom: 0, marginRight: 12 }}>Bitcoin for Families</h3>
                <span style={{ 
                  background: '#F59E0B', 
                  color: '#000', 
                  padding: '2px 8px', 
                  borderRadius: 4, 
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>FREE</span>
              </div>
              <p style={{ marginBottom: 16 }}>Learn how to integrate Bitcoin into your family's financial planning and education.</p>
              
              <div style={{ marginBottom: 16 }}>
                <span style={{ marginRight: 16 }}><Icon name="clock" /> 5 Modules</span>
                <span style={{ marginRight: 16 }}><Icon name="user" /> Parents</span>
                <span><Icon name="star" /> Intermediate</span>
              </div>
            </div>
            
            <div style={{ marginTop: mobile ? 16 : 0 }}>
              <Link to="/courses" style={buttonStyle}>
                <Icon name="play" /> Start Course
              </Link>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Link to="/courses" style={{
            ...buttonStyle,
            padding: '12px 24px',
            fontSize: 16
          }}>
            <Icon name="book" /> View All Courses
          </Link>
        </div>
      </div>
      
      {/* Family Hub Section */}
      <div style={{
        background: 'rgba(0, 83, 159, 0.3)',
        padding: mobile ? '40px 16px' : '60px 0',
        marginBottom: 60
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: mobile ? '0' : '0 60px',
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: mobile ? 'column' : 'row',
            alignItems: 'center',
            gap: 40
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#F59E0B', marginBottom: 16 }}>Create Your Family Learning Pod</h2>
              <p style={{ fontSize: 16, marginBottom: 24 }}>
                Connect with your family members in a private learning environment. Track progress, share resources, and learn together.
              </p>
              <ul style={{ marginBottom: 24 }}>
                <li style={{ marginBottom: 8 }}>Invite family members of all ages</li>
                <li style={{ marginBottom: 8 }}>Track everyone's learning progress</li>
                <li style={{ marginBottom: 8 }}>Share resources and discussions</li>
                <li style={{ marginBottom: 8 }}>Coordinate family Bitcoin activities</li>
              </ul>
              <Link to="/n/family-hub" style={{
                ...buttonStyle,
                background: '#F59E0B',
                color: '#000',
                padding: '12px 24px',
                fontSize: 16
              }}>
                <Icon name="users" /> Create Family Pod
              </Link>
            </div>
            
            <div style={{ 
              flex: 1, 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8,
              padding: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Icon name="users" style={{ fontSize: 48, color: '#F59E0B' }} />
              </div>
              <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Family Learning Pod</h3>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 8,
                padding: 16,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="user circle" style={{ fontSize: 24, marginRight: 12 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Parent</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Admin • 3 courses in progress</div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 8,
                padding: 16,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="user circle" style={{ fontSize: 24, marginRight: 12 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Child</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Member • 1 course in progress</div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 8,
                padding: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="user circle" style={{ fontSize: 24, marginRight: 12 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Grandparent</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Member • 2 courses in progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: mobile ? '0 16px 40px' : '0 60px 60px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 0, 102, 0.9) 0%, rgba(0, 83, 159, 0.8) 100%)',
          borderRadius: 12,
          padding: mobile ? '30px 20px' : '40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80") center/cover no-repeat',
            opacity: 0.1,
            zIndex: -1
          }}></div>
          
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Start Your Family's Bitcoin Journey Today</h2>
          <p style={{ fontSize: 16, marginBottom: 24, maxWidth: 700, margin: '0 auto 24px' }}>
            Join thousands of families building their Bitcoin citadels through education, community, and practical tools.
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <Link to="/register" style={{
              display: 'inline-block',
              background: '#F59E0B',
              color: '#000',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              <Icon name="user plus" /> Join Free
            </Link>
            
            <Link to="/courses" style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              <Icon name="book" /> Browse Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default connect(mapState)(HomePage);