// Type definitions for Express
import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      user?: {
        isAuthenticated: boolean;
        id?: string;
        // Add other user properties as needed
      };
    }
  }
}

export {};