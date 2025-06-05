// File: hooks/useUniversalMessaging.ts
// Prompt: "Create React hook for universal NIP-59 messaging across all Nostr clients"
import { useState, useEffect, useCallback, useRef } from 'react';
import { CitadelForumManagerNIP59 } from '../lib/secure-forums-nip59';
import { nip59 } from 'nostr-tools';
import { hexToBytes } from '../lib/nostr-helpers';

// Extend Window interface to include custom events
declare global {
  interface WindowEventMap {
    forumMessage: CustomEvent;
    academyMessage: CustomEvent;
  }
}

export interface UniversalMessage {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  type: 'forum' | 'direct' | 'academy';
  timestamp: number;
  context?: {
    forumId?: string;
    courseId?: string;
    threadId?: string;
  };
}

export const useUniversalMessaging = (userKeys: any, nostrClient: any) => {
  const [messages, setMessages] = useState<UniversalMessage[]>([]);
  const [forumManager, setForumManager] = useState<CitadelForumManagerNIP59 | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!userKeys || !nostrClient) return;
    
    const manager = new CitadelForumManagerNIP59(nostrClient, userKeys);
    setForumManager(manager);
    
    // Subscribe to all gift-wrapped messages using an IIFE to handle the async function
    (async () => {
      subscriptionRef.current = await subscribeToAllMessages(manager);
      setIsConnected(true);
    })();
    
    return () => {
      // Clean up subscription to prevent memory leaks
      if (subscriptionRef.current) {
        subscriptionRef.current.close();
      }
      setIsConnected(false);
    };
  }, [userKeys, nostrClient]);

  const subscribeToAllMessages = async (manager: CitadelForumManagerNIP59) => {
    const filter = {
      kinds: [1059], // NIP-59 gift wrap
      '#p': [userKeys.publicKey]
    };
    const subscription = nostrClient.subscribe([filter]);
    
    subscription.on('event', async (giftWrapEvent: any) => {
      try {
        // Use the hexToBytes function to convert the private key to Uint8Array
        const privateKeyBytes = hexToBytes(userKeys.privateKey);
        
        // Unwrap the gift-wrapped event
        const unwrapped = await nip59.unwrapEvent(giftWrapEvent, privateKeyBytes);
        
        // Extract message metadata from tags
        const messageType = unwrapped.tags.find((tag: string[]) => tag[0] === 'type')?.[1] || 'direct';
        const forumId = unwrapped.tags.find((tag: string[]) => tag[0] === 'forum')?.[1];
        const courseId = unwrapped.tags.find((tag: string[]) => tag[0] === 'course')?.[1];
        const threadId = unwrapped.tags.find((tag: string[]) => tag[0] === 'thread')?.[1];
        
        // Create a universal message object
        const universalMessage: UniversalMessage = {
          id: unwrapped.id || `msg-${Date.now()}`,
          content: unwrapped.content,
          sender: unwrapped.pubkey,
          recipient: userKeys.publicKey,
          type: messageType as any,
          timestamp: unwrapped.created_at,
          context: {
            forumId,
            courseId,
            threadId
          }
        };
        
        // Add the message to the state
        setMessages(prev => [...prev, universalMessage]);
        
        // Emit specific events for different message types
        if (messageType === 'forum') {
          window.dispatchEvent(new CustomEvent('forumMessage', {
            detail: { rumor: unwrapped, sender: unwrapped.pubkey }
          }));
        } else if (messageType === 'academy') {
          window.dispatchEvent(new CustomEvent('academyMessage', {
            detail: { rumor: unwrapped, sender: unwrapped.pubkey }
          }));
        }
      } catch (error) {
        console.error('Failed to decrypt universal message:', error);
      }
    });
    
    // Return the subscription so it can be closed when the component unmounts
    return subscription;
  };

  const sendMessage = useCallback(async (
    recipientPubkey: string,
    content: string,
    context: {
      type: 'forum' | 'direct' | 'academy';
      forumId?: string;
      courseId?: string;
    }
  ) => {
    if (!forumManager) throw new Error('Messaging not initialized');
    await forumManager.sendUniversalMessage(recipientPubkey, content, context);
  }, [forumManager]);

  const sendForumMessage = useCallback(async (
    forumId: string,
    content: string,
    messageType: 'student' | 'mentor' | 'public' | 'family',
    courseId?: string
  ) => {
    if (!forumManager) throw new Error('Messaging not initialized');
    // Get forum members
    const members = await getForumMembers(forumId, nostrClient);
    
    await forumManager.sendForumMessage({
      forumId,
      content,
      messageType,
      courseId,
      threadId: `thread-${Date.now()}`
    }, members);
  }, [forumManager, nostrClient]);

  const getMessagesByType = useCallback((type: UniversalMessage['type']) => {
    return messages.filter(msg => msg.type === type);
  }, [messages]);

  const getForumMessages = useCallback((forumId: string) => {
    return messages.filter(msg => 
      msg.type === 'forum' && msg.context?.forumId === forumId
    );
  }, [messages]);

  return {
    messages,
    isConnected,
    sendMessage,
    sendForumMessage,
    getMessagesByType,
    getForumMessages
  };
};

/**
 * Helper function to get forum members from a NIP-172 community definition
 * @param forumId The ID of the forum to get members for
 * @param nostrClient The Nostr client to use for querying events
 * @returns An array of public keys of forum members
 */
async function getForumMembers(forumId: string, nostrClient: any): Promise<string[]> {
  try {
    // Query NIP-172 community definition
    const filter = {
      kinds: [34550], // Community definition
      '#d': [forumId]
    };
    
    // Query events from relays
    const events = await nostrClient.queryEvents([filter]);
    if (!events || events.length === 0) return [];

    // Get the first community event
    const communityEvent = events[0];
    
    // Extract member public keys from tags
    return communityEvent.tags
      .filter((tag: string[]) => 
        tag[0] === 'p' && 
        (tag[3] === 'member' || tag[3] === 'moderator' || tag[3] === 'admin')
      )
      .map((tag: string[]) => tag[1]);
  } catch (error) {
    console.error('Failed to get forum members:', error);
    return [];
  }
}