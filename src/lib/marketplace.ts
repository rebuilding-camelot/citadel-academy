// File: lib/marketplace.ts
// Prompt: "Create NIP-15 marketplace for Citadel Academy bookstore"
import { Event, EventTemplate, getEventHash, finalizeEvent } from 'nostr-tools';
import { nostrClient } from './nostr-helpers';

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface BookProduct {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number; // sats
  category: 'textbook' | 'reference' | 'course' | 'supplement';
  format: 'pdf' | 'epub' | 'video' | 'audio';
  fileUrl?: string;
  coverImage: string;
  isbn?: string;
  fileHash?: string;
  fileSize?: number;
}

/**
 * Creates a NIP-15 product listing event for a book
 * 
 * @param product - Book product details
 * @param sellerPrivateKey - Private key of the seller for signing the event
 * @returns Signed Nostr event ready for publishing
 */
export function createBookListing(
  product: BookProduct,
  sellerPrivateKey: string
): Event {
  // Create an event template
  const eventTemplate: EventTemplate = {
    kind: 30017, // NIP-15 product listing
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', product.id], // NIP-33 identifier
      ['title', product.title],
      ['summary', product.description],
      ['image', product.coverImage],
      ['price', product.price.toString(), 'sats'],
      ['category', product.category],
      ['format', product.format],
      ['author', product.author],
      ...(product.isbn ? [['isbn', product.isbn]] : []),
      ['location', 'digital'],
      ['shipping', 'instant']
    ],
    content: JSON.stringify({
      name: product.title,
      description: product.description,
      images: [product.coverImage],
      currency: 'sats',
      price: product.price,
      specs: [
        ['Author', product.author],
        ['Format', product.format],
        ['Category', product.category]
      ]
    })
  };
  
  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(sellerPrivateKey);
  
  // Finalize the event with the private key to add id and signature
  const event = finalizeEvent(eventTemplate, privateKeyBytes);
  
  return event;
}

/**
 * Creates a NIP-15 purchase order event
 * 
 * @param productEventId - Event ID of the product being purchased
 * @param buyerPubkey - Public key of the buyer
 * @param sellerPubkey - Public key of the seller
 * @param privateKey - Private key of the buyer for signing
 * @returns Signed purchase order event
 */
export function createPurchaseOrder(
  productEventId: string,
  buyerPubkey: string,
  sellerPubkey: string,
  privateKey: string
): Event {
  // Create an event template
  const eventTemplate: EventTemplate = {
    kind: 30018, // NIP-15 purchase order
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `order-${Date.now()}`],
      ['e', productEventId], // Reference to product
      ['p', sellerPubkey], // Seller
      ['type', 'purchase']
    ],
    content: JSON.stringify({
      contact: {
        nostr: buyerPubkey,
        email: '' // Optional
      },
      items: [{
        product_id: productEventId,
        quantity: 1
      }],
      shipping_id: 'instant-digital'
    })
  };
  
  // Convert hex private key to Uint8Array for nostr-tools
  const privateKeyBytes = hexToBytes(privateKey);
  
  // Finalize the event with the private key to add id and signature
  const event = finalizeEvent(eventTemplate, privateKeyBytes);
  
  return event;
}

/**
 * Publishes a book listing to Nostr relays
 * 
 * @param product - Book product to list
 * @param sellerPrivateKey - Private key of the seller
 * @returns Promise resolving to the published event details
 */
export async function publishBookListing(
  product: BookProduct,
  sellerPrivateKey: string
): Promise<{ fileUrl: string, productEvent: Event, metadataEvent: Event }> {
  // Create product listing event
  const productEvent = createBookListing(product, sellerPrivateKey);
  
  // Create metadata event (could be used for additional file info)
  const metadataEvent: Event = {
    kind: 30078, // Custom kind for file metadata
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `metadata-${product.id}`],
      ['r', product.fileUrl || ''],
      ['title', product.title],
      ['format', product.format],
      ['size', product.fileSize?.toString() || '0'],
      ['hash', product.fileHash || '']
    ],
    content: JSON.stringify({
      title: product.title,
      format: product.format,
      fileUrl: product.fileUrl,
      fileHash: product.fileHash,
      fileSize: product.fileSize
    }),
    pubkey: productEvent.pubkey,
    id: '',
    sig: ''
  };
  
  // Finalize metadata event
  const privateKeyBytes = hexToBytes(sellerPrivateKey);
  metadataEvent.id = getEventHash(metadataEvent);
  // @ts-ignore - finalizeEvent expects slightly different structure
  metadataEvent.sig = finalizeEvent(metadataEvent, privateKeyBytes).sig;
  
  // Publish all events
  await publishEvent(metadataEvent);
  await publishEvent(productEvent);
  
  return { fileUrl: product.fileUrl || '', productEvent, metadataEvent };
}

/**
 * Fetches book listings from Nostr relays
 * 
 * @param category - Optional category filter
 * @param limit - Maximum number of listings to fetch
 * @returns Promise resolving to an array of book listing events
 */
export async function fetchBookListings(
  category?: string,
  limit: number = 50
): Promise<Event[]> {
  const filter: any = {
    kinds: [30017], // NIP-15 product listings
    limit
  };
  
  if (category) {
    filter['#category'] = [category];
  }
  
  return await nostrClient.queryEvents(filter);
}

/**
 * Publishes a purchase order to Nostr relays
 * 
 * @param productEventId - Event ID of the product being purchased
 * @param buyerPubkey - Public key of the buyer
 * @param sellerPubkey - Public key of the seller
 * @param privateKey - Private key of the buyer
 * @returns Promise resolving to the published event
 */
export async function publishPurchaseOrder(
  productEventId: string,
  buyerPubkey: string,
  sellerPubkey: string,
  privateKey: string
): Promise<Event> {
  const event = createPurchaseOrder(productEventId, buyerPubkey, sellerPubkey, privateKey);
  await nostrClient.publishEvent(event);
  return event;
}

/**
 * Publishes any Nostr event to relays
 * 
 * @param event - Signed Nostr event ready for publishing
 * @returns Promise resolving when the event is published
 */
export async function publishEvent(event: Event): Promise<void> {
  await nostrClient.publishEvent(event);
}

/**
 * Fetches purchase orders for a specific seller or buyer
 * 
 * @param pubkey - Public key of the seller or buyer
 * @param isSeller - Whether the pubkey belongs to a seller
 * @returns Promise resolving to an array of purchase order events
 */
export async function fetchPurchaseOrders(
  pubkey: string,
  isSeller: boolean = false
): Promise<Event[]> {
  const filter: any = {
    kinds: [30018], // NIP-15 purchase orders
    limit: 50
  };
  
  if (isSeller) {
    filter['#p'] = [pubkey]; // Filter by seller
  } else {
    filter.authors = [pubkey]; // Filter by buyer
  }
  
  return await nostrClient.queryEvents(filter);
}

/**
 * Calculates SHA-256 hash of a file
 * 
 * @param file - File to hash
 * @returns Promise resolving to the hex-encoded hash
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gets the format from a file's MIME type
 * 
 * @param mimeType - MIME type string
 * @returns Format of the file
 */
export function getFormatFromMimeType(mimeType: string): BookProduct['format'] {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('epub')) return 'epub';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  return 'pdf';
}

/**
 * Generates a cover image for a book
 * 
 * @param file - File to generate cover for
 * @param title - Title of the book
 * @returns Promise resolving to the cover image URL
 */
export async function generateCoverImage(file: File, title: string): Promise<string> {
  // Generate a simple cover image or use first frame for videos
  return `https://citadel.academy/api/generate-cover?title=${encodeURIComponent(title)}`;
}