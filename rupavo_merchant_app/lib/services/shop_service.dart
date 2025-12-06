import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/shop.dart';
import 'logger_service.dart';

class ShopService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Get the current user's shop
  Future<Shop?> getCurrentShop() async {
    final user = _supabase.auth.currentUser;
    if (user == null) {
      LoggerService.warning('getCurrentShop: No user logged in');
      return null;
    }

    LoggerService.debug('Fetching shop for user: ${user.id}');

    try {
      final data = await _supabase
          .from('shops')
          .select()
          .eq('owner_id', user.id)
          .maybeSingle();

      if (data == null) {
        LoggerService.info('No shop found for user ${user.id}');
        return null;
      }
      
      LoggerService.info('Shop loaded: ${data['name']} (${data['id']})');
      return Shop.fromJson(data);
    } catch (e, stack) {
      LoggerService.error('Error fetching shop', e, stack);
      return null;
    }
  }

  /// Create a new shop
  Future<Shop> createShop({
    required String name,
    required String slug,
    String? description,
    String? businessType,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('User not logged in');

    LoggerService.info('Creating shop: $name (Slug: $slug)');

    final shopData = {
      'owner_id': user.id,
      'name': name,
      'slug': slug,
      'description': description,
      'business_type': businessType,
    };

    try {
      final data = await _supabase
          .from('shops')
          .insert(shopData)
          .select()
          .single();

      LoggerService.info('Shop created successfully: ${data['id']}');
      return Shop.fromJson(data);
    } catch (e, stack) {
      LoggerService.error('Failed to create shop', e, stack);
      rethrow;
    }
  }

  /// Check if slug is available
  Future<bool> isSlugAvailable(String slug) async {
    LoggerService.debug('Checking slug availability: $slug');
    try {
      final data = await _supabase
          .from('shops')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
      
      final isAvailable = data == null;
      LoggerService.debug('Slug $slug available: $isAvailable');
      return isAvailable;
    } catch (e) {
      LoggerService.error('Error checking slug', e);
      return false;
    }
  }
}
