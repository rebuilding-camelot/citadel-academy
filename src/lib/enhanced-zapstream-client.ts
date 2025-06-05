// File: lib/enhanced-zapstream-client.ts
// Prompt: "Extend Zap.stream client to handle screen sharing metadata"
import { ZapStreamClient, StreamSettings } from './zapstream-client';
import { createLiveStreamEvent, createUnsignedLiveStreamEvent } from './nip53-live-events';

// Import types from window.d.ts
// This ensures TypeScript recognizes the custom properties on the window object
import '../types/window';

// Define the NostrClient interface to match the window.d.ts definition
interface NostrClient {
  publishEvent: (event: any) => Promise<void>;
  queryEvents: (filters: any[]) => Promise<any[]>;
  getPublicKey: () => string;
  signEvent: (event: any) => Promise<any>;
  [key: string]: any;
}

export interface EnhancedStreamSettings extends StreamSettings {
  streamType: 'camera' | 'screen' | 'both';
  hasScreenShare: boolean;
  allowAnnotations: boolean;
}

export class EnhancedZapStreamClient extends ZapStreamClient {
  // Note: We're not overriding getPublicKey and getPrivateKey methods anymore
  // as they're already properly implemented in the parent class
  async createEnhancedStream(settings: EnhancedStreamSettings): Promise<{
    streamUrl: string;
    streamKey: string;
    streamId: string;
    capabilities: string[];
  }> {
    const response = await fetch(`${this.config.apiUrl}/api/stream/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        ...settings,
        capabilities: [
          'screen_share',
          'annotations',
          'picture_in_picture',
          'real_time_switching'
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create stream: ${response.status} ${response.statusText}`);
    }
    
    const streamData = await response.json();
    
    if (!streamData.id || !streamData.rtmpUrl || !streamData.streamKey) {
      throw new Error('Invalid response from stream creation API');
    }
    // Create enhanced Nostr event with screen sharing metadata
    // First create an unsigned event
    const unsignedEvent = createUnsignedLiveStreamEvent({
      streamId: streamData.id,
      title: settings.title,
      summary: settings.description,
      streaming: streamData.rtmpUrl,
      status: 'planned',
      tags: [...settings.tags, 'screen_share_enabled'],
      relays: ['wss://relay.citadel.academy']
    }, this.getPublicKey());
    
    // Sign the event using the Nostr client
    let liveEvent;
    if (this.nostrClient && typeof this.nostrClient.signEvent === 'function') {
      liveEvent = await this.nostrClient.signEvent(unsignedEvent);
    } else {
      // No fallback to private key - require Nostr client for security
      throw new Error('No signing capability available. Please provide a Nostr client with signEvent method.');
    }
    // Add custom tags for screen sharing
    liveEvent.tags.push(
      ['stream_type', settings.streamType],
      ['has_screen_share', settings.hasScreenShare.toString()],
      ['allow_annotations', settings.allowAnnotations.toString()],
      ['capabilities', 'screen_share', 'annotations', 'pip']
    );
    try {
      await this.nostrClient.publishEvent(liveEvent);
    } catch (error) {
      console.error('Failed to publish Nostr event:', error);
      // Optionally notify the caller about partial success
      throw new Error(`Stream created but failed to publish to Nostr: ${error instanceof Error ? error.message : String(error)}`);
    }
    return {
      streamUrl: streamData.rtmpUrl,
      streamKey: streamData.streamKey,
      streamId: streamData.id,
      capabilities: ['screen_share', 'annotations', 'picture_in_picture']
    };
  }
}