# Security Documentation

## Secure Credential Management

This application uses a secure credential management system to protect sensitive information such as API keys, private keys, and other credentials. This approach is more secure than storing credentials in environment variables or configuration files.

### How It Works

1. Credentials are encrypted using AES-256-GCM with a key derived from a master password
2. The encrypted credentials are stored in a secure location on the server
3. The application decrypts credentials only when needed, keeping them in memory for the minimum time necessary
4. For production, it's recommended to use a dedicated secrets management service like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault

### Setting Up Credentials

To initialize the secure credential system, run the setup script:

```bash
node scripts/init-secure-credentials.js
```

This script will:
1. Prompt for a master password to encrypt all credentials
2. Guide you through setting up credentials for:
   - LNbits (for Lightning payments)
   - Nostr admin (for storing booking records)
   - Academy Nostr (for zap receipts)
3. Store the encrypted credentials in the configured location

### Required Credentials

#### LNbits Credentials
- `admin_key`: Used to create invoices
- `invoice_read_key`: Used to check payment status

#### Nostr Admin Credentials
- `pubkey`: Public key for Nostr events
- `privkey`: Private key for signing Nostr events

#### Academy Nostr Credentials
- `pubkey`: Public key for zap receipts
- `privkey`: Private key for signing zap receipts

### Production Recommendations

For production environments:

1. Use a dedicated secrets management service
2. Store the master password in a secure location, separate from the application
3. Rotate credentials regularly
4. Use hardware security modules (HSMs) for storing private keys when possible
5. Implement proper access controls for the credential store
6. Monitor and audit credential access

### Implementation Details

The secure credential management system is implemented in `src/lib/secure-credential-manager.ts` and provides the following functions:

- `initSecureCredentialManager`: Initialize the credential manager with a master password
- `storeSecureCredentials`: Store credentials securely
- `getSecureCredentials`: Retrieve credentials securely
- `generateNostrCredentials`: Generate new Nostr credentials
- `deleteSecureCredentials`: Delete stored credentials

### Security Considerations

- The master password should be strong and kept secure
- In production, the master password should not be stored in environment variables
- The credential store location should be properly secured with appropriate file permissions
- For high-security environments, consider using a dedicated secrets management service