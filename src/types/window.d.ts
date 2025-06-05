// Comprehensive Window interface declarations
import { Event as NostrEvent } from 'nostr-tools';

declare global {
  interface Window {
    // Nostr browser extensions
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: any): Promise<any>;
      nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
    
    // Nostr client with all required methods
    nostrClient?: {
      publishEvent: (event: NostrEvent) => Promise<void>;
      queryEvents: (filters: any[]) => Promise<NostrEvent[]>;
      subscribe: (filters: any[]) => {
        on: (event: string, callback: (event: NostrEvent) => void) => void;
        unsub: () => void;
      };
      getPublicKey: () => string;
      signEvent: (event: Partial<NostrEvent>) => Promise<NostrEvent>;
      updateStreamStatus?: (streamId: string, status: string) => Promise<any>;
      [key: string]: any; // Allow for other methods not explicitly defined
    };
    
    // Main client instance
    client: {
      getPublicKey: (privateKey: string) => string;
      publishEvent: (event: NostrEvent, callback: (status: string, relay: any) => void) => void;
      subscribe: (relays: string[], filters: any[]) => any;
      [key: string]: any; // Allow for other methods not explicitly defined
    };
    
    // Nostr keys - DEPRECATED: Direct access to private keys is insecure
    // Only use in development environments and with caution
    /** @deprecated Use nostrClient.signEvent instead of accessing private key directly */
    _nostr_sk?: string; // Nostr private key - DEPRECATED
    _nostr_pk?: string; // Nostr public key
    
    // User keys
    userKeys?: {
      publicKey: string;
      privateKey?: string;
    };
    
    // Payment method
    payInvoice?: (invoice: string) => Promise<void>;
  }
}

export {};