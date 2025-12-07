import { NextResponse } from "next/server";
import { midtransSnap } from "@/src/lib/midtrans";
import { createOrder } from "@/lib/orders";

const generateOrderId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${Date.now()}-${random}`;
};

type CreatePaymentPayload = {
  amount: number;
  items?: { name: string; price: number; quantity: number }[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

const normalizeItems = (
  items: CreatePaymentPayload["items"],
  orderId: string,
  grossAmount: number
) => {
  if (!items || items.length === 0) {
    return [
      {
        id: `${orderId}-1`,
        name: "Order Item",
        price: grossAmount,
        quantity: 1,
      },
    ];
  }

  return items.map((item, idx) => ({
    id: `${orderId}-${idx + 1}`,
    name: item.name,
    price: Math.max(1, Math.round(item.price)),
    quantity: Math.max(1, Math.floor(item.quantity)),
  }));
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePaymentPayload;

    if (typeof body.amount !== "number") {
      return NextResponse.json(
        { error: "amount is required" },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const grossAmount = Math.max(1, Math.round(body.amount));
    const itemDetails = normalizeItems(body.items, orderId, grossAmount);

    const order = await createOrder(
      orderId,
      grossAmount,
      itemDetails,
      body.customer
    );
    if (!order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const transaction = await midtransSnap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      customer_details: {
        first_name: body.customer?.name,
        email: body.customer?.email,
        phone: body.customer?.phone,
      },
      credit_card: {
        secure: true,
      },
      custom_field1: orderId,
    });

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error("Payment create error", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
