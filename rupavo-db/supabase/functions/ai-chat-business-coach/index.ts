// =============================================================================
// AI Chat Business Coach - Supabase Edge Function
// Chat dengan "Rupavo" sebagai partner bisnis UMKM
// =============================================================================


import { createClient } from "@supabase/supabase-js";

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
}

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Get auth token
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
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
            return new Response(
                JSON.stringify({ success: false, error: "Invalid token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 3. Parse request
        const { shop_id, session_id, message }: ChatRequest = await req.json();

        if (!shop_id || !message) {
            return new Response(
                JSON.stringify({ success: false, error: "shop_id and message are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 4. Verify shop ownership
        const { data: shop, error: shopError } = await supabase
            .from("shops")
            .select("id, name, description, business_type")
            .eq("id", shop_id)
            .eq("owner_id", user.id)
            .single();

        if (shopError || !shop) {
            return new Response(
                JSON.stringify({ success: false, error: "Shop not found or access denied" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 5. Get or create chat session
        let currentSessionId = session_id;
        if (!currentSessionId) {
            const { data: newSession, error: sessionError } = await supabase
                .from("chat_sessions")
                .insert({ shop_id, title: "Chat dengan Rupavo" })
                .select("id")
                .single();

            if (sessionError) throw sessionError;
            currentSessionId = newSession.id;
        }

        // 6. Save user message
        await supabase.from("chat_messages").insert({
            session_id: currentSessionId,
            role: "user",
            content: message,
        });

        // 7. Get recent sales context (optional, for smarter responses)
        const { data: recentOrders } = await supabase
            .from("orders")
            .select("total, status, created_at")
            .eq("shop_id", shop_id)
            .order("created_at", { ascending: false })
            .limit(10);

        const totalSales = recentOrders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
        const completedOrders = recentOrders?.filter((o: any) => o.status === "completed").length || 0;

        // 8. Build prompt for Kolosal AI
        const systemPrompt = `Kamu adalah Rupavo, partner bisnis UMKM yang ramah dan helpful.

Profil Toko:
- Nama: ${shop.name}
- Jenis Usaha: ${shop.business_type || "Tidak diketahui"}
- Deskripsi: ${shop.description || "Belum ada deskripsi"}

Konteks Bisnis:
- Total penjualan 10 transaksi terakhir: Rp ${totalSales.toLocaleString("id-ID")}
- Pesanan selesai: ${completedOrders} dari ${recentOrders?.length || 0}

Panduan:
1. Gunakan bahasa Indonesia yang santai tapi profesional
2. Berikan saran yang actionable dan praktis
3. Fokus pada solusi, bukan teori
4. Jika ditanya soal fitur Rupavo, jelaskan dengan antusias`;

        // 9. Call Kolosal AI via chat completions
        const kolosalResponse = await fetch("https://api.kolosal.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${kolosalApiKey}`,
            },
            body: JSON.stringify({
                model: "kolosal-1-full",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
            }),
        });

        if (!kolosalResponse.ok) {
            const errorText = await kolosalResponse.text();
            throw new Error(`Kolosal API error: ${errorText}`);
        }

        const kolosalData = await kolosalResponse.json();
        const reply = kolosalData.choices?.[0]?.message?.content || "Maaf, saya tidak bisa merespon saat ini.";

        // 10. Save assistant reply
        await supabase.from("chat_messages").insert({
            session_id: currentSessionId,
            role: "assistant",
            content: reply,
        });

        // 11. Return response
        const response: ChatResponse = {
            success: true,
            reply,
            session_id: currentSessionId,
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
