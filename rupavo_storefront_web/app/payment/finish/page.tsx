"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentStatus = "loading" | "success" | "pending" | "failed";

function PaymentFinishContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const transactionStatus = searchParams.get("transaction_status");

    const [status, setStatus] = useState<PaymentStatus>("loading");
    const [orderDetails, setOrderDetails] = useState<any>(null);

    useEffect(() => {
        const checkOrder = async () => {
            // First, check URL parameters for immediate status
            // Midtrans sends: transaction_status and status_code
            const statusCode = searchParams.get("status_code");

            // If we have transaction_status from Midtrans callback, use it directly
            // This handles the case where webhook hasn't updated DB yet
            if (transactionStatus) {
                if (transactionStatus === "capture" || transactionStatus === "settlement") {
                    setStatus("success");
                } else if (transactionStatus === "pending") {
                    setStatus("pending");
                } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
                    setStatus("failed");
                }
            } else if (statusCode === "200") {
                // Status code 200 means success
                setStatus("success");
            }

            if (!orderId) {
                if (!transactionStatus && !statusCode) {
                    setStatus("failed");
                }
                return;
            }

            const supabase = createClient();

            // Try to fetch order by ID (could be UUID or might need to search by midtrans_order_id)
            let order = null;

            // First try direct ID match (if it's UUID)
            const { data: directOrder, error: directError } = await supabase
                .from("orders")
                .select(`
                    *,
                    shops (name, slug),
                    order_items (*, products (name))
                `)
                .eq("id", orderId)
                .maybeSingle();

            if (directOrder) {
                order = directOrder;
            } else {
                // Try to find by midtrans_order_id in transactions table
                const { data: transaction } = await supabase
                    .from("transactions")
                    .select("order_id")
                    .eq("midtrans_order_id", orderId)
                    .maybeSingle();

                if (transaction?.order_id) {
                    const { data: txOrder } = await supabase
                        .from("orders")
                        .select(`
                            *,
                            shops (name, slug),
                            order_items (*, products (name))
                        `)
                        .eq("id", transaction.order_id)
                        .single();
                    order = txOrder;
                }
            }

            if (order) {
                setOrderDetails(order);

                // If we haven't set status from URL params, use DB status
                if (!transactionStatus && !statusCode) {
                    if (order.payment_status === "paid") {
                        setStatus("success");
                    } else if (order.payment_status === "pending") {
                        setStatus("pending");
                    } else {
                        setStatus("failed");
                    }
                }
            } else if (!transactionStatus && !statusCode) {
                // Only set failed if we have no URL params indicating success
                setStatus("failed");
            }
        };

        checkOrder();
    }, [orderId, transactionStatus, searchParams]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-muted">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    {status === "success" && (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <CardTitle className="text-2xl text-green-600">Pembayaran Berhasil!</CardTitle>
                        </>
                    )}
                    {status === "pending" && (
                        <>
                            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <CardTitle className="text-2xl text-yellow-600">Menunggu Pembayaran</CardTitle>
                        </>
                    )}
                    {status === "failed" && (
                        <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <CardTitle className="text-2xl text-red-600">Pembayaran Gagal</CardTitle>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {orderDetails && (
                        <div className="bg-muted rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Toko</span>
                                <span className="font-medium">{orderDetails.shops?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-bold">
                                    Rp {Number(orderDetails.total_amount).toLocaleString("id-ID")}
                                </span>
                            </div>
                            {orderDetails.customer_name && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nama</span>
                                    <span>{orderDetails.customer_name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {status === "success" && (
                        <p className="text-center text-muted-foreground">
                            Terima kasih! Pesanan Anda sedang diproses oleh penjual.
                        </p>
                    )}

                    {status === "pending" && (
                        <p className="text-center text-muted-foreground">
                            Silakan selesaikan pembayaran Anda. Setelah pembayaran dikonfirmasi, pesanan akan diproses.
                        </p>
                    )}

                    {status === "failed" && (
                        <p className="text-center text-muted-foreground">
                            Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.
                        </p>
                    )}

                    <div className="flex flex-col gap-2 pt-4">
                        {orderDetails?.shops?.slug && (
                            <Link href={`/${orderDetails.shops.slug}`}>
                                <Button variant="outline" className="w-full">
                                    Kembali ke Toko
                                </Button>
                            </Link>
                        )}
                        <Link href="/">
                            <Button variant="ghost" className="w-full">
                                Kembali ke Beranda
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentFinishPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <PaymentFinishContent />
        </Suspense>
    );
}
