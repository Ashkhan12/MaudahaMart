/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc, getDocs, writeBatch, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Store, Product, Review, Notification, RegisteredUser, SupportTicket, Order, SystemSettings, CustomPanel, PayoutRequest, PriceChangeLog, Restaurant, ClothingBoutique, MerchantRequest, ServiceArea } from './types';
import { INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_USERS, INITIAL_SUPPORT_TICKETS, INITIAL_ORDERS } from './data';
import { INITIAL_RESTAURANTS } from './dataRestaurants';
import { INITIAL_BOUTIQUES } from './dataClothing';

// Check if database is empty and seed it if necessary
export async function seedDatabaseIfEmpty() {
  try {
    // 1. One-time clear of all default shops, products, and merchants
    const settingsDocRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsDocRef);
    let isCleared = false;
    if (settingsSnap.exists()) {
      const data = settingsSnap.data() as SystemSettings;
      if (data.db_cleared_shops_v2) {
        isCleared = true;
      }
    }

    if (!isCleared) {
      console.log('Clearing old default stores, products, restaurants, boutiques, and merchants from Firestore...');
      const batch = writeBatch(db);

      // Delete all documents in stores collection
      const storesSnap = await getDocs(collection(db, 'stores'));
      storesSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Delete all documents in products collection
      const productsSnap = await getDocs(collection(db, 'products'));
      productsSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Delete all documents in restaurants collection
      const restaurantsSnap = await getDocs(collection(db, 'restaurants'));
      restaurantsSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Delete all documents in boutiques collection
      const boutiquesSnap = await getDocs(collection(db, 'boutiques'));
      boutiquesSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Delete all documents in merchantRequests collection
      const merchSnap = await getDocs(collection(db, 'merchantRequests'));
      merchSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Delete/update merchant users in users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.docs.forEach((docSnap) => {
        const userData = docSnap.data();
        if (userData.role === 'merchant' || userData.role === 'seller') {
          batch.delete(docSnap.ref);
        }
      });

      // Clear local storage keys so client knows they are deleted
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mau_stores');
        localStorage.removeItem('mau_products');
        localStorage.removeItem('mau_restaurants');
        localStorage.removeItem('mau_boutiques');
        localStorage.removeItem('mau_users');
      }

      // Mark as cleared in global settings
      if (settingsSnap.exists()) {
        batch.update(settingsDocRef, { db_cleared_shops_v2: true });
      } else {
        const defaultSettings: SystemSettings = {
          enableCustomerPortal: true,
          enableMerchantDashboard: true,
          enableRiderPortal: true,
          enableSupportPanel: true,
          enableUpiPayment: true,
          enableUpiPaymentShops: true,
          enableUpiPaymentRestaurants: true,
          enableUpiPaymentFashion: true,
          enableLiveRouteTracker: true,
          deliveryCharge: 15,
          minCheckoutAmount: 49,
          welcomeLoyaltyPoints: 25,
          coinToRupeeRate: 1,
          manualRiderSimulation: true,
          enableHindiTranslation: true,
          globalPromoBannerText: "🎉 SPECIAL SALE: Use Loyalty Coins to get instant discount up to 50% off!",
          globalPromoBannerTextHi: "🎉 विशेष सेल: 50% तक तत्काल छूट पाने के लिए लॉयल्टी कॉइन्स का उपयोग करें!",
          db_cleared_shops_v2: true
        };
        batch.set(settingsDocRef, defaultSettings);
      }

      await batch.commit();
      console.log('Successfully completed database cleanup of shops, products, and merchants.');
    }

    const storesSnapshot = await getDocs(collection(db, 'stores'));
    if (storesSnapshot.empty) {
      console.log('Firebase Firestore is empty. Seeding initial data for Maudaha Mart...');
      
      const batch = writeBatch(db);

      // 1. Seed stores
      INITIAL_STORES.forEach((store) => {
        const docRef = doc(db, 'stores', store.id);
        batch.set(docRef, store);
      });

      // 2. Seed products
      INITIAL_PRODUCTS.forEach((product) => {
        const docRef = doc(db, 'products', product.id);
        batch.set(docRef, product);
      });

      // 3. Seed reviews
      INITIAL_REVIEWS.forEach((review) => {
        const docRef = doc(db, 'reviews', review.id);
        batch.set(docRef, review);
      });

      // 4. Seed notifications
      INITIAL_NOTIFICATIONS.forEach((notif) => {
        const docRef = doc(db, 'notifications', notif.id);
        batch.set(docRef, notif);
      });

      // 5. Seed users
      INITIAL_USERS.forEach((user) => {
        const docRef = doc(db, 'users', user.id);
        batch.set(docRef, user);
      });

      // 6. Seed support tickets
      INITIAL_SUPPORT_TICKETS.forEach((ticket) => {
        const docRef = doc(db, 'supportTickets', ticket.id);
        batch.set(docRef, ticket);
      });

      // 7. Seed orders
      INITIAL_ORDERS.forEach((order) => {
        const docRef = doc(db, 'orders', order.id);
        batch.set(docRef, order);
      });

      // 8. Seed default settings
      const settingsDocRef = doc(db, 'settings', 'global');
      const defaultSettings: SystemSettings = {
        enableCustomerPortal: true,
        enableMerchantDashboard: true,
        enableRiderPortal: true,
        enableSupportPanel: true,
        enableUpiPayment: true,
        enableUpiPaymentShops: true,
        enableUpiPaymentRestaurants: true,
        enableUpiPaymentFashion: true,
        enableLiveRouteTracker: true,
        deliveryCharge: 15,
        minCheckoutAmount: 49,
        welcomeLoyaltyPoints: 25,
        coinToRupeeRate: 1,
        manualRiderSimulation: true,
        enableHindiTranslation: true,
        globalPromoBannerText: "🎉 SPECIAL SALE: Use Loyalty Coins to get instant discount up to 50% off!",
        globalPromoBannerTextHi: "🎉 विशेष सेल: 50% तक तत्काल छूट पाने के लिए लॉयल्टी कॉइन्स का उपयोग करें!"
      };
      batch.set(settingsDocRef, defaultSettings);

      // 9. Seed default custom panels
      const defaultPanel: CustomPanel = {
        id: 'panel-analytics',
        name: 'Maudaha Mart Analytics Hub',
        nameHi: 'मौदहा मार्ट विश्लेषिकी केंद्र',
        icon: 'TrendingUp',
        description: 'Real-time transaction volume, popular store heatmaps, and rider delivery times.',
        descriptionHi: 'वास्तविक समय में लेनदेन की मात्रा, लोकप्रिय दुकानों के मानचित्र और राइडर वितरण समय।',
        metrics: [
          { label: 'Avg Delivery Speed', labelHi: 'औसत वितरण गति', value: '14.2 Mins', icon: 'zap' },
          { label: 'Active Riders', labelHi: 'सक्रिय राइडर्स', value: '6 Riders', icon: 'truck' },
          { label: 'Shopper Conversion', labelHi: 'क्रेता रूपांतरण', value: '84.6%', icon: 'users' },
          { label: 'Net Commission Saved', labelHi: 'बचाया गया शुद्ध कमीशन', value: '₹14,230', icon: 'dollar' }
        ],
        richContent: "### Galla Mandi vs Naya Bazar Performance\nOur current metrics show **Gupta Ji Kirana** leads in Galla Mandi with a high conversion rate of 88%. Meanwhile, in Naya Bazar, fruit & vegetable demand is peaking during evening slots (5 PM - 8 PM).\n\n- **Peak Traffic Zones**: Maudaha Central Chauraha\n- **Rider Allocation**: Standard standby at Station Rd.",
        richContentHi: "### गल्ला मंडी बनाम नया बाजार प्रदर्शन\nहमारे वर्तमान मेट्रिक्स दिखाते हैं कि **गुप्ता जी किराना** 88% की उच्च रूपांतरण दर के साथ गल्ला मंडी में अग्रणी है। इस बीच, नया बाजार में शाम के समय (शाम 5 बजे - रात 8 बजे) फलों और सब्जियों की मांग चरम पर है।\n\n- **पीक ट्रैफिक जोन**: मौदहा सेंट्रल चौराहा\n- **राइडर आवंटन**: स्टेशन रोड पर मानक स्टैंडबाय।",
        dateCreated: '2026-06-28',
        status: 'active'
      };
      batch.set(doc(db, 'customPanels', defaultPanel.id), defaultPanel);

      // 10. Seed payout requests
      const initialPayouts: PayoutRequest[] = [
        {
          id: 'payout-req-seed-1',
          sellerId: 'gupta-kirana',
          sellerName: 'Gupta Ji Kirana',
          amount: 850,
          upiId: 'guptaji@okicici',
          status: 'approved',
          date: '2026-06-25'
        },
        {
          id: 'payout-req-seed-2',
          sellerId: 'gupta-kirana',
          sellerName: 'Gupta Ji Kirana',
          amount: 1200,
          upiId: 'guptaji@okicici',
          status: 'pending',
          date: '2026-06-28'
        }
      ];
      initialPayouts.forEach((req) => {
        batch.set(doc(db, 'payoutRequests', req.id), req);
      });

      await batch.commit();
      console.log('Seeding completed successfully!');
    }

    // Individual check to seed restaurants if empty
    const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
    if (restaurantsSnapshot.empty) {
      console.log('Firebase Firestore is missing restaurants. Seeding initial restaurants...');
      const batch = writeBatch(db);
      INITIAL_RESTAURANTS.forEach((rest) => {
        batch.set(doc(db, 'restaurants', rest.id), rest);
      });
      await batch.commit();
    }

    // Individual check to seed boutiques if empty
    const boutiquesSnapshot = await getDocs(collection(db, 'boutiques'));
    if (boutiquesSnapshot.empty) {
      console.log('Firebase Firestore is missing boutiques. Seeding initial boutiques...');
      const batch = writeBatch(db);
      INITIAL_BOUTIQUES.forEach((bt) => {
        batch.set(doc(db, 'boutiques', bt.id), bt);
      });
      await batch.commit();
    }

    // Individual check to seed serviceAreas if empty
    const serviceAreasSnapshot = await getDocs(collection(db, 'serviceAreas'));
    if (serviceAreasSnapshot.empty) {
      console.log('Firebase Firestore is missing service areas. Seeding initial service areas...');
      const batch = writeBatch(db);
      const INITIAL_SERVICE_AREAS: ServiceArea[] = [
        {
          id: 'area-maudaha',
          area_name: 'Maudaha Central',
          pincode: '210507',
          city: 'Maudaha',
          state: 'Uttar Pradesh',
          delivery_charge: 15,
          free_delivery_above: 199,
          minimum_order_amount: 49,
          estimated_delivery_time: '15-30 Mins',
          max_distance_km: 5,
          polygon_coordinates: [
            { lat: 25.682, lng: 80.124 },
            { lat: 25.690, lng: 80.135 },
            { lat: 25.675, lng: 80.145 },
            { lat: 25.668, lng: 80.130 }
          ],
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_orders: 142,
          monthly_orders: 48,
          active_customers: 35,
          revenue: 18450,
          average_delivery_time: '18 mins',
          cancellation_rate: 1.5,
          delivery_slots: ["Morning (08:00 AM - 12:00 PM)", "Afternoon (12:00 PM - 04:00 PM)", "Evening (04:00 PM - 08:00 PM)", "Instant Delivery"],
          delivery_types: ["Instant", "Scheduled", "Free", "Paid"]
        },
        {
          id: 'area-hamirpur',
          area_name: 'Hamirpur Town',
          pincode: '210301',
          city: 'Hamirpur',
          state: 'Uttar Pradesh',
          delivery_charge: 20,
          free_delivery_above: 249,
          minimum_order_amount: 59,
          estimated_delivery_time: '20-40 Mins',
          max_distance_km: 8,
          polygon_coordinates: [
            { lat: 25.952, lng: 80.144 },
            { lat: 25.960, lng: 80.155 },
            { lat: 25.945, lng: 80.165 },
            { lat: 25.938, lng: 80.150 }
          ],
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_orders: 89,
          monthly_orders: 22,
          active_customers: 19,
          revenue: 9420,
          average_delivery_time: '24 mins',
          cancellation_rate: 2.1,
          delivery_slots: ["Morning Slots", "Evening Slots", "Instant Delivery"],
          delivery_types: ["Instant", "Scheduled", "Paid"]
        },
        {
          id: 'area-banda',
          area_name: 'Banda City',
          pincode: '210001',
          city: 'Banda',
          state: 'Uttar Pradesh',
          delivery_charge: 25,
          free_delivery_above: 299,
          minimum_order_amount: 69,
          estimated_delivery_time: '25-45 Mins',
          max_distance_km: 10,
          polygon_coordinates: [
            { lat: 25.482, lng: 80.324 },
            { lat: 25.490, lng: 80.335 },
            { lat: 25.475, lng: 80.345 },
            { lat: 25.468, lng: 80.330 }
          ],
          status: 'Inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_orders: 0,
          monthly_orders: 0,
          active_customers: 0,
          revenue: 0,
          average_delivery_time: 'N/A',
          cancellation_rate: 0.0,
          delivery_slots: ["Express Morning", "Express Evening"],
          delivery_types: ["Instant", "Scheduled"]
        }
      ];
      INITIAL_SERVICE_AREAS.forEach((area) => {
        batch.set(doc(db, 'serviceAreas', area.id), area);
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('Failed to check/seed Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, 'seedDatabaseIfEmpty');
  }
}

// Helper to load all collections from Firestore
export async function loadAllCollections() {
  try {
    const [
      storesSnap,
      productsSnap,
      reviewsSnap,
      ordersSnap,
      notificationsSnap,
      usersSnap,
      ticketsSnap,
      settingsSnap,
      panelsSnap,
      payoutsSnap,
      priceLogsSnap,
      restaurantsSnap,
      boutiquesSnap,
      merchantRequestsSnap,
      serviceAreasSnap
    ] = await Promise.all([
      getDocs(collection(db, 'stores')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'reviews')),
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'notifications')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'supportTickets')),
      getDoc(doc(db, 'settings', 'global')),
      getDocs(collection(db, 'customPanels')),
      getDocs(collection(db, 'payoutRequests')),
      getDocs(collection(db, 'priceLogs')),
      getDocs(collection(db, 'restaurants')),
      getDocs(collection(db, 'boutiques')),
      getDocs(collection(db, 'merchantRequests')),
      getDocs(collection(db, 'serviceAreas'))
    ]);
    
    const pathForGetDocs = 'serviceAreas'; // path is declared

    return {
      stores: storesSnap.docs.map(d => ({ ...d.data(), id: d.id } as Store)),
      products: productsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)),
      reviews: reviewsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Review)),
      orders: ordersSnap.docs.map(d => ({ ...d.data(), id: d.id } as Order)),
      notifications: notificationsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Notification)),
      users: usersSnap.docs.map(d => ({ ...d.data(), id: d.id } as RegisteredUser)),
      supportTickets: ticketsSnap.docs.map(d => ({ ...d.data(), id: d.id } as SupportTicket)),
      settings: settingsSnap.exists() ? (settingsSnap.data() as SystemSettings) : null,
      customPanels: panelsSnap.docs.map(d => ({ ...d.data(), id: d.id } as CustomPanel)),
      payoutRequests: payoutsSnap.docs.map(d => ({ ...d.data(), id: d.id } as PayoutRequest)),
      priceLogs: priceLogsSnap.docs.map(d => ({ ...d.data(), id: d.id } as PriceChangeLog)),
      restaurants: restaurantsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Restaurant)),
      boutiques: boutiquesSnap.docs.map(d => ({ ...d.data(), id: d.id } as ClothingBoutique)),
      merchantRequests: merchantRequestsSnap.docs.map(d => ({ ...d.data(), id: d.id } as MerchantRequest)),
      serviceAreas: serviceAreasSnap.docs.map(d => ({ ...d.data(), id: d.id } as ServiceArea))
    };
  } catch (err) {
    console.error('Failed to load collections from Firestore:', err);
    handleFirestoreError(err, OperationType.LIST, 'loadAllCollections');
    throw err;
  }
}

// Single-document Firestore updates
export async function syncDocToFirestore(collectionName: string, id: string, data: any) {
  if (!id || id === 'undefined' || id.trim() === '') {
    console.warn(`[syncDocToFirestore] Blocked invalid sync for path ${collectionName}/${id}`);
    return;
  }
  try {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
  } catch (err) {
    console.error(`Sync doc to firestore failed (${collectionName}/${id}):`, err);
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${id}`);
  }
}

export async function deleteDocFromFirestore(collectionName: string, id: string) {
  if (!id || id === 'undefined' || id.trim() === '') {
    console.warn(`[deleteDocFromFirestore] Blocked invalid delete for path ${collectionName}/${id}`);
    return;
  }
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Delete doc from firestore failed (${collectionName}/${id}):`, err);
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
  }
}
