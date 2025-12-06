import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/screens/sales_screen.dart';
import '../../helpers/pump_app.dart';

void main() {
  group('SalesScreen', () {
    testWidgets('renders correctly with title', (tester) async {
      // Arrange & Act
      await tester.pumpApp(const SalesScreen(shopId: 'test-shop-id'));

      // Assert
      expect(find.text('Riwayat Penjualan'), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('displays placeholder content', (tester) async {
      // Arrange & Act
      await tester.pumpApp(const SalesScreen(shopId: 'test-shop-id'));

      // Assert
      expect(find.text('Sales History Placeholder'), findsOneWidget);
    });
  });
}
