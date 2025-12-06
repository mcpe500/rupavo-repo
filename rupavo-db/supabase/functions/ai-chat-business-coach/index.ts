// =============================================================================
// AI Chat Business Coach - Supabase Edge Function
// Chat dengan "Rupavo" sebagai partner bisnis UMKM
// =============================================================================


import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatRequest {
    shop_id: string;
    session_id?: string;
    message: string;
}

interface ChatResponse {
    success: boolean;
    reply?: string;
    session_id?: string;
    error?: string;
    action?: 'shop_created' | 'product_added' | null;
    data?: any;
}

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("1. Request received");

        // 1. Get auth token
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            console.error("No authorization header");
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 2. Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const kolosalApiKey = Deno.env.get("KOLOSAL_API_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Auth failed:", authError);
            return new Response(
                JSON.stringify({ success: false, error: "Invalid token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
        console.log("2. User authenticated:", user.id);

        // 3. Parse request
        const { shop_id, session_id, message }: ChatRequest = await req.json();

        if (!shop_id || !message) {
            console.error("Missing required fields");
            return new Response(
                JSON.stringify({ success: false, error: "shop_id and message are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
        console.log(`3. Processing request for shop: ${shop_id}`);

        // 4. Verify shop ownership & Context
        let shop = { name: "Calon Pengusaha", description: "Sedang dalam tahap ide", business_type: "Umum", id: "onboarding" };
        const isOnboarding = shop_id === 'onboarding';

        if (!isOnboarding) {
            const { data: dbShop, error: shopError } = await supabase
                .from("shops")
                .select("id, name, description, business_type")
                .eq("id", shop_id)
                .eq("owner_id", user.id)
                .single();

            if (shopError || !dbShop) {
                console.error("Shop lookup failed:", shopError);
                return new Response(
                    JSON.stringify({ success: false, error: "Shop not found or access denied" }),
                    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            shop = dbShop;
        }

        // 5. Context & Thread Management
        const currentThreadId = session_id || crypto.randomUUID();
        console.log(`4. Using thread ID: ${currentThreadId} (Ephemeral: ${isOnboarding})`);

        if (!isOnboarding) {
            // Save User Message
            await supabase.from("ai_conversations").insert({
                shop_id: shop.id,
                thread_id: currentThreadId,
                role: "user",
                content: message,
            });
        }

        // 6. Get recent sales context (optional, only for real shops)
        let totalSales = 0;
        let completedOrders = 0;
        let recentOrdersCount = 0;

        if (!isOnboarding) {
            const { data: recentOrders } = await supabase
                .from("orders")
                .select("total_amount, status")
                .eq("shop_id", shop.id)
                .order("created_at", { ascending: false })
                .limit(10);

            recentOrdersCount = recentOrders?.length || 0;
            totalSales = recentOrders?.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0) || 0;
            completedOrders = recentOrders?.filter((o: any) => o.status === "completed").length || 0;
        }

        // 7. Build prompt for Kolosal AI
        const systemPrompt = `Kamu adalah Rupavo, partner bisnis UMKM yang ramah dan helpful.

Profil Toko:
- Nama: ${shop.name}
- Jenis Usaha: ${shop.business_type || "Tidak diketahui"}
- Deskripsi: ${shop.description || "Belum ada deskripsi"}

Konteks Bisnis:
- Total penjualan 10 transaksi terakhir: Rp ${totalSales.toLocaleString("id-ID")}
- Pesanan selesai: ${completedOrders} dari ${recentOrdersCount}

Panduan:
1. Gunakan bahasa Indonesia yang santai tapi profesional
2. Berikan saran yang actionable dan praktis
3. Fokus pada solusi, bukan teori
4. Jika ditanya soal fitur Rupavo, jelaskan dengan antusias`;

        // 8. Call Kolosal AI via chat completions
        console.log("5. Sending request to Kolosal AI (api.kolosal.ai)...");
        const kolosalResponse = await fetch("https://api.kolosal.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${kolosalApiKey}`,
            },
            body: JSON.stringify({
                model: "Qwen 3 30BA3B",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
            }),
        });

        if (!kolosalResponse.ok) {
            const errorText = await kolosalResponse.text();
            console.error("Kolosal API error:", errorText);
            throw new Error(`Kolosal API error: ${errorText}`);
        }

        const kolosalData = await kolosalResponse.json();
        const reply = kolosalData.choices?.[0]?.message?.content || "Maaf, saya tidak bisa merespon saat ini.";
        console.log("6. Received response from Kolosal AI");

        // 9. Save assistant reply (ONLY if not onboarding)
        if (!isOnboarding) {
            await supabase.from("ai_conversations").insert({
                shop_id: shop.id,
                thread_id: currentThreadId,
                role: "assistant",
                content: reply,
            });
            console.log("7. Suggestion saved to database");
        } else {
            console.log("7. Ephemeral chat, skipping DB save");
        }

        // 10. Return response
        const response: ChatResponse = {
            success: true,
            reply,
            session_id: currentThreadId,
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
