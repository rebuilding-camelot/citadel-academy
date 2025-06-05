// Type definitions for LNBits integration

interface InvoiceOptions {
  amount_msat: number;
  description: string;
  metadata?: string;
  webhook_data?: Record<string, any>;
}

interface InvoiceResponse {
  payment_hash: string;
  payment_request: string;
  [key: string]: any;
}

interface LnbitsClient {
  createInvoice(options: {
    amount: number;
    memo: string;
    out: boolean;
    webhook?: string;
    descriptionHash?: string;
  }): Promise<{
    payment_request: string;
    payment_hash: string;
    [key: string]: any;
  }>;
  checkPayment(paymentHash: string): Promise<{
    paid: boolean;
    [key: string]: any;
  }>;
}

export function generateInvoice(options: InvoiceOptions): Promise<InvoiceResponse>;
export function checkInvoicePaid(payment_hash: string): Promise<boolean>;
export function createZapReceipt(
  zapRequest: Record<string, any>,
  preimage: string,
  bolt11: string
): Promise<Record<string, any>>;
export function getLnbitsClient(): LnbitsClient;