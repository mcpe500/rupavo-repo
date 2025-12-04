/// Shop model for Rupavo merchant app
class Shop {
  final String id;
  final String ownerId;
  final String name;
  final String slug;
  final String? description;
  final String? logoUrl;
  final String? address;
  final String? phone;
  final String? email;
  final String? businessType;
  final DateTime createdAt;
  final DateTime updatedAt;

  Shop({
    required this.id,
    required this.ownerId,
    required this.name,
    required this.slug,
    this.description,
    this.logoUrl,
    this.address,
    this.phone,
    this.email,
    this.businessType,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'] as String,
      ownerId: json['owner_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      logoUrl: json['logo_url'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      businessType: json['business_type'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'owner_id': ownerId,
      'name': name,
      'slug': slug,
      'description': description,
      'logo_url': logoUrl,
      'address': address,
      'phone': phone,
      'email': email,
      'business_type': businessType,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  /// For creating a new shop (without id, timestamps)
  Map<String, dynamic> toInsertJson() {
    return {
      'name': name,
      'slug': slug,
      'description': description,
      'logo_url': logoUrl,
      'address': address,
      'phone': phone,
      'email': email,
      'business_type': businessType,
    };
  }
}
