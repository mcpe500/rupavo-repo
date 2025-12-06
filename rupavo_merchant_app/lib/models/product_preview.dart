class ProductPreview {
  final String name;
  final double price;
  final String? description;
  final String? imageUrl;

  ProductPreview({
    required this.name,
    required this.price,
    this.description,
    this.imageUrl,
  });

  factory ProductPreview.fromJson(Map<String, dynamic> json) {
    final priceValue = json['price'];
    final doublePrice = priceValue is num ? priceValue.toDouble() : double.tryParse(priceValue?.toString() ?? '') ?? 0;

    return ProductPreview(
      name: json['name']?.toString() ?? 'Unnamed Product',
      price: doublePrice,
      description: json['description']?.toString(),
      imageUrl: json['image_url']?.toString(),
    );
  }

  Map<String, dynamic> toMap({required String shopId}) {
    return {
      'shop_id': shopId,
      'name': name,
      'price': price,
      if (description != null) 'description': description,
      if (imageUrl != null) 'image_url': imageUrl,
      'is_active': true,
    };
  }

  ProductPreview copyWith({
    String? name,
    double? price,
    String? description,
    String? imageUrl,
  }) {
    return ProductPreview(
      name: name ?? this.name,
      price: price ?? this.price,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}
