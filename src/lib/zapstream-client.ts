// File: lib/zapstream-client.ts
// Consolidated ZapStream client with enhanced features

import { createLiveStreamEvent, createUnsignedLiveStreamEvent, updateStreamStatus, createUnsignedStatusUpdateEvent } from './nip53-live-events';

// Import types from window.d.ts
// This ensures TypeScript recognizes the custom properties on the window object
import '../types/window';

// Define the NostrClient interface to match the window.d.ts definition
interface NostrClient {
  publishEvent: (event: any) => Promise<void>;
  queryEvents?: (filters: any[]) => Promise<any[]>;
  getPublicKey: () => string;
  signEvent: (event: any) => Promise<any>;
  [key: string]: any;
}

export interface ZapStreamConfig {
  apiUrl: string;
  apiKey?: string;
  balance?: number;
  relays?: string[]; // Array of Nostr relay URLs
}

export interface StreamSettings {
  title: string;
  description: string;
  tags: string[];
  courseId?: string;
  isEducational: boolean;
  requiresAuth: boolean;
}

export interface EnhancedStreamSettings extends StreamSettings {
  streamType?: 'camera' | 'screen' | 'both';
  hasScreenShare?: boolean;
  allowAnnotations?: boolean;
}

export class ZapStreamClient {
  protected config: ZapStreamConfig;
  protected nostrClient: any; // Your existing Nostr client
  protected relays: string[]; // Nostr relay URLs

  constructor(config: ZapStreamConfig, nostrClient: any) {
    this.config = config;
    this.nostrClient = nostrClient;
    // Initialize relays from config or use default relays
    this.relays = config.relays || [
      'wss://relay.damus.io',
      'wss://relay.nostr.band',
      'wss://nos.lol'
    ];
  }

  /**
   * Get the public key from the browser's nostrClient or fallback to a default
   * @returns The public key string
   */
  protected getPublicKey(): string {
    // Try to get from nostrClient if available
    if (this.nostrClient && typeof this.nostrClient.getPublicKey === 'function') {
      return this.nostrClient.getPublicKey();
    }
    
    // Try to get from window.nostrClient if available
    if (typeof window !== 'undefined' && window.nostrClient) {
      // Check if getPublicKey method exists
      const nostrClient = window.nostrClient as NostrClient;
      if (typeof nostrClient.getPublicKey === 'function') {
        return nostrClient.getPublicKey();
      }
    }
    
    // Fallback to user keys if available
    if (typeof window !== 'undefined' && window.userKeys && window.userKeys.publicKey) {
      return window.userKeys.publicKey;
    }
    
    // Return empty string as fallback
    return '';
  }
  
  /**
   * Get the private key from secure sources
   * @returns The private key string or empty string if not available
   * @deprecated Direct private key access is discouraged. Use nostrClient.signEvent instead.
   */
  protected getPrivateKey(): string {
    // Try to get from environment variables (server-side)
    if (typeof process !== 'undefined' && process.env && process.env.NOSTR_PRIVATE_KEY) {
      return process.env.NOSTR_PRIVATE_KEY;
    }
    
    // Only access window._nostr_sk in development mode
    if (typeof process !== 'undefined' && 
        process.env && 
        process.env.NODE_ENV !== 'production' && 
        typeof window !== 'undefined' && 
        window._nostr_sk) {
      console.warn('WARNING: Accessing private key from window object. This is insecure and should only be used in development.');
      return window._nostr_sk;
    }
    
    // Return empty string as fallback
    return '';
  }
  
  /**
   * Determines if this client has direct signing capabilities
   * (either through nostrClient or through having a private key)
   */
  protected hasSigningCapability(): boolean {
    // Check if nostrClient has signEvent method
    if (this.nostrClient && typeof this.nostrClient.signEvent === 'function') {
      return true;
    }
    
    // Check if window.nostrClient has signEvent method
    if (typeof window !== 'undefined' && 
        window.nostrClient && 
        typeof window.nostrClient.signEvent === 'function') {
      return true;
    }
    
    // Check if we have a private key available
    return this.getPrivateKey() !== '';
  }

  async createStream(settings: EnhancedStreamSettings): Promise<{
    streamUrl: string;
    streamKey: string;
    streamId: string;
    capabilities?: string[];
  }> {
    // Get user's public key from Nostr client
    const userPubkey = this.getPublicKey();
    if (!userPubkey) {
      throw new Error('Unable to get user public key. Please check your Nostr extension.');
    }
    
    // Determine if this is an enhanced stream with screen sharing
    const isEnhanced = settings.streamType !== undefined && settings.streamType !== 'camera';
    
    // Create stream on Zap.stream
    let response: Response;
    try {
      response = await fetch(`${this.config.apiUrl}/api/stream/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          title: settings.title,
          description: settings.description,
          tags: settings.tags,
          educational: settings.isEducational,
          private: settings.requiresAuth,
          // Add enhanced capabilities if needed
          ...(isEnhanced && {
            capabilities: [
              'screen_share',
              'annotations',
              'picture_in_picture',
              'real_time_switching'
            ]
          })
        })
      });
    } catch (err) {
      throw new Error(`Network error while creating stream: ${String(err)}`);
    }
    
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Stream API error ${response.status}: ${body || response.statusText}`);
    }
    
    const streamData = await response.json();
    
    // Create an unsigned event
    const streamId = streamData.id || `stream-${Date.now()}`;
    
    // Create a LiveStreamEvent object
    const liveStreamData = {
      streamId,
      title: settings.title,
      summary: settings.description,
      status: 'planned' as 'planned', // Type assertion to match the expected union type
      streaming: streamData.rtmpUrl || '',
      tags: settings.tags || [],
      service: 'zap.stream',
      academy: 'citadel'
    };
    
    // Create an unsigned event using the helper function
    const unsignedEvent = createUnsignedLiveStreamEvent(liveStreamData, userPubkey);
    
    // Add enhanced tags if applicable
    if (isEnhanced) {
      unsignedEvent.tags.push(
        ['stream_type', settings.streamType || 'camera'],
        ['has_screen_share', String(!!settings.hasScreenShare)],
        ['allow_annotations', String(!!settings.allowAnnotations)],
        ['capabilities', 'screen_share'],
        ['capabilities', 'annotations'],
        ['capabilities', 'pip']
      );
    }
    
    // Sign the event using the Nostr client
    const signedEvent = await this.nostrClient.signEvent(unsignedEvent);
    
    // Publish to Nostr
    await this.nostrClient.publishEvent(signedEvent);

    return {
      streamUrl: streamData.rtmpUrl || '',
      streamKey: streamData.streamKey || '',
      streamId: streamId,
      capabilities: isEnhanced ? ['screen_share', 'annotations', 'picture_in_picture'] : undefined
    };
  }

  async startStream(streamId: string): Promise<void> {
    // Get user's public key from Nostr client
    const userPubkey = this.getPublicKey();
    if (!userPubkey) {
      throw new Error('Unable to get user public key. Please check your Nostr extension.');
    }
    
    // Create an unsigned event for status update
    const unsignedEvent = await createUnsignedStatusUpdateEvent(
      streamId,
      'live',
      userPubkey,
      this.relays
    );
    
    // Sign the event using the Nostr client
    const signedEvent = await this.nostrClient.signEvent(unsignedEvent);
    
    // Publish to Nostr
    await this.nostrClient.publishEvent(signedEvent);
  }

  async endStream(streamId: string): Promise<void> {
    // Get user's public key from Nostr client
    const userPubkey = this.getPublicKey();
    if (!userPubkey) {
      throw new Error('Unable to get user public key. Please check your Nostr extension.');
    }
    
    // Create an unsigned event for status update
    const unsignedEvent = await createUnsignedStatusUpdateEvent(
      streamId,
      'ended',
      userPubkey,
      this.relays
    );
    
    // Sign the event using the Nostr client
    const signedEvent = await this.nostrClient.signEvent(unsignedEvent);
    
    // Publish to Nostr
    await this.nostrClient.publishEvent(signedEvent);
  }

  async getStreamStats(streamId: string): Promise<{
    viewers: number;
    totalZaps: number;
    duration: number;
  }> {
    let response: Response;
    try {
      response = await fetch(`${this.config.apiUrl}/api/stream/${streamId}/stats`);
    } catch (err) {
      throw new Error(`Network error while fetching stream stats: ${String(err)}`);
    }
    
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Stream stats API error ${response.status}: ${body || response.statusText}`);
    }
    
    return response.json();
  }
}