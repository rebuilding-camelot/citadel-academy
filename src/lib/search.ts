// File: lib/search.ts
// Implements NIP-50 search functionality for course discovery
import { Filter } from 'nostr-tools';
import type { Event } from 'nostr-tools';
import { nostrClient } from './nostr-helpers';

export interface SearchParams {
  query: string;
  tags?: string[];
  courseLevel?: 'beginner' | 'intermediate' | 'advanced';
  instructor?: string;
}

/**
 * Search for courses using NIP-50 search functionality
 * 
 * @param params - Search parameters including query, tags, courseLevel, and instructor
 * @returns Promise<Event[]> - Array of matching course events
 */
export async function searchCourses(params: SearchParams): Promise<Event[]> {
  const filter: Filter = {
    kinds: [30023], // NIP-23 long-form content (courses)
    search: params.query,
    limit: 50
  };
  
  // Add tag filters
  if (params.tags?.length) {
    filter['#t'] = params.tags;
  }
  
  if (params.courseLevel) {
    filter['#level'] = [params.courseLevel];
  }
  
  if (params.instructor) {
    filter.authors = [params.instructor];
  }
  
  const events = await queryRelays([filter]);
  return events.sort((a, b) => b.created_at - a.created_at);
}

/**
 * Query multiple relays with the given filters
 * 
 * @param filters - Array of Nostr filters to query
 * @returns Promise<Event[]> - Array of events from all relays
 */
async function queryRelays(filters: Filter[]): Promise<Event[]> {
  // Ensure the client is connected
  if (!nostrClient.connected) {
    await nostrClient.connect();
  }
  
  const allEvents: Event[] = [];
  
  // Query each filter
  for (const filter of filters) {
    const events = await nostrClient.queryEvents(filter);
    allEvents.push(...events);
  }
  
  // Deduplicate events by ID
  const uniqueEvents = allEvents.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );
  
  return uniqueEvents;
}