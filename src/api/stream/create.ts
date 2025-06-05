// File: src/api/stream/create.ts
// Prompt: "Create API endpoint for Zap.stream integration"
import { ZapStreamClient } from '../../lib/zapstream-client';
import { Request, Response } from 'express';
import { nostrClient } from '../../lib/nostr-helpers';

// Export named function for better Express routing compatibility
export async function createStreamHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Add authentication check
  if (!req.user || !req.user.isAuthenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { title, description, tags, courseId, isEducational, requiresAuth } = req.body;
  
  // Validate required fields
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string' });
  }
  
  if (description && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }
  
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }
  
  if (tags && tags.some((tag: string) => typeof tag !== 'string' || tag.length > 100)) {
    return res.status(400).json({ error: 'Each tag must be a string with maximum 100 characters' });
  }
  
  // Additional security validation for tags
  if (tags && tags.some((tag: string) => !/^[a-zA-Z0-9\s\-_]+$/.test(tag))) {
    return res.status(400).json({ error: 'Tags can only contain alphanumeric characters, spaces, hyphens, and underscores' });
  }
  
  if (courseId && typeof courseId !== 'string') {
    return res.status(400).json({ error: 'CourseId must be a string' });
  }
  
  if (isEducational !== undefined && typeof isEducational !== 'boolean') {
    return res.status(400).json({ error: 'isEducational must be a boolean' });
  }
  
  if (requiresAuth !== undefined && typeof requiresAuth !== 'boolean') {
    return res.status(400).json({ error: 'requiresAuth must be a boolean' });
  }
  
  if (!process.env.ZAP_STREAM_API_KEY) {
    return res.status(500).json({ error: 'ZAP_STREAM_API_KEY environment variable is required' });
  }
  
  try {
    const zapStreamClient = new ZapStreamClient({
      apiUrl: process.env.ZAP_STREAM_API_URL || 'https://api.zap.stream',
      apiKey: process.env.ZAP_STREAM_API_KEY
    }, nostrClient);
    
    const streamData = await zapStreamClient.createStream({
      title,
      description,
      tags,
      courseId,
      isEducational,
      requiresAuth
    });
    
    res.status(200).json(streamData);
  } catch (error) {
    console.error('Stream creation failed:', error instanceof Error ? error.message : 'Unknown error');
    
    // Check for specific error types or codes
    if (error instanceof Error) {
      // If zapStreamClient throws specific error types, check them here
      if ((error as any).code === 'AUTH_FAILED' || error.name === 'AuthenticationError') {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      if ((error as any).code === 'VALIDATION_ERROR' || error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message || 'Invalid stream data' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create stream' });
  }
}

// For backward compatibility with existing imports
export default createStreamHandler;