declare module 'nostr-tools/pure' {
  import { Event } from 'nostr-tools';
  
  export function getEventHash(event: Event): string;
  export function finalizeEvent(event: Event, privateKey: Uint8Array): Event;
  export function getPublicKey(privateKey: Uint8Array): string;
}