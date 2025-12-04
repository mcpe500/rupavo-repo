// =============================================================================
// Kolosal AI API Client
// A typed wrapper for making requests to the Kolosal AI API
// =============================================================================

import {
    OcrRequest,
    OCRResult,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ModelsListResponse,
    AgentRequest,
    AgentResponse,
    StatsResponse,
    ToolsResponse,
    SecureHealthResponse,
    DetailedHealthResponse,
    HealthResp,
    CacheStatsResp,
    CacheClearResp,
    StatsResp,
    SegmentJsonRequest,
    SegmentResponse,
    WorkspaceListResponse,
    WorkspaceResponse,
    WorkspaceOrderResponse,
    WorkspaceStatsResponse,
    OrderingStats,
    WorkspaceStatusResponse,
    DeleteWorkspaceResponse,
    CreateWorkspaceRequest,
    UpdateWorkspaceRequest,
    UpdateWorkspaceOrderRequest,
    CategoryListResponse,
    CategoryResponse,
    CategoryOrderResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    UpdateCategoryOrderRequest,
    DeleteResponse,
    FeatureListResponse,
    FeatureResponse,
    FeatureOrderResponse,
    CreateFeatureRequest,
    UpdateFeatureRequest,
    UpdateFeatureOrderRequest,
} from "./types.ts";

const KOLOSAL_API_URL = "https://api.kolosal.ai";

export class KolosalClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string = KOLOSAL_API_URL) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${this.apiKey}`);

        if (options.body && !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new KolosalError(
                data.message || data.error || "API request failed",
                response.status,
                data
            );
        }

        return data as T;
    }

    // ===========================================================================
    // Health Endpoints
    // ===========================================================================

    async health(): Promise<SecureHealthResponse> {
        return this.request<SecureHealthResponse>("/health", { method: "GET" });
    }

    async healthDetailed(): Promise<DetailedHealthResponse> {
        return this.request<DetailedHealthResponse>("/health/detailed", {
            method: "GET",
        });
    }

    // ===========================================================================
    // OCR Endpoints
    // ===========================================================================

    async ocr(data: OcrRequest): Promise<OCRResult> {
        return this.request<OCRResult>("/ocr", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async ocrForm(formData: FormData): Promise<OCRResult> {
        return this.request<OCRResult>("/ocr/form", {
            method: "POST",
            body: formData,
        });
    }

    // ===========================================================================
    // Chat Endpoints
    // ===========================================================================

    async chatCompletions(
        data: ChatCompletionRequest
    ): Promise<ChatCompletionResponse> {
        return this.request<ChatCompletionResponse>("/v1/chat/completions", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // ===========================================================================
    // Models Endpoints
    // ===========================================================================

    async listModels(): Promise<ModelsListResponse> {
        return this.request<ModelsListResponse>("/v1/models", { method: "GET" });
    }

    // ===========================================================================
    // Agent Endpoints
    // ===========================================================================

    async agentGenerate(data: AgentRequest): Promise<AgentResponse> {
        return this.request<AgentResponse>("/v1/agent/generate", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async agentGenerateStream(data: AgentRequest): Promise<Response> {
        // Returns raw response for streaming
        const url = `${this.baseUrl}/v1/agent/generate/stream`;
        return fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    }

    async agentStats(): Promise<StatsResponse> {
        return this.request<StatsResponse>("/v1/agent/stats", { method: "GET" });
    }

    async agentTools(): Promise<ToolsResponse> {
        return this.request<ToolsResponse>("/v1/agent/tools", { method: "GET" });
    }

    // ===========================================================================
    // Object Detection Endpoints
    // ===========================================================================

    async detectHealth(): Promise<HealthResp> {
        return this.request<HealthResp>("/v1/detect/health", { method: "GET" });
    }

    async detectStats(): Promise<StatsResp> {
        return this.request<StatsResp>("/v1/detect/stats", { method: "GET" });
    }

    async cacheStats(): Promise<CacheStatsResp> {
        return this.request<CacheStatsResp>("/v1/cache", { method: "GET" });
    }

    async cacheClear(): Promise<CacheClearResp> {
        return this.request<CacheClearResp>("/v1/cache", { method: "DELETE" });
    }

    async segment(formData: FormData): Promise<SegmentResponse> {
        return this.request<SegmentResponse>("/v1/segment", {
            method: "POST",
            body: formData,
        });
    }

    async segmentBase64(data: SegmentJsonRequest): Promise<SegmentResponse> {
        return this.request<SegmentResponse>("/v1/segment/base64", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // ===========================================================================
    // Workspace Endpoints
    // ===========================================================================

    async listWorkspaces(): Promise<WorkspaceListResponse> {
        return this.request<WorkspaceListResponse>("/v1/workspaces", {
            method: "GET",
        });
    }

    async createWorkspace(
        data: CreateWorkspaceRequest
    ): Promise<WorkspaceResponse> {
        return this.request<WorkspaceResponse>("/v1/workspaces", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getWorkspace(workspaceId: string): Promise<WorkspaceResponse> {
        return this.request<WorkspaceResponse>(`/v1/workspaces/${workspaceId}`, {
            method: "GET",
        });
    }

    async updateWorkspace(
        workspaceId: string,
        data: UpdateWorkspaceRequest
    ): Promise<WorkspaceResponse> {
        return this.request<WorkspaceResponse>(`/v1/workspaces/${workspaceId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteWorkspace(
        workspaceId: string
    ): Promise<DeleteWorkspaceResponse> {
        return this.request<DeleteWorkspaceResponse>(
            `/v1/workspaces/${workspaceId}`,
            { method: "DELETE" }
        );
    }

    async getWorkspaceOrder(): Promise<WorkspaceOrderResponse> {
        return this.request<WorkspaceOrderResponse>("/v1/workspaces/order", {
            method: "GET",
        });
    }

    async updateWorkspaceOrder(
        data: UpdateWorkspaceOrderRequest
    ): Promise<WorkspaceOrderResponse> {
        return this.request<WorkspaceOrderResponse>("/v1/workspaces/order", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async getOrderingStats(): Promise<OrderingStats> {
        return this.request<OrderingStats>("/v1/workspaces/order/stats", {
            method: "GET",
        });
    }

    async getWorkspaceStats(): Promise<WorkspaceStatsResponse> {
        return this.request<WorkspaceStatsResponse>("/v1/workspaces/stats", {
            method: "GET",
        });
    }

    async getWorkspaceStatus(
        workspaceId: string
    ): Promise<WorkspaceStatusResponse> {
        return this.request<WorkspaceStatusResponse>(
            `/v1/workspaces/${workspaceId}/status`,
            { method: "GET" }
        );
    }

    // ===========================================================================
    // Category Endpoints
    // ===========================================================================

    async listCategories(workspaceId: string): Promise<CategoryListResponse> {
        return this.request<CategoryListResponse>(
            `/v1/workspaces/${workspaceId}/categories`,
            { method: "GET" }
        );
    }

    async createCategory(
        workspaceId: string,
        data: CreateCategoryRequest
    ): Promise<CategoryResponse> {
        return this.request<CategoryResponse>(
            `/v1/workspaces/${workspaceId}/categories`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
    }

    async getCategory(
        workspaceId: string,
        categoryId: string
    ): Promise<CategoryResponse> {
        return this.request<CategoryResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}`,
            { method: "GET" }
        );
    }

    async updateCategory(
        workspaceId: string,
        categoryId: string,
        data: UpdateCategoryRequest
    ): Promise<CategoryResponse> {
        return this.request<CategoryResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            }
        );
    }

    async deleteCategory(
        workspaceId: string,
        categoryId: string
    ): Promise<DeleteResponse> {
        return this.request<DeleteResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}`,
            { method: "DELETE" }
        );
    }

    async getCategoryOrder(workspaceId: string): Promise<CategoryOrderResponse> {
        return this.request<CategoryOrderResponse>(
            `/v1/workspaces/${workspaceId}/categories/order`,
            { method: "GET" }
        );
    }

    async updateCategoryOrder(
        workspaceId: string,
        data: UpdateCategoryOrderRequest
    ): Promise<CategoryOrderResponse> {
        return this.request<CategoryOrderResponse>(
            `/v1/workspaces/${workspaceId}/categories/order`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
    }

    // ===========================================================================
    // Feature Endpoints
    // ===========================================================================

    async listFeatures(
        workspaceId: string,
        categoryId: string
    ): Promise<FeatureListResponse> {
        return this.request<FeatureListResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features`,
            { method: "GET" }
        );
    }

    async createFeature(
        workspaceId: string,
        categoryId: string,
        data: CreateFeatureRequest
    ): Promise<FeatureResponse> {
        return this.request<FeatureResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
    }

    async getFeature(
        workspaceId: string,
        categoryId: string,
        featureId: string
    ): Promise<FeatureResponse> {
        return this.request<FeatureResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features/${featureId}`,
            { method: "GET" }
        );
    }

    async updateFeature(
        workspaceId: string,
        categoryId: string,
        featureId: string,
        data: UpdateFeatureRequest
    ): Promise<FeatureResponse> {
        return this.request<FeatureResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features/${featureId}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            }
        );
    }

    async deleteFeature(
        workspaceId: string,
        categoryId: string,
        featureId: string
    ): Promise<DeleteResponse> {
        return this.request<DeleteResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features/${featureId}`,
            { method: "DELETE" }
        );
    }

    async getFeatureOrder(
        workspaceId: string,
        categoryId: string
    ): Promise<FeatureOrderResponse> {
        return this.request<FeatureOrderResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features/order`,
            { method: "GET" }
        );
    }

    async updateFeatureOrder(
        workspaceId: string,
        categoryId: string,
        data: UpdateFeatureOrderRequest
    ): Promise<FeatureOrderResponse> {
        return this.request<FeatureOrderResponse>(
            `/v1/workspaces/${workspaceId}/categories/${categoryId}/features/order`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
    }
}

// =============================================================================
// Error Class
// =============================================================================

export class KolosalError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data: unknown) {
        super(message);
        this.name = "KolosalError";
        this.status = status;
        this.data = data;
    }
}
