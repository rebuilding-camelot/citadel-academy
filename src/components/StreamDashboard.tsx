// File: src/components/StreamDashboard.tsx
// Prompt: "Create instructor dashboard for managing live streams"
/// <reference path="../types/window.d.ts" />
import React, { useState, useEffect } from 'react';
import { Event } from 'nostr-tools';
import { StreamCreator } from './StreamCreator';
import { EnhancedStreamCreator } from './EnhancedStreamCreator';
import { StreamViewer } from './StreamViewer';
import '../styles/StreamDashboard.css';

// Define the NostrClient interface to match the window.d.ts definition
interface NostrClient {
  publishEvent: (event: Event) => Promise<void>;
  queryEvents: (filters: any[]) => Promise<any[]>;
  getPublicKey: () => string;
  signEvent: (event: any) => Promise<any>;
  [key: string]: any;
}

export const StreamDashboard: React.FC = () => {
  const [streams, setStreams] = useState<Event[]>([]);
  const [activeStream, setActiveStream] = useState<Event | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPubkey, setUserPubkey] = useState<string>('');

  useEffect(() => {
    // Get user's pubkey and load streams
    const loadUserDataAndStreams = async () => {
      setLoading(true);
      try {
        if (!window.nostrClient) {
          throw new Error('Nostr client not available. Please install a compatible Nostr extension.');
        }
        
        const nostrClient = window.nostrClient as NostrClient;
        
        // Get user's public key
        let pubkey = '';
        try {
          pubkey = nostrClient.getPublicKey();
        } catch (err) {
          console.warn('Error getting public key:', err);
        }
        setUserPubkey(pubkey);
        
        const filter = {
          kinds: [30311], // NIP-53 live events
          authors: [pubkey],
          limit: 20
        };
        
        // Query events from Nostr
        const events = await nostrClient.queryEvents([filter]);
        setStreams(events.sort((a: Event, b: Event) => b.created_at - a.created_at));
        setError(null);
      } catch (err) {
        console.error('Failed to load streams:', err);
        setError(err instanceof Error ? err.message : 'Failed to load streams');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserDataAndStreams();
  }, []);

  const handleStreamCreated = (streamData: Event) => {
    setShowCreator(false);
    setShowEnhancedCreator(false);
    // Add the new stream to the list
    setStreams(prev => [streamData, ...prev]);
  };

  return (
    <div className="stream-dashboard">
      <div className="dashboard-header">
        <h1>🎥 Live Stream Dashboard</h1>
        <div className="stream-buttons">
          <button 
            onClick={() => setShowCreator(true)}
            className="create-stream-btn"
          >
            + Create Basic Stream
          </button>
          <button 
            onClick={() => setShowEnhancedCreator(true)}
            className="create-stream-btn enhanced"
          >
            + Create Enhanced Stream
          </button>
        </div>
      </div>

      {showCreator && (
        <div className="modal">
          <div className="modal-content">
            <StreamCreator 
              onStreamCreated={handleStreamCreated}
              userPubkey={userPubkey}
              signWithKey={async (unsignedEvent) => {
                if (!window.nostrClient) {
                  throw new Error('Nostr client not available');
                }
                const nostrClient = window.nostrClient as NostrClient;
                return await nostrClient.signEvent(unsignedEvent);
              }}
            />
            <button 
              onClick={() => setShowCreator(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {showEnhancedCreator && (
        <div className="modal">
          <div className="modal-content">
            <EnhancedStreamCreator 
              onStreamCreated={handleStreamCreated}
              userPubkey={userPubkey}
              signWithKey={async (unsignedEvent) => {
                if (!window.nostrClient) {
                  throw new Error('Nostr client not available');
                }
                const nostrClient = window.nostrClient as NostrClient;
                return await nostrClient.signEvent(unsignedEvent);
              }}
            />
            <button 
              onClick={() => setShowEnhancedCreator(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">Loading streams...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : streams.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any streams yet.</p>
          <p>Click the "Create New Stream" button to get started.</p>
        </div>
      ) : (
        <div className="streams-grid">
          {streams.map(stream => {
            const title = stream.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled Stream';
            const status = stream.tags.find(tag => tag[0] === 'status')?.[1] || 'planned';
            const viewers = stream.tags.find(tag => tag[0] === 'current_participants')?.[1] || '0';
            return (
              <div 
                key={stream.id} 
                className={`stream-card ${status}`}
                onClick={() => setActiveStream(stream)}
              >
                <h3>{title}</h3>
                <div className="stream-meta">
                  <span className={`status ${status}`}>
                    {status === 'live' ? '🔴 LIVE' : status === 'ended' ? '⏹️ ENDED' : '⏰ SCHEDULED'}
                  </span>
                  <span>👥 {viewers}</span>
                  <span>{new Date(stream.created_at * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeStream && (
        <div className="modal">
          <div className="modal-content stream-modal">
            <StreamViewer 
              streamEvent={activeStream}
              userPubkey={userPubkey}
            />
            <button 
              onClick={() => setActiveStream(null)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};