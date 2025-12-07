import { NextResponse } from "next/server";
import type { IMidtransCallbackPayload } from "@/src/types/payment";

export async function POST(req: Request) {
  const payload = (await req.json()) as IMidtransCallbackPayload;
  const {
    order_id,
    transaction_status,
    fraud_status,
    payment_type,
    gross_amount,
  } = payload;

  console.log("Midtrans callback received", {
    order_id,
    transaction_status,
    fraud_status,
    payment_type,
    gross_amount,
  });

  // TODO: Update order status in your database using order_id and transaction_status.

  return NextResponse.json({ OK: true });
}
