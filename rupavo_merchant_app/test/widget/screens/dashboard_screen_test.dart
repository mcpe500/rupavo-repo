// Widget tests for DashboardScreen
// Tests navigation and UI components

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/screens/dashboard_screen.dart';
import 'package:rupavo_merchant_app/models/shop.dart';
import '../../helpers/pump_app.dart';
import '../../helpers/mock_services.dart';

void main() {
  late Shop testShop;
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
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
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Assert
      expect(find.byType(NavigationBar), findsOneWidget);
      expect(find.byType(NavigationDestination), findsNWidgets(4));
    });

    testWidgets('should show correct navigation labels', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Assert
      expect(find.text('Beranda'), findsOneWidget);
      expect(find.text('Coach'), findsOneWidget);
      expect(find.text('Produk'), findsOneWidget);
      expect(find.text('Penjualan'), findsOneWidget);
    });

    testWidgets('should display shop name in AppBar on home', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Assert
      expect(find.text('Test Shop Name'), findsOneWidget);
    });

    testWidgets('should have logout button in AppBar', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Assert
      expect(find.byIcon(Icons.logout), findsOneWidget);
    });

    testWidgets('should show home screen by default and display new stats', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Assert - HomeScreen specific elements
      expect(find.text('Pendapatan Hari Ini'), findsOneWidget);
      expect(find.text('Rp 350.000'), findsOneWidget);
      expect(find.text('Pesanan'), findsOneWidget);
      expect(find.text('Pengunjung'), findsOneWidget);
    });

    testWidgets('should change page when navigation destination tapped', (tester) async {
      // Arrange
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Verify we're on home
      expect(find.text('Pendapatan Hari Ini'), findsOneWidget);

      // Act - tap on Produk tab
      await tester.tap(find.text('Produk'));
      await tester.pumpAndSettle();

      // Assert - HomeScreen content should not be visible
      expect(find.text('Pendapatan Hari Ini'), findsNothing);
      expect(find.byType(ListView), findsOneWidget); // Product list has list view
    });
  });

  group('HomeScreen', () {
    testWidgets('stats cards should be wrapped in Card widgets', (tester) async {
      // Arrange & Act
      await tester.pumpApp(DashboardScreen(shop: testShop, authService: mockAuthService));

      // Assert
      expect(find.byType(Card), findsAtLeastNWidgets(3)); // 1 Primary, 2 Secondary
    });
  });
}
