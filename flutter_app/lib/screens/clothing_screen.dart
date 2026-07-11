import 'package:flutter/material.dart';
import '../models/models.dart';

class ClothingScreen extends StatefulWidget {
  final RegisteredUser user;
  const ClothingScreen({super.key, required this.user});

  @override
  State<ClothingScreen> createState() => _ClothingScreenState();
}

class _ClothingScreenState extends State<ClothingScreen> {
  String _selectedCategory = 'All';

  final List<Map<String, dynamic>> _boutiques = [
    {
      'id': 'bt_anarkali',
      'name': 'Anarkali Matching Center',
      'nameHi': 'अनारकली मैचिंग सेंटर',
      'category': 'Ethnic Wear',
      'location': 'Kila Bazaar, Maudaha',
      'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
    },
    {
      'id': 'bt_maudaha_mens',
      'name': 'Maudaha Men\'s Hub',
      'nameHi': 'मौदहा मेंस हब',
      'category': 'Casuals & Formals',
      'location': 'Galla Mandi Road, Maudaha',
      'image': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop',
    }
  ];

  final List<Map<String, dynamic>> _fashionProducts = [
    {
      'id': 'fash_prod_1',
      'name': 'Designer Banarasi Silk Saree',
      'price': 1499.0,
      'category': 'Ethnic Wear',
      'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
      'desc': 'Elegant Banarasi silk saree with gold zari embroidery. Perfect for festivals.'
    },
    {
      'id': 'fash_prod_2',
      'name': 'Premium Cotton Kurta Set',
      'price': 799.0,
      'category': 'Ethnic Wear',
      'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
      'desc': 'Light breathable designer kurta set with soft cotton material.'
    },
    {
      'id': 'fash_prod_3',
      'name': 'Slim Fit Denim Jacket',
      'price': 1199.0,
      'category': 'Casuals & Formals',
      'image': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop',
      'desc': 'Stylish washed denim jacket for men with premium metal buttons.'
    }
  ];

  @override
  Widget build(BuildContext context) {
    final filteredProducts = _selectedCategory == 'All'
        ? _fashionProducts
        : _fashionProducts.where((p) => p['category'] == _selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fashion & Boutiques 👗', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Promo Hero Area
            Container(
              padding: const EdgeInsets.all(20),
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF312E81), Color(0xFF4338CA)],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(6)),
                    child: const Text('FESTIVE OFFER', style: TextStyle(color: Colors.black, fontSize: 8, fontWeight: FontWeight.black)),
                  ),
                  const SizedBox(height: 8),
                  const Text('Upgrade Your Wardrobe', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black)),
                  Text('Up to 40% OFF on Banarasi silk sarees & festive Kurtas!', style: TextStyle(color: Colors.indigo.shade100, fontSize: 11)),
                ],
              ),
            ),

            // Horizontal Categories Selector
            const Padding(
              padding: EdgeInsets.only(left: 16, top: 16, bottom: 8),
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate),
            ),
            SizedBox(
              height: 50,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: ['All', 'Ethnic Wear', 'Casuals & Formals'].map((cat) {
                  final isSel = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(cat, style: TextStyle(fontSize: 12, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                      selected: isSel,
                      onSelected: (val) {
                        setState(() {
                          _selectedCategory = cat;
                        });
                      },
                      selectedColor: Colors.indigo.shade100,
                      checkmarkColor: Colors.indigo.shade900,
                    ),
                  );
                }).toList(),
              ),
            ),

            // Featured Local Boutiques
            const Padding(
              padding: EdgeInsets.only(left: 16, top: 16, bottom: 12),
              child: Text('Local Boutiques & Matching Centers 🏪', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
            ),
            SizedBox(
              height: 120,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _boutiques.length,
                itemBuilder: (context, idx) {
                  final bt = _boutiques[idx];
                  return Container(
                    width: 240,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.slate.shade100),
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                          child: Image.network(bt['image']!, width: 80, height: 120, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(bt['name']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                Text(bt['category']!, style: const TextStyle(fontSize: 10, color: Colors.indigo)),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_outlined, size: 10, color: Colors.slate),
                                    const SizedBox(width: 2),
                                    Expanded(child: Text(bt['location']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 9, color: Colors.slate))),
                                  ],
                                )
                              ],
                            ),
                          ),
                        )
                      ],
                    ),
                  );
                },
              ),
            ),

            // Trending Apparel Grid
            const Padding(
              padding: EdgeInsets.only(left: 16, top: 20, bottom: 12),
              child: Text('Trending Fashion Collection 🛍️', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
            ),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.7,
              ),
              itemCount: filteredProducts.length,
              itemBuilder: (context, idx) {
                final prod = filteredProducts[idx];
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  clipBehavior: Clip.antiAlias,
                  elevation: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Image.network(
                          prod['image']!,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (c, e, s) => Container(color: Colors.indigo.shade50, child: const Icon(Icons.checkroom)),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(10.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(prod['name']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.black)),
                            Text('₹${prod['price'].toStringAsFixed(0)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.indigo)),
                            const SizedBox(height: 6),
                            SizedBox(
                              width: double.infinity,
                              height: 28,
                              child: ElevatedButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Added ${prod['name']} to Fashion Cart!')),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF064E3B),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  padding: EdgeInsets.zero,
                                ),
                                child: const Text('Add to Bag', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
