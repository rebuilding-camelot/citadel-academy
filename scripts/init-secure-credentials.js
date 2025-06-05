#!/usr/bin/env node
/**
 * Initialize secure credentials for the application
 * This script should be run once during setup to store credentials securely
 */

import { initSecureCredentialManager, storeSecureCredentials, generateNostrCredentials } from '../src/lib/secure-credential-manager.js';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for input with optional default value
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultPrompt = defaultValue ? ` (default: ${defaultValue})` : '';
    rl.question(`${question}${defaultPrompt}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Main function
async function main() {
  console.log('Initializing secure credential manager...');
  
  // Get master password for encryption
  const masterPassword = await prompt('Enter master password for credential encryption', '');
  if (!masterPassword) {
    console.error('Error: Master password is required');
    process.exit(1);
  }
  
  // Initialize the credential manager
  await initSecureCredentialManager(masterPassword);
  
  // Store LNbits credentials
  console.log('\n--- LNbits Credentials ---');
  const lnbitsAdminKey = await prompt('Enter LNbits admin key');
  const lnbitsInvoiceReadKey = await prompt('Enter LNbits invoice read key');
  
  if (lnbitsAdminKey && lnbitsInvoiceReadKey) {
    await storeSecureCredentials('lnbits_keys', {
      admin_key: lnbitsAdminKey,
      invoice_read_key: lnbitsInvoiceReadKey
    });
    console.log('LNbits credentials stored successfully');
  } else {
    console.warn('Warning: LNbits credentials not complete, skipping');
  }
  
  // Store Nostr admin credentials
  console.log('\n--- Nostr Admin Credentials ---');
  console.log('1. Enter existing keys');
  console.log('2. Generate new keys');
  const nostrOption = await prompt('Choose an option', '1');
  
  if (nostrOption === '1') {
    const pubkey = await prompt('Enter Nostr public key (hex)');
    const privkey = await prompt('Enter Nostr private key (hex)');
    
    if (pubkey && privkey) {
      await storeSecureCredentials('nostr_admin', { pubkey, privkey });
      console.log('Nostr admin credentials stored successfully');
    } else {
      console.warn('Warning: Nostr admin credentials not complete, skipping');
    }
  } else {
    console.log('Generating new Nostr credentials...');
    const credentials = generateNostrCredentials();
    await storeSecureCredentials('nostr_admin', credentials);
    console.log('New Nostr admin credentials generated and stored:');
    console.log(`Public key: ${credentials.pubkey}`);
    console.log(`Private key: ${credentials.privkey}`);
    console.log('IMPORTANT: Save these keys in a secure location!');
  }
  
  // Store Academy Nostr credentials (for zaps)
  console.log('\n--- Academy Nostr Credentials (for zaps) ---');
  console.log('1. Enter existing keys');
  console.log('2. Generate new keys');
  const academyOption = await prompt('Choose an option', '1');
  
  if (academyOption === '1') {
    const pubkey = await prompt('Enter Academy public key (hex)');
    const privkey = await prompt('Enter Academy private key (hex)');
    
    if (pubkey && privkey) {
      await storeSecureCredentials('academy_nostr', { pubkey, privkey });
      console.log('Academy Nostr credentials stored successfully');
    } else {
      console.warn('Warning: Academy Nostr credentials not complete, skipping');
    }
  } else {
    console.log('Generating new Academy Nostr credentials...');
    const credentials = generateNostrCredentials();
    await storeSecureCredentials('academy_nostr', credentials);
    console.log('New Academy Nostr credentials generated and stored:');
    console.log(`Public key: ${credentials.pubkey}`);
    console.log(`Private key: ${credentials.privkey}`);
    console.log('IMPORTANT: Save these keys in a secure location!');
  }
  
  console.log('\nAll credentials have been stored securely.');
  console.log('For production use, consider using a dedicated secrets management service.');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error initializing credentials:', error);
  process.exit(1);
});