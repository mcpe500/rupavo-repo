// =============================================================================
// AI Generate Report - Supabase Edge Function
// Generate laporan bisnis dengan insight AI
// =============================================================================

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ReportRequest {
    shop_id: string;
    period: "today" | "7days" | "30days" | "custom";
    start_date?: string;
    end_date?: string;
}

interface ReportMetrics {
    total_revenue: number;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number;
    top_products: Array<{ name: string; quantity: number; revenue: number }>;
}

interface ReportResponse {
    success: boolean;
    data?: {
        metrics: ReportMetrics;
        narrative: string;
        action_items: string[];
    };
    error?: string;
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const kolosalApiKey = Deno.env.get("KOLOSAL_API_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { shop_id, period, start_date, end_date }: ReportRequest = await req.json();

        if (!shop_id || !period) {
            return new Response(
                JSON.stringify({ success: false, error: "shop_id and period are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verify shop ownership
        const { data: shop, error: shopError } = await supabase
            .from("shops")
            .select("name, business_type")
            .eq("id", shop_id)
            .eq("owner_id", user.id)
            .single();

        if (shopError || !shop) {
            return new Response(
                JSON.stringify({ success: false, error: "Shop not found" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Calculate date range
        let dateFilter: string;
        const now = new Date();

        switch (period) {
            case "today":
                dateFilter = now.toISOString().split("T")[0];
                break;
            case "7days":
                const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateFilter = week.toISOString();
                break;
            case "30days":
                const month = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                dateFilter = month.toISOString();
                break;
            case "custom":
                dateFilter = start_date || now.toISOString();
                break;
            default:
                dateFilter = now.toISOString();
        }

        // Get orders
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select(`
                id, status, total, created_at,
                order_items (product_name, quantity, subtotal)
            `)
            .eq("shop_id", shop_id)
            .gte("created_at", dateFilter);

        if (ordersError) throw ordersError;

        // Calculate metrics
        const completedOrders = orders?.filter((o: any) => o.status === "completed") || [];
        const cancelledOrders = orders?.filter((o: any) => o.status === "cancelled") || [];

        const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        // Calculate top products
        const productMap = new Map<string, { quantity: number; revenue: number }>();
        orders?.forEach((order: any) => {
            (order.order_items as any[] || []).forEach((item: any) => {
                const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
                productMap.set(item.product_name, {
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + item.subtotal,
                });
            });
        });

        const topProducts = Array.from(productMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const metrics: ReportMetrics = {
            total_revenue: totalRevenue,
            total_orders: orders?.length || 0,
            completed_orders: completedOrders.length,
            cancelled_orders: cancelledOrders.length,
            average_order_value: avgOrderValue,
            top_products: topProducts,
        };

        // Generate narrative with AI
        const periodLabel = period === "today" ? "hari ini" :
            period === "7days" ? "7 hari terakhir" :
                period === "30days" ? "30 hari terakhir" : "periode custom";

        const prompt = `Kamu adalah Rupavo, partner bisnis UMKM.

Buat laporan singkat untuk ${shop.name} (${periodLabel}):

Data:
- Total Penjualan: Rp ${totalRevenue.toLocaleString("id-ID")}
- Jumlah Pesanan: ${orders?.length || 0}
- Pesanan Selesai: ${completedOrders.length}
- Pesanan Dibatalkan: ${cancelledOrders.length}
- Rata-rata Nilai Pesanan: Rp ${avgOrderValue.toLocaleString("id-ID")}
- Produk Terlaris: ${topProducts.map(p => p.name).join(", ") || "Belum ada data"}

Berikan:
1. Narasi singkat (2-3 kalimat) tentang performa bisnis
2. 3 action items konkret untuk meningkatkan penjualan

Format JSON:
{
  "narrative": "...",
  "action_items": ["...", "...", "..."]
}`;

        const kolosalResponse = await fetch("https://api.kolosal.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${kolosalApiKey}`,
            },
            body: JSON.stringify({
                model: "kolosal-1-full",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            }),
        });

        if (!kolosalResponse.ok) {
            throw new Error(`Kolosal API error: ${await kolosalResponse.text()}`);
        }

        const kolosalData = await kolosalResponse.json();
        const content = kolosalData.choices?.[0]?.message?.content || "{}";

        let aiInsight;
        try {
            aiInsight = JSON.parse(content);
        } catch {
            aiInsight = {
                narrative: "Tidak ada data yang cukup untuk analisis.",
                action_items: [],
            };
        }

        const response: ReportResponse = {
            success: true,
            data: {
                metrics,
                narrative: aiInsight.narrative,
                action_items: aiInsight.action_items || [],
            },
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
