class RegisteredUser {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String location;
  final String locationHi;
  final String role; // customer, merchant, rider, admin, manager
  final List<String> searchHistory;
  final String? assignedArea;

  RegisteredUser({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.location,
    required this.locationHi,
    required this.role,
    this.searchHistory = const [],
    this.assignedArea,
  });

  factory RegisteredUser.fromJson(Map<String, dynamic> json, String docId) {
    return RegisteredUser(
      id: docId,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      location: json['location'] ?? '',
      locationHi: json['locationHi'] ?? '',
      role: json['role'] ?? 'customer',
      searchHistory: List<String>.from(json['searchHistory'] ?? []),
      assignedArea: json['assignedArea'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'location': location,
      'locationHi': locationHi,
      'role': role,
      'searchHistory': searchHistory,
      'assignedArea': assignedArea,
    };
  }
}

class Store {
  final String id;
  final String name;
  final String nameHi;
  final String category;
  final String? logo;
  final String phone;
  final String address;
  final double deliveryFee;

  Store({
    required this.id,
    required this.name,
    required this.nameHi,
    required this.category,
    this.logo,
    required this.phone,
    required this.address,
    required this.deliveryFee,
  });

  factory Store.fromJson(Map<String, dynamic> json, String docId) {
    return Store(
      id: docId,
      name: json['name'] ?? '',
      nameHi: json['nameHi'] ?? '',
      category: json['category'] ?? '',
      logo: json['logo'] ?? json['photoUrl'],
      phone: json['phone'] ?? '',
      address: json['address'] ?? json['location'] ?? '',
      deliveryFee: (json['deliveryFee'] ?? json['deliveryCharge'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'nameHi': nameHi,
      'category': category,
      'logo': logo,
      'phone': phone,
      'address': address,
      'deliveryFee': deliveryFee,
    };
  }
}

class Product {
  final String id;
  final String name;
  final String nameHi;
  final double price;
  final String? image;
  final String description;
  final String descriptionHi;
  final String storeId;
  final String category;

  Product({
    required this.id,
    required this.name,
    required this.nameHi,
    required this.price,
    this.image,
    required this.description,
    required this.descriptionHi,
    required this.storeId,
    required this.category,
  });

  factory Product.fromJson(Map<String, dynamic> json, String docId) {
    return Product(
      id: docId,
      name: json['name'] ?? '',
      nameHi: json['nameHi'] ?? '',
      price: (json['price'] ?? 0.0).toDouble(),
      image: json['image'] ?? json['photoUrl'],
      description: json['description'] ?? '',
      descriptionHi: json['descriptionHi'] ?? '',
      storeId: json['storeId'] ?? '',
      category: json['category'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'nameHi': nameHi,
      'price': price,
      'image': image,
      'description': description,
      'descriptionHi': descriptionHi,
      'storeId': storeId,
      'category': category,
    };
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final double price;
  final int quantity;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'] ?? '',
      productName: json['productName'] ?? json['name'] ?? '',
      price: (json['price'] ?? 0.0).toDouble(),
      quantity: (json['quantity'] ?? 1).toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'price': price,
      'quantity': quantity,
    };
  }
}

class Order {
  final String id;
  final String userId;
  final String userName;
  final List<OrderItem> items;
  final double subtotal;
  final double discount;
  final double total;
  final String status; // pending, preparing, ready, out_for_delivery, delivered
  final String deliveryAddress;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.userId,
    required this.userName,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.status,
    required this.deliveryAddress,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json, String docId) {
    var itemsList = (json['items'] as List?)?.map((i) => OrderItem.fromJson(i)).toList() ?? [];
    return Order(
      id: docId,
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      items: itemsList,
      subtotal: (json['subtotal'] ?? 0.0).toDouble(),
      discount: (json['discount'] ?? 0.0).toDouble(),
      total: (json['total'] ?? 0.0).toDouble(),
      status: json['status'] ?? 'pending',
      deliveryAddress: json['deliveryAddress'] ?? '',
      createdAt: json['createdAt'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['createdAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userName': userName,
      'items': items.map((i) => i.toJson()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'total': total,
      'status': status,
      'deliveryAddress': deliveryAddress,
      'createdAt': createdAt.millisecondsSinceEpoch,
    };
  }
}
