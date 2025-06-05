// Type definitions for useUniversalMessaging hook
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

export interface UniversalMessagingHook {
  messages: UniversalMessage[];
  isConnected: boolean;
  sendMessage: (
    recipientPubkey: string,
    content: string,
    context: {
      type: 'forum' | 'direct' | 'academy';
      forumId?: string;
      courseId?: string;
    }
  ) => Promise<void>;
  sendForumMessage: (
    forumId: string,
    content: string,
    messageType: 'student' | 'mentor' | 'public' | 'family',
    courseId?: string
  ) => Promise<void>;
  getMessagesByType: (type: UniversalMessage['type']) => UniversalMessage[];
  getForumMessages: (forumId: string) => UniversalMessage[];
}

export function useUniversalMessaging(
  userKeys: { privateKey: string; publicKey: string },
  nostrClient: any
): UniversalMessagingHook;