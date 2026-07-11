import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';

class RestaurantScreen extends StatefulWidget {
  final RegisteredUser user;
  const RestaurantScreen({super.key, required this.user});

  @override
  State<RestaurantScreen> createState() => _RestaurantScreenState();
}

class _RestaurantScreenState extends State<RestaurantScreen> {
  final FirebaseService _fbService = FirebaseService();
  String _selectedCategory = 'All';

  // Static list matching the main Maudaha Mart database
  final List<Map<String, dynamic>> _restaurants = [
    {
      'id': 'rest_biryani_palace',
      'name': 'Maudaha Biryani Palace',
      'nameHi': 'मौदहा बिरयानी पैलेस',
      'cuisine': 'North Indian & Mughlai',
      'rating': 4.8,
      'time': '20-25 mins',
      'costForTwo': '₹250 for two',
      'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
    },
    {
      'id': 'rest_maudaha_sweets',
      'name': 'Saini Sweets & Chaat Corner',
      'nameHi': 'सैनी स्वीट्स एंड चाट कॉर्नर',
      'cuisine': 'Sweets, Snacks & Street Food',
      'rating': 4.6,
      'time': '15-20 mins',
      'costForTwo': '₹120 for two',
      'image': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
    },
    {
      'id': 'rest_south_delight',
      'name': 'Anna South Indian Cafe',
      'nameHi': 'अन्ना साउथ इंडियन कैफे',
      'cuisine': 'Dosa, Idli & Filter Coffee',
      'rating': 4.5,
      'time': '25-30 mins',
      'costForTwo': '₹180 for two',
      'image': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop',
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Maudaha Food Court 🍔', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Header / Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF064E3B),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search hot foods, biryani, burgers...',
                hintStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
              style: const TextStyle(color: Colors.white),
            ),
          ),

          // Categories horizontal list
          SizedBox(
            height: 60,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(12),
              children: ['All', 'Biryani', 'Sweets', 'Fast Food', 'South Indian'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(cat, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.black : FontWeight.normal)),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() {
                        _selectedCategory = cat;
                      });
                    },
                    selectedColor: Colors.emerald.shade100,
                    checkmarkColor: Colors.emerald.shade800,
                  ),
                );
              }).toList(),
            ),
          ),

          // Restaurants List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _restaurants.length,
              itemBuilder: (context, idx) {
                final rest = _restaurants[idx];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RestaurantDetailScreen(restaurant: rest, user: widget.user),
                      ),
                    );
                  },
                  child: Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    margin: const EdgeInsets.only(bottom: 16),
                    clipBehavior: Clip.antiAlias,
                    elevation: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Unsplash food visualizer matching image guidelines
                        Image.network(
                          rest['image']!,
                          height: 160,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            height: 160,
                            color: Colors.emerald.shade50,
                            child: const Icon(Icons.restaurant, color: Colors.emerald, size: 48),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Text(
                                    rest['name']!,
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.black, color: Colors.slate),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.emerald.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.star, color: Colors.amber, size: 14),
                                        const SizedBox(width: 4),
                                        Text(
                                          rest['rating'].toString(),
                                          style: TextStyle(color: Colors.emerald.shade800, fontSize: 11, fontWeight: FontWeight.black),
                                        ),
                                      ],
                                    ),
                                  )
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                rest['cuisine']!,
                                style: const TextStyle(fontSize: 12, color: Colors.slate),
                              ),
                              const Divider(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Text(
                                    '⏱️ ${rest['time']}',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.slate),
                                  ),
                                  Text(
                                    rest['costForTwo']!,
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.slate),
                                  ),
                                ],
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          )
        ],
      ),
    );
  }
}

class RestaurantDetailScreen extends StatefulWidget {
  final Map<String, dynamic> restaurant;
  final RegisteredUser user;
  const RestaurantDetailScreen({super.key, required this.restaurant, required this.user});

  @override
  State<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends State<RestaurantDetailScreen> {
  final List<Map<String, dynamic>> _menuItems = [
    {'id': 'food_biryani_1', 'name': 'Special Chicken Biryani', 'price': 180.0, 'desc': 'Rich basmati rice with marinated chicken & blend of secret Maudaha spices.'},
    {'id': 'food_biryani_2', 'name': 'Veg Paneer Biryani', 'price': 150.0, 'desc': 'Fresh cottage cheese slow-cooked with long grains and aromatic cardamoms.'},
    {'id': 'food_gulab_jamun', 'name': 'Desi Ghee Gulab Jamun (2 Pcs)', 'price': 40.0, 'desc': 'Hot golden sweet balls dipped in delicious cardamom syrup.'},
    {'id': 'food_lassi', 'name': 'Special Maudaha Kulhad Lassi', 'price': 60.0, 'desc': 'Creamy sweetened yogurt with rich malai and dry fruits on top.'}
  ];

  final Map<String, int> _cart = {};

  double get subtotal {
    double total = 0.0;
    _cart.forEach((itemId, qty) {
      final item = _menuItems.firstWhere((i) => i['id'] == itemId);
      total += item['price'] * qty;
    });
    return total;
  }

  void _addToCart(String itemId) {
    setState(() {
      _cart[itemId] = (_cart[itemId] ?? 0) + 1;
    });
  }

  void _removeFromCart(String itemId) {
    setState(() {
      if (_cart[itemId] != null && _cart[itemId]! > 0) {
        _cart[itemId] = _cart[itemId]! - 1;
        if (_cart[itemId] == 0) {
          _cart.remove(itemId);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.restaurant['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Hero restaurant detail block
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.emerald.shade50,
              border: Border(bottom: BorderSide(color: Colors.emerald.shade100)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    widget.restaurant['image']!,
                    width: 70,
                    height: 70,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.restaurant['name']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black, color: Colors.slate)),
                      Text('📍 ${widget.user.location}', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.star, color: Colors.amber.shade600, size: 14),
                          const SizedBox(width: 4),
                          Text('${widget.restaurant['rating']} | ⏱️ ${widget.restaurant['time']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      )
                    ],
                  ),
                )
              ],
            ),
          ),

          // Menu List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _menuItems.length,
              separatorBuilder: (context, index) => const Divider(height: 24),
              itemBuilder: (context, idx) {
                final item = _menuItems[idx];
                final qty = _cart[item['id']] ?? 0;
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['name']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.black, color: Colors.slate)),
                          Text('₹${item['price'].toStringAsFixed(0)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.emerald)),
                          const SizedBox(height: 4),
                          Text(item['desc']!, style: const TextStyle(fontSize: 11, color: Colors.slate)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      children: [
                        qty == 0
                            ? ElevatedButton(
                                onPressed: () => _addToCart(item['id']!),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.emerald,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('ADD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              )
                            : Container(
                                decoration: BoxDecoration(
                                  color: Colors.emerald,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove, color: Colors.white, size: 14),
                                      onPressed: () => _removeFromCart(item['id']!),
                                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                    ),
                                    Text('$qty', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                    IconButton(
                                      icon: const Icon(Icons.add, color: Colors.white, size: 14),
                                      onPressed: () => _addToCart(item['id']!),
                                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                    ),
                                  ],
                                ),
                              )
                      ],
                    )
                  ],
                );
              },
            ),
          ),

          // Cart Summary / Checkout Panel
          if (_cart.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -3))],
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${_cart.length} item(s) selected', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                        Text('₹${subtotal.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black, color: Colors.emerald)),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () {
                        // Place order & transition
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Order placed successfully via Maudaha UPI!')),
                        );
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.emerald,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('PROCEED TO PAY', style: TextStyle(fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
              ),
            )
        ],
      ),
    );
  }
}
