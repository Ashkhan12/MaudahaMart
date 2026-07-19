/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Store, Product, Review, Notification, RegisteredUser, SupportTicket, Order,LocalService } from './types';

export const INITIAL_STORES: Store[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Monsoon Feast Offer!',
    titleHi: 'मानसून दावत ऑफर!',
    body: 'Get flat Rs. 50 off on fresh fruits & vegetables at Siddiqui Fruits! Minimum order Rs. 199.',
    bodyHi: 'सिद्दीकी फ्रूट्स पर ताजे फलों और सब्जियों पर फ्लैट 50 रुपये की छूट पाएं! न्यूनतम ऑर्डर 199 रुपये।',
    code: 'MAUMANGO',
    discountAmount: 50,
    type: 'discount',
    date: '2026-06-28',
    isRead: false
  },
  {
    id: 'n2',
    title: 'Galla Mandi Kirana Fest',
    titleHi: 'गल्ला मंडी किराना उत्सव',
    body: 'Save big with 10% discount at Gupta Ji Kirana. Applicable on grocery bags.',
    bodyHi: 'गुप्ता जी किराना पर 10% की छूट के साथ बड़ी बचत करें। राशन बैग पर लागू।',
    code: 'GUPTA10',
    discountAmount: 30,
    type: 'discount',
    date: '2026-06-27',
    isRead: false
  },
  {
    id: 'n3',
    title: 'Welcome to Maudaha Mart',
    titleHi: 'मौदहा मार्ट में आपका स्वागत है',
    body: 'Your hyper-local instant delivery companion. Enjoy 5% cashback coins on every order.',
    bodyHi: 'आपका अपना हाइपर-लोकल त्वरित डिलीवरी साथी। प्रत्येक ऑर्डर पर 5% कैश-बैक कॉइन्स का आनंद लें।',
    type: 'general',
    date: '2026-06-28',
    isRead: false
  }
];

// Dictionary of translations for static elements
export const TRANSLATIONS = {
  en: {
    appName: 'Maudaha Mart',
    tagline: 'Maudaha’s Superfast Grocery Delivery',
    taglineHi: 'मौदहा की सुपरफास्ट ग्रोसरी डिलीवरी',
    searchPlaceholder: 'Search fresh veggies, milk, local peda...',
    customerPortal: 'Customer Portal',
    merchantPortal: 'Merchant Portal',
    switchRole: 'Switch Role',
    langToggle: 'हिंदी',
    english: 'English',
    hindi: 'Hindi',
    categories: 'Categories',
    popularStores: 'Popular Stores in Maudaha',
    deliveryTime: 'Delivery Time',
    minOrder: 'Min. Order',
    rating: 'Rating',
    reviews: 'Reviews',
    addReview: 'Add Review',
    writeComment: 'Write your comment...',
    yourName: 'Your Name',
    submit: 'Submit',
    items: 'items',
    cart: 'Cart',
    viewCart: 'View Cart',
    cartEmpty: 'Your cart is empty',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    checkout: 'Instant Checkout',
    subtotal: 'Subtotal',
    discount: 'Discount',
    deliveryFee: 'Delivery Fee',
    free: 'FREE',
    grandTotal: 'Grand Total',
    selectPayment: 'Select Payment Method',
    upiPay: 'Pay via UPI (Instant)',
    codPay: 'Cash on Delivery (COD)',
    enterUpiId: 'Enter your UPI ID',
    payNow: 'Pay Now & Place Order',
    paymentSuccess: 'Payment Successful!',
    orderPlaced: 'Order Placed Successfully!',
    deliveryAddress: 'Enter Delivery Address in Maudaha',
    placeOrder: 'Place Order',
    loyaltyProgram: 'Loyalty Club',
    loyaltyBalance: 'Maudaha Coin Balance',
    loyaltyCoins: 'Coins',
    loyaltySub: 'Earn 5 coins per ₹100 spent! Redeem them for instant cash discounts.',
    redeemCoins: 'Redeem Coins for ₹',
    redeemed: 'Redeemed',
    coinsEarnedMsg: 'You will earn {coins} coins on this order!',
    orderHistory: 'Order History',
    noOrders: 'No orders placed yet.',
    orderId: 'Order ID',
    status: 'Status',
    trackOrder: 'Track Live Delivery',
    notifications: 'Promotions & Coupons',
    promoAvailable: 'Promo code copied!',
    useCode: 'Use Code',
    copyCode: 'Copy Code',
    // Delivery tracking stages
    pending: 'Pending (Waiting for Merchant)',
    processing: 'Processing (Accepted by Merchant)',
    ready_for_pickup: 'Ready for Pickup (Waiting for Delivery boy)',
    ready_for_delivery: 'Ready for Delivery (Delivery boy has items)',
    out_for_delivery: 'Out for Delivery (Delivery boy en-route)',
    arrived: 'Delivered Successfully!',
    // Merchant Dashboard strings
    merchantTitle: 'Maudaha Merchant Console',
    inventoryTitle: 'Inventory & Stock Management',
    addMenuItem: 'Add New Product',
    updateStock: 'Update Stock',
    saveChanges: 'Save Changes',
    allOrders: 'Received Orders',
    clientReviews: 'Customer Reviews Feedback',
    price: 'Price',
    stock: 'Stock Status',
    actions: 'Actions',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    storeSettings: 'My Store Profiles',
    acceptOrder: 'Accept Order',
    markPacked: 'Mark Packed',
    dispatchOrder: 'Dispatch Delivery',
    markDelivered: 'Simulate Arrival',
    activeOrders: 'Active Orders',
    noMerchantOrders: 'No orders received yet for your store.',
    backToBrowsing: 'Back to Stores',
    paymentCompleted: 'Payment Completed',
    paymentPending: 'Payment Pending',
    notificationHeading: 'Push Notifications & Alerts',
    addNewPromo: 'Create New Discount Notification',
    promoTitleInput: 'Promo Title',
    promoBodyInput: 'Promo Details (Description)',
    promoCodeInput: 'Coupon Code (e.g. EXTRA20)',
    promoDiscountInput: 'Discount Amount (₹)',
    sendNotification: 'Send Push Notification to Customers',
    storeHeaderLabel: 'Selected Store',
    loyaltyTierBronze: 'Maudaha Bronze Club',
    loyaltyTierSilver: 'Maudaha Silver Star',
    loyaltyTierGold: 'Maudaha Gold Elite',
    loyaltyTierPlatinum: 'Maudaha Royal Club',
    pointsHistory: 'Coins History Log',
    earned: 'Earned',
    spent: 'Spent'
  },
  hi: {
    appName: 'मौदहा मार्ट',
    tagline: 'मौदहा की सुपरफास्ट ग्रोसरी डिलीवरी',
    taglineHi: 'मौदहा की सुपरफास्ट ग्रोसरी डिलीवरी',
    searchPlaceholder: 'ताजी सब्जियां, दूध, स्थानीय पेड़ा खोजें...',
    customerPortal: 'ग्राहक पोर्टल',
    merchantPortal: 'व्यापारी पोर्टल',
    switchRole: 'भूमिका बदलें',
    langToggle: 'English',
    english: 'अंग्रेजी',
    hindi: 'हिंदी',
    categories: 'श्रेणियां',
    popularStores: 'मौदहा में लोकप्रिय दुकानें',
    deliveryTime: 'वितरण समय',
    minOrder: 'न्यूनतम आर्डर',
    rating: 'रेटिंग',
    reviews: 'समीक्षाएं',
    addReview: 'समीक्षा जोड़ें',
    writeComment: 'अपनी टिप्पणी लिखें...',
    yourName: 'आपका नाम',
    submit: 'जमा करें',
    items: 'सामग्री',
    cart: 'कार्ट',
    viewCart: 'कार्ट देखें',
    cartEmpty: 'आपकी कार्ट खाली है',
    addToCart: 'कार्ट में जोड़ें',
    outOfStock: 'स्टॉक में नहीं है',
    checkout: 'त्वरित चेकआउट',
    subtotal: 'उपयोगिता योग',
    discount: 'छूट',
    deliveryFee: 'वितरण शुल्क',
    free: 'मुफ़्त',
    grandTotal: 'कुल देय राशि',
    selectPayment: 'भुगतान विधि चुनें',
    upiPay: 'UPI द्वारा भुगतान (त्वरित)',
    codPay: 'कैश ऑन डिलीवरी (COD)',
    enterUpiId: 'अपनी UPI आईडी दर्ज करें',
    payNow: 'अभी भुगतान करें और ऑर्डर दें',
    paymentSuccess: 'भुगतान सफल रहा!',
    orderPlaced: 'आर्डर सफलतापूर्वक दर्ज हुआ!',
    deliveryAddress: 'मौदहा में वितरण का पता दर्ज करें',
    placeOrder: 'ऑर्डर दें',
    loyaltyProgram: 'लोयल्टी क्लब',
    loyaltyBalance: 'मौदहा कॉइन बैलेंस',
    loyaltyCoins: 'कॉइन्स',
    loyaltySub: 'प्रत्येक ₹100 खर्च करने पर 5 कॉइन्स कमाएं! उन्हें तत्काल नकद छूट के लिए भुनाएं।',
    redeemCoins: 'कॉइन्स भुनाएं ₹',
    redeemed: 'भुनाया गया',
    coinsEarnedMsg: 'आपको इस ऑर्डर पर {coins} कॉइन्स मिलेंगे!',
    orderHistory: 'ऑर्डर इतिहास',
    noOrders: 'अभी तक कोई ऑर्डर नहीं दिया गया है।',
    orderId: 'ऑर्डर आईडी',
    status: 'स्थिति',
    trackOrder: 'लाइव वितरण ट्रैकिंग',
    notifications: 'प्रचार और कूपन',
    promoAvailable: 'प्रोमो कोड कॉपी किया गया!',
    useCode: 'कोड प्रयोग करें',
    copyCode: 'कोड कॉपी करें',
    // Delivery tracking stages
    pending: 'लंबित (व्यापारी की स्वीकृति का इंतजार)',
    processing: 'प्रसंस्करण (व्यापारी द्वारा स्वीकृत)',
    ready_for_pickup: 'पिकअप के लिए तैयार (सवार का इंतजार)',
    ready_for_delivery: 'वितरण के लिए तैयार (सामान सवार के पास है)',
    out_for_delivery: 'वितरण के लिए बाहर (सवार रास्ते में है)',
    arrived: 'सफलतापूर्वक वितरित!',
    // Merchant Dashboard strings
    merchantTitle: 'मौदहा मर्चेंट कंसोल',
    inventoryTitle: 'इन्वेंट्री और स्टॉक प्रबंधन',
    addMenuItem: 'नया उत्पाद जोड़ें',
    updateStock: 'स्टॉक अपडेट करें',
    saveChanges: 'बदलाव सुरक्षित करें',
    allOrders: 'प्राप्त आर्डर',
    clientReviews: 'ग्राहक समीक्षा प्रतिक्रिया',
    price: 'मूल्य',
    stock: 'स्टॉक स्थिति',
    actions: 'कार्रवाई',
    inStock: 'स्टॉक में है',
    lowStock: 'कम स्टॉक',
    storeSettings: 'मेरी दुकान प्रोफाइल',
    acceptOrder: 'ऑर्डर स्वीकार करें',
    markPacked: 'पैक किया हुआ चिह्नित करें',
    dispatchOrder: 'डिलीवरी के लिए भेजें',
    markDelivered: 'आगमन सिमुलेट करें',
    activeOrders: 'सक्रिय ऑर्डर',
    noMerchantOrders: 'आपकी दुकान के लिए अभी तक कोई ऑर्डर प्राप्त नहीं हुआ है।',
    backToBrowsing: 'दुकानों पर वापस जाएं',
    paymentCompleted: 'भुगतान पूरा हुआ',
    paymentPending: 'भुगतान लंबित',
    notificationHeading: 'पुश नोटिफिकेशन और अलर्ट',
    addNewPromo: 'नया डिस्काउंट नोटिफिकेशन बनाएं',
    promoTitleInput: 'प्रोमो शीर्षक',
    promoBodyInput: 'प्रोमो विवरण (विवरण)',
    promoCodeInput: 'कूपन कोड (जैसे EXTRA20)',
    promoDiscountInput: 'छूट राशि (₹)',
    sendNotification: 'ग्राहकों को पुश नोटिफिकेशन भेजें',
    storeHeaderLabel: 'चयनित दुकान',
    loyaltyTierBronze: 'मौदहा ब्रॉन्ज़ क्लब',
    loyaltyTierSilver: 'मौदहा सिल्वर स्टार',
    loyaltyTierGold: 'मौदहा गोल्ड एलीट',
    loyaltyTierPlatinum: 'मौदहा रॉयल क्लब',
    pointsHistory: 'कॉइन्स इतिहास लॉग',
    earned: 'कमाया गया',
    spent: 'खर्च किया गया'
  }
};

export const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'user-owner-ash',
    name: 'Ash (Project Owner)',
    phone: '+91 99999 00000',
    email: 'biengwithash@gmail.com',
    location: 'Maudaha Central',
    locationHi: 'मौदहा सेंट्रल',
    role: 'admin',
    searchHistory: [],
    activities: [
      {
        id: 'act-owner-1',
        timestamp: '2026-07-09 10:00 AM',
        action: 'Restored owner permission rights',
        actionHi: 'मालिक की अनुमति अधिकार बहाल किए'
      }
    ]
  },
  {
    id: 'user-manager-banda',
    name: 'Banda Area Manager',
    phone: '+91 88888 77777',
    location: 'Banda',
    locationHi: 'बांदा',
    role: 'manager',
    assignedArea: 'Banda',
    searchHistory: [],
    activities: []
  },
  {
    id: 'user-customer-banda',
    name: 'Ramesh (Banda)',
    phone: '+91 77777 66666',
    location: 'Banda',
    locationHi: 'बांदा',
    role: 'customer',
    assignedArea: 'Banda',
    searchHistory: [],
    activities: []
  },
  {
    id: 'user-manager',
    name: 'Maudaha Area Manager',
    phone: '+91 99999 88888',
    location: 'Maudaha',
    locationHi: 'मौदहा',
    role: 'manager',
    assignedArea: 'Maudaha',
    searchHistory: [],
    activities: []
  },
  {
    id: 'user-1',
    name: 'Amit Kumar Mishra',
    phone: '+91 94520 12345',
    location: 'Station Road, Maudaha',
    locationHi: 'स्टेशन रोड, मौदहा',
    role: 'customer',
    searchHistory: ['desi ghee', 'ashirvaad atta', 'shampoo', 'paneer', 'mustard oil'],
    activities: [
      {
        id: 'act-1-1',
        timestamp: '2026-06-28 09:30 AM',
        action: 'Searched for "Desi Ghee" in Gupta Ji Kirana',
        actionHi: 'गुप्ता जी किराना में "देसी घी" खोजा गया'
      },
      {
        id: 'act-1-2',
        timestamp: '2026-06-28 09:45 AM',
        action: 'Added Pure Desi Ghee (1 L) to cart',
        actionHi: 'कार्ट में शुद्ध देसी घी (1 लीटर) जोड़ा गया'
      },
      {
        id: 'act-1-3',
        timestamp: '2026-06-28 10:00 AM',
        action: 'Placed order #1001 for ₹480',
        actionHi: '₹480 का ऑर्डर #1001 दिया'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Rajesh Gupta',
    phone: '+91 91400 45678',
    location: 'Galla Mandi Lane, Maudaha',
    locationHi: 'गल्ला मंडी लेन, मौदहा',
    role: 'rider',
    searchHistory: ['cow milk', 'fresh paneer', 'eggs'],
    activities: [
      {
        id: 'act-3-1',
        timestamp: '2026-06-27 05:12 PM',
        action: 'Reviewed Maudaha Dairy & Organic Farm (5 Stars)',
        actionHi: 'मौदहा डेयरी को 5 स्टार समीक्षा दी'
      }
    ]
  },
  {
    id: 'user-4',
    name: 'Deepak Verma',
    phone: '+91 70075 54321',
    location: 'Chauraha Bypass Road, Maudaha',
    locationHi: 'चौराहा बाईपास रोड, मौदहा',
    role: 'customer',
    searchHistory: ['britannia biscuits', 'coca cola', 'potato chips'],
    activities: [
      {
        id: 'act-4-1',
        timestamp: '2026-06-27 11:20 AM',
        action: 'Viewed Gupta Ji Kirana popular products',
        actionHi: 'गुप्ता जी किराना के लोकप्रिय उत्पाद देखे'
      }
    ]
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: 'user-1',
    userName: 'Rajesh Kumar',
    userPhone: '+91 94520 12345',
    subject: 'Refund issue with order #ORD-12502',
    category: 'Refund / Payment',
    status: 'open',
    createdAt: '06/27/2026, 10:15 AM',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Rajesh Kumar',
        text: 'Hello, I paid for order #ORD-12502 using coins, but my order got cancelled and I have not received my coins back yet. Please check.',
        timestamp: '06/27/2026, 10:15 AM'
      }
    ]
  },
  {
    id: 'ticket-2',
    userId: 'user-4',
    userName: 'Anjali Sharma',
    userPhone: '+91 81270 98765',
    subject: 'Unable to update store banner image',
    category: 'App Issue',
    status: 'resolved',
    createdAt: '06/26/2026, 04:30 PM',
    messages: [
      {
        id: 'msg-2',
        sender: 'user',
        senderName: 'Anjali Sharma',
        text: 'Is there a size restriction for the store banner? Mine keeps getting cut off.',
        timestamp: '06/26/2026, 04:30 PM'
      },
      {
        id: 'msg-3',
        sender: 'admin',
        senderName: 'Admin',
        text: 'Hi Anjali, please use an aspect ratio of 4:3 for store banners (e.g., 800x600 px). Let us know if you need anything else.',
        timestamp: '06/26/2026, 05:00 PM'
      },
      {
        id: 'msg-4',
        sender: 'user',
        senderName: 'Anjali Sharma',
        text: 'Thank you! It works perfectly now.',
        timestamp: '06/26/2026, 05:15 PM'
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_SERVICES: LocalService[] = [
  // 1. Beauty Parlour & salon
  {
    id: 'ser1',
    category: 'beauty',
    name: 'Glow Beauty Parlour & Bridal Salon',
    nameHi: 'ग्लो ब्यूटी पार्लर और ब्राइडल सैलून',
    phone: '9456123456',
    experience: 8,
    rating: 4.8,
    address: 'Near Gandhi Chauk, Maudaha',
    addressHi: 'गांधी चौक के पास, मौदहा',
    baseCharge: 199,
    available: true,
    banner: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600'
  },
  // 2. Tailor
  {
    id: 'ser2',
    category: 'tailor',
    name: 'Raza Fashion Tailors & Drapers',
    nameHi: 'रज़ा फैशन टेलर्स एंड ड्रेपर्स',
    phone: '9876543210',
    experience: 12,
    rating: 4.9,
    address: 'Naya Bazar Crossroad, Maudaha',
    addressHi: 'नया बाजार चौराहा, मौदहा',
    baseCharge: 250,
    available: true,
    banner: 'https://images.unsplash.com/photo-1525230071276-4a87f42f469e?auto=format&fit=crop&q=80&w=600'
  },
  // 3. Plumber
  {
    id: 'ser3',
    category: 'plumber',
    name: 'Suresh Kumar Plumber (Sanitary Care)',
    nameHi: 'सुरेश कुमार प्लंबर (सैनिटरी केयर)',
    phone: '9123456789',
    experience: 6,
    rating: 4.6,
    address: 'Tehsil Area, Maudaha',
    addressHi: 'तहसील क्षेत्र, मौदहा',
    baseCharge: 150,
    available: true,
    banner: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600'
  },
  // 4. Electrician
  {
    id: 'ser4',
    category: 'electrician',
    name: 'Babu Electrician & House Wiring Expert',
    nameHi: 'बाबू इलेक्ट्रिशियन और हाउस वायरिंग विशेषज्ञ',
    phone: '9345678901',
    experience: 9,
    rating: 4.7,
    address: 'Subhash Nagar, Maudaha',
    addressHi: 'सुभाष नगर, मौदहा',
    baseCharge: 120,
    available: true,
    banner: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600'
  },
  // 6. Mechanic
  {
    id: 'ser5',
    category: 'mechanic',
    name: 'Sardar Ji Motor Garage (Bike & Car Specialist)',
    nameHi: 'सरदार जी मोटर गैराज (बाइक और कार विशेषज्ञ)',
    phone: '9988776655',
    experience: 15,
    rating: 4.9,
    address: 'Kabrai Road NH-86, Maudaha',
    addressHi: 'कबरई रोड एनएच-86, मौदहा',
    baseCharge: 200,
    available: true,
    banner: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600'
  }
];

