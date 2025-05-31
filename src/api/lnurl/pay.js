// API Route: api/lnurl/pay.js
import { generateInvoice } from '../../lib/lnbits';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, zapRequest, courseId } = req.body;
    
    if (!amount || !zapRequest || !courseId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Parse the zap request
    let parsedZapRequest;
    try {
      parsedZapRequest = JSON.parse(zapRequest);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid zap request format' });
    }
    
    // Generate Lightning invoice using LNBits
    const invoice = await generateInvoice({
      amount_msat: amount,
      description: `Citadel Academy Course: ${courseId}`,
      metadata: JSON.stringify([
        ['text/plain', `Course purchase: ${courseId}`],
        ['text/identifier', `course@citadel.academy`]
      ]),
      // Store the zap request in the webhook data for later processing
      webhook_data: {
        zapRequest: parsedZapRequest,
        courseId
      }
    });
    
    // Return LNURL-pay response
    res.json({
      pr: invoice.payment_request,
      routes: [],
      successAction: {
        tag: 'url',
        url: `${import.meta.env.VITE_APP_URL || 'https://citadel.academy'}/courses/${courseId}/access`
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
  }
}