// File: lib/badges.ts
import { finalizeEvent, getPublicKey, SimplePool } from 'nostr-tools';
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

export interface CourseBadge {
  badgeId: string;
  name: string;
  description: string;
  image: string;
  courseId: string;
  requirements: string[];
}

/**
 * Creates a badge definition event (NIP-58)
 * @param badge Badge details
 * @param privateKey Issuer's private key
 * @returns Nostr event for badge definition
 */
export function createBadgeDefinition(badge: CourseBadge, privateKey: string): Event {
  const event: Event = {
    kind: 30009, // NIP-58 badge definition
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', badge.badgeId],
      ['name', badge.name],
      ['description', badge.description],
      ['image', badge.image],
      ['thumb', badge.image.replace('.png', '-thumb.png')],
      ['course', badge.courseId],
      ...badge.requirements.map(req => ['requirement', req])
    ],
    content: JSON.stringify({
      criteria: badge.requirements,
      issuer: 'citadel.academy'
    }),
    pubkey: '', // Will be set by finalizeEvent
    id: '', // Will be set by finalizeEvent
    sig: '' // Will be set by finalizeEvent
  } as Event;
  
  // Convert hex private key to Uint8Array for nostr-tools v2
  const privateKeyBytes = hexToBytes(privateKey);
  return finalizeEvent(event, privateKeyBytes);
}

/**
 * Creates a badge award event (NIP-58)
 * @param badgeId Badge identifier
 * @param recipientPubkey Public key of the badge recipient
 * @param issuerPrivateKey Private key of the badge issuer
 * @returns Nostr event for badge award
 */
export function awardBadge(
  badgeId: string,
  recipientPubkey: string,
  issuerPrivateKey: string
): Event {
  // Convert hex private key to Uint8Array for nostr-tools v2
  const privateKeyBytes = hexToBytes(issuerPrivateKey);
  const pubkey = getPublicKey(privateKeyBytes);
  
  const event: Event = {
    kind: 8, // NIP-58 badge award
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['a', `30009:${pubkey}:${badgeId}`], // Reference to badge definition
      ['p', recipientPubkey], // Recipient
      ['e', badgeId] // Badge event reference
    ],
    content: `Congratulations! You've earned the ${badgeId} badge.`,
    pubkey: '', // Will be set by finalizeEvent
    id: '', // Will be set by finalizeEvent
    sig: '' // Will be set by finalizeEvent
  } as Event;
  
  // We already have privateKeyBytes from above
  return finalizeEvent(event, privateKeyBytes);
}

/**
 * Publishes a badge definition to relays
 * @param badge Badge details
 * @param privateKey Issuer's private key
 * @returns Array of relay URLs where the badge was published
 */
export async function publishBadgeDefinition(
  badge: CourseBadge,
  privateKey: string
): Promise<string[]> {
  const pool = new SimplePool();
  const relays = getRelays();
  
  try {
    const event = createBadgeDefinition(badge, privateKey);
    const pubs = pool.publish(relays, event);
    
    // Wait for all publications to complete
    const pubResults = await Promise.all(pubs);
    return pubResults;
  } catch (error) {
    console.error('Error publishing badge definition:', error);
    return [];
  } finally {
    pool.close(relays);
  }
}

/**
 * Awards a badge to a recipient and publishes to relays
 * @param badgeId Badge identifier
 * @param recipientPubkey Public key of the badge recipient
 * @param issuerPrivateKey Private key of the badge issuer
 * @returns Array of relay URLs where the award was published
 */
export async function publishBadgeAward(
  badgeId: string,
  recipientPubkey: string,
  issuerPrivateKey: string
): Promise<string[]> {
  const pool = new SimplePool();
  const relays = getRelays();
  
  try {
    const event = awardBadge(badgeId, recipientPubkey, issuerPrivateKey);
    const pubs = pool.publish(relays, event);
    
    // Wait for all publications to complete
    const pubResults = await Promise.all(pubs);
    return pubResults;
  } catch (error) {
    console.error('Error publishing badge award:', error);
    return [];
  } finally {
    pool.close(relays);
  }
}

/**
 * Fetches all badge definitions from a specific issuer
 * @param issuerPubkey Public key of the badge issuer
 * @returns Array of badge definition events
 */
export async function fetchBadgeDefinitions(issuerPubkey: string): Promise<Event[]> {
  const pool = new SimplePool();
  const relays = getRelays();
  
  try {
    // In nostr-tools v2, we use querySync instead of list/query
    const events = await pool.querySync(relays, {
      kinds: [30009],
      authors: [issuerPubkey],
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching badge definitions:', error);
    return [];
  } finally {
    pool.close(relays);
  }
}

/**
 * Fetches all badges awarded to a specific user
 * @param userPubkey Public key of the user
 * @returns Array of badge award events
 */
export async function fetchUserBadges(userPubkey: string): Promise<Event[]> {
  const pool = new SimplePool();
  const relays = getRelays();
  
  try {
    // In nostr-tools v2, we use querySync instead of list/query
    const events = await pool.querySync(relays, {
      kinds: [8],
      '#p': [userPubkey],
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  } finally {
    pool.close(relays);
  }
}