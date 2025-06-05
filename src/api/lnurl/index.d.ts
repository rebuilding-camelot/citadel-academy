// Type definitions for Lightning invoice utilities

declare module './utils' {
  export interface LightningInvoiceParams {
    amount: number;
    description: string;
    invoiceId: string;
    metadata?: Record<string, any>;
  }

  export interface LightningInvoice {
    payment_request: string;
    payment_hash: string;
    id?: string;
  }

  /**
   * Generate a Lightning invoice using LNbits
   */
  export function generateLightningInvoice(params: LightningInvoiceParams): Promise<LightningInvoice>;

  /**
   * Verify a Lightning invoice payment
   */
  export function verifyInvoicePayment(paymentHash: string): Promise<boolean>;
}