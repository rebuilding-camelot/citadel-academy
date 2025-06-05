// File: components/UniversalMessagingDemo.tsx
// Demonstrates the usage of the useUniversalMessaging hook
import React, { useState, useEffect } from 'react';
import { useUniversalMessaging } from '../hooks/useUniversalMessaging';
import { nostrClient } from '../lib/nostr-helpers';
import { SecureForumChat } from './SecureForumChat';
import './UniversalMessagingDemo.css';
import '../styles/secure-forum-nip59.css';

interface UniversalMessagingDemoProps {
  userKeys: {
    privateKey: string;
    publicKey: string;
  };
}

export const UniversalMessagingDemo: React.FC<UniversalMessagingDemoProps> = ({ userKeys }) => {
  const [recipientPubkey, setRecipientPubkey] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<'direct' | 'forum' | 'academy'>('direct');
  const [forumId, setForumId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [selectedTab, setSelectedTab] = useState<'send' | 'received' | 'forum'>('send');
  const [activeMessageFilter, setActiveMessageFilter] = useState<'all' | 'direct' | 'forum' | 'academy'>('all');
  
  const {
    messages,
    isConnected,
    sendMessage,
    getMessagesByType
  } = useUniversalMessaging(userKeys, nostrClient);

  const directMessages = getMessagesByType('direct');
  const forumMessages = getMessagesByType('forum');
  const academyMessages = getMessagesByType('academy');
  
  const getFilteredMessages = () => {
    switch (activeMessageFilter) {
      case 'direct': return directMessages;
      case 'forum': return forumMessages;
      case 'academy': return academyMessages;
      default: return messages;
    }
  };

  const handleSendMessage = async () => {
    if (!recipientPubkey || !messageContent) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Basic pubkey format validation
    if (!recipientPubkey.match(/^(npub|[a-f0-9]{64})$/i)) {
      alert('Please enter a valid public key (npub format or hex).');
      return;
    }
    
    if (messageType === 'forum' && !forumId.trim()) {
      alert('Forum ID is required for forum messages.');
      return;
    }
    
    if (messageType === 'academy' && !courseId.trim()) {
      alert('Course ID is required for academy messages.');
      return;
    }
    
    try {
      await sendMessage(recipientPubkey, messageContent, {
        type: messageType,
        forumId: messageType === 'forum' ? forumId : undefined,
        courseId: messageType === 'academy' ? courseId : undefined
      });
      
      // Clear form after sending
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="universal-messaging-demo">
      <div className="messaging-header">
        <h2>Universal NIP-59 Messaging</h2>
        <div className="connection-status">
          {isConnected ? (
            <span className="connected">✅ Connected</span>
          ) : (
            <span className="disconnected">❌ Disconnected</span>
          )}
        </div>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'send' ? 'active' : ''}`}
          onClick={() => setSelectedTab('send')}
        >
          Send Message
        </button>
        <button 
          className={`tab ${selectedTab === 'received' ? 'active' : ''}`}
          onClick={() => setSelectedTab('received')}
        >
          Received Messages ({messages.length})
        </button>
        <button 
          className={`tab ${selectedTab === 'forum' ? 'active' : ''}`}
          onClick={() => setSelectedTab('forum')}
        >
          Secure Forum Chat
        </button>
      </div>
      
      {selectedTab === 'send' ? (
        <div className="send-message-form">
          <div className="form-group">
            <label>Recipient Public Key:</label>
            <input
              type="text"
              value={recipientPubkey}
              onChange={(e) => setRecipientPubkey(e.target.value)}
              placeholder="npub..."
            />
          </div>
          
          <div className="form-group">
            <label>Message Type:</label>
            <select 
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'direct' | 'forum' | 'academy')}
            >
              <option value="direct">Direct Message</option>
              <option value="forum">Forum Message</option>
              <option value="academy">Academy Message</option>
            </select>
          </div>
          
          {messageType === 'forum' && (
            <div className="form-group">
              <label>Forum ID:</label>
              <input
                type="text"
                value={forumId}
                onChange={(e) => setForumId(e.target.value)}
                placeholder="Forum identifier"
              />
            </div>
          )}
          
          {messageType === 'academy' && (
            <div className="form-group">
              <label>Course ID:</label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Course identifier"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Message:</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
            />
          </div>
          
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!isConnected || !recipientPubkey || !messageContent}
          >
            🔒 Send Encrypted Message
          </button>
        </div>
      ) : selectedTab === 'received' ? (
        <div className="received-messages">
          <div className="message-tabs">
            <button 
              className={`message-tab ${activeMessageFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveMessageFilter('all')}
            >All ({messages.length})</button>
            <button 
              className={`message-tab ${activeMessageFilter === 'direct' ? 'active' : ''}`}
              onClick={() => setActiveMessageFilter('direct')}
            >Direct ({directMessages.length})</button>
            <button 
              className={`message-tab ${activeMessageFilter === 'forum' ? 'active' : ''}`}
              onClick={() => setActiveMessageFilter('forum')}
            >Forum ({forumMessages.length})</button>
            <button 
              className={`message-tab ${activeMessageFilter === 'academy' ? 'active' : ''}`}
              onClick={() => setActiveMessageFilter('academy')}
            >Academy ({academyMessages.length})</button>
          </div>
          
          <div className="messages-list">
            {getFilteredMessages().length === 0 ? (
              <div className="no-messages">
                <p>No messages received yet.</p>
              </div>
            ) : (
              getFilteredMessages().map((msg) => (
                <div key={msg.id} className={`message-item ${msg.type}`}>
                  <div className="message-header">
                    <span className="sender">{msg.sender.slice(0, 8)}...</span>
                    <span className="timestamp">
                      {new Date(msg.timestamp * 1000).toLocaleString()}
                    </span>
                    <span className={`message-type ${msg.type}`}>
                      {msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}
                    </span>
                  </div>
                  
                  {msg.context && Object.keys(msg.context).some(k => msg.context?.[k as keyof typeof msg.context]) && (
                    <div className="message-context">
                      {msg.context.forumId && (
                        <span className="context-item">Forum: {msg.context.forumId}</span>
                      )}
                      {msg.context.courseId && (
                        <span className="context-item">Course: {msg.context.courseId}</span>
                      )}
                      {msg.context.threadId && (
                        <span className="context-item">Thread: {msg.context.threadId}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="message-content">{msg.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="forum-chat-container">
          <h3>Secure Forum Chat Demo</h3>
          <p className="forum-description">
            This demonstrates the NIP-59 encrypted forum chat functionality using the new secure-forum-nip59.css styles.
          </p>
          
          <div className="forum-setup">
            <div className="form-group">
              <label>Forum ID:</label>
              <input
                type="text"
                value={forumId}
                onChange={(e) => setForumId(e.target.value)}
                placeholder="Enter forum identifier"
              />
            </div>
            
            <div className="form-group">
              <label>Course ID (optional):</label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Enter course identifier"
              />
            </div>
          </div>
          
          {forumId ? (
            <SecureForumChat
              userKeys={userKeys}
              forumId={forumId}
              courseId={courseId || undefined}
              forumName={`Forum: ${forumId}`}
            />
          ) : (
            <div className="forum-placeholder">
              <p>Please enter a Forum ID to start the secure chat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};