import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
    KolosalChatCompletionRequest,
    KolosalOCRRequest,
} from "./types.ts";

const KOLOSAL_API_URL = "https://api.kolosal.ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Verify Authentication (Optional but recommended)
        // For now, we'll assume the client sends a valid Supabase JWT in the Authorization header
        // and we might want to validate it if we want to restrict access to logged-in users.
        // const authHeader = req.headers.get('Authorization');
        // if (!authHeader) { ... }

        // 2. Get Kolosal API Key
        const KOLOSAL_API_KEY = Deno.env.get("KOLOSAL_API_KEY");
        if (!KOLOSAL_API_KEY) {
            console.error("Missing KOLOSAL_API_KEY secret");
            return new Response(
                JSON.stringify({ error: "Server configuration error: Missing API Key" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 3. Parse Request
        const url = new URL(req.url);
        // We expect the client to call this function with a path parameter or query param to specify the Kolosal endpoint
        // Example: /kolosal-proxy/ocr or /kolosal-proxy/chat
        // However, Supabase Functions routing is usually /function-name.
        // So we can use the last part of the path if we set up routing, or just pass an 'action' or 'endpoint' in the body.
        // Let's use a body parameter 'action' or 'endpoint' for simplicity, or inspect the URL path if we deploy it as a catch-all.
        // A cleaner way for a proxy is to map the request path.
        // If we call https://<project>.supabase.co/functions/v1/kolosal-proxy/ocr
        // The req.url will contain /kolosal-proxy/ocr.

        const path = url.pathname.split("/").pop(); // This might just be 'kolosal-proxy' if no sub-path is used.

        // Let's try to parse the body to see what the user wants to do.
        let body: any = {};
        try {
            body = await req.json();
        } catch (e) {
            // Body might be empty for GET requests
        }

        const { endpoint, method, data } = body;

        if (!endpoint) {
            return new Response(
                JSON.stringify({ error: "Missing 'endpoint' in request body" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 4. Construct Kolosal API Request
        const targetUrl = `${KOLOSAL_API_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

        console.log(`Proxying request to: ${targetUrl}`);

        const kolosalResponse = await fetch(targetUrl, {
            method: method || "POST", // Default to POST
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${KOLOSAL_API_KEY}`,
            },
            body: method === "GET" ? undefined : JSON.stringify(data),
        });

        // 5. Handle Response
        const responseData = await kolosalResponse.json();

        if (!kolosalResponse.ok) {
            console.error("Kolosal API Error:", responseData);
            return new Response(JSON.stringify(responseData), {
                status: kolosalResponse.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
