import 'package:flutter/material.dart';
import '../services/firebase_service.dart';
import '../models/models.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final FirebaseService _fbService = FirebaseService();
  final _formKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationController = TextEditingController(text: "Station Road, Maudaha");

  bool _isSignUp = false;
  bool _isLoading = false;
  String _errorMessage = '';

  final List<Map<String, String>> _demoAccounts = [
    {
      'name': 'Maudaha Admin',
      'email': 'admin@maudahamart.com',
      'phone': '+91 9000000001',
      'role': 'Admin 🛡️',
    },
    {
      'name': 'Rahul Gupta (Merchant)',
      'email': 'rahul@maudahamart.com',
      'phone': '+91 9000000002',
      'role': 'Merchant 🏪',
    },
    {
      'name': 'Sanjay Kumar (Rider)',
      'email': 'sanjay@maudahamart.com',
      'phone': '+91 9000000003',
      'role': 'Rider 🚴',
    },
    {
      'name': 'Amit Verma (Customer)',
      'email': 'amit@gmail.com',
      'phone': '+91 9876543210',
      'role': 'Customer 🛒',
    },
  ];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      RegisteredUser? userProfile;
      if (_isSignUp) {
        userProfile = await _fbService.signUp(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
          password: _passwordController.text.trim(),
          location: _locationController.text.trim(),
        );
      } else {
        userProfile = await _fbService.signIn(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );
      }

      if (userProfile != null && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => HomeScreen(user: userProfile!)),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _loginWithDemo(Map<String, String> demo) async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      // In simulated demo mode, we fetch profile or auto-create/login
      // If the user does not exist yet in Firebase, we register them with standard password 'password123'
      RegisteredUser? user = await _fbService.signIn(demo['email']!, 'password123');
      if (user == null) {
        user = await _fbService.signUp(
          name: demo['name']!,
          email: demo['email']!,
          phone: demo['phone']!,
          password: 'password123',
          location: 'Station Road, Maudaha',
        );
      }

      if (user != null && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => HomeScreen(user: user!)),
        );
      }
    } catch (e) {
      // Try regular direct signin fallback or create profile mock
      try {
        RegisteredUser? user = await _fbService.getUserProfile('demo-${demo['email']}');
        if (user == null) {
          user = RegisteredUser(
            id: 'demo-${demo['email']}',
            name: demo['name']!,
            phone: demo['phone']!,
            email: demo['email'],
            location: 'Station Road, Maudaha',
            locationHi: 'स्टेशन रोड, मौदहा',
            role: demo['role']!.contains('Admin') ? 'admin' : (demo['role']!.contains('Merchant') ? 'merchant' : 'customer'),
          );
        }
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => HomeScreen(user: user!)),
          );
        }
      } catch (err) {
        setState(() {
          _errorMessage = 'Demo account connection: ${err.toString()}';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF030712), Color(0xFF064E3B)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Identity
                    const Text(
                      'Maudaha Mart 🏪',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.black,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _isSignUp ? 'Create your Shopper/Merchant Account' : 'Unified Multi-Portal Digital Ecosystem',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.emerald.shade200,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Inputs Block
                    Card(
                      elevation: 8,
                      color: Colors.white.withOpacity(0.08),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                        side: BorderSide(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            if (_isSignUp) ...[
                              TextFormField(
                                controller: _nameController,
                                decoration: const InputDecoration(
                                  labelText: 'Full Name',
                                  labelStyle: TextStyle(color: Colors.white70),
                                  prefixIcon: Icon(Icons.person, color: Colors.emerald),
                                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                                ),
                                style: const TextStyle(color: Colors.white),
                                validator: (val) => val == null || val.isEmpty ? 'Enter full name' : null,
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _phoneController,
                                decoration: const InputDecoration(
                                  labelText: 'Phone Number',
                                  labelStyle: TextStyle(color: Colors.white70),
                                  prefixIcon: Icon(Icons.phone, color: Colors.emerald),
                                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                                ),
                                style: const TextStyle(color: Colors.white),
                                keyboardType: TextInputType.phone,
                                validator: (val) => val == null || val.isEmpty ? 'Enter phone number' : null,
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _locationController,
                                decoration: const InputDecoration(
                                  labelText: 'Default Delivery Location',
                                  labelStyle: TextStyle(color: Colors.white70),
                                  prefixIcon: Icon(Icons.map_outlined, color: Colors.emerald),
                                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                                ),
                                style: const TextStyle(color: Colors.white),
                                validator: (val) => val == null || val.isEmpty ? 'Enter default location' : null,
                              ),
                              const SizedBox(height: 16),
                            ],
                            TextFormField(
                              controller: _emailController,
                              decoration: const InputDecoration(
                                labelText: 'Email Address',
                                labelStyle: TextStyle(color: Colors.white70),
                                prefixIcon: Icon(Icons.email, color: Colors.emerald),
                                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                              ),
                              style: const TextStyle(color: Colors.white),
                              keyboardType: TextInputType.emailAddress,
                              validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _passwordController,
                              decoration: const InputDecoration(
                                labelText: 'Password',
                                labelStyle: TextStyle(color: Colors.white70),
                                prefixIcon: Icon(Icons.lock, color: Colors.emerald),
                                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                              ),
                              style: const TextStyle(color: Colors.white),
                              obscureText: true,
                              validator: (val) => val == null || val.length < 6 ? 'Password must be at least 6 characters' : null,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    if (_errorMessage.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Text(
                          _errorMessage,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ),

                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.emeraldAccent.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isLoading
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text(_isSignUp ? 'REGISTER ACCOUNT' : 'SECURE SIGN IN', style: const TextStyle(fontWeight: FontWeight.black)),
                    ),
                    const SizedBox(height: 12),

                    TextButton(
                      onPressed: () {
                        setState(() {
                          _isSignUp = !_isSignUp;
                          _errorMessage = '';
                        });
                      },
                      child: Text(
                        _isSignUp ? 'Already have an account? Sign In' : 'New to Maudaha Mart? Register Here',
                        style: const TextStyle(color: Colors.white70),
                      ),
                    ),

                    const Divider(color: Colors.white24, height: 32),

                    // Quick simulation accounts list (just like web applet)
                    const Text(
                      '⚡ Quick Simulation Dev Mode Login',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.amberAccent, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    ..._demoAccounts.map((demo) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: InkWell(
                          onTap: () => _loginWithDemo(demo),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.04),
                              border: BorderSide(color: Colors.white.withOpacity(0.08)),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.between,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(demo['name']!, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                    Text(demo['phone']!, style: const TextStyle(color: Colors.white54, fontSize: 10)),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, py: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(demo['role']!, style: const TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.black)),
                                )
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
