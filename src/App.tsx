/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Sparkles, MapPin, Layers, History, Bell, Languages, Store as StoreIcon, ShieldAlert, Shield, Palette, LogOut, User, Heart, Utensils, Shirt, Package, MessageSquare, Train, Plane, ArrowRight, X, LifeBuoy, FileText, Wrench, Stethoscope, Grid, Gift, ArrowLeft } from 'lucide-react';
import { Language, Store, Product, Review, Order, OrderItem, LoyaltyInfo, Notification, RegisteredUser, UserActivity, AppState, SupportTicket, SupportMessage, SystemSettings, CustomPanel, PayoutRequest, PriceChangeLog, ScratchCard, Restaurant, ClothingBoutique, MerchantRequest, UserRole, ServiceArea } from './types';
import { INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_USERS, INITIAL_SUPPORT_TICKETS, INITIAL_ORDERS, TRANSLATIONS } from './data';
import { INITIAL_RESTAURANTS } from './dataRestaurants';
import { INITIAL_BOUTIQUES } from './dataClothing';
import CustomerPortal from './components/CustomerPortal';
import MerchantDashboard from './components/MerchantDashboard';
import OrderTracker from './components/OrderTracker';
import AdminPortal from './components/AdminPortal';
import DeliveryAgentPortal from './components/DeliveryAgentPortal';
import SupportPanel from './components/SupportPanel';
import UserOrderPanel from './components/UserOrderPanel';
import LoginPage from './components/LoginPage';
import RestaurantCorner from './components/RestaurantCorner';
import ClothingHub from './components/ClothingHub';
import ServicesCorner from './components/ServicesCorner';
import TravelCorner from './components/TravelCorner';
import CustomerHome from './components/CustomerHome';
import ManagerPortal from './components/ManagerPortal';
import RoleDashboards from './components/RoleDashboards';
import { THEMES, generateThemeStyles, getColorsAndDescForWeather } from './theme';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import UserProfileCorner from './components/UserProfileCorner';
import WishlistCartDrawer from './components/WishlistCartDrawer';
import { seedDatabaseIfEmpty, loadAllCollections, syncDocToFirestore } from './firebaseSync';
import { motion, AnimatePresence } from 'motion/react';
import AndroidAppHub from './components/AndroidAppHub';
import OrderReviewPopup from './components/OrderReviewPopup';
import ScratchCardComponent from './components/ScratchCardComponent';
import BusinessPitchDeck from "./components/BusinessPitchDeck";

const AnimatedBagSparklesIcon = () => {
  return (
    <div className="relative h-6 w-6 flex items-center justify-center">
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-500 group-hover:text-emerald-600 transition duration-300"
        animate={{
          y: [0, -1, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }}
      >
        {/* Shopping bag outline */}
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />

        {/* Small sparkle 1 (Left) */}
        <motion.path
          d="M7 14.5l1 1.5l1.5 1l-1.5 1l-1 1.5l-1-1.5l-1.5-1l1.5-1z"
          fill="#10b981"
          stroke="none"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut"
          }}
        />
        
        {/* Large sparkle 2 (Center) */}
        <motion.path
          d="M12 11.5l1.2 2l2 1.2l-2 1.2l-1.2 2l-1.2-2l-2-1.2l2-1.2z"
          fill="#10b981"
          stroke="none"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
            delay: 0.3
          }}
        />

        {/* Small sparkle 3 (Right) */}
        <motion.path
          d="M17 13.5l0.8 1.2l1.2 0.8l-1.2 0.8l-0.8 1.2l-0.8-1.2l-1.2-0.8l1.2-0.8z"
          fill="#10b981"
          stroke="none"
          animate={{
            scale: [0.9, 1.3, 0.9],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
            delay: 0.6
          }}
        />
      </motion.svg>

    </div>
  );
};

export default function App() {
  // --- Persistable States ---
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mau_lang');
    return (saved as Language) || 'en';
  });

  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('mau_role');
    const savedActiveUid = localStorage.getItem('mau_active_uid');
    const savedUsers = localStorage.getItem('mau_users');
    if (savedActiveUid && savedUsers) {
      try {
        const parsedUsers: RegisteredUser[] = JSON.parse(savedUsers);
        const currentUser = parsedUsers.find(u => u.id === savedActiveUid);
        if (currentUser && currentUser.email?.toLowerCase() === 'biengwithash@gmail.com') {
          return 'admin';
        }
      } catch (e) {
        console.error('Error parsing saved users at startup:', e);
      }
    }
    return (savedRole as UserRole) || 'customer';
  });

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('mau_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('mau_restaurants');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [boutiques, setBoutiques] = useState<ClothingBoutique[]>(() => {
    const saved = localStorage.getItem('mau_boutiques');
    return saved ? JSON.parse(saved) : INITIAL_BOUTIQUES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mau_products');
    const raw: any[] = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    return raw.map(p => {
      const sp = p.sellingPrice ?? p.price ?? 0;
      return {
        ...p,
        price: sp,
        sellingPrice: sp,
        mrp: p.mrp ?? Math.round(sp * 1.25),
        msp: p.msp ?? Math.round(sp * 0.85)
      };
    });
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('mau_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mau_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [loyalty, setLoyalty] = useState<LoyaltyInfo>(() => {
    const saved = localStorage.getItem('mau_loyalty');
    if (saved) return JSON.parse(saved);
    return {
      points: 25, // Start with 25 coins welcome balance
      tier: 'Bronze',
      history: [
        {
          date: '2026-06-28',
          description: 'Welcome Sign Up Bonus',
          descriptionHi: 'स्वागत साइन अप बोनस',
          points: 25,
          type: 'earn'
        }
      ]
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('mau_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [cart, setCart] = useState<{ [storeId: string]: OrderItem[] }>(() => {
    try {
      const activeUid = localStorage.getItem('mau_active_uid') || 'user-1';
      const savedUsers = localStorage.getItem('mau_users');
      if (savedUsers) {
        const parsedUsers: RegisteredUser[] = JSON.parse(savedUsers);
        const activeUser = parsedUsers.find(u => u.id === activeUid);
        if (activeUser && activeUser.cart) {
          return activeUser.cart;
        }
      }
    } catch (e) {
      console.error('Failed to parse user-specific cart at startup:', e);
    }
    const saved = localStorage.getItem('mau_cart');
    return saved ? JSON.parse(saved) : {};
  });

  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('mau_users');
    if (saved) {
      const parsedUsers: RegisteredUser[] = JSON.parse(saved);
      const missingUsers = INITIAL_USERS.filter(iu => !parsedUsers.some(pu => pu.id === iu.id));
      return [...parsedUsers, ...missingUsers];
    }
    return INITIAL_USERS;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('mau_active_uid') || 'user-1';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mau_logged_in') === 'true';
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('mau_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('mau_settings');
    if (saved) return JSON.parse(saved);
    return {
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
  });

  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(() => {
    const saved = localStorage.getItem('mau_service_areas');
    if (saved) return JSON.parse(saved);
    return [
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
      }
    ];
  });

  const [selectedServiceAreaId, setSelectedServiceAreaId] = useState<string>(() => {
    return localStorage.getItem('mau_selected_area_id') || 'area-maudaha';
  });

  useEffect(() => {
    localStorage.setItem('mau_service_areas', JSON.stringify(serviceAreas));
  }, [serviceAreas]);

  useEffect(() => {
    localStorage.setItem('mau_selected_area_id', selectedServiceAreaId);
  }, [selectedServiceAreaId]);

  // Lock selectedServiceAreaId to customer's assigned service area
  useEffect(() => {
    if (isLoggedIn && role === 'customer' && activeUserId) {
      const activeUser = users.find(u => u.id === activeUserId);
      if (activeUser) {
        const userArea = activeUser.serviceAreaId || activeUser.assignedArea || 'area-maudaha';
        if (selectedServiceAreaId !== userArea) {
          setSelectedServiceAreaId(userArea);
        }
      }
    }
  }, [isLoggedIn, role, activeUserId, users, selectedServiceAreaId]);

  const [customPanels, setCustomPanels] = useState<CustomPanel[]>(() => {
    const saved = localStorage.getItem('mau_custom_panels');
    if (saved) return JSON.parse(saved);
    return [
      {
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
      }
    ];
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    const saved = localStorage.getItem('mau_payout_requests');
    if (saved) return JSON.parse(saved);
    return [
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
        date: '2026-07-01'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mau_payout_requests', JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  const [merchantRequests, setMerchantRequests] = useState<MerchantRequest[]>(() => {
    const saved = localStorage.getItem('mau_merchant_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mau_merchant_requests', JSON.stringify(merchantRequests));
  }, [merchantRequests]);

  const [priceLogs, setPriceLogs] = useState<PriceChangeLog[]>(() => {
    const saved = localStorage.getItem('mau_price_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mau_price_logs', JSON.stringify(priceLogs));
  }, [priceLogs]);

  const [scratchCards, setScratchCards] = useState<ScratchCard[]>(() => {
    const saved = localStorage.getItem('mau_scratch_cards');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mau_scratch_cards', JSON.stringify(scratchCards));
  }, [scratchCards]);

  // --- Runtime UI States (Non-Persisted) ---
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [activeOrderTrackingId, setActiveOrderTrackingId] = useState<string | null>(null);
  const [merchantStoreId, setMerchantStoreId] = useState<string>('gupta-kirana');
  const [useCoins, setUseCoins] = useState<boolean>(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [viewingNotificationPanel, setViewingNotificationPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'loyalty' | 'support' | 'restaurants' | 'clothing' | 'services' | 'travel' | 'home'>('home');
  const [showAndroidHub, setShowAndroidHub] = useState<boolean>(false);

  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);

  // Programmatically checks for the specific admin email 'biengwithash@gmail.com' and assigns 'admin' role privileges on first load
  const checkAndAssignAdminRole = (userList: RegisteredUser[], activeId: string) => {
    const savedRole = localStorage.getItem('mau_role');
    if (savedRole) return; // Respect user's explicit role selection
    
    const matchedUser = userList.find(u => u.id === activeId);
    const targetUser = matchedUser || userList.find(u => u.email?.toLowerCase() === 'biengwithash@gmail.com');
    if (targetUser && targetUser.email?.toLowerCase() === 'biengwithash@gmail.com') {
      setRole('admin');
      localStorage.setItem('mau_role', 'admin');
    }
  };

  // Run initial check once database is loaded
  useEffect(() => {
    if (!isDbLoading && isLoggedIn) {
      checkAndAssignAdminRole(users, activeUserId);
    }
  }, [isDbLoading, isLoggedIn]);

  // Sync data from Firestore at startup
  useEffect(() => {
    async function initFirebaseAndSync() {
      try {
        await seedDatabaseIfEmpty();
        const data = await loadAllCollections();
        if (data) {
          if (data.stores && data.stores.length > 0) setStores(data.stores);
          if (data.products && data.products.length > 0) setProducts(data.products);
          if (data.reviews && data.reviews.length > 0) setReviews(data.reviews);
          
          if (data.orders && data.orders.length > 0) {
            setOrders(prev => {
              const merged = [...data.orders];
              prev.forEach(localOrder => {
                if (!merged.some(o => o.id === localOrder.id)) {
                  merged.push(localOrder);
                }
              });
              localStorage.setItem('mau_orders', JSON.stringify(merged));
              return merged;
            });
          }
          
          if (data.notifications && data.notifications.length > 0) setNotifications(data.notifications);
          
          if (data.users && data.users.length > 0) {
            setUsers(prev => {
              const merged = [...data.users];
              prev.forEach(localUser => {
                if (!merged.some(u => u.id === localUser.id)) {
                  merged.push(localUser);
                }
              });
              localStorage.setItem('mau_users', JSON.stringify(merged));
              return merged;
            });
            checkAndAssignAdminRole(data.users, activeUserId);
          }
          
          if (data.supportTickets && data.supportTickets.length > 0) {
            setSupportTickets(prev => {
              const merged = [...data.supportTickets];
              prev.forEach(localTicket => {
                if (!merged.some(t => t.id === localTicket.id)) {
                  merged.push(localTicket);
                }
              });
              localStorage.setItem('mau_support_tickets', JSON.stringify(merged));
              return merged;
            });
          }
          
          if (data.settings) setSettings(data.settings);
          if (data.customPanels && data.customPanels.length > 0) setCustomPanels(data.customPanels);
          if (data.payoutRequests && data.payoutRequests.length > 0) setPayoutRequests(data.payoutRequests);
          if (data.priceLogs && data.priceLogs.length > 0) setPriceLogs(data.priceLogs);

          if (data.restaurants && data.restaurants.length > 0) {
            setRestaurants(prev => {
              const merged = [...data.restaurants];
              prev.forEach(localRest => {
                if (!merged.some(r => r.id === localRest.id)) {
                  merged.push(localRest);
                }
              });
              localStorage.setItem('mau_restaurants', JSON.stringify(merged));
              return merged;
            });
          }
          if (data.boutiques && data.boutiques.length > 0) {
            setBoutiques(prev => {
              const merged = [...data.boutiques];
              prev.forEach(localBt => {
                if (!merged.some(b => b.id === localBt.id)) {
                  merged.push(localBt);
                }
              });
              localStorage.setItem('mau_boutiques', JSON.stringify(merged));
              return merged;
            });
          }
          if (data.serviceAreas && data.serviceAreas.length > 0) {
            setServiceAreas(prev => {
              const merged = [...data.serviceAreas];
              prev.forEach(localArea => {
                if (!merged.some(a => a.id === localArea.id)) {
                  merged.push(localArea);
                }
              });
              localStorage.setItem('mau_service_areas', JSON.stringify(merged));
              return merged;
            });
          }
          if (data.merchantRequests && data.merchantRequests.length > 0) {
            setMerchantRequests(data.merchantRequests);
          }
        }
      } catch (err) {
        console.error('Failed to initialize and load database:', err);
      } finally {
        setIsDbLoading(false);
      }
    }
    initFirebaseAndSync();
  }, []);

  // Sync states to Firestore when updated locally (excluding during initial DB loading)
  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  // Drawer & Toggle States for global Profile, Wishlist & Cart
  
  // Unified diff-based Firestore sync to prevent quota exhaustion
  const prevStates = useRef<any>({});
  
  useEffect(() => {
    if (isDbLoading) return;
    
    const syncCollection = (name: string, currentArray: any[]) => {
      if (!prevStates.current[name]) {
        prevStates.current[name] = currentArray;
        return;
      }
      
      const prevArray = prevStates.current[name];
      currentArray.forEach(item => {
        const prevItem = prevArray.find((p: any) => p.id === item.id);
        if (JSON.stringify(item) !== JSON.stringify(prevItem)) {
           syncDocToFirestore(name, item.id, item);
        }
      });
      prevStates.current[name] = currentArray;
    };

    syncCollection('stores', stores);
    syncCollection('restaurants', restaurants);
    syncCollection('boutiques', boutiques);
    syncCollection('products', products);
    syncCollection('reviews', reviews);
    syncCollection('orders', orders);
    syncCollection('notifications', notifications);
    syncCollection('users', users);
    syncCollection('supportTickets', supportTickets);
    syncCollection('customPanels', customPanels);
    syncCollection('payoutRequests', payoutRequests);
    syncCollection('serviceAreas', serviceAreas);
    syncCollection('merchantRequests', merchantRequests);
    syncCollection('priceLogs', priceLogs);
    
    // Settings is a single object
    if (!prevStates.current['settings']) {
       prevStates.current['settings'] = settings;
    } else {
       if (JSON.stringify(settings) !== JSON.stringify(prevStates.current['settings'])) {
          syncDocToFirestore('settings', 'global', settings);
          prevStates.current['settings'] = settings;
       }
    }

  }, [
    isDbLoading, stores, restaurants, boutiques, products, reviews, orders, 
    notifications, users, supportTickets, settings, customPanels, 
    payoutRequests, serviceAreas, merchantRequests, priceLogs
  ]);

  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState<boolean>(false);
  const [showSupportDrawer, setShowSupportDrawer] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'cart' | 'wishlist'>('cart');

  // --- User-Specific Theming and Privacy Modal States ---
  const [themeId, setThemeId] = useState<string>(() => {
    const activeUid = localStorage.getItem('mau_active_uid') || 'user-1';
    return localStorage.getItem(`mau_theme_${activeUid}`) || 'emerald';
  });
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  // Sync theme when active user switches
  useEffect(() => {
    const savedTheme = localStorage.getItem(`mau_theme_${activeUserId}`) || 'emerald';
    setThemeId(savedTheme);
  }, [activeUserId]);

  // Inject generated CSS styles into document head whenever themeId changes
  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    
    let styleEl = document.getElementById('mau-theme-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'mau-theme-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = generateThemeStyles(theme);
  }, [themeId]);

  const t = TRANSLATIONS[language];
  const activeUser = users.find(u => u.id === activeUserId);

  // --- Save to localStorage when state changes ---
  useEffect(() => {
    localStorage.setItem('mau_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mau_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('mau_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('mau_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mau_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('mau_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mau_loyalty', JSON.stringify(loyalty));
  }, [loyalty]);

  useEffect(() => {
    localStorage.setItem('mau_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('mau_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mau_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mau_active_uid', activeUserId);
  }, [activeUserId]);

  // Keep cart in sync with active user inside the users state
  useEffect(() => {
    setUsers(prevUsers => {
      const activeUser = prevUsers.find(u => u.id === activeUserId);
      if (activeUser) {
        if (JSON.stringify(activeUser.cart || {}) !== JSON.stringify(cart)) {
          return prevUsers.map(u => {
            if (u.id === activeUserId) {
              return { ...u, cart };
            }
            return u;
          });
        }
      }
      return prevUsers;
    });
  }, [cart, activeUserId]);

  const prevActiveUserIdRef = useRef<string | null>(null);

  // Load the selected user's cart when active user switches
  useEffect(() => {
    if (prevActiveUserIdRef.current !== activeUserId) {
      prevActiveUserIdRef.current = activeUserId;
      const activeUser = users.find(u => u.id === activeUserId);
      if (activeUser) {
        setCart(activeUser.cart || {});
      } else {
        setCart({});
      }
    }
  }, [activeUserId, users]);

  useEffect(() => {
    localStorage.setItem('mau_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('mau_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mau_custom_panels', JSON.stringify(customPanels));
  }, [customPanels]);

  // --- Simulate real-time order delivery progress transitions ---
  useEffect(() => {
    const activeTrackingOrder = orders.find(o => o.id === activeOrderTrackingId);
    if (!activeTrackingOrder || activeTrackingOrder.deliveryStatus === 'arrived') return;

    const timer = setTimeout(() => {
      const statuses: Order['deliveryStatus'][] = ['pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'out_for_delivery', 'arrived'];
      const currentIndex = statuses.indexOf(activeTrackingOrder.deliveryStatus);
      if (currentIndex < statuses.length - 1) {
        const nextStatus = statuses[currentIndex + 1];
        
        // Update order status
        const updated = orders.map(o => {
          if (o.id === activeOrderTrackingId) {
            return { 
              ...o, 
              deliveryStatus: nextStatus,
              ...(nextStatus === 'arrived' ? { deliveredAt: Date.now() } : {})
            };
          }
          return o;
        });
        setOrders(updated);

        // Push temporary simulated notification
        const progressNotifications = {
          processing: { en: 'Merchant has accepted and started preparing your order!', hi: 'व्यापारी ने स्वीकार कर लिया है और आपका ऑर्डर तैयार करना शुरू कर दिया है!' },
          ready_for_pickup: { en: 'Your order is packed and ready for pickup!', hi: 'आपका ऑर्डर पैक हो गया है और पिकअप के लिए तैयार है!' },
          ready_for_delivery: { en: 'Rider has picked up your order!', hi: 'सवार ने आपका ऑर्डर उठा लिया है!' },
          out_for_delivery: { en: 'Your rider is out for delivery! On the way.', hi: 'आपका सवार डिलीवरी के लिए बाहर है! रास्ते में है।' },
          arrived: { en: 'Rider reached! Collect your hot groceries.', hi: 'सवार पहुँच गया! अपनी ताजी सामग्री प्राप्त करें।' }
        };

        const alertText = progressNotifications[nextStatus as keyof typeof progressNotifications];
        if (alertText) {
          const newAlert: Notification = {
            id: 'n-order-' + Date.now(),
            title: language === 'en' ? 'Order Update' : 'ऑर्डर अपडेट',
            titleHi: 'ऑर्डर अपडेट',
            body: language === 'en' ? alertText.en : alertText.hi,
            bodyHi: alertText.hi,
            type: 'order',
            date: '2026-06-28',
            isRead: false
          };
          setNotifications(prev => [newAlert, ...prev]);
          setShowNotificationBadge(true);
        }
      }
    }, 15000); // Transition every 15s for visual simulation

    return () => clearTimeout(timer);
  }, [orders, activeOrderTrackingId, language]);

  // --- Handle Custom Actions ---
  const handleAddToCart = (storeId: string, product: Product) => {
    const storeCart = cart[storeId] || [];
    const existing = storeCart.find(it => it.product.id === product.id);

    let updatedCart: OrderItem[];
    if (existing) {
      updatedCart = storeCart.map(it => 
        it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it
      );
    } else {
      updatedCart = [...storeCart, { product, quantity: 1 }];
    }

    setCart({
      ...cart,
      [storeId]: updatedCart
    });
  };

  const handleRemoveFromCart = (storeId: string, productId: string) => {
    const storeCart = cart[storeId] || [];
    const existing = storeCart.find(it => it.product.id === productId);

    if (!existing) return;

    let updatedCart: OrderItem[];
    if (existing.quantity === 1) {
      updatedCart = storeCart.filter(it => it.product.id !== productId);
    } else {
      updatedCart = storeCart.map(it => 
        it.product.id === productId ? { ...it, quantity: it.quantity - 1 } : it
      );
    }

    setCart({
      ...cart,
      [storeId]: updatedCart
    });
  };

  const handleClearCart = (storeId: string) => {
    const newCarts = { ...cart };
    delete newCarts[storeId];
    setCart(newCarts);
    setUseCoins(false);
  };

  const handleToggleWatchlist = (productId: string) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === activeUserId) {
        const currentWatchlist = user.watchlist || [];
        const hasItem = currentWatchlist.includes(productId);
        const nextWatchlist = hasItem
          ? currentWatchlist.filter(id => id !== productId)
          : [...currentWatchlist, productId];
        return { ...user, watchlist: nextWatchlist };
      }
      return user;
    }));
  };

  const handleAddReview = (newReview: Review) => {
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate store rating
    const storeRevs = updatedReviews.filter(r => r.storeId === newReview.storeId);
    const avg = parseFloat(
      (storeRevs.reduce((sum, r) => sum + r.rating, 0) / storeRevs.length).toFixed(1)
    );

    const updatedStores = stores.map(s => {
      if (s.id === newReview.storeId) {
        return {
          ...s,
          rating: avg,
          reviewCount: storeRevs.length
        };
      }
      return s;
    });

    setStores(updatedStores);

    const targetStore = stores.find(s => s.id === newReview.storeId);
    handleAddUserActivity(activeUserId, `Added a ${newReview.rating}-star review for store: ${targetStore?.name || 'Local Store'}`, `दुकान के लिए ${newReview.rating}-स्टार समीक्षा जोड़ी गई`);
  };

  const handleAddNotification = (newNotification: Notification) => {
    setNotifications([newNotification, ...notifications]);
    setShowNotificationBadge(true);
  };

  const handleCheckout = (
    storeId: string,
    paymentMethod: 'UPI' | 'COD',
    upiId?: string,
    discountAmount = 0,
    redeemedCoins = 0
  ) => {
    const storeCart = cart[storeId] || [];
    const subtotal = storeCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const isEligibleFreeDelivery = subtotal >= 199;
    const finalTotal = Math.max(0, subtotal - discountAmount + (isEligibleFreeDelivery ? 0 : settings.deliveryCharge));

    // Deduct stock
    const updatedProducts = products.map(p => {
      const cartItem = storeCart.find(it => it.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Points earned (5 coins per Rs.100 spent)
    const pointsEarned = Math.floor(subtotal / 20);

    const targetStore = stores.find(s => s.id === storeId);

    const newOrder: Order = {
      id: 'MAU-' + Math.floor(1000 + Math.random() * 9000),
      userId: activeUserId,
      items: storeCart,
      total: finalTotal,
      discount: discountAmount,
      paymentMethod,
      upiId,
      paymentStatus: paymentMethod === 'UPI' ? 'completed' : 'pending',
      deliveryStatus: 'pending',
      date: new Date().toISOString().split('T')[0],
      storeId,
      storeName: targetStore?.name || 'Local Store',
      storeNameHi: targetStore?.nameHi || 'स्थानीय दुकान',
      coinsEarned: pointsEarned,
      coinsRedeemed: redeemedCoins,
      customerLocation: activeUser?.location || 'Station Road, Maudaha',
      customerLocationHi: activeUser?.locationHi || 'स्टेशन रोड, मौदहा',
      serviceAreaId: selectedServiceAreaId
    };

    // Update orders history
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // Auto-calculate seller's MSP-based share and queue payout request + notification for UPI payments
    if (paymentMethod === 'UPI') {
      const sellerShare = Math.round(storeCart.reduce((sum, item) => {
        const msp = item.product.msp ?? (item.product.sellingPrice ?? item.product.price);
        return sum + msp * item.quantity;
      }, 0));

      const newPayoutReq: PayoutRequest = {
        id: 'payout-auto-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
        sellerId: storeId,
        sellerName: targetStore?.name || 'Local Store',
        amount: sellerShare,
        upiId: targetStore?.upiId || 'merchant@ybl',
        status: 'approved',
        date: new Date().toISOString().split('T')[0]
      };
      setPayoutRequests(prev => [...prev, newPayoutReq]);

      const sellerNotif: Notification = {
        id: 'NOTIF-UPI-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
        title: `⚡ Instant UPI Settlement: ₹${sellerShare}`,
        titleHi: `⚡ त्वरित UPI भुगतान: ₹${sellerShare}`,
        body: `Order ${newOrder.id} paid via UPI. Seller's share of ₹${sellerShare} (based on MSP) has been instantly routed to your UPI ID: ${newPayoutReq.upiId}.`,
        bodyHi: `ऑर्डर ${newOrder.id} का भुगतान UPI द्वारा किया गया। ₹${sellerShare} का सेलर हिस्सा (MSP पर आधारित) आपके UPI आईडी पर तुरंत भेज दिया गया है: ${newPayoutReq.upiId}।`,
        type: 'general',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      };
      setNotifications(prev => [sellerNotif, ...prev]);
    }

    // Update loyalty points
    let finalPoints = loyalty.points - redeemedCoins + pointsEarned;
    let nextTier = loyalty.tier;
    if (finalPoints > 500) nextTier = 'Platinum';
    else if (finalPoints > 200) nextTier = 'Gold';
    else if (finalPoints > 80) nextTier = 'Silver';

    const loyaltyHistory = [...loyalty.history];
    if (redeemedCoins > 0) {
      loyaltyHistory.push({
        date: new Date().toISOString().split('T')[0],
        description: `Redeemed coins at ${targetStore?.name}`,
        descriptionHi: `${targetStore?.nameHi} पर कॉइन्स रिडीम किए गए`,
        points: -redeemedCoins,
        type: 'redeem'
      });
    }
    if (pointsEarned > 0) {
      loyaltyHistory.push({
        date: new Date().toISOString().split('T')[0],
        description: `Earned for purchase at ${targetStore?.name}`,
        descriptionHi: `${targetStore?.nameHi} पर खरीदारी के लिए अर्जित किया`,
        points: pointsEarned,
        type: 'earn'
      });
    }

    setLoyalty({
      points: finalPoints,
      tier: nextTier,
      history: loyaltyHistory
    });

    // Mark used scratch cards
    const usedCardIds: string[] = [];
    storeCart.forEach(item => {
      const activeCard = scratchCards.find(c =>
        c.userId === activeUserId &&
        c.productId === item.product.id &&
        c.isScratched &&
        !c.isUsed
      );
      if (activeCard) {
        usedCardIds.push(activeCard.id);
      }
    });

    if (usedCardIds.length > 0) {
      setScratchCards(prev => prev.map(c => 
        usedCardIds.includes(c.id) ? { ...c, isUsed: true } : c
      ));
    }

    // Clear cart for this store
    handleClearCart(storeId);

    // Set tracking view active
    setActiveOrderTrackingId(newOrder.id);

    // Generate a scratch card for this order placement!
    const fourDaysAgo = new Date();
    fourDaysAgo.setHours(0, 0, 0, 0);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    
    const recentlyOrderedProductIds = new Set<string>();
    // Look at all orders in the last 4 days
    orders.forEach(o => {
      const oDate = new Date(o.date + 'T00:00:00');
      if (oDate.getTime() >= fourDaysAgo.getTime()) {
        o.items.forEach(it => {
          if (it.product && it.product.id) {
            recentlyOrderedProductIds.add(it.product.id);
          }
        });
      }
    });

    // Also add the items from the current order to the recently ordered set so they aren't immediately recommended again
    storeCart.forEach(it => {
      if (it.product && it.product.id) {
        recentlyOrderedProductIds.add(it.product.id);
      }
    });

    let eligibleProductsForScratch = products.filter(p => !recentlyOrderedProductIds.has(p.id));
    if (eligibleProductsForScratch.length === 0) {
      eligibleProductsForScratch = products; // Fallback
    }

    if (eligibleProductsForScratch.length > 0) {
      const randomProduct = eligibleProductsForScratch[Math.floor(Math.random() * eligibleProductsForScratch.length)];
      const discountPercentage = Math.floor(Math.random() * 6) + 5; // 5% to 10%
      
      const newCard: ScratchCard = {
        id: 'SC-' + Math.floor(1000 + Math.random() * 9000),
        userId: activeUserId,
        productId: randomProduct.id,
        productName: randomProduct.name,
        productNameHi: randomProduct.nameHi,
        discountPercentage,
        isScratched: false,
        isUsed: false,
        createdAt: new Date().toISOString(),
        storeId: randomProduct.storeId
      };

      setScratchCards(prev => [newCard, ...prev]);

      // Add a notification about the scratch card
      const scratchNotif: Notification = {
        id: 'NOTIF-' + Math.floor(1000 + Math.random() * 9000),
        title: "🎁 You've earned a Scratch Card!",
        titleHi: "🎉 आपको एक स्क्रैच कार्ड मिला है!",
        body: `Complete order rewards! Scratch to reveal an extra ${discountPercentage}% discount on ${randomProduct.name}!`,
        bodyHi: `ऑर्डर पूरा होने का इनाम! ${randomProduct.nameHi} पर अतिरिक्त ${discountPercentage}% छूट पाने के लिए स्क्रैच करें!`,
        type: 'general',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      };
      setNotifications(prev => [scratchNotif, ...prev]);
      setShowNotificationBadge(true);
    }

    // Log user activity
    handleAddUserActivity(activeUserId, `Placed order ${newOrder.id} for ₹${finalTotal}`, `ऑर्डर ${newOrder.id} ₹${finalTotal} के लिए दिया`);
  };

  const handleRateRider = (orderId: string, rating: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, riderRating: rating } : o));
    handleAddUserActivity(activeUserId, `Rated delivery rider ${rating} stars for order ${orderId}`, `ऑर्डर ${orderId} के लिए डिलीवरी बॉय को ${rating} स्टार रेटिंग दी`);
  };

  const handleCancelOrder = (orderId: string) => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    const orderToCancel = orders[orderIndex];

    if (orderToCancel.deliveryStatus !== 'pending' && orderToCancel.deliveryStatus !== 'processing') {
      alert(language === 'en' ? 'Order cannot be cancelled at this stage.' : 'इस स्तर पर ऑर्डर रद्द नहीं किया जा सकता।');
      return;
    }

    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = { ...orderToCancel, deliveryStatus: 'cancelled' };
    setOrders(updatedOrders);
    
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Order Cancelled',
      titleHi: 'ऑर्डर रद्द किया गया',
      body: `Your order #${orderId} has been cancelled successfully.`,
      bodyHi: `आपका ऑर्डर #${orderId} सफलतापूर्वक रद्द कर दिया गया है।`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'order'
    };
    handleAddNotification(newNotif);
    
    // Refund logic for redeemed coins (if any) and deducting earned coins
    if (orderToCancel.coinsRedeemed > 0 || orderToCancel.coinsEarned > 0) {
      const netPoints = (orderToCancel.coinsRedeemed || 0) - (orderToCancel.coinsEarned || 0);
      let finalPoints = loyalty.points + netPoints;
      if (finalPoints < 0) finalPoints = 0;
      
      let nextTier = loyalty.tier;
      if (finalPoints > 500) nextTier = 'Platinum';
      else if (finalPoints > 200) nextTier = 'Gold';
      else if (finalPoints > 80) nextTier = 'Silver';
      else nextTier = 'Bronze';

      const loyaltyHistory = [...loyalty.history];
      if (netPoints !== 0) {
        loyaltyHistory.unshift({
          date: new Date().toISOString().split('T')[0],
          description: `Refund for cancelled order ${orderId}`,
          descriptionHi: `रद्द किए गए ऑर्डर ${orderId} के लिए वापसी`,
          points: netPoints,
          type: netPoints > 0 ? 'earn' : 'redeem'
        });
      }

      setLoyalty({
        points: finalPoints,
        tier: nextTier,
        history: loyaltyHistory
      });
    }
    
    alert(language === 'en' ? 'Order cancelled successfully!' : 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया है!');
  };

  const handleUpdateProductPricesAndStock = (
    productId: string,
    updates: { mrp?: number; sellingPrice?: number; msp?: number; price?: number; stock?: number; name?: string; nameHi?: string; image?: string },
    changedBy: 'seller' | 'admin',
    changerName: string
  ) => {
    const oldProduct = products.find(p => p.id === productId);
    if (!oldProduct) return;

    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const spVal = updates.sellingPrice !== undefined ? updates.sellingPrice : (updates.price !== undefined ? updates.price : p.price);
        return {
          ...p,
          mrp: updates.mrp !== undefined ? updates.mrp : p.mrp,
          sellingPrice: spVal,
          price: spVal,
          msp: updates.msp !== undefined ? updates.msp : p.msp,
          stock: updates.stock !== undefined ? updates.stock : p.stock,
          name: updates.name !== undefined ? updates.name : p.name,
          nameHi: updates.nameHi !== undefined ? updates.nameHi : p.nameHi,
          image: updates.image !== undefined ? updates.image : p.image,
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    const hasPriceChange =
      (updates.mrp !== undefined && updates.mrp !== oldProduct.mrp) ||
      (updates.sellingPrice !== undefined && updates.sellingPrice !== oldProduct.sellingPrice) ||
      (updates.price !== undefined && updates.price !== oldProduct.price) ||
      (updates.msp !== undefined && updates.msp !== oldProduct.msp);

    if (hasPriceChange) {
      const newLog: PriceChangeLog = {
        id: 'log-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
        productId,
        productName: oldProduct.name,
        oldMrp: oldProduct.mrp ?? oldProduct.price,
        newMrp: updates.mrp !== undefined ? updates.mrp : (oldProduct.mrp ?? oldProduct.price),
        oldSellingPrice: oldProduct.sellingPrice ?? oldProduct.price,
        newSellingPrice: updates.sellingPrice !== undefined ? updates.sellingPrice : (updates.price !== undefined ? updates.price : (oldProduct.sellingPrice ?? oldProduct.price)),
        oldMsp: oldProduct.msp ?? Math.round((oldProduct.sellingPrice ?? oldProduct.price) * 0.85),
        newMsp: updates.msp !== undefined ? updates.msp : (oldProduct.msp ?? Math.round((oldProduct.sellingPrice ?? oldProduct.price) * 0.85)),
        changedBy: changerName || (changedBy === 'admin' ? 'Admin' : 'Seller'),
        changedByEmail: changedBy === 'admin' ? 'admin@maudahamart.com' : 'seller@maudahamart.com',
        userRole: changedBy === 'seller' ? 'merchant' : 'admin',
        timestamp: new Date().toISOString()
      };
      setPriceLogs(prev => [newLog, ...prev]);
    }
  };

  const handleAddUserActivity = (userId: string, action: string, actionHi: string) => {
    const newAct: UserActivity = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action,
      actionHi
    };
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          activities: [newAct, ...u.activities]
        };
      }
      return u;
    }));
  };

  const handleAddUserSearch = (userId: string, query: string) => {
    if (!query.trim()) return;
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        const cleanedQuery = query.trim().toLowerCase();
        const updatedHistory = [cleanedQuery, ...u.searchHistory.filter(q => q.toLowerCase() !== cleanedQuery)];
        
        // Also log activity
        const newAct: UserActivity = {
          id: 'act-' + Date.now(),
          timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: `Searched for "${query.trim()}"`,
          actionHi: `"${query.trim()}" की खोज की`
        };

        return {
          ...u,
          searchHistory: updatedHistory.slice(0, 10),
          activities: [newAct, ...u.activities]
        };
      }
      return u;
    }));
  };

  const handleAddSupportTicket = (subject: string, category: string, firstMessage: string) => {
    const activeUser = users.find(u => u.id === activeUserId);
    const dateStr = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit', year: 'numeric' });
    const ticketId = 'ticket-' + Date.now();
    const firstMsgId = 'msg-' + Date.now();

    const newTicket: SupportTicket = {
      id: ticketId,
      userId: activeUserId,
      userName: activeUser?.name || 'Resident',
      userPhone: activeUser?.phone || '',
      subject,
      category,
      status: 'open',
      createdAt: dateStr,
      messages: [
        {
          id: firstMsgId,
          sender: 'user',
          senderName: activeUser?.name || 'Resident',
          text: firstMessage,
          timestamp: dateStr
        }
      ]
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    handleAddUserActivity(activeUserId, `Opened a support ticket (#${ticketId}) on "${subject}"`, `सहायता टिकट (#${ticketId}) "${subject}" विषय पर खोला`);
  };

  const handleAddSupportMessage = (ticketId: string, text: string) => {
    const activeUser = users.find(u => u.id === activeUserId);
    const dateStr = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit', year: 'numeric' });
    const msgId = 'msg-' + Date.now();

    const newMsg: SupportMessage = {
      id: msgId,
      sender: 'user',
      senderName: activeUser?.name || 'Resident',
      text,
      timestamp: dateStr
    };

    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'open',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
  };

  const handleAdminReplySupportTicket = (ticketId: string, text: string) => {
    const dateStr = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit', year: 'numeric' });
    const msgId = 'msg-' + Date.now();

    const newMsg: SupportMessage = {
      id: msgId,
      sender: 'admin',
      senderName: 'Admin',
      text,
      timestamp: dateStr
    };

    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
  };

  const handleToggleTicketStatus = (ticketId: string, status: 'open' | 'resolved') => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status
        };
      }
      return t;
    }));
  };

  const visibleStores = role === 'customer' 
    ? stores.filter(s => (s as any).serviceAreaId === selectedServiceAreaId || (!(s as any).serviceAreaId && selectedServiceAreaId === 'area-maudaha')) 
    : stores;
  const visibleRestaurants = role === 'customer' 
    ? restaurants.filter(r => (r as any).serviceAreaId === selectedServiceAreaId || (!(r as any).serviceAreaId && selectedServiceAreaId === 'area-maudaha')) 
    : restaurants;
  const visibleBoutiques = role === 'customer' 
    ? boutiques.filter(b => (b as any).serviceAreaId === selectedServiceAreaId || (!(b as any).serviceAreaId && selectedServiceAreaId === 'area-maudaha')) 
    : boutiques;
  const visibleStoreIds = visibleStores.map(s => s.id);
  const visibleProducts = role === 'customer' 
    ? products.filter(p => visibleStoreIds.includes(p.storeId)) 
    : products;

  const productsWithScratchDiscount = visibleProducts.map(p => {
    const activeScratchCard = scratchCards.find(c => 
      c.userId === activeUserId && 
      c.productId === p.id && 
      c.isScratched && 
      !c.isUsed
    );
    if (activeScratchCard) {
      const originalPrice = p.price;
      const discountAmount = Math.round(originalPrice * (activeScratchCard.discountPercentage / 100));
      const discountedPrice = Math.max(1, originalPrice - discountAmount);
      return {
        ...p,
        price: discountedPrice,
        mrp: p.mrp || originalPrice, // Use original price as MRP if no MRP exists
        originalPrice // Cache it in case we want to show a strikethrough or label!
      };
    }
    return p;
  });

  const cartWithScratchDiscount = (() => {
    const updatedCart: { [storeId: string]: OrderItem[] } = {};
    Object.keys(cart).forEach(storeId => {
      updatedCart[storeId] = (cart[storeId] || []).map(item => {
        const activeCard = scratchCards.find(c => 
          c.userId === activeUserId && 
          c.productId === item.product.id && 
          c.isScratched && 
          !c.isUsed
        );
        if (activeCard) {
          const originalPrice = item.product.price;
          const discountAmount = Math.round(originalPrice * (activeCard.discountPercentage / 100));
          const discountedPrice = Math.max(1, originalPrice - discountAmount);
          return {
            ...item,
            product: {
              ...item.product,
              price: discountedPrice,
              mrp: item.product.mrp || originalPrice,
              originalPrice
            }
          };
        }
        return item;
      });
    });
    return updatedCart;
  })();

  if (!isLoggedIn) {
    return (
      <LoginPage
        language={language}
        existingUsers={users}
        serviceAreas={serviceAreas}
        onLoginSuccess={(user, selectedRole) => {
          let roleToAssign = selectedRole;
          if (user.email?.toLowerCase() === 'biengwithash@gmail.com') {
            roleToAssign = 'admin';
          }
          setActiveUserId(user.id);
          setRole(roleToAssign);
          setIsLoggedIn(true);
          localStorage.setItem('mau_logged_in', 'true');
          localStorage.setItem('mau_active_uid', user.id);
          localStorage.setItem('mau_role', roleToAssign);
        }}
        onAddNewUser={(newUser) => {
          setUsers(prev => {
            const updated = [...prev, newUser];
            localStorage.setItem('mau_users', JSON.stringify(updated));
            return updated;
          });
          // Directly and immediately write the newly registered user to Firestore
          syncDocToFirestore('users', newUser.id, newUser);
        }}
      />
    );
  }

  return (
    <div className={`bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 ${role === 'customer' && settings.enableCustomerPortal && !activeOrderTrackingId ? 'pb-20 md:pb-0' : ''}`}>
      


      {/* Universal Top Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            {/* Back Button */}
            {(activeTab !== 'home' || selectedStoreId || activeOrderTrackingId || showAdminPortal) && (
              <button 
                onClick={() => {
                   if (showAdminPortal) {
                      setShowAdminPortal(false);
                   } else if (activeOrderTrackingId) {
                      setActiveOrderTrackingId(null);
                   } else if (selectedStoreId) {
                      setSelectedStoreId(null);
                   } else if (activeTab !== 'home') {
                      setActiveTab('home');
                   }
                }}
                className="mr-1 p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {/* Logo */}
            <div
              onClick={() => {
                setSelectedStoreId(null);
                setActiveOrderTrackingId(null);
                setActiveTab('home');
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-3 transition duration-200">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">Maudaha</h1>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Mart</p>
              </div>
            </div>
          </div>



          {/* My Orders Header Trigger (Replaces Live Weather) */}
          <div className="flex flex-col items-center gap-0 bg-slate-50 border border-slate-200/50 rounded-lg px-2 py-0.5 cursor-pointer hover:bg-slate-100 transition duration-200 select-none" 
               onClick={() => setActiveTab('orders')} 
               title={language === 'en' ? 'Orders' : 'ऑर्डर'}>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span className="text-[8px] text-slate-700 font-extrabold uppercase">{language === 'en' ? 'Orders' : 'ऑर्डर'}</span>

          </div>

          {/* Settings & Switches */}
          <div className="flex items-center gap-1 md:gap-4">

            {(activeUser?.email?.toLowerCase() === 'biengwithash@gmail.com' || activeUser?.role === 'admin' || role === 'admin') && (
              <button
                onClick={() => {
                  const newRole: UserRole = role === 'admin' ? 'customer' : 'admin';
                  setRole(newRole);
                  localStorage.setItem('mau_role', newRole);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-3xs ${
                  role === 'admin' 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300' 
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                }`}
                title={language === "en" ? "Switch Portal View" : "पोर्टल व्यू बदलें"}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{role === 'admin' ? '🛡️ Admin' : '🛒 Customer'}</span>
              </button>
            )}
            {/* Notification Drawer trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setViewingNotificationPanel(!viewingNotificationPanel);
                  setShowNotificationBadge(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 transition"
              >
                <Bell className="h-5 w-5" />
                {showNotificationBadge && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {/* Float Notification Panel */}
              {viewingNotificationPanel && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 max-h-[300px] overflow-y-auto">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-3">
                    {language === 'en' ? 'Alerts & Messages' : 'अलर्ट और संदेश'}
                  </h3>
                  {notifications.map((notif, idx) => (
                    <div key={`${notif.id}-${idx}`} className="py-2.5 border-b border-slate-50 last:border-0">
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'hi' ? notif.titleHi : notif.title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                        {language === 'hi' ? notif.bodyHi : notif.body}
                      </p>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* Wishlist Header Trigger */}
            <button
              onClick={() => {
                setDrawerInitialTab('wishlist');
                setShowWishlistDrawer(true);
              }}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-rose-500 transition relative cursor-pointer"
              title={language === 'en' ? 'My Wishlist' : 'मेरी इच्छासूची'}
            >
              <Heart className={`h-5 w-5 ${activeUser?.watchlist?.length ? 'fill-rose-500 text-rose-500' : ''}`} />
              {activeUser?.watchlist && activeUser.watchlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-mono text-[9px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {activeUser.watchlist.length}
                </span>
              )}
            </button>

            {/* Cart Header Trigger */}
            <button
              onClick={() => {
                setDrawerInitialTab('cart');
                setShowWishlistDrawer(true);
              }}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 transition relative cursor-pointer"
              title={language === 'en' ? 'Global Shopping Cart' : 'ग्लोबल शॉपिंग कार्ट'}
            >
              <ShoppingBag className="h-5 w-5" />
              {Object.keys(cart).filter(sId => cart[sId] && cart[sId].length > 0).reduce((sum, sId) => sum + (cart[sId]?.reduce((s, it) => s + it.quantity, 0) || 0), 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white font-mono text-[9px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {Object.keys(cart).filter(sId => cart[sId] && cart[sId].length > 0).reduce((sum, sId) => sum + (cart[sId]?.reduce((s, it) => s + it.quantity, 0) || 0), 0)}
                </span>
              )}
            </button>

            {/* UserProfile Header Trigger */}
            <button
              onClick={() => setShowProfileDrawer(true)}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-emerald-600 transition flex items-center gap-1 bg-slate-50 border border-slate-200/60 cursor-pointer"
              title={language === 'en' ? 'User Profile' : 'यूज़र प्रोफ़ाइल'}
            >
              <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                {activeUser?.name.charAt(0).toUpperCase() || 'U'}

              </div>
              <span className="text-[11px] font-extrabold pr-1 hidden sm:inline">
                {activeUser?.name.split(' ')[0]}
              </span>
            </button>


          </div>


        </div>
      </header>

      {/* Main Core View Router */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeOrderTrackingId ? (
            /* Live order tracking screen overrides customer portal */
            <motion.div
              key="order-tracker-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <OrderTracker
                order={orders.find(o => o.id === activeOrderTrackingId)!}
                language={language}
                onClose={() => setActiveOrderTrackingId(null)}
                scratchCards={scratchCards}
                onScratchCardComplete={(cardId) => {
                  setScratchCards(prev => prev.map(c => 
                    c.id === cardId ? { ...c, isScratched: true } : c
                  ));
                }}
                onRateRider={handleRateRider}
              />
            </motion.div>
          ) : (
            <motion.div
              key="portal-view"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              {role === 'admin' && showAdminPortal ? (
          /* Central Super-Admin Console */
          <AdminPortal
            stores={stores}
            products={products}
            reviews={reviews}
            orders={orders}
            notifications={notifications}
            language={language}
            users={users}
            supportTickets={supportTickets}
            settings={settings}
            onUpdateSettings={setSettings}
            customPanels={customPanels}
            onUpdateCustomPanels={setCustomPanels}
            onUpdateStores={setStores}
            onUpdateProducts={setProducts}
            onUpdateReviews={setReviews}
            onUpdateUsers={setUsers}
            onAddNotification={handleAddNotification}
            onAdminReplySupportTicket={handleAdminReplySupportTicket}
            onToggleTicketStatus={handleToggleTicketStatus}
            onUpdateOrders={setOrders}
            payoutRequests={payoutRequests}
            onUpdatePayoutRequests={setPayoutRequests}
            merchantRequests={merchantRequests}
            onUpdateMerchantRequests={setMerchantRequests}
            priceLogs={priceLogs}
            onUpdateProductPricesAndStock={handleUpdateProductPricesAndStock}
            restaurants={restaurants}
            onUpdateRestaurants={setRestaurants}
            boutiques={boutiques}
            onUpdateBoutiques={setBoutiques}
            serviceAreas={serviceAreas}
            onUpdateServiceAreas={setServiceAreas}
          />
        ) : role === 'rider' ? (
          !settings.enableRiderPortal ? (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="h-8 w-8" />

              </div>
              <h2 className="text-xl font-extrabold text-slate-800">
                {language === 'en' ? 'Delivery boy pannel Offline' : 'डिलीवरी बॉय पैनल ऑफ़लाइन है'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {language === 'en' 
                  ? 'The Delivery boy portal has been temporarily suspended by the Admin. Please toggle this component "ON" in the Admin Settings tab to resume.' 
                  : 'डिलीवरी बॉय पोर्टल को एडमिन द्वारा अस्थायी रूप से निलंबित कर दिया गया है। फिर से शुरू करने के लिए कृपया एडमिन सेटिंग्स टैब में इस घटक को "चालू" करें।'}
              </p>
              <div className="pt-2">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {language === 'en' ? 'Administrative Lock Active' : 'प्रशासनिक लॉक सक्रिय है'}
                </span>

              </div>

            </div>
          ) : (
            /* Delivery Rider Desk Console */
            <DeliveryAgentPortal
              orders={orders.filter(o => {
                const riderAreaId = activeUser?.assignedArea || activeUser?.serviceAreaId || 'area-maudaha';
                const oArea = (o as any).serviceAreaId || 'area-maudaha';
                return oArea === riderAreaId;
              })}
              language={language}
              onUpdateOrders={setOrders}
            />
          )
        ) : role === 'merchant' ? (
          !settings.enableMerchantDashboard ? (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="h-8 w-8" />

              </div>
              <h2 className="text-xl font-extrabold text-slate-800">
                {language === 'en' ? 'Merchant Console Offline' : 'मर्चेंट कंसोल ऑफ़लाइन है'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {language === 'en' 
                  ? 'Merchant registration and inventory portals are offline due to admin configuration updates. Switch back to Admin to re-enable.' 
                  : 'एडमिन कॉन्फ़िगरेशन अपडेट के कारण मर्चेंट पंजीकरण और इन्वेंट्री पोर्टल ऑफ़लाइन हैं। फिर से सक्षम करने के लिए एडमिन पर वापस जाएं।'}
              </p>
              <div className="pt-2">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {language === 'en' ? 'Administrative Lock Active' : 'प्रशासनिक लॉक सक्रिय है'}
                </span>

              </div>

            </div>
          ) : (
            /* Merchant inventory and store order manager dashboard */
            <MerchantDashboard
              stores={stores}
              products={products}
              reviews={reviews}
              orders={orders}
              notifications={notifications}
              merchantStoreId={merchantStoreId}
              setMerchantStoreId={setMerchantStoreId}
              onUpdateProducts={setProducts}
              onUpdateOrders={setOrders}
              onAddNotification={handleAddNotification}
              language={language}
              users={users}
              payoutRequests={payoutRequests}
              onAddPayoutRequest={(newReq) => setPayoutRequests(prev => [...prev, newReq])}
              cart={cart}
              onUpdateProductPricesAndStock={handleUpdateProductPricesAndStock}
            />
          )
        ) : role === 'manager' ? (
          <ManagerPortal
            users={users}
            onUpdateUsers={setUsers}
            stores={stores}
            onUpdateStores={setStores}
            products={products}
            tickets={supportTickets}
            language={language}
            activeUserId={activeUserId}
          />
        ) : (role === 'restaurant_owner' || role === 'jewellery_owner' || role === 'footwear_owner' || role === 'boutique_owner' || role === 'beautician' || role === 'tailor' || role === 'plumber' || role === 'electrician' || role === 'mechanic') ? (
          <RoleDashboards
            role={role}
            language={language}
            activeUserId={activeUserId}
            users={users}
            onUpdateUsers={setUsers}
            restaurants={restaurants}
            onUpdateRestaurants={setRestaurants}
            boutiques={boutiques}
            onUpdateBoutiques={setBoutiques}
          />
        ) : (!settings.enableCustomerPortal && role !== 'admin') ? (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="h-8 w-8" />

            </div>
            <h2 className="text-xl font-extrabold text-slate-800">
              {language === 'en' ? 'Shopper Storefront Offline' : 'ग्राहक स्टोरफ्रंट ऑफ़लाइन है'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {language === 'en' 
                ? 'Maudaha Mart groceries storefront is currently undergoing scheduled upgrade. Check back shortly, or log in as Admin/Merchant to configure.' 
                : 'मौदहा मार्ट किराना स्टोरफ्रंट वर्तमान में अनुसूचित अपग्रेड के अधीन है। थोड़ी देर बाद जांचें, या कॉन्फ़िगर करने के लिए एडमिन/व्यापारी के रूप में लॉगिन करें।'}
            </p>
            <div className="pt-2">
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {language === 'en' ? 'Administrative Lock Active' : 'प्रशासनिक लॉक सक्रिय है'}
              </span>

            </div>

          </div>
        ) : (
          /* Main Customer store explorer and shopping cart checkout */
          <div className="space-y-4">
            
            {activeTab === 'browse' ? (
              <CustomerPortal
                stores={visibleStores}
                products={productsWithScratchDiscount}
                reviews={reviews}
                orders={orders}
                cart={cartWithScratchDiscount}
                loyalty={loyalty}
                notifications={notifications}
                selectedStoreId={selectedStoreId}
                activeOrderTrackingId={activeOrderTrackingId}
                onSelectStore={setSelectedStoreId}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onAddReview={handleAddReview}
                onCheckout={handleCheckout}
                onUseCoins={setUseCoins}
                useCoinsState={useCoins}
                language={language}
                activeUserId={activeUserId}
                users={users}
                onSwitchUser={setActiveUserId}
                onAddSearch={handleAddUserSearch}
                settings={settings}
                onUpdateUsers={setUsers}
                onNavigateTab={setActiveTab}
                scratchCards={scratchCards}
                serviceAreas={serviceAreas}
                selectedServiceAreaId={selectedServiceAreaId}
              />
            ) : activeTab === 'restaurants' ? (
              <RestaurantCorner
                activeUserId={activeUserId}
                users={users}
                onUpdateUsers={setUsers}
                language={language}
                onAddActivity={handleAddUserActivity}
                restaurants={visibleRestaurants}
                settings={settings}
              />
            ) : activeTab === 'clothing' ? (
              <ClothingHub
                activeUserId={activeUserId}
                users={users}
                onUpdateUsers={setUsers}
                language={language}
                onAddActivity={handleAddUserActivity}
                boutiques={visibleBoutiques}
                settings={settings}
              />
            ) : activeTab === 'services' ? (
              <ServicesCorner
                activeUserId={activeUserId}
                users={users}
                onUpdateUsers={setUsers}
                language={language}
                onAddActivity={handleAddUserActivity}
                selectedServiceAreaId={selectedServiceAreaId}
              />
            ) : activeTab === 'travel' ? (
              <TravelCorner
                language={language}
                onBack={() => setActiveTab('home')}
              />
            ) : activeTab === 'home' ? (
              <CustomerHome
                language={language}
                onNavigateTab={setActiveTab}
                products={productsWithScratchDiscount}
                stores={visibleStores}
                activeUser={activeUser}
                onAddToCart={handleAddToCart}
                onSelectStore={setSelectedStoreId}
              />
            ) : activeTab === 'orders' ? (
              <UserOrderPanel
                orders={orders}
                activeUserId={activeUserId}
                language={language}
                onTrackOrder={setActiveOrderTrackingId}
                onNavigateToSupport={() => setShowSupportDrawer(true)}
                products={products}
                cart={cart}
                onUpdateCart={setCart}
                onCancelOrder={handleCancelOrder}
                onRateRider={handleRateRider}
              />
            ) : activeTab === 'loyalty' ? (
              <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                
                {/* Loyalty Board */}
                <div className="bg-emerald-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                  {/* Subtle decorative mesh design */}
                  <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-emerald-800/15" />
                  <div className="absolute left-[-20px] bottom-[-20px] w-48 h-48 rounded-full bg-emerald-800/15" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                      <span className="bg-amber-400/20 text-amber-300 font-extrabold text-xs tracking-wider px-3 py-1 rounded-full uppercase border border-amber-400/20">
                        {loyalty.tier === 'Bronze' && t.loyaltyTierBronze}
                        {loyalty.tier === 'Silver' && t.loyaltyTierSilver}
                        {loyalty.tier === 'Gold' && t.loyaltyTierGold}
                        {loyalty.tier === 'Platinum' && t.loyaltyTierPlatinum}
                      </span>
                      <h2 className="text-3xl font-black tracking-tight">{t.loyaltyBalance}</h2>
                      <p className="text-xs text-emerald-200 max-w-md leading-relaxed">
                        {t.loyaltySub}
                      </p>

                    </div>

                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-widest font-mono">AVAILABLE COINS</span>
                      <span className="text-5xl font-black text-amber-400 font-mono mt-1 block">
                        {loyalty.points}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Scratch Cards & Exclusive Rewards Section */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                      <span className="text-amber-500 text-base">🎁</span>
                      <span>
                        {language === 'en' ? 'Your Earned Scratch Cards' : 'आपके अर्जित स्क्रैच कार्ड'}
                      </span>
                    </h3>
                    <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200/50">
                      {scratchCards.filter(c => c.userId === activeUserId).length} {language === 'en' ? 'Total' : 'कुल'}
                    </span>

                  </div>

                  {scratchCards.filter(c => c.userId === activeUserId).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 space-y-2">
                      <div className="text-3xl">🎫</div>
                      <p className="text-xs font-semibold">
                        {language === 'en' ? "You haven't earned any scratch cards yet." : "आपने अभी तक कोई स्क्रैच कार्ड अर्जित नहीं किया है।"}
                      </p>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                        {language === 'en' ? 'Place grocery orders to earn exclusive scratch cards with 5-10% extra discounts!' : '5-10% अतिरिक्त छूट वाले स्क्रैच कार्ड पाने के लिए किराना ऑर्डर करें!'}
                      </p>

                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {scratchCards
                        .filter(c => c.userId === activeUserId)
                        .map((card, idx) => (
                          <div key={`${card.id}-${idx}`} className="relative flex flex-col space-y-2">
                            <ScratchCardComponent
                              card={card}
                              language={language}
                              onScratchComplete={(cardId) => {
                                setScratchCards(prev => prev.map(c => 
                                  c.id === cardId ? { ...c, isScratched: true } : c
                                ));
                                handleAddUserActivity(activeUserId, `Scratched and won ${card.discountPercentage}% off on ${card.productName}`, `${card.productNameHi} पर ${card.discountPercentage}% की अतिरिक्त छूट जीती`);
                              }}
                            />
                            {card.isScratched && (
                              <div className="text-center">
                                {card.isUsed ? (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full border border-slate-200/50 uppercase tracking-widest inline-block">
                                    {language === 'en' ? 'COUPON USED' : 'कूपन प्रयुक्त'}
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setActiveTab('browse')}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1 rounded-full transition active:scale-95 cursor-pointer shadow-sm uppercase tracking-wider inline-flex items-center gap-1"
                                  >
                                    <span>{language === 'en' ? 'Shop Now' : 'अभी खरीदें'}</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}

                              </div>
                            )}

                          </div>
                        ))}

                    </div>
                  )}

                </div>

                {/* Loyalty History logs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    {t.pointsHistory}
                  </h3>

                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2">
                    {loyalty.history.map((h, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-700">
                            {language === 'hi' ? h.descriptionHi : h.description}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{h.date}</span>

                        </div>
                        <span className={`font-mono font-black text-sm ${
                          h.type === 'earn' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {h.type === 'earn' ? '+' : ''}{h.points}
                        </span>

                      </div>
                    ))}

                  </div>

                </div>


              </div>
            ) : null}


          </div>
          )}
          </motion.div>
        )}
      {showPitchDeck && <BusinessPitchDeck onClose={() => setShowPitchDeck(false)} />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 px-4 border-t border-slate-900 mt-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <span className="text-emerald-400 font-extrabold tracking-widest text-xs uppercase font-mono block">
              Maudaha Mart
            </span>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {language === 'en' ? 'Maudaha’s exclusive hyper-local, instant-delivery grocery platform powering local stores and merchants with zero commissions.' : 'मौदहा का विशेष हाइपर-लोकल, तत्काल-डिलिवरी किराना प्लेटफॉर्म जो स्थानीय स्टोर और व्यापारियों को शून्य कमीशन के साथ सशक्त बनाता है।'}
            </p>

          </div>

          <div className="flex flex-col md:items-end gap-2 text-xs text-slate-400 font-mono tracking-wide">
            <span>© 2026 MAUDAHA MART INC.</span>
            <span>📍 GALLA MANDI & STATION ROAD, MAUDAHA (SERVING PAN-INDIA)</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-extrabold hover:underline text-left md:text-right mt-1 cursor-pointer transition"
            >
              🛡️ {language === 'en' ? 'Privacy Policy' : 'गोपनीयता नीति (Privacy Policy)'}
            </button>
            <span>SECURE ENCRYPTED UPI TRANSACTIONS APPROVED</span>

          </div>

        </div>
      </footer>

      {/* Privacy Policy Modal overlay */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        language={language}
      />

      {role === 'customer' && (
        <OrderReviewPopup
          orders={orders}
          language={language}
          onUpdateOrders={setOrders}
          onAddReview={(newReview) => {
            const updated = [newReview, ...reviews];
            setReviews(updated);
            syncDocToFirestore('reviews', newReview.id, newReview);
          }}
          activeUserId={activeUserId}
        />
      )}

      {/* Persistent Account Profile Drawer */}
      <UserProfileCorner
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        language={language}
        onSwitchLanguage={setLanguage}
        themeId={themeId}
        onSwitchTheme={(tid) => {
          setThemeId(tid);
          localStorage.setItem(`mau_theme_${activeUserId}`, tid);
        }}
        role={role}
        onSwitchRole={setRole}
        activeUserId={activeUserId}
        users={users}
        onSwitchUser={setActiveUserId}
        onUpdateUsers={setUsers}
        merchantRequests={merchantRequests}
        onAddMerchantRequest={(newReq) => setMerchantRequests(prev => [...prev, newReq])}
        loyaltyPoints={loyalty.points}
        loyaltyTier={loyalty.tier}
        onOpenAndroidHub={() => {
          setShowAndroidHub(true);
          setShowProfileDrawer(false);
        }}
        onOpenPitchDeck={() => setShowPitchDeck(true)}
        onLogOut={() => {
          setIsLoggedIn(false);
          localStorage.removeItem('mau_logged_in');
          setShowProfileDrawer(false);
        }}
      />

      {/* Persistent Global Wishlist & Cart Drawer */}
      <WishlistCartDrawer
        isOpen={showWishlistDrawer}
        onClose={() => setShowWishlistDrawer(false)}
        initialTab={drawerInitialTab}
        language={language}
        products={visibleProducts}
        stores={visibleStores}
        cart={cart}
        watchlist={activeUser?.watchlist || []}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onToggleWatchlist={handleToggleWatchlist}
        onCheckoutDirectly={(storeId) => {
          setSelectedStoreId(storeId);
          setActiveTab('browse');
        }}
        settings={settings}
      />

      <AnimatePresence>
        {showAndroidHub && (
          <AndroidAppHub
            language={language}
            onClose={() => setShowAndroidHub(false)}
          />
        )}
      {showPitchDeck && <BusinessPitchDeck onClose={() => setShowPitchDeck(false)} />}
      </AnimatePresence>

      {/* Floating Support Button ("Help") */}
      {isLoggedIn && role === 'customer' && (
        <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05, translateY: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSupportDrawer(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-emerald-500/20"
            style={{ boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}
          >
            <LifeBuoy className="h-4 w-4 text-amber-300 animate-spin-slow" />
            <span>{language === 'en' ? 'Help' : 'सहायता'}</span>
          </motion.button>

        </div>
      )}

      {/* Support Panel Slide-over Drawer / Dialog */}
      <AnimatePresence>
        {showSupportDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="support-drawer-modal">
            {/* Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportDrawer(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slider Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🙋</span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {language === 'en' ? 'Support & Helpdesk' : 'सहायता और हेल्पडेस्क'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {language === 'en' ? 'Direct assistance from Maudaha Mart administrators' : 'मौदहा मार्ट प्रशासकों से सीधी सहायता'}
                    </p>

                  </div>

                </div>
                <button
                  onClick={() => setShowSupportDrawer(false)}
                  className="p-1.5 hover:bg-slate-200/80 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto bg-slate-50/25">
                {!settings.enableSupportPanel ? (
                  <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
                    <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                      <ShieldAlert className="h-8 w-8" />

                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800">
                      {language === 'en' ? 'Support Helpdesk Offline' : 'सहायता हेल्पडेस्क ऑफ़लाइन है'}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {language === 'en'
                        ? 'The support helpdesk is temporarily closed by the administrator. For immediate issues, visit the physical counter at Galla Mandi Chauraha.'
                        : 'प्रशासक द्वारा सहायता हेल्पडेस्क को अस्थायी रूप से बंद कर दिया गया है। तत्काल समस्याओं के लिए, गल्ला मंडी चौराहा पर भौतिक काउंटर पर जाएँ।'}
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {language === 'en' ? 'Administrative Lock Active' : 'प्रशासनिक लॉक सक्रिय है'}
                      </span>

                    </div>

                  </div>
                ) : (
                  <SupportPanel
                    supportTickets={supportTickets}
                    activeUserId={activeUserId}
                    users={users}
                    onAddTicket={handleAddSupportTicket}
                    onAddMessage={handleAddSupportMessage}
                    language={language}
                  />
                )}

              </div>
            </motion.div>

          </div>
        )}
      {showPitchDeck && <BusinessPitchDeck onClose={() => setShowPitchDeck(false)} />}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Navigation Bar (Material Design/Android-centric) */}
      {(role === 'customer' || role === 'admin') && (settings.enableCustomerPortal || role === 'admin') && !activeOrderTrackingId && (() => {
        const triggerHapticFeedback = () => {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try {
              navigator.vibrate(15);
            } catch (e) {
              // Silently catch vibration errors/restrictions in some sandbox environments
            }
          }
        };

        return (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] z-50 py-3 px-2 md:hidden flex justify-around items-center rounded-t-2xl animate-in slide-in-from-bottom duration-300">
            {role === "admin" && (
              <button
                onClick={() => {
                  triggerHapticFeedback();
                  setShowAdminPortal(!showAdminPortal);
                }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 ${showAdminPortal ? "text-purple-600 font-extrabold -translate-y-0.5" : "text-slate-400 font-medium hover:text-slate-600"}`}
              >
                <Shield className={`h-5 w-5 transition duration-200 ${showAdminPortal ? "text-purple-600 animate-pulse" : "text-slate-400"}`} />
                <span className="text-[10px] tracking-tight">{language === "en" ? "Admin" : "एडमिन"}</span>
              </button>
            )}
            <button
              onClick={() => {
                triggerHapticFeedback();
                setActiveTab('home');
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 ${
                activeTab === 'home' ? 'text-emerald-600 font-extrabold -translate-y-0.5' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <Grid className={`h-5 w-5 transition duration-200 ${activeTab === 'home' ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'en' ? 'Home' : 'होम'}</span>
            </button>

            <button
              onClick={() => {
                triggerHapticFeedback();
                setActiveTab('orders');
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 ${
                activeTab === 'orders' ? 'text-emerald-600 font-extrabold -translate-y-0.5' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <Package className={`h-5 w-5 transition duration-200 ${activeTab === 'orders' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'en' ? 'Orders' : 'ऑर्डर'}</span>
            </button>

            <button
              onClick={() => {
                triggerHapticFeedback();
                setActiveTab('loyalty');
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 ${
                activeTab === 'loyalty' ? 'text-emerald-600 font-extrabold -translate-y-0.5' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <Gift className={`h-5 w-5 transition duration-200 ${activeTab === 'loyalty' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'en' ? 'Rewards' : 'इनाम'}</span>
            </button>

            <button
              onClick={() => {
                triggerHapticFeedback();
                setActiveTab('support');
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 ${
                activeTab === 'support' ? 'text-emerald-600 font-extrabold -translate-y-0.5' : 'text-slate-400 font-medium hover:text-slate-600'
              }`}
            >
              <LifeBuoy className={`h-5 w-5 transition duration-200 ${activeTab === 'support' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'en' ? 'Help' : 'मदद'}</span>
            </button>

          </div>
        );
      })()}


    </div>
  );
}
