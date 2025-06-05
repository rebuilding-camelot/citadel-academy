// File: lib/stream-zaps.ts
// Prompt: "Implement NIP-57 zaps for live stream donations"
import { Event, finalizeEvent } from 'nostr-tools';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface StreamZap {
  streamId: string;
  amount: number; // sats
  message: string;
  recipientPubkey: string;
  senderPubkey: string;
}

export function createStreamZapRequest(
  zap: StreamZap,
  senderPrivateKey: string
): Event {
  const event = {
    kind: 9734, // NIP-57 zap request
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', zap.recipientPubkey], // Stream host
      ['e', zap.streamId], // Stream event reference
      ['amount', (zap.amount * 1000).toString()], // msats
      ['relays', 'wss://relay.citadel.academy'],
      ['stream', zap.streamId],
      ['academy', 'citadel']
    ],
    content: zap.message,
    pubkey: zap.senderPubkey,
  } as Event;
  
  // Convert hex private key to bytes
  const privateKeyBytes = hexToBytes(senderPrivateKey);
  
  // Use finalizeEvent to add id and signature in one step
  return finalizeEvent(event, privateKeyBytes);
}