import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart';
import 'package:path/path.dart' as p;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'logger_service.dart';

class StorageService {
  StorageService();

  final SupabaseClient _supabase = Supabase.instance.client;
  static const String _bucketName = 'product-images';

  /// Upload product image to Supabase Storage and return its public URL.
  ///
  /// Throws an [Exception] when upload fails.
  Future<String> uploadProductImage({
    required String shopId,
    required XFile file,
  }) async {
    try {
      final bytes = await file.readAsBytes();
        final extension = p.extension(file.name).isEmpty
          ? '.jpg'
          : p.extension(file.name).toLowerCase();
        final mimeType = lookupMimeType(file.name) ?? 'image/jpeg';

      final filePath = 'shops/$shopId/products/${DateTime.now().millisecondsSinceEpoch}$extension';

      await _supabase.storage.from(_bucketName).uploadBinary(
            filePath,
            bytes,
            fileOptions: FileOptions(
              upsert: true,
              contentType: mimeType,
            ),
          );

      final publicUrl = _supabase.storage.from(_bucketName).getPublicUrl(filePath);
      LoggerService.info('📦 Image uploaded to storage: $publicUrl');
      return publicUrl;
    } catch (error, stack) {
      LoggerService.error('❌ Failed to upload product image', error, stack);
      rethrow;
    }
  }
}
