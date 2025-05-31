import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const FamilyProgress = ({ mobile }) => {
  const [activeFamily, setActiveFamily] = useState('satoshi');
  
  // Define styles
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

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--citadel-blue)',
    color: 'var(--citadel-white)',
    padding: '8px 16px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 16
  };

  const familyTabStyle = (active) => ({
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

  const memberCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  // Mock data for family groups
  const families = [
    {
      id: 'satoshi',
      name: 'Satoshi Family',
      role: 'Admin',
      members: [
        {
          id: 1,
          name: 'You',
          role: 'Parent/Admin',
          avatar: '👨‍👩‍👧‍👦',
          activeCourses: 3,
          completedCourses: 2,
          progress: 75
        },
        {
          id: 2,
          name: 'Sarah',
          role: 'Parent',
          avatar: '👩',
          activeCourses: 2,
          completedCourses: 1,
          progress: 60
        },
        {
          id: 3,
          name: 'Alex',
          role: 'Child (14)',
          avatar: '👦',
          activeCourses: 1,
          completedCourses: 0,
          progress: 40
        },
        {
          id: 4,
          name: 'Emma',
          role: 'Child (10)',
          avatar: '👧',
          activeCourses: 1,
          completedCourses: 0,
          progress: 25
        }
      ]
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin Study Group',
      role: 'Member',
      members: [
        {
          id: 5,
          name: 'You',
          role: 'Member',
          avatar: '👨‍👩‍👧‍👦',
          activeCourses: 1,
          completedCourses: 0,
          progress: 30
        },
        {
          id: 6,
          name: 'John',
          role: 'Admin',
          avatar: '👨',
          activeCourses: 2,
          completedCourses: 3,
          progress: 90
        },
        {
          id: 7,
          name: 'Maria',
          role: 'Member',
          avatar: '👩',
          activeCourses: 1,
          completedCourses: 1,
          progress: 50
        }
      ]
    }
  ];

  // Get active family data
  const currentFamily = families.find(f => f.id === activeFamily);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Family Progress</h2>
      
      {/* Family Selection Tabs */}
      <section style={sectionStyle}>
        <h3><Icon name="users" /> Your Family Groups</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 16 }}>
          {families.map(family => (
            <div 
              key={family.id} 
              style={familyTabStyle(activeFamily === family.id)}
              onClick={() => setActiveFamily(family.id)}
            >
              <span>{family.name}</span>
              <span style={{ 
                marginLeft: 8,
                background: family.role === 'Admin' ? '#F59E0B' : 'rgba(255, 255, 255, 0.2)',
                color: family.role === 'Admin' ? '#000' : '#fff',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 12
              }}>{family.role}</span>
            </div>
          ))}
          
          <Link to="/dashboard/add-family" style={{
            ...familyTabStyle(false),
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}>
            <Icon name="plus" style={{ marginRight: 8 }} />
            <span>Add New Family</span>
          </Link>
        </div>
      </section>
      
      {/* Family Members Progress */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3><Icon name="chart bar" /> {currentFamily.name} Progress</h3>
          <Link to="/n/family-hub" style={{
            color: 'var(--citadel-blue)',
            textDecoration: 'none',
            fontSize: 14
          }}>
            Manage Family Group <Icon name="arrow right" />
          </Link>
        </div>
        
        <div style={{ marginTop: 20 }}>
          {currentFamily.members.map(member => (
            <div key={member.id} style={memberCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    fontSize: 32, 
                    marginRight: 16,
                    width: 50,
                    height: 50,
                    background: 'rgba(0, 83, 159, 0.3)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {member.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, margin: '0 0 4px 0' }}>
                      {member.name}
                      {member.name === 'You' && (
                        <span style={{ 
                          marginLeft: 8,
                          fontSize: 12,
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>You</span>
                      )}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14 }}>{member.role}</p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    background: '#F59E0B', 
                    color: '#000', 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 12 
                  }}>{member.progress}% Overall</span>
                </div>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <div style={progressBarStyle}>
                  <div style={progressFillStyle(member.progress)}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>
                    <Icon name="book" /> {member.activeCourses} Active Courses
                  </span>
                  <span style={{ fontSize: 14 }}>
                    <Icon name="check circle" /> {member.completedCourses} Completed
                  </span>
                </div>
                
                {member.name === 'You' ? (
                  <Link to="/dashboard/courses" style={buttonStyle}>
                    <Icon name="arrow right" /> View My Courses
                  </Link>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Link to={`/dashboard/member/${member.id}`} style={buttonStyle}>
                      <Icon name="eye" /> View Progress
                    </Link>
                    <Link to={`/dashboard/recommend/${member.id}`} style={{
                      ...buttonStyle,
                      background: 'transparent',
                      border: '1px solid var(--citadel-blue)'
                    }}>
                      <Icon name="lightbulb" /> Recommend Course
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Family Learning Stats */}
      <section style={sectionStyle}>
        <h3><Icon name="chart line" /> Family Learning Stats</h3>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 20, 
          marginTop: 20 
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 20,
            flex: 1,
            minWidth: mobile ? '100%' : '200px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#F59E0B', marginBottom: 8 }}>
              7
            </div>
            <div>Total Active Courses</div>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 20,
            flex: 1,
            minWidth: mobile ? '100%' : '200px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#F59E0B', marginBottom: 8 }}>
              3
            </div>
            <div>Completed Courses</div>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 8, 
            padding: 20,
            flex: 1,
            minWidth: mobile ? '100%' : '200px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#F59E0B', marginBottom: 8 }}>
              12
            </div>
            <div>Badges Earned</div>
          </div>
        </div>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/dashboard/family-report" style={buttonStyle}>
            <Icon name="file alternate" /> Generate Family Progress Report
          </Link>
        </div>
      </section>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app ? app.mobile : false
});

export default connect(mapState)(FamilyProgress);