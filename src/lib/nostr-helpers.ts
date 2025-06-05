// File: lib/nostr-helpers.ts
// Prompt: "Create utility functions for Nostr relay management and event publishing"
import { SimplePool } from 'nostr-tools';
import type { Event, Filter } from 'nostr-tools';

// Helper function to convert hex string to Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export class CitadelNostrClient {
  private pool: SimplePool = new SimplePool();
  private defaultRelays = [
    'wss://relay.citadel.academy',
    'wss://relay.damus.io',
    'wss://nos.lol'
  ];
  private _connected: boolean = false;
  
  // Getter for relays
  get relays(): string[] {
    return this.defaultRelays;
  }
  
  // Getter for connected status
  get connected(): boolean {
    return this._connected;
  }
  
  async connect() {
    // SimplePool doesn't require explicit connection
    // It handles connections automatically when needed
    this._connected = true;
  }
  
  async publishEvent(event: Event): Promise<void> {
    try {
      const pubs = this.pool.publish(this.defaultRelays, event);
      await Promise.allSettled(pubs);
    } catch (error) {
      console.warn('Failed to publish event:', error);
    }
  }
  
  async queryEvents(filter: Filter): Promise<Event[]> {
    try {
      // In nostr-tools v2, we use querySync instead of sub
      const events = await this.pool.querySync(this.defaultRelays, filter);
      return events;
    } catch (error) {
      console.warn('Query failed:', error);
      return [];
    }
  }
  
  disconnect() {
    this.pool.close(this.defaultRelays);
    this._connected = false;
  }
}
// Export singleton instance
export const nostrClient = new CitadelNostrClient();