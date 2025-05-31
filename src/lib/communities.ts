import { getEventHash, finalizeEvent } from 'nostr-tools/pure';
import type { Event } from 'nostr-tools';
import { getRelays } from './nostrUtils';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface CourseCohort {
  cohortId: string;
  name: string;
  courseId: string;
  instructorPubkey: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
}

/**
 * Creates a NIP-72 community definition event for a course cohort
 * @param cohort Course cohort information
 * @param privateKey Private key in hex format for signing the event
 * @returns Signed Nostr event
 */
export function createCohortCommunity(cohort: CourseCohort, privateKey: string): Event {
  const event = {
    kind: 34550, // NIP-72 community definition
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', cohort.cohortId],
      ['name', cohort.name],
      ['description', `Course cohort for ${cohort.courseId}`],
      ['image', `https://citadel.academy/courses/${cohort.courseId}/banner.png`],
      ['p', cohort.instructorPubkey, '', 'moderator'],
      ['course', cohort.courseId],
      ['start_date', cohort.startDate.toISOString()],
      ['end_date', cohort.endDate.toISOString()],
      ['max_students', cohort.maxStudents.toString()]
    ],
    content: JSON.stringify({
      rules: [
        'Be respectful to all cohort members',
        'Stay on topic related to the course material',
        'Help fellow students when possible'
      ],
      schedule: 'Weekly live sessions on Fridays 2PM UTC'
    }),
    pubkey: '', // Will be set during signing
    id: '', // Will be set during signing
    sig: '' // Will be set during signing
  } as Event;

  // Use finalizeEvent to set pubkey, id, and signature
  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(privateKey);
  return finalizeEvent(event, privateKeyBytes);
}

/**
 * Creates a NIP-72 community approval event for a student joining a cohort
 * @param cohortId Cohort identifier
 * @param studentPubkey Student's public key in hex format
 * @param instructorPrivateKey Instructor's private key in hex format for signing
 * @returns Signed Nostr event
 */
export function joinCohort(cohortId: string, studentPubkey: string, instructorPrivateKey: string): Event {
  const event = {
    kind: 34551, // NIP-72 community approval
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['a', `34550:${cohortId}`], // Reference to community
      ['p', studentPubkey]
    ],
    content: 'Student approved for cohort participation',
    pubkey: '', // Will be set during signing
    id: '', // Will be set during signing
    sig: '' // Will be set during signing
  } as Event;

  // Use finalizeEvent to set pubkey, id, and signature
  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(instructorPrivateKey);
  return finalizeEvent(event, privateKeyBytes);
}

/**
 * Publishes a Nostr event to relays
 * @param event Signed Nostr event
 * @returns Promise that resolves when the event is published
 */
export async function publishEvent(event: Event): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      window.client.publishEvent(event, (status: string, relay: any) => {
        if (status === 'ok') {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Fetches community chat messages for a cohort
 * @param cohortId Cohort identifier
 * @returns Promise that resolves with an array of chat message events
 */
export async function fetchCohortMessages(cohortId: string): Promise<Event[]> {
  return new Promise((resolve) => {
    const messages: Event[] = [];
    const relays = getRelays();
    
    // Subscribe to community chat messages
    const sub = window.client.subscribe(
      relays,
      [
        {
          kinds: [42], // NIP-72 community chat messages
          '#a': [`34550:${cohortId}`]
        }
      ]
    );
    
    sub.on('event', (event: Event) => {
      messages.push(event);
    });
    
    // Resolve after a timeout or when EOSE is received
    sub.on('eose', () => {
      setTimeout(() => {
        resolve(messages);
      }, 1000);
    });
    
    // Fallback timeout
    setTimeout(() => {
      resolve(messages);
    }, 5000);
  });
}