import { NextResponse } from "next/server";
import { midtransSnap, midtransBaseUrl } from "@/src/lib/midtrans";
import type { ICreatePaymentRequest } from "@/src/types/payment";

const generateOrderId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${Date.now()}-${random}`;
};

const ensureItemPrice = (value: number) => Math.max(1, Math.round(value));

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ICreatePaymentRequest;

    if (!body?.orderId || typeof body.amount !== "number") {
      return NextResponse.json(
        { error: "orderId and amount are required" },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const grossAmount = Math.max(1, Math.round(body.amount));

    const itemDetails = body.items?.map((item, index) => ({
      id: `${orderId}-${index + 1}`,
      name: item.name,
      price: ensureItemPrice(item.price),
      quantity: Math.max(1, Math.floor(item.quantity ?? 1)),
    })) ?? [
      {
        id: `${orderId}-1`,
        name: `Order ${body.orderId}`,
        price: grossAmount,
        quantity: 1,
      },
    ];

    const callbacks = midtransBaseUrl
      ? {
          finish: `${midtransBaseUrl}/payments/finish`,
          error: `${midtransBaseUrl}/payments/error`,
          pending: `${midtransBaseUrl}/payments/pending`,
        }
      : undefined;

    const transactionPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: body.customer?.name,
        email: body.customer?.email,
        phone: body.customer?.phone,
      },
      callbacks,
      credit_card: {
        secure: true,
      },
      custom_field1: body.orderId,
    } as Record<string, unknown>;

    const transaction = await midtransSnap.createTransaction(
      transactionPayload as any
    );

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error("Midtrans create transaction error", error);
    return NextResponse.json(
      { error: "Failed to create Midtrans transaction" },
      { status: 500 }
    );
  }
}
