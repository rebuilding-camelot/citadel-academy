/**
 * Utility functions for cryptographic operations
 */

/**
 * Converts a hexadecimal string to a Uint8Array
 * @param hex - Hexadecimal string to convert
 * @returns Uint8Array representation of the hex string
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random key
 * @param length - Length of the key in bytes (default: 32)
 * @returns Random key as Uint8Array
 */
export function generateSecureKey(length: number = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}