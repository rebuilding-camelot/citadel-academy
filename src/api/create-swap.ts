import { Request, Response } from 'express';
import { AtomicSwapService } from '../../lib/atomic-swap';
import { getLightningConfig, getNostrPrivateKey } from '../config';

// Initialize the AtomicSwapService
const { lnd } = getLightningConfig();
const swapService = new AtomicSwapService(
  lnd,
  getNostrPrivateKey()
);

// In-memory store for swaps (for backward compatibility)
const swaps: Record<string, any> = {};

/**
 * Create a new atomic swap for content purchase
 * 
 * @param req Request with contentId and priceSats
 * @param res Response with the created swap
 */
export default async function createSwap(req: Request, res: Response) {
  try {
    const { contentId, priceSats } = req.body;

    if (!contentId || !priceSats) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create a swap using the AtomicSwapService
    const swap = await swapService.createSwap(contentId, priceSats);

    // Store in the legacy swaps object for backward compatibility
    swaps[swap.id] = {
      id: swap.id,
      invoice: swap.invoice,
      contentId: swap.contentId,
      priceSats: priceSats,
      status: swap.status,
      createdAt: new Date(swap.createdAt).toISOString()
    };

    return res.status(201).json({
      id: swap.id,
      invoice: swap.invoice,
      contentId: swap.contentId,
      priceSats: priceSats,
      status: swap.status,
      createdAt: new Date(swap.createdAt).toISOString()
    });
  } catch (error) {
    console.error('Error creating swap:', error);
    return res.status(500).json({ error: 'Failed to create swap' });
  }
}

// Export the swaps store for use in other endpoints
export { swaps, swapService };