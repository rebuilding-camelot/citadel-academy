// File: lib/courseContent.ts
import { getEventHash, finalizeEvent, getPublicKey } from 'nostr-tools/pure';
import type { Event } from 'nostr-tools';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  courseId: string;
  order: number;
  tags: string[];
}

export function createLessonEvent(
  lesson: CourseLesson,
  privateKey: string
): Event {
  const event: Event = {
    kind: 30023, // NIP-23 long-form content
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', lesson.id], // NIP-33 identifier
      ['title', lesson.title],
      ['course', lesson.courseId],
      ['order', lesson.order.toString()],
      ...lesson.tags.map(tag => ['t', tag])
    ],
    content: lesson.content,
    pubkey: '', // Will be set by finalizeEvent
    id: '', // Will be set by finalizeEvent
    sig: '' // Will be set by finalizeEvent
  } as Event;
  
  // Convert hex private key to Uint8Array for nostr-tools v2
  const privateKeyBytes = hexToBytes(privateKey);
  return finalizeEvent(event, privateKeyBytes);
}

// Function to fetch lessons for a specific course
export async function fetchCourseLessons(
  courseId: string, 
  relays: string[]
): Promise<Event[]> {
  const { SimplePool } = await import('nostr-tools/pool');
  const pool = new SimplePool();
  
  try {
    // In nostr-tools v2, we use querySync instead of query
    const events = await pool.querySync(relays, {
      kinds: [30023],
      '#course': [courseId],
    });
    
    // Sort by order tag
    return events.sort((a, b) => {
      const orderA = parseInt(a.tags.find(tag => tag[0] === 'order')?.[1] || '0');
      const orderB = parseInt(b.tags.find(tag => tag[0] === 'order')?.[1] || '0');
      return orderA - orderB;
    });
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    return [];
  } finally {
    pool.close(relays);
  }
}

// Function to fetch a specific lesson by ID
export async function fetchLesson(
  lessonId: string,
  relays: string[]
): Promise<Event | null> {
  const { SimplePool } = await import('nostr-tools/pool');
  const pool = new SimplePool();
  
  try {
    // In nostr-tools v2, we use querySync instead of query
    const events = await pool.querySync(relays, {
      kinds: [30023],
      '#d': [lessonId],
    });
    
    return events.length > 0 ? events[0] : null;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  } finally {
    pool.close(relays);
  }
}

// Function to publish a lesson to relays
export async function publishLesson(
  lesson: CourseLesson,
  privateKey: string,
  relays: string[]
): Promise<string[]> {
  const { SimplePool } = await import('nostr-tools/pool');
  const pool = new SimplePool();
  
  try {
    const event = createLessonEvent(lesson, privateKey);
    const pubs = pool.publish(relays, event);
    
    // Wait for all publications to complete
    const pubResults = await Promise.all(pubs);
    return pubResults;
  } catch (error) {
    console.error('Error publishing lesson:', error);
    return [];
  } finally {
    pool.close(relays);
  }
}