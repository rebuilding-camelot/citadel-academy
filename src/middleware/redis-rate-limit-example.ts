import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';

// Define custom properties on the Request interface
// Note: These should match the definitions in auth.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
      apiClient?: {
        id: string;
        permissions: string[];
      };
    }
  }
}

interface RedisRateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum number of requests allowed in the window
  message?: string;      // Custom error message
  statusCode?: number;   // Custom HTTP status code
  keyGenerator?: (req: Request) => string; // Function to generate a unique key for the request
}

/**
 * Redis client for rate limiting
 * In a real application, this would be a shared instance
 */
let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client
 */
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err: Error) => {
      console.error('Redis error:', err);
    });
    
    await redisClient.connect();
  }
  
  return redisClient;
}

/**
 * Rate limiting middleware using Redis for distributed environments
 */
export function redisRateLimit(options: RedisRateLimitOptions) {
  const {
    windowMs = 60 * 1000, // Default: 1 minute
    maxRequests = 10,     // Default: 10 requests per minute
    message = 'Too many requests, please try again later',
    statusCode = 429,     // Too Many Requests
    keyGenerator = (req: Request) => {
      // Default: Use IP address as the key
      return req.ip || 'unknown';
    }
  } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get Redis client
      const client = await getRedisClient();
      
      // Generate a unique key for this request
      let key = `ratelimit:${keyGenerator(req)}`;
      
      // If authenticated, include user ID in the key for more granular control
      if (req.user) {
        key = `${key}:user:${req.user.id}`;
      } else if (req.apiClient) {
        key = `${key}:client:${req.apiClient.id}`;
      }
      
      // Add endpoint to the key for endpoint-specific rate limiting
      key = `${key}:${req.method}:${req.path}`;
      
      // Get the current count
      const currentCount = await client.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;
      
      // Calculate remaining requests and time until reset
      const remaining = Math.max(0, maxRequests - count - 1);
      const resetTime = Date.now() + windowMs;
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      
      // Check if rate limit is exceeded
      if (count >= maxRequests) {
        // Get TTL of the key
        const ttl = await client.ttl(key);
        const retryAfter = ttl > 0 ? ttl : Math.ceil(windowMs / 1000);
        
        // Set retry-after header
        res.setHeader('Retry-After', retryAfter.toString());
        
        return res.status(statusCode).json({
          error: message,
          retryAfter
        });
      }
      
      // Increment the counter
      await client.incr(key);
      
      // Set expiration if this is the first request in the window
      if (count === 0) {
        await client.expire(key, Math.ceil(windowMs / 1000));
      }
      
      // Continue to the next middleware or route handler
      next();
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If Redis fails, allow the request to proceed
      next();
    }
  };
}

/**
 * Predefined Redis rate limiters for common scenarios
 */
export const redisRateLimiters = {
  // Strict rate limiter for sensitive operations (5 requests per minute)
  strict: redisRateLimit({
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Rate limit exceeded for sensitive operations'
  }),
  
  // Standard rate limiter (30 requests per minute)
  standard: redisRateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30
  }),
  
  // Relaxed rate limiter for less sensitive operations (100 requests per minute)
  relaxed: redisRateLimit({
    windowMs: 60 * 1000,
    maxRequests: 100
  }),
  
  // Custom rate limiter for specific endpoints
  custom: (windowMs: number, maxRequests: number) => redisRateLimit({
    windowMs,
    maxRequests
  })
};