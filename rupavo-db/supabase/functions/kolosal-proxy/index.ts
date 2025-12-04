// =============================================================================
// Kolosal AI Proxy - Supabase Edge Function
// Secure proxy with Supabase JWT authentication
// =============================================================================

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { KolosalClient, KolosalError } from "./client.ts";
import type {
    KolosalAction,
    KolosalProxyRequest,
    KolosalProxyResponse,
    OcrRequest,
    ChatCompletionRequest,
    AgentRequest,
    SegmentJsonRequest,
    CreateWorkspaceRequest,
    UpdateWorkspaceRequest,
    UpdateWorkspaceOrderRequest,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    UpdateCategoryOrderRequest,
    CreateFeatureRequest,
    UpdateFeatureRequest,
    UpdateFeatureOrderRequest,
} from "./types.ts";

// =============================================================================
// CORS Headers
// =============================================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// =============================================================================
// Response Helpers
// =============================================================================

function jsonResponse<T>(
    data: KolosalProxyResponse<T>,
    status = 200
): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function errorResponse(
    message: string,
    status = 400
): Response {
    return jsonResponse({ success: false, error: message }, status);
}

// =============================================================================
// Authentication Middleware
// =============================================================================

interface AuthResult {
    userId: string;
    email?: string;
}

async function authenticateUser(req: Request): Promise<AuthResult | null> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return null;
    }

    // Extract the JWT token (format: "Bearer <token>")
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
        return null;
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase environment variables");
        return null;
    }

    try {
        // Create a Supabase client and verify the token
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: `Bearer ${token}` },
            },
        });

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            console.error("Auth error:", error?.message);
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
        };
    } catch (error) {
        console.error("Auth exception:", error);
        return null;
    }
}

// =============================================================================
// Action Router
// =============================================================================

async function handleAction(
    client: KolosalClient,
    request: KolosalProxyRequest
): Promise<unknown> {
    switch (request.action) {
        // -------------------------------------------------------------------------
        // Health
        // -------------------------------------------------------------------------
        case "health":
            return client.health();
        case "health.detailed":
            return client.healthDetailed();

        // -------------------------------------------------------------------------
        // OCR
        // -------------------------------------------------------------------------
        case "ocr":
            return client.ocr(request.data);
        case "ocr.form":
            // For form data, we need to reconstruct FormData from the passed data
            const formData = new FormData();
            if (request.data) {
                for (const [key, value] of Object.entries(request.data)) {
                    if (value !== null && value !== undefined) {
                        formData.append(key, String(value));
                    }
                }
            }
            return client.ocrForm(formData);

        // -------------------------------------------------------------------------
        // Chat
        // -------------------------------------------------------------------------
        case "chat.completions":
            return client.chatCompletions(request.data);

        // -------------------------------------------------------------------------
        // Models
        // -------------------------------------------------------------------------
        case "models.list":
            return client.listModels();

        // -------------------------------------------------------------------------
        // Agent
        // -------------------------------------------------------------------------
        case "agent.generate":
            return client.agentGenerate(request.data);
        case "agent.generate.stream":
            // Streaming requires special handling - return raw response
            const streamResponse = await client.agentGenerateStream(
                request.data
            );
            return { streaming: true, status: streamResponse.status };
        case "agent.stats":
            return client.agentStats();
        case "agent.tools":
            return client.agentTools();

        // -------------------------------------------------------------------------
        // Object Detection
        // -------------------------------------------------------------------------
        case "detect.health":
            return client.detectHealth();
        case "detect.stats":
            return client.detectStats();
        case "cache.stats":
            return client.cacheStats();
        case "cache.clear":
            return client.cacheClear();
        case "segment":
            const segmentFormData = new FormData();
            if (request.data) {
                for (const [key, value] of Object.entries(request.data)) {
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            value.forEach((v) => segmentFormData.append(key, String(v)));
                        } else {
                            segmentFormData.append(key, String(value));
                        }
                    }
                }
            }
            return client.segment(segmentFormData);
        case "segment.base64":
            return client.segmentBase64(request.data);

        // -------------------------------------------------------------------------
        // Workspaces
        // -------------------------------------------------------------------------
        case "workspaces.list":
            return client.listWorkspaces();
        case "workspaces.create":
            return client.createWorkspace(request.data);
        case "workspaces.get":
            return client.getWorkspace(request.workspace_id);
        case "workspaces.update":
            return client.updateWorkspace(
                request.workspace_id,
                request.data
            );
        case "workspaces.delete":
            return client.deleteWorkspace(request.workspace_id);
        case "workspaces.order.get":
            return client.getWorkspaceOrder();
        case "workspaces.order.update":
            return client.updateWorkspaceOrder(request.data);
        case "workspaces.order.stats":
            return client.getOrderingStats();
        case "workspaces.stats":
            return client.getWorkspaceStats();
        case "workspaces.status":
            return client.getWorkspaceStatus(request.workspace_id);

        // -------------------------------------------------------------------------
        // Categories
        // -------------------------------------------------------------------------
        case "categories.list":
            return client.listCategories(request.workspace_id);
        case "categories.create":
            return client.createCategory(
                request.workspace_id,
                request.data
            );
        case "categories.get":
            return client.getCategory(request.workspace_id, request.category_id);
        case "categories.update":
            return client.updateCategory(
                request.workspace_id,
                request.category_id,
                request.data
            );
        case "categories.delete":
            return client.deleteCategory(request.workspace_id, request.category_id);
        case "categories.order.get":
            return client.getCategoryOrder(request.workspace_id);
        case "categories.order.update":
            return client.updateCategoryOrder(
                request.workspace_id,
                request.data
            );

        // -------------------------------------------------------------------------
        // Features
        // -------------------------------------------------------------------------
        case "features.list":
            return client.listFeatures(request.workspace_id, request.category_id);
        case "features.create":
            return client.createFeature(
                request.workspace_id,
                request.category_id,
                request.data
            );
        case "features.get":
            return client.getFeature(request.workspace_id, request.category_id, request.feature_id);
        case "features.update":
            return client.updateFeature(
                request.workspace_id,
                request.category_id,
                request.feature_id,
                request.data
            );
        case "features.delete":
            return client.deleteFeature(request.workspace_id, request.category_id, request.feature_id);
        case "features.order.get":
            return client.getFeatureOrder(request.workspace_id, request.category_id);
        case "features.order.update":
            return client.updateFeatureOrder(
                request.workspace_id,
                request.category_id,
                request.data
            );

        default:
            // This is now unreachable if all cases are covered, but good for safety
            const _exhaustiveCheck: never = request;
            throw new Error(`Unknown action: ${(request as any).action}`);
    }
}

// =============================================================================
// Main Handler
// =============================================================================

serve(async (req: Request) => {
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
