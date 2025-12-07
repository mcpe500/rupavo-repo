import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:rupavo_merchant_app/services/balance_service.dart';
import 'package:rupavo_merchant_app/services/logger_service.dart';

class WithdrawScreen extends StatefulWidget {
  final String shopId;

  const WithdrawScreen({super.key, required this.shopId});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  final BalanceService _balanceService = BalanceService();
  
  ShopBalance? _balance;
  List<Payout> _payouts = [];
  BankSettings? _bankSettings;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        _balanceService.getShopBalance(widget.shopId),
        _balanceService.getPayoutHistory(widget.shopId),
        _balanceService.getBankSettings(widget.shopId),
      ]);

      setState(() {
        _balance = results[0] as ShopBalance;
        _payouts = results[1] as List<Payout>;
        _bankSettings = results[2] as BankSettings?;
        _isLoading = false;
      });
    } catch (e) {
      LoggerService.error('Error loading withdraw data', e);
      setState(() {
        _error = 'Gagal memuat data';
        _isLoading = false;
      });
    }
  }

  void _showWithdrawDialog() {
    if (_bankSettings == null || !_bankSettings!.isComplete) {
      // Show a more visible dialog instead of SnackBar
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Pengaturan Rekening'),
          content: const Text(
            'Silakan atur rekening bank Anda terlebih dahulu untuk melakukan penarikan dana.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Nanti'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _showBankSettingsDialog();
              },
              child: const Text('Atur Sekarang'),
            ),
          ],
        ),
      );
      return;
    }

    final controller = TextEditingController();
    final availableBalance = _balance?.availableBalance ?? 0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Tarik Dana',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Saldo Tersedia', style: TextStyle(fontSize: 12)),
                  Text(
                    'Rp ${availableBalance.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: InputDecoration(
                labelText: 'Jumlah Penarikan',
                prefixText: 'Rp ',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                hintText: 'Minimal Rp 10.000',
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.account_balance, color: Colors.blue, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _bankSettings!.bankName ?? '',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${_bankSettings!.accountNumber} - ${_bankSettings!.accountHolder}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(controller.text) ?? 0;
                if (amount < 10000) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Minimal penarikan Rp 10.000')),
                  );
                  return;
                }
                if (amount > availableBalance) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Saldo tidak mencukupi')),
                  );
                  return;
                }

                Navigator.pop(context);
                await _submitWithdrawal(amount);
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Tarik Dana'),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Future<void> _submitWithdrawal(double amount) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    try {
      final response = await _balanceService.requestPayout(
        shopId: widget.shopId,
        amount: amount,
      );

      Navigator.pop(context); // Close loading

      if (response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message ?? 'Permintaan penarikan berhasil'),
            backgroundColor: Colors.green,
          ),
        );
        _loadData(); // Refresh data
      } else {
        throw Exception(response.error ?? 'Failed');
      }
    } catch (e) {
      Navigator.pop(context); // Close loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showBankSettingsDialog() {
    final bankNameController = TextEditingController(text: _bankSettings?.bankName ?? '');
    final accountNumberController = TextEditingController(text: _bankSettings?.accountNumber ?? '');
    final accountHolderController = TextEditingController(text: _bankSettings?.accountHolder ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Pengaturan Rekening Bank',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: bankNameController.text.isNotEmpty ? bankNameController.text : null,
              decoration: InputDecoration(
                labelText: 'Nama Bank',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
              items: const [
                DropdownMenuItem(value: 'BCA', child: Text('BCA')),
                DropdownMenuItem(value: 'BNI', child: Text('BNI')),
                DropdownMenuItem(value: 'BRI', child: Text('BRI')),
                DropdownMenuItem(value: 'Mandiri', child: Text('Mandiri')),
                DropdownMenuItem(value: 'CIMB Niaga', child: Text('CIMB Niaga')),
                DropdownMenuItem(value: 'Permata', child: Text('Permata')),
                DropdownMenuItem(value: 'Danamon', child: Text('Danamon')),
                DropdownMenuItem(value: 'BSI', child: Text('BSI')),
                DropdownMenuItem(value: 'BTN', child: Text('BTN')),
                DropdownMenuItem(value: 'Jago', child: Text('Bank Jago')),
                DropdownMenuItem(value: 'Jenius', child: Text('Jenius/BTPN')),
                DropdownMenuItem(value: 'SeaBank', child: Text('SeaBank')),
              ],
              onChanged: (value) {
                bankNameController.text = value ?? '';
              },
            ),
            const SizedBox(height: 12),
            TextField(
              controller: accountNumberController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Nomor Rekening',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: accountHolderController,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: 'Nama Pemilik Rekening',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                if (bankNameController.text.isEmpty ||
                    accountNumberController.text.isEmpty ||
                    accountHolderController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Lengkapi semua data')),
                  );
                  return;
                }

                try {
                  await _balanceService.updateBankSettings(
                    shopId: widget.shopId,
                    bankName: bankNameController.text,
                    accountNumber: accountNumberController.text,
                    accountHolder: accountHolderController.text,
                  );

                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Rekening bank berhasil disimpan'),
                      backgroundColor: Colors.green,
                    ),
                  );
                  _loadData();
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Gagal menyimpan: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Simpan'),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'processing':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tarik Dana'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_balance),
            onPressed: _showBankSettingsDialog,
            tooltip: 'Pengaturan Rekening',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadData,
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Balance Card
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.green.shade400, Colors.green.shade700],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Saldo Tersedia',
                                style: TextStyle(color: Colors.white70, fontSize: 14),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Rp ${(_balance?.availableBalance ?? 0).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if ((_balance?.pendingWithdrawal ?? 0) > 0) ...[
                                const SizedBox(height: 8),
                                Text(
                                  'Pending: Rp ${(_balance?.pendingWithdrawal ?? 0).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                                  style: const TextStyle(color: Colors.white70),
                                ),
                              ],
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: (_balance?.availableBalance ?? 0) >= 10000
                                      ? _showWithdrawDialog
                                      : null,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: Colors.green.shade700,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  child: const Text(
                                    'Tarik Dana',
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Withdrawal History
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Riwayat Penarikan',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          if (_payouts.isNotEmpty)
                            Text(
                              '${_payouts.length} transaksi',
                              style: TextStyle(color: Colors.grey[600], fontSize: 12),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      if (_payouts.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          alignment: Alignment.center,
                          child: Column(
                            children: [
                              Icon(Icons.history, size: 48, color: Colors.grey[400]),
                              const SizedBox(height: 8),
                              Text(
                                'Belum ada riwayat penarikan',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        )
                      else
                        ...(_payouts.map((payout) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _getStatusColor(payout.status).withOpacity(0.1),
                              child: Icon(
                                payout.status == 'completed'
                                    ? Icons.check
                                    : payout.status == 'failed'
                                        ? Icons.close
                                        : Icons.access_time,
                                color: _getStatusColor(payout.status),
                              ),
                            ),
                            title: Text(
                              'Rp ${payout.amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              '${payout.bankName} • ${_formatDate(payout.requestedAt)}',
                              style: const TextStyle(fontSize: 12),
                            ),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusColor(payout.status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                payout.statusLabel,
                                style: TextStyle(
                                  color: _getStatusColor(payout.status),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        )).toList()),
                    ],
                  ),
                ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return '${date.day} ${months[date.month]} ${date.year}';
  }
}
