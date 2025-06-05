# Secure Credential Management

This module provides a secure way to manage sensitive credentials used in the application, particularly for Nostr event signing and other cryptographic operations.

## Overview

The secure credential manager implements:

1. Encryption of sensitive credentials using AES-256-GCM
2. Secure storage of encrypted credentials
3. Key derivation using PBKDF2
4. Helper functions for generating and managing Nostr credentials

## Security Considerations

**IMPORTANT**: The current implementation is suitable for development but requires additional security measures for production use:

- In production, use a dedicated secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager)
- Never store the master password in environment variables in production
- Consider using a Hardware Security Module (HSM) for key operations
- Implement proper key rotation policies
- Add audit logging for all credential access

## Usage

### Initializing the Credential Manager

```typescript
import { initSecureCredentialManager } from '../lib/secure-credential-manager';

// Initialize with a master password
await initSecureCredentialManager('your-secure-master-password');
```

### Storing Credentials

```typescript
import { storeSecureCredentials } from '../lib/secure-credential-manager';

await storeSecureCredentials('credential_id', {
  pubkey: 'public-key-hex',
  privkey: 'private-key-hex'
});
```

### Retrieving Credentials

```typescript
import { getSecureCredentials } from '../lib/secure-credential-manager';

const credentials = await getSecureCredentials('credential_id');
if (credentials) {
  // Use credentials.pubkey and credentials.privkey
}
```

### Generating Nostr Credentials

```typescript
import { generateNostrCredentials } from '../lib/secure-credential-manager';

const newCredentials = generateNostrCredentials();
```

## Setup for Development

Run the initialization script to set up development credentials:

```bash
# Compile TypeScript
npx tsc scripts/init-credentials.ts

# Run the script
node scripts/init-credentials.js
```

## Production Deployment

Before deploying to production:

1. Replace the credential storage mechanism with a proper secrets management service
2. Implement secure key rotation
3. Add comprehensive audit logging
4. Consider using a dedicated HSM for cryptographic operations
5. Remove any development credentials and passwords