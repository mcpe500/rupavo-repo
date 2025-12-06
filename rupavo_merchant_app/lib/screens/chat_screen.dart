import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/screens/onboarding_screen.dart'; // Reuse ChatMessage & ChatRole
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  final String shopId;

  const ChatScreen({super.key, required this.shopId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final SupabaseFunctionsService _functionsService = SupabaseFunctionsService();

  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _sessionId;

  @override
  void initState() {
    super.initState();
    _addMessage(
      ChatMessage(
        role: ChatRole.assistant,
        content: 'Halo! Ada yang bisa saya bantu untuk bisnis Anda hari ini?',
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

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _functionsService.chatWithRupavo(
        shopId: widget.shopId,
        message: text,
        sessionId: _sessionId,
      );

      if (response.success && response.reply != null) {
        _sessionId = response.sessionId; // Update session ID
        _addMessage(
          ChatMessage(
            role: ChatRole.assistant,
            content: response.reply!,
          ),
        );
      } else {
        _addMessage(
          ChatMessage(
            role: ChatRole.assistant,
            content: 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.',
          ),
        );
      }
    } catch (e) {
      _addMessage(
        ChatMessage(
          role: ChatRole.assistant,
          content: 'Error: $e',
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Coach'),
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
                          ? AppTheme.lightPrimary
                          : Colors.grey[200],
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
                        color: isUser ? Colors.white : Colors.black87,
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
                      hintText: 'Tanya Rupavo...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sendMessage,
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
