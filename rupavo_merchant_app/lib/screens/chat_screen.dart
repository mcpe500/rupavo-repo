import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:rupavo_merchant_app/screens/onboarding_screen.dart';
import 'package:rupavo_merchant_app/models/product_preview.dart';
import 'package:rupavo_merchant_app/screens/product_preview_dialog.dart';
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';
import 'package:rupavo_merchant_app/services/conversation_memory_service.dart';
import 'package:rupavo_merchant_app/services/tool_call_parser.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rupavo_merchant_app/services/storage_service.dart';
import 'package:uuid/uuid.dart';

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
  final ConversationMemoryService _memoryService = ConversationMemoryService();
  final SupabaseClient _supabase = Supabase.instance.client;
  final StorageService _storageService = StorageService();

  late List<ChatMessage> _messages = [];
  late String _threadId;
  bool _isLoading = false;
  bool _isLoadingHistory = true;
  String? _sessionId;
  ProductPreview? _pendingProduct;
  bool _isProcessingAction = false;

  @override
  void initState() {
    super.initState();
    // Generate thread ID untuk conversation ini
    _threadId = const Uuid().v4();
    _loadChatHistory();
  }

  /// Load chat history dari database
  Future<void> _loadChatHistory() async {
    try {
      final contextMessages = await _memoryService.loadConversationContext(
        shopId: widget.shopId,
        threadId: _threadId,
      );

      setState(() {
        _messages = contextMessages;
        _isLoadingHistory = false;
      });

      // Auto-scroll ke bawah
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });

      // Jika tidak ada history, tambahkan greeting
      if (_messages.isEmpty) {
        _addMessage(
          ChatMessage(
            role: ChatRole.assistant,
            content: 'Halo! Ada yang bisa saya bantu untuk bisnis Anda hari ini?',
          ),
        );
      }
    } catch (e) {
      print('Error loading chat history: $e');
      setState(() {
        _isLoadingHistory = false;
      });
    }
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

  Future<void> _handleProductSuggestion(ChatResponse response) async {
    final preview = _extractProductPreview(response);
    if (preview == null) {
      return;
    }

    if (_pendingProduct != null) {
      // Still handling previous suggestion
      return;
    }

    setState(() {
      _pendingProduct = preview;
    });

    await _showProductPreviewDialog(preview);
  }

  ProductPreview? _extractProductPreview(ChatResponse response) {
    try {
      if (response.action == 'product_suggestion' && response.data != null) {
        return ProductPreview.fromJson(response.data!);
      }

      final reply = response.reply;
      if (reply == null) {
        return null;
      }

      final toolCall = ToolCallParser.parseToolCall(reply);
      if (toolCall == null) {
        return null;
      }
      return ToolCallParser.extractProductPreview(toolCall);
    } catch (e) {
      debugPrint('Failed to extract product preview: $e');
      return null;
    }
  }

  Future<void> _showProductPreviewDialog(ProductPreview preview) async {
    if (!mounted) return;

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return ProductPreviewDialog(
          product: preview,
          onCancel: () {
            Navigator.of(dialogContext).pop();
            if (mounted) {
              setState(() {
                _pendingProduct = null;
              });
            }
          },
          onConfirm: (selectedPreview, imageFile) async {
            await _confirmProduct(selectedPreview, dialogContext, imageFile: imageFile);
          },
        );
      },
    );
  }

  Future<void> _confirmProduct(
    ProductPreview preview,
    BuildContext dialogContext, {
    XFile? imageFile,
  }) async {
    if (_isProcessingAction) {
      return;
    }

    setState(() {
      _isProcessingAction = true;
    });

    try {
      String? imageUrl = preview.imageUrl;

      if (imageFile != null) {
        try {
          imageUrl = await _storageService.uploadProductImage(
            shopId: widget.shopId,
            file: imageFile,
          );
        } catch (error) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Gagal mengunggah foto produk: $error'),
                backgroundColor: Colors.red,
              ),
            );
          }
          return;
        }
      }

      final productToSave = preview.copyWith(imageUrl: imageUrl);

      await _supabase.from('products').insert(productToSave.toMap(shopId: widget.shopId));

      if (!mounted) {
        return;
      }

      Navigator.of(dialogContext).pop();

      final confirmationMessage = ChatMessage(
        role: ChatRole.assistant,
        content: 'Produk "${productToSave.name}" berhasil ditambahkan ke toko kamu! 🎉',
      );

      _addMessage(confirmationMessage);
      await _memoryService.saveMessage(
        shopId: widget.shopId,
        threadId: _threadId,
        message: confirmationMessage,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Produk "${productToSave.name}" berhasil ditambahkan.'),
        ),
      );

      setState(() {
        _pendingProduct = null;
      });
    } catch (e) {
      debugPrint('Failed to confirm product: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menambahkan produk: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessingAction = false;
        });
      }
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    final userMessage = ChatMessage(role: ChatRole.user, content: text);
    _addMessage(userMessage);

    // Save user message to database
    await _memoryService.saveMessage(
      shopId: widget.shopId,
      threadId: _threadId,
      message: userMessage,
    );

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
        _sessionId = response.sessionId;
        final assistantMessage = ChatMessage(
          role: ChatRole.assistant,
          content: response.reply!,
        );
        _addMessage(assistantMessage);

        // Save assistant message to database
        await _memoryService.saveMessage(
          shopId: widget.shopId,
          threadId: _threadId,
          message: assistantMessage,
        );

        await _handleProductSuggestion(response);
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
            child: _isLoadingHistory
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : ListView.builder(
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
                                    ? AppTheme.lightPrimary
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
          if (_isLoading || _isProcessingAction)
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
