import { Event, getEventHash, finalizeEvent } from 'nostr-tools';
import { MentorProfile } from './types/mentor-marketplace-types';
import { hexToBytes } from '@noble/hashes/utils';

// Define types for tags to avoid 'any' type errors
type NostrTag = string[];

export class MentorProfileManager {
  private nostrClient: any;
  private userKeys: { privateKey: string; publicKey: string };

  constructor(nostrClient: any, userKeys: { privateKey: string; publicKey: string }) {
    this.nostrClient = nostrClient;
    this.userKeys = userKeys;
  }

  // Create/Update mentor profile
  async createMentorProfile(profile: Omit<MentorProfile, 'pubkey'>): Promise<Event> {
    const profileEvent: Omit<Event, 'id' | 'sig'> = {
      kind: 30078, // NIP-78 application data
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', 'mentor-profile'],
        ['name', profile.name],
        ['hourly_rate', profile.hourlyRate.toString()],
        ['rating', profile.rating.toString()],
        ['total_sessions', profile.totalSessions.toString()],
        ['timezone', profile.timezone],
        ['academy', 'citadel'],
        ['type', 'mentor_profile'],
        ...profile.specialties.map(spec => ['specialty', spec]),
        ...profile.languages.map(lang => ['language', lang])
      ],
      content: JSON.stringify({
        bio: profile.bio,
        experience: profile.experience,
        availability: profile.availability,
        specialties: profile.specialties,
        languages: profile.languages
      }),
      pubkey: this.userKeys.publicKey,
    };
    
    // Convert hex private key to Uint8Array
    const privateKeyBytes = hexToBytes(this.userKeys.privateKey);
    
    // Use finalizeEvent instead of getSignature
    const finalizedEvent = finalizeEvent(profileEvent, privateKeyBytes);
    await this.nostrClient.publishEvent(finalizedEvent);
    return finalizedEvent;
  }

  // Get mentor profiles
  async getMentorProfiles(): Promise<MentorProfile[]> {
    const filter = {
      kinds: [30078],
      '#type': ['mentor_profile'],
      '#academy': ['citadel']
    };
    const events = await this.nostrClient.queryEvents([filter]);
    
    return events.map((event: Event) => {
      const content = JSON.parse(event.content || '{}');
      return {
        pubkey: event.pubkey,
        name: event.tags.find((tag: NostrTag) => tag[0] === 'name')?.[1] || '',
        bio: content.bio || '',
        specialties: event.tags.filter((tag: NostrTag) => tag[0] === 'specialty').map((tag: NostrTag) => tag[1]),
        experience: content.experience || '',
        hourlyRate: parseInt(event.tags.find((tag: NostrTag) => tag[0] === 'hourly_rate')?.[1] || '0'),
        availability: content.availability || '',
        rating: parseFloat(event.tags.find((tag: NostrTag) => tag[0] === 'rating')?.[1] || '0'),
        totalSessions: parseInt(event.tags.find((tag: NostrTag) => tag[0] === 'total_sessions')?.[1] || '0'),
        languages: event.tags.filter((tag: NostrTag) => tag[0] === 'language').map((tag: NostrTag) => tag[1]),
        timezone: event.tags.find((tag: NostrTag) => tag[0] === 'timezone')?.[1] || 'UTC'
      };
    });
  }

  // Get specific mentor profile
  async getMentorProfile(mentorPubkey: string): Promise<MentorProfile | null> {
    const filter = {
      kinds: [30078],
      authors: [mentorPubkey],
      '#type': ['mentor_profile'],
      '#academy': ['citadel']
    };
    const events = await this.nostrClient.queryEvents([filter]);
    
    if (events.length === 0) return null;
    const event: Event = events[0];
    const content = JSON.parse(event.content || '{}');
    
    return {
      pubkey: event.pubkey,
      name: event.tags.find((tag: NostrTag) => tag[0] === 'name')?.[1] || '',
      bio: content.bio || '',
      specialties: event.tags.filter((tag: NostrTag) => tag[0] === 'specialty').map((tag: NostrTag) => tag[1]),
      experience: content.experience || '',
      hourlyRate: parseInt(event.tags.find((tag: NostrTag) => tag[0] === 'hourly_rate')?.[1] || '0'),
      availability: content.availability || '',
      rating: parseFloat(event.tags.find((tag: NostrTag) => tag[0] === 'rating')?.[1] || '0'),
      totalSessions: parseInt(event.tags.find((tag: NostrTag) => tag[0] === 'total_sessions')?.[1] || '0'),
      languages: event.tags.filter((tag: NostrTag) => tag[0] === 'language').map((tag: NostrTag) => tag[1]),
      timezone: event.tags.find((tag: NostrTag) => tag[0] === 'timezone')?.[1] || 'UTC'
    };
  }
}