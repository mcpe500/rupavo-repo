import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';

class ReportScreen extends StatefulWidget {
  final String shopId;

  const ReportScreen({super.key, required this.shopId});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final SupabaseFunctionsService _functionsService = SupabaseFunctionsService();
  ReportPeriod _selectedPeriod = ReportPeriod.days7;
  bool _isLoading = false;
  ReportData? _reportData;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchReport();
  }

  Future<void> _fetchReport() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _functionsService.generateReport(
        shopId: widget.shopId,
        period: _selectedPeriod,
      );

      if (!mounted) return;

      if (response.success && response.data != null) {
        setState(() {
          _reportData = response.data;
        });
      } else {
        setState(() {
          _error = response.error ?? 'Gagal memuat laporan';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Laporan Bisnis')),
      body: RefreshIndicator(
        onRefresh: _fetchReport,
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
                _fetchReport();
              },
            ),
            const SizedBox(height: 24),

            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              Center(child: Text('Error: $_error'))
            else if (_reportData != null) ...[
              // Metrics Cards
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.5,
                children: [
                  _buildMetricCard(
                    'Total Pendapatan',
                    'Rp ${_reportData!.metrics.totalRevenue.toStringAsFixed(0)}',
                    Colors.green,
                    Icons.attach_money,
                  ),
                  _buildMetricCard(
                    'Total Pesanan',
                    '${_reportData!.metrics.totalOrders}',
                    Colors.blue,
                    Icons.shopping_bag,
                  ),
                  _buildMetricCard(
                    'Rata-rata Order',
                    'Rp ${_reportData!.metrics.averageOrderValue.toStringAsFixed(0)}',
                    Colors.orange,
                    Icons.trending_up,
                  ),
                  _buildMetricCard(
                    'Pesanan Selesai',
                    '${_reportData!.metrics.completedOrders}',
                    Colors.purple,
                    Icons.check_circle,
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // AI Insight Card
              Card(
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
                            'Analisis Rupavo AI',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).primaryColor,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _reportData!.narrative,
                        style: const TextStyle(fontSize: 16, height: 1.5),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Rekomendasi Aksi:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      ..._reportData!.actionItems.map((item) => Padding(
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
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              Text('Produk Terlaris', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              
              if (_reportData!.metrics.topProducts.isEmpty)
                const Text('Belum ada data penjualan')
              else
                ..._reportData!.metrics.topProducts.map((p) => ListTile(
                  title: Text(p.name),
                  subtitle: Text('${p.quantity} terjual'),
                  trailing: Text('Rp ${p.revenue.toStringAsFixed(0)}'),
                  leading: CircleAvatar(
                    backgroundColor: Colors.grey[200],
                    child: Text('${_reportData!.metrics.topProducts.indexOf(p) + 1}'),
                  ),
                )),
            ],
          ],
        ),
      ),
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
