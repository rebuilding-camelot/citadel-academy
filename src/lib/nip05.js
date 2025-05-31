import { nip05 } from 'nostr-tools';

export const CITADEL_RELAY = 'wss://relay.nostr.band'; // Using this as the default citadel relay

/**
 * @typedef {Object} CitadelUser
 * @property {string} username - The user's username
 * @property {string} pubkey - The user's public key
 * @property {string[]} relays - Array of relay URLs
 * @property {boolean} verified - Whether the user is verified
 */

/**
 * Verifies a user's NIP-05 identifier against the whitelist
 * Only accepts identifiers from the satnam.pub domain for now
 * 
 * @param {string} identifier - The NIP-05 identifier (e.g., username@satnam.pub)
 * @returns {Promise<CitadelUser | null>} - The verified user or null if verification fails
 */
export async function verifyCitadelUser(identifier) {
  try {
    // Only allow satnam.pub domain for now
    if (!identifier.endsWith('@satnam.pub')) {
      console.error('NIP-05 verification failed: Only satnam.pub domain is authorized');
      return null;
    }
    
    const profile = await nip05.queryProfile(identifier);
    if (!profile) return null;
    
    return {
      username: identifier.split('@')[0],
      pubkey: profile.pubkey,
      relays: profile.relays || [CITADEL_RELAY],
      verified: true
    };
  } catch (error) {
    console.error('NIP-05 verification failed:', error);
    return null;
  }
}

/**
 * Checks if a user is in the membership whitelist
 * 
 * @param {string} pubkey - The user's public key
 * @returns {Promise<boolean>} - Whether the user is in the whitelist
 */
export async function isUserInWhitelist(pubkey) {
  // This would typically query your database or other storage
  // For now, we'll just return true for testing purposes
  return true;
}