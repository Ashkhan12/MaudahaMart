import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';
import 'map_picker_screen.dart';
import 'restaurant_screen.dart';
import 'clothing_screen.dart';
import 'doctors_screen.dart';
import 'flights_screen.dart';
import 'services_screen.dart';
import 'rider_portal_screen.dart';
import 'merchant_portal_screen.dart';
import 'admin_portal_screen.dart';

class HomeScreen extends StatefulWidget {
  final RegisteredUser user;
  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final FirebaseService _fbService = FirebaseService();
  late RegisteredUser _currentUser;
  int _currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _currentUser = widget.user;
  }

  void _openMapPicker() async {
    final selectedAddress = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (context) => MapPickerScreen(initialAddress: _currentUser.location),
      ),
    );

    if (selectedAddress != null && selectedAddress.isNotEmpty) {
      await _fbService.updateUserLocation(_currentUser.id, selectedAddress);
      
      // Fetch latest profile state
      final updated = await _fbService.getUserProfile(_currentUser.id);
      if (updated != null) {
        setState(() {
          _currentUser = updated;
        });
      } else {
        setState(() {
          _currentUser = RegisteredUser(
            id: _currentUser.id,
            name: _currentUser.name,
            phone: _currentUser.phone,
            email: _currentUser.email,
            location: selectedAddress,
            locationHi: selectedAddress,
            role: _currentUser.role,
          );
        });
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Delivery location updated on map!')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF064E3B),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hello, ${_currentUser.name} 👋', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Role: ${_currentUser.role.toUpperCase()}', style: TextStyle(fontSize: 10, color: Colors.emerald.shade200, fontWeight: FontWeight.black)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () async {
              await _fbService.signOut();
              if (mounted) Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Elegant Header Location Bar matching Web Applet
          Container(
            color: const Color(0xFF064E3B),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, color: Colors.amber, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'YOUR ACTIVE DELIVERY LOCATION',
                          style: TextStyle(color: Colors.white60, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _currentUser.location,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: _openMapPicker,
                    icon: const Icon(Icons.map, size: 12, color: Colors.emerald),
                    label: const Text('Change', style: TextStyle(fontSize: 11, fontWeight: FontWeight.black, color: Colors.emerald)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  )
                ],
              ),
            ),
          ),

          // Portal Tabs list
          Expanded(
            child: IndexedStack(
              index: _currentTabIndex,
              children: [
                _buildBrowseTab(),
                RestaurantScreen(user: _currentUser),
                ClothingScreen(user: _currentUser),
                _buildOrdersTab(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTabIndex,
        onTap: (index) {
          setState(() {
            _currentTabIndex = index;
          });
        },
        selectedItemColor: const Color(0xFF064E3B),
        unselectedItemColor: Colors.slate.shade400,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag), label: 'Browse'),
          BottomNavigationBarItem(icon: Icon(Icons.restaurant), label: 'Food'),
          BottomNavigationBarItem(icon: Icon(Icons.checkroom), label: 'Fashion'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'Orders'),
        ],
      ),
    );
  }

  Widget _buildBrowseTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Role-specific quick launchers
          _buildRoleConsoleLauncher(),
          const SizedBox(height: 10),

          // Micro Services banner
          _buildPromoBanner(),
          const SizedBox(height: 20),

          // 2x2 Services Grid for additional micro portals
          const Text(
            'Maudaha Mart Micro Portals 🚀',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate),
          ),
          const SizedBox(height: 10),
          _buildPortalsGrid(),
          const SizedBox(height: 24),

          const Text(
            'Maudaha Super Marts 🛒',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate),
          ),
          const SizedBox(height: 12),

          StreamBuilder<List<Store>>(
            stream: _fbService.streamStores(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: Padding(padding: EdgeInsets.all(24.0), child: CircularProgressIndicator()));
              }
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Text('No stores found in Maudaha Mart database.');
              }
              final stores = snapshot.data!;
              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: stores.length,
                itemBuilder: (context, idx) {
                  final store = stores[idx];
                  return Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.emerald.shade50,
                        child: Text(store.name.substring(0, 1), style: const TextStyle(color: Colors.emerald, fontWeight: FontWeight.bold)),
                      ),
                      title: Text(store.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      subtitle: Text('Category: ${store.category} | Delivery ₹${store.deliveryFee.toStringAsFixed(0)}', style: const TextStyle(fontSize: 11)),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRoleConsoleLauncher() {
    if (_currentUser.role == 'admin') {
      return Card(
        color: Colors.amber.shade50,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Colors.amber)),
        child: ListTile(
          leading: const Icon(Icons.admin_panel_settings, color: Colors.amber, size: 28),
          title: const Text('Admin Console Available', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: const Text('Manage global stores, onboarding, and platform rates.', style: TextStyle(fontSize: 11)),
          trailing: ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => AdminPortalScreen(user: _currentUser))),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber.shade900, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text('Launch', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
      );
    } else if (_currentUser.role == 'merchant') {
      return Card(
        color: Colors.blue.shade50,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Colors.blue)),
        child: ListTile(
          leading: const Icon(Icons.storefront, color: Colors.blue, size: 28),
          title: const Text('Merchant Panel Available', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: const Text('Manage your store inventory, stock, and accept orders.', style: TextStyle(fontSize: 11)),
          trailing: ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => MerchantPortalScreen(user: _currentUser))),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue.shade900, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text('Manage', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
      );
    } else if (_currentUser.role == 'rider') {
      return Card(
        color: Colors.emerald.shade50,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Colors.emerald)),
        child: ListTile(
          leading: const Icon(Icons.delivery_dining, color: Colors.emerald, size: 28),
          title: const Text('Rider Panel Available', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: const Text('View assigned deliveries, track payouts, and earnings.', style: TextStyle(fontSize: 11)),
          trailing: ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => RiderPortalScreen(user: _currentUser))),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald.shade900, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text('Enter', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildPortalsGrid() {
    final portals = [
      {'name': 'Town Services', 'icon': Icons.construction, 'color': Colors.blue.shade600, 'screen': ServicesScreen(user: _currentUser)},
      {'name': 'Doctors Corner', 'icon': Icons.health_and_safety, 'color': Colors.red.shade600, 'screen': DoctorsScreen(user: _currentUser)},
      {'name': 'Flight Bookings', 'icon': Icons.flight_takeoff, 'color': Colors.amber.shade700, 'screen': FlightsScreen(user: _currentUser)},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: portals.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.0,
      ),
      itemBuilder: (context, idx) {
        final item = portals[idx];
        return InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => item['screen'] as Widget));
          },
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.slate.shade100),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(item['icon'] as IconData, color: item['color'] as Color, size: 28),
                const SizedBox(height: 8),
                Text(item['name'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.slate)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildOrdersTab() {
    return StreamBuilder<List<Order>>(
      stream: _fbService.streamUserOrders(_currentUser.id),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.assignment_outlined, size: 48, color: Colors.slate),
                SizedBox(height: 12),
                Text('No active orders found.', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              ],
            ),
          );
        }
        final orders = snapshot.data!;
        return ListView.builder(
          itemCount: orders.length,
          padding: const EdgeInsets.all(16),
          itemBuilder: (context, idx) {
            final order = orders[idx];
            return Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text('Order ID: ${order.id.substring(0, 8).toUpperCase()}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.black)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.emerald.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            order.status.toUpperCase(),
                            style: TextStyle(color: Colors.emerald.shade700, fontSize: 10, fontWeight: FontWeight.black),
                          ),
                        )
                      ],
                    ),
                    const Divider(height: 20),
                    ...order.items.map((i) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Text('${i.productName} x${i.quantity}', style: const TextStyle(fontSize: 12)),
                          Text('₹${(i.price * i.quantity).toStringAsFixed(0)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text('Total Paid', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        Text('₹${order.total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.black, color: Colors.emerald)),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPromoBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF047857), Color(0xFF065F46)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.star, color: Colors.amber, size: 16),
              SizedBox(width: 6),
              Text('MAUDAHA LOCAL CAMPAIGN', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.black)),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            '₹100 Cashback on first 3 Super Mart orders!',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.black, letterSpacing: -0.3),
          ),
          const SizedBox(height: 4),
          Text(
            'Use code MAU100. Delivery to Station Road, Galla Mandi & all areas.',
            style: TextStyle(color: Colors.emerald.shade100, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
