import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    // Note: To run locally on your device, place your google-services.json (Android) 
    // or GoogleService-Info.plist (iOS) inside your project files, or initialize 
    // with current platform FirebaseOptions.
    await Firebase.initializeApp();
  } catch (e) {
    print('Firebase initialization skipped or done via platform channel: $e');
  }
  runApp(const MaudahaMartApp());
}

class MaudahaMartApp extends StatelessWidget {
  const MaudahaMartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Maudaha Mart',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFF064E3B),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF064E3B),
          primary: const Color(0xFF064E3B),
          secondary: const Color(0xFF10B981),
        ),
        fontFamily: 'Inter',
      ),
      home: const LoginScreen(),
    );
  }
}
