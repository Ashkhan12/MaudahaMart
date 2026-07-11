import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Get current auth state user
  User? get currentUser => _auth.currentUser;

  // Stream of auth state
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Sign In with Email & Password
  Future<RegisteredUser?> signIn(String email, String password) async {
    try {
      UserCredential credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      if (credential.user != null) {
        return await getUserProfile(credential.user!.uid);
      }
    } catch (e) {
      print('Firebase Sign In Error: $e');
      rethrow;
    }
    return null;
  }

  // Sign Up / Register New Account
  Future<RegisteredUser?> signUp({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String location,
  }) async {
    try {
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        final userId = credential.user!.uid;
        
        // Save user details to firestore 'users' collection
        final newUser = RegisteredUser(
          id: userId,
          name: name,
          phone: phone,
          email: email,
          location: location,
          locationHi: location, // Fallback Hindi representation
          role: 'customer',
        );

        await _db.collection('users').doc(userId).set(newUser.toJson());
        return newUser;
      }
    } catch (e) {
      print('Firebase Sign Up Error: $e');
      rethrow;
    }
    return null;
  }

  // Get User Profile from Firestore
  Future<RegisteredUser?> getUserProfile(String uid) async {
    try {
      DocumentSnapshot doc = await _db.collection('users').doc(uid).get();
      if (doc.exists && doc.data() != null) {
        return RegisteredUser.fromJson(doc.data() as Map<String, dynamic>, doc.id);
      }
    } catch (e) {
      print('Error getting user profile: $e');
    }
    return null;
  }

  // Update user profile location details
  Future<void> updateUserLocation(String uid, String location, {double? lat, double? lng}) async {
    try {
      await _db.collection('users').doc(uid).update({
        'location': location,
        'locationHi': location,
        if (lat != null) 'latitude': lat,
        if (lng != null) 'longitude': lng,
      });
    } catch (e) {
      print('Error updating location: $e');
    }
  }

  // Get Stores stream / future
  Stream<List<Store>> streamStores() {
    return _db.collection('stores').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return Store.fromJson(doc.data(), doc.id);
      }).toList();
    });
  }

  // Get Products for specific store
  Stream<List<Product>> streamStoreProducts(String storeId) {
    return _db
        .collection('products')
        .where('storeId', isEqualTo: storeId)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        return Product.fromJson(doc.data(), doc.id);
      }).toList();
    });
  }

  // Create an order
  Future<void> placeOrder(Order order) async {
    try {
      await _db.collection('orders').doc(order.id).set(order.toJson());
    } catch (e) {
      print('Error placing order: $e');
      rethrow;
    }
  }

  // Stream active orders for user
  Stream<List<Order>> streamUserOrders(String userId) {
    return _db
        .collection('orders')
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        return Order.fromJson(doc.data(), doc.id);
      }).toList();
    });
  }

  // Log Out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
