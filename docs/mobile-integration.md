# Mobile Integration

This document explains how to use the WebMobileIntegration class to communicate between the Citadel Academy web application and the Dynastic mobile app.

## Overview

The WebMobileIntegration class provides methods to:

1. Sync course progress from web to mobile
2. Open specific courses in the mobile app

The integration uses two approaches:
- Deep linking (direct app opening)
- Nostr events (for background sync and fallback)

## Usage

### Setup

First, import the WebMobileIntegration class:

```typescript
import { WebMobileIntegration } from '../lib/mobile-integration';
```

Initialize the class with the Nostr client and user keys:

```typescript
// In a React component
const [mobileIntegration, setMobileIntegration] = useState<WebMobileIntegration | null>(null);

useEffect(() => {
  if (window.nostrClient && window.userKeys) {
    setMobileIntegration(new WebMobileIntegration(window.nostrClient, window.userKeys));
  }
}, []);
```

### Syncing Course Progress

To sync course progress to the mobile app:

```typescript
if (mobileIntegration) {
  try {
    await mobileIntegration.syncProgressToMobile('course-123', 75); // 75% progress
    console.log('Progress synced successfully');
  } catch (error) {
    console.error('Error syncing progress:', error);
  }
}
```

### Opening Courses in Mobile App

To open a specific course in the mobile app:

```typescript
if (mobileIntegration) {
  try {
    await mobileIntegration.openCourseInMobile('course-123');
    // This will attempt to open the app via deep link
    // If that fails, it will publish a Nostr event for the app to pick up
  } catch (error) {
    console.error('Error opening course in mobile app:', error);
  }
}
```

## Implementation Details

### Progress Sync

Progress sync uses NIP-78 application data events with kind 30078. The event includes:

- Course ID
- Progress percentage
- Timestamp
- Source identifier

### Deep Linking

The mobile app uses the `dynastic://` URL scheme for deep linking. The following formats are supported:

- `dynastic://open` - Open the app
- `dynastic://course/{courseId}` - Open a specific course

### Nostr Events

When deep linking fails or for background sync, the integration falls back to Nostr events:

- Kind 24133 (NIP-46 connection) for app communication
- Events include action tags and course identifiers
- The mobile app listens for these events on the user's relays

## Example Components

See the following components for implementation examples:

- `CourseProgressSync.tsx` - A reusable component for syncing progress
- `DynasticPromotion.tsx` - Mobile app promotion with integration
- `ContentPurchase.tsx` - Integration with the purchase flow

## Troubleshooting

If you encounter issues with the mobile integration:

1. Ensure the Nostr client is properly initialized
2. Check that user keys are available
3. Verify the mobile app is installed for deep linking to work
4. Check browser console for any errors during the integration process