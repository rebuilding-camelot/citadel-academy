// File: lib/stream-utils.ts
// Utility functions for stream zaps and payments

import { Event, getEventHash, finalizeEvent } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';

/**
 * Creates a zap request for a stream
 * @param params Parameters for the zap request
 * @param privateKey User's private key for signing
 * @returns Finalized zap request event
 */
export const createStreamZapRequest = (
  params: {
    streamId: string;
    amount: number;
    message: string;
    recipientPubkey: string;
    senderPubkey: string;
  },
  privateKey: string
): Event => {
  const { streamId, amount, message, recipientPubkey, senderPubkey } = params;
  
  // Create zap request event
  const zapRequestEvent: Partial<Event> = {
    kind: 9734, // Zap request
    created_at: Math.floor(Date.now() / 1000),
    content: message,
    tags: [
      ['p', recipientPubkey], // Recipient
      ['amount', amount.toString()],
      ['relays', 'wss://relay.damus.io', 'wss://relay.nostr.band'],
      ['e', streamId, '', 'root'], // Reference to stream
      ['t', 'stream-zap']
    ],
    pubkey: senderPubkey,
  };

  // Calculate event hash
  const eventHash = getEventHash(zapRequestEvent as Event);
  zapRequestEvent.id = eventHash;

  // Sign the event
  // Convert hex private key to Uint8Array
  const privateKeyBytes = typeof privateKey === 'string' 
    ? hexToBytes(privateKey)
    : privateKey;
  
  return finalizeEvent(zapRequestEvent as Event, privateKeyBytes);
};

/**
 * Process a zap payment through Lightning Network
 * @param zapRequest The zap request event
 * @returns Payment result
 */
export const processZapPayment = async (zapRequest: Event): Promise<any> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would integrate with a Lightning wallet or service
    
    // Example implementation with a Lightning service API:
    // 1. Generate an invoice
    // const invoice = await lightningService.createInvoice({
    //   amount: getZapAmount(zapRequest),
    //   memo: getZapMessage(zapRequest),
    //   expiry: 600, // 10 minutes
    // });
    
    // 2. Pay the invoice
    // const paymentResult = await lightningWallet.payInvoice(invoice.paymentRequest);
    
    // 3. Create a zap receipt
    // const zapReceipt = createZapReceipt(zapRequest, paymentResult);
    
    // 4. Publish the zap receipt
    // await window.nostrClient.publishEvent(zapReceipt);
    
    console.log('Processing zap payment:', zapRequest);
    
    // Return mock payment result for now
    return {
      success: true,
      amount: getZapAmount(zapRequest),
      preimage: 'mock-preimage-' + Math.random().toString(36).substring(2, 15),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to process zap payment:', error);
    throw new Error('Payment failed. Please try again.');
  }
};

/**
 * Helper to extract zap amount from a zap request
 */
const getZapAmount = (zapRequest: Event): number => {
  const amountTag = zapRequest.tags.find(tag => tag[0] === 'amount');
  return amountTag ? parseInt(amountTag[1], 10) : 0;
};

/**
 * Helper to extract zap message from a zap request
 */
const getZapMessage = (zapRequest: Event): string => {
  return zapRequest.content || '';
};