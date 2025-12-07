export type OrderStatus = "paid" | "pending" | "failed" | "created" | "unknown";

export interface OrderRow {
  id: string;
  orderId: string;
  amount: number;
  status: OrderStatus | null;
  paymentType: string | null;
  midtransTransactionId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: string | null;
  paidAt: string | null;
}

export interface OrderItemRow {
  id: string;
  orderId: string;
  name: string;
  price: number;
  qty: number;
}

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}
