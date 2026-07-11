import 'package:flutter/material.dart';
import '../models/models.dart';

class ServicesScreen extends StatefulWidget {
  final RegisteredUser user;
  const ServicesScreen({super.key, required this.user});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  String _selectedCategory = 'All';

  final List<Map<String, dynamic>> _technicians = [
    {
      'id': 'srv_electrician_1',
      'name': 'Suresh Kumar (Electrician)',
      'category': 'Electrical',
      'rate': '₹150/hr',
      'experience': '6 Years',
      'rating': 4.7,
      'phone': '+91 9100000010',
      'avatar': '⚡',
    },
    {
      'id': 'srv_plumber_1',
      'name': 'Ramesh Nishad (Plumber)',
      'category': 'Plumbing',
      'rate': '₹120/hr',
      'experience': '5 Years',
      'rating': 4.8,
      'phone': '+91 9100000011',
      'avatar': '🔧',
    },
    {
      'id': 'srv_carpenter_1',
      'name': 'Mohammad Aslam (Carpenter)',
      'category': 'Carpentry',
      'rate': '₹180/hr',
      'experience': '10 Years',
      'rating': 4.9,
      'phone': '+91 9100000012',
      'avatar': '🪚',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredTechs = _selectedCategory == 'All'
        ? _technicians
        : _technicians.where((t) => t['category'] == _selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Maudaha Town Services 🛠️', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Informational micro banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.amber.shade50,
            width: double.infinity,
            child: Row(
              children: [
                const Icon(Icons.shield_outlined, color: Colors.amber, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('VERIFIED LOCAL EXPERTS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.black, color: Colors.amber)),
                      Text('All Maudaha technicians are background checked with fixed hourly commissions.', style: TextStyle(fontSize: 10, color: Colors.amber.shade900)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Categories chips
          SizedBox(
            height: 60,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(12),
              children: ['All', 'Electrical', 'Plumbing', 'Carpentry'].map((cat) {
                final isSel = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(cat, style: const TextStyle(fontSize: 11)),
                    selected: isSel,
                    onSelected: (val) {
                      setState(() {
                        _selectedCategory = cat;
                      });
                    },
                    selectedColor: Colors.amber.shade100,
                    checkmarkColor: Colors.amber.shade900,
                  ),
                );
              }).toList(),
            ),
          ),

          // Technicians List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filteredTechs.length,
              itemBuilder: (context, idx) {
                final tech = filteredTechs[idx];
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          alignment: Alignment.center,
                          child: Text(tech['avatar']!, style: const TextStyle(fontSize: 24)),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(tech['name']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.slate)),
                              Text(tech['category']!, style: const TextStyle(fontSize: 11, color: Colors.blueAccent, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Experience: ${tech['experience']} | Rate: ${tech['rate']}', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                              Row(
                                children: [
                                  const Icon(Icons.star, color: Colors.amber, size: 12),
                                  const SizedBox(width: 4),
                                  Text('${tech['rating']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const Divider(height: 16),
                              ElevatedButton.icon(
                                onPressed: () {
                                  _bookTechnician(tech);
                                },
                                icon: const Icon(Icons.calendar_month, size: 14),
                                label: const Text('Book Expert', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF064E3B),
                                  foregroundColor: Colors.white,
                                  minimumSize: const Size(double.infinity, 32),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
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

  void _bookTechnician(Map<String, dynamic> tech) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Book ${tech['name']}', style: const TextStyle(fontWeight: FontWeight.black, fontSize: 14)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Confirm your scheduled address for the expert visit:', style: TextStyle(fontSize: 11, color: Colors.slate)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.slate.shade100, borderRadius: BorderRadius.circular(10)),
              child: Text(widget.user.location, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),
            const Text('The technician will call your mobile number prior to starting the trip.', style: TextStyle(fontSize: 10, color: Colors.redAccent, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.slate)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Successfully booked ${tech['name']}! Ticket created.')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald, foregroundColor: Colors.white),
            child: const Text('Confirm Booking'),
          )
        ],
      ),
    );
  }
}
