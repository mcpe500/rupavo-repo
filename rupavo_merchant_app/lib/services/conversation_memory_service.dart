import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rupavo_merchant_app/screens/onboarding_screen.dart';

// Custom class untuk context summary
class ContextSummary {
  final String role = 'system';
  final String content;

  ContextSummary({required this.content});
}

class ConversationMemoryService {
  final _supabase = Supabase.instance.client;

  // Token limits
  static const int maxContextTokens = 3000;
  static const int summaryThreshold = 2500;

  /// Load conversation history dengan smart memory management
  Future<List<ChatMessage>> loadConversationContext({
    required String shopId,
    required String threadId,
  }) async {
    try {
      final response = await _supabase
          .from('ai_conversations')
          .select()
          .eq('shop_id', shopId)
          .eq('thread_id', threadId)
          .order('created_at', ascending: false)
          .limit(50);

      final messages = (response as List)
          .map((msg) => ChatMessage(
                role: _parseRole(msg['role']),
                content: msg['content'],
              ))
          .toList()
          .reversed
          .toList();

      int totalTokens = _estimateTokenCount(messages);

      if (totalTokens > summaryThreshold) {
        final summaryMsg = await _supabase
            .from('ai_conversations')
            .select()
            .eq('shop_id', shopId)
            .eq('thread_id', threadId)
            .eq('is_summary', true)
            .order('created_at', ascending: false)
            .limit(1);

        if (summaryMsg.isNotEmpty) {
          messages.insert(
            0,
            ChatMessage(
              role: ChatRole.system,
              content:
                  'CONTEXT:\n${summaryMsg[0]['summary']}\n---\nLanjutkan percakapan.',
            ),
          );
        }

        return _optimizeContextWindow(messages);
      }

      return messages;
    } catch (e) {
      print('Error loading context: $e');
      return [];
    }
  }

  /// Optimize context window
  List<ChatMessage> _optimizeContextWindow(List<ChatMessage> messages) {
    final result = <ChatMessage>[];
    int tokenCount = 0;

    // Keep system message if exists
    if (messages.isNotEmpty && messages[0].role == ChatRole.system) {
      result.add(messages[0]);
      tokenCount += _estimateMessageTokens(messages[0]);
    }

    // Add recent messages backwards
    for (int i = messages.length - 1;
        i >= (messages.isNotEmpty && messages[0].role == ChatRole.system ? 1 : 0);
        i--) {
      final msgTokens = _estimateMessageTokens(messages[i]);
      if (tokenCount + msgTokens <= maxContextTokens) {
        result.insert(messages[0].role == ChatRole.system ? 1 : 0, messages[i]);
        tokenCount += msgTokens;
      } else {
        break;
      }
    }

    return result;
  }

  /// Save message to database
  Future<void> saveMessage({
    required String shopId,
    required String threadId,
    required ChatMessage message,
    String? userId,
  }) async {
    try {
      await _supabase.from('ai_conversations').insert({
        'shop_id': shopId,
        'thread_id': threadId,
        'user_id': userId,
        'role': _roleToString(message.role),
        'content': message.content,
        'token_count': _estimateMessageTokens(message),
        'is_summary': message.role == ChatRole.system &&
            message.content.contains('CONTEXT:'),
      });
    } catch (e) {
      print('Error saving message: $e');
    }
  }

  /// Estimate message tokens (rough)
  int _estimateMessageTokens(ChatMessage message) {
    return (message.content.length / 4).ceil();
  }

  /// Estimate total tokens
  int _estimateTokenCount(List<ChatMessage> messages) {
    return messages.fold(0, (sum, msg) => sum + _estimateMessageTokens(msg));
  }

  /// Parse role from string
  ChatRole _parseRole(String role) {
    switch (role) {
      case 'user':
        return ChatRole.user;
      case 'system':
        return ChatRole.system;
      default:
        return ChatRole.assistant;
    }
  }

  /// Convert role to string
  String _roleToString(ChatRole role) {
    switch (role) {
      case ChatRole.user:
        return 'user';
      case ChatRole.system:
        return 'system';
      case ChatRole.assistant:
        return 'assistant';
    }
  }

  /// Get context stats
  Future<Map<String, dynamic>> getContextStats({
    required String shopId,
    required String threadId,
  }) async {
    try {
      final messages = await loadConversationContext(
        shopId: shopId,
        threadId: threadId,
      );

      return {
        'messageCount': messages.length,
        'estimatedTokens': _estimateTokenCount(messages),
        'maxAllowed': maxContextTokens,
        'needsOptimization': _estimateTokenCount(messages) > summaryThreshold,
      };
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  /// Create summary
  Future<void> createConversationSummary({
    required String shopId,
    required String threadId,
    required String summary,
  }) async {
    try {
      await _supabase.from('ai_conversations').insert({
        'shop_id': shopId,
        'thread_id': threadId,
        'role': 'system',
        'content': 'CONTEXT:\n$summary',
        'summary': summary,
        'is_summary': true,
      });
    } catch (e) {
      print('Error creating summary: $e');
    }
  }

  // ============================================================
  // NEW: Chat History Management Features
  // ============================================================

  /// Get all conversation threads for a shop
  Future<List<ConversationThread>> getConversationThreads({
    required String shopId,
  }) async {
    try {
      final response = await _supabase
          .from('ai_conversations')
          .select('thread_id, created_at, content, role')
          .eq('shop_id', shopId)
          .order('created_at', ascending: false);

      // Group by thread_id
      final Map<String, ConversationThread> threadMap = {};
      
      for (final msg in response) {
        final threadId = msg['thread_id'] as String;
        if (!threadMap.containsKey(threadId)) {
          threadMap[threadId] = ConversationThread(
            threadId: threadId,
            lastMessage: msg['content'] as String,
            lastMessageTime: DateTime.parse(msg['created_at'] as String),
            messageCount: 1,
          );
        } else {
          threadMap[threadId] = threadMap[threadId]!.copyWith(
            messageCount: threadMap[threadId]!.messageCount + 1,
          );
        }
      }

      return threadMap.values.toList();
    } catch (e) {
      print('Error getting threads: $e');
      return [];
    }
  }

  /// Search messages by keyword
  Future<List<SearchResult>> searchMessages({
    required String shopId,
    required String query,
  }) async {
    try {
      final response = await _supabase
          .from('ai_conversations')
          .select()
          .eq('shop_id', shopId)
          .ilike('content', '%$query%')
          .order('created_at', ascending: false)
          .limit(50);

      return (response as List).map((msg) => SearchResult(
        messageId: msg['id'] as String,
        threadId: msg['thread_id'] as String,
        role: _parseRole(msg['role'] as String),
        content: msg['content'] as String,
        createdAt: DateTime.parse(msg['created_at'] as String),
        highlightedContent: _highlightQuery(msg['content'] as String, query),
      )).toList();
    } catch (e) {
      print('Error searching messages: $e');
      return [];
    }
  }

  String _highlightQuery(String content, String query) {
    return content.replaceAll(
      RegExp(query, caseSensitive: false),
      '**$query**',
    );
  }

  /// Delete a single message
  Future<bool> deleteMessage({required String messageId}) async {
    try {
      await _supabase
          .from('ai_conversations')
          .delete()
          .eq('id', messageId);
      return true;
    } catch (e) {
      print('Error deleting message: $e');
      return false;
    }
  }

  /// Delete entire conversation thread
  Future<bool> deleteThread({
    required String shopId,
    required String threadId,
  }) async {
    try {
      await _supabase
          .from('ai_conversations')
          .delete()
          .eq('shop_id', shopId)
          .eq('thread_id', threadId);
      return true;
    } catch (e) {
      print('Error deleting thread: $e');
      return false;
    }
  }

  /// Clear all conversations for a shop
  Future<bool> clearAllConversations({required String shopId}) async {
    try {
      await _supabase
          .from('ai_conversations')
          .delete()
          .eq('shop_id', shopId);
      return true;
    } catch (e) {
      print('Error clearing conversations: $e');
      return false;
    }
  }

  /// Get all messages for export
  Future<List<Map<String, dynamic>>> exportConversations({
    required String shopId,
    String? threadId,
  }) async {
    try {
      // Build filter first, then order
      var filter = _supabase
          .from('ai_conversations')
          .select()
          .eq('shop_id', shopId);

      if (threadId != null) {
        filter = filter.eq('thread_id', threadId);
      }

      final response = await filter.order('created_at', ascending: true);
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      print('Error exporting conversations: $e');
      return [];
    }
  }

  /// Extract AI knowledge summary from conversations
  Future<AiKnowledgeSummary> extractAiKnowledge({
    required String shopId,
  }) async {
    try {
      final messages = await _supabase
          .from('ai_conversations')
          .select('content, role')
          .eq('shop_id', shopId)
          .order('created_at', ascending: true);

      String shopName = '';
      String businessType = '';
      List<String> products = [];
      List<String> preferences = [];
      
      for (final msg in messages) {
        final content = (msg['content'] as String).toLowerCase();
        
        // Extract shop name mentions
        if (content.contains('nama toko') || content.contains('toko')) {
          final match = RegExp(r'(?:nama toko|toko[:\s]+)([^\n,]+)', caseSensitive: false)
              .firstMatch(msg['content'] as String);
          if (match != null && shopName.isEmpty) {
            shopName = match.group(1)?.trim() ?? '';
          }
        }

        // Extract business type
        if (content.contains('fnb') || content.contains('makanan') || content.contains('minuman')) {
          businessType = 'FNB';
        } else if (content.contains('retail') || content.contains('toko')) {
          businessType = businessType.isEmpty ? 'Retail' : businessType;
        } else if (content.contains('jasa') || content.contains('service')) {
          businessType = businessType.isEmpty ? 'Jasa' : businessType;
        }

        // Extract products
        if (content.contains('produk') || content.contains('menu') || content.contains('item')) {
          final productMatch = RegExp(r'(?:produk|menu|item)[:\s]+([^\n]+)', caseSensitive: false)
              .firstMatch(msg['content'] as String);
          if (productMatch != null) {
            products.add(productMatch.group(1)?.trim() ?? '');
          }
        }

        // Extract price mentions
        if (content.contains('harga') || content.contains('rp')) {
          final priceMatch = RegExp(r'(?:harga|rp)[:\s]*(\d+)', caseSensitive: false)
              .firstMatch(msg['content'] as String);
          if (priceMatch != null) {
            preferences.add('Harga: Rp ${priceMatch.group(1)}');
          }
        }
      }

      return AiKnowledgeSummary(
        shopName: shopName,
        businessType: businessType,
        products: products.take(10).toList(),
        preferences: preferences.take(5).toList(),
        totalMessages: messages.length,
      );
    } catch (e) {
      print('Error extracting knowledge: $e');
      return AiKnowledgeSummary(
        shopName: '',
        businessType: '',
        products: [],
        preferences: [],
        totalMessages: 0,
      );
    }
  }
}

// ============================================================
// Data Classes
// ============================================================

class ConversationThread {
  final String threadId;
  final String lastMessage;
  final DateTime lastMessageTime;
  final int messageCount;

  ConversationThread({
    required this.threadId,
    required this.lastMessage,
    required this.lastMessageTime,
    required this.messageCount,
  });

  ConversationThread copyWith({
    String? threadId,
    String? lastMessage,
    DateTime? lastMessageTime,
    int? messageCount,
  }) {
    return ConversationThread(
      threadId: threadId ?? this.threadId,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageTime: lastMessageTime ?? this.lastMessageTime,
      messageCount: messageCount ?? this.messageCount,
    );
  }
}

class SearchResult {
  final String messageId;
  final String threadId;
  final ChatRole role;
  final String content;
  final DateTime createdAt;
  final String highlightedContent;

  SearchResult({
    required this.messageId,
    required this.threadId,
    required this.role,
    required this.content,
    required this.createdAt,
    required this.highlightedContent,
  });
}

class AiKnowledgeSummary {
  final String shopName;
  final String businessType;
  final List<String> products;
  final List<String> preferences;
  final int totalMessages;

  AiKnowledgeSummary({
    required this.shopName,
    required this.businessType,
    required this.products,
    required this.preferences,
    required this.totalMessages,
  });
}
