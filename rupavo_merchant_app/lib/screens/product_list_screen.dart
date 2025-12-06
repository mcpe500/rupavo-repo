import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/models/product.dart';
import 'package:rupavo_merchant_app/screens/add_product_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProductListScreen extends StatefulWidget {
  final String shopId;

  const ProductListScreen({super.key, required this.shopId});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _supabase = Supabase.instance.client;

  Stream<List<Product>> _getProducts() {
    return _supabase
        .from('products')
        .stream(primaryKey: ['id'])
        .eq('shop_id', widget.shopId)
        .order('created_at')
        .map((maps) => maps.map((map) => Product.fromJson(map)).toList());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Produk')),
      body: StreamBuilder<List<Product>>(
        stream: _getProducts(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final products = snapshot.data!;
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('Belum ada produk'),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => _navigateToAddProduct(context),
                    child: const Text('Tambah Produk Pertama'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: product.imageUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(product.imageUrl!, fit: BoxFit.cover),
                          )
                        : Icon(Icons.inventory_2, color: Theme.of(context).colorScheme.onSurfaceVariant),
                  ),
                  title: Text(product.name),
                  subtitle: Text('Stok: ${product.stock}'),
                  trailing: Text(
                    'Rp ${product.price.toStringAsFixed(0)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateToAddProduct(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _navigateToAddProduct(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddProductScreen(shopId: widget.shopId),
      ),
    );
  }
}
