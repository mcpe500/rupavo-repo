import 'dart:convert';
import 'package:rupavo_merchant_app/models/product_preview.dart';

class ToolCallParser {
  /// Parse tool call dari AI response
  /// Mendeteksi JSON dalam format: { "tool": "...", "args": {...} }
  static Map<String, dynamic>? parseToolCall(String content) {
    try {
      // Cari JSON pattern dalam string
      final regex = RegExp(
        r'\{[\s\n]*"tool"\s*:\s*"([^"]+)"[\s\n]*,[\s\n]*"args"\s*:\s*({.*?})[\s\n]*\}',
        dotAll: true,
      );

      final match = regex.firstMatch(content);
      if (match != null) {
        final tool = match.group(1);
        final argsJson = match.group(2);

        if (tool != null && argsJson != null) {
          final args = jsonDecode(argsJson);
          return {
            'tool': tool,
            'args': args,
          };
        }
      }

      return null;
    } catch (e) {
      print('Error parsing tool call: $e');
      return null;
    }
  }

  /// Extract product preview dari tool args
  static ProductPreview? extractProductPreview(Map<String, dynamic> toolCall) {
    try {
      final tool = toolCall['tool'];
      final args = toolCall['args'] as Map<String, dynamic>;

      if (tool == 'add_product') {
        return ProductPreview.fromJson(args);
      }

      return null;
    } catch (e) {
      print('Error extracting product preview: $e');
      return null;
    }
  }

  /// Check if response contains a tool call
  static bool hasToolCall(String content) {
    return parseToolCall(content) != null;
  }

  /// Get tool type from response
  static String? getToolType(String content) {
    final toolCall = parseToolCall(content);
    return toolCall?['tool'] as String?;
  }
}
