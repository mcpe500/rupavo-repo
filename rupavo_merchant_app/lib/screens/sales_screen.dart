import 'package:flutter/material.dart';

class SalesScreen extends StatelessWidget {
  final String shopId;

  const SalesScreen({super.key, required this.shopId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Penjualan'),
      ),
      body: const Center(
        child: Text('Sales History Placeholder'),
      ),
    );
  }
}
