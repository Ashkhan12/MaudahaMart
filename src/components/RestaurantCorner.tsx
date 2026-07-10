import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Star, 
  MapPin, 
  Clock, 
  Utensils, 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Tag, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  History,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { RegisteredUser, Restaurant, RestaurantMenuItem, RestaurantOrderItem, RestaurantOrder } from '../types';
import { INITIAL_RESTAURANTS } from '../dataRestaurants';
import UPIPayment from './UPIPayment';

interface RestaurantCornerProps {
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
  language: 'en' | 'hi';
  onAddActivity: (userId: string, actionEn: string, actionHi: string) => void;
  restaurants?: Restaurant[];
  settings: any;
}

export default function RestaurantCorner({
  activeUserId,
  users,
  onUpdateUsers,
  language,
  onAddActivity,
  restaurants = INITIAL_RESTAURANTS,
  settings
}: RestaurantCornerProps) {
  const activeUser = users.find(u => u.id === activeUserId);
  
  // Isolate state per user by hooking into user properties
  const cartState: { [restaurantId: string]: RestaurantOrderItem[] } = activeUser?.restaurantCart || {};
  const ordersState: RestaurantOrder[] = activeUser?.restaurantOrders || [];

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'veg' | 'nonveg' | 'sweet' | 'beverage'>('all');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD');
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);
  const [showActiveTracker, setShowActiveTracker] = useState<string | null>(null);

  // Helper to save user-specific restaurant cart/orders
  const updateUserData = (updatedCart: { [restaurantId: string]: RestaurantOrderItem[] }, updatedOrders: RestaurantOrder[]) => {
    onUpdateUsers(prevUsers => prevUsers.map(u => {
      if (u.id === activeUserId) {
        return {
          ...u,
          restaurantCart: updatedCart,
          restaurantOrders: updatedOrders
        };
      }
      return u;
    }));
  };

  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurantId);
  const activeRestaurantCart = selectedRestaurantId ? cartState[selectedRestaurantId] || [] : [];

  // Cart actions
  const handleAddToCart = (item: RestaurantMenuItem) => {
    if (!selectedRestaurantId) return;
    const currentCart = { ...cartState };
    const items = [...(currentCart[selectedRestaurantId] || [])];
    const existingIndex = items.findIndex(i => i.item.id === item.id);

    if (existingIndex > -1) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + 1
      };
    } else {
      items.push({ item, quantity: 1 });
    }

    currentCart[selectedRestaurantId] = items;
    updateUserData(currentCart, ordersState);
  };

  const handleRemoveFromCart = (item: RestaurantMenuItem) => {
    if (!selectedRestaurantId) return;
    const currentCart = { ...cartState };
    let items = [...(currentCart[selectedRestaurantId] || [])];
    const existingIndex = items.findIndex(i => i.item.id === item.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      if (currentQty > 1) {
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: currentQty - 1
        };
      } else {
        items = items.filter(i => i.item.id !== item.id);
      }
    }

    if (items.length === 0) {
      delete currentCart[selectedRestaurantId];
    } else {
      currentCart[selectedRestaurantId] = items;
    }

    updateUserData(currentCart, ordersState);
  };

  const handleClearCart = () => {
    if (!selectedRestaurantId) return;
    const currentCart = { ...cartState };
    delete currentCart[selectedRestaurantId];
    updateUserData(currentCart, ordersState);
    setDiscountAmount(0);
    setPromoCode('');
  };

  // Calculations
  const subtotal = activeRestaurantCart.reduce((acc, current) => acc + current.item.price * current.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 200 ? 0 : 20) : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Apply food coupon
  const handleApplyCoupon = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'FOOD30' && subtotal > 150) {
      const discount = Math.round(subtotal * 0.3);
      setDiscountAmount(discount);
      alert(language === 'en' ? `Coupon 'FOOD30' applied successfully! ₹${discount} off.` : `कूपन 'FOOD30' लागू! ₹${discount} की बचत।`);
    } else if (code === 'DESITASTE') {
      setDiscountAmount(40);
      alert(language === 'en' ? `Coupon 'DESITASTE' applied successfully! ₹40 off.` : `कूपन 'DESITASTE' लागू! ₹40 की बचत।`);
    } else {
      alert(language === 'en' ? 'Invalid code or minimum order condition not met (min ₹150 for FOOD30).' : 'अमान्य कोड या आवश्यक न्यूनतम राशि पूरी नहीं हुई (FOOD30 के लिए न्यूनतम ₹150)।');
    }
  };

  const executePlaceOrder = (confirmedUpiId?: string) => {
    if (activeRestaurantCart.length === 0 || !currentRestaurant) return;

    if (subtotal < currentRestaurant.minOrder) {
      alert(language === 'en' 
        ? `Minimum order value for ${currentRestaurant.name} is ₹${currentRestaurant.minOrder}. Please add more delicious items!`
        : `${currentRestaurant.nameHi || currentRestaurant.name} के लिए न्यूनतम ऑर्डर राशि ₹${currentRestaurant.minOrder} है।`);
      return;
    }

    const orderId = `FOOD-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const actualPaymentMethod = (paymentMethod === 'UPI' && settings.enableUpiPaymentRestaurants !== false) ? 'UPI' : 'COD';
    const newOrder: RestaurantOrder = {
      id: orderId,
      restaurantId: currentRestaurant.id,
      restaurantName: currentRestaurant.name,
      restaurantNameHi: currentRestaurant.nameHi,
      items: activeRestaurantCart,
      subtotal,
      deliveryFee,
      total: grandTotal,
      paymentMethod: actualPaymentMethod,
      status: 'cooking',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
    };

    const updatedOrders = [newOrder, ...ordersState];
    const currentCart = { ...cartState };
    delete currentCart[currentRestaurant.id];

    updateUserData(currentCart, updatedOrders);
    
    // Log activity
    onAddActivity(
      activeUserId, 
      `Placed food order ${orderId} from ${currentRestaurant.name} for ₹${grandTotal}`,
      `${currentRestaurant.nameHi} से ₹${grandTotal} का भोजन ऑर्डर ${orderId} दिया`
    );

    // Reset checkout forms
    setPromoCode('');
    setDiscountAmount(0);
    setShowCartDrawer(false);
    setShowUpiCheckout(false);
    setShowActiveTracker(orderId);

    alert(language === 'en' 
      ? `🎉 Food Order placed successfully! Tracking ID: ${orderId}` 
      : `🎉 भोजन का ऑर्डर सफलतापूर्वक दिया गया! ऑर्डर आईडी: ${orderId}`);
  };

  const handleCheckoutBtn = () => {
    if (paymentMethod === 'UPI' && settings.enableUpiPaymentRestaurants !== false) {
      setShowUpiCheckout(true);
    } else {
      executePlaceOrder();
    }
  };

  // Reorder action
  const handleReorder = (oldOrder: RestaurantOrder) => {
    const currentCart = { ...cartState };
    const oldItems: RestaurantOrderItem[] = oldOrder.items.map(it => ({
      item: it.item,
      quantity: it.quantity
    }));

    currentCart[oldOrder.restaurantId] = oldItems;
    updateUserData(currentCart, ordersState);
    setSelectedRestaurantId(oldOrder.restaurantId);
    setShowCartDrawer(true);
    
    alert(language === 'en'
      ? 'Items added back to your food cart!'
      : 'सामग्री आपके फूड कार्ट में वापस जोड़ दी गई है!');
  };

  // Simulate preparation speed
  useEffect(() => {
    const activeCookingOrders = ordersState.filter(o => o.status !== 'delivered');
    if (activeCookingOrders.length === 0) return;

    const interval = setInterval(() => {
      let changed = false;
      const updatedOrders = ordersState.map(order => {
        if (order.status === 'cooking') {
          changed = true;
          return { ...order, status: 'packing' as const };
        } else if (order.status === 'packing') {
          changed = true;
          return { ...order, status: 'out' as const };
        } else if (order.status === 'out') {
          changed = true;
          // Trigger Delivered and add activity
          setTimeout(() => {
            onAddActivity(
              activeUserId,
              `Delicious hot meal from ${order.restaurantName} was safely delivered!`,
              `${order.restaurantNameHi} से स्वादिष्ट गर्म भोजन सुरक्षित रूप से वितरित किया गया!`
            );
          }, 100);
          return { ...order, status: 'delivered' as const };
        }
        return order;
      });

      if (changed) {
        updateUserData(cartState, updatedOrders);
      }
    }, 15000); // changes status every 15 seconds for realistic simulation

    return () => clearInterval(interval);
  }, [ordersState, cartState, activeUserId]);

  // Handle manual state change for testing/instant feedback
  const handleAdvanceStatus = (orderId: string) => {
    const updatedOrders = ordersState.map(order => {
      if (order.id === orderId) {
        if (order.status === 'cooking') return { ...order, status: 'packing' as const };
        if (order.status === 'packing') return { ...order, status: 'out' as const };
        if (order.status === 'out') {
          onAddActivity(
            activeUserId,
            `Delicious hot meal from ${order.restaurantName} was safely delivered!`,
            `${order.restaurantNameHi} से स्वादिष्ट गर्म भोजन सुरक्षित रूप से वितरित किया गया!`
          );
          return { ...order, status: 'delivered' as const };
        }
      }
      return order;
    });
    updateUserData(cartState, updatedOrders);
  };

  // Filtering restaurant list
  const userArea = activeUser?.assignedArea || activeUser?.location || 'Maudaha';
  const filteredRestaurants = restaurants.filter(r => {
    const areaMatch = r.area ? r.area === userArea || userArea.includes(r.area) : true;
    const matchesSearch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.cuisine || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.menu.some(item => (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return areaMatch && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Back button or Brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        {selectedRestaurantId ? (
          <button
            onClick={() => {
              setSelectedRestaurantId(null);
              setSearchQuery('');
              setDiscountAmount(0);
              setPromoCode('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-black text-slate-700 transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            {language === 'en' ? 'Back to Restaurant Corner' : 'रेस्टोरेंट कॉर्नर पर वापस जाएं'}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {language === 'en' ? 'Maudaha Food Express 🍔' : 'मौदहा फूड एक्सप्रेस 🍔'}
              </h1>
              <p className="text-xs font-medium text-slate-400">
                {language === 'en' 
                  ? 'Order hot meals, sweets, and fresh snacks delivered instantly across Maudaha & all over India'
                  : 'मौदहा और पूरे भारत में तुरंत डिलीवर होने वाले गर्म भोजन, मिठाई और स्नैक्स ऑर्डर करें'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 w-full md:w-auto">
          {ordersState.length > 0 && (
            <button
              onClick={() => setShowActiveTracker(showActiveTracker ? null : ordersState[0].id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              <History className="h-4 w-4" />
              {language === 'en' ? 'My Food Orders' : 'मेरे भोजन ऑर्डर'}
            </button>
          )}
          {selectedRestaurantId && activeRestaurantCart.length > 0 && (
            <button
              onClick={() => setShowCartDrawer(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              {language === 'en' ? `Cart (${activeRestaurantCart.length})` : `कार्ट (${activeRestaurantCart.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE TRACKER OVERLAY PANEL */}
      {showActiveTracker && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 relative overflow-hidden">
          <button
            onClick={() => setShowActiveTracker(null)}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500 animate-pulse" />
              <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">
                {language === 'en' ? 'Live Food Status Tracker' : 'लाइव भोजन स्थिति ट्रैकर'}
              </h2>
            </div>

            {ordersState.filter(o => o.id === showActiveTracker).map(order => {
              const steps = ['cooking', 'packing', 'out', 'delivered'];
              const stepIndex = steps.indexOf(order.status);
              
              return (
                <div key={order.id} className="border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">RESTAURANT</span>
                      <strong className="text-sm font-black text-slate-800">
                        {language === 'hi' ? order.restaurantNameHi || order.restaurantName : order.restaurantName}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">ORDER ID</span>
                      <strong className="text-xs font-mono font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                        {order.id}
                      </strong>
                    </div>
                  </div>

                  {/* Tracking timeline */}
                  <div className="grid grid-cols-4 gap-2 pt-2 relative">
                    <div className="absolute top-[18px] left-[12%] right-[12%] h-[2px] bg-slate-100 -z-1" />
                    <div 
                      className="absolute top-[18px] left-[12%] h-[2px] bg-rose-500 transition-all duration-1000 -z-1" 
                      style={{ width: `${(stepIndex / 3) * 76}%` }}
                    />

                    {/* Step 1: Cooking */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        stepIndex >= 0 
                          ? 'bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/20' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        <ChefHat className="h-4 w-4" />
                      </div>
                      <span className={`text-[9px] font-black uppercase ${stepIndex >= 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {language === 'en' ? 'Cooking' : 'तैयारी'}
                      </span>
                    </div>

                    {/* Step 2: Packing */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        stepIndex >= 1 
                          ? 'bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/20' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <span className={`text-[9px] font-black uppercase ${stepIndex >= 1 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {language === 'en' ? 'Packing' : 'पैकिंग'}
                      </span>
                    </div>

                    {/* Step 3: Out for Delivery */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        stepIndex >= 2 
                          ? 'bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/20' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <span className={`text-[9px] font-black uppercase ${stepIndex >= 2 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {language === 'en' ? 'Delivery' : 'सवारी पर'}
                      </span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        stepIndex >= 3 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className={`text-[9px] font-black uppercase ${stepIndex >= 3 ? 'text-emerald-600 animate-bounce' : 'text-slate-400'}`}>
                        {language === 'en' ? 'Delivered' : 'वितरित'}
                      </span>
                    </div>
                  </div>

                  {/* Status explanation */}
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-bounce shrink-0">
                      🔔
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-slate-700 leading-normal">
                        {order.status === 'cooking' && (language === 'en' ? 'Chefs are preparedly cooking your fresh order right now.' : 'रसोइये अभी आपका ताजा भोजन तैयार कर रहे हैं।')}
                        {order.status === 'packing' && (language === 'en' ? 'Your food is hot and being packed in eco-friendly containers.' : 'आपका भोजन गर्म है और पर्यावरण के अनुकूल डिब्बों में पैक किया जा रहा है।')}
                        {order.status === 'out' && (language === 'en' ? 'Maudaha Mart food delivery boy is driving fast to your address!' : 'मौदहा मार्ट का डिलीवरी बॉय आपके पते पर तेजी से गाड़ी चला रहा है!')}
                        {order.status === 'delivered' && (language === 'en' ? 'Delicious warm meals delivered successfully! Enjoy your food.' : 'स्वादिष्ट गर्म भोजन सफलतापूर्वक वितरित कर दिया गया है! भोजन का आनंद लें।')}
                      </p>
                    </div>
                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded-lg transition active:scale-95 cursor-pointer"
                        title="Simulate next step immediately"
                      >
                        ⚡ Speed Up
                      </button>
                    )}
                  </div>

                  {/* Summary of ordered items */}
                  <div className="text-xs font-bold text-slate-500 space-y-1 pl-1">
                    <span>{language === 'en' ? 'Items ordered:' : 'मंगवाई गई सामग्री:'}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex justify-between">
                          <span className="text-slate-700 font-semibold text-xs truncate max-w-[150px]">
                            {language === 'hi' ? it.item.nameHi : it.item.name}
                          </span>
                          <span className="text-slate-400 font-mono text-xs">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASE A: LIST OF ALL RESTAURANTS */}
      {!selectedRestaurantId && (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96 rounded-2xl border border-slate-200 bg-white">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? "Search dishes or restaurants..." : "व्यंजन या रेस्टोरेंट खोजें..."}
                className="w-full py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-slate-700"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
              {(['all', 'veg', 'nonveg', 'sweet', 'beverage'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition shrink-0 border capitalize cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-rose-600 border-rose-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' && (language === 'en' ? 'All Flavours' : 'सभी स्वाद')}
                  {cat === 'veg' && (language === 'en' ? '🥦 Pure Veg' : '🥦 शाकाहारी')}
                  {cat === 'nonveg' && (language === 'en' ? '🍗 Non-Veg' : '🍗 मांसाहारी')}
                  {cat === 'sweet' && (language === 'en' ? '🍮 Desserts' : '🍮 मीठा')}
                  {cat === 'beverage' && (language === 'en' ? '🍹 Drinks' : '🍹 पेय पदार्थ')}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRestaurants.map(restaurant => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurantId(restaurant.id)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-rose-500/20 hover:translate-y-[-4px] transition-all duration-300 cursor-pointer flex flex-col h-full group"
              >
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={restaurant.banner}
                    alt={restaurant.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                    <span className="text-amber-500">★</span>
                    <span className="text-slate-800">{restaurant.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                    {language === 'hi' ? restaurant.cuisineHi : restaurant.cuisine}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-800 tracking-tight group-hover:text-rose-600 transition duration-200">
                      {language === 'hi' ? restaurant.nameHi : restaurant.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      <span className="truncate">{language === 'hi' ? restaurant.addressHi : restaurant.address}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Clock className="h-4 w-4 text-slate-300" />
                      {language === 'hi' ? restaurant.deliveryTimeHi : restaurant.deliveryTime}
                    </span>
                    <span className="font-semibold">
                      {language === 'en' ? 'Min Order' : 'न्यूनतम ऑर्डर'}: <strong className="text-slate-800 font-extrabold">₹{restaurant.minOrder}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESTAURANT ORDER HISTORY IN BOTTOM */}
          {ordersState.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <History className="h-4 w-4 text-rose-500" />
                {language === 'en' ? 'Previous Hot Meal Orders' : 'पिछले भोजन के ऑर्डर'}
              </h3>

              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2">
                {ordersState.map((order) => (
                  <div key={order.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-black text-slate-800">
                          {language === 'hi' ? order.restaurantNameHi || order.restaurantName : order.restaurantName}
                        </strong>
                        <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {order.id}
                        </span>
                      </div>
                      <p className="text-slate-400 font-medium text-[10px]">{order.date}</p>
                      
                      {/* Short list of ordered foods */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.items.map((it, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-100">
                            {language === 'hi' ? it.item.nameHi : it.item.name} (x{it.quantity})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">TOTAL AMOUNT</span>
                        <strong className="text-sm font-black text-slate-800 font-mono">₹{order.total}</strong>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md text-center border ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                        }`}>
                          {order.status}
                        </span>
                        
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-black transition cursor-pointer"
                        >
                          🔄 {language === 'en' ? 'Reorder' : 'पुनः ऑर्डर'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* CASE B: SINGLE RESTAURANT MENU PAGE */}
      {selectedRestaurantId && currentRestaurant && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Menu items list (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Restaurant Detail Banner */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="relative aspect-[21/9] bg-slate-100">
                <img
                  src={currentRestaurant.banner}
                  alt={currentRestaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <h2 className="text-2xl font-black tracking-tight leading-none">
                    {language === 'hi' ? currentRestaurant.nameHi : currentRestaurant.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <strong>{currentRestaurant.rating}</strong>
                    </span>
                    <span>|</span>
                    <span>{language === 'hi' ? currentRestaurant.cuisineHi : currentRestaurant.cuisine}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {language === 'hi' ? currentRestaurant.deliveryTimeHi : currentRestaurant.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Header with Category Selectors */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-50 pb-4">
                <h3 className="font-extrabold text-slate-800 text-base tracking-tight">
                  🍔 {language === 'en' ? 'Delicious Menu Dishes' : 'स्वादिष्ट व्यंजन सूची'}
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase">
                  {language === 'en' ? `${currentRestaurant.menu.length} items available` : `${currentRestaurant.menu.length} व्यंजन उपलब्ध हैं`}
                </span>
              </div>

              {/* Dish cards */}
              <div className="divide-y divide-slate-100">
                {currentRestaurant.menu.map((dish) => {
                  const cartItem = activeRestaurantCart.find(i => i.item.id === dish.id);
                  const cartQty = cartItem ? cartItem.quantity : 0;

                  return (
                    <div key={dish.id} className="py-5 flex flex-col sm:flex-row gap-5">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full shrink-0 border ${
                              dish.category === 'veg' ? 'bg-emerald-500 border-emerald-600' : 'bg-rose-500 border-rose-600'
                            }`} title={dish.category} />
                            <h4 className="font-extrabold text-sm text-slate-800">
                              {language === 'hi' ? dish.nameHi : dish.name}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400 leading-normal max-w-lg">
                            {language === 'hi' ? dish.descriptionHi : dish.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <strong className="text-base font-black text-slate-800 font-mono">₹{dish.price}</strong>
                          
                          {/* Qty Selector */}
                          <div className="flex items-center gap-2">
                            {cartQty > 0 ? (
                              <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 px-2 py-1 rounded-xl">
                                <button
                                  onClick={() => handleRemoveFromCart(dish)}
                                  className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-xs font-black text-rose-700 font-mono w-4 text-center">{cartQty}</span>
                                <button
                                  onClick={() => handleAddToCart(dish)}
                                  className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(dish)}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-sm shadow-rose-600/15"
                              >
                                {language === 'en' ? 'Add to Plate' : 'प्लेट में जोड़ें'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Cart sidebar summary (4 cols) */}
        <div className={`lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 lg:sticky lg:top-24 fixed lg:static inset-0 z-50 lg:z-auto transition-transform duration-300 ${showCartDrawer ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:h-auto overflow-y-auto lg:overflow-visible`}>
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <ShoppingBag className="h-4.5 w-4.5 text-rose-600" />
              {language === 'en' ? 'Restaurant Cart' : 'फूड प्लेट कार्ट'}
            </h3>
            <div className="flex items-center gap-4">
              {activeRestaurantCart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  {language === 'en' ? 'Clear All' : 'साफ़ करें'}
                </button>
              )}
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="lg:hidden p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

            {activeRestaurantCart.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
                  🍽️
                </div>
                <p className="text-xs font-bold text-slate-400">
                  {language === 'en' ? 'Your food plate is empty. Add hot meals to order!' : 'आपकी भोजन प्लेट खाली है। स्वादिष्ट व्यंजन जोड़ें!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart list */}
                <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-1">
                  {activeRestaurantCart.map((cartItem) => (
                    <div key={cartItem.item.id} className="py-2.5 flex justify-between items-center text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <strong className="text-slate-800 block truncate">
                          {language === 'hi' ? cartItem.item.nameHi : cartItem.item.name}
                        </strong>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {cartItem.quantity} x ₹{cartItem.item.price}
                        </span>
                      </div>
                      <span className="font-mono text-slate-700 font-bold shrink-0">
                        ₹{cartItem.item.price * cartItem.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Coupons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'en' ? 'Apply Food Coupon' : 'कूपन कोड लागू करें'}
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. FOOD30"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono uppercase font-bold focus:outline-none focus:border-rose-300"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'en' ? 'Apply' : 'लागू'}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 pl-1 leading-normal">
                    💡 {language === 'en' ? 'Apply FOOD30 (30% off on orders > ₹150) or DESITASTE for instant ₹40 off.' : 'FOOD30 (न्यूनतम ₹150 पर 30% छूट) या DESITASTE लागू करें।'}
                  </p>
                </div>

                {/* Subtotal breakdowns */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Items Subtotal' : 'सामग्री का मूल्य'}</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Maudaha Delivery Boy fee' : 'मौदहा डिलीवरी बॉय शुल्क'}</span>
                    <span className="font-mono">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{language === 'en' ? 'Coupon Discount' : 'कूपन छूट'}</span>
                      <span className="font-mono">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-50 text-slate-800 font-black text-sm">
                    <span>{language === 'en' ? 'Total Bill' : 'कुल बिल'}</span>
                    <span className="font-mono text-rose-600 text-base">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Payment selectors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'en' ? 'Payment Method' : 'भुगतान का प्रकार'}
                  </span>
                  <div className={`grid ${settings.enableUpiPaymentRestaurants !== false ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                    <button
                      onClick={() => setPaymentMethod('COD')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                        paymentMethod === 'COD' || (settings.enableUpiPaymentRestaurants === false)
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      💵 {language === 'en' ? 'Cash on Delivery' : 'कैश ऑन डिलीवरी'}
                    </button>
                    {settings.enableUpiPaymentRestaurants !== false && (
                      <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                          paymentMethod === 'UPI'
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        📱 {language === 'en' ? 'Instant UPI' : 'त्वरित UPI'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleCheckoutBtn}
                  disabled={subtotal < currentRestaurant.minOrder}
                  className={`w-full max-w-[200px] mx-auto py-2 text-center text-white text-[10px] font-extrabold rounded-lg transition cursor-pointer shadow-sm ${
                    subtotal >= currentRestaurant.minOrder
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-600/20'
                      : 'bg-slate-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  {language === 'en' 
                    ? `ORDER • ₹${grandTotal}` 
                    : `ऑर्डर • ₹${grandTotal}`}
                </button>

                {subtotal < currentRestaurant.minOrder && (
                  <p className="text-[10px] text-amber-600 text-center font-bold">
                    ⚠️ {language === 'en' ? `Add ₹${currentRestaurant.minOrder - subtotal} more for minimum order!` : `न्यूनतम ऑर्डर के लिए ₹${currentRestaurant.minOrder - subtotal} और सामग्री जोड़ें!`}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Razorpay UPI Checkout Modal */}
      {showUpiCheckout && currentRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUpiCheckout(false)} />
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100 z-50">
            <button
              onClick={() => setShowUpiCheckout(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-extrabold font-mono text-base transition-colors duration-150 z-50"
            >
              ✕
            </button>
            <div className="p-1">
              <div className="bg-[#3395ff] text-white p-5 text-center rounded-t-2xl">
                <span className="text-[10px] font-black tracking-widest font-mono uppercase opacity-85">Maudaha Mart UPI Gateway</span>
                <p className="text-2xl font-black mt-1">₹{grandTotal}</p>
              </div>
              <div className="p-5">
                <UPIPayment
                  amount={grandTotal}
                  sellerAmount={Math.round(activeRestaurantCart.reduce((sum, item) => sum + (item.item.price * 0.9) * item.quantity, 0))}
                  adminAmount={Math.max(0, grandTotal - Math.round(activeRestaurantCart.reduce((sum, item) => sum + (item.item.price * 0.9) * item.quantity, 0)))}
                  sellerUpiId={currentRestaurant.upiId || 'merchant@ybl'}
                  adminUpiId="dingdang7081@okhdfcbank"
                  onPaymentSuccess={(confirmedUpiId) => {
                    executePlaceOrder(confirmedUpiId);
                  }}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
