import 'package:flutter/material.dart';
import '../models/models.dart';

class FlightsScreen extends StatefulWidget {
  final RegisteredUser user;
  const FlightsScreen({super.key, required this.user});

  @override
  State<FlightsScreen> createState() => _FlightsScreenState();
}

class _FlightsScreenState extends State<FlightsScreen> {
  String _fromCity = 'LKO (Lucknow)';
  String _toCity = 'DEL (Delhi)';
  bool _hasSearched = false;

  final List<String> _cities = ['LKO (Lucknow)', 'DEL (Delhi)', 'BOM (Mumbai)', 'BLR (Bengaluru)', 'KNP (Kanpur)'];

  final List<Map<String, dynamic>> _flights = [
    {
      'airline': 'IndiGo',
      'number': '6E-2034',
      'departure': '07:30 AM',
      'arrival': '08:45 AM',
      'price': 3450,
      'gate': 'G-3'
    },
    {
      'airline': 'Air India',
      'number': 'AI-435',
      'departure': '11:15 AM',
      'arrival': '12:35 PM',
      'price': 4100,
      'gate': 'G-1'
    },
    {
      'airline': 'Vistara',
      'number': 'UK-872',
      'departure': '05:45 PM',
      'arrival': '07:05 PM',
      'price': 4800,
      'gate': 'G-5'
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Maudaha Travel & Flights ✈️', style: TextStyle(fontWeight: FontWeight.black)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Elegant Search Form Card
          Card(
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _fromCity,
                    decoration: const InputDecoration(labelText: 'From Airport', prefixIcon: Icon(Icons.flight_takeoff, color: Colors.emerald)),
                    items: _cities.map((city) {
                      return DropdownMenuItem(value: city, child: Text(city));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _fromCity = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _toCity,
                    decoration: const InputDecoration(labelText: 'To Airport', prefixIcon: Icon(Icons.flight_land, color: Colors.emerald)),
                    items: _cities.map((city) {
                      return DropdownMenuItem(value: city, child: Text(city));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _toCity = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _hasSearched = true;
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.emerald,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('SEARCH AVAILABLE FLIGHTS', style: TextStyle(fontWeight: FontWeight.black)),
                  )
                ],
              ),
            ),
          ),

          // Flight Results list
          if (_hasSearched)
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _flights.length,
                itemBuilder: (context, idx) {
                  final flight = _flights[idx];
                  return Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(flight['airline'], style: const TextStyle(fontWeight: FontWeight.black, fontSize: 14)),
                              Text(flight['number'], style: const TextStyle(fontSize: 10, color: Colors.slate)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text(flight['departure'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  const Icon(Icons.arrow_right_alt, size: 16, color: Colors.slate),
                                  Text(flight['arrival'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              )
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('₹${flight['price']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black, color: Colors.emerald)),
                              const SizedBox(height: 8),
                              ElevatedButton(
                                onPressed: () {
                                  _selectSeatAndBook(flight);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF064E3B),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                ),
                                child: const Text('Book Now', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              )
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
          else
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.airplane_ticket_outlined, size: 48, color: Colors.slate),
                    SizedBox(height: 12),
                    Text('Find cheap flights from Lucknow & Kanpur.', style: TextStyle(color: Colors.slate, fontSize: 13)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _selectSeatAndBook(Map<String, dynamic> flight) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FlightSeatPickerScreen(flight: flight, fromCity: _fromCity, toCity: _toCity),
      ),
    );
  }
}

class FlightSeatPickerScreen extends StatefulWidget {
  final Map<String, dynamic> flight;
  final String fromCity;
  final String toCity;
  const FlightSeatPickerScreen({super.key, required this.flight, required this.fromCity, required this.toCity});

  @override
  State<FlightSeatPickerScreen> createState() => _FlightSeatPickerScreenState();
}

class _FlightSeatPickerScreenState extends State<FlightSeatPickerScreen> {
  String? _selectedSeat;

  // Simple grid representations
  final List<String> _rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  final List<int> _cols = [1, 2, 3, 4, 5, 6, 7];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Seat', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.emerald.shade50,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${widget.flight['airline']} ${widget.flight['number']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('${widget.fromCity} ➔ ${widget.toCity}', style: const TextStyle(fontSize: 11)),
                  ],
                ),
                Text('Seat: ${_selectedSeat ?? "None"}', style: const TextStyle(fontWeight: FontWeight.black, color: Colors.emerald)),
              ],
            ),
          ),

          const SizedBox(height: 20),
          const Text('FRONT OF AIRCRAFT ✈️', style: TextStyle(fontSize: 10, fontWeight: FontWeight.black, color: Colors.slate)),
          const SizedBox(height: 20),

          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 6,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: _rows.length * _cols.length,
              itemBuilder: (context, idx) {
                final rIdx = idx ~/ _cols.length;
                final cIdx = idx % _cols.length;
                final seatName = '${_rows[rIdx]}${_cols[cIdx]}';
                final isSelected = _selectedSeat == seatName;

                // Simulate some random booked seats
                final isBooked = (idx % 5 == 1 || idx % 7 == 3);

                return GestureDetector(
                  onTap: isBooked ? null : () {
                    setState(() {
                      _selectedSeat = seatName;
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: isBooked 
                          ? Colors.slate.shade300 
                          : (isSelected ? Colors.emerald : Colors.white),
                      border: Border.all(color: isSelected ? Colors.emerald : Colors.slate.shade400),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      seatName,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isBooked ? Colors.slate : (isSelected ? Colors.white : Colors.black),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          if (_selectedSeat != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
              ),
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: _confirmTicket,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.emerald,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('CONFIRM TICKET & PAY', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            )
        ],
      ),
    );
  }

  void _confirmTicket() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.emerald, size: 60),
            const SizedBox(height: 12),
            const Text('BOARDING PASS SECURED', style: TextStyle(fontWeight: FontWeight.black, fontSize: 16)),
            const SizedBox(height: 16),
            
            // Electronic Boarding Ticket Card layout
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.slate.shade50,
                border: Border.all(color: Colors.slate.shade200),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Text(widget.flight['airline'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('SEAT $_selectedSeat', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.emerald)),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('FROM', style: TextStyle(fontSize: 10, color: Colors.slate)),
                          Text(widget.fromCity.substring(0, 3), style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16)),
                        ],
                      ),
                      const Icon(Icons.flight_takeoff, color: Colors.emerald),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('TO', style: TextStyle(fontSize: 10, color: Colors.slate)),
                          Text(widget.toCity.substring(0, 3), style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Mock Ticket QR Representation
                  Container(
                    width: 140,
                    height: 140,
                    color: Colors.white,
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.qr_code_2, size: 100, color: Colors.black),
                        Text('FLIGHT-${widget.flight['number']}-$_selectedSeat', style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close sheet
                Navigator.pop(context); // Close Seatpicker
                Navigator.pop(context); // Close Flights search
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF064E3B),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('BACK TO HOMEPAGE', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }
}
