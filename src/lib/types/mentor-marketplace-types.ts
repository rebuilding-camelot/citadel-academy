export interface MentorStall {
  id: string;
  name: string;
  description: string;
  currency: 'sats' | 'btc';
  shipping: MentorShipping[];
}

export interface MentorShipping {
  id: string;
  name: string;
  cost: number;
  regions: string[];
}

export interface MentorService {
  id: string;
  stallId: string;
  name: string;
  description: string;
  images: string[];
  currency: 'sats' | 'btc';
  price: number;
  quantity?: number;
  specs: [string, string][];
  shipping: MentorShipping[];
  mentorPubkey: string;
  categories: string[];
  duration?: number; // minutes for sessions
  availability?: string; // schedule info
}

export interface MentorOrder {
  id: string;
  type: 0 | 1; // 0 = new order, 1 = payment confirmation
  name?: string;
  address?: string;
  message?: string;
  contact: {
    nostr?: string;
    email?: string;
    phone?: string;
  };
  items: {
    product_id: string;
    quantity: number;
  }[];
  shipping_id: string;
}

export interface MentorProfile {
  pubkey: string;
  name: string;
  bio: string;
  specialties: string[];
  experience: string;
  hourlyRate: number;
  availability: string;
  rating: number;
  totalSessions: number;
  languages: string[];
  timezone: string;
}