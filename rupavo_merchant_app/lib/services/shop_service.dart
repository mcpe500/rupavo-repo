import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/shop.dart';

class ShopService {
  final SupabaseClient _supabase;

  ShopService({SupabaseClient? supabase})
      : _supabase = supabase ?? Supabase.instance.client;

  /// Get the current user's shop
  Future<Shop?> getCurrentShop() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;

    try {
      final data = await _supabase
          .from('shops')
          .select()
          .eq('owner_id', user.id)
          .maybeSingle();

      if (data == null) return null;
      return Shop.fromJson(data);
    } catch (e) {
      // ignore: avoid_print
      print('Error fetching shop: $e');
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

    final shopData = {
      'owner_id': user.id,
      'name': name,
      'slug': slug,
      'description': description,
      'business_type': businessType,
    };

    final data = await _supabase
        .from('shops')
        .insert(shopData)
        .select()
        .single();

    return Shop.fromJson(data);
  }

  /// Check if slug is available
  Future<bool> isSlugAvailable(String slug) async {
    final data = await _supabase
        .from('shops')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
    
    return data == null;
  }
}
