// File: lib/marketplace-payments.ts
// Prompt: "Integrate existing NIP-57 zaps with NIP-15 marketplace purchases"
import { Event } from 'nostr-tools';
import { CoursePayment } from './lightning';
import { createPurchaseOrder, publishEvent } from './marketplace';
import { updatePurchaseHistory } from './enhanced-progress';
// Import the hook type for TypeScript support
import type { useNostrWalletConnect as UseNostrWalletConnectType } from '../hooks/useNostrWalletConnect';

export interface MarketplacePurchase extends CoursePayment {
  productEventId: string;
  sellerPubkey: string;
  fileUrl?: string;
  accessLevel: 'instant' | 'pending' | 'subscription';
}

/**
 * Creates a course invoice for marketplace purchase
 * @param payment Payment details
 * @returns Lightning invoice
 */
export async function createCourseInvoice(payment: CoursePayment): Promise<string> {
  // Generate LNURL-pay request
  const lnurlResponse = await fetch('/api/lnurl/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: payment.amount * 1000, // Convert to msats
      courseId: payment.courseId,
      description: payment.description
    })
  });
  
  if (!lnurlResponse.ok) {
    const errorData = await lnurlResponse.json();
    throw new Error(`Failed to create invoice: ${errorData.message || lnurlResponse.statusText}`);
  }
  
  const { pr } = await lnurlResponse.json();
  return pr;
}

/**
 * Purchases a marketplace item using NIP-57 zaps and NIP-15 marketplace
 * @param productEvent Product event from marketplace
 * @param buyerPubkey Buyer's public key
 * @param payInvoice Function to pay Lightning invoice (from useNostrWalletConnect hook)
 * @returns Promise that resolves when purchase is complete
 */
export async function purchaseMarketplaceItem(
  productEvent: Event,
  buyerPubkey: string,
  payInvoice: (invoice: string) => Promise<any>
): Promise<void> {
  const price = productEvent.tags.find(tag => tag[0] === 'price')?.[1];
  const title = productEvent.tags.find(tag => tag[0] === 'title')?.[1];
  
  if (!price || !title) throw new Error('Invalid product event');
  
  // Create enhanced zap request with marketplace context
  const zapRequest: Event = {
    kind: 9734, // NIP-57 zap request
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', productEvent.pubkey], // Seller
      ['e', productEvent.id], // Product reference
      ['amount', (parseInt(price) * 1000).toString()], // msats
      ['relays', 'wss://relay.citadel.academy'],
      ['product', productEvent.id], // Marketplace extension
      ['marketplace', 'citadel-academy']
    ],
    content: `Purchase: ${title}`,
    pubkey: buyerPubkey,
  } as Event;
  
  // Generate invoice using your existing NWC system
  const invoice = await createCourseInvoice({
    courseId: productEvent.id,
    amount: parseInt(price),
    description: `Marketplace Purchase: ${title}`,
    studentPubkey: buyerPubkey
  });
  
  // Process payment
  const result = await payInvoice(invoice);
  
  // Create NIP-15 purchase order
  const purchaseOrder = createPurchaseOrder(
    productEvent.id,
    buyerPubkey,
    productEvent.pubkey,
    'buyer-private-key'
  );
  
  await publishEvent(purchaseOrder);
  
  // Update NIP-78 purchase history
  await updatePurchaseHistory(buyerPubkey, productEvent.id, result);
}