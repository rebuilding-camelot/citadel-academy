// File: src/lib/createStreamEvent.ts
// Utility function for creating proper Nostr stream events

import { Event } from 'nostr-tools';
import { createLiveStreamEvent } from './nip53-live-events';

interface StreamEventParams {
  title: string;
  description: string;
  startTime: string;
  tags?: string[];
}

/**
 * Creates a properly signed Nostr stream event
 * @param params Stream parameters (title, description, startTime)
 * @param userPubkey User's public key
 * @param signWithKey Function to sign the event (either private key or signing function)
 * @returns Properly signed Nostr event
 */
export const createStreamEvent = async (
  params: StreamEventParams,
  userPubkey: string,
  signWithKey: ((unsignedEvent: any) => Promise<Event>) | string
): Promise<Event> => {
  const { title, description, startTime, tags = [] } = params;
  
  // Generate a unique stream ID
  const streamId = `stream-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  if (typeof signWithKey === 'string') {
    // If a private key is provided, use the NIP-53 implementation directly
    const streamEvent = createLiveStreamEvent(
      {
        streamId,
        title,
        summary: description,
        status: 'planned',
        starts: startTime,
        currentParticipants: 0,
        tags
      },
      userPubkey,
      signWithKey
    );
    
    return streamEvent;
  } else {
    // If a signing function is provided, create an unsigned event and use the function
    const unsignedEvent = {
      kind: 30311, // NIP-53 live event
      created_at: Math.floor(Date.now() / 1000),
      pubkey: userPubkey,
      tags: [
        ['d', streamId], // NIP-33 identifier
        ['title', title],
        ['summary', description],
        ['status', 'planned'],
        ['starts', startTime],
        ['current_participants', '0'],
        ...tags.map(tag => ['t', tag])
      ],
      content: description,
    };
    
    // Sign the event using the provided signing function
    return await signWithKey(unsignedEvent);
  }
};