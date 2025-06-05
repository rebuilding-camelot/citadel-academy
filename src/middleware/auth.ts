import { Request, Response, NextFunction } from 'express';
import { getSecureCredentials } from '../lib/secure-credential-manager.js';

/**
 * Authentication middleware for API endpoints
 * Verifies JWT tokens or API keys depending on configuration
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  // Check if it's a Bearer token
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Verify JWT token (using Promise)
    verifyToken(token)
      .then(isValid => {
        if (!isValid) {
          res.status(401).json({ error: 'Invalid or expired token' });
          return;
        }
        
        // Add user info to request object for use in route handlers
        req.user = isValid.user;
        
        // Authentication successful, proceed to the next middleware or route handler
        next();
      })
      .catch(error => {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      });
      
  } else if (authHeader.startsWith('ApiKey ')) {
    // API key authentication
    const apiKey = authHeader.substring(7);
    
    // Verify API key (using Promise)
    verifyApiKey(apiKey)
      .then(isValidApiKey => {
        if (!isValidApiKey) {
          res.status(401).json({ error: 'Invalid API key' });
          return;
        }
        
        // Add API client info to request
        req.apiClient = isValidApiKey.client;
        
        // Authentication successful, proceed to the next middleware or route handler
        next();
      })
      .catch(error => {
        console.error('API key verification error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      });
      
  } else {
    res.status(401).json({ error: 'Unsupported authentication method' });
    return;
  }
}

/**
 * Verify JWT token
 */
async function verifyToken(token: string): Promise<any> {
  try {
    // Get JWT secret from secure storage
    const credentials = await getSecureCredentials('jwt_secret');
    
    if (!credentials || !credentials.secret) {
      throw new Error('JWT secret not found in secure storage');
    }
    
    // In a real implementation, use a JWT library to verify the token
    // This is a simplified example
    // Example with jsonwebtoken library:
    // const decoded = jwt.verify(token, credentials.secret);
    
    // For now, we'll simulate verification
    if (token === 'invalid_token') {
      return false;
    }
    
    // Return user information extracted from the token
    return {
      user: {
        id: 'user_123',
        role: 'user'
      }
    };
    
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Verify API key
 */
async function verifyApiKey(apiKey: string): Promise<any> {
  try {
    // Get API keys from secure storage
    const credentials = await getSecureCredentials('api_keys');
    
    if (!credentials || !credentials.keys) {
      throw new Error('API keys not found in secure storage');
    }
    
    // In a real implementation, check against stored API keys
    // This is a simplified example
    
    // Simulate API key verification
    if (apiKey === 'invalid_key') {
      return false;
    }
    
    // Return client information associated with the API key
    return {
      client: {
        id: 'client_456',
        permissions: ['create_invoice']
      }
    };
    
  } catch (error) {
    console.error('API key verification error:', error);
    return false;
  }
}

// Extend Express Request type to include user and apiClient properties
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