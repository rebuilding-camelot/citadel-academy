import { Request, Response, Router, NextFunction } from 'express';
import { generateLightningInvoice } from '../lnurl/utils.js';
// Secure storage solution imports
import { getSecureCredentials } from '../../lib/secure-credential-manager.js';
import { nostrClient, hexToBytes } from '../../lib/nostr-helpers.js';
import { getEventHash, finalizeEvent } from 'nostr-tools';
import type { Event } from 'nostr-tools';
// Import middleware
import { authenticate } from '../../middleware/auth.js';
import { rateLimiters } from '../../middleware/rate-limit.js';
import { validateBody, validationSchemas } from '../../middleware/validate.js';

// Create a router for this endpoint
const router = Router();

// Apply middleware to the route
// 1. Authentication middleware
// 2. Rate limiting (strict: 5 requests per minute)
// 3. Request validation
router.post(
  '/create-invoice',
  authenticate,
  rateLimiters.strict,
  validateBody(validationSchemas.createMentorInvoice),
  handler
);

// Export the router
export default router;

// Handler function (separated from route definition)
function handler(req: Request, res: Response, next: NextFunction): void {
  // Method check is no longer needed as router.post ensures only POST requests reach here
  const { serviceId, amount, description, mentorPubkey } = req.body;
  
  // Validation is now handled by the validateBody middleware
  
  // Log the authenticated user or API client
  const requesterId = req.user?.id || req.apiClient?.id || 'unknown';
  console.log(`Invoice creation requested by: ${requesterId} for mentor: ${mentorPubkey}`);
  
  // Create Lightning invoice for mentor session
  createLightningInvoice({
    amount,
    description,
    metadata: {
      serviceId,
      mentorPubkey,
      type: 'mentor_session',
      requesterId // Track who created the invoice
    }
  })
  .then(invoice => {
    // Store booking record
    return storeMentorBooking({
      serviceId,
      amount,
      mentorPubkey,
      invoiceHash: invoice.payment_hash,
      status: 'pending'
    }).then(() => invoice);
  })
  .then(invoice => {
    res.status(200).json({
      payment_request: invoice.payment_request,
      payment_hash: invoice.payment_hash
    });
  })
  .catch(error => {
    console.error('Mentor invoice creation failed:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  });
}

// Helper functions (integrate with your existing payment system)
interface InvoiceParams {
  amount: number;
  description: string;
  metadata: {
    serviceId: string;
    mentorPubkey: string;
    type: string;
    [key: string]: any;
  };
}

interface Invoice {
  payment_request: string;
  payment_hash: string;
  id?: string;
}

async function createLightningInvoice(params: InvoiceParams): Promise<Invoice> {
  // Use your existing LNbits/Lightning implementation
  
  // Generate a unique invoice ID
  const invoiceId = `mentor_${params.metadata.serviceId}_${Date.now()}`;
  
  // Create the invoice using your existing implementation
  return await generateLightningInvoice({
    amount: params.amount,
    description: params.description,
    invoiceId,
    metadata: params.metadata
  });
}

interface MentorBooking {
  serviceId: string;
  amount: number;
  mentorPubkey: string;
  invoiceHash: string;
  status: 'pending' | 'paid' | 'cancelled';
}

async function storeMentorBooking(booking: MentorBooking): Promise<void> {
  // Store in Nostr event
  console.log('Storing mentor booking for service:', booking.serviceId);
  
  try {
    // 1. Initialize Nostr client if not already connected
    if (!nostrClient.connected) {
      await nostrClient.connect();
    }
    
    // 2. Get credentials securely from the secure credential manager
    const credentials = await getSecureCredentials('nostr_admin');
    
    if (!credentials || !credentials.pubkey || !credentials.privkey) {
      throw new Error('Unable to access secure credentials for Nostr event creation');
    }
    
    // 3. Create event with minimal sensitive data
    const bookingEvent = {
      kind: 30078, // Application-specific data
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `mentor-booking-${booking.serviceId}`],
        ['service', booking.serviceId],
        ['mentor', booking.mentorPubkey],
        ['amount', booking.amount.toString()],
        ['status', booking.status],
        ['invoice', booking.invoiceHash],
        ['type', 'mentor_booking']
      ],
      // 4. Store only necessary data in content
      content: JSON.stringify({
        serviceId: booking.serviceId,
        status: booking.status,
        created_at: new Date().toISOString()
      }),
      pubkey: credentials.pubkey, // Set the pubkey from credentials
      id: '',     // Will be set by finalizeEvent
      sig: ''     // Will be set by finalizeEvent
    } as Event;
    
    // 5. Calculate event hash
    bookingEvent.id = getEventHash(bookingEvent);
    
    // 6. Sign with secure credentials - convert hex private key to Uint8Array
    const privateKeyBytes = hexToBytes(credentials.privkey);
    const signedEvent = finalizeEvent(bookingEvent, privateKeyBytes);
    
    // 7. Publish event to all configured relays
    await nostrClient.publishEvent(signedEvent);
    
    console.log('Mentor booking stored successfully as Nostr event with ID:', signedEvent.id);
    
    // 8. Verify the event was published by querying it back (optional but recommended)
    const filter = {
      kinds: [30078],
      ids: [signedEvent.id],
      limit: 1
    };
    
    const verificationEvents = await nostrClient.queryEvents(filter);
    if (verificationEvents.length === 0) {
      console.warn('Warning: Booking event published but not yet confirmed in relay');
    }
  } catch (error: unknown) {
    console.error('Failed to store mentor booking:', error);
    // Re-throw the error to be handled by the caller
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to store mentor booking: ${errorMessage}`);
  }
}