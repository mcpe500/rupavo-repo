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
    history?: Array<{ role: string; content: string }>; // For onboarding context
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
        const requestBody = await req.json() as ChatRequest;
        const { shop_id, session_id, message, history: clientHistory } = requestBody;

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
        console.log(`4. Using thread ID: ${currentThreadId} (Onboarding: ${isOnboarding})`);

        // Save User Message (for BOTH onboarding and real shops)
        if (isOnboarding) {
            // For onboarding: save with user_id (no shop yet)
            await supabase.from("ai_conversations").insert({
                user_id: user.id,
                thread_id: currentThreadId,
                role: "user",
                content: message,
            });
            console.log("4.1. Saved onboarding message with user_id");
        } else {
            // For real shops: save with shop_id
            await supabase.from("ai_conversations").insert({
                shop_id: shop.id,
                thread_id: currentThreadId,
                role: "user",
                content: message,
            });
            console.log("4.1. Saved shop message with shop_id");
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

TUGAS UTAMA:
Membantu user membuat toko dan menambahkan produk melalui percakapan.

TOOLS (Gunakan Format JSON):
Jika user ingin membuka toko dan sudah memberikan detail (Nama, Deskripsi), berikan response JSON ini (JANGAN tambah text lain):
{ "tool": "create_shop", "args": { "name": "Nama Toko", "description": "Deskripsi singkat", "business_type": "FNB/Retail/Jasa" } }

Jika user ingin menambah produk (HANYA jika toko sudah ada/bukan onboarding), response JSON:
{ "tool": "add_product", "args": { "name": "Nama Produk", "price": 10000, "description": "Deskripsi" } }

Profil Toko Saat Ini:
- ID: ${shop.id}
- Nama: ${shop.name}
- Jenis Usaha: ${shop.business_type || "Tidak diketahui"}
- Deskripsi: ${shop.description || "Belum ada deskripsi"}

Konteks Bisnis:
- Total penjualan 10 transaksi terakhir: Rp ${totalSales.toLocaleString("id-ID")}
- Pesanan selesai: ${completedOrders} dari ${recentOrdersCount}

Panduan:
1. Jika masih tahap onboarding (ID: onboarding), fokus gali informasi untuk membuat toko.
2. Jika user memberikan info lengkap (Nama, Deskripsi), LANGSUNG panggil tool create_shop.
3. Gunakan bahasa Indonesia yang santai.
4. Jika tidak memanggil tool, jawab seperti biasa (text).`;

        // 7.5 Fetch conversation history (for context continuity)
        let conversationHistory: any[] = [];

        if (isOnboarding) {
            // For onboarding, fetch from database using user_id
            const { data: historyData } = await supabase
                .from("ai_conversations")
                .select("role, content")
                .eq("user_id", user.id)
                .eq("thread_id", currentThreadId)
                .order("created_at", { ascending: true })
                .limit(20); // More history for onboarding context

            conversationHistory = historyData || [];
            console.log(`4.5. Loaded ${conversationHistory.length} onboarding messages from database (user_id)`);
        } else if (currentThreadId) {
            // For real shops, fetch from database using shop_id
            const { data: historyData } = await supabase
                .from("ai_conversations")
                .select("role, content")
                .eq("thread_id", currentThreadId)
                .order("created_at", { ascending: true })
                .limit(10); // Last 10 messages for context

            conversationHistory = historyData || [];
            console.log(`4.5. Loaded ${conversationHistory.length} shop messages from database (shop_id)`);
        }

        // 4.7. Optimize context window (token management)
        // Estimate tokens: ~4 characters = 1 token
        const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
        const maxContextTokens = 3000;
        let contextTokenCount = 0;

        // Start from most recent messages and keep within token limit
        const optimizedHistory: any[] = [];
        for (let i = conversationHistory.length - 1; i >= 0; i--) {
          const msgTokens = estimateTokens(conversationHistory[i].content);
          if (contextTokenCount + msgTokens <= maxContextTokens) {
            optimizedHistory.unshift(conversationHistory[i]);
            contextTokenCount += msgTokens;
          } else {
            console.log(`Token limit reached. Skipped ${i + 1} messages. Context tokens: ${contextTokenCount}`);
            break;
          }
        }

        conversationHistory = optimizedHistory;
        console.log(`4.7. Optimized context: ${conversationHistory.length} messages (${contextTokenCount} tokens)`);


        // 8. Call Kolosal AI via chat completions
        console.log("5. Sending request to Kolosal AI (api.kolosal.ai)...");

        // Build messages array with history
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: "user", content: message },
        ];

        const kolosalResponse = await fetch("https://api.kolosal.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${kolosalApiKey}`,
            },
            body: JSON.stringify({
                model: "Qwen 3 30BA3B",
                messages,
            }),
        });

        if (!kolosalResponse.ok) {
            const errorText = await kolosalResponse.text();
            console.error("Kolosal API error:", errorText);
            throw new Error(`Kolosal API error: ${errorText}`);
        }

        const kolosalData = await kolosalResponse.json();
        let reply = kolosalData.choices?.[0]?.message?.content || "Maaf, saya tidak bisa merespon saat ini.";
        console.log("6. Received response from Kolosal AI:", reply);

        let action = null;
        let actionData = null;

        // 8.5 Parse Agentic Tools
        try {
            // Check if response looks like JSON tool call
            const trimmedReply = reply.trim();
            if (trimmedReply.startsWith('{') && trimmedReply.endsWith('}')) {
                const toolCall = JSON.parse(trimmedReply);

                if (toolCall.tool === 'create_shop' && isOnboarding) {
                    console.log("✨ TOOL DETECTED: create_shop", toolCall.args);

                    const slug = toolCall.args.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const finalSlug = `${slug}-${Date.now()}`; // Ensure uniqueness

                    const { data: newShop, error: createError } = await supabase
                        .from('shops')
                        .insert({
                            owner_id: user.id,
                            name: toolCall.args.name,
                            slug: finalSlug,
                            description: toolCall.args.description,
                            business_type: toolCall.args.business_type || 'General',
                            storefront_published: false
                        })
                        .select()
                        .single();

                    if (createError) {
                        console.error("Failed to create shop:", createError);
                        reply = "Maaf, gagal membuat toko. Ada masalah sistem.";
                    } else {
                        console.log("✅ Shop created:", newShop.id);
                        action = 'shop_created';
                        actionData = newShop;
                        reply = `Toko "<b>${newShop.name}</b>" berhasil dibuat! 🎉\nSaya sedang menyiapkan dashboard untukmu...`;
                    }

                } else if (toolCall.tool === 'add_product' && !isOnboarding) {
                    console.log("✨ TOOL DETECTED: add_product", toolCall.args);

                    const { data: newProduct, error: prodError } = await supabase
                        .from('products')
                        .insert({
                            shop_id: shop.id,
                            name: toolCall.args.name,
                            price: toolCall.args.price,
                            description: toolCall.args.description,
                            is_active: true
                        })
                        .select()
                        .single();

                    if (prodError) {
                        console.error("Failed to add product:", prodError);
                        reply = "Gagal menambahkan produk.";
                    } else {
                        console.log("✅ Product added:", newProduct.id);
                        action = 'product_added';
                        actionData = newProduct;
                        reply = `Produk **${newProduct.name}** (Rp ${newProduct.price}) berhasil ditambahkan ke etalase! 🛍️`;
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to parse tool call (treating as text):", e);
        }

        // 9. Save assistant reply (for BOTH onboarding and real shops)
        if (isOnboarding) {
            // For onboarding: save with user_id
            await supabase.from("ai_conversations").insert({
                user_id: user.id,
                thread_id: currentThreadId,
                role: "assistant",
                content: reply,
            });
            console.log("7. Onboarding reply saved to database (user_id)");
        } else {
            // For real shops: save with shop_id
            await supabase.from("ai_conversations").insert({
                shop_id: shop.id,
                thread_id: currentThreadId,
                role: "assistant",
                content: reply,
            });
            console.log("7. Shop reply saved to database (shop_id)");
        }

        // 10. Return response
        const response: ChatResponse = {
            success: true,
            reply,
            session_id: currentThreadId,
            action,
            data: actionData
            // error: ... 
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
