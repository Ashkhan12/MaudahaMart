import 'package:flutter/material.dart';
import '../models/models.dart';

class DoctorsScreen extends StatefulWidget {
  final RegisteredUser user;
  const DoctorsScreen({super.key, required this.user});

  @override
  State<DoctorsScreen> createState() => _DoctorsScreenState();
}

class _DoctorsScreenState extends State<DoctorsScreen> {
  String _selectedSpecialty = 'All';

  final List<Map<String, dynamic>> _doctors = [
    {
      'id': 'doc_sk_verma',
      'name': 'Dr. S. K. Verma',
      'specialty': 'General Physician',
      'exp': '15 Years',
      'fee': 200,
      'clinic': 'Verma Medical Clinic, Maudaha',
      'avatar': '👨‍⚕️',
      'upi': 'vermaclinic@upi'
    },
    {
      'id': 'doc_amrita',
      'name': 'Dr. Amrita Sen',
      'specialty': 'Pediatrician',
      'exp': '10 Years',
      'fee': 250,
      'clinic': 'Maudaha Children Hospital',
      'avatar': '👩‍⚕️',
      'upi': 'amritasen@upi'
    },
    {
      'id': 'doc_sharma',
      'name': 'Dr. Alok Sharma',
      'specialty': 'Dermatologist',
      'exp': '8 Years',
      'fee': 300,
      'clinic': 'Skin Care Center, Galla Mandi',
      'avatar': '👨‍⚕️',
      'upi': 'aloksharma@upi'
    }
  ];

  @override
  Widget build(BuildContext context) {
    final filteredDocs = _selectedSpecialty == 'All'
        ? _doctors
        : _doctors.where((d) => d['specialty'] == _selectedSpecialty).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Doctors & Telehealth 🩺', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Informational Alert Banner
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.red.shade50,
            child: const Row(
              children: [
                Icon(Icons.gpp_maybe, color: Colors.redAccent, size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Emergency? Please call 102/108 or proceed directly to Maudaha Community Health Centre.',
                    style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                )
              ],
            ),
          ),

          // Specialties filter row
          SizedBox(
            height: 60,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(12),
              children: ['All', 'General Physician', 'Pediatrician', 'Dermatologist'].map((spec) {
                final isSel = _selectedSpecialty == spec;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(spec, style: const TextStyle(fontSize: 11)),
                    selected: isSel,
                    onSelected: (val) {
                      setState(() {
                        _selectedSpecialty = spec;
                      });
                    },
                    selectedColor: Colors.red.shade100,
                    checkmarkColor: Colors.red.shade900,
                  ),
                );
              }).toList(),
            ),
          ),

          // Doctors Cards
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filteredDocs.length,
              itemBuilder: (context, idx) {
                final doc = filteredDocs[idx];
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          alignment: Alignment.center,
                          child: Text(doc['avatar'], style: const TextStyle(fontSize: 28)),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(doc['name']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.slate)),
                              Text(doc['specialty']!, style: TextStyle(fontSize: 11, color: Colors.red.shade700, fontWeight: FontWeight.bold)),
                              Text('Experience: ${doc['exp']} | Fee: ₹${doc['fee']}', style: const TextStyle(fontSize: 11, color: Colors.slate)),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 10, color: Colors.slate),
                                  const SizedBox(width: 2),
                                  Expanded(child: Text(doc['clinic']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10, color: Colors.slate))),
                                ],
                              ),
                              const Divider(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () {
                                        _bookClinic(doc);
                                      },
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        side: BorderSide(color: Colors.red.shade200),
                                      ),
                                      child: const Text('In-Clinic Slot', style: TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        _startConsultation(doc);
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('Instant Telehealth', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                    ),
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

  void _bookClinic(Map<String, dynamic> doc) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Physical Clinic Appointment', style: TextStyle(fontWeight: FontWeight.black, fontSize: 14)),
        content: Text('Successfully registered your queue slot at ${doc['clinic']}. Please present this screen at the reception desk to pay your fee ₹${doc['fee']} in cash/UPI.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _startConsultation(Map<String, dynamic> doc) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DoctorConsultationChatScreen(doctor: doc),
      ),
    );
  }
}

class DoctorConsultationChatScreen extends StatefulWidget {
  final Map<String, dynamic> doctor;
  const DoctorConsultationChatScreen({super.key, required this.doctor});

  @override
  State<DoctorConsultationChatScreen> createState() => _DoctorConsultationChatScreenState();
}

class _DoctorConsultationChatScreenState extends State<DoctorConsultationChatScreen> {
  final List<Map<String, String>> _messages = [];
  final _msgController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _messages.add({
      'sender': 'doctor',
      'text': 'Hello! I am ${widget.doctor['name']}. Please tell me your current symptoms, temperature, or any health concerns you have today.'
    });
  }

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _msgController.clear();
    });

    // Simulate instant secure diagnostic reply from the doctor
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _messages.add({
            'sender': 'doctor',
            'text': 'Thank you for explaining. Here is your medical prescription based on symptoms:\n\n'
                    'Rx:\n'
                    '1. Tab. Paracetamol 650mg -- thrice a day for 3 days.\n'
                    '2. Syr. Benadryl -- 10ml twice a day for 5 days.\n\n'
                    'Advice: Rest well, drink plenty of warm fluids.\n\n'
                    'Signed,\n'
                    '${widget.doctor['name']}'
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.doctor['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final msg = _messages[idx];
                final isDoc = msg['sender'] == 'doctor';
                return Align(
                  alignment: isDoc ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    maxWidth: MediaQuery.of(context).size.width * 0.8,
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDoc ? Colors.red.shade50 : Colors.emerald.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDoc ? Colors.red.shade100 : Colors.emerald.shade100),
                    ),
                    child: Text(
                      msg['text']!,
                      style: TextStyle(fontSize: 12, color: Colors.slate.shade800, height: 1.4),
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.black12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: InputDecoration(
                      hintText: 'Describe symptoms (e.g., headache, cough)...',
                      hintStyle: const TextStyle(fontSize: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.red),
                  onPressed: _sendMessage,
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
