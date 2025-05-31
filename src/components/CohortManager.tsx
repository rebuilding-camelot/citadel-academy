import React, { useState, useEffect } from 'react';
import { Event, getEventHash } from 'nostr-tools';
import { CourseCohort, createCohortCommunity, joinCohort, publishEvent } from '../lib/communities';
import { CohortChat } from './CohortChat';
import { fetchStudentProgress, parseProgressEvent, StudentProgress } from '../lib/progress';
import './CohortManager.css';

interface CohortManagerProps {
  courseId: string;
  instructorPubkey: string;
  instructorPrivateKey?: string; // Optional: if not provided, will use NIP-07 extension
}

interface StudentWithProgress {
  pubkey: string;
  progress?: StudentProgress;
}

export function CohortManager({ courseId, instructorPubkey, instructorPrivateKey }: CohortManagerProps) {
  const [cohorts, setCohorts] = useState<CourseCohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [showNewCohortForm, setShowNewCohortForm] = useState(false);
  const [newCohort, setNewCohort] = useState<Partial<CourseCohort>>({
    courseId,
    instructorPubkey,
    maxStudents: 20
  });
  const [students, setStudents] = useState<Record<string, StudentWithProgress[]>>({});
  const [newStudentPubkey, setNewStudentPubkey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProgressView, setShowProgressView] = useState(false);

  // Fetch existing cohorts on component mount
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        // In a real implementation, you would fetch cohorts from Nostr relays
        // For now, we'll use mock data
        const mockCohorts: CourseCohort[] = [
          {
            cohortId: `${courseId}-cohort1`,
            name: 'Bitcoin Basics - Spring 2023',
            courseId,
            instructorPubkey,
            startDate: new Date('2023-03-01'),
            endDate: new Date('2023-06-01'),
            maxStudents: 25
          }
        ];
        
        setCohorts(mockCohorts);
        
        // Mock student data with empty progress initially
        const mockStudentPubkeys = [
          '7f3b5cecb8a0ec0a756e8e5a3b9d9911a5d9edd0af3f43e5698a0d9a03bbf9c3',
          '9e2e84d5a1c9deb85c66b6ebad7f7944b21a5a8a0f3f43e5698a0d9a03bbf9c3'
        ];
        
        const studentsWithProgress: Record<string, StudentWithProgress[]> = {
          [`${courseId}-cohort1`]: mockStudentPubkeys.map(pubkey => ({ pubkey }))
        };
        
        setStudents(studentsWithProgress);
        
        if (mockCohorts.length > 0) {
          setSelectedCohort(mockCohorts[0].cohortId);
        }
      } catch (error) {
        console.error('Error fetching cohorts:', error);
        setError('Failed to load cohorts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, [courseId, instructorPubkey]);

  // Fetch progress data for students when a cohort is selected
  useEffect(() => {
    if (!selectedCohort || !students[selectedCohort]) return;
    
    const fetchStudentProgressData = async () => {
      try {
        const updatedStudents = [...students[selectedCohort]];
        
        // Fetch progress for each student
        for (let i = 0; i < updatedStudents.length; i++) {
          const student = updatedStudents[i];
          const progressEvents = await fetchStudentProgress(student.pubkey, courseId);
          
          if (progressEvents.length > 0) {
            // Get the most recent progress event
            const latestEvent = progressEvents.reduce((latest, event) => 
              event.created_at > latest.created_at ? event : latest
            );
            
            updatedStudents[i] = {
              ...student,
              progress: parseProgressEvent(latestEvent)
            };
          }
        }
        
        setStudents({
          ...students,
          [selectedCohort]: updatedStudents
        });
        
      } catch (error) {
        console.error('Error fetching student progress:', error);
      }
    };
    
    fetchStudentProgressData();
  }, [selectedCohort, courseId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCohort({
      ...newCohort,
      [name]: name === 'maxStudents' ? parseInt(value) : value
    });
  };

  // Handle date input changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCohort({
      ...newCohort,
      [name]: new Date(value)
    });
  };

  // Create a new cohort
  const createCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCohort.name || !newCohort.startDate || !newCohort.endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate a unique cohort ID
      const cohortId = `${courseId}-${Date.now()}`;
      
      const cohort: CourseCohort = {
        cohortId,
        name: newCohort.name!,
        courseId,
        instructorPubkey,
        startDate: newCohort.startDate!,
        endDate: newCohort.endDate!,
        maxStudents: newCohort.maxStudents || 20
      };
      
      // Create and publish the cohort community event
      let communityEvent: Event;
      
      if (instructorPrivateKey) {
        // Use provided private key
        communityEvent = createCohortCommunity(cohort, instructorPrivateKey);
      } else if (window.nostr) {
        // Use NIP-07 extension
        const unsignedEvent = createCohortCommunity(cohort, '');
        // Get the signature from NIP-07
        const signedData = await window.nostr.signEvent(unsignedEvent as any);
        // Get the public key
        unsignedEvent.pubkey = await window.nostr.getPublicKey();
        // Add the signature
        unsignedEvent.sig = signedData.sig;
        // Calculate the event ID
        unsignedEvent.id = getEventHash(unsignedEvent);
        communityEvent = unsignedEvent;
      } else {
        throw new Error('No signing method available');
      }
      
      // Publish to relays
      await publishEvent(communityEvent);
      
      // Add to local state
      setCohorts([...cohorts, cohort]);
      setSelectedCohort(cohortId);
      setStudents({
        ...students,
        [cohortId]: []
      });
      
      // Reset form
      setNewCohort({
        courseId,
        instructorPubkey,
        maxStudents: 20
      });
      setShowNewCohortForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating cohort:', error);
      setError('Failed to create cohort. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a student to the cohort
  const addStudent = async () => {
    if (!selectedCohort || !newStudentPubkey.trim()) return;
    
    try {
      setLoading(true);
      
      // Create and publish the join event
      let joinEvent: Event;
      
      if (instructorPrivateKey) {
        // Use provided private key
        joinEvent = joinCohort(selectedCohort, newStudentPubkey, instructorPrivateKey);
      } else if (window.nostr) {
        // Use NIP-07 extension
        const unsignedEvent = joinCohort(selectedCohort, newStudentPubkey, '');
        // Get the signature from NIP-07
        const signedData = await window.nostr.signEvent(unsignedEvent as any);
        // Get the public key
        unsignedEvent.pubkey = await window.nostr.getPublicKey();
        // Add the signature
        unsignedEvent.sig = signedData.sig;
        // Calculate the event ID
        unsignedEvent.id = getEventHash(unsignedEvent);
        joinEvent = unsignedEvent;
      } else {
        throw new Error('No signing method available');
      }
      
      // Publish to relays
      await publishEvent(joinEvent);
      
      // Update local state
      setStudents({
        ...students,
        [selectedCohort]: [...(students[selectedCohort] || []), { pubkey: newStudentPubkey }]
      });
      
      // Reset input
      setNewStudentPubkey('');
      setError(null);
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  // Format pubkey for display
  const formatPubkey = (pubkey: string): string => {
    return `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`;
  };

  // Toggle between student list and progress view
  const toggleProgressView = () => {
    setShowProgressView(!showProgressView);
  };

  if (loading && cohorts.length === 0) {
    return <div className="loading">Loading cohorts...</div>;
  }

  return (
    <div className="cohort-manager">
      {error && <div className="error-message">{error}</div>}
      
      <div className="cohort-header">
        <h2>Course Cohorts</h2>
        <button 
          className="new-cohort-button"
          onClick={() => setShowNewCohortForm(!showNewCohortForm)}
        >
          {showNewCohortForm ? 'Cancel' : 'New Cohort'}
        </button>
      </div>
      
      {showNewCohortForm && (
        <div className="new-cohort-form">
          <h3>Create New Cohort</h3>
          <form onSubmit={createCohort}>
            <div className="form-group">
              <label htmlFor="name">Cohort Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCohort.name || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={newCohort.startDate ? newCohort.startDate.toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newCohort.endDate ? newCohort.endDate.toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="maxStudents">Max Students:</label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={newCohort.maxStudents || 20}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Cohort'}
            </button>
          </form>
        </div>
      )}
      
      {cohorts.length === 0 ? (
        <div className="no-cohorts">
          No cohorts available. Create a new cohort to get started.
        </div>
      ) : (
        <div className="cohort-content">
          <div className="cohort-list">
            <h3>Available Cohorts</h3>
            <ul>
              {cohorts.map(cohort => (
                <li 
                  key={cohort.cohortId}
                  className={selectedCohort === cohort.cohortId ? 'selected' : ''}
                  onClick={() => setSelectedCohort(cohort.cohortId)}
                >
                  <div className="cohort-name">{cohort.name}</div>
                  <div className="cohort-dates">
                    {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
                  </div>
                  <div className="cohort-students">
                    {students[cohort.cohortId]?.length || 0} / {cohort.maxStudents} students
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {selectedCohort && (
            <div className="cohort-details">
              <div className="cohort-info">
                <h3>{cohorts.find(c => c.cohortId === selectedCohort)?.name}</h3>
                
                <div className="view-toggle">
                  <button 
                    className={!showProgressView ? 'active' : ''}
                    onClick={() => setShowProgressView(false)}
                  >
                    Students
                  </button>
                  <button 
                    className={showProgressView ? 'active' : ''}
                    onClick={() => setShowProgressView(true)}
                  >
                    Progress
                  </button>
                </div>
                
                {!showProgressView ? (
                  <div className="student-management">
                    <h4>Students</h4>
                    
                    <div className="add-student">
                      <input
                        type="text"
                        placeholder="Student pubkey (hex format)"
                        value={newStudentPubkey}
                        onChange={(e) => setNewStudentPubkey(e.target.value)}
                      />
                      <button onClick={addStudent} disabled={loading || !newStudentPubkey.trim()}>
                        Add Student
                      </button>
                    </div>
                    
                    <ul className="student-list">
                      {students[selectedCohort]?.length > 0 ? (
                        students[selectedCohort].map((student, index) => (
                          <li key={index}>
                            {formatPubkey(student.pubkey)}
                          </li>
                        ))
                      ) : (
                        <li className="no-students">No students enrolled yet</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="progress-management">
                    <h4>Student Progress</h4>
                    
                    {students[selectedCohort]?.length > 0 ? (
                      <div className="progress-table">
                        <div className="progress-header">
                          <div className="progress-cell">Student</div>
                          <div className="progress-cell">Progress</div>
                          <div className="progress-cell">Current Lesson</div>
                          <div className="progress-cell">Time Spent</div>
                          <div className="progress-cell">Last Active</div>
                        </div>
                        
                        {students[selectedCohort].map((student, index) => (
                          <div className="progress-row" key={index}>
                            <div className="progress-cell">{formatPubkey(student.pubkey)}</div>
                            <div className="progress-cell">
                              {student.progress ? (
                                <div className="mini-progress-bar">
                                  <div 
                                    className="mini-progress-fill"
                                    style={{ width: `${student.progress.progressPercentage}%` }}
                                  />
                                  <span>{student.progress.progressPercentage}%</span>
                                </div>
                              ) : (
                                'No data'
                              )}
                            </div>
                            <div className="progress-cell">
                              {student.progress?.currentLesson || 'Not started'}
                            </div>
                            <div className="progress-cell">
                              {student.progress ? (
                                `${Math.floor(student.progress.timeSpent / 60)}h ${student.progress.timeSpent % 60}m`
                              ) : (
                                '0h 0m'
                              )}
                            </div>
                            <div className="progress-cell">
                              {student.progress?.lastAccessed.toLocaleDateString() || 'Never'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-students">No students enrolled yet</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="cohort-chat-container">
                <CohortChat 
                  cohortId={selectedCohort} 
                  userPrivateKey={instructorPrivateKey}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add TypeScript declarations for NIP-07 window extensions
// Using the Window interface from @nostr-dev-kit/ndk