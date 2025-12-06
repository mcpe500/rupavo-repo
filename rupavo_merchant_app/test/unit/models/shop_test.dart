// Unit tests for Shop model
// Tests serialization and deserialization

import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/models/shop.dart';

void main() {
  group('Shop', () {
    group('fromJson', () {
      test('should create Shop from valid JSON', () {
        // Arrange
        final json = {
          'id': 'shop-id',
          'owner_id': 'owner-id',
          'name': 'Test Shop',
          'slug': 'test-shop',
          'description': 'A test shop',
          'logo_url': 'https://example.com/logo.png',
          'address': '123 Test St',
          'phone': '081234567890',
          'email': 'shop@example.com',
          'business_type': 'retail',
          'created_at': '2024-01-01T00:00:00.000Z',
          'updated_at': '2024-01-01T00:00:00.000Z',
        };

        // Act
        final shop = Shop.fromJson(json);

        // Assert
        expect(shop.id, 'shop-id');
        expect(shop.ownerId, 'owner-id');
        expect(shop.name, 'Test Shop');
        expect(shop.slug, 'test-shop');
        expect(shop.description, 'A test shop');
        expect(shop.logoUrl, 'https://example.com/logo.png');
        expect(shop.address, '123 Test St');
        expect(shop.phone, '081234567890');
        expect(shop.email, 'shop@example.com');
        expect(shop.businessType, 'retail');
      });

      test('should handle null optional fields', () {
        // Arrange
        final json = {
          'id': 'shop-id',
          'owner_id': 'owner-id',
          'name': 'Minimal Shop',
          'slug': 'minimal-shop',
          'description': null,
          'logo_url': null,
          'address': null,
          'phone': null,
          'email': null,
          'business_type': null,
          'created_at': '2024-01-01T00:00:00.000Z',
          'updated_at': '2024-01-01T00:00:00.000Z',
        };

        // Act
        final shop = Shop.fromJson(json);

        // Assert
        expect(shop.description, isNull);
        expect(shop.logoUrl, isNull);
        expect(shop.address, isNull);
        expect(shop.phone, isNull);
        expect(shop.email, isNull);
        expect(shop.businessType, isNull);
      });

      test('should parse timestamps correctly', () {
        // Arrange
        final json = {
          'id': 'shop-id',
          'owner_id': 'owner-id',
          'name': 'Time Shop',
          'slug': 'time-shop',
          'created_at': '2024-06-15T10:30:00.000Z',
          'updated_at': '2024-06-20T14:45:00.000Z',
        };

        // Act
        final shop = Shop.fromJson(json);

        // Assert
        expect(shop.createdAt.year, 2024);
        expect(shop.createdAt.month, 6);
        expect(shop.createdAt.day, 15);
        expect(shop.updatedAt.day, 20);
      });
    });

    group('toJson', () {
      test('should serialize Shop to JSON with all fields', () {
        // Arrange
        final now = DateTime(2024, 1, 1);
        final shop = Shop(
          id: 'serialize-id',
          ownerId: 'owner-id',
          name: 'Serialize Shop',
          slug: 'serialize-shop',
          description: 'Description',
          logoUrl: 'logo.png',
          address: 'Address',
          phone: 'Phone',
          email: 'email@test.com',
          businessType: 'f&b',
          createdAt: now,
          updatedAt: now,
        );

        // Act
        final json = shop.toJson();

        // Assert
        expect(json['id'], 'serialize-id');
        expect(json['owner_id'], 'owner-id');
        expect(json['name'], 'Serialize Shop');
        expect(json['description'], 'Description');
        expect(json['business_type'], 'f&b');
        expect(json['created_at'], isA<String>());
        expect(json['updated_at'], isA<String>());
      });
    });

    group('toInsertJson', () {
      test('should not include id and owner_id in insert JSON', () {
        // Arrange
        final shop = Shop(
          id: 'should-not-appear',
          ownerId: 'should-not-appear-either',
          name: 'Insert Shop',
          slug: 'insert-shop',
          description: 'Insert description',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        // Act
        final json = shop.toInsertJson();

        // Assert
        expect(json.containsKey('id'), false);
        expect(json.containsKey('owner_id'), false);
        expect(json.containsKey('created_at'), false);
        expect(json.containsKey('updated_at'), false);
        expect(json['name'], 'Insert Shop');
        expect(json['slug'], 'insert-shop');
      });
    });
  });
}
