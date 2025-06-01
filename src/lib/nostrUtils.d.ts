/**
 * Type declarations for nostrUtils.js
 */

/**
 * Converts a private key from nsec format to hex format
 * @param key - Private key in nsec or hex format
 * @returns Private key in hex format
 */
export function normalizePrivateKey(key: string): string;

/**
 * Converts a public key from npub format to hex format
 * @param key - Public key in npub or hex format
 * @returns Public key in hex format
 */
export function normalizePublicKey(key: string): string;

/**
 * Formats a public key for display
 * @param pubkey - Public key in hex format
 * @param asNpub - Whether to return as npub format
 * @returns Formatted public key
 */
export function formatPublicKey(pubkey: string, asNpub?: boolean): string;

/**
 * Gets relays from environment variables or returns defaults
 * @returns Array of relay URLs
 */
export function getRelays(): string[];