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
    action?: 'shop_created' | 'product_added' | 'product_suggestion'
    | 'draft_sale' | 'sale_confirmed' | 'draft_expense' | 'expense_confirmed'
    | 'transaction_updated' | 'transaction_deleted' | null;
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
        const systemPrompt = `Kamu adalah Asisten Rupavo, partner bisnis UMKM yang ramah dan helpful.

TUGAS UTAMA:
1. Membantu user membuat toko dan menambahkan produk
2. Mencatat transaksi penjualan dan pengeluaran (cashflow tracking)
3. Koreksi atau hapus transaksi yang salah

=== TOOLS (WAJIB Format JSON) ===

1. BUAT TOKO (onboarding):
{ "tool": "create_shop", "args": { "name": "Nama Toko", "description": "Deskripsi", "business_type": "FNB/Retail/Jasa" } }

2. DRAFT PRODUK BARU:
{ "tool": "add_product", "args": { "name": "Nama Produk", "price": 10000, "description": "Deskripsi" } }

3. DRAFT PENJUALAN (user bilang "ada yang beli X" - MINTA KONFIRMASI DULU):
{ "tool": "draft_sale", "args": { "product_name": "Kopi Arabica", "quantity": 2, "amount": 30000, "customer_name": "Pak Budi (opsional)" } }
→ Setelah output ini, TANYAKAN "Mau dicatat? Ketik 'ya' atau koreksi dulu."

4. KONFIRMASI PENJUALAN (user bilang "ya/oke/lanjut"):
{ "tool": "confirm_sale" }

5. DRAFT PENGELUARAN (user bilang "beli bahan X"):
{ "tool": "draft_expense", "args": { "description": "Beli gula 5kg", "amount": 75000, "category": "bahan_baku", "supplier_name": "Toko ABC" } }
→ Categories: bahan_baku, operasional, gaji, utilitas, marketing, general

6. KONFIRMASI PENGELUARAN (user bilang "ya/oke"):
{ "tool": "confirm_expense" }

7. UPDATE TRANSAKSI (user bilang "koreksi/ubah transaksi X"):
{ "tool": "update_transaction", "args": { "description_match": "kopi", "new_amount": 25000, "new_quantity": 3 } }

8. HAPUS TRANSAKSI (user bilang "batalkan/hapus transaksi X"):
{ "tool": "delete_transaction", "args": { "description_match": "kopi" } }

=== PENTING ===
- Untuk SETIAP penjualan/pengeluaran, BUAT DRAFT dulu, TANYA konfirmasi
- Jika user bilang "ya/oke", baru panggil confirm
- Jika user mau koreksi SEBELUM confirm, buat draft baru dengan data yang diubah
- Gunakan bahasa Indonesia santai

=== KONTEKS TOKO ===
- ID: ${shop.id}
- Nama: ${shop.name}
- Jenis: ${shop.business_type || "Umum"}
- Deskripsi: ${shop.description || "Belum ada"}

Statistik:
- Penjualan 10 terakhir: Rp ${totalSales.toLocaleString("id-ID")}
- Pesanan selesai: ${completedOrders}/${recentOrdersCount}`;

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

        let action: ChatResponse['action'] = null;
        let actionData = null;

        // 8.5 Parse Agentic Tools - Extract JSON from text
        try {
            // Extract JSON from response (may be embedded in text)
            const jsonMatch = reply.match(/\{[^{}]*"tool"[^{}]*\}/);

            if (jsonMatch) {
                const toolCall = JSON.parse(jsonMatch[0]);
                console.log("✨ TOOL CALL DETECTED:", toolCall);

                if (toolCall.tool === 'create_shop' && isOnboarding) {
                    console.log("✨ EXECUTING: create_shop", toolCall.args);

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
                    console.log("✨ TOOL SUGGESTION: add_product", toolCall.args);

                    action = 'product_suggestion';
                    actionData = {
                        ...toolCall.args,
                        shop_id: shop.id,
                    };

                    const productName = toolCall.args.name;
                    const productPrice = Number(toolCall.args.price ?? 0).toLocaleString('id-ID');

                    reply = `Aku sudah siapkan draft produk **${productName}** dengan harga Rp ${productPrice}.`
                        + ` Cek dulu detailnya, dan tekan tombol konfirmasi kalau sudah pas ya. 😊`;

                    // ========== TRANSACTION TOOLS ==========

                } else if (toolCall.tool === 'draft_sale' && !isOnboarding) {
                    console.log("✨ DRAFT SALE:", toolCall.args);

                    action = 'draft_sale';
                    actionData = {
                        ...toolCall.args,
                        shop_id: shop.id,
                    };

                    const productName = toolCall.args.product_name || 'Produk';
                    const qty = toolCall.args.quantity || 1;
                    const amount = Number(toolCall.args.amount ?? 0).toLocaleString('id-ID');

                    reply = `Mau catat penjualan ini? 📝\n• ${productName} x${qty}\n• Total: Rp ${amount}\n\nKetik 'ya' kalau sudah benar, atau bilang kalau ada yang perlu diubah.`;

                } else if (toolCall.tool === 'confirm_sale' && !isOnboarding) {
                    console.log("✨ CONFIRM SALE - looking for pending draft");

                    // Get recent draft from conversation to find pending sale
                    const { data: recentMessages } = await supabase
                        .from('ai_conversations')
                        .select('content')
                        .eq('shop_id', shop.id)
                        .eq('role', 'assistant')
                        .order('created_at', { ascending: false })
                        .limit(3);

                    // Parse the last draft_sale from context
                    // For now, we'll rely on client to send the draft data
                    action = 'sale_confirmed';
                    actionData = { shop_id: shop.id };
                    reply = "✅ Penjualan berhasil dicatat!";

                } else if (toolCall.tool === 'draft_expense' && !isOnboarding) {
                    console.log("✨ DRAFT EXPENSE:", toolCall.args);

                    action = 'draft_expense';
                    actionData = {
                        ...toolCall.args,
                        shop_id: shop.id,
                    };

                    const desc = toolCall.args.description || 'Pengeluaran';
                    const amount = Number(toolCall.args.amount ?? 0).toLocaleString('id-ID');
                    const category = toolCall.args.category || 'general';

                    reply = `Mau catat pengeluaran ini? 💸\n• ${desc}\n• Jumlah: Rp ${amount}\n• Kategori: ${category}\n\nKetik 'ya' untuk konfirmasi.`;

                } else if (toolCall.tool === 'confirm_expense' && !isOnboarding) {
                    console.log("✨ CONFIRM EXPENSE");

                    action = 'expense_confirmed';
                    actionData = { shop_id: shop.id };
                    reply = "✅ Pengeluaran berhasil dicatat!";

                } else if (toolCall.tool === 'update_transaction' && !isOnboarding) {
                    console.log("✨ UPDATE TRANSACTION:", toolCall.args);

                    const match = toolCall.args.description_match || '';
                    const newAmount = toolCall.args.new_amount;

                    // Find recent matching transaction
                    const { data: matchingOrders } = await supabase
                        .from('orders')
                        .select('id, total_amount, buyer_name')
                        .eq('shop_id', shop.id)
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    // For now, update the most recent order
                    if (matchingOrders && matchingOrders.length > 0) {
                        const targetOrder = matchingOrders[0];
                        const oldAmount = targetOrder.total_amount;

                        await supabase
                            .from('orders')
                            .update({ total_amount: newAmount })
                            .eq('id', targetOrder.id);

                        action = 'transaction_updated';
                        actionData = { order_id: targetOrder.id, old_amount: oldAmount, new_amount: newAmount };
                        reply = `✅ Transaksi diupdate!\n• Sebelum: Rp ${Number(oldAmount).toLocaleString('id-ID')}\n• Sesudah: Rp ${Number(newAmount).toLocaleString('id-ID')}`;
                    } else {
                        reply = "Hmm, aku tidak menemukan transaksi yang cocok. Coba sebutkan lebih spesifik ya.";
                    }

                } else if (toolCall.tool === 'delete_transaction' && !isOnboarding) {
                    console.log("✨ DELETE TRANSACTION:", toolCall.args);

                    // Find and soft-delete most recent matching transaction
                    const { data: matchingOrders } = await supabase
                        .from('orders')
                        .select('id, total_amount, buyer_name')
                        .eq('shop_id', shop.id)
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (matchingOrders && matchingOrders.length > 0) {
                        const targetOrder = matchingOrders[0];

                        await supabase
                            .from('orders')
                            .update({ deleted_at: new Date().toISOString() })
                            .eq('id', targetOrder.id);

                        action = 'transaction_deleted';
                        actionData = { order_id: targetOrder.id };
                        reply = `❌ Transaksi (Rp ${Number(targetOrder.total_amount).toLocaleString('id-ID')}) sudah dihapus.`;
                    } else {
                        reply = "Tidak ada transaksi yang bisa dihapus.";
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
