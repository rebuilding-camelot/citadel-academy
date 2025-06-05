import { AuthenticatedLightningArgs, AuthenticatedLnd } from 'lightning';

/**
 * Get Lightning Network connection details
 * In a production environment, these values should come from environment variables
 */
export function getLightningConnectionDetails() {
  return {
    // Replace with your actual Lightning node connection details
    socket: process.env.LIGHTNING_SOCKET || '127.0.0.1:10009',
    macaroon: process.env.LIGHTNING_MACAROON || '',
    cert: process.env.LIGHTNING_CERT || '',
  };
}

/**
 * Get Lightning Network configuration
 * This returns the properly formatted AuthenticatedLightningArgs object
 */
export function getLightningConfig(): AuthenticatedLightningArgs {
  // Import the authenticatedLndGrpc function
  const { authenticatedLndGrpc } = require('lightning/lnd_grpc');
  
  // Create the authenticated LND connection
  const { lnd } = authenticatedLndGrpc(getLightningConnectionDetails());
  
  // Return the config object with the authenticated LND instance
  return { lnd: lnd as AuthenticatedLnd };
}

/**
 * Get Nostr private key for signing events
 * In a production environment, this should be securely stored
 */
export function getNostrPrivateKey(): string {
  // Replace with your actual Nostr private key
  return process.env.NOSTR_PRIVATE_KEY || '';
}

/**
 * Get Nostr relay URLs
 */
export function getNostrRelays(): string[] {
  // Replace with your preferred Nostr relays
  return [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol',
  ];
}