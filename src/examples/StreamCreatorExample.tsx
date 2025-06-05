// File: src/examples/StreamCreatorExample.tsx
// Example usage of the ConsolidatedStreamCreator component

import React, { useState } from 'react';
import { ConsolidatedStreamCreator } from '../components/ConsolidatedStreamCreator';

const StreamCreatorExample: React.FC = () => {
  const [streamData, setStreamData] = useState<any>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [enableScreenShare, setEnableScreenShare] = useState(false);

  const handleStreamCreated = (data: any) => {
    console.log('Stream created:', data);
    setStreamData(data);
    
    // In a real application, you would navigate to a stream view page
    // or start the streaming process
  };

  return (
    <div className="stream-creator-example">
      <h1>Citadel Academy Stream Creator</h1>
      
      <div className="feature-toggles">
        <label>
          <input
            type="checkbox"
            checked={showEnhanced}
            onChange={(e) => setShowEnhanced(e.target.checked)}
          />
          Enable Enhanced Features
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={enableScreenShare}
            onChange={(e) => setEnableScreenShare(e.target.checked)}
          />
          Enable Screen Sharing
        </label>
      </div>
      
      <div className="creator-container">
        <ConsolidatedStreamCreator
          onStreamCreated={handleStreamCreated}
          courseId="bitcoin-101"
          enableEnhancedFeatures={showEnhanced}
          enableScreenShare={enableScreenShare}
        />
      </div>
      
      {streamData && (
        <div className="stream-data">
          <h3>Stream Created Successfully!</h3>
          <pre>{JSON.stringify(streamData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default StreamCreatorExample;