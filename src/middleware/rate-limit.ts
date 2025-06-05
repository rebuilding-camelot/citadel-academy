import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum number of requests allowed in the window
  message?: string;      // Custom error message
  statusCode?: number;   // Custom HTTP status code
  keyGenerator?: (req: Request) => string; // Function to generate a unique key for the request
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory store for rate limiting
 * In production, use Redis or another distributed cache
 */
const store: RateLimitStore = {};

/**
 * Cleanup function to remove expired entries from the store
 */
function cleanupStore() {
  const now = Date.now();
  
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupStore, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 60 * 1000, // Default: 1 minute
    maxRequests = 10,     // Default: 10 requests per minute
    message = 'Too many requests, please try again later',
    statusCode = 429,     // Too Many Requests
    keyGenerator = (req: Request) => {
      // Default: Use IP address as the key
      // In production, use a more reliable method to get client IP
      return req.ip || 'unknown';
    }
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Generate a unique key for this request
    let key = keyGenerator(req);
    
    // If authenticated, include user ID in the key for more granular control
    if (req.user) {
      key = `${key}:user:${req.user.id}`;
    } else if (req.apiClient) {
      key = `${key}:client:${req.apiClient.id}`;
    }
    
    // Add endpoint to the key for endpoint-specific rate limiting
    key = `${key}:${req.method}:${req.path}`;
    
    const now = Date.now();
    
    // Initialize or reset if window has expired
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Increment request count
    store[key].count += 1;
    
    // Calculate remaining requests and time until reset
    const remaining = Math.max(0, maxRequests - store[key].count);
    const resetTime = store[key].resetTime;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
    
    // Check if rate limit is exceeded
    if (store[key].count > maxRequests) {
      // Set retry-after header
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      
      res.status(statusCode).json({
        error: message,
        retryAfter
      });
      return;
    }
    
    // Continue to the next middleware or route handler
    next();
  };
}

/**
 * Predefined rate limiters for common scenarios
 */
export const rateLimiters = {
  // Strict rate limiter for sensitive operations (5 requests per minute)
  strict: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Rate limit exceeded for sensitive operations'
  }),
  
  // Standard rate limiter (30 requests per minute)
  standard: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30
  }),
  
  // Relaxed rate limiter for less sensitive operations (100 requests per minute)
  relaxed: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 100
  }),
  
  // Custom rate limiter for specific endpoints
  custom: (windowMs: number, maxRequests: number) => rateLimit({
    windowMs,
    maxRequests
  })
};