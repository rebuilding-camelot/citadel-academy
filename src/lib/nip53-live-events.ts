// File: lib/nip53-live-events.ts
// Prompt: "Implement NIP-53 live streaming events for Citadel Academy"
import { Event, getEventHash, finalizeEvent, SimplePool, Filter } from 'nostr-tools';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error('Invalid hex string');
  }
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface LiveStreamEvent {
  streamId: string;
  title: string;
  summary: string;
  image?: string;
  streaming?: string; // RTMP URL
  recording?: string; // Recording URL
  starts?: string; // ISO timestamp
  ends?: string; // ISO timestamp
  status: 'live' | 'ended' | 'planned';
  currentParticipants?: number;
  totalParticipants?: number;
  relays?: string[];
  tags?: string[];
  service?: string; // Service identifier (e.g., 'zap.stream')
  academy?: string; // Academy identifier (e.g., 'citadel')
}

/**
 * Extract LiveStreamEvent data from a Nostr event
 */
export function extractLiveStreamEventFromNostrEvent(event: Event): LiveStreamEvent | null {
  if (event.kind !== 30311) {
    return null;
  }

  // Find the streamId from the 'd' tag
  const dTag = event.tags.find(tag => tag[0] === 'd');
  if (!dTag || !dTag[1]) {
    return null;
  }

  const streamId = dTag[1];
  
  // Helper function to get tag value
  const getTagValue = (tagName: string): string | undefined => {
    const tag = event.tags.find(t => t[0] === tagName);
    return tag && tag[1] ? tag[1] : undefined;
  };

  // Extract status with fallback to 'planned'
  const status = getTagValue('status') as 'live' | 'ended' | 'planned' || 'planned';
  
  // Extract other fields
  const title = getTagValue('title') || '';
  const summary = getTagValue('summary') || event.content || '';
  
  // Build the LiveStreamEvent object
  const liveStreamEvent: LiveStreamEvent = {
    streamId,
    title,
    summary,
    status,
    image: getTagValue('image'),
    streaming: getTagValue('streaming'),
    recording: getTagValue('recording'),
    starts: getTagValue('starts'),
    ends: getTagValue('ends'),
    currentParticipants: getTagValue('current_participants') ? 
      parseInt(getTagValue('current_participants') as string, 10) : undefined,
    totalParticipants: getTagValue('total_participants') ? 
      parseInt(getTagValue('total_participants') as string, 10) : undefined,
    service: getTagValue('service'),
    academy: getTagValue('academy'),
  };

  // Extract relay tags
  const relayTags = event.tags.filter(tag => tag[0] === 'relay').map(tag => tag[1]);
  if (relayTags.length > 0) {
    liveStreamEvent.relays = relayTags;
  }

  // Extract t tags
  const tTags = event.tags.filter(tag => tag[0] === 't').map(tag => tag[1]);
  if (tTags.length > 0) {
    liveStreamEvent.tags = tTags;
  }

  return liveStreamEvent;
}

/**
 * Creates an unsigned live stream event
 * This version doesn't require a private key and returns an unsigned event
 * that can be signed using a Nostr client's signEvent method
 */
export function createUnsignedLiveStreamEvent(
  stream: LiveStreamEvent,
  hostPubkey: string
): Event {
  // Input validation
  if (!stream.streamId || !stream.title || !hostPubkey) {
    throw new Error('Missing required fields');
  }
  if (hostPubkey.length !== 64) {
    throw new Error('Invalid public key length');
  }
  
  const event: Event = {
    kind: 30311, // NIP-53 live event
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', stream.streamId], // NIP-33 identifier
      ['title', stream.title],
      ['summary', stream.summary],
      ['status', stream.status],
      ...(stream.streaming ? [['streaming', stream.streaming]] : []),
      ...(stream.recording ? [['recording', stream.recording]] : []),
      ...(stream.starts ? [['starts', stream.starts]] : []),
      ...(stream.ends ? [['ends', stream.ends]] : []),
      ...(stream.currentParticipants !== undefined ? [['current_participants', stream.currentParticipants.toString()]] : []),
      ...(stream.totalParticipants !== undefined ? [['total_participants', stream.totalParticipants.toString()]] : []),
      ...(stream.service !== undefined ? [['service', stream.service]] : [['service', 'zap.stream']]),
      ...(stream.academy !== undefined ? [['academy', stream.academy]] : [['academy', 'citadel']]),
      ...(stream.image ? [['image', stream.image]] : []),
      ...(stream.relays?.map(relay => ['relay', relay]) || []),
      ...(stream.tags?.map(tag => ['t', tag]) || [])
    ],
    content: stream.summary,
    pubkey: hostPubkey,
  } as Event;
  
  // Calculate the event hash but don't sign it
  event.id = getEventHash(event);
  
  return event;
}

/**
 * Creates a signed live stream event using a private key
 * @deprecated Direct private key usage is discouraged. Use createUnsignedLiveStreamEvent with a Nostr client instead.
 */
export function createLiveStreamEvent(
  stream: LiveStreamEvent,
  hostPubkey: string,
  privateKey: string
): Event {
  // Input validation
  if (!stream.streamId || !stream.title || !hostPubkey || !privateKey) {
    throw new Error('Missing required fields');
  }
  if (privateKey.length !== 64) {
    throw new Error('Invalid private key length');
  }
  if (hostPubkey.length !== 64) {
    throw new Error('Invalid public key length');
  }
  
  // Create the unsigned event first
  const event = createUnsignedLiveStreamEvent(stream, hostPubkey);
  
  // Convert hex private key to bytes
  const privateKeyBytes = hexToBytes(privateKey);
  
  // Use finalizeEvent to add id and signature in one step
  const signedEvent = finalizeEvent(event, privateKeyBytes);
  
  return signedEvent;
}

/**
 * Fetch the most recent event for a stream from the provided relays
 */
export async function fetchStreamEvent(
  streamId: string, 
  hostPubkey: string, 
  relays: string[]
): Promise<Event | null> {
  // Input validation
  if (!streamId || !hostPubkey) {
    throw new Error('Missing required fields');
  }
  if (hostPubkey.length !== 64) {
    throw new Error('Invalid public key length');
  }
  if (!relays || !Array.isArray(relays) || relays.length === 0) {
    throw new Error('At least one relay is required');
  }
  const pool = new SimplePool();
  
  try {
    // Create a filter to find the specific event
    const filter: Filter = {
      kinds: [30311],
      authors: [hostPubkey],
      '#d': [streamId]
    };
    
    // Fetch events from relays
    // In nostr-tools v2, we use querySync instead of query
    const events = await pool.querySync(relays, filter);
    
    // Close all connections
    pool.close(relays);
    
    if (events.length === 0) {
      return null;
    }
    
    // Sort by created_at to get the most recent event
    events.sort((a: Event, b: Event) => b.created_at - a.created_at);
    return events[0];
  } catch (error) {
    console.error('Error fetching stream event:', error);
    // Close all connections on error
    pool.close(relays);
    return null;
  }
}

/**
 * Create an unsigned status update event for an existing stream
 * This function fetches the existing event data before updating to preserve all metadata
 */
export async function createUnsignedStatusUpdateEvent(
  streamId: string,
  status: 'live' | 'ended' | 'planned',
  hostPubkey: string,
  relays: string[]
): Promise<Event> {
  // Input validation
  if (!streamId || !status || !hostPubkey) {
    throw new Error('Missing required fields');
  }
  if (hostPubkey.length !== 64) {
    throw new Error('Invalid public key length');
  }
  if (!relays || !Array.isArray(relays) || relays.length === 0) {
    throw new Error('At least one relay is required');
  }
  
  // Fetch the existing event
  const existingEvent = await fetchStreamEvent(streamId, hostPubkey, relays);
  
  // If we found an existing event, extract its data
  let streamData: LiveStreamEvent;
  
  if (existingEvent) {
    const extractedData = extractLiveStreamEventFromNostrEvent(existingEvent);
    
    if (extractedData) {
      // Update only the status while preserving all other fields
      streamData = {
        ...extractedData,
        status
      };
    } else {
      // Fallback if extraction fails
      streamData = {
        streamId,
        title: 'Unknown Stream',
        summary: 'Stream information could not be retrieved',
        status
      };
    }
  } else {
    // If no existing event is found, create minimal data
    streamData = {
      streamId,
      title: 'Unknown Stream',
      summary: 'Stream information could not be retrieved',
      status
    };
  }
  
  // Create and return the unsigned updated event
  return createUnsignedLiveStreamEvent(streamData, hostPubkey);
}

/**
 * Update the status of an existing stream event
 * This function fetches the existing event data before updating to preserve all metadata
 * @deprecated Direct private key usage is discouraged. Use createUnsignedStatusUpdateEvent with a Nostr client instead.
 */
export async function updateStreamStatus(
  streamId: string,
  status: 'live' | 'ended' | 'planned',
  hostPubkey: string,
  privateKey: string,
  relays: string[]
): Promise<Event> {
  // Input validation
  if (!streamId || !status || !hostPubkey || !privateKey) {
    throw new Error('Missing required fields');
  }
  if (privateKey.length !== 64) {
    throw new Error('Invalid private key length');
  }
  if (hostPubkey.length !== 64) {
    throw new Error('Invalid public key length');
  }
  if (!relays || !Array.isArray(relays) || relays.length === 0) {
    throw new Error('At least one relay is required');
  }
  
  // Get the unsigned event
  const unsignedEvent = await createUnsignedStatusUpdateEvent(streamId, status, hostPubkey, relays);
  
  // Convert hex private key to bytes
  const privateKeyBytes = hexToBytes(privateKey);
  
  // Use finalizeEvent to add id and signature in one step
  return finalizeEvent(unsignedEvent, privateKeyBytes);
}

