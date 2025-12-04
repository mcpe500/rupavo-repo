/// Product model for Rupavo merchant app
class Product {
  final String id;
  final String shopId;
  final String? categoryId;
  final String name;
  final String slug;
  final String? description;
  final String? tagline;
  final double price;
  final int stock;
  final String? imageUrl;
  final bool isAvailable;
  final int sortOrder;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.shopId,
    this.categoryId,
    required this.name,
    required this.slug,
    this.description,
    this.tagline,
    required this.price,
    required this.stock,
    this.imageUrl,
    required this.isAvailable,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      shopId: json['shop_id'] as String,
      categoryId: json['category_id'] as String?,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      tagline: json['tagline'] as String?,
      price: (json['price'] as num).toDouble(),
      stock: json['stock'] as int? ?? 0,
      imageUrl: json['image_url'] as String?,
      isAvailable: json['is_available'] as bool? ?? true,
      sortOrder: json['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shop_id': shopId,
      'category_id': categoryId,
      'name': name,
      'slug': slug,
      'description': description,
      'tagline': tagline,
      'price': price,
      'stock': stock,
      'image_url': imageUrl,
      'is_available': isAvailable,
      'sort_order': sortOrder,
    };
  }

  Map<String, dynamic> toInsertJson() {
    return {
      'shop_id': shopId,
      'category_id': categoryId,
      'name': name,
      'slug': slug,
      'description': description,
      'tagline': tagline,
      'price': price,
      'stock': stock,
      'image_url': imageUrl,
      'is_available': isAvailable,
      'sort_order': sortOrder,
    };
  }

  Product copyWith({
    String? name,
    String? description,
    String? tagline,
    double? price,
    int? stock,
    String? imageUrl,
    bool? isAvailable,
  }) {
    return Product(
      id: id,
      shopId: shopId,
      categoryId: categoryId,
      name: name ?? this.name,
      slug: slug,
      description: description ?? this.description,
      tagline: tagline ?? this.tagline,
      price: price ?? this.price,
      stock: stock ?? this.stock,
      imageUrl: imageUrl ?? this.imageUrl,
      isAvailable: isAvailable ?? this.isAvailable,
      sortOrder: sortOrder,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
