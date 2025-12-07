import PaymentStatusCard from "@/components/PaymentStatusCard";
import { getOrder } from "@/lib/orders";
import type { OrderStatus } from "@/src/types/db";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const statusMessage = (status: OrderStatus) => {
  if (status === "paid") return "Payment success";
  if (status === "pending" || status === "created")
    return "Payment is processing";
  if (status === "failed") return "Payment failed";
  return "Payment status unavailable";
};

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const orderIdParam = searchParams?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  if (!orderId) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          Payment Status
        </h1>
        <p className="text-slate-600">
          Missing orderId. Please check your payment link.
        </p>
      </main>
    );
  }

  const order = await getOrder(orderId);

  if (!order) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          Payment Status
        </h1>
        <p className="text-slate-600">Order not found.</p>
      </main>
    );
  }

  const status = (order.status ?? "unknown") as OrderStatus;

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Payment Status</h1>
        <p className="text-slate-600">{statusMessage(status)}</p>
      </div>

      <PaymentStatusCard order={order} />
    </main>
  );
}
