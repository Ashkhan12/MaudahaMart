import 'package:flutter/material.dart';
import '../models/models.dart';

class AdminPortalScreen extends StatefulWidget {
  final RegisteredUser user;
  const AdminPortalScreen({super.key, required this.user});

  @override
  State<AdminPortalScreen> createState() => _AdminPortalScreenState();
}

class _AdminPortalScreenState extends State<AdminPortalScreen> {
  double _platformCommissionRate = 3.0; // 3%
  bool _maintenanceMode = false;

  final List<Map<String, dynamic>> _merchantRequests = [
    {
      'id': 'req_mer_1',
      'shopName': 'Maudaha Fancy Dupatta Corner',
      'owner': 'Anuj Soni',
      'phone': '+91 9450001234',
      'category': 'Fashion Boutique',
      'upi': 'anujdupatta@okaxis',
      'status': 'Pending'
    }
  ];

  final List<Map<String, dynamic>> _activeRiders = [
    {
      'name': 'Sanjay Kumar',
      'phone': '+91 9000000003',
      'status': 'Active (Delivering)',
      'trips': 6,
    },
    {
      'name': 'Deepak Prajapati',
      'phone': '+91 9000000045',
      'status': 'Idle',
      'trips': 4,
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Operations Console 🛡️', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Analytics overview
            _buildStatsHeader(),
            const SizedBox(height: 20),

            // Commission & platform configurations
            const Text('System Configurations', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
            const SizedBox(height: 8),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text('System Commission Rate', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        Text('${_platformCommissionRate.toStringAsFixed(1)}%', style: const TextStyle(fontWeight: FontWeight.black, color: Colors.emerald)),
                      ],
                    ),
                    Slider(
                      value: _platformCommissionRate,
                      min: 1.0,
                      max: 10.0,
                      divisions: 18,
                      activeColor: Colors.emerald,
                      onChanged: (val) {
                        setState(() {
                          _platformCommissionRate = val;
                        });
                      },
                    ),
                    const Divider(height: 24),
                    SwitchListTile(
                      title: const Text('Maintenance Mode', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      subtitle: const Text('Displays "Server Maintenance" block to all client applets.', style: TextStyle(fontSize: 10)),
                      value: _maintenanceMode,
                      activeColor: Colors.emerald,
                      onChanged: (val) {
                        setState(() {
                          _maintenanceMode = val;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Maintenance Mode is now ${val ? "ON" : "OFF"}')),
                        );
                      },
                    )
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Onboarding requests
            const Text('Merchant Onboarding Requests', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
            const SizedBox(height: 8),
            _merchantRequests.isEmpty
                ? const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('No onboarding requests.')))
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _merchantRequests.length,
                    itemBuilder: (context, idx) {
                      final req = _merchantRequests[idx];
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(req['shopName'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.black)),
                              Text('Category: ${req['category']}', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                              Text('Owner: ${req['owner']} (${req['phone']})', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                              const Divider(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () {
                                        setState(() {
                                          _merchantRequests.removeAt(idx);
                                        });
                                      },
                                      child: const Text('Reject', style: TextStyle(color: Colors.red)),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        setState(() {
                                          _merchantRequests.removeAt(idx);
                                        });
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Merchant approved! Saved to global databases.')),
                                        );
                                      },
                                      style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald, foregroundColor: Colors.white),
                                      child: const Text('Approve Store'),
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

            // Active Rider fleet monitor
            const Text('Rider Fleet Status', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
            const SizedBox(height: 8),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _activeRiders.length,
                separatorBuilder: (c, idx) => const Divider(height: 1),
                itemBuilder: (context, idx) {
                  final rdr = _activeRiders[idx];
                  return ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.delivery_dining)),
                    title: Text(rdr['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    subtitle: Text('${rdr['status']} | Payout Trips: ${rdr['trips']}', style: const TextStyle(fontSize: 11)),
                    trailing: IconButton(
                      icon: const Icon(Icons.phone, color: Colors.emerald, size: 18),
                      onPressed: () {},
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF022C22), Color(0xFF064E3B)]),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('MAUDAHA MART SYSTEM STATS', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Total Sales', style: TextStyle(color: Colors.white60, fontSize: 10)),
                  Text('₹48,290', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Admin Profit (3%)', style: TextStyle(color: Colors.white60, fontSize: 10)),
                  Text('₹1,448', style: TextStyle(color: Colors.amber, fontSize: 18, fontWeight: FontWeight.black)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Active Users', style: TextStyle(color: Colors.white60, fontSize: 10)),
                  Text('124 Users', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black)),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }
}
