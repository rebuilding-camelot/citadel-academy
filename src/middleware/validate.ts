import { Request, Response, NextFunction } from 'express';

/**
 * Interface for validation schema
 */
interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean | string;
  };
}

/**
 * Validation error interface
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Middleware factory for request body validation
 */
export function validateBody(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.body, schema);
    
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
}

/**
 * Middleware factory for request query validation
 */
export function validateQuery(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.query, schema);
    
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Query validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
}

/**
 * Middleware factory for request params validation
 */
export function validateParams(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.params, schema);
    
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Path parameter validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
}

/**
 * Validate an object against a schema
 */
function validateObject(obj: any, schema: ValidationSchema): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check for required fields
  for (const field in schema) {
    const rules = schema[field];
    const value = obj[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`
      });
      continue;
    }
    
    // Skip validation for optional fields that are not provided
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type === 'string') {
      if (typeof value !== 'string') {
        errors.push({
          field,
          message: `${field} must be a string`
        });
      } else {
        // String-specific validations
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.minLength} characters long`
          });
        }
        
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `${field} must be at most ${rules.maxLength} characters long`
          });
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({
            field,
            message: `${field} has an invalid format`
          });
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({
            field,
            message: `${field} must be one of: ${rules.enum.join(', ')}`
          });
        }
      }
    } else if (rules.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({
          field,
          message: `${field} must be a number`
        });
      } else {
        // Number-specific validations
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.min}`
          });
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            field,
            message: `${field} must be at most ${rules.max}`
          });
        }
      }
    } else if (rules.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push({
          field,
          message: `${field} must be a boolean`
        });
      }
    } else if (rules.type === 'object') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push({
          field,
          message: `${field} must be an object`
        });
      }
    } else if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push({
          field,
          message: `${field} must be an array`
        });
      } else {
        // Array-specific validations
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push({
            field,
            message: `${field} must contain at least ${rules.minLength} items`
          });
        }
        
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `${field} must contain at most ${rules.maxLength} items`
          });
        }
      }
    }
    
    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value);
      
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === 'string' ? customResult : `${field} failed custom validation`
        });
      }
    }
  }
  
  return errors;
}

/**
 * Predefined validation schemas for common use cases
 */
export const validationSchemas = {
  // Mentor invoice creation validation schema
  createMentorInvoice: {
    serviceId: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      maxLength: 100
    },
    amount: {
      type: 'number' as const,
      required: true,
      min: 1
    },
    description: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      maxLength: 500
    },
    mentorPubkey: {
      type: 'string' as const,
      required: true,
      minLength: 64,
      maxLength: 64,
      pattern: /^[0-9a-f]{64}$/i
    }
  }
};