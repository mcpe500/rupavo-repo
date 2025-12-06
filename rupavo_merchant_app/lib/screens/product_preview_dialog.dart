import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:rupavo_merchant_app/models/product_preview.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';

class ProductPreviewDialog extends StatefulWidget {
  final ProductPreview product;
  final Future<void> Function(ProductPreview preview, XFile? imageFile) onConfirm;
  final VoidCallback onCancel;

  const ProductPreviewDialog({
    super.key,
    required this.product,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  State<ProductPreviewDialog> createState() => _ProductPreviewDialogState();
}

class _ProductPreviewDialogState extends State<ProductPreviewDialog> {
  final ImagePicker _picker = ImagePicker();
  XFile? _selectedImage;
  bool _isPicking = false;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHeader(),
            _buildContent(context),
            _buildActions(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.lightPrimary,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Preview Produk Baru',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Periksa detail produk dan tambahkan foto sebelum disimpan.',
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildImageSection(context),
          const SizedBox(height: 20),
          _buildDetailRow('Nama Produk', widget.product.name, Icons.shopping_bag_outlined),
          const SizedBox(height: 16),
          _buildDetailRow('Harga', _formatPrice(widget.product.price), Icons.local_offer_outlined),
          const SizedBox(height: 16),
          if (widget.product.description != null && widget.product.description!.isNotEmpty)
            _buildDescription(),
        ],
      ),
    );
  }

  Widget _buildImageSection(BuildContext context) {
    final hasSelectedImage = _selectedImage != null;
    final hasExistingImage = widget.product.imageUrl != null && widget.product.imageUrl!.isNotEmpty;

    Widget imageWidget;
    if (hasSelectedImage) {
      imageWidget = ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: _buildSelectedImageWidget(),
      );
    } else if (hasExistingImage) {
      imageWidget = ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          widget.product.imageUrl!,
          width: double.infinity,
          height: 200,
          fit: BoxFit.cover,
        ),
      );
    } else {
      imageWidget = Container(
        width: double.infinity,
        height: 180,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.grey[200],
        ),
        child: const Icon(
          Icons.image_outlined,
          color: Colors.grey,
          size: 56,
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Stack(
          children: [
            SizedBox(width: double.infinity, child: imageWidget),
            if (_isPicking)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            ElevatedButton.icon(
              onPressed: _isPicking ? null : _handlePickImage,
              icon: const Icon(Icons.photo_library_outlined),
              label: const Text('Pilih Foto Produk'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.lightPrimary,
              ),
            ),
            if (hasSelectedImage)
              TextButton(
                onPressed: () => setState(() => _selectedImage = null),
                child: const Text('Hapus Foto'),
              ),
          ],
        ),
        const SizedBox(height: 4),
        const Text(
          'Format yang didukung: JPG, PNG (maks 5MB).',
          style: TextStyle(fontSize: 12, color: Colors.black54),
        ),
      ],
    );
  }

  Widget _buildSelectedImageWidget() {
    if (_selectedImage == null) {
      return const SizedBox.shrink();
    }

    if (kIsWeb) {
      return Image.network(
        _selectedImage!.path,
        width: double.infinity,
        height: 200,
        fit: BoxFit.cover,
      );
    }

    return Image.file(
      File(_selectedImage!.path),
      width: double.infinity,
      height: 200,
      fit: BoxFit.cover,
    );
  }

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Deskripsi',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            widget.product.description!,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: widget.onCancel,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.grey),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Batal',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () async {
                await widget.onConfirm(widget.product, _selectedImage);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.lightPrimary,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Oke, Tambahkan!',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppTheme.lightPrimary,
          size: 20,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatPrice(double price) {
    final baseString = price.toStringAsFixed(2);
    final parts = baseString.split('.');
    final integerPart = parts[0];
    final decimals = parts.length > 1 ? parts[1] : '00';
    final formattedInteger = integerPart.replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (match) => '${match.group(1)}.',
    );

    if (decimals == '00') {
      return 'Rp $formattedInteger';
    }
    return 'Rp $formattedInteger,$decimals';
  }

  Future<void> _handlePickImage() async {
    setState(() {
      _isPicking = true;
    });

    try {
      final file = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        imageQuality: 85,
      );

      if (file != null) {
        setState(() {
          _selectedImage = file;
        });
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memilih foto: $error'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isPicking = false;
        });
      }
    }
  }
}
