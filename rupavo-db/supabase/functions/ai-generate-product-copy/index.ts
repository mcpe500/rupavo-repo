// =============================================================================
// AI Generate Product Copy - Supabase Edge Function
// Generate nama, deskripsi, dan tagline produk dengan AI
// =============================================================================

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ProductCopyRequest {
    shop_id: string;
    base_name: string;
    base_description?: string;
    category?: string;
    price?: number;
}

interface ProductCopyResponse {
    success: boolean;
    data?: {
        name: string;
        description: string;
        tagline: string;
    };
    error?: string;
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Auth check
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

        // Parse request
        const { shop_id, base_name, base_description, category, price }: ProductCopyRequest = await req.json();

        if (!shop_id || !base_name) {
            return new Response(
                JSON.stringify({ success: false, error: "shop_id and base_name are required" }),
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

        // Build prompt
        const prompt = `Kamu adalah copywriter profesional untuk UMKM Indonesia.

Toko: ${shop.name}
Jenis Usaha: ${shop.business_type || "Umum"}

Buatkan copy produk untuk:
- Nama dasar: ${base_name}
${base_description ? `- Deskripsi awal: ${base_description}` : ""}
${category ? `- Kategori: ${category}` : ""}
${price ? `- Harga: Rp ${price.toLocaleString("id-ID")}` : ""}

Berikan output dalam format JSON:
{
  "name": "Nama produk yang menarik (maksimal 50 karakter)",
  "description": "Deskripsi lengkap yang menjual (2-3 kalimat, fokus pada manfaat)",
  "tagline": "Tagline singkat dan catchy (maksimal 30 karakter)"
}

Gunakan bahasa Indonesia yang santai tapi profesional. Jangan gunakan kata-kata klise.`;

        // Call Kolosal AI
        const kolosalResponse = await fetch("https://api.kolosal.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${kolosalApiKey}`,
            },
            body: JSON.stringify({
                model: "kolosal-1-full",
                messages: [
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!kolosalResponse.ok) {
            throw new Error(`Kolosal API error: ${await kolosalResponse.text()}`);
        }

        const kolosalData = await kolosalResponse.json();
        const content = kolosalData.choices?.[0]?.message?.content || "{}";

        let productCopy;
        try {
            productCopy = JSON.parse(content);
        } catch {
            productCopy = {
                name: base_name,
                description: base_description || "",
                tagline: "",
            };
        }

        const response: ProductCopyResponse = {
            success: true,
            data: productCopy,
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
