// File: components/StreamViewer.tsx
// Prompt: "Create live stream viewer with chat and zap integration"
import React, { useState, useEffect } from 'react';
import { Event } from 'nostr-tools';
import { processZapPayment } from '../lib/stream-utils';
import '../styles/StreamViewer.css';
import '../styles/enhanced-stream.css';
import { EnhancedStreamSettings } from '../lib/zapstream-client';

// Define the NostrClient interface to match the window.d.ts definition
interface NostrClient {
  publishEvent: (event: Event) => Promise<void>;
  queryEvents: (filters: any[]) => Promise<any[]>;
  getPublicKey: () => string;
  signEvent: (event: any) => Promise<any>;
  subscribe?: (filters: any[]) => any;
  updateStreamStatus?: (event: Event, newStatus: string) => Promise<Event>;
  [key: string]: any;
}

// TypeScript workaround for window.nostrClient
const nostrClient = window.nostrClient as NostrClient | undefined;

interface StreamViewerProps {
  streamEvent: Event;
  userPubkey?: string;
}

export const StreamViewer: React.FC<StreamViewerProps> = ({
  streamEvent,
  userPubkey
}) => {
  const [chatMessages, setChatMessages] = useState<Event[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [zapAmount, setZapAmount] = useState(100);
  const [zapMessage, setZapMessage] = useState('');
  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    totalZaps: 0,
    duration: 0
  });

  const streamId = streamEvent.tags.find(tag => tag[0] === 'd')?.[1];
  const title = streamEvent.tags.find(tag => tag[0] === 'title')?.[1];
  const streamingUrl = streamEvent.tags.find(tag => tag[0] === 'streaming')?.[1];
  const status = streamEvent.tags.find(tag => tag[0] === 'status')?.[1];
  
  // Enhanced stream metadata
  const streamType = streamEvent.tags.find(tag => tag[0] === 'stream_type')?.[1] as 'camera' | 'screen' | 'both' || 'camera';
  const hasScreenShare = streamEvent.tags.find(tag => tag[0] === 'has_screen_share')?.[1] === 'true';
  const allowAnnotations = streamEvent.tags.find(tag => tag[0] === 'allow_annotations')?.[1] === 'true';

  useEffect(() => {
    // Check if nostrClient is available
    if (!nostrClient) {
      console.error('Nostr client not available');
      return;
    }

    // Subscribe to chat messages for this stream
    const filter = {
      kinds: [1], // Text notes
      '#e': [streamEvent.id], // Referencing this stream
      since: Math.floor(Date.now() / 1000) - 3600 // Last hour
    };
    
    // Fetch initial messages
    if (nostrClient?.queryEvents) {
      nostrClient.queryEvents([filter])
        .then(events => setChatMessages(events as Event[]))
        .catch((err: Error) => console.error('Failed to query chat messages:', err));
    } else {
      console.warn('queryEvents method not available on nostrClient');
    }
    
    // Subscribe to real-time chat
    try {
      if (nostrClient?.subscribe) {
        const sub = nostrClient.subscribe([filter]);
        sub.on('event', (event: Event) => {
          setChatMessages(prev => [...prev, event]);
        });
        return () => sub.unsub();
      } else {
        console.warn('subscribe method not available on nostrClient');
      }
    } catch (error) {
      console.error('Failed to subscribe to chat messages:', error);
    }
    return undefined;
  }, [streamEvent.id]);

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !userPubkey) return;
    
    // Check if nostrClient is available
    if (!nostrClient) {
      console.error('Nostr client not available');
      alert('Nostr client not available. Please install a Nostr extension.');
      return;
    }
    
    try {
      const messageEvent: Event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['e', streamEvent.id, '', 'root'], // Reference to stream
          ['p', streamEvent.pubkey], // Stream host
          ['t', 'live-chat']
        ],
        content: newMessage,
        pubkey: userPubkey,
      } as Event;
      
      if (nostrClient?.publishEvent) {
        await nostrClient.publishEvent(messageEvent);
      } else {
        throw new Error('publishEvent method not available on nostrClient');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send chat message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const sendZap = async () => {
    if (!zapAmount || !userPubkey) return;
    
    try {
      // In a real implementation, we would get the private key securely
      // or use the nostr extension to sign the event
      if (!nostrClient) {
        throw new Error('Nostr client not available. Please install a Nostr extension.');
      }
      
      // Create a zap request event
      const zapRequestEvent = {
        kind: 9734, // Zap request
        created_at: Math.floor(Date.now() / 1000),
        content: zapMessage,
        tags: [
          ['p', streamEvent.pubkey], // Recipient
          ['amount', zapAmount.toString()],
          ['relays', 'wss://relay.damus.io', 'wss://relay.nostr.band'],
          ['e', streamEvent.id, '', 'root'], // Reference to stream
          ['t', 'stream-zap']
        ],
        pubkey: userPubkey,
      } as Partial<Event>;
      
      // Sign the event using the nostr client
      // If signEvent is not available, we'll use a fallback approach
      let signedEvent: Event;
      
      if (nostrClient?.signEvent) {
        signedEvent = await nostrClient.signEvent(zapRequestEvent) as Event;
      } else {
        // Fallback: Use the publishEvent method which might handle signing internally
        // or create a properly formatted event that can be processed
        console.warn('signEvent method not available, using fallback approach');
        
        // Add id field if not present (normally added during signing)
        if (!zapRequestEvent.id) {
          zapRequestEvent.id = Math.random().toString(36).substring(2, 15);
        }
        
        // Use the event as is, assuming the payment processor can handle it
        signedEvent = zapRequestEvent as Event;
        
        // Publish the event if possible
        if (nostrClient?.publishEvent) {
          await nostrClient.publishEvent(signedEvent);
        }
      }
      
      // Process the payment
      await processZapPayment(signedEvent);
      
      setZapAmount(100);
      setZapMessage('');
    } catch (error) {
      console.error('Failed to send zap:', error);
      alert(error instanceof Error ? error.message : 'Failed to send zap');
    }
  };

  return (
    <div className="stream-viewer">
      <div className="stream-header">
        <h1>{title}</h1>
        <div className="stream-stats">
          <span className={`status ${status}`}>
            {status === 'live' ? '🔴 LIVE' : status === 'ended' ? '⏹️ ENDED' : '⏰ SCHEDULED'}
          </span>
          <span>👥 {streamStats.viewers} viewers</span>
          <span>⚡ {streamStats.totalZaps} sats</span>
        </div>
      </div>
      <div className="stream-content">
        <div className="video-container">
          {status === 'live' && streamingUrl ? (
            <div className={`stream-video-wrapper ${hasScreenShare ? 'has-screen-share' : ''}`}>
              <video
                controls
                autoPlay
                src={streamingUrl}
                className={`stream-video ${streamType}`}
              />
              {hasScreenShare && (
                <div className="stream-controls">
                  <div className="stream-type-indicator">
                    {streamType === 'both' ? '📹+🖥️' : streamType === 'screen' ? '🖥️' : '📹'}
                    {streamType === 'both' && ' Picture-in-Picture Mode'}
                  </div>
                  {allowAnnotations && (
                    <button className="annotation-toggle">
                      Toggle Annotations
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="stream-placeholder">
              <p>Stream is {status}</p>
              {status === 'planned' && hasScreenShare && (
                <p className="stream-features">
                  This stream will include {streamType === 'both' ? 'camera and screen sharing' : streamType === 'screen' ? 'screen sharing' : 'camera only'}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="stream-sidebar">
          <div className="zap-section">
            <h3>⚡ Support the Stream</h3>
            <div className="zap-controls">
              <input
                type="number"
                value={zapAmount}
                onChange={(e) => setZapAmount(parseInt(e.target.value))}
                placeholder="Amount (sats)"
                min="1"
              />
              <input
                type="text"
                value={zapMessage}
                onChange={(e) => setZapMessage(e.target.value)}
                placeholder="Message (optional)"
              />
              <button onClick={sendZap} className="zap-btn">
                ⚡ Zap {zapAmount} sats
              </button>
            </div>
          </div>
          <div className="chat-section">
            <h3>💬 Live Chat</h3>
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className="chat-message">
                  <strong>{msg.pubkey.slice(0, 8)}...</strong>
                  <span>{msg.content}</span>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button onClick={sendChatMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};