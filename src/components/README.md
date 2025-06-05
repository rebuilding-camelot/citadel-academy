# Stream Creator Components

This directory contains various implementations of the Stream Creator component for Citadel Academy.

## Consolidated Stream Creator

The `ConsolidatedStreamCreator.tsx` is the recommended component to use for all new development. It combines the features of all previous implementations into a single, flexible component.

### Features

- Basic stream creation with title, description, and start time
- Enhanced features for educational content
- Screen sharing capabilities
- Picture-in-Picture mode for combining screen and camera
- Integration with Zap.stream API
- Nostr event creation and signing

### Usage

```tsx
import { ConsolidatedStreamCreator } from '../components/ConsolidatedStreamCreator';

// Basic usage
<ConsolidatedStreamCreator
  onStreamCreated={(streamData) => console.log('Stream created:', streamData)}
/>

// With enhanced features
<ConsolidatedStreamCreator
  onStreamCreated={(streamData) => console.log('Stream created:', streamData)}
  courseId="bitcoin-101"
  enableEnhancedFeatures={true}
/>

// With screen sharing
<ConsolidatedStreamCreator
  onStreamCreated={(streamData) => console.log('Stream created:', streamData)}
  courseId="bitcoin-101"
  enableEnhancedFeatures={true}
  enableScreenShare={true}
/>

// With custom signing function
<ConsolidatedStreamCreator
  onStreamCreated={(streamData) => console.log('Stream created:', streamData)}
  userPubkey="your-pubkey-here"
  signWithKey={async (unsignedEvent) => {
    // Your custom signing logic here
    return signedEvent;
  }}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onStreamCreated` | `(streamData: any) => void` | Callback function called when a stream is successfully created |
| `courseId` | `string` (optional) | ID of the course this stream belongs to |
| `userPubkey` | `string` (optional) | User's public key for Nostr events |
| `signWithKey` | `(unsignedEvent: UnsignedEvent) => Promise<Event>` (optional) | Function to sign Nostr events |
| `enableScreenShare` | `boolean` (optional) | Enable screen sharing features |
| `enableEnhancedFeatures` | `boolean` (optional) | Enable enhanced features like tags, educational content flag, etc. |

## Legacy Components

The following components are maintained for backward compatibility:

- `StreamCreator.tsx` - Basic stream creation component
- `EnhancedStreamCreator.tsx` - Stream creator with screen sharing capabilities

It is recommended to migrate to the `ConsolidatedStreamCreator` for all new development.