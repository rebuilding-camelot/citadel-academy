import { Request, Response } from 'express';
import { swapService, swaps } from './create-swap';

/**
 * Check the status of an atomic swap
 * 
 * @param req Request with swapId query parameter
 * @param res Response with the swap status
 */
export default async function checkSwap(req: Request, res: Response) {
  try {
    const { swapId } = req.query;

    if (!swapId || typeof swapId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid swapId' });
    }

    try {
      // Check the swap status using the AtomicSwapService
      const swap = await swapService.checkSwapStatus(swapId);
      
      // Update the legacy swap object for backward compatibility
      if (swaps[swapId]) {
        swaps[swapId].status = swap.status;
      }
      
      return res.json({ 
        id: swap.id,
        status: swap.status,
        contentId: swap.contentId,
        createdAt: new Date(swap.createdAt).toISOString()
      });
    } catch (error) {
      // If the swap is not found in the AtomicSwapService, try the legacy store
      const legacySwap = swaps[swapId];
      
      if (!legacySwap) {
        return res.status(404).json({ error: 'Swap not found' });
      }
      
      return res.json({ status: legacySwap.status });
    }
  } catch (error) {
    console.error('Error checking swap:', error);
    return res.status(500).json({ error: 'Failed to check swap status' });
  }
}