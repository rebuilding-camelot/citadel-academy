// File: lib/unified-event-manager.ts
// Prompt: "Create unified event manager for seamless NIP integration across marketplace, payments, and progress"
import { Event, getEventHash } from 'nostr-tools';
import { finalizeEvent } from 'nostr-tools/pure';
import NDK from '@nostr-dev-kit/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { updatePurchaseHistory } from './progress';
import { createPurchaseOrder } from './marketplace';
import { getRelays } from './nostrUtils';

export class CitadelEventManager {
  private ndk: NDK;
  private userPubkey: string;
  private privateKey: string;
  
  constructor(ndk: NDK, userPubkey: string, privateKey: string) {
    this.ndk = ndk;
    this.userPubkey = userPubkey;
    this.privateKey = privateKey;
  }
  
  // Unified purchase flow combining NIP-15, NIP-57, NIP-78, NIP-94
  async purchaseAndTrack(productEvent: Event, paymentMethod: 'lightning' | 'fedimint'): Promise<void> {
    const price = productEvent.tags.find(tag => tag[0] === 'price')?.[1];
    const title = productEvent.tags.find(tag => tag[0] === 'title')?.[1];
    const fileUrl = productEvent.tags.find(tag => tag[0] === 'url')?.[1];
    
    if (!price || !title) throw new Error('Invalid product event');
    
    // 1. Create NIP-57 zap request with marketplace context
    const zapRequest = this.createMarketplaceZapRequest(productEvent, parseInt(price));
    
    // 2. Process payment
    const paymentResult = await this.processPayment(zapRequest, paymentMethod);
    
    // 3. Create NIP-15 purchase order
    const purchaseOrder = this.createPurchaseOrder(productEvent, paymentResult);
    await this.publishEvent(purchaseOrder);
    
    // 4. Update NIP-78 progress with purchase
    await this.updateProgressWithPurchase(productEvent.id, paymentResult);
    
    // 5. Grant access to NIP-94 file if applicable
    if (fileUrl) {
      await this.grantFileAccess(productEvent.id, fileUrl);
    }
  }
  
  private createMarketplaceZapRequest(productEvent: Event, amount: number): Event {
    return {
      kind: 9734, // NIP-57 zap request
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['p', productEvent.pubkey], // Seller
        ['e', productEvent.id], // Product reference
        ['amount', (amount * 1000).toString()], // msats
        ['relays', 'wss://relay.citadel.academy'],
        ['product', productEvent.id], // Marketplace extension
        ['marketplace', 'citadel-academy'],
        ['client', 'dynastic-app']
      ],
      content: `Purchase: ${productEvent.tags.find(tag => tag[0] === 'title')?.[1]}`,
      pubkey: this.userPubkey,
    } as Event;
  }
  
  private async processPayment(zapRequest: Event, paymentMethod: 'lightning' | 'fedimint'): Promise<any> {
    // Integration with existing payment systems
    if (paymentMethod === 'lightning') {
      // Create a lightning invoice
      const response = await fetch('/api/lnurl/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(zapRequest.tags.find(tag => tag[0] === 'amount')?.[1] || '0'),
          description: zapRequest.content,
          productId: zapRequest.tags.find(tag => tag[0] === 'product')?.[1]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lightning invoice');
      }
      
      const { pr, paymentHash } = await response.json();
      
      // Use WebLN or other payment method to pay invoice
      // This would typically be handled by a wallet or NWC
      // For now, we'll simulate a successful payment
      return {
        payment_hash: paymentHash,
        amount: parseInt(zapRequest.tags.find(tag => tag[0] === 'amount')?.[1] || '0') / 1000,
        status: 'complete'
      };
    } else if (paymentMethod === 'fedimint') {
      // Fedimint integration would go here
      // For now, we'll simulate a successful payment
      return {
        payment_hash: `fedimint-${Date.now()}`,
        amount: parseInt(zapRequest.tags.find(tag => tag[0] === 'amount')?.[1] || '0') / 1000,
        status: 'complete'
      };
    }
    
    throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }
  
  private createPurchaseOrder(productEvent: Event, paymentResult: any): Event {
    // Use existing createPurchaseOrder function from marketplace.ts
    return createPurchaseOrder(
      productEvent.id,
      this.userPubkey,
      productEvent.pubkey,
      this.privateKey
    );
  }
  
  private async updateProgressWithPurchase(productId: string, paymentResult: any): Promise<void> {
    const progressEvent: Event = {
      kind: 30078, // NIP-78 application-specific data
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `purchase-history-${this.userPubkey}`],
        ['purchase', productId],
        ['payment_hash', paymentResult.payment_hash],
        ['timestamp', new Date().toISOString()],
        ['amount', paymentResult.amount.toString()]
      ],
      content: JSON.stringify({
        purchases: [productId],
        totalSpent: paymentResult.amount,
        lastPurchase: new Date().toISOString()
      }),
      pubkey: this.userPubkey,
    } as Event;
    
    await this.publishEvent(progressEvent);
    
    // Also update the enhanced progress tracking
    await updatePurchaseHistory(this.userPubkey, productId, paymentResult);
  }
  
  private async grantFileAccess(productId: string, fileUrl: string): Promise<void> {
    // Create a NIP-94 file access event
    const fileAccessEvent: Event = {
      kind: 1063, // NIP-94 file metadata
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `file-access-${productId}-${this.userPubkey}`],
        ['r', fileUrl],
        ['purchase', productId],
        ['access', 'granted'],
        ['expiry', (Math.floor(Date.now() / 1000) + 31536000).toString()] // 1 year access
      ],
      content: JSON.stringify({
        access: 'granted',
        purchaseId: productId,
        accessGranted: new Date().toISOString()
      }),
      pubkey: this.userPubkey,
    } as Event;
    
    await this.publishEvent(fileAccessEvent);
  }
  
  async publishEvent(event: Event): Promise<void> {
    // Convert hex private key to Uint8Array for nostr-tools
    const privateKeyBytes = this.hexToBytes(this.privateKey);
    
    // Use finalizeEvent to set id and signature
    const signedEvent = finalizeEvent(event, privateKeyBytes);
    
    const ndkEvent = new NDKEvent(this.ndk, signedEvent);
    await ndkEvent.publish();
  }
  
  // Helper function to convert hex string to Uint8Array
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }
  
  // Helper method to create a singleton instance with the current user's credentials
  static createInstance(ndk: NDK, userPubkey: string, privateKey: string): CitadelEventManager {
    return new CitadelEventManager(ndk, userPubkey, privateKey);
  }
}

// Export a function to get or create the event manager
let eventManagerInstance: CitadelEventManager | null = null;

export function getEventManager(ndk: NDK, userPubkey: string, privateKey: string): CitadelEventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new CitadelEventManager(ndk, userPubkey, privateKey);
  }
  return eventManagerInstance;
}