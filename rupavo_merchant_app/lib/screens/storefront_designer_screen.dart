import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/models/shop.dart';
import 'package:rupavo_merchant_app/services/storefront_service.dart';
import 'package:rupavo_merchant_app/services/voice_service.dart';
import 'package:share_plus/share_plus.dart';

class StorefrontDesignerScreen extends StatefulWidget {
  final Shop shop;

  const StorefrontDesignerScreen({super.key, required this.shop});

  @override
  State<StorefrontDesignerScreen> createState() => _StorefrontDesignerScreenState();
}

class _StorefrontDesignerScreenState extends State<StorefrontDesignerScreen> {
  final TextEditingController _promptController = TextEditingController();
  final StorefrontService _storefrontService = StorefrontService();
  final VoiceService _voiceService = VoiceService();
  
  StorefrontLayout? _currentLayout;
  bool _isGenerating = false;
  bool _isLoading = true;
  bool _isListening = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadCurrentLayout();
    _voiceService.initSpeech();
  }

  Future<void> _loadCurrentLayout() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final layout = await _storefrontService.getStorefrontLayout(widget.shop.id);
      setState(() {
        _currentLayout = layout;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal memuat etalase: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _generateStorefront() async {
    if (_isGenerating) return;

    final prompt = _promptController.text.trim();
    
    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });

    try {
      final layout = await _storefrontService.generateStorefront(
        shopId: widget.shop.id,
        userPrompt: prompt.isEmpty ? null : prompt,
      );

      setState(() {
        _currentLayout = layout;
        _isGenerating = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✨ Etalase toko berhasil dibuat!'),
            backgroundColor: Colors.green,
          ),
        );
        _promptController.clear();
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal membuat etalase: $e';
        _isGenerating = false;
      });
    }
  }

  Future<void> _startVoiceInput() async {
    setState(() {
      _isListening = true;
    });

    try {
      await _voiceService.startListening();
    } catch (e) {
      print('Voice input error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error dengan input suara'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _stopVoiceInput() async {
    try {
      final result = await _voiceService.stopListening();
      setState(() {
        _isListening = false;
      });
      if (result.isNotEmpty) {
        _promptController.text = result;
      }
    } catch (e) {
      print('Error stopping voice: $e');
    }
  }

  Future<void> _publishStorefront() async {
    try {
      await _storefrontService.publishStorefront(widget.shop.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Etalase toko sudah dipublikasikan!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal publish: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _shareStorefrontLink() {
    final storefrontUrl = 'https://rupavo.com/${widget.shop.slug}';
    Share.share(
      'Lihat toko online saya di Rupavo: $storefrontUrl',
      subject: 'Toko ${widget.shop.name}',
    );
  }

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Etalase Toko Online'),
        actions: [
          if (_currentLayout != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: _shareStorefrontLink,
              tooltip: 'Bagikan Link Toko',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header Info
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.storefront, size: 32),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.shop.name,
                                      style: Theme.of(context).textTheme.titleLarge,
                                    ),
                                    if (widget.shop.description != null)
                                      Text(
                                        widget.shop.description!,
                                        style: Theme.of(context).textTheme.bodyMedium,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Divider(),
                          const SizedBox(height: 8),
                          Text(
                            'Buat etalase toko online yang menarik dengan bantuan AI. Cukup beritahu kami keinginan Anda, atau biarkan AI membuat desain otomatis!',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Current Layout Status
                  if (_currentLayout != null) ...[
                    Card(
                      color: Colors.green.shade50,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.check_circle, color: Colors.green.shade700),
                                const SizedBox(width: 8),
                                Text(
                                  'Etalase Sudah Dibuat',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green.shade700,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text('Versi: ${_currentLayout!.version}'),
                            Text('Terakhir update: ${_formatDate(_currentLayout!.updatedAt)}'),
                            const SizedBox(height: 12),
                            _buildThemePreview(_currentLayout!.theme),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: _publishStorefront,
                                    icon: const Icon(Icons.publish),
                                    label: const Text('Publish'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: _shareStorefrontLink,
                                    icon: const Icon(Icons.open_in_new),
                                    label: const Text('Preview'),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Error Message
                  if (_errorMessage != null) ...[
                    Card(
                      color: Colors.red.shade50,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.error_outline, color: Colors.red.shade700),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: TextStyle(color: Colors.red.shade700),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Generate Storefront Section
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _currentLayout == null
                                ? '🎨 Buat Etalase Toko'
                                : '✨ Generate Ulang Etalase',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _promptController,
                            maxLines: 4,
                            decoration: InputDecoration(
                              hintText: 'Contoh: "Saya ingin etalase dengan tema hijau segar, cocok untuk toko sayur, dengan layout yang clean dan foto produk besar"',
                              border: const OutlineInputBorder(),
                              helperText: 'Opsional: Kosongkan untuk generate otomatis',
                              suffixIcon: IconButton(
                                icon: Icon(_isListening ? Icons.mic : Icons.mic_none),
                                color: _isListening ? Colors.red : null,
                                onPressed: _isListening ? _stopVoiceInput : _startVoiceInput,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _isGenerating ? null : _generateStorefront,
                              icon: _isGenerating
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : const Icon(Icons.auto_awesome),
                              label: Text(
                                _isGenerating
                                    ? 'Sedang Membuat...'
                                    : _currentLayout == null
                                        ? 'Buat Etalase dengan AI'
                                        : 'Generate Ulang',
                              ),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.all(16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Tips Section
                  Card(
                    color: Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.lightbulb_outline, color: Colors.blue.shade700),
                              const SizedBox(width: 8),
                              Text(
                                'Tips',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue.shade700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          _buildTipItem('💬 Gunakan voice input untuk lebih cepat'),
                          _buildTipItem('🎨 Sebutkan warna atau tema yang Anda suka'),
                          _buildTipItem('📸 Pastikan produk sudah ada foto untuk hasil terbaik'),
                          _buildTipItem('✨ AI akan belajar dari history chat Anda'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildThemePreview(Map<String, dynamic> theme) {
    final primaryColor = Color(int.parse(theme['primary_color'].toString().replaceAll('#', '0xFF')));
    final secondaryColor = Color(int.parse(theme['secondary_color'].toString().replaceAll('#', '0xFF')));
    
    return Row(
      children: [
        const Text('Tema: '),
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: primaryColor,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.grey.shade300),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: secondaryColor,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.grey.shade300),
          ),
        ),
        const SizedBox(width: 8),
        Text(theme['accent_style'] ?? ''),
      ],
    );
  }

  Widget _buildTipItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodySmall,
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
