// Utility functions for working with Nostr
import { nip19 } from 'nostr-tools';

/**
 * Converts a private key from nsec format to hex format
 * @param key - Private key in nsec or hex format
 * @returns Private key in hex format
 */
export function normalizePrivateKey(key: string): string {
  if (!key) return '';
  
  // If it's already a hex key (64 chars)
  if (/^[0-9a-f]{64}$/.test(key)) {
    return key;
  }
  
  // If it's an nsec key
  if (key.startsWith('nsec1')) {
    try {
      const { data } = nip19.decode(key);
      return data as string;
    } catch (error) {
      console.error('Invalid nsec key:', error);
      return '';
    }
  }
  
  // Invalid format
  console.error('Invalid private key format');
  return '';
}

/**
 * Converts a public key from npub format to hex format
 * @param key - Public key in npub or hex format
 * @returns Public key in hex format
 */
export function normalizePublicKey(key: string): string {
  if (!key) return '';
  
  // If it's already a hex key (64 chars)
  if (/^[0-9a-f]{64}$/.test(key)) {
    return key;
  }
  
  // If it's an npub key
  if (key.startsWith('npub1')) {
    try {
      const { data } = nip19.decode(key);
      return data as string;
    } catch (error) {
      console.error('Invalid npub key:', error);
      return '';
    }
  }
  
  // Invalid format
  console.error('Invalid public key format');
  return '';
}

/**
 * Formats a public key for display
 * @param pubkey - Public key in hex format
 * @param asNpub - Whether to return as npub format
 * @returns Formatted public key
 */
export function formatPublicKey(pubkey: string, asNpub = false): string {
  if (!pubkey) return '';
  
  if (asNpub) {
    try {
      return nip19.npubEncode(pubkey);
    } catch (error) {
      console.error('Error encoding npub:', error);
      return '';
    }
  }
  
  // Short format (first 8 chars...last 4 chars)
  return `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`;
}

/**
 * Gets relays from environment variables or returns defaults
 * @returns Array of relay URLs
 */
export function getRelays(): string[] {
  return import.meta.env.VITE_NWC_RELAYS 
    ? (import.meta.env.VITE_NWC_RELAYS as string).split(',') 
    : ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'];
}