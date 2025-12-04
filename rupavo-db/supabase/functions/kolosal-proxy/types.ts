export interface KolosalHealthResponse {
    status: string;
    timestamp: string;
}

export interface KolosalDetailedHealthResponse {
    memory_usage_mb: number;
    status: string;
    timestamp: string;
    uptime_seconds: number;
    version: string;
}

export interface KolosalOCRRequest {
    image_data: string; // Base64 or GCS URL
    auto_fix?: boolean | null;
    custom_schema?: Record<string, any> | null;
    gcs_access_token?: string | null;
    invoice?: boolean | null;
    language?: string | null;
}

export interface KolosalOCRResponse {
    // The response structure wasn't fully detailed in the example beyond "OCR processing successful" and null,
    // but typically it would return the extracted data.
    // We'll use `any` for now or a generic structure if we can infer it.
    // Based on "Advanced AI-powered OCR service for intelligent document processing with structured data extraction",
    // it likely returns a JSON object matching the schema.
    [key: string]: any;
}

export interface KolosalChatCompletionRequest {
    messages: {
        content: string;
        role: "user" | "assistant" | "system";
    }[];
    model: string;
    max_tokens?: number | null;
}

export interface KolosalChatCompletionResponse {
    choices: {
        finish_reason: string;
        index: number;
        logprobs: any | null;
        message: {
            content: string;
            refusal: any | null;
            role: string;
            tool_calls?: any[];
        };
    }[];
    created: number;
    id: string;
    model: string;
    object: string;
    service_tier?: string;
    system_fingerprint?: any | null;
    usage: {
        completion_tokens: number;
        completion_tokens_details?: any;
        prompt_tokens: number;
        prompt_tokens_details?: any;
        total_tokens: number;
    };
}

export interface KolosalErrorResponse {
    error: string;
    details?: any;
}
