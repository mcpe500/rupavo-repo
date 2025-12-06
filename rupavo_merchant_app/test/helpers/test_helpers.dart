// Test helpers for Rupavo Merchant App tests
// Contains factory functions for creating test data

import 'package:rupavo_merchant_app/models/product.dart';
import 'package:rupavo_merchant_app/models/order.dart';
import 'package:rupavo_merchant_app/models/shop.dart';

/// Creates a test Product with sensible defaults
Product createTestProduct({
  String id = 'test-product-id',
  String shopId = 'test-shop-id',
  String? categoryId,
  String name = 'Test Product',
  String slug = 'test-product',
  String? description = 'A test product description',
  String? tagline = 'Test tagline',
  double price = 10000.0,
  int stock = 100,
  String? imageUrl,
  bool isAvailable = true,
  int sortOrder = 0,
  DateTime? createdAt,
  DateTime? updatedAt,
}) {
  final now = DateTime.now();
  return Product(
    id: id,
    shopId: shopId,
    categoryId: categoryId,
    name: name,
    slug: slug,
    description: description,
    tagline: tagline,
    price: price,
    stock: stock,
    imageUrl: imageUrl,
    isAvailable: isAvailable,
    sortOrder: sortOrder,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
  );
}

/// Creates a test Order with sensible defaults
Order createTestOrder({
  String id = 'test-order-id',
  String shopId = 'test-shop-id',
  String customerName = 'Test Customer',
  String? customerPhone = '081234567890',
  String? customerEmail = 'test@example.com',
  String? customerAddress = 'Test Address',
  OrderStatus status = OrderStatus.pending,
  double subtotal = 20000.0,
  double tax = 2000.0,
  double discount = 0.0,
  double total = 22000.0,
  String? notes,
  DateTime? createdAt,
  DateTime? updatedAt,
  List<OrderItem>? items,
}) {
  final now = DateTime.now();
  return Order(
    id: id,
    shopId: shopId,
    customerName: customerName,
    customerPhone: customerPhone,
    customerEmail: customerEmail,
    customerAddress: customerAddress,
    status: status,
    subtotal: subtotal,
    tax: tax,
    discount: discount,
    total: total,
    notes: notes,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
    items: items,
  );
}

/// Creates a test OrderItem with sensible defaults
OrderItem createTestOrderItem({
  String id = 'test-order-item-id',
  String orderId = 'test-order-id',
  String? productId = 'test-product-id',
  String productName = 'Test Product',
  int quantity = 2,
  double unitPrice = 10000.0,
  double subtotal = 20000.0,
  String? notes,
}) {
  return OrderItem(
    id: id,
    orderId: orderId,
    productId: productId,
    productName: productName,
    quantity: quantity,
    unitPrice: unitPrice,
    subtotal: subtotal,
    notes: notes,
  );
}

/// Creates a test Shop with sensible defaults
Shop createTestShop({
  String id = 'test-shop-id',
  String ownerId = 'test-owner-id',
  String name = 'Test Shop',
  String slug = 'test-shop',
  String? description = 'A test shop description',
  String? businessType = 'retail',
  String? logoUrl,
  String? bannerUrl,
  bool isActive = true,
  DateTime? createdAt,
  DateTime? updatedAt,
}) {
  final now = DateTime.now();
  return Shop(
    id: id,
    ownerId: ownerId,
    name: name,
    slug: slug,
    description: description,
    businessType: businessType,
    logoUrl: logoUrl,
    bannerUrl: bannerUrl,
    isActive: isActive,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
  );
}

/// Sample JSON for testing Product.fromJson
Map<String, dynamic> sampleProductJson({
  String id = 'json-product-id',
  String shopId = 'json-shop-id',
}) {
  return {
    'id': id,
    'shop_id': shopId,
    'category_id': null,
    'name': 'JSON Product',
    'slug': 'json-product',
    'description': 'Product from JSON',
    'tagline': 'JSON tagline',
    'price': 15000,
    'stock': 50,
    'image_url': null,
    'is_available': true,
    'sort_order': 1,
    'created_at': '2024-01-01T00:00:00.000Z',
    'updated_at': '2024-01-01T00:00:00.000Z',
  };
}

/// Sample JSON for testing Order.fromJson
Map<String, dynamic> sampleOrderJson({
  String id = 'json-order-id',
  String shopId = 'json-shop-id',
  bool includeItems = false,
}) {
  final json = {
    'id': id,
    'shop_id': shopId,
    'customer_name': 'JSON Customer',
    'customer_phone': '081111111111',
    'customer_email': 'json@example.com',
    'customer_address': 'JSON Address',
    'status': 'confirmed',
    'subtotal': 30000,
    'tax': 3000,
    'discount': 5000,
    'total': 28000,
    'notes': 'Test notes',
    'created_at': '2024-01-01T00:00:00.000Z',
    'updated_at': '2024-01-01T00:00:00.000Z',
  };

  if (includeItems) {
    json['order_items'] = [
      {
        'id': 'item-1',
        'order_id': id,
        'product_id': 'prod-1',
        'product_name': 'Item 1',
        'quantity': 2,
        'unit_price': 15000,
        'subtotal': 30000,
        'notes': null,
      },
    ];
  }

  return json;
}
