// File: components/StreamViewerPage/index.tsx
// Example page component that uses the EnhancedStreamViewer

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Event } from 'nostr-tools';
import { EnhancedStreamViewer } from '../EnhancedStreamViewer';
import { StreamViewer } from '../StreamViewer';
import './StreamViewerPage.css';
import '../../styles/enhanced-stream.css';

interface StreamViewerPageProps {
  userPubkey?: string;
  isTeacher?: boolean;
}

const StreamViewerPage: React.FC<StreamViewerPageProps> = ({ 
  userPubkey,
  isTeacher = false
}) => {
  // For react-router-dom v5
  const { streamId } = useParams<{ streamId: string }>();
  const [streamEvent, setStreamEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useEnhanced, setUseEnhanced] = useState(true);

  useEffect(() => {
    const fetchStreamEvent = async () => {
      if (!streamId) {
        setError('Stream ID is required');
        setLoading(false);
        return;
      }

      try {
        // Fetch the stream event from the API
        const response = await fetch(`/api/stream/${streamId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stream');
        }

        const data = await response.json();
        setStreamEvent(data.event);
      } catch (err) {
        console.error('Error fetching stream:', err);
        setError('Failed to load stream. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStreamEvent();
  }, [streamId]);

  if (loading) {
    return <div className="loading">Loading stream...</div>;
  }

  if (error || !streamEvent) {
    return <div className="error">{error || 'Stream not found'}</div>;
  }

  // Check if the stream has screen sharing capability
  const hasScreenShare = streamEvent.tags.find(tag => tag[0] === 'has_screen_share')?.[1] === 'true';

  return (
    <div className="stream-viewer-page">
      <div className="viewer-toggle">
        <label>
          <input
            type="checkbox"
            checked={useEnhanced}
            onChange={(e) => setUseEnhanced(e.target.checked)}
          />
          Use Enhanced Viewer {hasScreenShare ? '(Recommended for this stream)' : ''}
        </label>
      </div>

      {useEnhanced ? (
        <EnhancedStreamViewer 
          streamEvent={streamEvent}
          userPubkey={userPubkey}
          isTeacher={isTeacher}
        />
      ) : (
        <StreamViewer
          streamEvent={streamEvent}
          userPubkey={userPubkey}
        />
      )}
    </div>
  );
};

export default StreamViewerPage;