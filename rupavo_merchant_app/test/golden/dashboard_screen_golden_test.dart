// Golden tests for DashboardScreen
// Captures pixel-perfect screenshots for visual regression testing

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/screens/dashboard_screen.dart';
import 'package:rupavo_merchant_app/models/shop.dart';

void main() {
  late Shop testShop;

  setUp(() {
    testShop = Shop(
      id: 'test-shop-id',
      ownerId: 'test-owner-id',
      name: 'Warung Makan Barokah',
      slug: 'warung-makan-barokah',
      description: 'Warung makan dengan masakan rumahan',
      businessType: 'f&b',
      createdAt: DateTime(2024, 1, 1),
      updatedAt: DateTime(2024, 1, 1),
    );
  });

  group('DashboardScreen Golden Tests', () {
    testWidgets('matches golden file - home tab light mode', (tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: DashboardScreen(shop: testShop),
        ),
      );
      await tester.pumpAndSettle();

      // Assert
      await expectLater(
        find.byType(DashboardScreen),
        matchesGoldenFile('goldens/dashboard_home_light.png'),
      );
    });

    testWidgets('matches golden file - home tab dark mode', (tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: DashboardScreen(shop: testShop),
        ),
      );
      await tester.pumpAndSettle();

      // Assert
      await expectLater(
        find.byType(DashboardScreen),
        matchesGoldenFile('goldens/dashboard_home_dark.png'),
      );
    });
  });
}
