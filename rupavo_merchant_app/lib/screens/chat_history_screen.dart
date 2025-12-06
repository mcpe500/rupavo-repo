import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:rupavo_merchant_app/services/conversation_memory_service.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';
import 'package:rupavo_merchant_app/screens/chat_screen.dart';

class ChatHistoryScreen extends StatefulWidget {
  final String shopId;

  const ChatHistoryScreen({super.key, required this.shopId});

  @override
  State<ChatHistoryScreen> createState() => _ChatHistoryScreenState();
}

class _ChatHistoryScreenState extends State<ChatHistoryScreen> {
  final ConversationMemoryService _memoryService = ConversationMemoryService();
  
  List<ConversationThread> _threads = [];
  AiKnowledgeSummary? _aiKnowledge;
  bool _isLoading = true;
  bool _isExporting = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      final threads = await _memoryService.getConversationThreads(
        shopId: widget.shopId,
      );
      final knowledge = await _memoryService.extractAiKnowledge(
        shopId: widget.shopId,
      );

      if (mounted) {
        setState(() {
          _threads = threads;
          _aiKnowledge = knowledge;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading history: $e')),
        );
      }
    }
  }

  Future<void> _showSearchDialog() async {
    final searchController = TextEditingController();
    List<SearchResult> results = [];
    bool isSearching = false;

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('🔍 Cari Chat'),
          content: SizedBox(
            width: double.maxFinite,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    hintText: 'Ketik kata kunci...',
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: () async {
                        if (searchController.text.isNotEmpty) {
                          setDialogState(() => isSearching = true);
                          results = await _memoryService.searchMessages(
                            shopId: widget.shopId,
                            query: searchController.text,
                          );
                          setDialogState(() => isSearching = false);
                        }
                      },
                    ),
                  ),
                  onSubmitted: (value) async {
                    if (value.isNotEmpty) {
                      setDialogState(() => isSearching = true);
                      results = await _memoryService.searchMessages(
                        shopId: widget.shopId,
                        query: value,
                      );
                      setDialogState(() => isSearching = false);
                    }
                  },
                ),
                const SizedBox(height: 16),
                if (isSearching)
                  const CircularProgressIndicator()
                else if (results.isNotEmpty)
                  SizedBox(
                    height: 300,
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: results.length,
                      itemBuilder: (context, index) {
                        final result = results[index];
                        return ListTile(
                          leading: Icon(
                            result.role.name == 'user'
                                ? Icons.person
                                : Icons.smart_toy,
                          ),
                          title: Text(
                            result.content.length > 100
                                ? '${result.content.substring(0, 100)}...'
                                : result.content,
                          ),
                          subtitle: Text(
                            _formatDateTime(result.createdAt),
                          ),
                        );
                      },
                    ),
                  )
                else if (searchController.text.isNotEmpty)
                  const Text('Tidak ada hasil ditemukan'),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Tutup'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _exportToText() async {
    setState(() => _isExporting = true);
    
    try {
      final messages = await _memoryService.exportConversations(
        shopId: widget.shopId,
      );

      final buffer = StringBuffer();
      buffer.writeln('=== Rupavo Chat History ===');
      buffer.writeln('Shop ID: ${widget.shopId}');
      buffer.writeln('Export Date: ${DateTime.now()}');
      buffer.writeln('');

      for (final msg in messages) {
        final role = msg['role'] == 'user' ? '👤 User' : '🤖 Rupavo';
        final time = msg['created_at'];
        buffer.writeln('[$time] $role:');
        buffer.writeln(msg['content']);
        buffer.writeln('---');
      }

      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/chat_history.txt');
      await file.writeAsString(buffer.toString());

      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'Rupavo Chat History',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }

  Future<void> _exportToJson() async {
    setState(() => _isExporting = true);
    
    try {
      final messages = await _memoryService.exportConversations(
        shopId: widget.shopId,
      );

      final exportData = {
        'shop_id': widget.shopId,
        'export_date': DateTime.now().toIso8601String(),
        'messages': messages,
      };

      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/chat_history.json');
      await file.writeAsString(const JsonEncoder.withIndent('  ').convert(exportData));

      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'Rupavo Chat History (JSON)',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }

  Future<void> _deleteThread(ConversationThread thread) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Percakapan?'),
        content: Text('Hapus ${thread.messageCount} chat dalam thread ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _memoryService.deleteThread(
        shopId: widget.shopId,
        threadId: thread.threadId,
      );
      
      if (success) {
        _loadData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Thread dihapus')),
          );
        }
      }
    }
  }

  Future<void> _clearAllHistory() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('⚠️ Hapus Semua History?'),
        content: const Text(
          'Ini akan menghapus SEMUA percakapan chat. Tindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Hapus Semua'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _memoryService.clearAllConversations(
        shopId: widget.shopId,
      );
      
      if (success) {
        _loadData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Semua history dihapus')),
          );
        }
      }
    }
  }

  String _formatDateTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    
    if (diff.inMinutes < 60) {
      return '${diff.inMinutes} menit lalu';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} jam lalu';
    } else if (diff.inDays == 1) {
      return 'Kemarin';
    } else {
      return '${dt.day}/${dt.month}/${dt.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📜 Chat History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _showSearchDialog,
            tooltip: 'Cari',
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'export_txt':
                  _exportToText();
                  break;
                case 'export_json':
                  _exportToJson();
                  break;
                case 'clear_all':
                  _clearAllHistory();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'export_txt',
                child: Row(
                  children: [
                    Icon(Icons.text_snippet, size: 20),
                    SizedBox(width: 8),
                    Text('Export ke Text'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'export_json',
                child: Row(
                  children: [
                    Icon(Icons.code, size: 20),
                    SizedBox(width: 8),
                    Text('Export ke JSON'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'clear_all',
                child: Row(
                  children: [
                    Icon(Icons.delete_forever, size: 20, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Hapus Semua', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // AI Knowledge Summary Card
                  if (_aiKnowledge != null) _buildKnowledgeCard(),
                  
                  const SizedBox(height: 24),
                  
                  // Export in progress indicator
                  if (_isExporting)
                    const LinearProgressIndicator(),
                  
                  // Thread List Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Percakapan (${_threads.length})',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Thread List
                  if (_threads.isEmpty)
                    _buildEmptyState()
                  else
                    ..._threads.map((thread) => _buildThreadCard(thread)),
                ],
              ),
            ),
    );
  }

  Widget _buildKnowledgeCard() {
    final knowledge = _aiKnowledge!;
    
    return Card(
      color: AppTheme.lightPrimary.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.psychology, color: AppTheme.lightPrimary),
                const SizedBox(width: 8),
                Text(
                  '🧠 Apa yang AI Ketahui',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.lightPrimary,
                  ),
                ),
              ],
            ),
            const Divider(),
            _buildKnowledgeRow('Toko', knowledge.shopName.isNotEmpty ? knowledge.shopName : 'Belum diketahui'),
            _buildKnowledgeRow('Jenis Usaha', knowledge.businessType.isNotEmpty ? knowledge.businessType : 'Belum diketahui'),
            if (knowledge.products.isNotEmpty)
              _buildKnowledgeRow('Produk', knowledge.products.join(', ')),
            if (knowledge.preferences.isNotEmpty)
              _buildKnowledgeRow('Preferensi', knowledge.preferences.join(', ')),
            _buildKnowledgeRow('Total Chat', '${knowledge.totalMessages} chat'),
          ],
        ),
      ),
    );
  }

  Widget _buildKnowledgeRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildThreadCard(ConversationThread thread) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: () => _resumeChat(thread),
        leading: CircleAvatar(
          backgroundColor: AppTheme.lightPrimary.withOpacity(0.2),
          child: const Icon(Icons.chat_bubble_outline, color: AppTheme.lightPrimary),
        ),
        title: Text(
          thread.lastMessage.length > 50
              ? '${thread.lastMessage.substring(0, 50)}...'
              : thread.lastMessage,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          '${thread.messageCount} chat • ${_formatDateTime(thread.lastMessageTime)}',
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.play_arrow, color: AppTheme.lightPrimary),
              tooltip: 'Lanjutkan Chat',
              onPressed: () => _resumeChat(thread),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              tooltip: 'Hapus',
              onPressed: () => _deleteThread(thread),
            ),
          ],
        ),
      ),
    );
  }

  void _resumeChat(ConversationThread thread) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(
          shopId: widget.shopId,
          resumeThreadId: thread.threadId,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada percakapan',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Mulai chat dengan Rupavo AI',
            style: TextStyle(color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }
}
