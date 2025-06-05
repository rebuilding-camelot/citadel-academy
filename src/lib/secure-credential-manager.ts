// File: lib/secure-credential-manager.ts
// Secure credential management for Nostr and other sensitive operations

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Interface for credential types
export interface Credentials {
  pubkey: string;
  privkey: string;
  [key: string]: string;
}

// Interface for encrypted credential storage
interface EncryptedStorage {
  salt: string;
  iv: string;
  data: string;
}

// Default secure storage location - in production, use a more secure location
// and potentially integrate with a dedicated secrets management service
const CREDENTIAL_STORE_PATH = process.env.CREDENTIAL_STORE_PATH || 
  path.join(process.cwd(), 'secure-credentials');

// Encryption key derived from master password or environment
let encryptionKey: Buffer | null = null;

/**
 * Initialize the secure credential manager
 * In production, this should use a hardware security module or secure vault service
 */
export async function initSecureCredentialManager(masterPassword?: string): Promise<void> {
  // In production, use a more secure approach than environment variables
  const password = masterPassword || process.env.CREDENTIAL_MASTER_PASSWORD;
  
  if (!password) {
    throw new Error('Master password for credential encryption not provided');
  }
  
  // Create storage directory if it doesn't exist
  if (!fs.existsSync(CREDENTIAL_STORE_PATH)) {
    fs.mkdirSync(CREDENTIAL_STORE_PATH, { recursive: true });
  }
  
  // Generate a fixed salt for key derivation
  // In production, store this salt securely and separately
  const salt = process.env.CREDENTIAL_SALT || 
    crypto.createHash('sha256').update('citadel-academy-salt').digest('hex');
  
  // Derive encryption key using PBKDF2
  encryptionKey = crypto.pbkdf2Sync(
    password,
    Buffer.from(salt, 'hex'),
    10000, // iterations
    32, // key length
    'sha256'
  );
}

/**
 * Store credentials securely
 * @param id Unique identifier for the credential set
 * @param credentials Object containing credentials to store
 */
export async function storeSecureCredentials(
  id: string, 
  credentials: Credentials
): Promise<void> {
  if (!encryptionKey) {
    await initSecureCredentialManager();
  }
  
  // Generate random IV for encryption
  const iv = crypto.randomBytes(16);
  
  // Encrypt the credentials
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey!, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(credentials), 'utf8'),
    cipher.final()
  ]);
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  // Prepare storage object
  const storage: EncryptedStorage = {
    salt: crypto.createHash('sha256').update('citadel-academy-salt').digest('hex'),
    iv: iv.toString('hex'),
    data: Buffer.concat([encrypted, authTag]).toString('hex')
  };
  
  // Write to file
  const filePath = path.join(CREDENTIAL_STORE_PATH, `${id}.enc`);
  fs.writeFileSync(filePath, JSON.stringify(storage));
}

/**
 * Retrieve credentials securely
 * @param id Unique identifier for the credential set
 * @returns Decrypted credentials or null if not found
 */
export async function getSecureCredentials(id: string): Promise<Credentials | null> {
  if (!encryptionKey) {
    await initSecureCredentialManager();
  }
  
  const filePath = path.join(CREDENTIAL_STORE_PATH, `${id}.enc`);
  
  // Check if credentials exist
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    // Read and parse storage
    const storage: EncryptedStorage = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Prepare for decryption
    const iv = Buffer.from(storage.iv, 'hex');
    const data = Buffer.from(storage.data, 'hex');
    
    // Split data into ciphertext and auth tag
    const ciphertext = data.subarray(0, data.length - 16);
    const authTag = data.subarray(data.length - 16);
    
    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey!, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.error('Failed to decrypt credentials:', error);
    return null;
  }
}

/**
 * Generate new Nostr credentials
 * @returns Generated credentials with public and private keys
 */
export function generateNostrCredentials(): Credentials {
  // In a real implementation, use a more secure random generator
  const privkey = crypto.randomBytes(32).toString('hex');
  
  // In production, derive pubkey properly from privkey using secp256k1
  // This is a simplified placeholder
  const pubkey = crypto.createHash('sha256').update(privkey).digest('hex');
  
  return { pubkey, privkey };
}

/**
 * Delete stored credentials
 * @param id Unique identifier for the credential set
 */
export async function deleteSecureCredentials(id: string): Promise<boolean> {
  const filePath = path.join(CREDENTIAL_STORE_PATH, `${id}.enc`);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  
  return false;
}