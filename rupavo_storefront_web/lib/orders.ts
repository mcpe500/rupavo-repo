import { createClient } from "@/lib/supabase/server";
import type {
  OrderItemRow,
  OrderRow,
  OrderStatus,
  OrderWithItems,
} from "@/src/types/db";

type Customer = {
  name?: string;
  email?: string;
  phone?: string;
};

type OrderItemInput = {
  name: string;
  price: number;
  quantity: number;
};

export async function createOrder(
  orderId: string,
  amount: number,
  items: OrderItemInput[],
  customer?: Customer
): Promise<OrderRow | null> {
  const supabase = await createClient();
  const itemRows = items.map((item) => ({
    orderId,
    name: item.name,
    price: Math.round(item.price),
    qty: Math.max(1, Math.floor(item.quantity)),
  }));

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      orderId,
      amount: Math.round(amount),
      status: "created" satisfies OrderStatus,
      customerName: customer?.name ?? null,
      customerEmail: customer?.email ?? null,
      customerPhone: customer?.phone ?? null,
    })
    .select()
    .single<OrderRow>();

  if (orderError) {
    console.error("Failed to insert order", orderError);
    return null;
  }

  if (itemRows.length > 0) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemRows);
    if (itemsError) {
      console.error("Failed to insert order items", itemsError);
    }
  }

  return orderData;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentType?: string | null,
  midtransTransactionId?: string | null
): Promise<OrderRow | null> {
  const supabase = await createClient();
  const patch: Partial<OrderRow> = {
    status,
    paymentType: paymentType ?? null,
    midtransTransactionId: midtransTransactionId ?? null,
  };

  if (status === "paid") {
    patch.paidAt = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("orderId", orderId)
    .select()
    .single<OrderRow>();

  if (error) {
    console.error("Failed to update order status", error);
    return null;
  }

  return data;
}

export async function getOrder(
  orderId: string
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const [
    { data: order, error: orderError },
    { data: items, error: itemsError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("orderId", orderId)
      .single<OrderRow>(),
    supabase
      .from("order_items")
      .select("*")
      .eq("orderId", orderId)
      .returns<OrderItemRow[]>(),
  ]);

  if (orderError) {
    console.error("Failed to fetch order", orderError);
    return null;
  }

  if (itemsError) {
    console.error("Failed to fetch order items", itemsError);
    return null;
  }

  return {
    ...order,
    items: items ?? [],
  };
}
