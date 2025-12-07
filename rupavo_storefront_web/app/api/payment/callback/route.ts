import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orders";
import type { OrderStatus } from "@/src/types/db";

const mapStatus = (transactionStatus: string | undefined): OrderStatus => {
  if (!transactionStatus) return "unknown";
  const normalized = transactionStatus.toLowerCase();
  if (normalized === "settlement" || normalized === "capture") return "paid";
  if (normalized === "pending") return "pending";
  if (
    normalized === "cancel" ||
    normalized === "deny" ||
    normalized === "expire"
  )
    return "failed";
  return "unknown";
};

export async function POST(req: Request) {
  const payload = await req.json();

  const orderId = payload?.order_id as string | undefined;
  const transactionStatus = payload?.transaction_status as string | undefined;
  const paymentType = payload?.payment_type as string | undefined;
  const grossAmount = payload?.gross_amount as string | undefined;
  const transactionId = payload?.transaction_id as string | undefined;

  console.log("Midtrans callback", {
    order_id: orderId,
    transaction_status: transactionStatus,
    payment_type: paymentType,
    gross_amount: grossAmount,
    transaction_id: transactionId,
  });

  if (!orderId) {
    return NextResponse.json({ error: "order_id missing" }, { status: 400 });
  }

  const status = mapStatus(transactionStatus);
  await updateOrderStatus(orderId, status, paymentType, transactionId);

  return NextResponse.json({ OK: true });
}
