// Unit tests for Product model
// Tests serialization, deserialization, and copyWith

import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/models/product.dart';
import '../../helpers/test_helpers.dart';

void main() {
  group('Product', () {
    group('fromJson', () {
      test('should create Product from valid JSON', () {
        // Arrange
        final json = sampleProductJson();

        // Act
        final product = Product.fromJson(json);

        // Assert
        expect(product.id, 'json-product-id');
        expect(product.shopId, 'json-shop-id');
        expect(product.name, 'JSON Product');
        expect(product.slug, 'json-product');
        expect(product.price, 15000);
        expect(product.stock, 50);
        expect(product.isAvailable, true);
        expect(product.sortOrder, 1);
      });

      test('should handle null optional fields', () {
        // Arrange
        final json = {
          'id': 'test-id',
          'shop_id': 'shop-id',
          'name': 'Test',
          'slug': 'test',
          'price': 1000,
          'stock': null,
          'is_available': null,
          'sort_order': null,
          'created_at': '2024-01-01T00:00:00.000Z',
          'updated_at': '2024-01-01T00:00:00.000Z',
        };

        // Act
        final product = Product.fromJson(json);

        // Assert
        expect(product.stock, 0); // Default value
        expect(product.isAvailable, true); // Default value
        expect(product.sortOrder, 0); // Default value
        expect(product.description, isNull);
        expect(product.categoryId, isNull);
      });

      test('should parse price as double from int', () {
        // Arrange
        final json = sampleProductJson();
        json['price'] = 1000; // int instead of double

        // Act
        final product = Product.fromJson(json);

        // Assert
        expect(product.price, isA<double>());
        expect(product.price, 1000.0);
      });

      test('should parse createdAt and updatedAt as DateTime', () {
        // Arrange
        final json = sampleProductJson();

        // Act
        final product = Product.fromJson(json);

        // Assert
        expect(product.createdAt, isA<DateTime>());
        expect(product.updatedAt, isA<DateTime>());
        expect(product.createdAt.year, 2024);
      });
    });

    group('toJson', () {
      test('should serialize Product to JSON', () {
        // Arrange
        final product = createTestProduct(
          id: 'serialize-id',
          name: 'Serialize Test',
          price: 25000,
        );

        // Act
        final json = product.toJson();

        // Assert
        expect(json['id'], 'serialize-id');
        expect(json['name'], 'Serialize Test');
        expect(json['price'], 25000);
        expect(json['shop_id'], 'test-shop-id');
      });

      test('should not include created_at and updated_at in toJson', () {
        // Arrange
        final product = createTestProduct();

        // Act
        final json = product.toJson();

        // Assert
        expect(json.containsKey('created_at'), false);
        expect(json.containsKey('updated_at'), false);
      });
    });

    group('toInsertJson', () {
      test('should not include id in insert JSON', () {
        // Arrange
        final product = createTestProduct(id: 'should-not-appear');

        // Act
        final json = product.toInsertJson();

        // Assert
        expect(json.containsKey('id'), false);
        expect(json['shop_id'], 'test-shop-id');
        expect(json['name'], 'Test Product');
      });
    });

    group('copyWith', () {
      test('should create copy with updated fields', () {
        // Arrange
        final original = createTestProduct(
          name: 'Original Name',
          price: 10000,
        );

        // Act
        final copy = original.copyWith(
          name: 'Updated Name',
          price: 20000,
        );

        // Assert
        expect(copy.name, 'Updated Name');
        expect(copy.price, 20000);
        // Unchanged fields should remain the same
        expect(copy.id, original.id);
        expect(copy.shopId, original.shopId);
        expect(copy.slug, original.slug);
      });

      test('should keep original values when null passed', () {
        // Arrange
        final original = createTestProduct(
          name: 'Keep This',
          description: 'Keep Description',
        );

        // Act
        final copy = original.copyWith(); // No arguments

        // Assert
        expect(copy.name, 'Keep This');
        expect(copy.description, 'Keep Description');
      });

      test('should allow setting stock to 0', () {
        // Arrange
        final original = createTestProduct(stock: 100);

        // Act
        final copy = original.copyWith(stock: 0);

        // Assert
        expect(copy.stock, 0);
      });
    });
  });
}
