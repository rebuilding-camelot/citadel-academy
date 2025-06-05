// File: scripts/setup-credentials.js
// Script to set up secure credentials for development

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Default secure storage location
const CREDENTIAL_STORE_PATH = path.join(process.cwd(), 'secure-credentials');

// Create storage directory if it doesn't exist
if (!fs.existsSync(CREDENTIAL_STORE_PATH)) {
  fs.mkdirSync(CREDENTIAL_STORE_PATH, { recursive: true });
  console.log(`Created credential store directory: ${CREDENTIAL_STORE_PATH}`);
}

// Generate a development master password
const masterPassword = 'development-password-change-in-production';

// Generate a fixed salt for key derivation
const salt = crypto.createHash('sha256').update('citadel-academy-salt').digest('hex');

// Derive encryption key using PBKDF2
const encryptionKey = crypto.pbkdf2Sync(
  masterPassword,
  Buffer.from(salt, 'hex'),
  10000, // iterations
  32, // key length
  'sha256'
);

// Generate Nostr credentials
function generateNostrCredentials() {
  // In a real implementation, use a more secure random generator
  const privkey = crypto.randomBytes(32).toString('hex');
  
  // In production, derive pubkey properly from privkey using secp256k1
  // This is a simplified placeholder
  const pubkey = crypto.createHash('sha256').update(privkey).digest('hex');
  
  return { pubkey, privkey };
}

// Store credentials securely
function storeSecureCredentials(id, credentials) {
  // Generate random IV for encryption
  const iv = crypto.randomBytes(16);
  
  // Encrypt the credentials
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(credentials), 'utf8'),
    cipher.final()
  ]);
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  // Prepare storage object
  const storage = {
    salt,
    iv: iv.toString('hex'),
    data: Buffer.concat([encrypted, authTag]).toString('hex')
  };
  
  // Write to file
  const filePath = path.join(CREDENTIAL_STORE_PATH, `${id}.enc`);
  fs.writeFileSync(filePath, JSON.stringify(storage));
  
  return credentials;
}

// Generate and store Nostr admin credentials
console.log('Generating Nostr admin credentials...');
const nostrAdminCredentials = generateNostrCredentials();
storeSecureCredentials('nostr_admin', nostrAdminCredentials);

console.log('Credentials initialized successfully');
console.log('Nostr Admin Public Key:', nostrAdminCredentials.pubkey);
console.log('NOTE: In production, use a proper key management system and never log sensitive information');