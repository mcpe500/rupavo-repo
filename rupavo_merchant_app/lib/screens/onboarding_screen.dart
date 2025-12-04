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
  final SupabaseFunctionsService _functionsService = SupabaseFunctionsService();
  final ShopService _shopService = ShopService();

  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _sessionId;

  @override
  void initState() {
    super.initState();
    // Initial greeting
    _addMessage(
      ChatMessage(
        role: ChatRole.assistant,
        content: 'Halo! Saya Rupavo, asisten bisnis Anda. \n\n'
            'Mari kita mulai perjalanan bisnis Anda. Ceritakan tentang ide toko Anda, '
            'dan saya akan membantu Anda menyiapkan nama dan deskripsi yang menarik.',
      ),
    );
  }

  void _addMessage(ChatMessage message) {
    setState(() {
      _messages.add(message);
    });
    // Scroll to bottom
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
      // We use a dummy shop ID for onboarding chat since shop doesn't exist yet
      // In a real app, we might handle this differently or have a dedicated "onboarding" function
      // For now, we'll assume the function handles "new_shop" or similar, 
      // OR we just skip the shop_id check in the edge function if it's a specific onboarding intent.
      // However, our current Edge Function requires shop_id.
      // WORKAROUND: For this MVP, we will simulate the AI response locally for the first step
      // or we need to modify the Edge Function to allow no shop_id.
      
      // Let's modify the Edge Function later. For now, let's simulate a helpful response
      // to guide the user to the "Create Shop" form.
      
      // Simulating AI delay
      await Future.delayed(const Duration(seconds: 1));
      
      _addMessage(
        ChatMessage(
          role: ChatRole.assistant,
          content: 'Ide yang bagus! Bagaimana kalau kita buatkan toko untuk itu? \n\n'
              'Silakan tekan tombol "Buat Toko" di bawah ini jika Anda sudah siap.',
        ),
      );

    } catch (e) {
      _addMessage(
        ChatMessage(
          role: ChatRole.assistant,
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showCreateShopDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: const CreateShopForm(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Selamat Datang di Rupavo'),
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
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _showCreateShopDialog,
                child: const Text('Buat Toko Sekarang'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CreateShopForm extends StatefulWidget {
  const CreateShopForm({super.key});

  @override
  State<CreateShopForm> createState() => _CreateShopFormState();
}

class _CreateShopFormState extends State<CreateShopForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _slugController = TextEditingController();
  final _descController = TextEditingController();
  final _shopService = ShopService();
  bool _isLoading = false;

  Future<void> _createShop() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // Check slug availability
      final isAvailable = await _shopService.isSlugAvailable(_slugController.text);
      if (!isAvailable) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Slug URL sudah digunakan, pilih yang lain.')),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      await _shopService.createShop(
        name: _nameController.text,
        slug: _slugController.text,
        description: _descController.text,
        businessType: 'general', // Default for now
      );

      if (mounted) {
        Navigator.pop(context); // Close sheet
        // Navigate to Dashboard
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const AuthGate()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal membuat toko: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Buat Toko Baru',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Nama Toko'),
              validator: (v) => v?.isEmpty == true ? 'Wajib diisi' : null,
              onChanged: (val) {
                // Auto-generate slug
                _slugController.text = val
                    .toLowerCase()
                    .replaceAll(RegExp(r'[^a-z0-9]'), '-')
                    .replaceAll(RegExp(r'-+'), '-')
                    .replaceAll(RegExp(r'^-|-$'), '');
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _slugController,
              decoration: const InputDecoration(
                labelText: 'URL Slug',
                prefixText: 'rupavo.com/',
              ),
              validator: (v) => v?.isEmpty == true ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Deskripsi Singkat'),
              maxLines: 3,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _createShop,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Simpan & Mulai'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

enum ChatRole { user, assistant }

class ChatMessage {
  final ChatRole role;
  final String content;

  ChatMessage({required this.role, required this.content});
}
