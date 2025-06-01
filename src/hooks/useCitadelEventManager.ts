// File: hooks/useCitadelEventManager.ts
// Hook for using the CitadelEventManager in React components
import { useEffect, useState } from 'react';
import { Event } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';
import { CitadelEventManager, getEventManager } from '../lib/unified-event-manager';
import { normalizePrivateKey, normalizePublicKey } from '../lib/nostrUtils';
import { useSelector } from 'react-redux';

/**
 * Hook to access the CitadelEventManager with the current user's credentials
 * @returns CitadelEventManager instance and loading state
 */
export function useCitadelEventManager() {
  const [manager, setManager] = useState<CitadelEventManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get user credentials from Redux store
  const userPubkey = useSelector((state: any) => state.nostr?.pubkey);
  const privateKey = useSelector((state: any) => state.nostr?.privateKey);
  
  useEffect(() => {
    const initializeManager = async () => {
      try {
        if (!userPubkey || !privateKey) {
          setLoading(false);
          return;
        }
        
        // Normalize keys
        const normalizedPubkey = normalizePublicKey(userPubkey);
        const normalizedPrivateKey = normalizePrivateKey(privateKey);
        
        if (!normalizedPubkey || !normalizedPrivateKey) {
          throw new Error('Invalid keys');
        }
        
        // Initialize NDK
        const ndk = new NDK({
          explicitRelayUrls: [
            'wss://relay.citadel.academy',
            'wss://relay.damus.io',
            'wss://nos.lol'
          ]
        });
        
        await ndk.connect();
        
        // Create or get event manager instance
        const eventManager = getEventManager(ndk, normalizedPubkey, normalizedPrivateKey);
        setManager(eventManager);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
    
    initializeManager();
    
    return () => {
      // Cleanup if needed
    };
  }, [userPubkey, privateKey]);
  
  /**
   * Purchase a product and track the purchase
   * @param productEvent Product event from marketplace
   * @param paymentMethod Payment method to use
   * @returns Promise that resolves when purchase is complete
   */
  const purchaseProduct = async (productEvent: Event, paymentMethod: 'lightning' | 'fedimint' = 'lightning') => {
    if (!manager) {
      throw new Error('Event manager not initialized');
    }
    
    return manager.purchaseAndTrack(productEvent, paymentMethod);
  };
  
  /**
   * Publish a Nostr event
   * @param event Event to publish
   * @returns Promise that resolves when event is published
   */
  const publishEvent = async (event: Event) => {
    if (!manager) {
      throw new Error('Event manager not initialized');
    }
    
    return manager.publishEvent(event);
  };
  
  return {
    manager,
    loading,
    error,
    purchaseProduct,
    publishEvent
  };
}