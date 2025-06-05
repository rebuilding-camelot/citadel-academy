import { getEventHash, finalizeEvent } from 'nostr-tools/pure';
import type { Event } from 'nostr-tools';
import { getRelays, normalizePrivateKey } from './nostrUtils';

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
 * Creates and signs a NIP-78 application-specific data event for student progress tracking
 * @param progress Student progress information
 * @param privateKey Private key in hex format for signing the event, or special marker for extension signing
 * @returns Promise that resolves with a signed Nostr event
 */
export async function updateStudentProgress(
  progress: StudentProgress,
  privateKey: string
): Promise<Event> {
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

  // Use the common signEvent function to handle all signing methods
  return await signEvent(event, privateKey);
}

/**
 * Creates and signs an enhanced NIP-78 application-specific data event for student progress tracking
 * @param progress Enhanced student progress information
 * @param privateKey Private key in hex format for signing the event, or special marker for extension signing
 * @returns Promise that resolves with a signed Nostr event
 */
export async function createEnhancedProgressEvent(
  progress: EnhancedStudentProgress,
  privateKey: string
): Promise<Event> {
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

  // Use the common signEvent function to handle all signing methods
  return await signEvent(event, privateKey);
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
 * Publishes a progress event to relays
 * @param event Signed Nostr event
 * @returns Promise that resolves when the event is published
 */
export async function publishProgressEvent(event: Event): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure event is properly signed before publishing
      if (!event.sig) {
        reject(new Error('Cannot publish unsigned event. Event signature is missing.'));
        return;
      }
      
      window.client.publishEvent(event, (status: string, relay: any) => {
        if (status === 'ok') {
          resolve();
        } else if (status === 'failed') {
          console.warn(`Failed to publish to relay: ${relay}`);
          // We still resolve as other relays might succeed
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
  
  // Resolve private key securely
  const privateKey = await resolvePrivateKey();
  
  // Publish updated progress
  const progressEvent = await createEnhancedProgressEvent(updatedProgress, privateKey);
  await publishProgressEvent(progressEvent);
}

/**
 * Updates purchase history for a student
 * @param studentPubkey Student's public key
 * @param productId Product ID
 * @param paymentResult Payment result with transaction details
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
  
  // Resolve private key securely
  const privateKey = await resolvePrivateKey();
  
  // Create the event with payment information included
  const event = {
    kind: 30078, // NIP-78 application-specific data
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `enhanced-progress-${existingProgress.courseId}`],
      ['course', existingProgress.courseId],
      ['student', studentPubkey],
      ['progress', updatedProgress.progressPercentage.toString()],
      ['current_lesson', updatedProgress.currentLesson],
      ['time_spent', updatedProgress.timeSpent.toString()],
      ['files_accessed', updatedProgress.filesAccessed.length.toString()],
      ['purchases_made', updatedProgress.purchaseHistory.length.toString()],
      // Include payment information for auditability
      ['payment', paymentResult.id || ''],
      ['product', productId],
      ...updatedProgress.filesAccessed.map(fileId => ['file', fileId]),
      ...updatedProgress.purchaseHistory.map(purchaseId => ['purchase', purchaseId])
    ],
    content: JSON.stringify({
      completedLessons: updatedProgress.completedLessons,
      libraryInteractions: updatedProgress.libraryInteractions,
      achievements: [],
      notes: '',
      bookmarks: [],
      highlights: [],
      // Include payment details in content for complete record
      paymentDetails: {
        id: paymentResult.id,
        timestamp: paymentResult.timestamp || new Date().toISOString(),
        productId,
        status: paymentResult.status || 'completed'
      }
    }),
    pubkey: '', // Will be set during signing
    id: '', // Will be set during signing
    sig: '' // Will be set during signing
  } as Event;
  
  // Sign and publish the event
  const signedEvent = await signEvent(event, privateKey);
  await publishProgressEvent(signedEvent);
}

/**
 * Securely resolves a private key for signing events
 * Tries multiple sources in order of security preference:
 * 1. Nostr browser extension (NIP-07)
 * 2. User keys stored in window object
 * 3. Environment variables
 * @returns Promise that resolves with a private key in hex format
 * @throws Error if no private key can be resolved
 */
export async function resolvePrivateKey(): Promise<string> {
  // First try: Use Nostr browser extension (NIP-07)
  if (window.nostr) {
    try {
      // NIP-07 extensions don't expose private keys directly
      // Instead, we'll return a special marker that will trigger
      // the use of window.nostr.signEvent() in the calling function
      return 'USE_EXTENSION';
    } catch (error) {
      console.error('Error accessing Nostr extension:', error);
    }
  }
  
  // Second try: Check for user keys in window object
  if (window.userKeys?.privateKey) {
    return normalizePrivateKey(window.userKeys.privateKey);
  }
  
  // Third try: Check for client with signing capability
  if (window.nostrClient?.signEvent) {
    return 'USE_CLIENT';
  }
  
  // We no longer use hardcoded private keys, even in development
  // Instead, we require proper authentication
  throw new Error('No private key available for signing. Please connect a Nostr extension or sign in.');
}

/**
 * Signs an event using the appropriate method based on the privateKey value
 * @param event The event to sign
 * @param privateKey The private key or special marker
 * @returns Promise that resolves with a signed event
 */
export async function signEvent(event: Event, privateKey: string): Promise<Event> {
  // Handle different signing methods based on privateKey value
  if (privateKey === 'USE_EXTENSION' && window.nostr) {
    // Use NIP-07 browser extension for signing
    // First set the pubkey
    event.pubkey = await window.nostr.getPublicKey();
    // Then sign the event
    return await window.nostr.signEvent(event);
  } else if (privateKey === 'USE_CLIENT' && window.nostrClient) {
    // Use client's signing capability
    event.pubkey = window.nostrClient.getPublicKey();
    return await window.nostrClient.signEvent(event);
  } else {
    // Use direct signing with private key
    // Convert hex private key to Uint8Array for nostr-tools
    const privateKeyBytes = hexToBytes(normalizePrivateKey(privateKey));
    
    // Use finalizeEvent to set pubkey, id, and signature
    return finalizeEvent(event, privateKeyBytes);
  }
}

// Window interface is defined in src/types/window.d.ts