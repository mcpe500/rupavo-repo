// =============================================================================
// Kolosal AI API Types - Auto-generated from OpenAPI 3.1.0 Spec
// =============================================================================

// -----------------------------------------------------------------------------
// Common Types
// -----------------------------------------------------------------------------

export interface ErrorResponse {
    error: string;
    message: string;
}

export interface AuthenticationErrorResponse {
    error: string;
    message: string;
    hint?: string;
}

export interface ErrResp {
    detail: string;
}

// -----------------------------------------------------------------------------
// Health Types
// -----------------------------------------------------------------------------

export interface SecureHealthResponse {
    status: string;
    timestamp: string;
}

export interface DetailedHealthResponse {
    status: string;
    version: string;
    timestamp: string;
    uptime_seconds: number;
    memory_usage_mb: number;
}

export interface HealthResp {
    status: string;
    model_loaded: boolean;
    device: string;
    version: string;
}

// -----------------------------------------------------------------------------
// OCR Types
// -----------------------------------------------------------------------------

export interface JsonSchema {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
}

export interface OcrRequest {
    image_data: string; // Base64 encoded image/PDF data OR GCS URL
    auto_fix?: boolean | null;
    custom_schema?: JsonSchema | null;
    gcs_access_token?: string | null;
    invoice?: boolean | null;
    language?: string | null;
}

export interface OcrFormRequest {
    image: File | Blob;
    custom_schema?: string | null;
    gcs_access_token?: string | null;
    gcs_url?: string | null;
    invoice?: boolean | null;
    language?: string | null;
}

export interface InvoiceItem {
    description: string;
    total: string;
}

export interface ProcessedInvoiceItem {
    description: string;
    quantity: number | null;
    unit_price: number | null;
    total: number;
    original_text: string | null;
}

export interface DataValidation {
    totals_match: boolean;
    calculated_total: number;
    difference: number;
    invoice_items_count: number;
    items_with_totals: number;
    stated_total?: number | null;
    validation_notes: string[];
}

export interface Party {
    name: string | null;
    address: string | null;
    tax_id: string | null;
}

export interface OCRResult {
    invoice_items: ProcessedInvoiceItem[];
    extracted_text: string;
    confidence_score: number;
    notes: string[];
    processing_time: number;
    verification_performed: boolean;
    currency?: string | null;
    data_validation?: DataValidation | null;
    discount?: number | null;
    invoice_date?: string | null;
    invoice_number?: string | null;
    seller?: Party | null;
    buyer?: Party | null;
    subtotal?: number | null;
    tax?: number | null;
    total?: number | null;
}

// -----------------------------------------------------------------------------
// Chat Types
// -----------------------------------------------------------------------------

export interface ChatMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string | null;
    name?: string | null;
    tool_call_id?: string | null;
    tool_calls?: ChatToolCall[] | null;
}

export interface ChatToolCall {
    id: string;
    type: string;
    function: ChatFunctionCall;
}

export interface ChatFunctionCall {
    name: string;
    arguments: string;
}

export interface ChatFunction {
    name: string;
    description?: string | null;
    parameters?: Record<string, unknown> | null;
}

export interface ChatTool {
    type: string;
    function: ChatFunction;
}

export interface ChatToolChoiceFunction {
    name: string;
}

export type ChatToolChoice =
    | string
    | { type: string; function: ChatToolChoiceFunction };

export interface ChatResponseFormat {
    type: string;
    json_schema?: JsonSchemaDefinition | null;
}

export interface JsonSchemaDefinition {
    name: string;
    schema: Record<string, unknown>;
    strict?: boolean | null;
}

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    model: string;
    max_tokens?: number | null;
    temperature?: number | null;
    top_p?: number | null;
    n?: number | null;
    stream?: boolean | null;
    stop?: string | string[] | null;
    presence_penalty?: number | null;
    frequency_penalty?: number | null;
    tools?: ChatTool[] | null;
    tool_choice?: ChatToolChoice | null;
    response_format?: ChatResponseFormat | null;
}

export interface ChatResponseMessage {
    role: string;
    content: string | null;
    refusal?: string | null;
    tool_calls?: ChatToolCall[] | null;
}

export interface ChatChoice {
    index: number;
    message: ChatResponseMessage;
    finish_reason: string;
    logprobs?: unknown | null;
}

export interface ChatPromptTokensDetails {
    audio_tokens: number;
    cached_tokens: number;
}

export interface ChatCompletionTokensDetails {
    reasoning_tokens: number;
    audio_tokens: number;
    accepted_prediction_tokens: number;
    rejected_prediction_tokens: number;
}

export interface ChatUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: ChatPromptTokensDetails | null;
    completion_tokens_details?: ChatCompletionTokensDetails | null;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChatChoice[];
    usage: ChatUsage;
    service_tier?: string | null;
    system_fingerprint?: string | null;
}

export interface ChatCompletionError {
    error: ChatErrorDetails;
}

export interface ChatErrorDetails {
    message: string;
    type: string;
    param?: string | null;
    code?: string | null;
}

// -----------------------------------------------------------------------------
// Models Types
// -----------------------------------------------------------------------------

export interface ModelPricing {
    input: number;
    output: number;
    currency: string;
    unit: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    pricing: ModelPricing;
    contextSize: number;
    lastUpdated: string;
}

export interface ModelsListResponse {
    models: ModelInfo[];
    count: number;
}

// -----------------------------------------------------------------------------
// Agent Types
// -----------------------------------------------------------------------------

export interface MessageReq {
    type: string;
    content?: string | null;
    name?: string | null;
    arguments?: unknown;
}

export interface AgentRequest {
    input: string;
    model: string;
    workspace_id: string;
    history?: MessageReq[] | null;
    tools?: string[] | null;
}

export interface UsageInfo {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens?: number | null;
    thinking_tokens?: number | null;
}

export interface AgentResponse {
    output: string;
    model: string;
    usage: UsageInfo;
}

export interface StatsInfo {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_tokens_processed: number;
    active_streams: number;
    success_rate: number;
}

export interface StatsResponse {
    healthy: boolean;
    stats: StatsInfo;
}

export interface ToolsResponse {
    tools: string[] | null;
}

// -----------------------------------------------------------------------------
// Object Detection / Segmentation Types
// -----------------------------------------------------------------------------

export interface CacheStatsResp {
    size: number;
    hits: number;
    misses: number;
}

export interface CacheClearResp {
    success: boolean;
    message: string;
}

export interface StatsResp {
    total_requests: number;
    avg_processing_time_ms: number;
}

export interface SegmentParams {
    prompts: string[];
    threshold?: number;
    return_masks?: boolean;
    return_annotated?: boolean;
}

export interface SegmentFile extends SegmentParams {
    file: File | Blob;
}

export interface SegmentJsonRequest extends SegmentParams {
    image: string; // Base64 encoded
}

export interface SegmentMask {
    width: number;
    height: number;
    png_base64?: string | null;
}

export interface SegmentResult {
    name: string;
    confidence: number;
    bbox: number[];
    mask: SegmentMask;
}

export interface SegmentResponse {
    success: boolean;
    prompts_used: string[];
    image_size: number[];
    processing_time_ms: number;
    results: SegmentResult[];
    annotated_image?: string | null;
}

// -----------------------------------------------------------------------------
// Workspace Types
// -----------------------------------------------------------------------------

export type WorkspaceType = "personal" | "team" | "project";
export type CategoryType = "Business" | "Technical";
export type DeploymentStatus =
    | "Building"
    | "Deploying"
    | "Success"
    | "Failed"
    | "Crashed"
    | "Removed"
    | "Waiting"
    | "Skipped";

export interface WorkspaceSettings {
    auto_save: boolean;
    shared_resources: boolean;
    max_file_size_mb: number;
    allowed_file_types: string[];
    agent_timeout_seconds: number;
    python_environment?: string | null;
    custom_config?: Record<string, unknown>;
}

export interface GitHubRepoConfig {
    repo_url: string;
    branch?: string | null;
    oauth_token?: string | null;
}

export interface Workspace {
    id: string;
    user_id: string;
    name: string;
    workspace_type: WorkspaceType;
    is_active: boolean;
    storage_used_mb: number;
    description?: string | null;
    settings?: WorkspaceSettings | null;
    created_at?: string | null;
    updated_at?: string | null;
    last_accessed?: string | null;
    filesystem_path?: string | null;
    railway_service_id?: string | null;
    railway_deployment_url?: string | null;
    status?: string | null;
    score?: number | null;
    feature_count?: number | null;
    estimated_cost?: number | null;
    timeline_minutes?: number | null;
    currency?: string | null;
}

export interface WorkspaceListResponse {
    workspaces: Workspace[];
    total_count: number;
    user_id: string;
}

export interface WorkspaceResponse {
    workspace: Workspace;
}

export interface WorkspaceOrderResponse {
    order: string[];
    user_id: string;
}

export interface WorkspaceStatsResponse {
    user_id: string;
    total_workspaces: number;
    max_workspaces: number;
    remaining_slots: number;
    allowed_types: WorkspaceType[];
}

export interface OrderingStats {
    workspace_order_count: number;
    category_order_count: number;
    feature_order_count: number;
}

export interface WorkspaceStatus {
    workspace_id: string;
    workspace_name: string;
    is_active: boolean;
    deployment_status: DeploymentStatus;
    deployment_url?: string | null;
    created_at?: string | null;
    last_accessed?: string | null;
    last_deployed_at?: string | null;
}

export interface WorkspaceStatusResponse {
    status: WorkspaceStatus;
}

export interface WorkspaceError {
    error: string;
    message: string;
    workspace_id?: string | null;
}

export interface DeleteWorkspaceResponse {
    success: boolean;
    message: string;
    workspace_id: string;
}

export interface CreateWorkspaceRequest {
    name: string;
    workspace_type: WorkspaceType;
    description?: string | null;
    settings?: WorkspaceSettings | null;
    github_repo?: GitHubRepoConfig | null;
}

export interface UpdateWorkspaceRequest {
    name?: string | null;
    description?: string | null;
    workspace_type?: WorkspaceType | null;
    is_active?: boolean | null;
    settings?: WorkspaceSettings | null;
}

export interface UpdateWorkspaceOrderRequest {
    order: string[];
}

// -----------------------------------------------------------------------------
// Category Types
// -----------------------------------------------------------------------------

export interface Category {
    category_id: string;
    workspace_id: string;
    category_name: string;
    category_type: CategoryType;
    category_description?: string | null;
    category_score?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface CategoryListResponse {
    categories: Category[];
    total_count: number;
    workspace_id: string;
}

export interface CategoryResponse {
    category: Category;
}

export interface CategoryOrderResponse {
    order: string[];
    workspace_id: string;
}

export interface CreateCategoryRequest {
    workspace_id: string;
    category_name: string;
    category_type: CategoryType;
    category_description?: string | null;
    category_score?: number | null;
}

export interface UpdateCategoryRequest {
    category_name?: string | null;
    category_type?: CategoryType | null;
    category_description?: string | null;
    category_score?: number | null;
}

export interface UpdateCategoryOrderRequest {
    workspace_id: string;
    order: string[];
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    id: string;
}

// -----------------------------------------------------------------------------
// Feature Types
// -----------------------------------------------------------------------------

export interface Feature {
    feature_id: string;
    feature_name: string;
    category_id?: string | null;
    feature_description?: string | null;
    feature_score?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface FeatureListResponse {
    features: Feature[];
    total_count: number;
    category_id?: string | null;
}

export interface FeatureResponse {
    feature: Feature;
}

export interface FeatureOrderResponse {
    category_id: string;
    order: string[];
}

export interface CreateFeatureRequest {
    feature_name: string;
    category_id?: string | null;
    feature_description?: string | null;
    feature_score?: number | null;
}

export interface UpdateFeatureRequest {
    feature_name?: string | null;
    category_id?: string | null;
    feature_description?: string | null;
    feature_score?: number | null;
}

export interface UpdateFeatureOrderRequest {
    category_id: string;
    order: string[];
}

// -----------------------------------------------------------------------------
// Proxy Request/Response Types (for Supabase Edge Function)
// -----------------------------------------------------------------------------

export type KolosalAction =
    // Health
    | "health"
    | "health.detailed"
    // OCR
    | "ocr"
    | "ocr.form"
    // Chat
    | "chat.completions"
    // Models
    | "models.list"
    // Agent
    | "agent.generate"
    | "agent.generate.stream"
    | "agent.stats"
    | "agent.tools"
    // Object Detection
    | "detect.health"
    | "detect.stats"
    | "cache.stats"
    | "cache.clear"
    | "segment"
    | "segment.base64"
    // Workspace
    | "workspaces.list"
    | "workspaces.create"
    | "workspaces.get"
    | "workspaces.update"
    | "workspaces.delete"
    | "workspaces.order.get"
    | "workspaces.order.update"
    | "workspaces.order.stats"
    | "workspaces.stats"
    | "workspaces.status"
    // Categories
    | "categories.list"
    | "categories.create"
    | "categories.get"
    | "categories.update"
    | "categories.delete"
    | "categories.order.get"
    | "categories.order.update"
    // Features
    | "features.list"
    | "features.create"
    | "features.get"
    | "features.update"
    | "features.delete"
    | "features.order.get"
    | "features.order.update";

export type KolosalProxyRequest =
    // Health
    | { action: "health"; data?: undefined }
    | { action: "health.detailed"; data?: undefined }
    // OCR
    | { action: "ocr"; data: OcrRequest }
    | { action: "ocr.form"; data?: Record<string, unknown> } // Form data is special
    // Chat
    | { action: "chat.completions"; data: ChatCompletionRequest }
    // Models
    | { action: "models.list"; data?: undefined }
    // Agent
    | { action: "agent.generate"; data: AgentRequest }
    | { action: "agent.generate.stream"; data: AgentRequest }
    | { action: "agent.stats"; data?: undefined }
    | { action: "agent.tools"; data?: undefined }
    // Object Detection
    | { action: "detect.health"; data?: undefined }
    | { action: "detect.stats"; data?: undefined }
    | { action: "cache.stats"; data?: undefined }
    | { action: "cache.clear"; data?: undefined }
    | { action: "segment"; data?: Record<string, unknown> } // Form data
    | { action: "segment.base64"; data: SegmentJsonRequest }
    // Workspaces
    | { action: "workspaces.list"; data?: undefined }
    | { action: "workspaces.create"; data: CreateWorkspaceRequest }
    | { action: "workspaces.get"; workspace_id: string; data?: undefined }
    | { action: "workspaces.update"; workspace_id: string; data: UpdateWorkspaceRequest }
    | { action: "workspaces.delete"; workspace_id: string; data?: undefined }
    | { action: "workspaces.order.get"; data?: undefined }
    | { action: "workspaces.order.update"; data: UpdateWorkspaceOrderRequest }
    | { action: "workspaces.order.stats"; data?: undefined }
    | { action: "workspaces.stats"; data?: undefined }
    | { action: "workspaces.status"; workspace_id: string; data?: undefined }
    // Categories
    | { action: "categories.list"; workspace_id: string; data?: undefined }
    | { action: "categories.create"; workspace_id: string; data: CreateCategoryRequest }
    | { action: "categories.get"; workspace_id: string; category_id: string; data?: undefined }
    | { action: "categories.update"; workspace_id: string; category_id: string; data: UpdateCategoryRequest }
    | { action: "categories.delete"; workspace_id: string; category_id: string; data?: undefined }
    | { action: "categories.order.get"; workspace_id: string; data?: undefined }
    | { action: "categories.order.update"; workspace_id: string; data: UpdateCategoryOrderRequest }
    // Features
    | { action: "features.list"; workspace_id: string; category_id: string; data?: undefined }
    | { action: "features.create"; workspace_id: string; category_id: string; data: CreateFeatureRequest }
    | { action: "features.get"; workspace_id: string; category_id: string; feature_id: string; data?: undefined }
    | { action: "features.update"; workspace_id: string; category_id: string; feature_id: string; data: UpdateFeatureRequest }
    | { action: "features.delete"; workspace_id: string; category_id: string; feature_id: string; data?: undefined }
    | { action: "features.order.get"; workspace_id: string; category_id: string; data?: undefined }
    | { action: "features.order.update"; workspace_id: string; category_id: string; data: UpdateFeatureOrderRequest };

export interface KolosalProxyResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
