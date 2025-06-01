// Type definitions for useCitadelEventManager.ts
import { Event } from 'nostr-tools';
import { CitadelEventManager } from '../lib/unified-event-manager';

export interface UseCitadelEventManagerResult {
  manager: CitadelEventManager | null;
  loading: boolean;
  error: Error | null;
  purchaseProduct: (productEvent: Event, paymentMethod?: 'lightning' | 'fedimint') => Promise<void>;
  publishEvent: (event: Event) => Promise<void>;
}

export declare function useCitadelEventManager(): UseCitadelEventManagerResult;