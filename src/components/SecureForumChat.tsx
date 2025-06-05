// File: components/SecureForumChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { CitadelForumManagerNIP59, ForumMessage } from '../lib/secure-forums-nip59';
import { nostrClient } from '../lib/nostr-helpers';
import type { Filter } from 'nostr-tools';
import '../styles/secure-forum-nip59.css';

interface SecureForumChatProps {
  userKeys: {
    privateKey: string;
    publicKey: string;
  };
  forumId: string;
  courseId?: string;
  lessonId?: string;
  threadId?: string;
  forumName: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  messageType: 'student' | 'mentor' | 'public' | 'family';
  courseId?: string;
}

// Different forum types using same NIP-59 wrapper
const forumTypes = {
  student: 'student-forum-citadel',
  mentor: 'mentor-forum-citadel', 
  public: 'public-discussion-citadel',
  family: 'family-federation-citadel'
};

// Forum tags for message context and moderation
const forumTags = (messageType: string, courseId?: string, lessonId?: string, threadId?: string) => [
  // Forum identification
  ['forum', forumTypes[messageType as keyof typeof forumTypes] || 'public-discussion-citadel'],
  ['academy', 'citadel'],
  
  // Optional context
  ...(courseId ? [['course', courseId]] : []),
  ...(lessonId ? [['lesson', lessonId]] : []),
  ...(threadId ? [['thread', threadId]] : []),
  
  // Moderation
  ['moderated', 'true'],
  ['security_level', 'standard']
];

export const SecureForumChat: React.FC<SecureForumChatProps> = ({
  userKeys,
  forumId,
  courseId,
  lessonId,
  threadId,
  forumName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [forumMembers, setForumMembers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'student' | 'mentor' | 'public' | 'family'>('student');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const forumManagerRef = useRef<CitadelForumManagerNIP59 | null>(null);

  // Shared function to get forum members with caching
  const getForumMembersFromCache = async (): Promise<string[]> => {
    if (forumMembers.length > 0) {
      return forumMembers;
    }
    
    try {
      const filter: Filter = {
        kinds: [34550], // Community definition
        '#d': [forumId]
      };
      const events = await nostrClient.queryEvents(filter);
      if (events.length > 0) {
        const communityEvent = events[0];
        const members = communityEvent.tags
          .filter((tag: string[]) => tag[0] === 'p' && (tag[3] === 'member' || tag[3] === 'moderator'))
          .map((tag: string[]) => tag[1]);
        setForumMembers(members);
        setMemberCount(members.length);
        return members;
      }
    } catch (error) {
      console.error('Failed to get forum members:', error);
    }
    return [];
  };

  useEffect(() => {
    // Check if nostrClient is available
    if (!nostrClient) {
      console.error('NostrClient is not available');
      setIsConnected(false);
      return;
    }

    // Initialize forum manager
    forumManagerRef.current = new CitadelForumManagerNIP59(nostrClient, userKeys);
    setIsConnected(true);

    // Subscribe to forum messages
    const subscribeToMessages = async () => {
      try {
        await forumManagerRef.current?.subscribeToForumMessages(forumId);
        console.log(`Subscribed to forum: ${forumId}`);
      } catch (error) {
        console.error('Failed to subscribe to forum messages:', error);
        setIsConnected(false);
      }
    };

    // Handle incoming forum messages
    const handleForumMessage = (event: CustomEvent) => {
      const { rumor, sender, timestamp } = event.detail;
      
      // Extract message details
      const messageId = rumor.id || `msg-${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)}`;
      const messageType = rumor.tags.find((tag: string[]) => tag[0] === 'forum_type')?.[1] || 'public';
      const msgCourseId = rumor.tags.find((tag: string[]) => tag[0] === 'course')?.[1];
      
      // Check if this message is from a known forum type
      const forumTag = rumor.tags.find((tag: string[]) => 
        tag[0] === 'forum' && 
        Object.values(forumTypes).includes(tag[1])
      );
      
      // Add new message to state
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: messageId,
          content: rumor.content,
          sender,
          timestamp: timestamp || rumor.created_at,
          messageType: messageType as 'student' | 'mentor' | 'public' | 'family',
          courseId: msgCourseId
        }
      ]);
      
      // Log the forum type if found
      if (forumTag) {
        console.log(`Received message from forum type: ${forumTag[1]}`);
      }
    };

    // Get forum members count
    const getForumMembers = async () => {
      await getForumMembersFromCache();
    };

    // Create properly typed event handler
    const typedHandleForumMessage = (event: Event) => {
      handleForumMessage(event as CustomEvent);
    };

    // Set up event listeners
    window.addEventListener('forumMessage', typedHandleForumMessage);
    
    // Initialize
    subscribeToMessages();
    getForumMembers();

    // Cleanup
    return () => {
      window.removeEventListener('forumMessage', typedHandleForumMessage);
    };
  }, [forumId, userKeys]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !forumManagerRef.current) return;
    
    // Check if nostrClient is available
    if (!nostrClient) {
      console.error('NostrClient is not available');
      setIsConnected(false);
      return;
    }

    try {
      // Get the specific forum identifier for the selected message type
      const forumIdentifier = forumTypes[messageType];
      console.log(`Sending message to ${messageType} forum with identifier: ${forumIdentifier}`);
      
      // Create the forum message with additional tags
      const forumMessage: ForumMessage = {
        forumId,
        content: messageInput,
        messageType,
        courseId,
        tags: forumTags(messageType, courseId, lessonId, threadId)
      };

      // Get forum members from cache and send message
      const members = await getForumMembersFromCache();
      
      if (members.length > 0) {
        await forumManagerRef.current.sendForumMessage(forumMessage, members);
        
        // Clear input after sending
        setMessageInput('');
      } else {
        console.error('No community definition found for forum:', forumId);
      }
    } catch (error) {
      console.error('Failed to send forum message:', error);
    }
  };

  const handleBroadcast = async () => {
    if (!forumManagerRef.current) return;
    
    // Check if nostrClient is available
    if (!nostrClient) {
      console.error('NostrClient is not available');
      setIsConnected(false);
      return;
    }
    
    try {
      // Get forum members from cache for direct broadcast
      const members = await getForumMembersFromCache();
      
      if (members.length > 0) {
        // Use the new direct broadcast method with tags
        await forumManagerRef.current.directBroadcastToForum(
          forumId,
          `📢 This is a broadcast message to all ${messageType} forum members.`,
          members,
          forumTags(messageType, courseId, lessonId, threadId)
        );
      } else {
        // Fallback to the original broadcast method if no members found
        await forumManagerRef.current.broadcastToForum(
          forumId,
          `📢 This is a broadcast message to all ${messageType} forum members.`,
          messageType,
          forumTags(messageType, courseId, lessonId, threadId)
        );
      }
    } catch (error) {
      console.error('Failed to broadcast to forum:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="secure-forum-chat">
      <div className="forum-header">
        <div className="forum-info">
          <h3>{forumName}</h3>
          <div className="forum-badges">
            <span className="encryption-badge">🔒 NIP-59 Encrypted</span>
            {courseId && <span className="course-badge">📚 {courseId}</span>}
          </div>
        </div>
        <button className="broadcast-btn" onClick={handleBroadcast}>
          📢 Broadcast
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.messageType}`}>
              <div className="message-header">
                <span className="sender">{msg.sender.slice(0, 8)}...</span>
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                <span className="message-type-badge">
                  {msg.messageType === 'student' && `👨‍🎓 Student (${forumTypes.student})`}
                  {msg.messageType === 'mentor' && `👨‍🏫 Mentor (${forumTypes.mentor})`}
                  {msg.messageType === 'public' && `🌐 Public (${forumTypes.public})`}
                  {msg.messageType === 'family' && `👪 Family (${forumTypes.family})`}
                </span>
                {msg.courseId && (
                  <span className="course-context">{msg.courseId}</span>
                )}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <div className="forum-type-selector">
          <label htmlFor="forum-type">Forum Type:</label>
          <select 
            id="forum-type" 
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as 'student' | 'mentor' | 'public' | 'family')}
            disabled={!isConnected}
          >
            <option value="student">Student Forum</option>
            <option value="mentor">Mentor Forum</option>
            <option value="public">Public Discussion</option>
            <option value="family">Family Federation</option>
          </select>
        </div>
        <div className="input-container">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={!isConnected}
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!isConnected || !messageInput.trim()}
          >
            Send
          </button>
        </div>
        <div className="forum-status">
          <div className="status-indicator">
            {isConnected ? (
              <span>✅ Connected to forum</span>
            ) : (
              <span>❌ Disconnected</span>
            )}
          </div>
          <div className="member-count">
            <span>👥 {memberCount} members</span>
          </div>
          <div className="forum-type-indicator">
            <span>🏷️ {messageType.charAt(0).toUpperCase() + messageType.slice(1)} Forum</span>
          </div>
        </div>
      </div>
    </div>
  );
};