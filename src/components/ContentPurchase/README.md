# Content Purchase Component

This directory contains the `ContentPurchase` component which enables Lightning Network payments for digital content through atomic swaps.

## ContentPurchase Component

The `ContentPurchase` component provides a user interface for purchasing digital content using Lightning Network payments through atomic swaps.

### Usage

```tsx
import { ContentPurchase } from '../components/ContentPurchase';

// In your React component
<ContentPurchase 
  contentId="unique-content-id" 
  priceSats={10000} 
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `contentId` | string | Unique identifier for the content being purchased |
| `priceSats` | number | Price in satoshis (Bitcoin's smallest unit) |

### Features

- Creates a Lightning Network invoice for the specified content
- Displays the invoice for the user to pay
- Provides a copy button for easy invoice copying
- Automatically polls for payment status
- Shows appropriate UI for different payment states (pending, paid, expired, error)

### Payment Flow

1. User clicks "Purchase" button
2. Component creates an atomic swap via the `/api/create-swap` endpoint
3. Lightning invoice is displayed to the user
4. Component polls the `/api/check-swap` endpoint to check payment status
5. When payment is detected, UI updates to show success message

### Styling

The component uses CSS styles defined in `src/styles/ContentPurchase.css`. You can customize the appearance by modifying this file.

### Dependencies

- React
- Fetch API for making HTTP requests
- Lightning Network backend (via API endpoints)

## Example

See `pages/index.tsx` for a complete example of how to use the ContentPurchase component in a page.