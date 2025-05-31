// API Route: api/webhooks/lnbits.js
import { createZapReceipt } from '../../lib/lnbits';
import { getRelays } from '../../lib/nostrUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the request is from LNBits
    // In production, you should implement proper authentication
    
    const { payment_hash, payment_preimage, payment_request, amount, webhook_data } = req.body;
    
    if (!payment_hash || !payment_preimage || !payment_request) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Parse the webhook data
    let parsedWebhookData;
    try {
      parsedWebhookData = JSON.parse(webhook_data);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid webhook data format' });
    }
    
    const { zapRequest, courseId } = parsedWebhookData;
    
    if (!zapRequest || !courseId) {
      return res.status(400).json({ message: 'Missing zap request or course ID in webhook data' });
    }
    
    // Create a zap receipt
    const zapReceipt = await createZapReceipt(zapRequest, payment_preimage, payment_request);
    
    // Publish the zap receipt to relays
    const { SimplePool } = await import('nostr-tools');
    const pool = new SimplePool();
    const relays = getRelays();
    
    try {
      const pubs = pool.publish(relays, zapReceipt);
      await Promise.all(pubs);
      
      // Store the course purchase in the database
      // This is where you would update your database to record the purchase
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error publishing zap receipt:', error);
      res.status(500).json({ message: 'Failed to publish zap receipt', error: error.message });
    } finally {
      pool.close(relays);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Failed to process webhook', error: error.message });
  }
}