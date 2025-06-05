// File: components/EnhancedStreamCreator.tsx
// Prompt: "Add screen sharing capabilities to Zap.stream integration for teachers"
// This is a wrapper around the ConsolidatedStreamCreator for backward compatibility

import React from 'react';
import { ConsolidatedStreamCreator } from './ConsolidatedStreamCreator';
import '../styles/EnhancedStreamCreator.css';
import '../styles/enhanced-stream.css';

interface ScreenShareStreamProps {
  courseId?: string;
  onStreamCreated: (streamData: any) => void;
  userPubkey: string;
  signWithKey: (unsignedEvent: any) => Promise<any>;
}

export const EnhancedStreamCreator: React.FC<ScreenShareStreamProps> = ({
  courseId,
  onStreamCreated,
  userPubkey,
  signWithKey
}) => {
  // This is a wrapper around the ConsolidatedStreamCreator for backward compatibility
  return (
    <ConsolidatedStreamCreator
      onStreamCreated={onStreamCreated}
      courseId={courseId}
      userPubkey={userPubkey}
      signWithKey={signWithKey}
      enableEnhancedFeatures={true}
      enableScreenShare={true}
    />
  );
};

// We don't need to redeclare the Window interface here as it's already defined in src/types/window.d.ts