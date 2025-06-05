import { Event, getEventHash, finalizeEvent } from 'nostr-tools';
import { MentorStall, MentorService, MentorOrder, MentorProfile } from './types/mentor-marketplace-types';
import { hexToBytes } from '@noble/hashes/utils';

// Define types for tags to avoid 'any' type errors
type NostrTag = string[];

export class MentorMarketplace {
  private nostrClient: any;
  private userKeys: { privateKey: string; publicKey: string };

  constructor(nostrClient: any, userKeys: { privateKey: string; publicKey: string }) {
    this.nostrClient = nostrClient;
    this.userKeys = userKeys;
  }

  // Create mentor stall (NIP-15)
  async createMentorStall(stall: MentorStall): Promise<Event> {
    const stallEvent: Omit<Event, 'id' | 'sig'> = {
      kind: 30017, // NIP-15 stall
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', stall.id],
        ['name', stall.name],
        ['description', stall.description],
        ['currency', stall.currency],
        ['academy', 'citadel'],
        ['type', 'mentor_services'],
        ...stall.shipping.map(ship => ['shipping', ship.id, ship.cost.toString(), ship.name])
      ],
      content: JSON.stringify({
        name: stall.name,
        description: stall.description,
        currency: stall.currency,
        shipping: stall.shipping
      }),
      pubkey: this.userKeys.publicKey,
    };
    
    // Convert hex private key to Uint8Array
    const privateKeyBytes = hexToBytes(this.userKeys.privateKey);
    
    // Use finalizeEvent instead of getSignature
    const finalizedEvent = finalizeEvent(stallEvent, privateKeyBytes);
    await this.nostrClient.publishEvent(finalizedEvent);
    return finalizedEvent;
  }

  // Create mentor service (NIP-15)
  async createMentorService(service: MentorService): Promise<Event> {
    const serviceEvent: Omit<Event, 'id' | 'sig'> = {
      kind: 30018, // NIP-15 product
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', service.id],
        ['title', service.name],
        ['summary', service.description],
        ['price', service.price.toString(), service.currency],
        ['stall', service.stallId],
        ['academy', 'citadel'],
        ['type', 'mentor_session'],
        ...service.categories.map(cat => ['t', cat]),
        ...service.images.map(img => ['image', img]),
        ...(service.duration ? [['duration', service.duration.toString()]] : []),
        ...(service.availability ? [['availability', service.availability]] : [])
      ],
      content: JSON.stringify({
        name: service.name,
        description: service.description,
        images: service.images,
        currency: service.currency,
        price: service.price,
        specs: service.specs,
        shipping: service.shipping,
        duration: service.duration,
        availability: service.availability
      }),
      pubkey: this.userKeys.publicKey,
    };
    
    // Convert hex private key to Uint8Array
    const privateKeyBytes = hexToBytes(this.userKeys.privateKey);
    
    // Use finalizeEvent instead of getSignature
    const finalizedEvent = finalizeEvent(serviceEvent, privateKeyBytes);
    await this.nostrClient.publishEvent(finalizedEvent);
    return finalizedEvent;
  }

  // Get mentor stalls
  async getMentorStalls(): Promise<MentorStall[]> {
    const filter = {
      kinds: [30017],
      '#type': ['mentor_services'],
      '#academy': ['citadel']
    };
    const events = await this.nostrClient.queryEvents([filter]);
    
    return events.map((event: Event) => {
      let content;
      try {
        content = JSON.parse(event.content || '{}');
      } catch (error) {
        console.warn('Failed to parse event content:', error);
        content = {};
      }
      return {
        id: event.tags.find((tag: NostrTag) => tag[0] === 'd')?.[1] || '',
        name: event.tags.find((tag: NostrTag) => tag[0] === 'name')?.[1] || '',
        description: event.tags.find((tag: NostrTag) => tag[0] === 'description')?.[1] || '',
        currency: (event.tags.find((tag: NostrTag) => tag[0] === 'currency')?.[1] === 'btc' ? 'btc' : 'sats') as 'sats' | 'btc',
        shipping: content.shipping || []
      };
    });
  }

  // Get mentor services
  async getMentorServices(stallId?: string): Promise<MentorService[]> {
    const filter = {
      kinds: [30018],
      '#type': ['mentor_session'],
      '#academy': ['citadel'],
      ...(stallId ? { '#stall': [stallId] } : {})
    };
    const events = await this.nostrClient.queryEvents([filter]);
    
    return events.map((event: Event) => {
      let content;
      try {
        content = JSON.parse(event.content || '{}');
      } catch (error) {
        console.warn('Failed to parse event content:', error);
        content = {};
      }
      return {
        id: event.tags.find((tag: NostrTag) => tag[0] === 'd')?.[1] || '',
        stallId: event.tags.find((tag: NostrTag) => tag[0] === 'stall')?.[1] || '',
        name: event.tags.find((tag: NostrTag) => tag[0] === 'title')?.[1] || '',
        description: event.tags.find((tag: NostrTag) => tag[0] === 'summary')?.[1] || '',
        images: event.tags.filter((tag: NostrTag) => tag[0] === 'image').map((tag: NostrTag) => tag[1]),
        currency: event.tags.find((tag: NostrTag) => tag[0] === 'price')?.[2] as 'sats' || 'sats',
        price: parseInt(event.tags.find((tag: NostrTag) => tag[0] === 'price')?.[1] || '0') || 0,
        quantity: content.quantity,
        specs: content.specs || [],
        shipping: content.shipping || [],
        mentorPubkey: event.pubkey,
        categories: event.tags.filter((tag: NostrTag) => tag[0] === 't').map((tag: NostrTag) => tag[1]),
        duration: content.duration,
        availability: content.availability
      };
    });
  }
}