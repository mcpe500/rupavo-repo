import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';

class ReportScreen extends StatefulWidget {
  final String shopId;

  const ReportScreen({super.key, required this.shopId});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen>
    with SingleTickerProviderStateMixin {
  final SupabaseFunctionsService _functionsService = SupabaseFunctionsService();
  final SupabaseClient _supabase = Supabase.instance.client;
  late TabController _tabController;

  ReportPeriod _selectedPeriod = ReportPeriod.days7;
  
  // Separate loading states for progressive loading
  bool _isLoadingMetrics = true;
  bool _isLoadingAI = false;
  
  // Hard data (instant from DB)
  ReportMetrics? _metrics;
  
  // Soft data (lazy from AI)
  String? _aiNarrative;
  List<String>? _actionItems;
  
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    // Load metrics first (fast)
    _fetchMetrics();
    // Load AI analysis in parallel (slow)
    _fetchAIAnalysis();
  }

  Future<void> _fetchMetrics() async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingMetrics = true;
      _error = null;
    });

    try {
      // Calculate date range based on period
      final now = DateTime.now();
      DateTime startDate;
      switch (_selectedPeriod) {
        case ReportPeriod.today:
          startDate = DateTime(now.year, now.month, now.day);
          break;
        case ReportPeriod.days7:
          startDate = now.subtract(const Duration(days: 7));
          break;
        case ReportPeriod.days30:
          startDate = now.subtract(const Duration(days: 30));
          break;
        case ReportPeriod.custom:
          startDate = now.subtract(const Duration(days: 7)); // Default to 7 days for custom
          break;
      }

      // Fetch orders for metrics
      final ordersResponse = await _supabase
          .from('orders')
          .select('total_amount, status')
          .eq('shop_id', widget.shopId)
          .gte('created_at', startDate.toIso8601String())
          .isFilter('deleted_at', null);

      final orders = ordersResponse as List;
      
      // Calculate metrics
      double totalRevenue = 0;
      int completedOrders = 0;
      for (final order in orders) {
        totalRevenue += (order['total_amount'] as num?)?.toDouble() ?? 0;
        if (order['status'] == 'completed') completedOrders++;
      }
      
      final avgOrderValue = orders.isNotEmpty ? totalRevenue / orders.length : 0.0;

      // Fetch top products
      final topProductsResponse = await _supabase
          .from('order_items')
          .select('product_id, quantity, products(name)')
          .eq('products.shop_id', widget.shopId);
      
      // Aggregate top products (simplified)
      final productSales = <String, TopProduct>{};
      for (final item in (topProductsResponse as List)) {
        final productName = item['products']?['name'] ?? 'Unknown';
        final qty = item['quantity'] as int? ?? 0;
        if (productSales.containsKey(productName)) {
          productSales[productName] = TopProduct(
            name: productName,
            quantity: productSales[productName]!.quantity + qty,
            revenue: productSales[productName]!.revenue,
          );
        } else {
          productSales[productName] = TopProduct(
            name: productName, 
            quantity: qty, 
            revenue: 0,
          );
        }
      }
      
      final topProducts = productSales.values.toList()
        ..sort((a, b) => b.quantity.compareTo(a.quantity));

      if (!mounted) return;
      setState(() {
        _metrics = ReportMetrics(
          totalRevenue: totalRevenue,
          totalOrders: orders.length,
          averageOrderValue: avgOrderValue,
          completedOrders: completedOrders,
          cancelledOrders: orders.where((o) => o['status'] == 'cancelled').length,
          topProducts: topProducts.take(5).toList(),
        );
        _isLoadingMetrics = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoadingMetrics = false;
      });
    }
  }

  Future<void> _fetchAIAnalysis() async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingAI = true;
    });

    try {
      final response = await _functionsService.generateReport(
        shopId: widget.shopId,
        period: _selectedPeriod,
      );

      if (!mounted) return;

      if (response.success && response.data != null) {
        setState(() {
          _aiNarrative = response.data!.narrative;
          _actionItems = response.data!.actionItems;
        });
      }
    } catch (e) {
      debugPrint('AI analysis error: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingAI = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Ringkasan'),
            Tab(text: 'Transaksi'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSummaryTab(),
          TransactionListTab(shopId: widget.shopId),
        ],
      ),
    );
  }

  Widget _buildSummaryTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Period Selector
          SegmentedButton<ReportPeriod>(
            segments: const [
              ButtonSegment(value: ReportPeriod.today, label: Text('Hari Ini')),
              ButtonSegment(value: ReportPeriod.days7, label: Text('7 Hari')),
              ButtonSegment(value: ReportPeriod.days30, label: Text('30 Hari')),
            ],
            selected: {_selectedPeriod},
            onSelectionChanged: (Set<ReportPeriod> newSelection) {
              setState(() {
                _selectedPeriod = newSelection.first;
              });
              _loadData();
            },
          ),
          const SizedBox(height: 24),

          // METRICS (instant loading)
          if (_isLoadingMetrics)
            _buildMetricsShimmer()
          else if (_error != null)
            Center(child: Text('Error: $_error'))
          else if (_metrics != null) ...[
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _buildMetricCard('Total Pendapatan',
                    'Rp ${_metrics!.totalRevenue.toStringAsFixed(0)}', Colors.green, Icons.attach_money),
                _buildMetricCard('Total Pesanan',
                    '${_metrics!.totalOrders}', Colors.blue, Icons.shopping_bag),
                _buildMetricCard('Rata-rata Order',
                    'Rp ${_metrics!.averageOrderValue.toStringAsFixed(0)}', Colors.orange, Icons.trending_up),
                _buildMetricCard('Pesanan Selesai',
                    '${_metrics!.completedOrders}', Colors.purple, Icons.check_circle),
              ],
            ),
            const SizedBox(height: 24),

            // TOP PRODUCTS
            Text('Produk Terlaris', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            if (_metrics!.topProducts.isEmpty)
              const Text('Belum ada data penjualan')
            else
              ..._metrics!.topProducts.map((p) => ListTile(
                title: Text(p.name),
                subtitle: Text('${p.quantity} terjual'),
                leading: CircleAvatar(
                  backgroundColor: Colors.grey[200],
                  child: Text('${_metrics!.topProducts.indexOf(p) + 1}'),
                ),
              )),
          ],

          const SizedBox(height: 24),

          // AI ANALYSIS (lazy loading with shimmer)
          _buildAIAnalysisSection(),
        ],
      ),
    );
  }

  Widget _buildMetricsShimmer() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: List.generate(4, (_) => Card(
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(width: 32, height: 32, color: Colors.grey[300]),
              const Spacer(),
              Container(width: 60, height: 12, color: Colors.grey[300]),
              const SizedBox(height: 8),
              Container(width: 80, height: 20, color: Colors.grey[300]),
            ],
          ),
        ),
      )),
    );
  }

  Widget _buildAIAnalysisSection() {
    return Card(
      color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.2),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.auto_awesome, color: Theme.of(context).primaryColor),
                const SizedBox(width: 8),
                Text(
                  'Analisis AI',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                      ),
                ),
                if (_isLoadingAI) ...[
                  const SizedBox(width: 8),
                  const SizedBox(
                    width: 16, height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 12),
            
            if (_isLoadingAI)
              _buildAIShimmer()
            else if (_aiNarrative != null) ...[
              Text(
                _aiNarrative!,
                style: const TextStyle(fontSize: 16, height: 1.5),
              ),
              if (_actionItems != null && _actionItems!.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Text('Rekomendasi Aksi:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._actionItems!.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                      Expanded(child: Text(item)),
                    ],
                  ),
                )),
              ],
            ] else
              const Text('Analisis AI sedang disiapkan...'),
          ],
        ),
      ),
    );
  }

  Widget _buildAIShimmer() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(width: double.infinity, height: 14, color: Colors.grey[300]),
        const SizedBox(height: 8),
        Container(width: double.infinity, height: 14, color: Colors.grey[300]),
        const SizedBox(height: 8),
        Container(width: 200, height: 14, color: Colors.grey[300]),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, Color color, IconData icon) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color),
            const Spacer(),
            Text(title, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

// ============ TRANSACTION LIST TAB ============

class TransactionListTab extends StatefulWidget {
  final String shopId;

  const TransactionListTab({super.key, required this.shopId});

  @override
  State<TransactionListTab> createState() => _TransactionListTabState();
}

class _TransactionListTabState extends State<TransactionListTab> {
  final SupabaseClient _supabase = Supabase.instance.client;
  final TextEditingController _searchController = TextEditingController();
  
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = true;
  String _typeFilter = 'all'; // all, sale, expense
  String _periodFilter = '7days'; // today, 7days, 30days

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Calculate date filter
      final now = DateTime.now();
      DateTime startDate;
      switch (_periodFilter) {
        case 'today':
          startDate = DateTime(now.year, now.month, now.day);
          break;
        case '30days':
          startDate = now.subtract(const Duration(days: 30));
          break;
        default: // 7days
          startDate = now.subtract(const Duration(days: 7));
      }

      // Fetch orders (sales)
      List<Map<String, dynamic>> transactions = [];

      if (_typeFilter == 'all' || _typeFilter == 'sale') {
        final ordersResponse = await _supabase
            .from('orders')
            .select('id, total_amount, buyer_name, created_at, status')
            .eq('shop_id', widget.shopId)
            .gte('created_at', startDate.toIso8601String())
            .isFilter('deleted_at', null)
            .order('created_at', ascending: false);

        for (final order in (ordersResponse as List)) {
          transactions.add({
            'id': order['id'],
            'type': 'sale',
            'description': order['buyer_name'] ?? 'Penjualan',
            'amount': order['total_amount'],
            'created_at': order['created_at'],
          });
        }
      }

      if (_typeFilter == 'all' || _typeFilter == 'expense') {
        final expensesResponse = await _supabase
            .from('expenses')
            .select('id, description, amount, category, created_at')
            .eq('shop_id', widget.shopId)
            .gte('created_at', startDate.toIso8601String())
            .isFilter('deleted_at', null)
            .order('created_at', ascending: false);

        for (final expense in (expensesResponse as List)) {
          transactions.add({
            'id': expense['id'],
            'type': 'expense',
            'description': expense['description'],
            'amount': expense['amount'],
            'category': expense['category'],
            'created_at': expense['created_at'],
          });
        }
      }

      // Sort by date
      transactions.sort((a, b) => 
          DateTime.parse(b['created_at']).compareTo(DateTime.parse(a['created_at'])));

      // Apply search filter
      final searchQuery = _searchController.text.toLowerCase();
      if (searchQuery.isNotEmpty) {
        transactions = transactions.where((t) => 
            t['description'].toString().toLowerCase().contains(searchQuery)).toList();
      }

      setState(() {
        _transactions = transactions;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading transactions: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inDays == 0) {
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } else if (diff.inDays == 1) {
      return 'Kemarin';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} hari lalu';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Cari transaksi...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onChanged: (_) => _loadTransactions(),
          ),
        ),

        // Filters
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Type filter
              DropdownButton<String>(
                value: _typeFilter,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('Semua')),
                  DropdownMenuItem(value: 'sale', child: Text('Penjualan')),
                  DropdownMenuItem(value: 'expense', child: Text('Pengeluaran')),
                ],
                onChanged: (value) {
                  setState(() { _typeFilter = value!; });
                  _loadTransactions();
                },
              ),
              const SizedBox(width: 16),
              // Period filter
              DropdownButton<String>(
                value: _periodFilter,
                items: const [
                  DropdownMenuItem(value: 'today', child: Text('Hari Ini')),
                  DropdownMenuItem(value: '7days', child: Text('7 Hari')),
                  DropdownMenuItem(value: '30days', child: Text('30 Hari')),
                ],
                onChanged: (value) {
                  setState(() { _periodFilter = value!; });
                  _loadTransactions();
                },
              ),
            ],
          ),
        ),

        const SizedBox(height: 8),

        // Transaction list
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _transactions.isEmpty
                  ? const Center(child: Text('Belum ada transaksi'))
                  : RefreshIndicator(
                      onRefresh: _loadTransactions,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _transactions.length,
                        itemBuilder: (context, index) {
                          final tx = _transactions[index];
                          final isSale = tx['type'] == 'sale';
                          final amount = (tx['amount'] as num).toDouble();
                          
                          return Card(
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: isSale ? Colors.green[100] : Colors.red[100],
                                child: Icon(
                                  isSale ? Icons.arrow_downward : Icons.arrow_upward,
                                  color: isSale ? Colors.green : Colors.red,
                                ),
                              ),
                              title: Text(tx['description'] ?? 'Transaksi'),
                              subtitle: Text(
                                '${_formatDate(tx['created_at'])} • ${isSale ? 'Penjualan' : 'Pengeluaran'}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              ),
                              trailing: Text(
                                '${isSale ? '+' : '-'}Rp ${amount.toStringAsFixed(0)}',
                                style: TextStyle(
                                  color: isSale ? Colors.green : Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }
}
