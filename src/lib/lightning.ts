// File: lib/lightning.ts
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

export interface CoursePayment {
  courseId: string;
  amount: number; // sats
  description: string;
  studentPubkey: string;
}

/**
 * Creates a zap request event for course payment
 * @param payment Payment details
 * @param privateKey Student's private key for signing
 * @returns Signed zap request event
 */
export function createZapRequest(payment: CoursePayment, privateKey: string): Event {
  const zapRequest: Event = {
    kind: 9734, // NIP-57 zap request
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', payment.studentPubkey],
      ['amount', payment.amount.toString()],
      ['relays', ...getRelays()],
      ['course', payment.courseId]
    ],
    content: payment.description,
    pubkey: '', // Will be set by finalizeEvent
    id: '', // Will be set by finalizeEvent
    sig: '' // Will be set by finalizeEvent
  } as Event;
  
  // Convert hex private key to Uint8Array for nostr-tools v2
  const privateKeyBytes = hexToBytes(privateKey);
  return finalizeEvent(zapRequest, privateKeyBytes);
}

/**
 * Creates a course invoice using NIP-57 zap request
 * @param payment Payment details
 * @param privateKey Student's private key for signing
 * @returns Lightning invoice
 */
export async function createCourseInvoice(payment: CoursePayment, privateKey: string): Promise<string> {
  const zapRequest = createZapRequest(payment, privateKey);
  
  // Generate LNURL-pay request
  const lnurlResponse = await fetch('/api/lnurl/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: payment.amount * 1000, // Convert to msats
      zapRequest: JSON.stringify(zapRequest),
      courseId: payment.courseId
    })
  });
  
  if (!lnurlResponse.ok) {
    const errorData = await lnurlResponse.json();
    throw new Error(`Failed to create invoice: ${errorData.message || lnurlResponse.statusText}`);
  }
  
  const { pr } = await lnurlResponse.json();
  return pr;
}

/**
 * Verifies a zap receipt
 * @param zapReceipt Zap receipt event
 * @param expectedCourseId Expected course ID
 * @param expectedAmount Expected amount in sats
 * @returns Boolean indicating if the receipt is valid
 */
export function verifyZapReceipt(zapReceipt: Event, expectedCourseId: string, expectedAmount?: number): boolean {
  if (zapReceipt.kind !== 9735) {
    return false;
  }
  
  // Check if this is a course payment
  const courseTag = zapReceipt.tags.find(tag => tag[0] === 'course');
  if (!courseTag || courseTag[1] !== expectedCourseId) {
    return false;
  }
  
  // Check amount if provided
  if (expectedAmount !== undefined) {
    const amountTag = zapReceipt.tags.find(tag => tag[0] === 'amount');
    if (!amountTag) return false;
    
    const amount = parseInt(amountTag[1], 10);
    if (isNaN(amount) || amount < expectedAmount * 1000) { // Convert to msats for comparison
      return false;
    }
  }
  
  return true;
}

/**
 * Listens for zap receipts for a specific course payment
 * @param courseId Course ID
 * @param studentPubkey Student's public key
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise that resolves with the zap receipt event or null if timeout
 */
export async function listenForZapReceipt(
  courseId: string,
  studentPubkey: string,
  timeoutMs = 60000
): Promise<Event | null> {
  const { SimplePool } = await import('nostr-tools/pool');
  const pool = new SimplePool();
  const relays = getRelays();
  
  return new Promise((resolve) => {
    let timeout: NodeJS.Timeout;
    
    const sub = pool.subscribe(relays, {
      kinds: [9735], // Zap receipts
      '#p': [studentPubkey],
      '#course': [courseId],
      since: Math.floor(Date.now() / 1000) - 60, // Last minute
    }, {
      onevent(event: Event) {
        if (verifyZapReceipt(event, courseId)) {
          clearTimeout(timeout);
          sub.close();
          pool.close(relays);
          resolve(event);
        }
      }
    });
    
    timeout = setTimeout(() => {
      sub.close();
      pool.close(relays);
      resolve(null);
    }, timeoutMs);
  });
}

/**
 * Checks if a user has purchased a course
 * @param courseId Course ID
 * @param userPubkey User's public key
 * @returns Boolean indicating if the user has purchased the course
 */
export async function hasUserPurchasedCourse(courseId: string, userPubkey: string): Promise<boolean> {
  const { SimplePool } = await import('nostr-tools/pool');
  const pool = new SimplePool();
  const relays = getRelays();
  
  try {
    const events = await pool.querySync(relays, {
      kinds: [9735], // Zap receipts
      '#p': [userPubkey],
      '#course': [courseId],
    });
    
    return events.length > 0;
  } catch (error) {
    console.error('Error checking course purchase:', error);
    return false;
  } finally {
    pool.close(relays);
  }
}