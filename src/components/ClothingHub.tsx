import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Clock, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  MapPin, 
  Sparkles, 
  Scissors, 
  Percent, 
  History, 
  Truck, 
  Grid,
  Heart,
  Tag,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { INITIAL_BOUTIQUES } from '../dataClothing';
import { 
  RegisteredUser, 
  ClothingBoutique, 
  ClothingItem, 
  ClothingOrderItem, 
  ClothingOrder 
} from '../types';

interface ClothingHubProps {
  activeUserId: string | null;
  users: RegisteredUser[];
  onUpdateUsers: (users: RegisteredUser[]) => void;
  language: 'en' | 'hi';
  onAddActivity: (userId: string, activityEn: string, activityHi: string) => void;
  boutiques?: ClothingBoutique[];
}

export default function ClothingHub({
  activeUserId,
  users,
  onUpdateUsers,
  language,
  onAddActivity,
  boutiques = INITIAL_BOUTIQUES
}: ClothingHubProps) {
  const activeUser = users.find(u => u.id === activeUserId) || null;
  // User specific state extraction
  const cartState: { [boutiqueId: string]: ClothingOrderItem[] } = activeUser?.clothingCart || {};
  const ordersState: ClothingOrder[] = activeUser?.clothingOrders || [];

  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'ethnic' | 'western' | 'kids' | 'footwear' | 'accessories'>('all');
  const [viewMode, setViewMode] = useState<'stores' | 'history'>('stores');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedShopType, setSelectedShopType] = useState<'all' | 'boutique' | 'jewellery' | 'footwear'>('all');
  
  // Size preferences per clothing item in view (item.id -> size)
  const [selectedSizes, setSelectedSizes] = useState<{ [itemId: string]: string }>({});
  // Stitching preferences per clothing item in view (item.id -> boolean)
  const [stitchingOptions, setStitchingOptions] = useState<{ [itemId: string]: boolean }>({});

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD');

  // Translations dictionary
  const t = {
    en: {
      hubTitle: 'Maudaha Clothing & Fashion Hub',
      hubSubtitle: 'Discover premium local boutiques, traditional drapes, custom stitching, and same-day fashion delivery!',
      searchPlaceholder: 'Search boutiques, sarees, jeans, kids dresses...',
      allShops: 'All Shops',
      clothingShops: 'Boutiques & Apparel',
      jewelleryShops: 'Jewellery Shops',
      footwearShops: 'Footwear Shops',
      all: 'All Collections',
      ethnic: 'Ethnic & Festive',
      western: 'Western Wear',
      kids: 'Kids Special',
      footwear: 'Footwear',
      accessories: 'Accessories',
      rating: 'Rating',
      delivery: 'Delivery',
      minOrder: 'Min. Order',
      specialty: 'Specialty',
      address: 'Address',
      backToHub: 'Back to Fashion Hub',
      itemsAvailable: 'fabulous designs available',
      size: 'Select Size:',
      stitching: 'Request Custom Tailoring/Stitching (+₹250)',
      stitchingNote: 'Our master tailors in Maudaha will stitch to your size!',
      customStitched: 'Stitched to size',
      addToBag: 'Add to Fashion Bag',
      bagCart: 'My Fashion Bag',
      emptyBag: 'Your fashion bag is empty. Explore beautiful local boutiques!',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery & Handling',
      stitchingFees: 'Tailoring/Stitching Charges',
      discount: 'Discount',
      grandTotal: 'Grand Total',
      promoPlaceholder: 'Enter Promo Code (MAUSTYLE)',
      apply: 'Apply',
      promoSuccess: 'Code applied successfully!',
      promoInvalid: 'Invalid promo code. Try MAUSTYLE',
      paymentMethod: 'Choose Payment Method',
      placeOrder: 'Place Fashion Order',
      orderHistory: 'Order History',
      viewStores: 'Explore Boutiques',
      noOrders: 'No fashion orders placed yet. Elevate your wardrobe today!',
      orderId: 'Order ID',
      date: 'Date',
      status: 'Status',
      reorder: 'Reorder Clothes',
      minOrderError: 'Minimum order amount for this boutique is ₹',
      successTitle: 'Fashion Order Placed!',
      successDesc: 'Your gorgeous outfits are being packed & prepared for delivery!',
      stitchingShort: 'Stitching included',
      viewReceipt: 'View Order Details',
      cod: 'Cash on Delivery',
      upi: 'Pay via UPI QR Code',
      freeDelivery: 'FREE delivery applied!'
    },
    hi: {
      hubTitle: 'मौदहा वस्त्र और फैशन हब',
      hubSubtitle: 'प्रीमियम स्थानीय बुटीक, पारंपरिक वस्त्र, कस्टम सिलाई और उसी दिन फैशन डिलीवरी का आनंद लें!',
      searchPlaceholder: 'बुटीक, साड़ियां, जींस, बच्चों के फ्रॉक खोजें...',
      allShops: 'सभी दुकानें',
      clothingShops: 'कपड़े और बुटीक',
      jewelleryShops: 'आभूषण की दुकानें',
      footwearShops: 'जूते-चप्पल की दुकानें',
      all: 'सभी संग्रह',
      ethnic: 'पारंपरिक और उत्सव',
      western: 'वेस्टर्न वियर',
      kids: 'बच्चों के विशेष',
      footwear: 'जूते और सैंडल',
      accessories: 'फैशन सहायक सामग्री',
      rating: 'रेटिंग',
      delivery: 'डिलीवरी',
      minOrder: 'न्यूनतम ऑर्डर',
      specialty: 'विशेषता',
      address: 'पता',
      backToHub: 'फैशन हब पर वापस जाएं',
      itemsAvailable: 'शानदार डिज़ाइनों उपलब्ध हैं',
      size: 'साइज चुनें:',
      stitching: 'कस्टम सिलाई / फिटिंग का अनुरोध करें (+₹250)',
      stitchingNote: 'मौदहा के हमारे मास्टर दर्जी आपकी फिटिंग के अनुसार सिलेंगे!',
      customStitched: 'कस्टम सिली हुई',
      addToBag: 'फैशन बैग में जोड़ें',
      bagCart: 'मेरा फैशन बैग',
      emptyBag: 'आपका फैशन बैग खाली है। खूबसूरत स्थानीय बुटीक देखें!',
      subtotal: 'उप-योग',
      deliveryFee: 'डिलीवरी और हैंडलिंग शुल्क',
      stitchingFees: 'सिलाई / टेलरिंग शुल्क',
      discount: 'छूट',
      grandTotal: 'कुल देय राशि',
      promoPlaceholder: 'प्रोमो कोड डालें (MAUSTYLE)',
      apply: 'लागू करें',
      promoSuccess: 'कोड सफलतापूर्वक लागू किया गया!',
      promoInvalid: 'अमान्य प्रोमो कोड। MAUSTYLE आजमाएं',
      paymentMethod: 'भुगतान विधि चुनें',
      placeOrder: 'फैशन ऑर्डर सबमिट करें',
      orderHistory: 'ऑर्डर इतिहास',
      viewStores: 'बुटीक देखें',
      noOrders: 'अभी तक कोई फैशन ऑर्डर नहीं दिया गया है। आज ही अपना वार्डरोब सजाएं!',
      orderId: 'ऑर्डर आईडी',
      date: 'तारीख',
      status: 'स्थिति',
      reorder: 'पुनः ऑर्डर करें',
      minOrderError: 'इस बुटीक के लिए न्यूनतम ऑर्डर राशि ₹',
      successTitle: 'फैशन ऑर्डर सबमिट हुआ!',
      successDesc: 'आपके खूबसूरत परिधान पैक किए जा रहे हैं और जल्द ही डिलीवर होंगे!',
      stitchingShort: 'कस्टम सिलाई शामिल',
      viewReceipt: 'ऑर्डर विवरण देखें',
      cod: 'कैश ऑन डिलीवरी',
      upi: 'UPI क्यूआर कोड द्वारा भुगतान',
      freeDelivery: 'मुफ़्त डिलीवरी लागू!'
    }
  }[language];

  // Sync to database helper
  const updateUserData = (
    updatedCart: { [boutiqueId: string]: ClothingOrderItem[] }, 
    updatedOrders: ClothingOrder[]
  ) => {
    const updatedUsers = users.map(u => {
      if (u.id === activeUserId) {
        return {
          ...u,
          clothingCart: updatedCart,
          clothingOrders: updatedOrders
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
  };

  // Find active boutique & active cart
  const currentBoutique = boutiques.find(b => b.id === selectedBoutiqueId);
  const activeBoutiqueCart = selectedBoutiqueId ? cartState[selectedBoutiqueId] || [] : [];

  const handleAddToCart = (item: ClothingItem) => {
    if (!selectedBoutiqueId) return;

    const chosenSize = selectedSizes[item.id] || item.sizes[0] || 'Free Size';
    const chosenStitching = stitchingOptions[item.id] || false;

    const currentCart = { ...cartState };
    const items = [...(currentCart[selectedBoutiqueId] || [])];

    // Check if matching item exists with same size & stitching
    const existingIndex = items.findIndex(
      it => it.item.id === item.id && 
            it.selectedSize === chosenSize && 
            it.customStitching === chosenStitching
    );

    if (existingIndex > -1) {
      items[existingIndex].quantity += 1;
    } else {
      items.push({
        item,
        quantity: 1,
        selectedSize: chosenSize,
        customStitching: chosenStitching
      });
    }

    currentCart[selectedBoutiqueId] = items;
    updateUserData(currentCart, ordersState);

    // Save visual state notification or trigger short visual effect
    onAddActivity(
      activeUserId || '',
      `Added ${item.name} (Size: ${chosenSize}) to fashion bag`,
      `फैशन बैग में ${item.nameHi || item.name} (साइज: ${chosenSize}) जोड़ा गया`
    );
  };

  const handleRemoveFromCart = (index: number) => {
    if (!selectedBoutiqueId) return;

    const currentCart = { ...cartState };
    let items = [...(currentCart[selectedBoutiqueId] || [])];

    if (items[index].quantity > 1) {
      items[index].quantity -= 1;
    } else {
      items.splice(index, 1);
    }

    if (items.length === 0) {
      delete currentCart[selectedBoutiqueId];
    } else {
      currentCart[selectedBoutiqueId] = items;
    }

    updateUserData(currentCart, ordersState);
  };

  const handleClearCart = () => {
    if (!selectedBoutiqueId) return;
    const currentCart = { ...cartState };
    delete currentCart[selectedBoutiqueId];
    updateUserData(currentCart, ordersState);
  };

  // Math totals for active boutique cart
  const subtotal = activeBoutiqueCart.reduce((acc, current) => acc + current.item.price * current.quantity, 0);
  const stitchingCharges = activeBoutiqueCart.reduce((acc, current) => {
    return acc + (current.customStitching ? 250 : 0) * current.quantity;
  }, 0);
  
  // Delivery Charge logic: Free delivery on order subtotal above 999
  const baseDeliveryCharge = subtotal >= 999 ? 0 : 50;
  
  // Promo code discounts
  const discountAmount = appliedDiscount 
    ? Math.round((subtotal + stitchingCharges) * (appliedDiscount.percent / 100)) 
    : 0;
  
  const grandTotal = subtotal + stitchingCharges + baseDeliveryCharge - discountAmount;

  // Apply Promo Code
  const handleApplyPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'MAUSTYLE' || cleanCode === 'WELCOME_CLOTHES') {
      setAppliedDiscount({ code: cleanCode, percent: 15 });
      setPromoError('');
    } else {
      setPromoError(t.promoInvalid);
    }
  };

  const handlePlaceOrder = () => {
    if (activeBoutiqueCart.length === 0 || !currentBoutique) return;

    if (subtotal < currentBoutique.minOrder) {
      alert(`${t.minOrderError}${currentBoutique.minOrder}`);
      return;
    }

    const orderId = 'ODR-FSH-' + Math.floor(100000 + Math.random() * 90000);
    const newOrder: ClothingOrder = {
      id: orderId,
      boutiqueId: currentBoutique.id,
      boutiqueName: currentBoutique.name,
      boutiqueNameHi: currentBoutique.nameHi,
      items: activeBoutiqueCart,
      subtotal,
      deliveryFee: baseDeliveryCharge,
      total: grandTotal,
      paymentMethod,
      status: 'processing',
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const currentCart = { ...cartState };
    delete currentCart[currentBoutique.id];

    const updatedOrders = [newOrder, ...ordersState];
    updateUserData(currentCart, updatedOrders);

    onAddActivity(
      activeUserId || '',
      `Placed premium fashion order ${orderId} from ${currentBoutique.name} for ₹${grandTotal}`,
      `${currentBoutique.nameHi} से ₹${grandTotal} का फैशन ऑर्डर ${orderId} सबमिट किया गया`
    );

    setIsCartOpen(false);
    setViewMode('history');
  };

  const handleReorder = (oldOrder: ClothingOrder) => {
    const currentCart = { ...cartState };
    const oldItems: ClothingOrderItem[] = oldOrder.items.map(it => ({
      item: it.item,
      quantity: it.quantity,
      selectedSize: it.selectedSize,
      customStitching: it.customStitching
    }));

    currentCart[oldOrder.boutiqueId] = oldItems;
    updateUserData(currentCart, ordersState);
    setSelectedBoutiqueId(oldOrder.boutiqueId);
    setViewMode('stores');
    setIsCartOpen(true);
  };

  // Filter boutiques based on search input and selected shop type
  const userArea = activeUser?.assignedArea || activeUser?.location || 'Maudaha';
  const filteredBoutiques = boutiques.filter(b => {
    const areaMatch = b.area ? b.area === userArea || userArea.includes(b.area) : true;
    
    const shopType = b.shopType || 'boutique';
    const typeMatch = selectedShopType === 'all' || shopType === selectedShopType;
    if (!typeMatch) return false;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return areaMatch;
    const matchName = (b.name || '').toLowerCase().includes(query) || (b.nameHi || '').toLowerCase().includes(query);
    const matchSpecialty = (b.specialty || '').toLowerCase().includes(query) || (b.specialtyHi || '').toLowerCase().includes(query);
    const matchAddress = (b.address || '').toLowerCase().includes(query) || (b.addressHi || '').toLowerCase().includes(query);
    return areaMatch && (matchName || matchSpecialty || matchAddress);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" id="clothing-hub-portal">
      {/* Top Navigation & Tab bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-purple-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-600 animate-spin" />
            <h1 className="text-2xl md:text-3xl font-black text-gradient-primary tracking-tight">
              {t.hubTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t.hubSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              viewMode === 'stores'
                ? 'gradient-purple-pink text-white shadow-md'
                : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
            }`}
          >
            <Grid className="inline h-3.5 w-3.5 mr-1" />
            {t.viewStores}
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition relative ${
              viewMode === 'history'
                ? 'gradient-purple-pink text-white shadow-md'
                : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
            }`}
          >
            <History className="inline h-3.5 w-3.5 mr-1" />
            {t.orderHistory}
            {ordersState.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                {ordersState.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      <AnimatePresence mode="wait">
        {viewMode === 'stores' ? (
          <motion.div
            key="boutiques-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {selectedBoutiqueId ? (
              // Boutique Details View
              <div>
                {/* Back Button */}
                <button
                  onClick={() => {
                    setSelectedBoutiqueId(null);
                    setPromoCode('');
                    setAppliedDiscount(null);
                  }}
                  className="mb-5 flex items-center gap-1.5 bg-white text-purple-700 hover:text-purple-900 border border-purple-100 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm hover:shadow transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToHub}
                </button>

                {currentBoutique && (
                  <div>
                    {/* Banner and Detail Card */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-md mb-8">
                      <div className="h-48 md:h-64 relative">
                        <img 
                          src={currentBoutique.banner} 
                          alt={currentBoutique.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 text-white">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="bg-pink-500 text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full">
                              Premium Boutique
                            </span>
                          </div>
                          <h2 className="text-xl md:text-3xl font-black tracking-tight">
                            {language === 'hi' ? currentBoutique.nameHi : currentBoutique.name}
                          </h2>
                          <p className="text-xs text-purple-100 mt-1 md:text-sm font-medium flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-pink-400 inline" />
                            {language === 'hi' ? currentBoutique.addressHi : currentBoutique.address}
                          </p>
                        </div>
                      </div>

                      {/* Store Meta details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-purple-100 bg-purple-50/50 p-4">
                        <div className="p-2 text-center md:text-left">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                            {t.rating}
                          </span>
                          <span className="text-sm font-black text-slate-700 flex items-center justify-center md:justify-start gap-1 mt-0.5">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {currentBoutique.rating} / 5.0
                          </span>
                        </div>
                        <div className="p-2 text-center md:text-left">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                            {t.delivery}
                          </span>
                          <span className="text-sm font-black text-slate-700 flex items-center justify-center md:justify-start gap-1 mt-0.5">
                            <Clock className="h-4 w-4 text-pink-500" />
                            {language === 'hi' ? currentBoutique.deliveryTimeHi : currentBoutique.deliveryTime}
                          </span>
                        </div>
                        <div className="p-2 text-center md:text-left">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                            {t.minOrder}
                          </span>
                          <span className="text-sm font-black text-slate-700 block mt-0.5">
                            ₹{currentBoutique.minOrder}
                          </span>
                        </div>
                        <div className="p-2 text-center md:text-left col-span-2 md:col-span-1">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                            {t.specialty}
                          </span>
                          <span className="text-xs font-bold text-purple-800 line-clamp-1 mt-0.5">
                            {language === 'hi' ? currentBoutique.specialtyHi : currentBoutique.specialty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(['all', 'ethnic', 'western', 'kids', 'footwear', 'accessories'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-black transition ${
                            activeCategory === cat
                              ? 'gradient-purple-pink text-white shadow-sm'
                              : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
                          }`}
                        >
                          {t[cat]}
                        </button>
                      ))}
                    </div>

                    {/* Clothing Item Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentBoutique.items
                        .filter(item => activeCategory === 'all' || item.category === activeCategory)
                        .map(item => {
                          const chosenSize = selectedSizes[item.id] || item.sizes[0] || 'Free Size';
                          const isStitchingSelected = stitchingOptions[item.id] || false;
                          const inCartQuantity = activeBoutiqueCart
                            .filter(cartIt => cartIt.item.id === item.id)
                            .reduce((sum, current) => sum + current.quantity, 0);

                          return (
                            <div 
                              key={item.id} 
                              className="bg-white rounded-2xl border border-purple-100 shadow p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition duration-200"
                            >
                              {/* Product Thumbnail */}
                              <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden relative shrink-0">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute top-2 left-2 bg-slate-900/80 text-[9px] text-white font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase">
                                  {item.category}
                                </span>
                              </div>

                              {/* Product Details & Selectors */}
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start gap-1">
                                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                                      {language === 'hi' ? item.nameHi : item.name}
                                    </h3>
                                    <span className="text-base font-black text-purple-700 shrink-0">
                                      ₹{item.price}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                                    {language === 'hi' ? item.descriptionHi : item.description}
                                  </p>

                                  {(item.warrantyPeriod || item.replacementPolicy) && (
                                    <div className="flex flex-col gap-0.5 mt-2">
                                      {item.warrantyPeriod && (
                                        <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded w-fit flex items-center gap-1">
                                          🛡️ {language === 'hi' && item.warrantyPeriodHi ? item.warrantyPeriodHi : item.warrantyPeriod}
                                        </span>
                                      )}
                                      {item.replacementPolicy && (
                                        <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded w-fit flex items-center gap-1">
                                          🔄 {language === 'hi' && item.replacementPolicyHi ? item.replacementPolicyHi : item.replacementPolicy}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Interactive Sizing selector */}
                                  <div className="mt-3">
                                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                                      {t.size}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {item.sizes.map(sz => (
                                        <button
                                          key={sz}
                                          onClick={() => setSelectedSizes({ ...selectedSizes, [item.id]: sz })}
                                          className={`h-7 px-2.5 text-xs font-black rounded-lg border transition ${
                                            chosenSize === sz
                                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                          }`}
                                        >
                                          {sz}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Custom Stitching Option for Ethnic designs */}
                                  {item.hasStitchingOption && (
                                    <div className="mt-3 bg-purple-50 border border-purple-100 rounded-lg p-2 flex items-start gap-2">
                                      <input 
                                        type="checkbox" 
                                        id={`stitch-${item.id}`}
                                        checked={isStitchingSelected}
                                        onChange={(e) => setStitchingOptions({ ...stitchingOptions, [item.id]: e.target.checked })}
                                        className="mt-0.5 h-3.5 w-3.5 text-purple-600 focus:ring-purple-400 border-purple-200 rounded cursor-pointer"
                                      />
                                      <label 
                                        htmlFor={`stitch-${item.id}`} 
                                        className="text-[10px] font-bold text-purple-900 cursor-pointer select-none leading-normal"
                                      >
                                        <Scissors className="inline h-3 w-3 mr-0.5 text-pink-500" />
                                        {t.stitching}
                                        <span className="block text-[8px] text-slate-500 font-normal">
                                          {t.stitchingNote}
                                        </span>
                                      </label>
                                    </div>
                                  )}
                                </div>

                                {/* Add to Bag Button / Indicators */}
                                <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                                  {inCartQuantity > 0 ? (
                                    <div className="bg-pink-100 text-pink-700 text-xs font-black px-2.5 py-1 rounded-lg">
                                      {inCartQuantity} in bag
                                    </div>
                                  ) : (
                                    <div />
                                  )}
                                  
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="gradient-purple-pink text-white hover:opacity-90 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                                  >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    {t.addToBag}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Boutique Directory View
              <div>
                {/* Search / Filter Section */}
                <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 mb-6 flex flex-col gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Shop Type Filters */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-purple-50">
                    {(['all', 'boutique', 'jewellery', 'footwear'] as const).map(type => {
                      const label = type === 'all' ? t.allShops :
                                    type === 'boutique' ? t.clothingShops :
                                    type === 'jewellery' ? t.jewelleryShops :
                                    t.footwearShops;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedShopType(type)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                            selectedShopType === type
                              ? 'gradient-purple-pink text-white shadow-sm scale-[1.02]'
                              : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid list of clothing stores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBoutiques.map(boutique => (
                    <div
                      key={boutique.id}
                      onClick={() => setSelectedBoutiqueId(boutique.id)}
                      className="bg-white rounded-2xl overflow-hidden border border-purple-100 shadow hover:shadow-lg hover:border-purple-200 transition duration-300 cursor-pointer group"
                    >
                      <div className="h-44 relative">
                        <img 
                          src={boutique.banner} 
                          alt={boutique.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent" />
                        
                        {/* Rating block */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-black text-slate-800">{boutique.rating}</span>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="bg-pink-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider">
                            {boutique.items.length} Designs
                          </span>
                          <h3 className="text-lg font-black tracking-tight mt-1 group-hover:text-pink-200 transition">
                            {language === 'hi' ? boutique.nameHi : boutique.name}
                          </h3>
                          <p className="text-[10px] text-purple-100 line-clamp-1 mt-0.5">
                            {language === 'hi' ? boutique.specialtyHi : boutique.specialty}
                          </p>
                        </div>
                      </div>

                      {/* Bottom store details */}
                      <div className="p-4 bg-purple-50/10 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-pink-500" />
                          {language === 'hi' ? boutique.deliveryTimeHi : boutique.deliveryTime}
                        </span>
                        <span className="text-purple-700 font-extrabold">
                          {t.minOrder}: ₹{boutique.minOrder}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          // Order History view
          <motion.div
            key="history-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6"
          >
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5 mb-5">
              <ShoppingBag className="h-5 w-5 text-pink-600" />
              {t.orderHistory}
            </h2>

            {ordersState.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                  <ShoppingBag className="h-7 w-7 text-purple-400" />
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  {t.noOrders}
                </p>
                <button
                  onClick={() => setViewMode('stores')}
                  className="mt-4 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-black rounded-xl transition"
                >
                  {t.viewStores}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {ordersState.map(order => (
                  <div 
                    key={order.id} 
                    className="border border-purple-100 rounded-2xl overflow-hidden bg-purple-50/10 shadow-sm"
                  >
                    {/* Header */}
                    <div className="bg-purple-50/50 p-4 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-purple-900">
                            {language === 'hi' ? order.boutiqueNameHi : order.boutiqueName}
                          </span>
                          <span className="bg-pink-100 text-pink-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            {order.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                          {t.date}: {order.date}
                        </p>
                      </div>

                      {/* Delivery Status and Tracker */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-pink-500 animate-pulse" />
                          <span className="text-xs font-black text-pink-700 uppercase tracking-wider">
                            {order.status === 'processing' ? 'Processing' : 
                             order.status === 'tailoring' ? 'Stitching/Tailoring' :
                             order.status === 'dispatched' ? 'Out for Delivery' : 'Delivered'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleReorder(order)}
                          className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-100 font-black text-[11px] px-3 py-1.5 rounded-lg transition"
                        >
                          {t.reorder}
                        </button>
                      </div>
                    </div>

                    {/* Ordered Clothes List */}
                    <div className="p-4 divide-y divide-purple-50">
                      {order.items.map((cartIt, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0">
                              <img 
                                src={cartIt.item.image} 
                                alt={cartIt.item.name} 
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-700">
                                {language === 'hi' ? cartIt.item.nameHi : cartIt.item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-extrabold">
                                  Size: <span className="text-purple-600 font-black">{cartIt.selectedSize}</span>
                                </span>
                                {cartIt.customStitching && (
                                  <span className="bg-purple-100 text-purple-800 text-[8px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                    <Scissors className="h-2 w-2" />
                                    {t.customStitched}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-500 font-bold block">
                              Qty: {cartIt.quantity}
                            </span>
                            <span className="text-xs font-black text-purple-700 block mt-0.5">
                              ₹{cartIt.item.price * cartIt.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Details */}
                    <div className="bg-purple-50/20 p-4 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>{t.paymentMethod}: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                      <span className="text-sm font-black text-purple-700">
                        {t.grandTotal}: ₹{order.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer Icon floating at the bottom right */}
      {selectedBoutiqueId && activeBoutiqueCart.length > 0 && (
        <div className="fixed bottom-24 right-5 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="h-14 px-5 rounded-2xl gradient-purple-pink text-white font-black flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>
              {t.bagCart} ({activeBoutiqueCart.reduce((sum, current) => sum + current.quantity, 0)})
            </span>
            <span className="bg-white/20 h-6 w-px mx-1" />
            <span className="font-black">₹{subtotal + stitchingCharges}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer Overlay & Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-purple-100 shadow-2xl z-50 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-purple-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-pink-600" />
                  <h3 className="font-black text-slate-800 text-lg">
                    {t.bagCart}
                  </h3>
                  <span className="bg-pink-100 text-pink-800 text-xs font-black px-2 py-0.5 rounded-full">
                    {activeBoutiqueCart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeBoutiqueCart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-xs text-slate-500 font-bold">
                      {t.emptyBag}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items List */}
                    {activeBoutiqueCart.map((cartItem, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-purple-50/10 border border-purple-100 rounded-xl flex gap-3 relative"
                      >
                        <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={cartItem.item.image} 
                            alt={cartItem.item.name} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-700 leading-tight">
                              {language === 'hi' ? cartItem.item.nameHi : cartItem.item.name}
                            </p>
                            <p className="text-[10px] text-purple-700 font-bold mt-0.5">
                              ₹{cartItem.item.price} each
                            </p>
                            
                            {/* Meta attributes (size, stitching) */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded">
                                Size: {cartItem.selectedSize}
                              </span>
                              {cartItem.customStitching && (
                                <span className="bg-pink-100 text-pink-700 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Scissors className="h-2 w-2" />
                                  Stitching
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleRemoveFromCart(idx)}
                              className="h-6 w-6 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition"
                            >
                              <Minus className="h-3 w-3 text-slate-500" />
                            </button>
                            <span className="text-xs font-black text-slate-700">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => handleAddToCart(cartItem.item)}
                              className="h-6 w-6 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition"
                            >
                              <Plus className="h-3 w-3 text-slate-500" />
                            </button>
                          </div>
                        </div>

                        {/* Direct delete button */}
                        <button
                          onClick={() => {
                            const currentCart = { ...cartState };
                            const items = [...(currentCart[selectedBoutiqueId!] || [])];
                            items.splice(idx, 1);
                            if (items.length === 0) {
                              delete currentCart[selectedBoutiqueId!];
                            } else {
                              currentCart[selectedBoutiqueId!] = items;
                            }
                            updateUserData(currentCart, ordersState);
                          }}
                          className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Promo Code Input Block */}
                    <div className="p-3.5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1.5">
                        Promotions & Coupons
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t.promoPlaceholder}
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="gradient-purple-pink text-white text-xs font-black px-4 py-1.5 rounded-lg hover:opacity-90 transition"
                        >
                          {t.apply}
                        </button>
                      </div>
                      {appliedDiscount && (
                        <p className="text-[10px] font-black text-emerald-600 mt-1.5 flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          {t.promoSuccess} ({appliedDiscount.code} -15%)
                        </p>
                      )}
                      {promoError && (
                        <p className="text-[10px] font-bold text-red-500 mt-1.5">
                          {promoError}
                        </p>
                      )}
                    </div>

                    {/* Payment Mode Selector */}
                    <div className="p-3.5 bg-purple-50/30 rounded-xl border border-purple-100">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-2">
                        {t.paymentMethod}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPaymentMethod('COD')}
                          className={`p-2 rounded-lg border text-xs font-black transition text-center ${
                            paymentMethod === 'COD'
                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                          }`}
                        >
                          💸 {t.cod}
                        </button>
                        <button
                          onClick={() => setPaymentMethod('UPI')}
                          className={`p-2 rounded-lg border text-xs font-black transition text-center ${
                            paymentMethod === 'UPI'
                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                          }`}
                        >
                          📱 {t.upi}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Receipt & Placing order */}
              {activeBoutiqueCart.length > 0 && currentBoutique && (
                <div className="p-5 border-t border-purple-100 bg-slate-50/50 space-y-3">
                  {/* Calculations breakdown */}
                  <div className="space-y-1.5 text-xs text-slate-500 font-bold">
                    <div className="flex justify-between">
                      <span>{t.subtotal}</span>
                      <span className="text-slate-700">₹{subtotal}</span>
                    </div>

                    {stitchingCharges > 0 && (
                      <div className="flex justify-between">
                        <span>{t.stitchingFees}</span>
                        <span className="text-pink-600">₹{stitchingCharges}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>{t.deliveryFee}</span>
                      {baseDeliveryCharge === 0 ? (
                        <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 animate-pulse">
                          {t.freeDelivery}
                        </span>
                      ) : (
                        <span className="text-slate-700">₹{baseDeliveryCharge}</span>
                      )}
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between text-emerald-600 font-black">
                        <span>{t.discount} (-15%)</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}

                    <div className="h-px bg-slate-200 my-2" />

                    <div className="flex justify-between text-sm font-black text-slate-800">
                      <span>{t.grandTotal}</span>
                      <span className="text-purple-700 text-base">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Min Checkout Warning or Submit Button */}
                  {subtotal < currentBoutique.minOrder ? (
                    <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-[10px] font-bold text-center leading-normal">
                      ⚠️ {language === 'en' 
                        ? `Add ₹${currentBoutique.minOrder - subtotal} more from this boutique for checkout!` 
                        : `चेकआउट करने के लिए इस बुटीक से ₹${currentBoutique.minOrder - subtotal} का सामान और जोड़ें!`}
                    </div>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full h-11 rounded-xl gradient-purple-pink text-white font-black text-xs shadow-md shadow-purple-500/10 hover:opacity-95 transition"
                    >
                      {t.placeOrder} (₹{grandTotal})
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
