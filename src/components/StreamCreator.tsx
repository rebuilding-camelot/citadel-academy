// File: src/components/StreamCreator.tsx
// Prompt: "Create stream creation interface for Citadel Academy instructors"
// This is a wrapper around the ConsolidatedStreamCreator for backward compatibility

import React from 'react';
import { ConsolidatedStreamCreator } from './ConsolidatedStreamCreator';

interface StreamCreatorProps {
  courseId?: string;
  onStreamCreated: (streamData: any) => void;
  userPubkey?: string;
  userPrivkey?: string;
  signWithKey?: (unsignedEvent: any) => Promise<any>;
}

export const StreamCreator: React.FC<StreamCreatorProps> = ({
  courseId,
  onStreamCreated,
  userPubkey,
  userPrivkey,
  signWithKey
}) => {
  // This is a wrapper around the ConsolidatedStreamCreator for backward compatibility
  return (
    <ConsolidatedStreamCreator
      onStreamCreated={onStreamCreated}
      courseId={courseId}
      userPubkey={userPubkey}
      userPrivkey={userPrivkey}
      signWithKey={signWithKey}
      enableEnhancedFeatures={false}
      enableScreenShare={false}
    />
  );
};