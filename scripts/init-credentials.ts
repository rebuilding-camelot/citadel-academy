// File: scripts/init-credentials.ts
// Script to initialize secure credentials for development/testing

import { 
  initSecureCredentialManager, 
  storeSecureCredentials, 
  generateNostrCredentials 
} from '../src/lib/secure-credential-manager';

async function initializeCredentials() {
  try {
    console.log('Initializing secure credential manager...');
    
    // Initialize with a development password
    // In production, use a more secure approach
    await initSecureCredentialManager('development-password-change-in-production');
    
    // Generate and store Nostr admin credentials
    console.log('Generating Nostr admin credentials...');
    const nostrAdminCredentials = generateNostrCredentials();
    
    await storeSecureCredentials('nostr_admin', nostrAdminCredentials);
    
    console.log('Credentials initialized successfully');
    console.log('Nostr Admin Public Key:', nostrAdminCredentials.pubkey);
    console.log('NOTE: In production, use a proper key management system and never log sensitive information');
  } catch (error) {
    console.error('Failed to initialize credentials:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeCredentials();