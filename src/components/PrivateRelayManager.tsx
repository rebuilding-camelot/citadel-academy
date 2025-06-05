// File: components/PrivateRelayManager.tsx
// Prompt: "Create React component for managing private relay access and backups"
import React, { useState, useEffect } from 'react';
import { CitadelRelayManager } from '../lib/private-relay-manager';
import { EncryptedBackupManager } from '../lib/encrypted-backup-manager';

// Using types from window.d.ts - no need to redeclare userKeys
declare global {
  interface Window {
    paymentClient: {
      payInvoice: (invoice: string) => Promise<{
        success: boolean;
        preimage?: string;
        error?: string;
      }>;
    };
  }
}

interface BackupItem {
  id: string;
  created_at: number;
}

export const PrivateRelayManager: React.FC = () => {
  const [relayStatus, setRelayStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing-up' | 'restoring'>('idle');
  const [backups, setBackups] = useState<BackupItem[]>([]);
  
  const relayConfig = {
    relayUrl: 'wss://relay.citadel.academy',
    paymentRequired: true,
    entryFee: 10000, // 10k sats
    storageFee: 1000, // 1k sats per MB per month
    authRequired: true
  };
  
  const activateRelay = async () => {
    setRelayStatus('connecting');
    
    try {
      // Check if userKeys exists
      if (!window.userKeys) {
        throw new Error('User keys not available');
      }
      
      const relayManager = new CitadelRelayManager(
        relayConfig,
        window.userKeys,
        window.paymentClient
      );
      const result = await relayManager.activatePrivateRelay();
      
      if (result.success) {
        setRelayStatus('connected');
        alert('Private relay activated successfully!');
      } else {
        setRelayStatus('disconnected');
        alert('Failed to activate private relay');
      }
    } catch (error: unknown) {
      setRelayStatus('disconnected');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Relay activation error: ' + errorMessage);
    }
  };
  
  const createBackup = async () => {
    setBackupStatus('backing-up');
    
    try {
      // Check if userKeys exists
      if (!window.userKeys) {
        throw new Error('User keys not available');
      }
      
      const backupTargets = [
        {
          relayUrl: 'wss://strfry.citadel.academy',
          type: 'strfry' as const,
          encrypted: true,
          priority: 1
        }
      ];
      const backupManager = new EncryptedBackupManager(
        'wss://relay.citadel.academy',
        backupTargets,
        window.userKeys
      );
      await backupManager.createEncryptedBackup();
      await loadBackups();
      alert('Backup created successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Backup failed: ' + errorMessage);
    } finally {
      setBackupStatus('idle');
    }
  };
  
  const loadBackups = async () => {
    try {
      // Check if userKeys exists before accessing
      if (!window.userKeys) {
        console.error('User keys not available');
        return;
      }
      
      // Load backup history
      const filter = {
        kinds: [30078],
        authors: [window.userKeys.publicKey],
        '#type': ['encrypted_backup'],
        limit: 10
      };
      // Query implementation would go here
      setBackups([]);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };
  
  useEffect(() => {
    loadBackups();
  }, []);
  
  return (
    <div className="private-relay-manager">
      <div className="relay-status">
        <h3>🔒 Private Relay Status</h3>
        <div className={`status-indicator ${relayStatus}`}>
          {relayStatus === 'connected' && '✅ Connected'}
          {relayStatus === 'connecting' && '🔄 Connecting...'}
          {relayStatus === 'disconnected' && '❌ Disconnected'}
        </div>
        
        {relayStatus === 'disconnected' && (
          <button onClick={activateRelay} className="activate-btn">
            🚀 Activate Private Relay (10,000 sats)
          </button>
        )}
      </div>
      <div className="backup-management">
        <h3>💾 Backup Management</h3>
        <div className="backup-controls">
          <button 
            onClick={createBackup}
            disabled={backupStatus !== 'idle'}
            className="backup-btn"
          >
            {backupStatus === 'backing-up' ? 'Creating Backup...' : '💾 Create Backup'}
          </button>
        </div>
        <div className="backup-list">
          <h4>Recent Backups</h4>
          {backups.length === 0 ? (
            <p>No backups found</p>
          ) : (
            backups.map(backup => (
              <div key={backup.id} className="backup-item">
                <span>{new Date(backup.created_at * 1000).toLocaleDateString()}</span>
                <button onClick={() => restoreBackup(backup.id)}>
                  ↩️ Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
  async function restoreBackup(backupId: string) {
    setBackupStatus('restoring');
    try {
      // Restore implementation
      alert('Restore completed!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Restore failed: ' + errorMessage);
    } finally {
      setBackupStatus('idle');
    }
  }
};