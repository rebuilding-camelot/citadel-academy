// File: tests/nip-integration.test.ts
// Prompt: "Create comprehensive test suite for NIP integration"
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CitadelEventManager } from '../src/lib/unified-event-manager';
import { FedimintNIPIntegration } from '../src/lib/fedimint-integration';
import { Event } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';

// Mock implementations
const mockNDK = {
  publishEvent: vi.fn(),
  publish: vi.fn(),
  publishedEvents: [] as Event[]
} as unknown as NDK & { publishedEvents: Event[] };

// Mock Fedimint client
const mockFedimint = {
  createEcashToken: vi.fn(),
  transferFunds: vi.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
  mockNDK.publishedEvents = [];
});

describe('NIP Integration Tests', () => {
  test('Complete purchase flow integrates all NIPs', async () => {
    // Mock product event (NIP-15)
    const productEvent = {
      kind: 30017,
      id: 'test-product-id',
      pubkey: 'seller-pubkey',
      tags: [
        ['title', 'Bitcoin Basics'],
        ['price', '10000'],
        ['url', 'https://files.citadel.academy/bitcoin-basics.pdf']
      ],
      created_at: Math.floor(Date.now() / 1000),
      content: 'Bitcoin Basics Course',
    } as Event;

    // Create event manager with mock
    const eventManager = new CitadelEventManager(mockNDK, 'test-pubkey', 'test-key');
    
    // Override publishEvent to track events
    vi.spyOn(eventManager, 'publishEvent').mockImplementation(async (event: Event) => {
      mockNDK.publishedEvents.push(event);
      return Promise.resolve();
    });

    await eventManager.purchaseAndTrack(productEvent, 'lightning');
    
    // Verify all NIPs were triggered
    // @ts-ignore - Accessing our mock tracking array
    expect(mockNDK.publishedEvents).toHaveLength(3); // Zap, Purchase Order, Progress Update
  });

  test('Fedimint integration updates family treasury tracking', async () => {
    const mockFedimint = {}; // Mock fedimint client
    const eventManager = new CitadelEventManager(mockNDK, 'test-pubkey', 'test-key');
    
    // Override publishEvent to track events
    const originalPublishEvent = eventManager.publishEvent;
    eventManager.publishEvent = async (event: Event) => {
      // @ts-ignore - Adding to our mock tracking array
      mockNDK.publishedEvents.push(event);
      return originalPublishEvent.call(eventManager, event);
    };
    
    const fedimintIntegration = new FedimintNIPIntegration(mockFedimint, eventManager);
    
    await fedimintIntegration.splitFamilyAllowance(100000, ['child1-pubkey', 'child2-pubkey']);
    
    // Verify treasury tracking events were created
    // @ts-ignore - Accessing our mock tracking array
    expect(mockNDK.publishedEvents.filter(e => e.kind === 30078)).toHaveLength(2);
  });
});