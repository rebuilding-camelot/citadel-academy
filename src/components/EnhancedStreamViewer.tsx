// File: components/EnhancedStreamViewer.tsx
// Prompt: "Add screen share viewing and teacher controls to stream viewer"
import React, { useState, useEffect, useRef, KeyboardEvent, SyntheticEvent } from 'react';
import { Event as NostrEvent } from 'nostr-tools';
import '../styles/EnhancedStreamViewer.css';
import '../styles/enhanced-stream.css';

// Import window type definitions
import '../types/window';

interface EnhancedStreamViewerProps {
  streamEvent: NostrEvent;
  userPubkey?: string;
  isTeacher?: boolean;
}

export const EnhancedStreamViewer: React.FC<EnhancedStreamViewerProps> = ({
  streamEvent,
  userPubkey,
  isTeacher = false
}) => {
  const [viewMode, setViewMode] = useState<'screen' | 'camera' | 'pip'>('screen');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [nostrClientAvailable, setNostrClientAvailable] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mainVideoAutoplayFailed, setMainVideoAutoplayFailed] = useState(false);
  const [pipVideoAutoplayFailed, setPipVideoAutoplayFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted to increase autoplay success
  const [annotationInput, setAnnotationInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    callback: ((text: string) => void) | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    callback: null
  });
  
  // Refs for video elements
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  
  const streamType = streamEvent.tags.find(tag => tag[0] === 'stream_type')?.[1] || 'camera';
  const hasScreenShare = streamEvent.tags.find(tag => tag[0] === 'has_screen_share')?.[1] === 'true';
  const streamingUrl = streamEvent.tags.find(tag => tag[0] === 'streaming')?.[1];
  
  // Check if nostrClient is available
  useEffect(() => {
    const checkNostrClient = () => {
      if (window.nostrClient) {
        setNostrClientAvailable(true);
      } else {
        console.warn('Nostr client not available. Some features may be limited.');
        setNostrClientAvailable(false);
      }
    };
    
    checkNostrClient();
    
    // Check again after a short delay in case it's loaded asynchronously
    const timer = setTimeout(checkNostrClient, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Clean up screen stream when component unmounts
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);
  
  // Update mute state when it changes
  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = isMuted;
    }
    if (pipVideoRef.current) {
      // PIP is always muted regardless of the main mute state
      pipVideoRef.current.muted = true;
    }
  }, [isMuted]);

  // Apply screen stream to video element when available
  useEffect(() => {
    if (mainVideoRef.current) {
      // First, clear any existing sources to prevent conflicts
      mainVideoRef.current.pause();
      mainVideoRef.current.srcObject = null;
      mainVideoRef.current.src = '';
      mainVideoRef.current.muted = isMuted;
      
      // Handle screen sharing mode
      if (isScreenSharing && screenStream && viewMode !== 'camera') {
        console.log('Setting screen share stream to video element');
        // When screen sharing and in screen or pip mode, use the screen stream
        mainVideoRef.current.srcObject = screenStream;
        
        // In PIP mode, also set up the PIP video with the camera stream
        if (viewMode === 'pip' && pipVideoRef.current) {
          pipVideoRef.current.srcObject = null; // Clear any existing source
          pipVideoRef.current.src = streamingUrl || '';
          pipVideoRef.current.muted = true; // PIP always muted
          setPipVideoAutoplayFailed(false);
          
          // Try to play the PIP video
          pipVideoRef.current.play().catch(error => {
            console.warn('PIP autoplay prevented:', error);
            setPipVideoAutoplayFailed(true);
          });
        }
      } else {
        // When not screen sharing or in camera mode, use the streaming URL
        mainVideoRef.current.src = streamingUrl || '';
      }
      
      // Reset autoplay failure state when source changes
      setMainVideoAutoplayFailed(false);
      
      // Try to play the main video
      mainVideoRef.current.play().catch(error => {
        console.warn('Autoplay prevented:', error);
        setMainVideoAutoplayFailed(true);
      });
    }
  }, [isScreenSharing, screenStream, viewMode, streamingUrl, isMuted]);

  const toggleScreenShare = async () => {
    if (!isTeacher) return;
    
    if (!nostrClientAvailable) {
      alert('Nostr client not available. Please install a Nostr extension or refresh the page.');
      return;
    }
    
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          setScreenStream(null);
        }
        setIsScreenSharing(false);
        
        // Switch to camera view mode when stopping screen share
        setViewMode('camera');
        
        // Update metadata to indicate screen sharing has stopped
        await updateStreamMetadata('camera');
        
        console.log('Screen sharing stopped');
      } else {
        // Start screen sharing
        try {
          console.log('Requesting screen share access...');
          const newScreenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          });
          
          console.log('Screen share access granted, setting up stream');
          setScreenStream(newScreenStream);
          setIsScreenSharing(true);
          
          // Switch to screen view mode when starting screen share
          setViewMode('screen');
          
          // Update metadata to indicate screen sharing has started
          await updateStreamMetadata('screen');
          
          // Handle screen share ending (e.g., when user clicks "Stop sharing" in browser UI)
          newScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
            console.log('Screen share ended by user or system');
            newScreenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            setIsScreenSharing(false);
            setViewMode('camera');
            updateStreamMetadata('camera');
          });
        } catch (mediaError) {
          console.error('Failed to access screen sharing:', mediaError);
          alert('Could not access screen sharing. Please check your browser permissions.');
          return;
        }
      }
    } catch (error) {
      console.error('Screen share toggle failed:', error);
      alert('Failed to toggle screen sharing. Please try again.');
    }
  };

  const updateStreamMetadata = async (newStreamType: string) => {
    if (!window.nostrClient) {
      console.error('Nostr client not available');
      return;
    }
    
    try {
      const updateEvent: NostrEvent = {
        kind: 30311, // NIP-53 live event update
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['d', streamEvent.tags.find(tag => tag[0] === 'd')?.[1] || ''],
          ['stream_type', newStreamType],
          ['has_screen_share', newStreamType !== 'camera' ? 'true' : 'false'],
          ['updated', new Date().toISOString()]
        ],
        content: `Stream updated to ${newStreamType} mode`,
        pubkey: streamEvent.pubkey,
      } as NostrEvent;
      
      await window.nostrClient.publishEvent(updateEvent);
      console.log(`Stream metadata updated to ${newStreamType} mode`);
    } catch (error) {
      console.error('Failed to update stream metadata:', error);
    }
  };

  const showAnnotationInput = (x: number, y: number, callback: (text: string) => void) => {
    setAnnotationInput({
      visible: true,
      x,
      y,
      callback
    });
  };

  const hideAnnotationInput = () => {
    setAnnotationInput({
      visible: false,
      x: 0,
      y: 0,
      callback: null
    });
  };

  const handleAnnotationSubmit = (text: string) => {
    if (text.trim() && annotationInput.callback) {
      annotationInput.callback(text);
    }
    hideAnnotationInput();
  };

  const addAnnotation = (x: number, y: number, text: string) => {
    if (!isTeacher) return;
    
    // Get the video container dimensions for more accurate positioning
    const videoContainer = document.querySelector('.video-container');
    const rect = videoContainer?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
    
    const annotation = {
      id: Date.now(),
      x: ((x) / rect.width) * 100, // Percentage-based positioning
      y: ((y) / rect.height) * 100,
      text,
      timestamp: Date.now()
    };
    
    // Add annotation to local state
    setAnnotations(prev => [...prev, annotation]);
    
    // Publish annotation as Nostr event if client is available
    if (window.nostrClient) {
      try {
        const annotationEvent: NostrEvent = {
          kind: 1, // Text note
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ['e', streamEvent.id, '', 'root'],
            ['annotation', 'screen'],
            ['x', annotation.x.toString()],
            ['y', annotation.y.toString()]
          ],
          content: text,
          pubkey: userPubkey || '',
        } as NostrEvent;
        
        window.nostrClient.publishEvent(annotationEvent)
          .catch(err => console.error('Failed to publish annotation:', err));
      } catch (error) {
        console.error('Error creating annotation event:', error);
      }
    } else {
      console.warn('Nostr client not available, annotation will only be visible locally');
    }
    
    // Remove annotation after 10 seconds
    setTimeout(() => {
      setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
    }, 10000);
  };
  
  // Handle video playback errors
  const handleVideoError = (e: SyntheticEvent<HTMLVideoElement>, isPip: boolean = false) => {
    console.error('Video playback error:', e);
    if (isPip) {
      setPipVideoAutoplayFailed(true);
    } else {
      setMainVideoAutoplayFailed(true);
    }
  };
  
  // Handle manual play attempt when autoplay fails
  const handleManualPlay = async (isPip: boolean = false) => {
    try {
      if (isPip && pipVideoRef.current) {
        await pipVideoRef.current.play();
        setPipVideoAutoplayFailed(false);
      } else if (mainVideoRef.current) {
        await mainVideoRef.current.play();
        setMainVideoAutoplayFailed(false);
      }
    } catch (error) {
      console.error('Manual play failed:', error);
      // If manual play with audio fails, try muted
      if (!isMuted) {
        setIsMuted(true);
        try {
          if (isPip && pipVideoRef.current) {
            pipVideoRef.current.muted = true;
            await pipVideoRef.current.play();
            setPipVideoAutoplayFailed(false);
          } else if (mainVideoRef.current) {
            mainVideoRef.current.muted = true;
            await mainVideoRef.current.play();
            setMainVideoAutoplayFailed(false);
          }
        } catch (mutedError) {
          console.error('Even muted play failed:', mutedError);
        }
      }
    }
  };
  
  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = !isMuted;
    }
    if (pipVideoRef.current) {
      pipVideoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="enhanced-stream-viewer">
      <div className="stream-header">
        <h1>
          {streamEvent.tags.find(tag => tag[0] === 'title')?.[1]}
          {isScreenSharing && <span style={{ color: '#e74c3c', marginLeft: '10px', fontSize: '0.8em' }}>🔴 SCREEN SHARING ACTIVE</span>}
        </h1>
        
        {(hasScreenShare || isScreenSharing) && (
          <div className="view-controls">
            <button 
              onClick={() => setViewMode('screen')}
              className={viewMode === 'screen' ? 'active' : ''}
              disabled={!isScreenSharing && viewMode === 'screen'}
            >
              📺 Screen
            </button>
            <button 
              onClick={() => setViewMode('camera')}
              className={viewMode === 'camera' ? 'active' : ''}
            >
              📹 Camera
            </button>
            <button 
              onClick={() => setViewMode('pip')}
              className={viewMode === 'pip' ? 'active' : ''}
              disabled={!isScreenSharing && viewMode === 'pip'}
            >
              🖥️📹 Both
            </button>
          </div>
        )}
      </div>
      <div className="stream-content">
        <div 
          className="video-container"
          onClick={(e) => {
            if (isTeacher && (hasScreenShare || isScreenSharing)) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Show a floating input field at the click position
              showAnnotationInput(x, y, (text) => {
                if (text) addAnnotation(x, y, text);
              });
            }
          }}
        >
          {/* Main video element - will show either screen share or camera based on viewMode */}
          {(streamingUrl || isScreenSharing) ? (
            <div className="main-video-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
              <video
                ref={mainVideoRef}
                controls
                autoPlay
                playsInline
                muted={isMuted}
                onError={(e) => handleVideoError(e)}
                // Only set src when not using srcObject for screen sharing
                // This prevents conflicts between src and srcObject
                src={(viewMode === 'camera' || !isScreenSharing) ? streamingUrl : undefined}
                className={`stream-video ${viewMode}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: viewMode === 'screen' || viewMode === 'pip' ? 'contain' : 'cover',
                  zIndex: 1
                }}
              />
              {mainVideoAutoplayFailed && (
                <div 
                  className="play-button-overlay"
                  onClick={() => handleManualPlay(false)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>▶️</div>
                  <div>Click to play</div>
                </div>
              )}
            </div>
          ) : (
            <div className="stream-placeholder">
              <p>Stream not available</p>
            </div>
          )}
          
          {/* PIP video element - only shown in PIP mode */}
          {viewMode === 'pip' && (
            <div className="pip-video-wrapper" style={{ position: 'absolute', bottom: '20px', right: '20px', width: '25%' }}>
              <video
                ref={pipVideoRef}
                autoPlay
                playsInline
                muted={true} // PIP always muted
                onError={(e) => handleVideoError(e, true)}
                // In PIP mode, this video shows the camera feed
                src={streamingUrl || undefined}
                className="pip-video"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  border: '2px solid white',
                  borderRadius: '8px',
                  zIndex: 2
                }}
              />
              {pipVideoAutoplayFailed && (
                <div 
                  className="pip-play-button-overlay"
                  onClick={() => handleManualPlay(true)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}
                >
                  ▶️
                </div>
              )}
            </div>
          )}
          
          {/* Annotations overlay */}
          {annotations.map(annotation => (
            <div
              key={annotation.id}
              className="annotation"
              style={{
                position: 'absolute',
                left: `${annotation.x}%`,
                top: `${annotation.y}%`,
                background: 'rgba(255, 255, 0, 0.8)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              {annotation.text}
            </div>
          ))}
          
          {/* Floating annotation input */}
          {annotationInput.visible && (
            <div
              className="annotation-input-container"
              style={{
                position: 'absolute',
                left: `${annotationInput.x}px`,
                top: `${annotationInput.y}px`,
                zIndex: 20,
                transform: 'translate(-50%, -100%)',
                marginTop: '-10px'
              }}
            >
              <input
                type="text"
                autoFocus
                className="annotation-input"
                placeholder="Type annotation and press Enter"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleAnnotationSubmit(e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    hideAnnotationInput();
                  }
                }}
                onBlur={() => hideAnnotationInput()}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '2px solid #3498db',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              />
            </div>
          )}
        </div>
        {isTeacher && (
          <div className="teacher-controls">
            {!nostrClientAvailable && (
              <div className="nostr-warning">
                ⚠️ Nostr client not detected. Some features may be limited.
              </div>
            )}
            
            <button 
              onClick={toggleScreenShare}
              className={`screen-share-btn ${isScreenSharing ? 'active' : ''}`}
              disabled={!nostrClientAvailable}
            >
              {isScreenSharing ? '🛑 Stop Screen Share' : '📺 Start Screen Share'}
            </button>
            
            <button 
              className="annotation-btn"
              disabled={!nostrClientAvailable || (!isScreenSharing && !hasScreenShare)}
            >
              ✏️ Click video to annotate
            </button>
            
            <button 
              onClick={toggleMute}
              className={`mute-btn ${isMuted ? '' : 'active'}`}
            >
              {isMuted ? '🔇 Unmute Audio' : '🔊 Mute Audio'}
            </button>
          </div>
        )}
        
        {/* Audio controls for non-teachers */}
        {!isTeacher && (
          <div className="viewer-controls">
            <button 
              onClick={toggleMute}
              className={`mute-btn ${isMuted ? '' : 'active'}`}
            >
              {isMuted ? '🔇 Unmute Audio' : '🔊 Mute Audio'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};