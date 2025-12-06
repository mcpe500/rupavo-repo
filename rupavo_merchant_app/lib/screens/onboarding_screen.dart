import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/services/shop_service.dart';
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';
import 'package:rupavo_merchant_app/main.dart'; // For navigation to Dashboard

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ShopService _shopService = ShopService();
  
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;

  OnboardingStep _step = OnboardingStep.initial;
  String? _shopName;
  String? _shopDesc;

  @override
  void initState() {
    super.initState();
    _addMessage(
      ChatMessage(
        role: ChatRole.assistant,
        content: 'Halo! Saya Rupavo, asisten bisnis Anda. \n\n'
            'Mari kita mulai perjalanan bisnis Anda. Ceritakan ide toko Anda, '
            'atau ketik "mulai" untuk langsung membuat toko.',
      ),
    );
  }

  void _addMessage(ChatMessage message) {
    setState(() {
      _messages.add(message);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    _addMessage(ChatMessage(role: ChatRole.user, content: text));

    setState(() => _isLoading = true);

    try {
      // Conversational State Machine
      if (_step == OnboardingStep.initial) {
        await Future.delayed(const Duration(milliseconds: 800));
        _addMessage(ChatMessage(
          role: ChatRole.assistant,
          content: 'Ide yang menarik! Mari kita wujudkan.\n\nApa nama toko yang Anda inginkan?',
        ));
        _step = OnboardingStep.askingName;
      } else if (_step == OnboardingStep.askingName) {
         _shopName = text;
         await Future.delayed(const Duration(milliseconds: 600));
         _addMessage(ChatMessage(
          role: ChatRole.assistant,
          content: 'Nama yang bagus "$_shopName".\n\nBerikan deskripsi singkat tentang toko Anda.',
        ));
        _step = OnboardingStep.askingDescription;
      } else if (_step == OnboardingStep.askingDescription) {
        _shopDesc = text;
        _addMessage(ChatMessage(
          role: ChatRole.assistant,
          content: 'Baik, sedang menyiapkan toko "$_shopName" untuk Anda...',
        ));
        
        await _createShop();
      }

    } catch (e) {
      _addMessage(ChatMessage(role: ChatRole.assistant, content: 'Error: $e'));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _createShop() async {
    try {
       final slug = _shopName!.toLowerCase()
          .replaceAll(RegExp(r'[^a-z0-9]'), '-')
          .replaceAll(RegExp(r'-+'), '-')
          .replaceAll(RegExp(r'^-|-$'), '');
      
      // Check availability (simplified)
      final isAvailable = await _shopService.isSlugAvailable(slug);
      final finalSlug = isAvailable ? slug : '$slug-${DateTime.now().millisecondsSinceEpoch}';

      await _shopService.createShop(
        name: _shopName!,
        slug: finalSlug,
        description: _shopDesc ?? '',
        businessType: 'general',
      );
      
      _addMessage(ChatMessage(
        role: ChatRole.assistant,
        content: 'Toko berhasil dibuat! Mengalihkan ke Dashboard...',
      ));
      
      await Future.delayed(const Duration(seconds: 1));
      
      if (mounted) {
         Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const AuthGate()),
        );
      }
    } catch (e) {
       _addMessage(ChatMessage(
        role: ChatRole.assistant,
        content: 'Gagal membuat toko: $e. Silakan coba nama lain.',
      ));
      _step = OnboardingStep.askingName; // Reset to name
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rupavo Coach'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.role == ChatRole.user;
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isUser
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.surfaceContainerHighest ?? Colors.grey[200],
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomRight: isUser ? Radius.zero : null,
                        bottomLeft: !isUser ? Radius.zero : null,
                      ),
                    ),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    child: Text(
                      msg.content,
                      style: TextStyle(
                        color: isUser ? Theme.of(context).colorScheme.onPrimary : Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: LinearProgressIndicator(),
            ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: _step == OnboardingStep.askingName ? 'Nama Toko...' : 'Tulis pesan...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                    enabled: !_isLoading,
                    textInputAction: TextInputAction.send,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _isLoading ? null : _sendMessage,
                  icon: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

enum OnboardingStep { initial, askingName, askingDescription }

enum ChatRole { user, assistant }

class ChatMessage {
  final ChatRole role;
  final String content;

  ChatMessage({required this.role, required this.content});
}
