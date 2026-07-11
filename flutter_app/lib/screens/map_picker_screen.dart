import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class MapPickerScreen extends StatefulWidget {
  final String initialAddress;
  const MapPickerScreen({super.key, this.initialAddress = ''});

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  LatLng _selectedCoords = const LatLng(25.6815, 80.1132); // Center of Maudaha Town
  String _resolvedAddress = '';
  bool _isLoadingLocation = false;
  GoogleMapController? _mapController;

  final List<Map<String, dynamic>> _localSites = [
    { "name": "Maudaha Town Centre", "lat": 25.6815, "lng": 80.1132, "desc": "Main commercial and residential center" },
    { "name": "Husain Ganj", "lat": 25.6945, "lng": 80.1082, "desc": "North-west residential expansion" },
    { "name": "Ragauli", "lat": 25.6605, "lng": 80.1255, "desc": "Southern agricultural suburb" },
    { "name": "Chhani", "lat": 25.7150, "lng": 80.1450, "desc": "Northeast highway village node" },
    { "name": "Silauli", "lat": 25.6580, "lng": 80.0880, "desc": "Southwest boundary village" },
  ];

  @override
  void initState() {
    super.initState();
    _resolvedAddress = widget.initialAddress;
    if (_resolvedAddress.isEmpty) {
      _resolvedAddress = "Maudaha Town Centre, Maudaha";
    }
  }

  Future<void> _locateMe() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        final latLng = LatLng(position.latitude, position.longitude);
        
        setState(() {
          _selectedCoords = latLng;
        });

        _mapController?.animateCamera(CameraUpdate.newLatLngZoom(latLng, 15));
        await _reverseGeocode(latLng);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not access live GPS: $e. Defaulting to Maudaha town center.')),
      );
    } finally {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  Future<void> _reverseGeocode(LatLng coords) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(coords.latitude, coords.longitude);
      if (placemarks.isNotEmpty) {
        final pm = placemarks.first;
        setState(() {
          _resolvedAddress = "${pm.street ?? ''}, ${pm.locality ?? 'Maudaha'}, ${pm.administrativeArea ?? 'UP'}";
        });
      }
    } catch (e) {
      // Fallback nearest landmark calculations
      double minDistance = 99999.0;
      String nearest = "Maudaha Town";
      for (var site in _localSites) {
        final dist = (site['lat'] - coords.latitude) * (site['lat'] - coords.latitude) +
                     (site['lng'] - coords.longitude) * (site['lng'] - coords.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = site['name'];
        }
      }
      setState(() {
        _resolvedAddress = "Near $nearest, Maudaha, UP";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose Live Location', style: TextStyle(fontWeight: FontWeight.black, fontSize: 16)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          // Google Maps Engine (with offline fallback capability in simulators)
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _selectedCoords,
              zoom: 14,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
            },
            onCameraMove: (position) {
              setState(() {
                _selectedCoords = position.target;
              });
            },
            onCameraIdle: () {
              _reverseGeocode(_selectedCoords);
            },
            markers: {
              Marker(
                markerId: const MarkerId('selected_position'),
                position: _selectedCoords,
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
              ),
            },
          ),

          // Central crosshair/pin representation
          const Align(
            alignment: Alignment.center,
            child: Padding(
              padding: EdgeInsets.only(bottom: 36),
              child: Icon(Icons.location_pin, color: Colors.emerald, size: 48),
            ),
          ),

          // Search Suggestions / Overlays
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))],
              ),
              child: Row(
                children: [
                  const Icon(Icons.search, color: Colors.slate),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<Map<String, dynamic>>(
                        hint: const Text('Jump to Landmark...', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        items: _localSites.map((site) {
                          return DropdownMenuItem<Map<String, dynamic>>(
                            value: site,
                            child: Text(site['name'], style: const TextStyle(fontSize: 12)),
                          );
                        }).toList(),
                        onChanged: (site) {
                          if (site != null) {
                            final latLng = LatLng(site['lat'], site['lng']);
                            setState(() {
                              _selectedCoords = latLng;
                              _resolvedAddress = site['name'];
                            });
                            _mapController?.animateCamera(CameraUpdate.newLatLngZoom(latLng, 15));
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Floating GPS Trigger
          Positioned(
            bottom: 180,
            right: 16,
            child: FloatingActionButton(
              onPressed: _locateMe,
              backgroundColor: Colors.emerald,
              foregroundColor: Colors.white,
              child: _isLoadingLocation 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Icon(Icons.my_location),
            ),
          ),

          // Confirm Bottom Card
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 15, offset: Offset(0, -4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.emerald.shade50, borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.map, color: Colors.emerald),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'CONFIRMED LOCATION ADDRESS',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.black, color: Colors.emerald),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _resolvedAddress,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.slate),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop(_resolvedAddress);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.emerald,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('CONFIRM ADDRESS', style: TextStyle(fontWeight: FontWeight.black)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
