import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const CreateCourse = ({ mobile }) => {
  const [courseType, setCourseType] = useState('custom');
  const [ageGroup, setAgeGroup] = useState('all');
  const [difficulty, setDifficulty] = useState('beginner');
  
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

  const typeTabStyle = (active) => ({
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

  const templateCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Create Course</h2>
      
      <section style={sectionStyle}>
        <h3><Icon name="book" /> Create a Custom Course</h3>
        
        <div style={{ marginTop: 24 }}>
          <p>Create a custom learning path for your family or use one of our templates to get started quickly.</p>
          
          <div style={{ marginTop: 24 }}>
            <h4>Course Type</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 12 }}>
              <div 
                style={typeTabStyle(courseType === 'custom')}
                onClick={() => setCourseType('custom')}
              >
                <Icon name="pencil" /> Custom Course
              </div>
              <div 
                style={typeTabStyle(courseType === 'template')}
                onClick={() => setCourseType('template')}
              >
                <Icon name="copy" /> Use Template
              </div>
              <div 
                style={typeTabStyle(courseType === 'import')}
                onClick={() => setCourseType('import')}
              >
                <Icon name="upload" /> Import Content
              </div>
            </div>
          </div>
          
          {/* Custom Course Form */}
          {courseType === 'custom' && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginTop: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Custom Course Details</h4>
              
              <form style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Course Title</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    placeholder="Enter a title for your course"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
                  <textarea 
                    style={{
                      ...inputStyle,
                      height: 100,
                      resize: 'vertical'
                    }} 
                    placeholder="Describe what your course will teach"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Target Age Group</label>
                  <select 
                    style={inputStyle}
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                  >
                    <option value="all">All Ages</option>
                    <option value="0-6">Children (0-6 years)</option>
                    <option value="7-12">Children (7-12 years)</option>
                    <option value="13-17">Teenagers (13-17 years)</option>
                    <option value="adults">Adults (18+ years)</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Difficulty Level</label>
                  <select 
                    style={inputStyle}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Learning Objectives</label>
                  <textarea 
                    style={{
                      ...inputStyle,
                      height: 100,
                      resize: 'vertical'
                    }} 
                    placeholder="List the main things students will learn from this course"
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Course Privacy</label>
                  <select style={inputStyle}>
                    <option value="family">Family Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <button style={buttonStyle}>
                  <Icon name="arrow right" /> Continue to Course Builder
                </button>
              </form>
            </div>
          )}
          
          {/* Template Selection */}
          {courseType === 'template' && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginTop: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Choose a Template</h4>
              <p>Select a template as a starting point for your course.</p>
              
              <div style={{ marginTop: 24 }}>
                <div style={templateCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>Bitcoin for Kids (7-12)</h4>
                      <p style={{ margin: '0 0 8px 0' }}>A fun introduction to Bitcoin concepts for children.</p>
                      <div>
                        <span style={{ 
                          background: 'rgba(245, 158, 11, 0.2)', 
                          color: '#F59E0B', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12,
                          marginRight: 8
                        }}>Beginner</span>
                        <span style={{ 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12
                        }}>5 Modules</span>
                      </div>
                    </div>
                    <button style={buttonStyle}>
                      Use Template
                    </button>
                  </div>
                </div>
                
                <div style={templateCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>Family Bitcoin Security</h4>
                      <p style={{ margin: '0 0 8px 0' }}>Learn how to secure Bitcoin for the whole family.</p>
                      <div>
                        <span style={{ 
                          background: 'rgba(0, 83, 159, 0.2)', 
                          color: 'var(--citadel-blue)', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12,
                          marginRight: 8
                        }}>Intermediate</span>
                        <span style={{ 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12
                        }}>7 Modules</span>
                      </div>
                    </div>
                    <button style={buttonStyle}>
                      Use Template
                    </button>
                  </div>
                </div>
                
                <div style={templateCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>Bitcoin Inheritance Planning</h4>
                      <p style={{ margin: '0 0 8px 0' }}>Create a comprehensive inheritance plan for your Bitcoin.</p>
                      <div>
                        <span style={{ 
                          background: 'rgba(255, 100, 100, 0.2)', 
                          color: '#FF6464', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12,
                          marginRight: 8
                        }}>Advanced</span>
                        <span style={{ 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12
                        }}>6 Modules</span>
                      </div>
                    </div>
                    <button style={buttonStyle}>
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Import Content */}
          {courseType === 'import' && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              marginTop: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4>Import Course Content</h4>
              <p>Import content from external sources to create your course.</p>
              
              <form style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Import Method</label>
                  <select style={inputStyle}>
                    <option value="file">Upload Files</option>
                    <option value="url">Import from URL</option>
                    <option value="markdown">Markdown/Text</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>Upload Files</label>
                  <div style={{ 
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    padding: 24,
                    textAlign: 'center'
                  }}>
                    <Icon name="upload" style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }} />
                    <p>Drag and drop files here or click to browse</p>
                    <p style={{ fontSize: 12, opacity: 0.7 }}>Supported formats: PDF, DOCX, PPTX, MD, MP4, MP3</p>
                    <button style={{
                      ...buttonStyle,
                      background: 'transparent',
                      border: '1px solid var(--citadel-blue)'
                    }}>
                      Browse Files
                    </button>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: 8, 
                  padding: 16,
                  marginBottom: 16,
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Icon name="info circle" style={{ marginRight: 8 }} />
                  After importing, you'll be able to organize content into modules and lessons, add quizzes, and customize the course structure.
                </div>
                
                <button style={buttonStyle}>
                  <Icon name="arrow right" /> Continue to Course Builder
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
      
      <section style={sectionStyle}>
        <h3><Icon name="lightbulb" /> Course Creation Tips</h3>
        
        <div style={{ marginTop: 24 }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 20
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              flex: 1,
              minWidth: mobile ? '100%' : '200px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <Icon name="list" style={{ fontSize: 24, color: '#F59E0B', marginBottom: 12 }} />
              <h4>Structure Your Content</h4>
              <p>Organize your course into modules and lessons with clear learning objectives for each section.</p>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              flex: 1,
              minWidth: mobile ? '100%' : '200px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <Icon name="game" style={{ fontSize: 24, color: '#F59E0B', marginBottom: 12 }} />
              <h4>Make It Interactive</h4>
              <p>Include quizzes, activities, and exercises to keep learners engaged and reinforce concepts.</p>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, 
              padding: 20,
              flex: 1,
              minWidth: mobile ? '100%' : '200px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <Icon name="image" style={{ fontSize: 24, color: '#F59E0B', marginBottom: 12 }} />
              <h4>Use Visual Elements</h4>
              <p>Add images, videos, and diagrams to explain complex concepts in a more accessible way.</p>
            </div>
          </div>
          
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/dashboard/course-creation-guide" style={{
              ...buttonStyle,
              background: 'transparent',
              border: '1px solid var(--citadel-blue)'
            }}>
              <Icon name="book" /> View Complete Course Creation Guide
            </Link>
          </div>
        </div>
      </section>
      
      <section style={sectionStyle}>
        <h3><Icon name="question circle" /> Frequently Asked Questions</h3>
        
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h4>Who can see my custom courses?</h4>
            <p>By default, custom courses are only visible to your family group. You can choose to make them public if you want to share them with the community.</p>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <h4>Can I earn rewards for creating courses?</h4>
            <p>Yes! Public courses that receive positive feedback and completions from the community can earn you sats through our creator rewards program.</p>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <h4>What types of content can I include?</h4>
            <p>You can include text, images, videos, audio, quizzes, interactive exercises, and external links in your courses.</p>
          </div>
          
          <div>
            <h4>How do I track progress?</h4>
            <p>You can view detailed progress reports for all family members enrolled in your courses from the Family Progress dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const mapState = ({ app }) => ({
  mobile: app ? app.mobile : false
});

export default connect(mapState)(CreateCourse);