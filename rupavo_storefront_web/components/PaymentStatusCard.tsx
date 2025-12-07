import type { OrderWithItems, OrderStatus } from "@/src/types/db";

const statusStyles: Record<OrderStatus, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  created: "bg-gray-100 text-gray-800",
  unknown: "bg-slate-100 text-slate-800",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    amount
  );

type Props = {
  order: OrderWithItems;
};

export function PaymentStatusCard({ order }: Props) {
  const status = (order.status ?? "unknown") as OrderStatus;
  const badgeClass = statusStyles[status] ?? statusStyles.unknown;

  return (
    <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Order ID</p>
          <p className="text-lg font-semibold text-slate-900">
            {order.orderId}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Total Payment</span>
          <span className="font-semibold">{formatCurrency(order.amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Payment Type</span>
          <span className="font-medium">{order.paymentType ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Created At</span>
          <span>
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Paid At</span>
          <span>
            {order.paidAt ? new Date(order.paidAt).toLocaleString() : "-"}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-800">Items</p>
        <div className="mt-2 divide-y divide-slate-200 rounded-md border border-slate-200">
          {order.items.length === 0 && (
            <div className="p-3 text-sm text-slate-500">No items recorded.</div>
          )}
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.qty}</p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentStatusCard;
