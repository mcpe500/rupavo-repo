export interface ICreatePaymentRequest {
  orderId: string;
  amount: number;
  items?: { name: string; price: number; quantity: number }[];
  customer?: { name?: string; email?: string; phone?: string };
}

export interface IMidtransCallbackPayload {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount: string;
  transaction_id?: string;
  signature_key?: string;
  status_code?: string;
  [key: string]: unknown;
}
