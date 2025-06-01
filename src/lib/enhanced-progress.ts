// File: lib/enhanced-progress.ts
// Prompt: "Extend NIP-78 progress tracking to include NIP-94 file interactions"
import { Event } from 'nostr-tools';
import { getEventHash, finalizeEvent } from 'nostr-tools/pure';
import { StudentProgress } from './progress';
import { getRelays } from './nostrUtils';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface EnhancedStudentProgress extends StudentProgress {
  filesAccessed: string[]; // NIP-94 file event IDs
  purchaseHistory: string[]; // NIP-15 purchase order IDs
  libraryInteractions: LibraryInteraction[];
}

export interface LibraryInteraction {
  fileEventId: string;
  interactionType: 'download' | 'view' | 'bookmark' | 'highlight';
  timestamp: Date;
  duration?: number; // seconds
  progress?: number; // percentage for videos/audio
}

/**
 * Creates and signs an enhanced NIP-78 application-specific data event for student progress tracking
 * @param progress Enhanced student progress information
 * @param privateKey Private key in hex format for signing the event
 * @returns Signed Nostr event
 */
export function createEnhancedProgressEvent(
  progress: EnhancedStudentProgress,
  privateKey: string
): Event {
  const event = {
    kind: 30078, // NIP-78 application-specific data
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `enhanced-progress-${progress.courseId}`],
      ['course', progress.courseId],
      ['student', progress.studentPubkey],
      ['progress', progress.progressPercentage.toString()],
      ['current_lesson', progress.currentLesson],
      ['time_spent', progress.timeSpent.toString()],
      ['files_accessed', progress.filesAccessed.length.toString()],
      ['purchases_made', progress.purchaseHistory.length.toString()],
      ...progress.filesAccessed.map(fileId => ['file', fileId]),
      ...progress.purchaseHistory.map(purchaseId => ['purchase', purchaseId])
    ],
    content: JSON.stringify({
      completedLessons: progress.completedLessons,
      libraryInteractions: progress.libraryInteractions,
      achievements: [],
      notes: '',
      bookmarks: [],
      highlights: []
    }),
    pubkey: '', // Will be set during signing
    id: '', // Will be set during signing
    sig: '' // Will be set during signing
  } as Event;

  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(privateKey);
  
  // Use finalizeEvent to set pubkey, id, and signature
  return finalizeEvent(event, privateKeyBytes);
}

/**
 * Fetches enhanced progress events for a student
 * @param studentPubkey Student's public key in hex format
 * @param courseId Optional course ID to filter by
 * @returns Promise that resolves with an array of progress events
 */
export async function getStudentProgress(studentPubkey: string, courseId?: string): Promise<EnhancedStudentProgress> {
  return new Promise((resolve, reject) => {
    const progressEvents: Event[] = [];
    const relays = getRelays();
    
    const filter: any = {
      kinds: [30078],
      authors: [studentPubkey],
      '#d': courseId ? [`enhanced-progress-${courseId}`] : ['enhanced-progress-']
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
        if (progressEvents.length > 0) {
          // Sort by created_at to get the latest
          progressEvents.sort((a, b) => b.created_at - a.created_at);
          const latestEvent = progressEvents[0];
          resolve(parseEnhancedProgressEvent(latestEvent));
        } else {
          // Return empty progress if no events found
          resolve({
            studentPubkey,
            courseId: courseId || 'library',
            completedLessons: [],
            currentLesson: '',
            progressPercentage: 0,
            timeSpent: 0,
            lastAccessed: new Date(),
            filesAccessed: [],
            purchaseHistory: [],
            libraryInteractions: []
          });
        }
      }, 1000);
    });
    
    // Fallback timeout
    setTimeout(() => {
      if (progressEvents.length > 0) {
        // Sort by created_at to get the latest
        progressEvents.sort((a, b) => b.created_at - a.created_at);
        const latestEvent = progressEvents[0];
        resolve(parseEnhancedProgressEvent(latestEvent));
      } else {
        // Return empty progress if no events found
        resolve({
          studentPubkey,
          courseId: courseId || 'library',
          completedLessons: [],
          currentLesson: '',
          progressPercentage: 0,
          timeSpent: 0,
          lastAccessed: new Date(),
          filesAccessed: [],
          purchaseHistory: [],
          libraryInteractions: []
        });
      }
    }, 5000);
  });
}

/**
 * Parses an enhanced progress event into an EnhancedStudentProgress object
 * @param event Nostr event of kind 30078 (NIP-78)
 * @returns EnhancedStudentProgress object
 */
export function parseEnhancedProgressEvent(event: Event): EnhancedStudentProgress {
  const courseId = event.tags.find(tag => tag[0] === 'course')?.[1] || '';
  const studentPubkey = event.tags.find(tag => tag[0] === 'student')?.[1] || '';
  const progressPercentage = parseInt(event.tags.find(tag => tag[0] === 'progress')?.[1] || '0');
  const currentLesson = event.tags.find(tag => tag[0] === 'current_lesson')?.[1] || '';
  const timeSpent = parseInt(event.tags.find(tag => tag[0] === 'time_spent')?.[1] || '0');
  const lastAccessedStr = event.tags.find(tag => tag[0] === 'last_accessed')?.[1] || '';
  
  // Get file IDs from tags
  const filesAccessed = event.tags
    .filter(tag => tag[0] === 'file')
    .map(tag => tag[1]);
  
  // Get purchase IDs from tags
  const purchaseHistory = event.tags
    .filter(tag => tag[0] === 'purchase')
    .map(tag => tag[1]);
  
  let content;
  try {
    content = JSON.parse(event.content);
  } catch (error) {
    content = { 
      completedLessons: [],
      libraryInteractions: []
    };
  }
  
  return {
    studentPubkey,
    courseId,
    completedLessons: content.completedLessons || [],
    currentLesson,
    progressPercentage,
    timeSpent,
    lastAccessed: new Date(lastAccessedStr || Date.now()),
    filesAccessed,
    purchaseHistory,
    libraryInteractions: content.libraryInteractions || []
  };
}

/**
 * Publishes an enhanced progress event to relays
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
 * Tracks file interaction and updates student progress
 * @param fileEvent File event
 * @param interactionType Type of interaction
 * @param studentPubkey Student's public key
 * @param duration Optional duration of interaction in seconds
 * @param progress Optional progress percentage (0-100)
 * @returns Promise that resolves when tracking is complete
 */
export async function trackFileInteraction(
  fileEvent: Event,
  interactionType: LibraryInteraction['interactionType'],
  studentPubkey: string,
  duration?: number,
  progress?: number
): Promise<void> {
  const interaction: LibraryInteraction = {
    fileEventId: fileEvent.id,
    interactionType,
    timestamp: new Date(),
    duration,
    progress
  };
  
  // Get existing progress
  const existingProgress = await getStudentProgress(studentPubkey, 'library');
  
  // Update with new interaction
  const updatedProgress: EnhancedStudentProgress = {
    ...existingProgress,
    libraryInteractions: [...existingProgress.libraryInteractions, interaction],
    filesAccessed: [...new Set([...existingProgress.filesAccessed, fileEvent.id])]
  };
  
  // Publish updated progress
  const progressEvent = createEnhancedProgressEvent(updatedProgress, 'student-private-key');
  await publishEvent(progressEvent);
}

/**
 * Updates purchase history for a student
 * @param studentPubkey Student's public key
 * @param productId Product ID
 * @param paymentResult Payment result
 * @returns Promise that resolves when update is complete
 */
export async function updatePurchaseHistory(
  studentPubkey: string,
  productId: string,
  paymentResult: any
): Promise<void> {
  // Get existing progress
  const existingProgress = await getStudentProgress(studentPubkey, 'library');
  
  // Update purchase history
  const updatedProgress: EnhancedStudentProgress = {
    ...existingProgress,
    purchaseHistory: [...new Set([...existingProgress.purchaseHistory, productId])]
  };
  
  // Publish updated progress
  const progressEvent = createEnhancedProgressEvent(updatedProgress, 'student-private-key');
  await publishEvent(progressEvent);
}