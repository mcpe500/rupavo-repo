import { useCallback, useState } from "react";

export type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
};

export type CheckoutCustomer = {
  name?: string;
  email?: string;
  phone?: string;
};

export type CheckoutPayload = {
  amount: number;
  items?: CheckoutItem[];
  customer?: CheckoutCustomer;
};

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (payload: CheckoutPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create payment");
      }

      const data = (await res.json()) as {
        redirectUrl: string;
        token: string;
        orderId: string;
      };
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("Missing redirect URL from payment API");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { startCheckout, loading, error };
}

export default useCheckout;
