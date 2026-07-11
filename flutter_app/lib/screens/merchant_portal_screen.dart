import 'package:flutter/material.dart';
import '../models/models.dart';

class MerchantPortalScreen extends StatefulWidget {
  final RegisteredUser user;
  const MerchantPortalScreen({super.key, required this.user});

  @override
  State<MerchantPortalScreen> createState() => _MerchantPortalScreenState();
}

class _MerchantPortalScreenState extends State<MerchantPortalScreen> {
  final List<Map<String, dynamic>> _myProducts = [
    {'id': 'prod_m_1', 'name': 'Premium Basmati Rice (1kg)', 'price': 90.0, 'available': true},
    {'id': 'prod_m_2', 'name': 'Desi Ghee (500ml)', 'price': 340.0, 'available': true},
    {'id': 'prod_m_3', 'name': 'Fortune Mustard Oil (1L)', 'price': 175.0, 'available': false},
  ];

  final List<Map<String, dynamic>> _incomingOrders = [
    {
      'id': 'ord_m_101',
      'customer': 'Sumit Sahu',
      'items': 'Premium Basmati Rice x2',
      'total': '₹180',
      'address': 'Galla Mandi Road, Maudaha',
      'status': 'Pending'
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Merchant Business Panel 🏪', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Store details card
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(Icons.store, color: Colors.emerald, size: 40),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Maudaha Town Super Mart', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black)),
                          Text('Owner: Rahul Gupta', style: TextStyle(fontSize: 11, color: Colors.slate)),
                          Text('Category: Super Mart | Commission: 5%', style: TextStyle(fontSize: 11, color: Colors.emerald, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Incoming Orders List
            const Text('Incoming Customer Orders', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
            const SizedBox(height: 8),
            _incomingOrders.isEmpty
                ? const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('No pending orders today!')))
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _incomingOrders.length,
                    itemBuilder: (context, idx) {
                      final ord = _incomingOrders[idx];
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        color: Colors.amber.shade50,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Text('Order #${ord['id']}', style: const TextStyle(fontWeight: FontWeight.black)),
                                  Text(ord['status'], style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.black, fontSize: 11)),
                                ],
                              ),
                              const Divider(height: 16),
                              Text('Customer: ${ord['customer']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              Text('Items: ${ord['items']}', style: const TextStyle(fontSize: 11)),
                              Text('Total Amount: ${ord['total']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              const Divider(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () {
                                        setState(() {
                                          _incomingOrders.removeAt(idx);
                                        });
                                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order rejected.')));
                                      },
                                      child: const Text('Decline'),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        setState(() {
                                          ord['status'] = 'Preparing';
                                        });
                                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order accepted & cooking/preparing started!')));
                                      },
                                      style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald, foregroundColor: Colors.white),
                                      child: const Text('Accept Order'),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),

            const SizedBox(height: 20),

            // Stock Inventory List
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text('Store Catalog / Stock Inventory', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
                ElevatedButton.icon(
                  onPressed: _addNewProductDialog,
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text('Add Product', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF064E3B), foregroundColor: Colors.white),
                )
              ],
            ),
            const SizedBox(height: 8),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _myProducts.length,
              itemBuilder: (context, idx) {
                final prod = _myProducts[idx];
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    title: Text(prod['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    subtitle: Text('Price: ₹${prod['price']}', style: const TextStyle(fontSize: 11, color: Colors.emerald, fontWeight: FontWeight.bold)),
                    trailing: Switch(
                      value: prod['available'],
                      activeColor: Colors.emerald,
                      onChanged: (val) {
                        setState(() {
                          prod['available'] = val;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${prod['name']} is now ${val ? 'IN STOCK' : 'OUT OF STOCK'}')),
                        );
                      },
                    ),
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }

  void _addNewProductDialog() {
    final nameController = TextEditingController();
    final priceController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Product', style: TextStyle(fontWeight: FontWeight.black, fontSize: 14)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Product Name', labelStyle: TextStyle(fontSize: 12)),
            ),
            TextField(
              controller: priceController,
              decoration: const InputDecoration(labelText: 'Price (INR)', labelStyle: TextStyle(fontSize: 12)),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty && priceController.text.isNotEmpty) {
                setState(() {
                  _myProducts.add({
                    'id': 'prod_m_${Date.now()}',
                    'name': nameController.text.trim(),
                    'price': double.parse(priceController.text.trim()),
                    'available': true,
                  });
                });
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Product added to your digital store!')));
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald, foregroundColor: Colors.white),
            child: const Text('Add Product'),
          )
        ],
      ),
    );
  }
}
class Date {
  static int now() => DateTime.now().millisecondsSinceEpoch;
}
