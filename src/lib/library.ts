// File: lib/library.ts
// Prompt: "Create NIP-94 file metadata system for digital library"
import { Event, EventTemplate, getEventHash, finalizeEvent } from 'nostr-tools';
import { nostrClient } from './nostr-helpers';

// Helper function to convert hex string to Uint8Array (reused from marketplace.ts)
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface LibraryFile {
  id: string;
  title: string;
  author: string;
  description: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  hash: string;
  category: 'book' | 'paper' | 'video' | 'audio' | 'course';
  tags: string[];
  accessLevel: 'free' | 'member' | 'premium';
}

/**
 * Creates a NIP-94 file metadata event for a library file
 * 
 * @param file - Library file details
 * @param uploaderPrivateKey - Private key of the uploader for signing the event
 * @returns Signed Nostr event ready for publishing
 */
export function createFileMetadata(
  file: LibraryFile,
  uploaderPrivateKey: string
): Event {
  // Create an event template
  const eventTemplate: EventTemplate = {
    kind: 1063, // NIP-94 file metadata
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['url', file.fileUrl],
      ['m', file.mimeType],
      ['x', file.hash],
      ['size', file.size.toString()],
      ['title', file.title],
      ['author', file.author],
      ['summary', file.description],
      ['category', file.category],
      ['access', file.accessLevel],
      ...file.tags.map(tag => ['t', tag])
    ],
    content: file.description
  };
  
  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(uploaderPrivateKey);
  
  // Finalize the event with the private key to add id and signature
  const event = finalizeEvent(eventTemplate, privateKeyBytes);
  
  return event;
}

/**
 * Creates a reading progress event for tracking user's progress with a file
 * 
 * @param fileId - ID of the file being read
 * @param progress - Reading progress percentage (0-100)
 * @param notes - User's notes about the file
 * @param readerPrivateKey - Private key of the reader for signing
 * @returns Signed reading progress event
 */
export function createReadingProgress(
  fileId: string,
  progress: number,
  notes: string,
  readerPrivateKey: string
): Event {
  // Create an event template
  const eventTemplate: EventTemplate = {
    kind: 30078, // NIP-78 app-specific data
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `reading-${fileId}`],
      ['file', fileId],
      ['progress', progress.toString()],
      ['last_read', new Date().toISOString()]
    ],
    content: JSON.stringify({
      notes,
      bookmarks: [],
      highlights: []
    })
  };
  
  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(readerPrivateKey);
  
  // Finalize the event with the private key to add id and signature
  const event = finalizeEvent(eventTemplate, privateKeyBytes);
  
  return event;
}

/**
 * Publishes a file metadata event to Nostr relays
 * 
 * @param file - Library file to publish
 * @param uploaderPrivateKey - Private key of the uploader
 * @returns Promise resolving to the published event
 */
export async function publishFileMetadata(
  file: LibraryFile,
  uploaderPrivateKey: string
): Promise<Event> {
  const event = createFileMetadata(file, uploaderPrivateKey);
  await nostrClient.publishEvent(event);
  return event;
}

/**
 * Fetches library files from Nostr relays
 * 
 * @param category - Optional category filter
 * @param limit - Maximum number of files to fetch
 * @returns Promise resolving to an array of file metadata events
 */
export async function fetchLibraryFiles(
  category?: string,
  limit: number = 50
): Promise<Event[]> {
  const filter: any = {
    kinds: [1063], // NIP-94 file metadata
    limit
  };
  
  if (category && category !== 'all') {
    filter['#category'] = [category];
  }
  
  return await nostrClient.queryEvents(filter);
}

/**
 * Publishes a reading progress event to Nostr relays
 * 
 * @param fileId - ID of the file being read
 * @param progress - Reading progress percentage (0-100)
 * @param notes - User's notes about the file
 * @param readerPrivateKey - Private key of the reader
 * @returns Promise resolving to the published event
 */
export async function publishReadingProgress(
  fileId: string,
  progress: number,
  notes: string,
  readerPrivateKey: string
): Promise<Event> {
  const event = createReadingProgress(fileId, progress, notes, readerPrivateKey);
  await nostrClient.publishEvent(event);
  return event;
}

/**
 * Fetches reading progress events for a user
 * 
 * @param userPubkey - Public key of the user
 * @param fileIds - Optional array of file IDs to filter by
 * @returns Promise resolving to an array of reading progress events
 */
export async function fetchReadingProgress(
  userPubkey: string,
  fileIds?: string[]
): Promise<Event[]> {
  const filter: any = {
    kinds: [30078], // NIP-78 app-specific data
    authors: [userPubkey],
    limit: 100
  };
  
  if (fileIds && fileIds.length > 0) {
    filter['#d'] = fileIds.map(id => `reading-${id}`);
  }
  
  return await nostrClient.queryEvents(filter);
}