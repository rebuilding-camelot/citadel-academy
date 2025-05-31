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

export interface StudentProgress {
  studentPubkey: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
  timeSpent: number; // minutes
  lastAccessed: Date;
}

/**
 * Creates and signs a NIP-78 application-specific data event for student progress tracking
 * @param progress Student progress information
 * @param privateKey Private key in hex format for signing the event
 * @returns Signed Nostr event
 */
export function updateStudentProgress(
  progress: StudentProgress,
  privateKey: string
): Event {
  const event = {
    kind: 30078, // NIP-78 application-specific data
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `progress-${progress.courseId}`],
      ['course', progress.courseId],
      ['student', progress.studentPubkey],
      ['progress', progress.progressPercentage.toString()],
      ['current_lesson', progress.currentLesson],
      ['time_spent', progress.timeSpent.toString()],
      ['last_accessed', progress.lastAccessed.toISOString()]
    ],
    content: JSON.stringify({
      completedLessons: progress.completedLessons,
      achievements: [],
      notes: ''
    }),
    pubkey: '', // Will be set during signing
    id: '', // Will be set during signing
    sig: '' // Will be set during signing
  } as Event;

  // Convert hex private key to Uint8Array for nostr-tools v2
  const privateKeyBytes = hexToBytes(privateKey);
  
  // Use finalizeEvent to set pubkey, id, and signature
  return finalizeEvent(event, privateKeyBytes);
}

/**
 * Fetches progress events for a student
 * @param studentPubkey Student's public key in hex format
 * @param courseId Optional course ID to filter by
 * @returns Promise that resolves with an array of progress events
 */
export async function fetchStudentProgress(studentPubkey: string, courseId?: string): Promise<Event[]> {
  return new Promise((resolve) => {
    const progressEvents: Event[] = [];
    const relays = getRelays();
    
    const filter: any = {
      kinds: [30078],
      authors: [studentPubkey],
      '#d': courseId ? [`progress-${courseId}`] : ['progress-']
    };
    
    // Subscribe to progress events
    const sub = window.client.subscribe(
      relays,
      [filter]
    );
    
    sub.on('event', (event: Event) => {
      progressEvents.push(event);
    });
    
    // Resolve after a timeout or when EOSE is received
    sub.on('eose', () => {
      setTimeout(() => {
        resolve(progressEvents);
      }, 1000);
    });
    
    // Fallback timeout
    setTimeout(() => {
      resolve(progressEvents);
    }, 5000);
  });
}

/**
 * Parses a progress event into a StudentProgress object
 * @param event Nostr event of kind 30078 (NIP-78)
 * @returns StudentProgress object
 */
export function parseProgressEvent(event: Event): StudentProgress {
  const courseId = event.tags.find(tag => tag[0] === 'course')?.[1] || '';
  const studentPubkey = event.tags.find(tag => tag[0] === 'student')?.[1] || '';
  const progressPercentage = parseInt(event.tags.find(tag => tag[0] === 'progress')?.[1] || '0');
  const currentLesson = event.tags.find(tag => tag[0] === 'current_lesson')?.[1] || '';
  const timeSpent = parseInt(event.tags.find(tag => tag[0] === 'time_spent')?.[1] || '0');
  const lastAccessedStr = event.tags.find(tag => tag[0] === 'last_accessed')?.[1] || '';
  
  let content;
  try {
    content = JSON.parse(event.content);
  } catch (error) {
    content = { completedLessons: [] };
  }
  
  return {
    studentPubkey,
    courseId,
    completedLessons: content.completedLessons || [],
    currentLesson,
    progressPercentage,
    timeSpent,
    lastAccessed: new Date(lastAccessedStr)
  };
}

/**
 * Publishes a progress event to relays
 * @param event Signed Nostr event
 * @returns Promise that resolves when the event is published
 */
export async function publishProgressEvent(event: Event): Promise<void> {
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

// Add TypeScript declarations for client
declare global {
  interface Window {
    client: {
      getPublicKey: (privateKey: string) => string;
      publishEvent: (event: Event, callback: (status: string, relay: any) => void) => void;
      subscribe: (relays: string[], filters: any[]) => any;
    };
  }
}