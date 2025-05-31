import { useState, useEffect, useCallback } from 'react';
import { SimplePool } from 'nostr-tools/pool';
import { getEventHash, getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import { generateSecretKey } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';

// Get relays from environment variables or use defaults
const NWC_RELAYS = import.meta.env.VITE_NWC_RELAYS 
  ? import.meta.env.VITE_NWC_RELAYS.split(',') 
  : ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'];

export const useNostrWalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const [walletPubkey, setWalletPubkey] = useState('');
  const [balance, setBalance] = useState(0);
  const [ndk, setNdk] = useState(null);
  const [clientPrivateKey, setClientPrivateKey] = useState('');

  useEffect(() => {
    // Initialize NDK
    const ndkInstance = new NDK({
      explicitRelayUrls: NWC_RELAYS
    });
    
    ndkInstance.connect();
    setNdk(ndkInstance);
    // Check for existing connection
    const savedConnection = localStorage.getItem('nwc_connection');
    if (savedConnection) {
      const parsed = JSON.parse(savedConnection);
      setConnectionString(parsed.connectionString);
      setWalletPubkey(parsed.walletPubkey);
      setClientPrivateKey(parsed.clientPrivateKey);
      setConnected(true);
    }
  }, []);

  const parseConnectionString = (connectionStr) => {
    try {
      const url = new URL(connectionStr);
      const pubkey = url.hostname || url.pathname.split('//')[1];
      const relay = url.searchParams.get('relay');
      const secret = url.searchParams.get('secret');
      
      return { pubkey, relay, secret };
    } catch (error) {
      console.error('Invalid connection string:', error);
      return null;
    }
  };

  const connect = useCallback(async (connectionStr) => {
    const parsed = parseConnectionString(connectionStr);
    if (!parsed) return false;
    try {
      // Generate client keypair
      const clientPrivKey = generateSecretKey();
      const clientPubkey = getPublicKey(clientPrivKey);
      // Store connection details
      const connectionData = {
        connectionString: connectionStr,
        walletPubkey: parsed.pubkey,
        clientPrivateKey: clientPrivKey,
        relay: parsed.relay
      };
      localStorage.setItem('nwc_connection', JSON.stringify(connectionData));
      
      setConnectionString(connectionStr);
      setWalletPubkey(parsed.pubkey);
      setClientPrivateKey(clientPrivKey);
      setConnected(true);
      // Test connection with get_info request
      await getWalletInfo();
      
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('nwc_connection');
    setConnected(false);
    setConnectionString('');
    setWalletPubkey('');
    setClientPrivateKey('');
    setBalance(0);
  }, []);

  const sendNWCRequest = async (method, params = {}) => {
    if (!connected || !ndk || !clientPrivateKey) {
      throw new Error('Not connected to wallet');
    }
    const request = {
      method,
      params
    };
    // Create event object without id and signature
    const eventTemplate = {
      kind: 23194, // NWC request kind
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', walletPubkey]],
      content: JSON.stringify(request),
      pubkey: getPublicKey(clientPrivateKey)
    };
    
    // Use finalizeEvent to add id and signature
    const event = finalizeEvent(eventTemplate, clientPrivateKey);
    // Publish event and wait for response
    const pool = new SimplePool();
    const relays = NWC_RELAYS.slice(0, 2); // Use first two relays from the list
    
    return new Promise((resolve, reject) => {
      // Listen for response
      const sub = pool.sub(relays, [{
        kinds: [23195], // NWC response kind
        authors: [walletPubkey],
        '#e': [event.id],
        since: Math.floor(Date.now() / 1000)
      }]);
      sub.on('event', (responseEvent) => {
        try {
          const response = JSON.parse(responseEvent.content);
          sub.unsub();
          pool.close(relays);
          
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        } catch (error) {
          reject(error);
        }
      });
      // Publish request
      pool.publish(relays, event);
      // Timeout after 30 seconds
      setTimeout(() => {
        sub.unsub();
        pool.close(relays);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  };

  const getWalletInfo = async () => {
    try {
      const result = await sendNWCRequest('get_info');
      setBalance(result.balance || 0);
      return result;
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      throw error;
    }
  };

  const payInvoice = async (invoice) => {
    try {
      const result = await sendNWCRequest('pay_invoice', { invoice });
      await getWalletInfo(); // Refresh balance
      return result;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  const makeInvoice = async (amount, description = '') => {
    try {
      const result = await sendNWCRequest('make_invoice', {
        amount: amount * 1000, // Convert to msats
        description
      });
      return result;
    } catch (error) {
      console.error('Invoice creation failed:', error);
      throw error;
    }
  };

  return {
    connected,
    walletPubkey,
    balance,
    connect,
    disconnect,
    payInvoice,
    makeInvoice,
    getWalletInfo
  };
};