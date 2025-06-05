# Atomic Swap Feature Documentation

## Overview

The Atomic Swap feature enables trustless content purchases using Bitcoin Lightning Network. It implements a Hash Time-Locked Contract (HTLC) mechanism to ensure that either both parties receive their assets or neither does, eliminating counterparty risk.

## Architecture

The feature consists of the following components:

1. **AtomicSwapService** (`lib/atomic-swap.ts`): Core service that handles swap creation, status checking, and content delivery.
2. **API Endpoints**:
   - `pages/api/create-swap.ts`: Creates a new atomic swap
   - `pages/api/check-swap.ts`: Checks the status of an existing swap
3. **UI Components**:
   - `src/components/AtomicSwap.tsx`: React component for the atomic swap UI
   - `styles/atomic-swap.css`: Styling for the atomic swap component

## How It Works

1. **Swap Creation**:
   - User initiates a purchase for content
   - System generates a random preimage and its SHA-256 hash
   - A Lightning invoice is created with the preimage as the payment secret
   - Swap details are stored and a Nostr event is published

2. **Payment Process**:
   - User receives the Lightning invoice
   - User pays the invoice using any Lightning wallet
   - System polls for payment status

3. **Content Delivery**:
   - When payment is detected, the content is unlocked
   - Swap status is updated to 'paid'
   - A Nostr event is published with the updated status

## Integration

### Environment Variables

The following environment variables are required:

```
# Lightning Network Configuration
LND_CERT=base64_encoded_tls_cert
LND_MACAROON=base64_encoded_macaroon
LND_SOCKET=your-node:10009

# Nostr Configuration
NOSTR_PRIVATE_KEY=your_private_key_for_signing_events
NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
```

### Component Usage

```tsx
import { AtomicSwap } from '../src/components/AtomicSwap';

// In your React component
<AtomicSwap 
  contentId="unique-content-identifier"
  priceSats={1000}
  onPaymentComplete={(swapId) => {
    console.log(`Payment completed for swap ${swapId}`);
    // Handle content delivery
  }}
/>
```

## Security Considerations

1. **Preimage Security**: The preimage is generated using cryptographically secure random bytes.
2. **Payment Verification**: The system verifies payment by checking the invoice status directly with the Lightning node.
3. **Expiration Handling**: Invoices expire after 1 hour to prevent stale payment attempts.
4. **Error Handling**: Comprehensive error handling is implemented to prevent edge cases.

## Nostr Integration

The atomic swap feature integrates with Nostr using NIP-2312 (Commerce Events) to publish swap information and status updates. This enables:

1. **Decentralized Record-Keeping**: Swap records are stored on the Nostr network
2. **Verifiable Transactions**: All purchases can be verified by third parties
3. **Privacy-Preserving**: Only necessary information is published

## Demo

A demo page is available at `/atomic-swap-demo` that showcases the atomic swap functionality with a sample content purchase.

## Future Improvements

1. **Multi-vendor Support**: Enable multiple content creators to sell through the platform
2. **Subscription Model**: Implement recurring payments using Lightning
3. **Refund Mechanism**: Add capability for refunds in specific scenarios
4. **Mobile Integration**: Optimize for mobile wallets and QR code scanning
5. **Analytics Dashboard**: Create a dashboard for tracking sales and conversions