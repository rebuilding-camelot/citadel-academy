// File: lib/secure-forums-nip59.ts
// Prompt: "Implement NIP-59 gift wrap for Citadel Academy forum messaging"
import { Event, getEventHash } from 'nostr-tools';
import { nip59, nip44 } from 'nostr-tools';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface ForumMessage {
  forumId: string;
  content: string;
  messageType: 'student' | 'mentor' | 'public' | 'family';
  courseId?: string;
  threadId?: string;
  tags?: string[][];
}

export class CitadelForumManagerNIP59 {
  private nostrClient: any;
  private userKeys: { privateKey: string; publicKey: string };

  constructor(nostrClient: any, userKeys: any) {
    this.nostrClient = nostrClient;
    this.userKeys = userKeys;
  }

  // Send forum message using NIP-59 gift wrap
  async sendForumMessage(
    message: ForumMessage,
    recipients: string[]
  ): Promise<void> {
    const RELAYS = [
      'wss://relay.citadel.academy',
      'wss://relay.damus.io',
      'wss://nos.lol'
    ];
    
    const results = await Promise.allSettled(
      recipients.map(async (recipientPubkey) => {
        try {
          // Create rumor (unsigned event for gift wrapping)
          const rumor = {
            kind: 14, // Private direct message
            created_at: Math.floor(Date.now() / 1000),
            tags: [
              ['p', recipientPubkey],
              ['forum', message.forumId],
              ['forum_type', message.messageType],
              ['academy', 'citadel'],
              ...(message.courseId ? [['course', message.courseId]] : []),
              ...(message.threadId ? [['thread', message.threadId]] : []),
              ['client', 'dynastic'],
              ...(message.tags || [])
            ],
            content: message.content,
            pubkey: this.userKeys.publicKey
          };

          // Create NIP-59 gift wrap
          const giftWrap = await nip59.wrapEvent(
            rumor,
            hexToBytes(this.userKeys.privateKey),
            recipientPubkey
          );

          // Publish to multiple relays for reliability
          return await this.publishToRelays(giftWrap, RELAYS);
        } catch (error) {
          console.error(`Failed to send message to ${recipientPubkey}:`, error);
          throw error; // Re-throw to be caught by Promise.allSettled
        }
      })
    );
    
    // Log any failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`Failed to send messages to ${failures.length}/${recipients.length} recipients`);
    }
  }

  // Subscribe to forum messages using NIP-59
  // Returns an unsubscribe function to prevent memory leaks
  async subscribeToForumMessages(forumId: string): Promise<() => void> {
    const filter = {
      kinds: [1059], // NIP-59 gift wrap events
      '#p': [this.userKeys.publicKey],
      since: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
    };
    const subscription = this.nostrClient.subscribe([filter]);
    
    subscription.on('event', async (giftWrapEvent: Event) => {
      try {
        // Unwrap the gift-wrapped event
        const unwrapped = await nip59.unwrapEvent(
          giftWrapEvent, 
          hexToBytes(this.userKeys.privateKey)
        );
        // Check if it's for our forum
        const forumTag = unwrapped.tags.find(
          (tag: string[]) => tag[0] === 'forum' && tag[1] === forumId
        );
        if (forumTag) {
          this.handleForumMessage(unwrapped, unwrapped.pubkey);
        }
      } catch (error) {
        console.error('Failed to decrypt forum message:', error);
      }
    });
    
    // Return unsubscribe function that the caller can use to clean up
    return () => subscription.close?.(); // caller decides when to stop
  }

  // Broadcast to all forum members
  async broadcastToForum(
    forumId: string, 
    message: string, 
    messageType: ForumMessage['messageType'],
    tags?: string[][]
  ): Promise<void> {
    const members = await this.getForumMembers(forumId);
    
    await this.sendForumMessage({
      forumId,
      content: message,
      messageType,
      courseId: undefined,
      threadId: `broadcast-${Date.now()}`,
      tags
    }, members);
  }
  
  // Direct broadcast to forum with explicit recipients
  async directBroadcastToForum(forumId: string, message: string, recipients: string[], tags?: string[][]): Promise<void> {
    const RELAYS = [
      'wss://relay.citadel.academy',
      'wss://relay.damus.io',
      'wss://nos.lol'
    ];
    
    const results = await Promise.allSettled(
      recipients.map(async (recipientPubkey) => {
        try {
          const rumor = {
            kind: 14,
            created_at: Math.floor(Date.now() / 1000), // Add timestamp for consistency
            tags: [
              ['p', recipientPubkey],
              ['forum', forumId],
              ['broadcast', 'true'], // Indicates forum broadcast
              ...(tags || [])
            ],
            content: message,
            pubkey: this.userKeys.publicKey
          };
          
          const wrapped = await nip59.wrapEvent(
            rumor,
            hexToBytes(this.userKeys.privateKey),
            recipientPubkey
          );
          
          return await this.publishToRelays(wrapped, RELAYS);
        } catch (error) {
          console.error(`Failed to broadcast to ${recipientPubkey}:`, error);
          throw error; // Re-throw to be caught by Promise.allSettled
        }
      })
    );
    
    // Log any failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`Failed to broadcast to ${failures.length}/${recipients.length} recipients`);
    }
  }

  // Cross-client compatible message sending
  async sendUniversalMessage(
    recipientPubkey: string,
    content: string,
    context: {
      type: 'forum' | 'direct' | 'academy';
      forumId?: string;
      courseId?: string;
    }
  ): Promise<void> {
    try {
      const rumor = {
        kind: 14,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['p', recipientPubkey],
          ['type', context.type],
          ['client', 'citadel-academy'],
          ...(context.forumId ? [['forum', context.forumId]] : []),
          ...(context.courseId ? [['course', context.courseId]] : [])
        ],
        content,
        pubkey: this.userKeys.publicKey
      };

      const giftWrap = await nip59.wrapEvent(
        rumor,
        hexToBytes(this.userKeys.privateKey),
        recipientPubkey
      );

      const RELAYS = [
        'wss://relay.citadel.academy',
        'wss://relay.damus.io',
        'wss://nos.lol',
        'wss://relay.nostr.band'
      ];

      const result = await this.publishToRelays(giftWrap, RELAYS);
      
      // If no successful relays, throw an error
      if (result.successful.length === 0) {
        throw new Error(`Failed to publish universal message to any relay: ${result.failed.map(f => f.relay).join(', ')}`);
      }
    } catch (error) {
      console.error(`Failed to send universal message to ${recipientPubkey}:`, error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  private async getForumMembers(forumId: string): Promise<string[]> {
    // Query NIP-172 community definition
    const filter = {
      kinds: [34550], // Community definition
      '#d': [forumId]
    };
    const events = await this.nostrClient.queryEvents([filter]);
    if (events.length === 0) return [];

    const communityEvent = events[0];
    return communityEvent.tags
      .filter((tag: string[]) => tag[0] === 'p' && (tag[3] === 'member' || tag[3] === 'moderator'))
      .map((tag: string[]) => tag[1]);
  }

  private handleForumMessage(rumor: any, sender: string): void {
    const forumType = rumor.tags.find((tag: string[]) => tag[0] === 'forum_type')?.[1];
    const courseId = rumor.tags.find((tag: string[]) => tag[0] === 'course')?.[1];

    // Emit event for UI to handle
    window.dispatchEvent(new CustomEvent('forumMessage', {
      detail: {
        rumor,
        sender,
        forumType,
        courseId,
        timestamp: rumor.created_at
      }
    }));
  }

  private async publishToRelays(event: Event, relays: string[]): Promise<{successful: string[], failed: {relay: string, error: Error}[]}> {
    const results = await Promise.allSettled(
      relays.map(relay => 
        this.nostrClient.publishToRelay(event, relay)
          .then(() => ({ success: true, relay }))
          .catch((error: Error) => {
            console.warn(`Failed to publish to ${relay}:`, error);
            return { success: false, relay, error };
          })
      )
    );
    
    // Process results to provide meaningful feedback
    const successful: string[] = [];
    const failed: {relay: string, error: Error}[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const value = result.value;
        if (value.success) {
          successful.push(value.relay);
        } else {
          failed.push({ relay: value.relay, error: value.error });
        }
      } else {
        // This should rarely happen as we catch errors in the map function
        console.error('Unexpected promise rejection:', result.reason);
      }
    });
    
    // Log summary
    if (failed.length > 0) {
      console.warn(`Published to ${successful.length}/${relays.length} relays. Failed: ${failed.length}`);
    }
    
    return { successful, failed };
  }
}