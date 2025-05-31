// LNBits integration for Lightning payments
const LNBITS_URL = import.meta.env.VITE_LNBITS_URL || 'https://legend.lnbits.com';
const LNBITS_ADMIN_KEY = import.meta.env.VITE_LNBITS_ADMIN_KEY;
const LNBITS_INVOICE_READ_KEY = import.meta.env.VITE_LNBITS_INVOICE_READ_KEY;

/**
 * Generates a Lightning invoice using LNBits
 * @param {Object} options Invoice options
 * @param {number} options.amount_msat Amount in millisatoshis
 * @param {string} options.description Invoice description
 * @param {string} options.metadata Invoice metadata in JSON string format
 * @param {Object} options.webhook_data Data to be sent to the webhook
 * @returns {Promise<Object>} Invoice data
 */
export async function generateInvoice({ amount_msat, description, metadata, webhook_data = {} }) {
  if (!LNBITS_ADMIN_KEY) {
    throw new Error('LNBITS_ADMIN_KEY is not set');
  }

  try {
    const response = await fetch(`${LNBITS_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LNBITS_ADMIN_KEY
      },
      body: JSON.stringify({
        out: false,
        amount: Math.floor(amount_msat / 1000), // Convert to sats for LNBits
        memo: description,
        description_hash: '', // Optional
        unhashed_description: metadata,
        webhook: `${import.meta.env.VITE_APP_URL || 'https://citadel.academy'}/api/webhooks/lnbits`,
        webhook_data: JSON.stringify(webhook_data)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LNBits API error: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
}

/**
 * Checks if a Lightning invoice has been paid
 * @param {string} payment_hash Payment hash of the invoice
 * @returns {Promise<boolean>} Whether the invoice has been paid
 */
export async function checkInvoicePaid(payment_hash) {
  if (!LNBITS_INVOICE_READ_KEY) {
    throw new Error('LNBITS_INVOICE_READ_KEY is not set');
  }

  try {
    const response = await fetch(`${LNBITS_URL}/api/v1/payments/${payment_hash}`, {
      headers: {
        'X-Api-Key': LNBITS_INVOICE_READ_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LNBits API error: ${errorData.detail || response.statusText}`);
    }

    const data = await response.json();
    return data.paid;
  } catch (error) {
    console.error('Error checking invoice status:', error);
    throw error;
  }
}

/**
 * Creates a zap receipt after payment is confirmed
 * @param {Object} zapRequest Original zap request
 * @param {string} preimage Payment preimage
 * @param {string} bolt11 BOLT11 invoice
 * @returns {Promise<Object>} Zap receipt event
 */
export async function createZapReceipt(zapRequest, preimage, bolt11) {
  const { finalizeEvent } = await import('nostr-tools/pure');
  
  // Get the academy private key from environment variables
  const academyPrivateKey = import.meta.env.VITE_ACADEMY_PRIVATE_KEY;
  if (!academyPrivateKey) {
    throw new Error('ACADEMY_PRIVATE_KEY is not set');
  }
  
  // Extract relevant information from the zap request
  const { pubkey: requestorPubkey, tags } = zapRequest;
  const amountTag = tags.find(tag => tag[0] === 'amount');
  const courseTag = tags.find(tag => tag[0] === 'course');
  
  if (!amountTag || !courseTag) {
    throw new Error('Invalid zap request: missing required tags');
  }
  
  // Create the zap receipt event
  const zapReceipt = {
    kind: 9735, // NIP-57 zap receipt
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', requestorPubkey], // Recipient
      ['bolt11', bolt11],
      ['description', JSON.stringify(zapRequest)],
      ['preimage', preimage],
      ['amount', amountTag[1]],
      ['course', courseTag[1]]
    ],
    content: '',
    pubkey: '', // Will be set by signing
  };
  
  // Sign the event using finalizeEvent
  return finalizeEvent(zapReceipt, academyPrivateKey);
}