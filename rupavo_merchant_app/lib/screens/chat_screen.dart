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
import 'package:rupavo_merchant_app/services/voice_service.dart';
import 'package:rupavo_merchant_app/screens/chat_history_screen.dart';
import 'package:uuid/uuid.dart';

class ChatScreen extends StatefulWidget {
  final String shopId;
  final String? resumeThreadId; // Optional: resume previous chat

  const ChatScreen({super.key, required this.shopId, this.resumeThreadId});

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
  final VoiceService _voiceService = VoiceService();

  late List<ChatMessage> _messages = [];
  late String _threadId;
  bool _isLoading = false;
  bool _isLoadingHistory = true;
  bool _isListening = false;
  String? _sessionId;
  ProductPreview? _pendingProduct;
  bool _isProcessingAction = false;
  
  // Pending transaction drafts from AI
  Map<String, dynamic>? _pendingDraftSale;
  Map<String, dynamic>? _pendingDraftExpense;

  @override
  void initState() {
    super.initState();
    // Use resume thread ID if provided, otherwise generate new one
    _threadId = widget.resumeThreadId ?? const Uuid().v4();
    _loadChatHistory();
    _initializeVoice();
  }

  Future<void> _initializeVoice() async {
    try {
      await _voiceService.initSpeech();
    } catch (e) {
      print('Error initializing voice: $e');
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _voiceService.dispose();
    super.dispose();
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

  Future<void> _startVoiceInput() async {
    setState(() {
      _isListening = true;
    });

    try {
      final started = await _voiceService.startListening(
        onPartial: (text) {
          // Update text field in real-time as user speaks
          if (mounted) {
            setState(() {
              _messageController.text = text;
              // Move cursor to end
              _messageController.selection = TextSelection.fromPosition(
                TextPosition(offset: _messageController.text.length),
              );
            });
          }
        },
        onFinal: (text) {
          // Final result - user finished speaking
          if (mounted && text.isNotEmpty) {
            setState(() {
              _messageController.text = text;
              _isListening = false;
            });
          }
        },
      );

      if (!started) {
        setState(() {
          _isListening = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tidak bisa memulai input suara'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    } catch (e) {
      print('Voice input error: $e');
      setState(() {
        _isListening = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error dengan input suara'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _stopVoiceInput() async {
    try {
      final result = await _voiceService.stopListening();
      if (mounted) {
        setState(() {
          _isListening = false;
          if (result.isNotEmpty) {
            _messageController.text = result;
          }
        });
      }
    } catch (e) {
      print('Error stopping voice: $e');
      if (mounted) {
        setState(() {
          _isListening = false;
        });
      }
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

  /// Handle transaction-related actions from AI
  Future<void> _handleTransactionActions(ChatResponse response) async {
    final action = response.action;
    final data = response.data;

    switch (action) {
      case 'draft_sale':
        // Store pending draft for confirmation
        setState(() {
          _pendingDraftSale = data;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('💡 Ketik "ya" untuk konfirmasi penjualan'),
              duration: Duration(seconds: 3),
            ),
          );
        }
        break;

      case 'sale_confirmed':
        // Backend already inserted to database, just clear the draft
        // DO NOT insert again - that causes double recording!
        setState(() {
          _pendingDraftSale = null;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Penjualan berhasil dicatat!'),
              backgroundColor: Colors.green,
            ),
          );
        }
        break;

      case 'draft_expense':
        setState(() {
          _pendingDraftExpense = data;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('💡 Ketik "ya" untuk konfirmasi pengeluaran'),
              duration: Duration(seconds: 3),
            ),
          );
        }
        break;

      case 'expense_confirmed':
        // Backend already inserted to database, just clear the draft
        // DO NOT insert again - that causes double recording!
        setState(() {
          _pendingDraftExpense = null;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Pengeluaran berhasil dicatat!'),
              backgroundColor: Colors.green,
            ),
          );
        }
        break;

      case 'transaction_updated':
      case 'transaction_deleted':
        // Just show success toast - AI already did the DB update
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(action == 'transaction_updated' 
                  ? '✅ Transaksi berhasil diupdate' 
                  : '❌ Transaksi berhasil dihapus'),
              backgroundColor: action == 'transaction_updated' ? Colors.green : Colors.orange,
            ),
          );
        }
        break;
    }
  }

  // NOTE: _insertSaleToDatabase and _insertExpenseToDatabase removed
  // Backend (Edge Function) now handles all DB inserts for transactions
  // to prevent double-recording issues

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

        // Handle different action types
        await _handleProductSuggestion(response);
        await _handleTransactionActions(response);
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
        title: const Text('Asisten Rupavo'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Riwayat Chat',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChatHistoryScreen(shopId: widget.shopId),
                ),
              );
            },
          ),
        ],
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
                      hintText: 'Catat transaksi atau tanya sesuatu...',
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
                  onPressed: _isListening ? _stopVoiceInput : _startVoiceInput,
                  icon: Icon(_isListening ? Icons.mic : Icons.mic_none),
                  style: IconButton.styleFrom(
                    backgroundColor: _isListening ? Colors.red : null,
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
