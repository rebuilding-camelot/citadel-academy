// Type definitions for unified-event-manager.ts
import { Event } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { finalizeEvent } from 'nostr-tools/pure';

export declare class CitadelEventManager {
  constructor(ndk: NDK, userPubkey: string, privateKey: string);
  
  purchaseAndTrack(productEvent: Event, paymentMethod: 'lightning' | 'fedimint'): Promise<void>;
  publishEvent(event: Event): Promise<void>;
  
  private createMarketplaceZapRequest(productEvent: Event, amount: number): Event;
  private processPayment(zapRequest: Event, paymentMethod: 'lightning' | 'fedimint'): Promise<any>;
  private createPurchaseOrder(productEvent: Event, paymentResult: any): Event;
  private updateProgressWithPurchase(productId: string, paymentResult: any): Promise<void>;
  private grantFileAccess(productId: string, fileUrl: string): Promise<void>;
  private hexToBytes(hex: string): Uint8Array;
  
  static createInstance(ndk: NDK, userPubkey: string, privateKey: string): CitadelEventManager;
}

export declare function getEventManager(ndk: NDK, userPubkey: string, privateKey: string): CitadelEventManager;