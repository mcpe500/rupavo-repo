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

  // OnboardingStep _step = OnboardingStep.initial; // Removed: Agentic now
  // String? _shopName; // Removed
  // String? _shopDesc; // Removed

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
      // Build conversation history (exclude the current message we just added)
      final history = _messages
          .take(_messages.length - 1) // Exclude the last message (current user message)
          .map((msg) => {
                'role': msg.role == ChatRole.user ? 'user' : 'assistant',
                'content': msg.content,
              })
          .toList();

      // Call Supabase Edge Function
      final response = await _functionsService.chatWithRupavo(
        shopId: 'onboarding',
        message: text,
        sessionId: _sessionId,
        history: history, // Pass conversation history
      );

      if (response.success && response.reply != null) {
        _sessionId = response.sessionId;
        _addMessage(ChatMessage(role: ChatRole.assistant, content: response.reply!));

        // Handle Agentic Actions
        if (response.action == 'shop_created') {
           _addMessage(ChatMessage(
             role: ChatRole.assistant, 
             content: '✅ Toko berhasil dibuat! Mengalihkan ke Dashboard...',
           ));
           
           await Future.delayed(const Duration(seconds: 2));
           
           if (mounted) {
             Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const AuthGate()),
             );
           }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Setup Toko Baru',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
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
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Row(
                    mainAxisAlignment:
                        isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!isUser) ...[
                        CircleAvatar(
                          backgroundColor: Colors.white,
                          child: ClipOval(
                            child: Image.asset(
                              'assets/images/rupavo-image-2-removebg-preview.png',
                              width: 40,
                              height: 40,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: isUser
                              ? Theme.of(context).colorScheme.primary
                              : Colors.grey[200],
                          borderRadius: BorderRadius.circular(16).copyWith(
                            bottomRight: isUser ? Radius.zero : null,
                            bottomLeft: !isUser ? Radius.zero : null,
                          ),
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.65,
                        ),
                        child: Text(
                          msg.content,
                          style: TextStyle(
                            color: isUser ? Colors.white : Colors.black87,
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
                      hintText: 'Tulis pesan...',
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
