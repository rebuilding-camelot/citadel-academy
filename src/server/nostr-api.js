/**
 * Express middleware for handling NIP-05 verification
 * This would be used in a server.js file that sets up an Express server
 */

// Mock database function - replace with actual database query
async function getUserByUsername(name) {
  // This would typically query your database
  // For now, we'll return a mock user
  if (name) {
    return {
      pubkey: 'mock-pubkey-for-testing',
      relays: ['wss://relay.nostr.band']
    };
  }
  return null;
}

/**
 * Express route handler for .well-known/nostr.json
 * This follows the NIP-05 specification
 */
export async function nostrJsonHandler(req, res) {
  const { name } = req.query;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name parameter required' });
  }
  
  // Fetch from your user database
  const user = await getUserByUsername(name);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    names: {
      [name]: user.pubkey
    },
    relays: {
      [user.pubkey]: user.relays
    }
  });
}

/**
 * Example of how to set up the route in an Express server:
 * 
 * import express from 'express';
 * import { nostrJsonHandler } from './nostr-api.js';
 * 
 * const app = express();
 * 
 * // NIP-05 verification endpoint
 * app.get('/.well-known/nostr.json', nostrJsonHandler);
 * 
 * app.listen(3000, () => {
 *   console.log('Server running on port 3000');
 * });
 */