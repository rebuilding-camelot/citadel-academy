// Type definitions for useNostrWalletConnect hook
export interface NostrWalletConnectHook {
  connected: boolean;
  walletPubkey: string;
  balance: number;
  connect: (connectionStr: string) => Promise<boolean>;
  disconnect: () => void;
  payInvoice: (invoice: string) => Promise<any>;
  makeInvoice: (amount: number, description?: string) => Promise<any>;
  getWalletInfo: () => Promise<any>;
}

export function useNostrWalletConnect(): NostrWalletConnectHook;