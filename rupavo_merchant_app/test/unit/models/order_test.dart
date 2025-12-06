// Unit tests for Order and OrderItem models
// Tests serialization, deserialization, and enum parsing

import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/models/order.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('OrderStatus', () {
    group('fromString', () {
      test('should parse valid status strings', () {
        expect(OrderStatus.fromString('pending'), OrderStatus.pending);
        expect(OrderStatus.fromString('confirmed'), OrderStatus.confirmed);
        expect(OrderStatus.fromString('processing'), OrderStatus.processing);
        expect(OrderStatus.fromString('ready'), OrderStatus.ready);
        expect(OrderStatus.fromString('completed'), OrderStatus.completed);
        expect(OrderStatus.fromString('cancelled'), OrderStatus.cancelled);
      });

      test('should return pending for invalid status', () {
        expect(OrderStatus.fromString('invalid'), OrderStatus.pending);
        expect(OrderStatus.fromString(''), OrderStatus.pending);
        expect(OrderStatus.fromString('PENDING'), OrderStatus.pending); // case sensitive
      });
    });
  });

  group('Order', () {
    group('fromJson', () {
      test('should create Order from valid JSON', () {
        // Arrange
        final json = sampleOrderJson();

        // Act
        final order = Order.fromJson(json);

        // Assert
        expect(order.id, 'json-order-id');
        expect(order.shopId, 'json-shop-id');
        expect(order.customerName, 'JSON Customer');
        expect(order.customerPhone, '081111111111');
        expect(order.customerEmail, 'json@example.com');
        expect(order.status, OrderStatus.confirmed);
        expect(order.subtotal, 30000);
        expect(order.tax, 3000);
        expect(order.discount, 5000);
        expect(order.total, 28000);
      });

      test('should handle null optional fields', () {
        // Arrange
        final json = {
          'id': 'test-id',
          'shop_id': 'shop-id',
          'customer_name': 'Customer',
          'status': null,
          'subtotal': null,
          'tax': null,
          'discount': null,
          'total': null,
          'created_at': '2024-01-01T00:00:00.000Z',
          'updated_at': '2024-01-01T00:00:00.000Z',
        };

        // Act
        final order = Order.fromJson(json);

        // Assert
        expect(order.status, OrderStatus.pending); // Default
        expect(order.subtotal, 0);
        expect(order.tax, 0);
        expect(order.discount, 0);
        expect(order.total, 0);
        expect(order.customerPhone, isNull);
        expect(order.customerAddress, isNull);
      });

      test('should parse order_items when present', () {
        // Arrange
        final json = sampleOrderJson(includeItems: true);

        // Act
        final order = Order.fromJson(json);

        // Assert
        expect(order.items, isNotNull);
        expect(order.items!.length, 1);
        expect(order.items!.first.productName, 'Item 1');
        expect(order.items!.first.quantity, 2);
        expect(order.items!.first.subtotal, 30000);
      });

      test('should handle missing order_items', () {
        // Arrange
        final json = sampleOrderJson(includeItems: false);

        // Act
        final order = Order.fromJson(json);

        // Assert
        expect(order.items, isNull);
      });
    });
  });

  group('OrderItem', () {
    group('fromJson', () {
      test('should create OrderItem from valid JSON', () {
        // Arrange
        final json = {
          'id': 'item-id',
          'order_id': 'order-id',
          'product_id': 'product-id',
          'product_name': 'Test Product',
          'quantity': 3,
          'unit_price': 5000,
          'subtotal': 15000,
          'notes': 'Extra spicy',
        };

        // Act
        final item = OrderItem.fromJson(json);

        // Assert
        expect(item.id, 'item-id');
        expect(item.orderId, 'order-id');
        expect(item.productId, 'product-id');
        expect(item.productName, 'Test Product');
        expect(item.quantity, 3);
        expect(item.unitPrice, 5000);
        expect(item.subtotal, 15000);
        expect(item.notes, 'Extra spicy');
      });

      test('should handle null product_id', () {
        // Arrange
        final json = {
          'id': 'item-id',
          'order_id': 'order-id',
          'product_id': null,
          'product_name': 'Custom Item',
          'quantity': 1,
          'unit_price': 10000,
          'subtotal': 10000,
          'notes': null,
        };

        // Act
        final item = OrderItem.fromJson(json);

        // Assert
        expect(item.productId, isNull);
        expect(item.notes, isNull);
      });
    });
  });

  group('Order with OrderItems', () {
    test('should calculate correctly with multiple items', () {
      // Arrange
      final items = [
        createTestOrderItem(
          id: 'item-1',
          quantity: 2,
          unitPrice: 10000,
          subtotal: 20000,
        ),
        createTestOrderItem(
          id: 'item-2',
          quantity: 1,
          unitPrice: 15000,
          subtotal: 15000,
        ),
      ];

      final order = createTestOrder(
        subtotal: 35000,
        tax: 3500,
        discount: 0,
        total: 38500,
        items: items,
      );

      // Assert
      expect(order.items!.length, 2);
      expect(order.subtotal, 35000);
      expect(order.total, 38500);

      // Verify item subtotals add up
      final itemTotal = order.items!.fold(0.0, (sum, item) => sum + item.subtotal);
      expect(itemTotal, 35000);
    });
  });
}
