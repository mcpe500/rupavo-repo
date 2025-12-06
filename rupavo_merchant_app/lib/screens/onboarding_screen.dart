import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/services/shop_service.dart';
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';
import 'package:rupavo_merchant_app/main.dart'; // For navigation to Dashboard

class OnboardingScreen extends StatefulWidget {
  final SupabaseFunctionsService? functionsService;
  final ShopService? shopService;

  const OnboardingScreen({
    super.key,
    this.functionsService,
    this.shopService,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final SupabaseFunctionsService _functionsService;
  late final ShopService _shopService;
  
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _sessionId;

  OnboardingStep _step = OnboardingStep.initial;
  String? _shopName;
  String? _shopDesc;

  @override
  void initState() {
    super.initState();
    _functionsService = widget.functionsService ?? SupabaseFunctionsService();
    _shopService = widget.shopService ?? ShopService();

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
      // Call Supabase Edge Function
      // Note: We're sending 'onboarding' as shopId. Make sure backend handles this or validation is permissive.
      final response = await _functionsService.chatWithRupavo(
        shopId: 'onboarding',
        message: text,
        sessionId: _sessionId,
      );

      if (response.success && response.reply != null) {
        _sessionId = response.sessionId;
        _addMessage(ChatMessage(role: ChatRole.assistant, content: response.reply!));

        // Conversational State Machine to capture Shop Name/Desc
        // Ideally AI returns structured data, but for now we rely on the flow steps.
        if (_step == OnboardingStep.initial) {
          _step = OnboardingStep.askingName;
        } else if (_step == OnboardingStep.askingName) {
           _shopName = text;
           _step = OnboardingStep.askingDescription;
        } else if (_step == OnboardingStep.askingDescription) {
          _shopDesc = text;
           _addMessage(ChatMessage(
             role: ChatRole.assistant,
             content: 'Baik, sedang menyiapkan toko "$_shopName" untuk Anda...',
           ));
          await _createShop();
        }

      } else {
         _addMessage(ChatMessage(role: ChatRole.assistant, content: 'Maaf, ada gangguan teknis.'));
      }

    } catch (e) {
      _addMessage(ChatMessage(role: ChatRole.assistant, content: 'Error: $e'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
      _step = OnboardingStep.askingName; // Reset to name (retry)
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5), // Light gray bg
      appBar: AppBar(
        title: const Text(
          'Chat with Rupavo',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_horiz),
            onPressed: () {},
          ),
        ],
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
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Row(
                    mainAxisAlignment:
                        isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!isUser) ...[
                        const CircleAvatar(
                          backgroundImage: NetworkImage(
                              'https://api.dicebear.com/7.x/avataaars/png?seed=Rupavo'), // Placeholder
                          backgroundColor: Colors.white,
                        ),
                        const SizedBox(width: 8),
                      ],
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isUser
                              ? Theme.of(context).colorScheme.primary
                              : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(20),
                            topRight: const Radius.circular(20),
                            bottomLeft: Radius.circular(isUser ? 20 : 0),
                            bottomRight: Radius.circular(isUser ? 0 : 20),
                          ),
                          boxShadow: [
                            if (!isUser)
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                          ],
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.7,
                        ),
                        child: Text(
                          msg.content,
                          style: TextStyle(
                            color: isUser
                                ? Theme.of(context).colorScheme.onPrimary
                                : Colors.black87,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
             Container(
               margin: const EdgeInsets.only(bottom: 8),
               child: const LinearProgressIndicator(),
             ),
          SafeArea(
            child: Container(
              margin: const EdgeInsets.all(16.0),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.mic, color: Colors.grey),
                    onPressed: () {
                      // Voice input placeholder
                    },
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: _step == OnboardingStep.askingName
                            ? 'Nama Toko...'
                            : (_step == OnboardingStep.askingDescription
                                ? 'Deskripsi...'
                                : 'Type message...'),
                        border: InputBorder.none,
                        contentPadding:
                            const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                      enabled: !_isLoading,
                      textInputAction: TextInputAction.send,
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.grey[200], // Or Theme primary if preferred
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_upward, color: Colors.black54),
                      onPressed: _isLoading ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 2, // AI Assistant selected
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2_outlined),
            label: 'Products',
          ),
          BottomNavigationBarItem(
            icon: CircleAvatar(
              radius: 24,
              backgroundColor: Color(0xFF13EC5B), // Brand Green
              child: Icon(Icons.mic, color: Colors.white),
            ),
            label: 'AI Assistant',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            label: 'Sales',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.storefront_outlined),
            label: 'Shop',
          ),
        ],
        onTap: (index) {
          if (index != 2) {
             ScaffoldMessenger.of(context).showSnackBar(
               const SnackBar(content: Text('Selesaikan pembuatan toko terlebih dahulu!')),
             );
          }
        },
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
