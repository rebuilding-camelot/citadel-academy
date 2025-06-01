/**
 * Citadel Backup SDK
 * 
 * Unified SDK for backup management across web, Android, and iOS platforms.
 * Provides a simple interface for:
 * - Private relay connections
 * - Encrypted backups
 * - Automated backup scheduling
 * - Backup restoration
 */
import { CitadelRelayManager, RelayConfig } from './private-relay-manager';
import { EncryptedBackupManager, BackupTarget } from './encrypted-backup-manager';
import { StrfryBackupIntegration } from './strfry-backup-integration';

/**
 * Default configuration for the Citadel relay
 */
const DEFAULT_RELAY_CONFIG: RelayConfig = {
  relayUrl: 'wss://relay.citadel.academy',
  paymentRequired: true,
  entryFee: 10000,
  storageFee: 1000,
  authRequired: true
};

/**
 * Default backup targets
 */
const DEFAULT_BACKUP_TARGETS: BackupTarget[] = [
  {
    relayUrl: 'wss://strfry.citadel.academy',
    type: 'strfry',
    encrypted: true,
    priority: 1
  },
  {
    relayUrl: 'wss://backup.citadel.academy',
    type: 'lnbits',
    encrypted: true,
    priority: 2
  }
];

export class CitadelBackupSDK {
  private relayManager: CitadelRelayManager;
  private backupManager: EncryptedBackupManager;
  private strfryIntegration: StrfryBackupIntegration;

  /**
   * Create a new instance of the CitadelBackupSDK
   * 
   * @param userKeys - User's Nostr keys (public and private)
   * @param paymentClient - Client for processing Lightning payments
   * @param relayConfig - Optional custom relay configuration
   * @param backupTargets - Optional custom backup targets
   */
  constructor(
    userKeys: any, 
    paymentClient: any,
    relayConfig: RelayConfig = DEFAULT_RELAY_CONFIG,
    backupTargets: BackupTarget[] = DEFAULT_BACKUP_TARGETS
  ) {
    this.relayManager = new CitadelRelayManager(relayConfig, userKeys, paymentClient);
    this.backupManager = new EncryptedBackupManager(
      relayConfig.relayUrl,
      backupTargets,
      userKeys
    );
    this.strfryIntegration = new StrfryBackupIntegration(
      backupTargets[0].relayUrl,
      this.backupManager
    );
  }

  /**
   * Initialize the backup system
   * Sets up automated backups and verifies connectivity
   */
  async initialize(): Promise<void> {
    await this.strfryIntegration.setupStrfryBackup();
  }

  /**
   * Activate the private relay connection
   * Handles authentication and payment if required
   * 
   * @returns True if activation was successful, false otherwise
   */
  async activatePrivateRelay(): Promise<boolean> {
    const result = await this.relayManager.activatePrivateRelay();
    return result.success;
  }

  /**
   * Create an encrypted backup of user data
   * Collects data from primary relay and distributes to backup targets
   */
  async createBackup(): Promise<void> {
    await this.backupManager.createEncryptedBackup();
  }

  /**
   * Restore user data from a backup
   * 
   * @param backupId - ID of the backup to restore from
   */
  async restoreFromBackup(backupId: string): Promise<void> {
    await this.backupManager.restoreFromBackup(backupId);
  }

  /**
   * Clean up old backups
   * Removes backups older than the retention period (default: 90 days)
   * 
   * @param retentionDays - Optional number of days to retain backups
   */
  async cleanOldBackups(retentionDays?: number): Promise<void> {
    await this.backupManager.cleanOldBackups(retentionDays);
  }

  /**
   * Verify that the backup system is working correctly
   * 
   * @returns True if verification succeeds, false otherwise
   */
  async verifyBackupSystem(): Promise<boolean> {
    return await this.strfryIntegration.verifyStrfryBackup();
  }
}

// Export for use in all platforms
export { 
  CitadelRelayManager, 
  EncryptedBackupManager, 
  StrfryBackupIntegration
};

// Export types
export type { 
  RelayConfig,
  BackupTarget
};