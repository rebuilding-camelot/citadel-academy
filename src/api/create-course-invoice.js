// API Route: api/create-course-invoice.js
import { generateInvoice } from '../lib/lnbits';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, description, courseId } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Generate Lightning invoice using LNBits
    const invoice = await generateInvoice({
      amount_msat: amount * 1000, // Convert to msats
      description: description,
      metadata: JSON.stringify([
        ['text/plain', description],
        ['text/identifier', `course@citadel.academy`]
      ]),
      webhook_data: {
        courseId: courseId || 'general-course',
        amount,
        description
      }
    });
    
    res.json({
      payment_request: invoice.payment_request,
      payment_hash: invoice.payment_hash
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
  }
}