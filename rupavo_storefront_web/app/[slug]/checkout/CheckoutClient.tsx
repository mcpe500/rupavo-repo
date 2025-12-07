"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

interface CheckoutClientProps {
  shopSlug: string;
  shopId: string;
  shopName: string;
}

export function CheckoutClient({ shopSlug, shopId, shopName }: CheckoutClientProps) {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Pre-fill form with user data if available
      if (user) {
        setCustomerEmail(user.email || "");
        setCustomerName(user.user_metadata?.full_name || user.user_metadata?.name || "");
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setCustomerEmail(session.user.email || "");
        setCustomerName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Redirect to login if not authenticated
  const handleLoginRedirect = () => {
    // Store return URL
    const returnUrl = `/${shopSlug}/checkout`;
    localStorage.setItem("checkout_return_url", returnUrl);
    router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      handleLoginRedirect();
      return;
    }

    if (items.length === 0) {
      setError("Keranjang kosong");
      return;
    }

    if (!customerName || !customerPhone) {
      setError("Nama dan nomor telepon wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare additional data with user info
      const additionalData = {
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || user.user_metadata?.name || customerName,
        logged_in_at: new Date().toISOString(),
      };

      // Call payment-create edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/payment-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            order_id: `order-${Date.now()}`,
            shop_id: shopId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            customer_address: customerAddress,
            notes: notes,
            items: items.map((item) => ({
              product_id: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
            additional_data: additionalData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat pembayaran");
      }

      // Store order ID for status page
      localStorage.setItem("last_order_id", data.order_id);

      // Clear cart and redirect to Midtrans
      clearCart();
      
      if (data.snap_url) {
        window.location.href = data.snap_url;
      } else {
        throw new Error("URL pembayaran tidak tersedia");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h1>
          <p className="text-gray-500 mb-6">Tambahkan produk ke keranjang terlebih dahulu</p>
          <Link
            href={`/${shopSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Toko
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/${shopSlug}`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Checkout - {shopName}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Login Banner */}
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 mb-3">
              Anda harus login untuk melanjutkan pembayaran
            </p>
            <button
              onClick={handleLoginRedirect}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Login Sekarang
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                      <p className="text-sm font-semibold text-green-600">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Detail Pembeli</h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    placeholder="Alamat lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    placeholder="Catatan untuk penjual (opsional)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Bayar Sekarang - Rp {totalAmount.toLocaleString("id-ID")}
                  </>
                )}
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Silakan login terlebih dahulu untuk melanjutkan
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
