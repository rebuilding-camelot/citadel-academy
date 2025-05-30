import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const AboutPage = ({ mobile }) => {
  // Define styles using CSS variables from citadel-theme.css
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
    marginTop: 16
  };

  const valueCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 20,
    flex: 1,
    minWidth: mobile ? '100%' : '200px'
  };

  return (
    <div style={{
      padding: mobile ? '20px 16px' : '40px 60px',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#F59E0B', marginBottom: 30 }}>About Citadel Academy</h1>
      
      {/* Mission & Vision Section */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '30px' }}>
          <div style={{ flex: 1 }}>
            <h2><Icon name="compass" /> Our Mission</h2>
            <p>
              Citadel Academy is dedicated to empowering families with the knowledge and tools they need to build 
              generational wealth and sovereignty through Bitcoin education. We believe that financial literacy 
              and Bitcoin understanding are essential skills for the modern family looking to preserve their legacy.
            </p>
            <p>
              By focusing on multi-generational learning, we create educational experiences that bring families 
              together around Bitcoin, fostering both technical understanding and values-based discussions about 
              money, savings, and long-term planning.
            </p>
          </div>
          
          <div style={{ flex: 1 }}>
            <h2><Icon name="eye" /> Our Vision</h2>
            <p>
              We envision a world where families are equipped with the knowledge to navigate the evolving financial 
              landscape, where children grow up understanding sound money principles, and where multi-generational 
              wealth preservation becomes the norm rather than the exception.
            </p>
            <p>
              Through our family-focused curriculum, community-driven learning environments, and practical tools, 
              we aim to be the premier educational platform for families building their Bitcoin citadels.
            </p>
          </div>
        </div>
      </section>
      
      {/* Core Values Section */}
      <section style={sectionStyle}>
        <h2><Icon name="heart" /> Core Values</h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 20, 
          marginTop: 24,
          justifyContent: 'space-between'
        }}>
          <div style={valueCardStyle}>
            <h3 style={{ color: '#F59E0B' }}><Icon name="users" /> Family First</h3>
            <p>We design all our educational content with families in mind, creating resources that work for all generations.</p>
          </div>
          
          <div style={valueCardStyle}>
            <h3 style={{ color: '#F59E0B' }}><Icon name="key" /> Sovereignty</h3>
            <p>We promote self-custody and personal responsibility as core principles for family financial independence.</p>
          </div>
          
          <div style={valueCardStyle}>
            <h3 style={{ color: '#F59E0B' }}><Icon name="universal access" /> Accessibility</h3>
            <p>We make complex Bitcoin concepts understandable for all ages, from children to grandparents.</p>
          </div>
          
          <div style={valueCardStyle}>
            <h3 style={{ color: '#F59E0B' }}><Icon name="handshake" /> Community</h3>
            <p>We foster a supportive environment for families on similar journeys to learn and grow together.</p>
          </div>
          
          <div style={valueCardStyle}>
            <h3 style={{ color: '#F59E0B' }}><Icon name="clock" /> Long-term Thinking</h3>
            <p>We emphasize generational wealth planning over short-term gains, focusing on legacy building.</p>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section style={sectionStyle}>
        <h2><Icon name="group" /> Our Team</h2>
        
        <p style={{ marginBottom: 24 }}>
          Citadel Academy was founded by a team of Bitcoin educators, family financial advisors, and 
          developers passionate about helping families secure their financial future through Bitcoin education.
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: mobile ? 'column' : 'row',
          gap: 30,
          marginTop: 24
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 24,
            flex: 1
          }}>
            <h3 style={{ color: '#F59E0B', marginTop: 0 }}>Join Our Community</h3>
            <p>
              Connect with other families on their Bitcoin journey. Share experiences, ask questions, 
              and learn together in our Nostr-powered community spaces.
            </p>
            <Link to="/n/family-hub" style={buttonStyle}>
              <Icon name="users" /> Family Hub
            </Link>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 24,
            flex: 1
          }}>
            <h3 style={{ color: '#F59E0B', marginTop: 0 }}>Start Your Journey</h3>
            <p>
              Ready to begin your family's Bitcoin education? Our structured courses make it easy 
              to learn at your own pace and involve all family members.
            </p>
            <Link to="/courses" style={buttonStyle}>
              <Icon name="book" /> Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app.mobile
});

export default connect(mapState)(AboutPage);