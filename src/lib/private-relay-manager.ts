/**
 * Private Relay Manager
 * 
 * Manages connections to private Nostr relays with support for:
 * - Authentication (NIP-42)
 * - Payment processing
 * - Connection management
 * - HTTP Auth (NIP-98)
 */
import { Event, getEventHash, finalizeEvent } from 'nostr-tools';
import { hexToBytes } from './crypto-utils';

export interface RelayConfig {
  relayUrl: string;
  paymentRequired: boolean;
  entryFee: number;
  storageFee: number;
  authRequired: boolean;
}

export interface RelayActivationResult {
  success: boolean;
  relayUrl: string;
  error?: string;
  expiresAt?: number;
  storageAllocation?: number;
}

export class CitadelRelayManager {
  private relayConfig: RelayConfig;
  private userKeys: any;
  private paymentClient: any;
  private connected: boolean = false;
  private expiresAt: number = 0;

  constructor(
    relayConfig: RelayConfig,
    userKeys: any,
    paymentClient: any
  ) {
    this.relayConfig = relayConfig;
    this.userKeys = userKeys;
    this.paymentClient = paymentClient;
  }

  /**
   * Activates a private relay connection with payment if required
   */
  async activatePrivateRelay(): Promise<RelayActivationResult> {
    try {
      // Step 1: Check if payment is required
      if (this.relayConfig.paymentRequired) {
        const paymentResult = await this.processRelayPayment();
        if (!paymentResult.success) {
          return {
            success: false,
            relayUrl: this.relayConfig.relayUrl,
            error: paymentResult.error
          };
        }
      }

      // Step 2: Authenticate with relay
      const authResult = await this.authenticateWithRelay();
      if (!authResult.success) {
        return {
          success: false,
          relayUrl: this.relayConfig.relayUrl,
          error: authResult.error
        };
      }

      // Step 3: Establish connection
      const connectionResult = await this.establishConnection();
      
      this.connected = connectionResult.success;
      if (connectionResult.expiresAt) {
        this.expiresAt = connectionResult.expiresAt;
      }

      return connectionResult;
    } catch (error: unknown) {
      console.error('Relay activation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during relay activation';
      return {
        success: false,
        relayUrl: this.relayConfig.relayUrl,
        error: errorMessage
      };
    }
  }

  /**
   * Process payment for relay access
   */
  private async processRelayPayment(): Promise<{success: boolean, error?: string}> {
    try {
      // Request invoice from relay
      const invoice = await this.requestRelayInvoice();
      
      // Process payment using payment client
      const paymentResult = await this.paymentClient.payInvoice(invoice);
      
      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Payment failed'
        };
      }
      
      // Verify payment with relay
      const verificationResult = await this.verifyPaymentWithRelay(paymentResult.preimage);
      
      return {
        success: verificationResult,
        error: verificationResult ? undefined : 'Payment verification failed'
      };
    } catch (error: unknown) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Request an invoice from the relay
   */
  private async requestRelayInvoice(): Promise<string> {
    // Create a NIP-98 HTTP Auth event
    const authEvent = this.createAuthEvent('GET', '/api/invoice');
    
    // Make authenticated request to relay
    const response = await fetch(`${this.relayConfig.relayUrl.replace('wss://', 'https://')}/api/invoice`, {
      method: 'GET',
      headers: {
        'Authorization': `Nostr ${authEvent.id}:${authEvent.sig}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get invoice: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.invoice;
  }

  /**
   * Verify payment with relay
   */
  private async verifyPaymentWithRelay(preimage: string): Promise<boolean> {
    // Create a NIP-98 HTTP Auth event
    const authEvent = this.createAuthEvent('POST', '/api/verify-payment');
    
    // Make authenticated request to relay
    const response = await fetch(`${this.relayConfig.relayUrl.replace('wss://', 'https://')}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Nostr ${authEvent.id}:${authEvent.sig}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        preimage: preimage
      })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.verified === true;
  }

  /**
   * Authenticate with relay using NIP-42
   */
  private async authenticateWithRelay(): Promise<{success: boolean, error?: string}> {
    if (!this.relayConfig.authRequired) {
      return { success: true };
    }
    
    try {
      // Connect to relay
      const ws = new WebSocket(this.relayConfig.relayUrl);
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = (error) => reject(error);
        
        // Set timeout
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      
      // Request auth challenge
      ws.send(JSON.stringify(['AUTH', this.userKeys.publicKey]));
      
      // Wait for challenge
      const challenge = await new Promise<string>((resolve, reject) => {
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data[0] === 'AUTH_CHALLENGE') {
            resolve(data[1]);
          }
        };
        
        // Set timeout
        setTimeout(() => reject(new Error('Auth challenge timeout')), 5000);
      });
      
      // Create auth event
      const authEvent = this.createAuthEvent(challenge);
      
      // Send auth event
      ws.send(JSON.stringify(['AUTH', authEvent]));
      
      // Wait for auth result
      const authResult = await new Promise<boolean>((resolve, reject) => {
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data[0] === 'AUTH_RESPONSE') {
            resolve(data[1] === true);
          }
        };
        
        // Set timeout
        setTimeout(() => reject(new Error('Auth response timeout')), 5000);
      });
      
      // Close connection
      ws.close();
      
      return {
        success: authResult,
        error: authResult ? undefined : 'Authentication failed'
      };
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Establish connection with relay
   */
  private async establishConnection(): Promise<RelayActivationResult> {
    try {
      // Connect to relay
      const ws = new WebSocket(this.relayConfig.relayUrl);
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = (error) => reject(error);
        
        // Set timeout
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      
      // Request relay information
      ws.send(JSON.stringify(['REQ', 'info', { kinds: [0], authors: [this.relayConfig.relayUrl.split('://')[1].split('/')[0]] }]));
      
      // Wait for relay information
      const relayInfo = await new Promise<any>((resolve, reject) => {
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data[0] === 'EVENT' && data[1] === 'info') {
            try {
              const content = JSON.parse(data[2].content);
              resolve(content);
            } catch (e) {
              resolve({});
            }
          } else if (data[0] === 'EOSE' && data[1] === 'info') {
            resolve({});
          }
        };
        
        // Set timeout
        setTimeout(() => reject(new Error('Relay info timeout')), 5000);
      });
      
      // Close connection
      ws.close();
      
      // Calculate expiration time (default: 30 days)
      const expiresAt = Math.floor(Date.now() / 1000) + (relayInfo.subscription_expiry || 30 * 86400);
      
      return {
        success: true,
        relayUrl: this.relayConfig.relayUrl,
        expiresAt: expiresAt,
        storageAllocation: relayInfo.storage_allocation || 100 * 1024 * 1024 // Default: 100MB
      };
    } catch (error: unknown) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      return {
        success: false,
        relayUrl: this.relayConfig.relayUrl,
        error: errorMessage
      };
    }
  }

  /**
   * Create an authentication event (NIP-98 or NIP-42)
   */
  private createAuthEvent(challengeOrMethod: string, url?: string): Event {
    let event: Event;
    
    if (url) {
      // NIP-98 HTTP Auth
      event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['u', url],
          ['method', challengeOrMethod]
        ],
        content: '',
        pubkey: this.userKeys.publicKey,
        id: '',
        sig: ''
      } as Event;
    } else {
      // NIP-42 WebSocket Auth
      event = {
        kind: 22242,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['relay', this.relayConfig.relayUrl],
          ['challenge', challengeOrMethod]
        ],
        content: '',
        pubkey: this.userKeys.publicKey,
        id: '',
        sig: ''
      } as Event;
    }
    
    // Calculate event ID
    event.id = getEventHash(event);
    
    // Sign event
    const privateKeyBytes = hexToBytes(this.userKeys.privateKey);
    const signedEvent = finalizeEvent(event, privateKeyBytes);
    
    return signedEvent;
  }

  /**
   * Check if relay connection is active
   */
  isConnected(): boolean {
    return this.connected && this.expiresAt > Math.floor(Date.now() / 1000);
  }

  /**
   * Get relay expiration time
   */
  getExpirationTime(): number {
    return this.expiresAt;
  }

  /**
   * Disconnect from relay
   */
  disconnect(): void {
    this.connected = false;
  }
}

// Helper function moved to crypto-utils.ts