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
}
