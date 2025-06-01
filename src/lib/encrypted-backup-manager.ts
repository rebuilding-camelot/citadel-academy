/**
 * Encrypted Backup Manager
 * 
 * Provides encrypted backup functionality for Nostr data using:
 * - NIP-44 for encryption
 * - NIP-78 for application-specific data
 * - NIP-09 for deletion requests
 * - SafeBox structure for organizing backup data
 */
import { nip44 } from 'nostr-tools';
import { Event, finalizeEvent } from 'nostr-tools';
import { hexToBytes, generateSecureKey } from './crypto-utils';

export interface BackupTarget {
  relayUrl: string;
  type: 'strfry' | 'lnbits' | 'generic';
  encrypted: boolean;
  priority: number;
}

export interface SafeBoxItem {
  id: string;
  type: 'course_progress' | 'credentials' | 'family_data' | 'ai_training';
  data: any;
  encrypted: boolean;
  timestamp: number;
  tags: string[];
}

export class EncryptedBackupManager {
  private primaryRelay: string;
  private backupTargets: BackupTarget[];
  private encryptionKey: Uint8Array;
  private userKeys: any;

  constructor(
    primaryRelay: string, 
    backupTargets: BackupTarget[], 
    userKeys: any
  ) {
    this.primaryRelay = primaryRelay;
    this.backupTargets = backupTargets;
    this.userKeys = userKeys;
    this.encryptionKey = this.generateEncryptionKey();
  }

  // Create encrypted backup of all user data
  async createEncryptedBackup(): Promise<void> {
    try {
      // Step 1: Collect all user data from primary relay
      const userData = await this.collectUserData();
      
      // Step 2: Create SafeBox structure
      const safeBox = await this.createSafeBox(userData);
      
      // Step 3: Encrypt SafeBox
      const encryptedBackup = await this.encryptSafeBox(safeBox);
      
      // Step 4: Distribute to backup relays
      await this.distributeBackup(encryptedBackup);
      
      console.log('Encrypted backup created successfully');
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  private async collectUserData(): Promise<any[]> {
    const filters = [
      { kinds: [30078], authors: [this.userKeys.publicKey] }, // NIP-78 app data
      { kinds: [30009], '#p': [this.userKeys.publicKey] }, // NIP-58 badges
      { kinds: [1], authors: [this.userKeys.publicKey] }, // Notes
      { kinds: [30023], authors: [this.userKeys.publicKey] } // Long-form content
    ];
    const allEvents: Event[] = [];
    
    for (const filter of filters) {
      const events = await this.queryRelay(this.primaryRelay, filter);
      allEvents.push(...events);
    }
    return allEvents;
  }

  private async createSafeBox(userData: Event[]): Promise<SafeBoxItem[]> {
    const safeBoxItems: SafeBoxItem[] = [];
    for (const event of userData) {
      const item: SafeBoxItem = {
        id: event.id,
        type: this.categorizeEvent(event),
        data: event,
        encrypted: true,
        timestamp: event.created_at,
        tags: event.tags.map(tag => tag[0])
      };
      safeBoxItems.push(item);
    }
    return safeBoxItems;
  }

  private categorizeEvent(event: Event): SafeBoxItem['type'] {
    if (event.kind === 30078) {
      const dTag = event.tags.find(tag => tag[0] === 'd')?.[1];
      if (dTag?.includes('course-progress')) return 'course_progress';
      if (dTag?.includes('ai-training')) return 'ai_training';
      if (dTag?.includes('family')) return 'family_data';
    }
    if (event.kind === 30009) return 'credentials';
    return 'course_progress';
  }

  private async encryptSafeBox(safeBox: SafeBoxItem[]): Promise<string> {
    const safeBoxData = {
      version: '1.0',
      created: new Date().toISOString(),
      items: safeBox,
      metadata: {
        userPubkey: this.userKeys.publicKey,
        academy: 'citadel',
        itemCount: safeBox.length
      }
    };
    // Encrypt using NIP-44
    const jsonData = JSON.stringify(safeBoxData);
    const encryptedData = nip44.encrypt(jsonData, this.encryptionKey);
    
    return encryptedData;
  }

  private async distributeBackup(encryptedBackup: string): Promise<void> {
    const backupEvent: Event = {
      kind: 30078, // NIP-78 application data
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `backup-${Date.now()}`],
        ['type', 'encrypted_backup'],
        ['academy', 'citadel'],
        ['backup_version', '1.0'],
        ['encrypted', 'true']
      ],
      content: encryptedBackup,
      pubkey: this.userKeys.publicKey,
      id: '', // Will be set by finalizeEvent
      sig: '' // Will be set by finalizeEvent
    } as Event;
    
    // Use finalizeEvent to sign the event
    const privateKeyBytes = hexToBytes(this.userKeys.privateKey);
    const signedEvent = finalizeEvent(backupEvent, privateKeyBytes);
    
    // Distribute to all backup targets
    const promises = this.backupTargets.map(target => 
      this.publishToRelay(target.relayUrl, signedEvent)
    );
    await Promise.allSettled(promises);
  }

  // Restore from encrypted backup
  async restoreFromBackup(backupEventId: string): Promise<void> {
    try {
      // Find backup across all targets
      const backupEvent = await this.findBackupEvent(backupEventId);
      
      if (!backupEvent) {
        throw new Error('Backup not found');
      }
      // Decrypt backup
      const safeBoxData = await this.decryptBackup(backupEvent.content);
      
      // Restore events to primary relay
      await this.restoreEvents(safeBoxData.items);
      
      console.log(`Restored ${safeBoxData.items.length} items from backup`);
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  private async findBackupEvent(backupEventId: string): Promise<Event | null> {
    for (const target of this.backupTargets) {
      try {
        const filter = { ids: [backupEventId], kinds: [30078] };
        const events = await this.queryRelay(target.relayUrl, filter);
        
        if (events.length > 0) {
          return events[0];
        }
      } catch (error) {
        console.warn(`Failed to query ${target.relayUrl}:`, error);
      }
    }
    
    return null;
  }

  private async decryptBackup(encryptedContent: string): Promise<any> {
    const decryptedData = nip44.decrypt(encryptedContent, this.encryptionKey);
    return JSON.parse(decryptedData);
  }

  private async restoreEvents(items: SafeBoxItem[]): Promise<void> {
    for (const item of items) {
      try {
        await this.publishToRelay(this.primaryRelay, item.data);
      } catch (error) {
        console.warn(`Failed to restore event ${item.id}:`, error);
      }
    }
  }

  // Clean old backups using NIP-09
  async cleanOldBackups(retentionDays: number = 90): Promise<void> {
    const cutoffTime = Math.floor(Date.now() / 1000) - (retentionDays * 86400);
    
    // Find old backups
    const filter = {
      kinds: [30078],
      authors: [this.userKeys.publicKey],
      '#type': ['encrypted_backup'],
      until: cutoffTime
    };
    for (const target of this.backupTargets) {
      try {
        const oldBackups = await this.queryRelay(target.relayUrl, filter);
        
        for (const backup of oldBackups) {
          // Create NIP-09 deletion request
          const deletionEvent: Event = {
            kind: 5, // NIP-09 deletion
            created_at: Math.floor(Date.now() / 1000),
            tags: [
              ['e', backup.id],
              ['reason', 'Expired backup - retention policy']
            ],
            content: 'Automated cleanup of expired backup',
            pubkey: this.userKeys.publicKey,
            id: '', // Will be set by finalizeEvent
            sig: '' // Will be set by finalizeEvent
          } as Event;
          
          // Use finalizeEvent to sign the event
          const privateKeyBytes = hexToBytes(this.userKeys.privateKey);
          const signedDeletionEvent = finalizeEvent(deletionEvent, privateKeyBytes);
          
          await this.publishToRelay(target.relayUrl, signedDeletionEvent);
        }
      } catch (error) {
        console.warn(`Cleanup failed for ${target.relayUrl}:`, error);
      }
    }
  }

  private generateEncryptionKey(): Uint8Array {
    return generateSecureKey();
  }

  /**
   * Query events from a relay
   * @param relayUrl - URL of the relay to query
   * @param filter - Nostr filter to apply
   * @returns Array of events matching the filter
   * 
   * @note This is a placeholder implementation. In a real application,
   * this would use the application's Nostr client implementation.
   */
  private async queryRelay(relayUrl: string, filter: any): Promise<Event[]> {
    // Implementation depends on your Nostr client
    // This is a placeholder for the actual query logic
    return [];
  }

  /**
   * Publish an event to a relay
   * @param relayUrl - URL of the relay to publish to
   * @param event - Nostr event to publish
   * 
   * @note This is a placeholder implementation. In a real application,
   * this would use the application's Nostr client implementation.
   */
  private async publishToRelay(relayUrl: string, event: Event): Promise<void> {
    // Implementation depends on your Nostr client
    // This is a placeholder for the actual publish logic
  }
}

// Helper function moved to crypto-utils.ts