import 'package:flutter/material.dart';
import '../models/models.dart';

class RiderPortalScreen extends StatefulWidget {
  final RegisteredUser user;
  const RiderPortalScreen({super.key, required this.user});

  @override
  State<RiderPortalScreen> createState() => _RiderPortalScreenState();
}

class _RiderPortalScreenState extends State<RiderPortalScreen> {
  double _todayEarnings = 480.0;
  int _completedTrips = 6;

  final List<Map<String, dynamic>> _assignedOrders = [
    {
      'id': 'ord_rider_1',
      'shop': 'Maudaha Super Mart',
      'customer': 'Amit Verma',
      'items': 'Premium Basmati Rice x2, Amul Butter 500g',
      'amount': '₹470',
      'address': 'Station Road, Maudaha',
      'payout': 45.0,
      'status': 'Out For Delivery'
    },
    {
      'id': 'ord_rider_2',
      'shop': 'Biryani Palace',
      'customer': 'Sushil Yadav',
      'items': 'Special Chicken Biryani x1',
      'amount': '₹180',
      'address': 'Kila Bazaar, Maudaha',
      'payout': 40.0,
      'status': 'Preparing'
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rider Delivery Panel 🚴', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Rider Dashboard Summary Stats
            Container(
              padding: const EdgeInsets.all(20),
              color: const Color(0xFF064E3B),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('TODAY\'S EARNINGS', style: TextStyle(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('₹${_todayEarnings.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.black)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('COMPLETED TRIPS', style: TextStyle(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('$_completedTrips Deliveries', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.black)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Active Task List
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Active Deliveries & Assignments',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate),
                  ),
                  const SizedBox(height: 12),

                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _assignedOrders.length,
                    itemBuilder: (context, idx) {
                      final ord = _assignedOrders[idx];
                      final isOut = ord['status'] == 'Out For Delivery';
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Text('ID: ${ord['id']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: isOut ? Colors.orange.shade50 : Colors.blue.shade50, borderRadius: BorderRadius.circular(8)),
                                    child: Text(
                                      ord['status'],
                                      style: TextStyle(color: isOut ? Colors.orange.shade800 : Colors.blue.shade800, fontSize: 9, fontWeight: FontWeight.bold),
                                    ),
                                  )
                                ],
                              ),
                              const Divider(height: 20),
                              Text('Store: ${ord['shop']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.black)),
                              Text('Customer: ${ord['customer']}', style: const TextStyle(fontSize: 12, color: Colors.slate)),
                              Text('Items: ${ord['items']}', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 14, color: Colors.red),
                                  const SizedBox(width: 4),
                                  Expanded(child: Text(ord['address'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                ],
                              ),
                              const Divider(height: 20),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Text('Trip Payout: ₹${ord['payout']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.emerald, fontSize: 13)),
                                  ElevatedButton(
                                    onPressed: isOut ? () => _completeTrip(idx) : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.emerald,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    child: const Text('Mark Delivered', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  )
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  void _completeTrip(int index) {
    final ord = _assignedOrders[index];
    setState(() {
      _todayEarnings += ord['payout'];
      _completedTrips += 1;
      _assignedOrders.removeAt(index);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Trip Complete! Earnings ₹${ord['payout']} added to your Maudaha Wallet.')),
    );
  }
}
