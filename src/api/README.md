# API Security Implementation

This document provides examples of how to integrate the authentication and rate limiting middleware into your Express application.

## Express Application Setup

Here's an example of how to set up an Express application with the security middleware:

```typescript
import express from 'express';
import helmet from 'helmet'; // Security headers (recommended)
import cors from 'cors';     // CORS protection (recommended)

// Import routers
import mentorInvoiceRouter from './mentor/create-invoice.js';

// Create Express app
const app = express();

// Basic security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// Apply routers
app.use('/api/mentor', mentorInvoiceRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Client-Side Authentication Example

Here's how clients should authenticate with the API:

### JWT Authentication (for users)

```javascript
// Example using fetch API
async function fetchProtectedResource() {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('https://api.example.com/api/mentor/create-invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      serviceId: '12345',
      amount: 1000,
      description: 'Mentoring session',
      mentorPubkey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    })
  });
  
  return await response.json();
}
```

### API Key Authentication (for services)

```javascript
// Example using axios
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `ApiKey ${process.env.API_KEY}`
  }
});

async function createInvoice(data) {
  try {
    const response = await apiClient.post('/api/mentor/create-invoice', data);
    return response.data;
  } catch (error) {
    // Handle rate limiting
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    throw error;
  }
}
```

## Testing Authentication and Rate Limiting

You can test the authentication and rate limiting with these curl commands:

### Test Authentication

```bash
# Test with valid JWT token
curl -X POST https://api.example.com/api/mentor/create-invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"serviceId":"12345","amount":1000,"description":"Mentoring session","mentorPubkey":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"}'

# Test with valid API key
curl -X POST https://api.example.com/api/mentor/create-invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: ApiKey your_api_key_here" \
  -d '{"serviceId":"12345","amount":1000,"description":"Mentoring session","mentorPubkey":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"}'

# Test with invalid authentication
curl -X POST https://api.example.com/api/mentor/create-invoice \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"12345","amount":1000,"description":"Mentoring session","mentorPubkey":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"}'
```

### Test Rate Limiting

```bash
# Run this command multiple times in quick succession to trigger rate limiting
for i in {1..10}; do
  curl -X POST https://api.example.com/api/mentor/create-invoice \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -d '{"serviceId":"12345","amount":1000,"description":"Mentoring session","mentorPubkey":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"}'
  echo ""
  sleep 1
done
```

After 5 requests within a minute, you should receive a 429 Too Many Requests response.