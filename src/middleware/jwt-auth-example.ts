import { Request, Response, NextFunction } from 'express';
// Use require for jsonwebtoken to avoid TypeScript module resolution issues
const jwt = require('jsonwebtoken');
import { getSecureCredentials } from '../lib/secure-credential-manager.js';

// Define JWT token interface
interface JwtPayload {
  user: {
    id: string;
    role: string;
  };
  [key: string]: any;
}

// Define the user property on the Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

/**
 * JWT Authentication middleware example with jsonwebtoken library
 */
export async function jwtAuthenticate(req: Request, res: Response, next: NextFunction) {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'JWT token required' });
  }
  
  // Extract the token
  const token = authHeader.substring(7);
  
  try {
    // Get JWT secret from secure storage
    const credentials = await getSecureCredentials('jwt_secret');
    
    if (!credentials || !credentials.secret) {
      throw new Error('JWT secret not found in secure storage');
    }
    
    // Verify the token
    const decoded = jwt.verify(token, credentials.secret) as JwtPayload;
    
    // Add user info to request object
    req.user = decoded.user;
    
    // Continue to the next middleware or route handler
    next();
    
  } catch (error: unknown) {
    // Define a type guard for JWT errors
    const isJwtError = (err: any): err is Error & { name: string } => {
      return err instanceof Error && typeof err.name === 'string';
    };

    if (isJwtError(error)) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        console.error('JWT authentication error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
      }
    } else {
      console.error('Unknown JWT authentication error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
}

/**
 * Generate a JWT token
 */
export async function generateToken(user: { id: string; role: string; [key: string]: any }, expiresIn: string = '1h'): Promise<string> {
  try {
    // Get JWT secret from secure storage
    const credentials = await getSecureCredentials('jwt_secret');
    
    if (!credentials || !credentials.secret) {
      throw new Error('JWT secret not found in secure storage');
    }
    
    // Create the token
    const token = jwt.sign(
      { 
        user: {
          id: user.id,
          role: user.role
          // Only include id and role to match the type definition
        }
      },
      credentials.secret,
      { expiresIn }
    );
    
    return token;
    
  } catch (error: unknown) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Example login route handler that generates and returns a JWT token
 */
export async function loginHandler(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Validate credentials (replace with your actual authentication logic)
    if (username === 'demo' && password === 'password') {
      // Create a user object with additional properties for local use
      const userWithDetails = {
        id: 'user_123',
        username: 'demo',
        role: 'user'
      };
      
      // Generate a token (only id and role will be included in the token)
      const token = await generateToken(userWithDetails);
      
      // Return the token and user information
      // Note: We can include additional properties in the response
      // even though they're not in the JWT payload
      return res.status(200).json({
        token,
        user: {
          id: userWithDetails.id,
          username: userWithDetails.username, // Additional property not in JWT payload
          role: userWithDetails.role
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
  } catch (error: unknown) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}