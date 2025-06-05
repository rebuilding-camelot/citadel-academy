# API Security Middleware

This directory contains middleware for securing API endpoints with authentication, rate limiting, and request validation.

## Authentication Middleware

The authentication middleware (`auth.ts`) provides JWT and API key authentication for API endpoints.

### Usage

```typescript
import { authenticate } from '../middleware/auth.js';

// Apply to a single route
router.post('/protected-route', authenticate, routeHandler);

// Apply to all routes in a router
router.use(authenticate);
```

### Authentication Methods

1. **JWT Authentication**
   - Format: `Authorization: Bearer <token>`
   - Used for user authentication
   - The user object is added to `req.user`

2. **API Key Authentication**
   - Format: `Authorization: ApiKey <api_key>`
   - Used for service-to-service authentication
   - The client object is added to `req.apiClient`

## Rate Limiting Middleware

The rate limiting middleware (`rate-limit.ts`) prevents abuse by limiting the number of requests from a client within a time window.

### Usage

```typescript
import { rateLimiters } from '../middleware/rate-limit.js';

// Use predefined rate limiters
router.post('/sensitive-route', rateLimiters.strict, routeHandler);
router.get('/standard-route', rateLimiters.standard, routeHandler);
router.get('/high-volume-route', rateLimiters.relaxed, routeHandler);

// Create a custom rate limiter (windowMs, maxRequests)
router.post('/custom-route', rateLimiters.custom(30000, 5), routeHandler);
```

### Predefined Rate Limiters

- **strict**: 5 requests per minute
- **standard**: 30 requests per minute
- **relaxed**: 100 requests per minute
- **custom**: Configurable window and request limit

## Request Validation Middleware

The validation middleware (`validate.ts`) ensures that requests contain valid data before processing.

### Usage

```typescript
import { validateBody, validateQuery, validateParams, validationSchemas } from '../middleware/validate.js';

// Use predefined validation schemas
router.post('/create-invoice', validateBody(validationSchemas.createMentorInvoice), routeHandler);

// Create custom validation schemas
const customSchema = {
  id: {
    type: 'string',
    required: true,
    pattern: /^[a-f0-9]{24}$/
  },
  limit: {
    type: 'number',
    min: 1,
    max: 100
  }
};

router.get('/items/:id', validateParams(customSchema), routeHandler);
```

## Integration Example

Here's an example of how to apply all middleware to a route:

```typescript
router.post(
  '/create-invoice',
  authenticate,                                    // Authentication
  rateLimiters.strict,                             // Rate limiting
  validateBody(validationSchemas.createMentorInvoice), // Request validation
  handler
);
```

## Production Considerations

1. **Authentication**:
   - Use a proper JWT library for token verification
   - Store secrets securely
   - Implement token refresh mechanisms

2. **Rate Limiting**:
   - Use Redis or another distributed cache for the rate limit store
   - Implement more sophisticated rate limiting strategies for different user roles

3. **Validation**:
   - Consider using a validation library like Joi, Yup, or Zod for more complex validation
   - Implement input sanitization to prevent XSS and injection attacks