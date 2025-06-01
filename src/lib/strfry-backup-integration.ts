/**
 * Strfry Backup Integration
 * 
 * Integrates with Strfry relay for reliable backup storage with features:
 * - Automated backup scheduling
 * - Backup verification
 * - Cleanup of old backups
 */
import { EncryptedBackupManager } from './encrypted-backup-manager';
import { Event } from 'nostr-tools';

export class StrfryBackupIntegration {
  private strfryUrl: string;
  private backupManager: EncryptedBackupManager;
  
  constructor(strfryUrl: string, backupManager: EncryptedBackupManager) {
    this.strfryUrl = strfryUrl;
    this.backupManager = backupManager;
  }
  
  /**
   * Set up Strfry backup system and schedule automated backups
   */
  async setupStrfryBackup(): Promise<void> {
    // Schedule automated backups
    this.scheduleBackups();
  }
  
  /**
   * Schedule automated backups and cleanup
   * - Daily backups
   * - Weekly cleanup of backups older than 90 days
   */
  private scheduleBackups(): void {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const ONE_WEEK_MS = 7 * ONE_DAY_MS;
    
    // Daily backups
    setInterval(async () => {
      try {
        await this.backupManager.createEncryptedBackup();
        console.log('Scheduled backup completed');
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, ONE_DAY_MS);
    
    // Weekly cleanup
    setInterval(async () => {
      try {
        await this.backupManager.cleanOldBackups(90);
        console.log('Backup cleanup completed');
      } catch (error) {
        console.error('Backup cleanup failed:', error);
      }
    }, ONE_WEEK_MS);
  }
  
  /**
   * Verify that backups are properly stored on the Strfry relay
   * @returns True if verification succeeds, false otherwise
   */
  async verifyStrfryBackup(): Promise<boolean> {
    try {
      // Test backup creation and retrieval
      await this.backupManager.createEncryptedBackup();
      
      // Verify backup exists on Strfry
      const filter = {
        kinds: [30078],
        '#type': ['encrypted_backup'],
        limit: 1
      };
      const events = await this.queryStrfry(filter);
      return events.length > 0;
    } catch (error) {
      console.error('Strfry backup verification failed:', error);
      return false;
    }
  }
  
  /**
   * Query events from the Strfry relay
   * @param filter - Nostr filter to apply
   * @returns Array of events matching the filter
   */
  private async queryStrfry(filter: any): Promise<Event[]> {
    // Strfry-specific query implementation
    const ws = new WebSocket(this.strfryUrl);
    const SUBSCRIPTION_ID = 'backup-verify';
    
    return new Promise((resolve, reject) => {
      const events: Event[] = [];
      const TIMEOUT_MS = 10000;
      
      // Set timeout for the query
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Query timeout'));
      }, TIMEOUT_MS);
      
      ws.onopen = () => {
        ws.send(JSON.stringify(['REQ', SUBSCRIPTION_ID, filter]));
      };
      
      ws.onmessage = (event) => {
        const [type, subscriptionId, eventData] = JSON.parse(event.data);
        
        if (type === 'EVENT' && subscriptionId === SUBSCRIPTION_ID) {
          events.push(eventData);
        } else if (type === 'EOSE' && subscriptionId === SUBSCRIPTION_ID) {
          clearTimeout(timeout);
          ws.close();
          resolve(events);
        }
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      
      ws.onclose = () => {
        clearTimeout(timeout);
        resolve(events); // Resolve with any events we got before closing
      };
    });
  }
}