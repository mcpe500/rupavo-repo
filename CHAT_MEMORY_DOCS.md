# Chat Memory & Context Management Documentation

## Overview
Implementasi chat history dengan memory management yang optimal untuk Business Coach di Rupavo. Sistem ini menyimpan dan mengakses riwayat percakapan sambil mengoptimalkan penggunaan token untuk API calls.

## Architecture

### 1. Database Schema
**Table: `ai_conversations`**
```sql
- id (UUID)
- shop_id (UUID) - Nullable untuk onboarding
- user_id (UUID) - Untuk tracking user
- thread_id (UUID) - Grouping percakapan
- role (enum: 'user', 'assistant', 'system')
- content (text) - Isi pesan
- token_count (integer) - Token count message ini
- cumulative_tokens (integer) - Total tokens hingga message ini
- is_summary (boolean) - Apakah ini summary
- summary (text) - Konten summary
- created_at (timestamp)
```

### 2. Client-Side (Flutter App)

#### ConversationMemoryService
Service di Flutter untuk manage conversation context:

```dart
class ConversationMemoryService {
  // Token limits
  static const int maxContextTokens = 3000;      // Total tokens allowed
  static const int summaryThreshold = 2500;      // Trigger optimization
  
  // Methods:
  - loadConversationContext()           // Load dengan optimization
  - saveMessage()                       // Save message ke DB
  - optimizeContextWindow()             // Smart windowing
  - getContextStats()                   // Debug info
  - createConversationSummary()         // Create summary
}
```

**Token Estimation:**
- Rough estimate: ~4 characters = 1 token
- Contoh: Pesan 200 karakter ≈ 50 tokens

**Context Window Strategy:**
1. Load recent 50 messages
2. Hitung total tokens
3. Jika > 2500 tokens:
   - Cari summary terbaru
   - Inject summary ke awal context
   - Potong pesan lama untuk fit ke limit
4. Return optimized context

### 3. Server-Side (Edge Function)

#### ai-chat-business-coach/index.ts
Deno Edge Function dengan memory optimization:

**Features:**
- Load conversation history dari Supabase
- Token counting dengan optimization
- Context windowing untuk efficient API calls
- Automatic summary injection
- Message persistence

**Flow:**
```
1. User sends message
2. Save user message to ai_conversations
3. Load conversation history (optimized)
4. Estimate token count
5. If tokens > threshold, use summary
6. Call AI API dengan optimized context
7. Save AI reply
8. Return response
```

## Token Optimization Strategy

### Calculation
```
Estimated Tokens = message.length / 4

Contoh:
- "Halo" = 1 token
- "Berapa harga produk ini?" = 6 tokens
- Full conversation context = sum of all messages
```

### Windowing Strategy
```
Max Context = 3000 tokens

Flow:
1. Count recent messages (descending order)
2. Keep adding while total <= 3000
3. Once limit hit, stop (skip older messages)
4. Result: Most recent N messages that fit limit
```

### Summary Mechanism
```
Saat context terlalu besar:
1. Ambil summary terbaru dari DB
2. Insert di awal context dengan header "CONTEXT:"
3. Summary berisi ringkasan percakapan sebelumnya
4. AI tetap aware dengan full context
5. Token count berkurang drastis
```

## Implementation Details

### ChatScreen (Flutter)
```dart
class _ChatScreenState extends State<ChatScreen> {
  late List<ChatMessage> _messages = [];
  late String _threadId;
  final ConversationMemoryService _memoryService = ConversationMemoryService();

  @override
  void initState() {
    _threadId = DateTime.now().millisecondsSinceEpoch.toString();
    _loadChatHistory();  // Load dari DB
  }

  Future<void> _loadChatHistory() async {
    final contextMessages = await _memoryService.loadConversationContext(
      shopId: widget.shopId,
      threadId: _threadId,
    );
    setState(() => _messages = contextMessages);
  }

  Future<void> _sendMessage() async {
    // 1. Save user message
    await _memoryService.saveMessage(
      shopId: widget.shopId,
      threadId: _threadId,
      message: userMessage,
    );
    
    // 2. Get AI response
    final response = await _functionsService.chatWithRupavo(...);
    
    // 3. Save AI response
    await _memoryService.saveMessage(
      shopId: widget.shopId,
      threadId: _threadId,
      message: assistantMessage,
    );
  }
}
```

### Edge Function (Deno)
```typescript
// Load optimized context
const conversationHistory = await loadOptimizedContext(shopId, threadId);

// Estimate tokens
const estimateTokens = (text: string) => Math.ceil(text.length / 4);
let contextTokenCount = conversationHistory.reduce(
  (sum, msg) => sum + estimateTokens(msg.content),
  0
);

// Optimize if needed
if (contextTokenCount > 2500) {
  // Use summary mechanism
}

// Build messages for API
const messages = [
  { role: "system", content: systemPrompt },
  ...conversationHistory,
  { role: "user", content: userMessage },
];

// Call AI API
const response = await fetch("https://api.kolosal.ai/v1/chat/completions", {
  body: JSON.stringify({ model: "Qwen 3 30BA3B", messages }),
});
```

## Performance Metrics

### Token Usage Optimization
| Scenario | Without Optimization | With Optimization | Savings |
|----------|---------------------|-------------------|---------|
| 100 messages (~5000 tokens) | 5000 tokens | ~2500 tokens | 50% |
| 50 messages (~2500 tokens) | 2500 tokens | ~2000 tokens | 20% |
| 20 messages (~1000 tokens) | 1000 tokens | ~1000 tokens | 0% |

### Database Queries
- Load history: 1 query (with limit 50)
- Find summary: 1 query (if context too large)
- Save message: 1 insert
- Total: 2-3 queries per request

## Future Enhancements

1. **Automatic Summarization**
   - Call Claude/GPT-4 untuk create AI-generated summaries
   - Trigger saat context > 4000 tokens
   - Store summary untuk reuse

2. **Session Management**
   - Track active sessions per user
   - Auto-cleanup old sessions
   - Session timeout mechanism

3. **Analytics**
   - Track token usage per conversation
   - Identify long conversations
   - Optimize based on patterns

4. **Cache Layer**
   - In-memory cache untuk active conversations
   - Reduce DB queries
   - Improve latency

## Troubleshooting

### Issue: "Context too large"
**Solution:** Increase `maxContextTokens` atau reduce `summaryThreshold`

### Issue: "Missing context for AI"
**Solution:** Check `thread_id` consistency, ensure `loadConversationContext` is called

### Issue: "Slow chat response"
**Solution:** Check DB query performance, consider increasing `limit` pada history fetch

## Configuration

```dart
// In ConversationMemoryService
static const int maxContextTokens = 3000;      // Adjust based on API limits
static const int summaryThreshold = 2500;      // When to trigger summary
static const int avgTokensPerMessage = 50;     // For estimation
```

```typescript
// In Edge Function
const maxContextTokens = 3000;
const estimateTokens = (text) => Math.ceil(text.length / 4);
```

## Related Files
- `lib/services/conversation_memory_service.dart` - Flutter service
- `lib/screens/chat_screen.dart` - Chat UI with history
- `supabase/functions/ai-chat-business-coach/index.ts` - Edge function
- `supabase/migrations/20251206170000_add_user_id_to_ai_conversations.sql` - Schema
- `supabase/migrations/20251206180000_add_conversation_metadata.sql` - Metadata
