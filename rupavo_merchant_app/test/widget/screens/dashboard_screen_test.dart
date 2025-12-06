// Widget tests for DashboardScreen
// Tests navigation and UI components

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/screens/dashboard_screen.dart';
import 'package:rupavo_merchant_app/models/shop.dart';
import '../helpers/pump_app.dart';

void main() {
  late Shop testShop;

  setUp(() {
    testShop = Shop(
      id: 'test-shop-id',
      ownerId: 'test-owner-id',
      name: 'Test Shop Name',
      slug: 'test-shop',
      description: 'A test shop for testing',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  });

  group('DashboardScreen', () {
    testWidgets('should display navigation bar with 4 destinations', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.byType(NavigationBar), findsOneWidget);
      expect(find.byType(NavigationDestination), findsNWidgets(4));
    });

    testWidgets('should show correct navigation labels', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.text('Beranda'), findsOneWidget);
      expect(find.text('Produk'), findsOneWidget);
      expect(find.text('Laporan'), findsOneWidget);
      expect(find.text('Coach'), findsOneWidget);
    });

    testWidgets('should display shop name in AppBar on home', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.text('Test Shop Name'), findsOneWidget);
    });

    testWidgets('should have logout button in AppBar', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.byIcon(Icons.logout), findsOneWidget);
    });

    testWidgets('should show home screen by default', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert - HomeScreen specific elements
      expect(find.text('Penjualan Hari Ini'), findsOneWidget);
      expect(find.text('Pesanan Baru'), findsOneWidget);
      expect(find.text('Aksi Cepat'), findsOneWidget);
    });

    testWidgets('should display summary cards', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.text('Rp 0'), findsOneWidget); // Sales today
      expect(find.byIcon(Icons.attach_money), findsOneWidget);
      expect(find.byIcon(Icons.shopping_bag), findsOneWidget);
    });

    testWidgets('should display quick action cards', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.text('Tambah Produk'), findsOneWidget);
      expect(find.text('Bagikan Toko'), findsOneWidget);
      expect(find.byIcon(Icons.add_box), findsOneWidget);
      expect(find.byIcon(Icons.share), findsOneWidget);
    });

    testWidgets('should change page when navigation destination tapped', (tester) async {
      // Arrange
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Verify we're on home
      expect(find.text('Penjualan Hari Ini'), findsOneWidget);

      // Act - tap on Produk tab
      await tester.tap(find.text('Produk'));
      await tester.pumpAndSettle();

      // Assert - HomeScreen content should not be visible
      // ProductListScreen should be displayed (look for its elements)
      expect(find.text('Penjualan Hari Ini'), findsNothing);
    });
  });

  group('HomeScreen', () {
    testWidgets('summary cards should be wrapped in Card widgets', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert
      expect(find.byType(Card), findsAtLeastNWidgets(2));
    });

    testWidgets('quick actions should be in a Row', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop));

      // Assert - The Row containing quick actions
      expect(find.byType(Row), findsAtLeastNWidgets(1));
    });
  });
}
