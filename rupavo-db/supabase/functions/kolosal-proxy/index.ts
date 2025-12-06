// =============================================================================
// Kolosal AI Proxy - Supabase Edge Function
// Secure proxy with Supabase JWT authentication
// =============================================================================

// import { serve } from "std/http/server.ts"; // Removed in favor of Deno.serve
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { KolosalClient, KolosalError } from "./client.ts";
import type {
    KolosalAction,
    KolosalProxyRequest,
    KolosalProxyResponse,
} from "./types.ts";

// ... (omitted lines) ...

// =============================================================================
// Main Handler
// =============================================================================

Deno.serve(async (req: Request) => {

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
        return errorResponse("Method not allowed. Use POST.", 405);
    }

    try {
        // 1. Authenticate User (via Supabase JWT)
        const authResult = await authenticateUser(req);
        if (!authResult) {
            return errorResponse("Unauthorized. Invalid or missing token.", 401);
        }

        console.log(`Authenticated user: ${authResult.userId}`);

        // 2. Get Kolosal API Key from secrets
        const kolosalApiKey = Deno.env.get("KOLOSAL_API_KEY");
        if (!kolosalApiKey) {
            console.error("Missing KOLOSAL_API_KEY secret");
            return errorResponse("Server configuration error", 500);
        }

        // 3. Parse request body
        let body: KolosalProxyRequest;
        try {
            body = await req.json();
        } catch {
            return errorResponse("Invalid JSON body", 400);
        }

        // 4. Validate action
        if (!body.action) {
            return errorResponse("Missing 'action' field in request body", 400);
        }

        // 5. Create Kolosal client and execute action
        const client = new KolosalClient(kolosalApiKey);
        const result = await handleAction(client, body);

        // 6. Return success response
        return jsonResponse({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error:", error);

        if (error instanceof KolosalError) {
            return jsonResponse(
                {
                    success: false,
                    error: error.message,
                    data: error.data,
                },
                error.status
            );
        }

        return errorResponse(
            error instanceof Error ? error.message : "Unknown error",
            500
        );
    }
});
