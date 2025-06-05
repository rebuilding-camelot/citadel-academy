import React, { useEffect, useState } from 'react';
import { WebMobileIntegration } from '../../lib/mobile-integration';
import '../styles/CourseProgressSync.css';

interface CourseProgressSyncProps {
  courseId: string;
  progress: number;
  onSyncComplete?: () => void;
}

export const CourseProgressSync: React.FC<CourseProgressSyncProps> = ({ 
  courseId, 
  progress, 
  onSyncComplete 
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [mobileIntegration, setMobileIntegration] = useState<WebMobileIntegration | null>(null);

  useEffect(() => {
    // Initialize mobile integration if Nostr client is available
    if (window.nostrClient && window.userKeys) {
      setMobileIntegration(new WebMobileIntegration(window.nostrClient, window.userKeys));
    }
  }, []);

  const syncProgressToMobile = async () => {
    if (!mobileIntegration) {
      setSyncStatus('error');
      return;
    }

    try {
      setSyncStatus('syncing');
      await mobileIntegration.syncProgressToMobile(courseId, progress);
      setSyncStatus('success');
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Error syncing progress to mobile:', error);
      setSyncStatus('error');
    }
  };

  const openInMobileApp = async () => {
    if (!mobileIntegration) {
      setSyncStatus('error');
      return;
    }

    try {
      await mobileIntegration.openCourseInMobile(courseId);
    } catch (error) {
      console.error('Error opening course in mobile app:', error);
    }
  };

  return (
    <div className="course-progress-sync">
      <div className="sync-status">
        {syncStatus === 'idle' && (
          <button onClick={syncProgressToMobile} className="sync-button">
            Sync Progress to Mobile
          </button>
        )}
        {syncStatus === 'syncing' && <span>Syncing progress...</span>}
        {syncStatus === 'success' && <span>Progress synced successfully!</span>}
        {syncStatus === 'error' && (
          <>
            <span>Failed to sync progress.</span>
            <button onClick={syncProgressToMobile} className="sync-button">
              Try Again
            </button>
          </>
        )}
      </div>
      <div className="mobile-actions">
        <button onClick={openInMobileApp} className="open-in-mobile-button">
          Continue on Mobile
        </button>
      </div>
    </div>
  );
};

export default CourseProgressSync;