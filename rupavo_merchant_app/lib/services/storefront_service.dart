import 'package:supabase_flutter/supabase_flutter.dart';
import 'logger_service.dart';

class StorefrontLayout {
  final String shopId;
  final Map<String, dynamic> theme;
  final Map<String, dynamic> layout;
  final int version;
  final String? designPrompt;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  StorefrontLayout({
    required this.shopId,
    required this.theme,
    required this.layout,
    required this.version,
    this.designPrompt,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory StorefrontLayout.fromJson(Map<String, dynamic> json) {
    return StorefrontLayout(
      shopId: json['shop_id'],
      theme: json['theme'] ?? {},
      layout: json['layout'] ?? {},
      version: json['version'] ?? 1,
      designPrompt: json['design_prompt'],
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'shop_id': shopId,
      'theme': theme,
      'layout': layout,
      'version': version,
      'design_prompt': designPrompt,
      'is_active': isActive,
    };
  }
}

class StorefrontService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Generate storefront layout using AI
  Future<StorefrontLayout> generateStorefront({
    required String shopId,
    String? userPrompt,
  }) async {
    LoggerService.info('Generating storefront for shop: $shopId');
    
    try {
      final response = await _supabase.functions.invoke(
        'ai-generate-storefront',
        body: {
          'shop_id': shopId,
          'user_prompt': userPrompt,
        },
      );

      if (response.status != 200) {
        throw Exception('Failed to generate storefront: ${response.data}');
      }

      final data = response.data;
      if (data['success'] == true && data['layout'] != null) {
        LoggerService.info('Storefront generated successfully');
        return StorefrontLayout.fromJson(data['layout']);
      } else {
        throw Exception('Invalid response from storefront generator');
      }
    } catch (e, stack) {
      LoggerService.error('Error generating storefront', e, stack);
      rethrow;
    }
  }

  /// Get current storefront layout for a shop
  Future<StorefrontLayout?> getStorefrontLayout(String shopId) async {
    LoggerService.info('Fetching storefront layout for shop: $shopId');
    
    try {
      final response = await _supabase
          .from('storefront_layouts')
          .select()
          .eq('shop_id', shopId)
          .eq('is_active', true)
          .maybeSingle();

      if (response == null) {
        LoggerService.info('No storefront layout found');
        return null;
      }

      return StorefrontLayout.fromJson(response);
    } catch (e, stack) {
      LoggerService.error('Error fetching storefront layout', e, stack);
      rethrow;
    }
  }

  /// Delete storefront layout
  Future<void> deleteStorefront(String shopId) async {
    LoggerService.info('Deleting storefront layout for shop: $shopId');
    
    try {
      await _supabase
          .from('storefront_layouts')
          .delete()
          .eq('shop_id', shopId);

      LoggerService.info('Storefront layout deleted successfully');
    } catch (e, stack) {
      LoggerService.error('Error deleting storefront layout', e, stack);
      rethrow;
    }
  }

  /// Deactivate storefront (soft delete)
  Future<void> deactivateStorefront(String shopId) async {
    LoggerService.info('Deactivating storefront for shop: $shopId');
    
    try {
      await _supabase
          .from('storefront_layouts')
          .update({'is_active': false})
          .eq('shop_id', shopId);

      LoggerService.info('Storefront deactivated successfully');
    } catch (e, stack) {
      LoggerService.error('Error deactivating storefront', e, stack);
      rethrow;
    }
  }

  /// Activate storefront
  Future<void> activateStorefront(String shopId) async {
    LoggerService.info('Activating storefront for shop: $shopId');
    
    try {
      await _supabase
          .from('storefront_layouts')
          .update({'is_active': true})
          .eq('shop_id', shopId);

      LoggerService.info('Storefront activated successfully');
    } catch (e, stack) {
      LoggerService.error('Error activating storefront', e, stack);
      rethrow;
    }
  }

  /// Publish shop storefront (make it visible publicly)
  Future<void> publishStorefront(String shopId) async {
    LoggerService.info('Publishing storefront for shop: $shopId');
    
    try {
      await _supabase
          .from('shops')
          .update({'storefront_published': true})
          .eq('id', shopId);

      LoggerService.info('Storefront published successfully');
    } catch (e, stack) {
      LoggerService.error('Error publishing storefront', e, stack);
      rethrow;
    }
  }

  /// Unpublish shop storefront
  Future<void> unpublishStorefront(String shopId) async {
    LoggerService.info('Unpublishing storefront for shop: $shopId');
    
    try {
      await _supabase
          .from('shops')
          .update({'storefront_published': false})
          .eq('id', shopId);

      LoggerService.info('Storefront unpublished successfully');
    } catch (e, stack) {
      LoggerService.error('Error unpublishing storefront', e, stack);
      rethrow;
    }
  }

  /// Toggle publish status
  Future<bool> togglePublishStorefront(String shopId, bool publish) async {
    if (publish) {
      await publishStorefront(shopId);
    } else {
      await unpublishStorefront(shopId);
    }
    return publish;
  }

  /// Get current auth token for preview
  String? getAuthToken() {
    return _supabase.auth.currentSession?.accessToken;
  }

  /// Get storefront preview URL
  /// Note: Authentication is handled via session cookies, not URL token
  String getPreviewUrl(String shopSlug) {
    const baseUrl = 'https://rupavo-storefront.vercel.app';
    return '$baseUrl/$shopSlug?preview=true';
  }
}
