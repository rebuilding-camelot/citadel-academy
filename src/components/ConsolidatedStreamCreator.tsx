// File: src/components/ConsolidatedStreamCreator.tsx
// Consolidated Stream Creator component that combines basic and enhanced features

import React, { useState, useRef, useEffect } from 'react';
import { Event, getEventHash, UnsignedEvent } from 'nostr-tools';
import { ZapStreamClient, StreamSettings, EnhancedStreamSettings } from '../lib/zapstream-client';
import { createStreamEvent } from '../lib/createStreamEvent';
import { createCompositeStream, cleanupMediaStream } from '../lib/screen-share-utils';
import '../styles/enhanced-stream.css';

// Define NostrClient interface to match window.d.ts
interface NostrClient {
  publishEvent: (event: Event) => Promise<void>;
  queryEvents?: (filters: any[]) => Promise<any[]>;
  getPublicKey: () => string;
  signEvent: (event: any) => Promise<any>;
  [key: string]: any;
}

// Define a comprehensive props interface that covers all use cases
interface ConsolidatedStreamCreatorProps {
  // Core props
  onStreamCreated: (streamData: any) => void;
  
  // Optional props
  courseId?: string;
  userPubkey?: string;
  userPrivkey?: string;
  signWithKey?: (unsignedEvent: UnsignedEvent) => Promise<Event>;
  
  // Feature flags
  enableScreenShare?: boolean;
  enableEnhancedFeatures?: boolean;
}

export const ConsolidatedStreamCreator: React.FC<ConsolidatedStreamCreatorProps> = ({
  onStreamCreated,
  courseId,
  userPubkey,
  userPrivkey,
  signWithKey,
  enableScreenShare = false,
  enableEnhancedFeatures = false
}) => {
  // Basic stream state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [isEducational, setIsEducational] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Enhanced stream state (for screen sharing)
  const [streamType, setStreamType] = useState<'camera' | 'screen' | 'both'>('camera');
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up media streams when component unmounts
  useEffect(() => {
    return () => {
      if (screenStream) cleanupMediaStream(screenStream);
      if (cameraStream) cleanupMediaStream(cameraStream);
    };
  }, [screenStream, cameraStream]);

  // Media stream handling functions
  const startScreenShare = async (): Promise<MediaStream | null> => {
    try {
      const screenMediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - mediaSource is not in the TypeScript definitions but is supported
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      setScreenStream(screenMediaStream);
      
      // Handle screen share ending
      screenMediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenStream(null);
        setStreamType('camera');
      });
      
      return screenMediaStream;
    } catch (error) {
      console.error('Screen sharing failed:', error);
      alert('Screen sharing not supported or permission denied');
      return null;
    }
  };

  const startCameraStream = async (): Promise<MediaStream | null> => {
    try {
      const cameraMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      setCameraStream(cameraMediaStream);
      return cameraMediaStream;
    } catch (error) {
      console.error('Camera access failed:', error);
      return null;
    }
  };

  // Create a composite stream for picture-in-picture mode
  const createCompositeStreamWithCanvas = (screen: MediaStream, camera: MediaStream): MediaStream => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = 1920;
      canvas.height = 1080;
      
      return createCompositeStream(screen, camera, {
        canvasWidth: 1920,
        canvasHeight: 1080,
        pipPosition: 'bottom-right',
        pipWidth: 320,
        pipHeight: 240,
        frameRate: 30
      });
    } else {
      return createCompositeStream(screen, camera);
    }
  };

  // Handle form submission for creating a stream
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a stream title');
      return;
    }
    
    setCreating(true);
    
    try {
      // Get Nostr client from window if not provided via props
      const nostrClient = window.nostrClient as NostrClient | undefined;
      
      // Get user's public key if not provided via props
      const pubkey = userPubkey || (nostrClient ? nostrClient.getPublicKey() : '');
      if (!pubkey) {
        throw new Error('Unable to get user public key. Please check your Nostr extension.');
      }
      
      // Determine if we're using enhanced features
      if (enableEnhancedFeatures && enableScreenShare) {
        // Enhanced stream creation with screen sharing
        let finalStream: MediaStream;
        
        switch (streamType) {
          case 'screen':
            finalStream = await startScreenShare() || new MediaStream();
            break;
            
          case 'camera':
            finalStream = await startCameraStream() || new MediaStream();
            break;
            
          case 'both':
            const screen = await startScreenShare();
            const camera = await startCameraStream();
            
            if (screen && camera) {
              finalStream = createCompositeStreamWithCanvas(screen, camera);
            } else {
              finalStream = screen || camera || new MediaStream();
            }
            break;
            
          default:
            finalStream = new MediaStream();
        }
        
        if (!finalStream || finalStream.getTracks().length === 0) {
          throw new Error('Failed to access media devices');
        }
        
        // Create enhanced stream settings
        const enhancedSettings: EnhancedStreamSettings = {
          title: `${streamType === 'screen' ? '📺' : streamType === 'both' ? '🖥️📹' : '📹'} ${title}`,
          description,
          tags: [...tags, ...(courseId ? [`course:${courseId}`] : [])],
          courseId,
          isEducational,
          requiresAuth,
          streamType,
          hasScreenShare: streamType !== 'camera',
          allowAnnotations: true
        };
        
        // Create the client
        const zapStreamClient = new ZapStreamClient(
          { 
            apiUrl: 'https://api.zap.stream', 
            apiKey: 'your-stream-key' // In production, this would be securely stored
          },
          nostrClient as any
        );
        
        // Create the enhanced stream
        const streamData = await zapStreamClient.createStream(enhancedSettings);
        
        // Pass the stream data to the callback
        onStreamCreated({
          ...streamData,
          streamType,
          localStream: finalStream,
          hasScreenShare: streamType !== 'camera',
          allowAnnotations: true
        });
      } else {
        // Basic stream creation
        // Create an unsigned event
        const unsignedEvent: UnsignedEvent = {
          pubkey,
          created_at: Math.floor(Date.now() / 1000),
          kind: 30311,
          tags: [
            ['title', title],
            ['summary', description],
            ['status', 'planned'],
            ['start_time', startTime || new Date().toISOString()],
            ['current_participants', '0'],
            ...tags.map(tag => ['t', tag])
          ],
          content: description,
        };
        
        // Calculate the event hash
        const id = getEventHash(unsignedEvent);
        const eventWithId = { ...unsignedEvent, id };
        
        // Sign the event using the provided signing function or Nostr client
        const signFn = signWithKey || (nostrClient ? nostrClient.signEvent.bind(nostrClient) : null);
        
        if (!signFn) {
          throw new Error('No signing function available');
        }
        
        const signedEvent = await signFn(eventWithId);
        
        // If using ZapStream integration
        if (enableEnhancedFeatures) {
          // Create a ZapStream client
          const zapStreamClient = new ZapStreamClient(
            { 
              apiUrl: 'https://api.zap.stream',
              apiKey: 'your-stream-key' // In production, this would be securely stored
            },
            nostrClient as any
          );
          
          // Create the stream on Zap.stream
          const streamData = await zapStreamClient.createStream({
            title,
            description,
            tags: [...tags, ...(courseId ? [`course:${courseId}`] : [])],
            courseId,
            isEducational,
            requiresAuth
          });
          
          // Pass the combined data to the callback
          onStreamCreated({
            ...streamData,
            event: signedEvent
          });
        } else {
          // Just pass the signed event to the callback
          onStreamCreated(signedEvent);
        }
      }
    } catch (error) {
      console.error('Failed to create stream:', error);
      alert(error instanceof Error ? error.message : 'Failed to create stream');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="stream-creator">
      <h2>{enableEnhancedFeatures ? '🎥 Create Live Educational Stream' : 'Create New Stream'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="stream-title">Stream Title</label>
          <input
            id="stream-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your stream"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="stream-description">Description</label>
          <textarea
            id="stream-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you be teaching in this stream?"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="stream-time">Start Time</label>
          <input
            id="stream-time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        
        {enableEnhancedFeatures && (
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
              placeholder="bitcoin, education, live, qa"
            />
          </div>
        )}
        
        {enableEnhancedFeatures && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isEducational}
                onChange={(e) => setIsEducational(e.target.checked)}
              />
              Educational Content
            </label>
          </div>
        )}
        
        {enableEnhancedFeatures && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
              />
              Require Academy Membership
            </label>
          </div>
        )}
        
        {enableScreenShare && (
          <div className="stream-type-selector">
            <h3>Stream Type</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="camera"
                  checked={streamType === 'camera'}
                  onChange={(e) => setStreamType(e.target.value as any)}
                />
                📹 Camera Only
              </label>
              
              <label>
                <input
                  type="radio"
                  value="screen"
                  checked={streamType === 'screen'}
                  onChange={(e) => setStreamType(e.target.value as any)}
                />
                📺 Screen Share Only
              </label>
              
              <label>
                <input
                  type="radio"
                  value="both"
                  checked={streamType === 'both'}
                  onChange={(e) => setStreamType(e.target.value as any)}
                />
                🖥️📹 Screen + Camera (Picture-in-Picture)
              </label>
            </div>
          </div>
        )}
        
        {enableScreenShare && streamType !== 'camera' && (
          <div className="stream-preview">
            <canvas 
              ref={canvasRef} 
              style={{ 
                width: '100%', 
                maxWidth: '640px', 
                height: 'auto',
                border: '1px solid #333',
                display: streamType === 'both' ? 'block' : 'none'
              }} 
            />
            
            {screenStream && streamType === 'screen' && (
              <video
                autoPlay
                muted
                style={{ width: '100%', maxWidth: '640px' }}
                ref={(video) => {
                  if (video) video.srcObject = screenStream;
                }}
              />
            )}
            
            {cameraStream && (
              <video
                autoPlay
                muted
                style={{ 
                  width: '100%', 
                  maxWidth: '640px',
                  display: streamType === 'camera' as any ? 'block' : 'none'
                }}
                ref={(video) => {
                  if (video) video.srcObject = cameraStream;
                }}
              />
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="create-btn"
          disabled={creating || !title.trim()}
        >
          {creating ? 'Creating...' : enableScreenShare ? `🎬 Start ${streamType} Stream` : 'Create Stream'}
        </button>
      </form>
    </div>
  );
};