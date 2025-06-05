import React, { useState, useEffect } from 'react';
import { getEventHash, finalizeEvent } from 'nostr-tools/pure';
import type { Event } from 'nostr-tools';
import { publishEvent, fetchCohortMessages } from '../lib/communities';
import './CohortChat.css';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

interface CohortChatProps {
  cohortId: string;
  userPrivateKey?: string; // Optional: if not provided, will use NIP-07 extension
}

export function CohortChat({ cohortId, userPrivateKey }: CohortChatProps) {
  const [messages, setMessages] = useState<Event[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchCohortMessages(cohortId);
        // Sort messages by timestamp
        fetchedMessages.sort((a, b) => a.created_at - b.created_at);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching cohort messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    
    // Set up a periodic refresh
    const intervalId = window.setInterval(loadMessages, 30000); // Refresh every 30 seconds
    
    return () => window.clearInterval(intervalId);
  }, [cohortId]);

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Format pubkey for display
  const formatPubkey = (pubkey: string): string => {
    return `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`;
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // Create message event template
      let messageEvent: Event = {
        kind: 42, // NIP-72 community chat message
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['a', `34550:${cohortId}`],
          ['e', cohortId, '', 'root']
        ],
        content: newMessage,
        pubkey: '', // Will be set during signing
        id: '', // Will be set during signing
        sig: '' // Will be set during signing
      } as Event;
      
      // Sign the event
      if (userPrivateKey) {
        // Use provided private key and finalizeEvent
        // Convert hex private key to Uint8Array for nostr-tools v2
        const privateKeyBytes = hexToBytes(userPrivateKey);
        messageEvent = finalizeEvent(messageEvent, privateKeyBytes);
      } else if (window.nostr) {
        // Use NIP-07 extension
        const signedEvent = await window.nostr.signEvent(messageEvent as any);
        // Extract the signature from the signed event
        messageEvent.sig = signedEvent.sig;
        // Get the public key
        messageEvent.pubkey = await window.nostr.getPublicKey();
        // Calculate the event ID
        messageEvent.id = getEventHash(messageEvent);
      } else {
        throw new Error('No signing method available');
      }
      
      // Publish to relays
      await publishEvent(messageEvent);
      
      // Add to local messages
      setMessages([...messages, messageEvent]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="cohort-chat">
      <div className="chat-header">
        <h3>Cohort Chat</h3>
      </div>
      
      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Be the first to say hello!</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="message">
              <div className="message-header">
                <span className="message-author">{formatPubkey(msg.pubkey)}</span>
                <span className="message-time">{formatTimestamp(msg.created_at)}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
      </div>
      
      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={2}
        />
        <button onClick={sendMessage} disabled={!newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

// Window interface is defined in src/types/window.d.ts