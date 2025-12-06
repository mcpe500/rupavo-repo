import 'package:flutter/material.dart';
import 'package:rupavo_merchant_app/models/shop.dart';
import 'package:rupavo_merchant_app/services/auth_service.dart';
import 'package:rupavo_merchant_app/screens/product_list_screen.dart';
import 'package:rupavo_merchant_app/screens/product_list_screen.dart';
import 'package:rupavo_merchant_app/screens/sales_screen.dart';
import 'package:rupavo_merchant_app/screens/chat_screen.dart';

class DashboardScreen extends StatefulWidget {
  final Shop shop;
  final AuthService? authService;

  const DashboardScreen({super.key, required this.shop, this.authService});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      HomeScreen(shop: widget.shop, authService: widget.authService),
      ChatScreen(shopId: widget.shop.id),
      ProductListScreen(shopId: widget.shop.id),
      SalesScreen(shopId: widget.shop.id),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble),
            label: 'Coach',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: 'Produk',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Penjualan', // Sales
          ),
        ],
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  final Shop shop;
  final AuthService? authService;

  const HomeScreen({super.key, required this.shop, this.authService});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(shop.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {}, // Profile placeholder
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => (authService ?? AuthService()).signOut(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildPrimaryStatCard(
            context,
            title: 'Pendapatan Hari Ini',
            value: 'Rp 350.000', // Mock data match web
            trend: '+5%',
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildSecondaryStatCard(
                  context,
                  title: 'Pesanan',
                  value: '12',
                  icon: Icons.shopping_bag,
                  color: Colors.orange,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildSecondaryStatCard(
                  context,
                  title: 'Pengunjung',
                  value: '210',
                  icon: Icons.people,
                  color: Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Removed Action Grid to match web's clean look
        ],
      ),
    );
  }

  Widget _buildPrimaryStatCard(BuildContext context,
      {required String title, required String value, required String trend}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey[600],
            )),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.displaySmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.primary, // Green
            )),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.trending_up, size: 16, color: Colors.green),
                const SizedBox(width: 4),
                Text(trend, style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                const SizedBox(width: 4),
                Text('dari kemarin', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecondaryStatCard(BuildContext context,
      {required String title,
      required String value,
      required IconData icon,
      required Color color}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(title, style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            )),
            const SizedBox(height: 4),
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            )),
          ],
        ),
      ),
    );
  }
}
