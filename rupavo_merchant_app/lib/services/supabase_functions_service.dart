import 'package:supabase_flutter/supabase_flutter.dart';
import 'logger_service.dart';

/// Service for calling Supabase Edge Functions
class SupabaseFunctionsService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // ===========================================================================
  // AI Chat Business Coach
  // ===========================================================================

  /// Chat with Rupavo AI business coach
  Future<ChatResponse> chatWithRupavo({
    required String shopId,
    required String message,
    String? sessionId,
    List<Map<String, String>>? history, // Conversation history for context
  }) async {
    LoggerService.info('🤖 AI Chat Request: shopId=$shopId, sessionId=$sessionId');
    LoggerService.debug('Message: $message');

    try {
      final response = await _supabase.functions.invoke(
        'ai-chat-business-coach',
        body: {
          'shop_id': shopId,
          'message': message,
          if (sessionId != null) 'session_id': sessionId,
          if (history != null) 'history': history,
        },
      );

      LoggerService.info('🤖 AI Chat Response Status: ${response.status}');

      if (response.status != 200) {
        throw Exception(response.data?['error'] ?? 'Failed to chat with Rupavo');
      }
      
      final data = response.data as Map<String, dynamic>;
      // LoggerService.debug('Response Data: $data'); // Optional: verbose
      return ChatResponse.fromJson(data);
    
    } catch (e, stack) {
      LoggerService.error('❌ AI Chat failed', e, stack);
      rethrow;
    }
  }

  // ===========================================================================
  // AI Generate Product Copy
  // ===========================================================================

  /// Generate product name, description, and tagline with AI
  Future<ProductCopyResponse> generateProductCopy({
    required String shopId,
    required String baseName,
    String? baseDescription,
    String? category,
    double? price,
  }) async {
    LoggerService.info('🛍️ Generating Copy: $baseName (Shop: $shopId)');

    try {
      final response = await _supabase.functions.invoke(
        'ai-generate-product-copy',
        body: {
          'shop_id': shopId,
          'base_name': baseName,
          if (baseDescription != null) 'base_description': baseDescription,
          if (category != null) 'category': category,
          if (price != null) 'price': price,
        },
      );

      LoggerService.info('🛍️ Copy Generation Status: ${response.status}');

      if (response.status != 200) {
        throw Exception(response.data?['error'] ?? 'Failed to generate product copy');
      }

      return ProductCopyResponse.fromJson(response.data as Map<String, dynamic>);
    } catch (e, stack) {
      LoggerService.error('❌ Copy generation failed', e, stack);
      rethrow;
    }
  }

  // ===========================================================================
  // AI Generate Report
  // ===========================================================================

  /// Generate business report with AI insights
  Future<ReportResponse> generateReport({
    required String shopId,
    required ReportPeriod period,
    String? startDate,
    String? endDate,
  }) async {
    LoggerService.info('📊 Generating Report: $period (Shop: $shopId)');

    try {
      final response = await _supabase.functions.invoke(
        'ai-generate-report',
        body: {
          'shop_id': shopId,
          'period': period.name,
          if (startDate != null) 'start_date': startDate,
          if (endDate != null) 'end_date': endDate,
        },
      );

      LoggerService.info('📊 Report Generation Status: ${response.status}');

      if (response.status != 200) {
        throw Exception(response.data?['error'] ?? 'Failed to generate report');
      }

      return ReportResponse.fromJson(response.data as Map<String, dynamic>);
    } catch (e, stack) {
      LoggerService.error('❌ Report generation failed', e, stack);
      rethrow;
    }
  }
}

// =============================================================================
// Response Models
// =============================================================================

enum ReportPeriod { today, days7, days30, custom }

class ChatResponse {
  final bool success;
  final String? reply;
  final String? sessionId;
  final String? error;
  final String? action; // e.g., 'shop_created', 'product_added'
  final Map<String, dynamic>? data;

  ChatResponse({
    required this.success,
    this.reply,
    this.sessionId,
    this.error,
    this.action,
    this.data,
  });

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    return ChatResponse(
      success: json['success'] as bool,
      reply: json['reply'] as String?,
      sessionId: json['session_id'] as String?,
      error: json['error'] as String?,
      action: json['action'] as String?,
      data: json['data'] as Map<String, dynamic>?,
    );
  }
}

class ProductCopyResponse {
  final bool success;
  final ProductCopy? data;
  final String? error;

  ProductCopyResponse({
    required this.success,
    this.data,
    this.error,
  });

  factory ProductCopyResponse.fromJson(Map<String, dynamic> json) {
    return ProductCopyResponse(
      success: json['success'] as bool,
      data: json['data'] != null
          ? ProductCopy.fromJson(json['data'] as Map<String, dynamic>)
          : null,
      error: json['error'] as String?,
    );
  }
}

class ProductCopy {
  final String name;
  final String description;
  final String tagline;

  ProductCopy({
    required this.name,
    required this.description,
    required this.tagline,
  });

  factory ProductCopy.fromJson(Map<String, dynamic> json) {
    return ProductCopy(
      name: json['name'] as String,
      description: json['description'] as String,
      tagline: json['tagline'] as String,
    );
  }
}

class ReportResponse {
  final bool success;
  final ReportData? data;
  final String? error;

  ReportResponse({
    required this.success,
    this.data,
    this.error,
  });

  factory ReportResponse.fromJson(Map<String, dynamic> json) {
    return ReportResponse(
      success: json['success'] as bool,
      data: json['data'] != null
          ? ReportData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
      error: json['error'] as String?,
    );
  }
}

class ReportData {
  final ReportMetrics metrics;
  final String narrative;
  final List<String> actionItems;

  ReportData({
    required this.metrics,
    required this.narrative,
    required this.actionItems,
  });

  factory ReportData.fromJson(Map<String, dynamic> json) {
    return ReportData(
      metrics: ReportMetrics.fromJson(json['metrics'] as Map<String, dynamic>),
      narrative: json['narrative'] as String,
      actionItems: (json['action_items'] as List).cast<String>(),
    );
  }
}

class ReportMetrics {
  final double totalRevenue;
  final int totalOrders;
  final int completedOrders;
  final int cancelledOrders;
  final double averageOrderValue;
  final List<TopProduct> topProducts;

  ReportMetrics({
    required this.totalRevenue,
    required this.totalOrders,
    required this.completedOrders,
    required this.cancelledOrders,
    required this.averageOrderValue,
    required this.topProducts,
  });

  factory ReportMetrics.fromJson(Map<String, dynamic> json) {
    return ReportMetrics(
      totalRevenue: (json['total_revenue'] as num).toDouble(),
      totalOrders: json['total_orders'] as int,
      completedOrders: json['completed_orders'] as int,
      cancelledOrders: json['cancelled_orders'] as int,
      averageOrderValue: (json['average_order_value'] as num).toDouble(),
      topProducts: (json['top_products'] as List)
          .map((e) => TopProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class TopProduct {
  final String name;
  final int quantity;
  final double revenue;

  TopProduct({
    required this.name,
    required this.quantity,
    required this.revenue,
  });

  factory TopProduct.fromJson(Map<String, dynamic> json) {
    return TopProduct(
      name: json['name'] as String,
      quantity: json['quantity'] as int,
      revenue: (json['revenue'] as num).toDouble(),
    );
  }
}
