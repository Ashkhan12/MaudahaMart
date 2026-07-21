import React, { useState, useEffect } from 'react';
import { 
  Heart, Utensils, Sparkles, Scissors, Wrench, Zap, Car, Award, Calendar, 
  Clock, DollarSign, List, Edit, Check, X, Shield, Plus, Star, MapPin, 
  Smartphone, Eye, AlertCircle, ShoppingBag, Grid, RefreshCw, MessageCircle, FileText, Video
} from 'lucide-react';
import { 
  RegisteredUser, Language, Restaurant, ClothingBoutique,
  LocalServiceBooking, RestaurantOrder, ClothingOrder, UserRole
} from '../types';

interface RoleDashboardsProps {
  role: UserRole;
  language: Language;
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: (users: RegisteredUser[]) => void;
  restaurants: Restaurant[];
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  boutiques: ClothingBoutique[];
  onUpdateBoutiques: (boutiques: ClothingBoutique[]) => void;
}

export default function RoleDashboards({
  role,
  language,
  activeUserId,
  users,
  onUpdateUsers,
  restaurants,
  onUpdateRestaurants,
  boutiques,
  onUpdateBoutiques
}: RoleDashboardsProps) {
  const activeUser = users.find(u => u.id === activeUserId);

  // Common Header component for the dashboards
  const DashboardHeader = ({ title, titleHi, desc, descHi, icon: Icon, colorClass = "bg-emerald-50 text-emerald-600 border-emerald-100" }: {
    title: string;
    titleHi: string;
    desc: string;
    descHi: string;
    icon: any;
    colorClass?: string;
  }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className={`p-4 rounded-2xl ${colorClass} border flex items-center justify-center shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {language === 'en' ? title : titleHi}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
              {language === 'en' ? desc : descHi}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 self-start sm:self-auto shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="text-left font-mono">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Logged In As</span>
            <span className="text-xs font-black text-slate-700 block mt-0.5">{activeUser?.name || 'Portal Partner'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render individual dashboard based on the selected role
  switch (role) {
    case 'restaurant_owner':
      return (
        <RestaurantOwnerDashboard 
          language={language}
          activeUser={activeUser}
          users={users}
          onUpdateUsers={onUpdateUsers}
          restaurants={restaurants}
          onUpdateRestaurants={onUpdateRestaurants}
          header={<DashboardHeader 
            title="Maudaha Kitchen Hub" 
            titleHi="मौदहा रसोई केंद्र" 
            desc="Track food orders, manage culinary items, prices, and dining options."
            descHi="भोजन के ऑर्डर ट्रैक करें, पाक वस्तुओं, कीमतों और डाइनिंग विकल्पों को प्रबंधित करें।"
            icon={Utensils}
            colorClass="bg-amber-50 text-amber-500 border-amber-100"
          />}
        />
      );

    case 'jewellery_owner':
      return (
        <ShopOwnerDashboard 
          language={language}
          activeUser={activeUser}
          users={users}
          onUpdateUsers={onUpdateUsers}
          boutiques={boutiques}
          onUpdateBoutiques={onUpdateBoutiques}
          shopType="jewellery"
          header={<DashboardHeader 
            title="Maudaha Jewellery Studio" 
            titleHi="मौदहा आभूषण स्टूडियो" 
            desc="Oversee precious metal ornaments, fine jewelry designs, and customer orders."
            descHi="कीमती धातुओं के गहनों, बेहतरीन डिजाइनों और ग्राहकों के ऑर्डरों की निगरानी करें।"
            icon={Sparkles}
            colorClass="bg-indigo-50 text-indigo-500 border-indigo-100"
          />}
        />
      );

    case 'footwear_owner':
      return (
        <ShopOwnerDashboard 
          language={language}
          activeUser={activeUser}
          users={users}
          onUpdateUsers={onUpdateUsers}
          boutiques={boutiques}
          onUpdateBoutiques={onUpdateBoutiques}
          shopType="footwear"
          header={<DashboardHeader 
            title="Maudaha Footwear Outlet" 
            titleHi="मौदहा फुटवियर आउटलेट" 
            desc="Manage sandals, shoes, sizing stocks, and premium shoe orders."
            descHi="सैंडल, जूते, आकार स्टॉक और प्रीमियम जूते के ऑर्डर प्रबंधित करें।"
            icon={ShoppingBag}
            colorClass="bg-teal-50 text-teal-500 border-teal-100"
          />}
        />
      );

    case 'boutique_owner':
      return (
        <ShopOwnerDashboard 
          language={language}
          activeUser={activeUser}
          users={users}
          onUpdateUsers={onUpdateUsers}
          boutiques={boutiques}
          onUpdateBoutiques={onUpdateBoutiques}
          shopType="boutique"
          header={<DashboardHeader 
            title="Maudaha Apparel Boutique" 
            titleHi="मौदहा परिधान बुटीक" 
            desc="Track boutique designer wear, ethnic collections, and custom tailoring orders."
            descHi="बुटीक डिजाइनर परिधानों, एथनिक संग्रहों और कस्टम सिलाई के ऑर्डरों को ट्रैक करें।"
            icon={Award}
            colorClass="bg-violet-50 text-violet-500 border-violet-100"
          />}
        />
      );

    // Local Service providers
    case 'beautician':
    case 'tailor':
    case 'plumber':
    case 'electrician':
    case 'mechanic':
      return (
        <LocalServiceProviderDashboard 
          language={language}
          role={role}
          header={<DashboardHeader 
            title={`Maudaha Service Desk: ${role.charAt(0).toUpperCase() + role.slice(1)}`} 
            titleHi={`मौदहा सेवा डेस्क: ${role === 'beautician' ? 'ब्यूटीशियन' : role === 'tailor' ? 'दर्जी' : role === 'plumber' ? 'प्लंबर' : role === 'electrician' ? 'इलेक्ट्रीशियन' : 'मैकेनिक'}`} 
            desc={`Accept job requests, configure service pricing, and track scheduled bookings.`}
            descHi={`नौकरी के अनुरोधों को स्वीकार करें, सेवा की कीमतें कॉन्फ़िगर करें और शेड्यूल्ड बुकिंग ट्रैक करें।`}
            icon={role === 'beautician' ? Sparkles : role === 'tailor' ? Scissors : role === 'plumber' ? Wrench : role === 'electrician' ? Zap : Car}
            colorClass="bg-sky-50 text-sky-500 border-sky-100"
          />}
        />
      );

    default:
      return (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto my-12">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-800">Invalid Partner Portal</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Please select a valid role to proceed.</p>
        </div>
      );
  }
}

/* ==========================================
   2. RESTAURANT OWNER DASHBOARD
   ========================================== */
interface RestaurantOwnerDashboardProps {
  language: Language;
  activeUser: RegisteredUser | undefined;
  users: RegisteredUser[];
  onUpdateUsers: (users: RegisteredUser[]) => void;
  restaurants: Restaurant[];
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  header: React.ReactNode;
}

function RestaurantOwnerDashboard({ 
  language, activeUser, users, onUpdateUsers, restaurants, onUpdateRestaurants, header 
}: RestaurantOwnerDashboardProps) {
  
  // Find which restaurant belongs to this owner
  // We'll match by name or pick the first restaurant in the list to manage
  const managedRestaurant = restaurants[0] || { id: 'rest-1', name: 'Maudaha Spice Junction', menu: [] };
  const [menuItems, setMenuItems] = useState(managedRestaurant.menu || []);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  // Load restaurant orders from all users
  const getRestaurantOrders = (): { order: RestaurantOrder; userId: string; userName: string }[] => {
    const list: { order: RestaurantOrder; userId: string; userName: string }[] = [];
    users.forEach(u => {
      if (u.restaurantOrders && Array.isArray(u.restaurantOrders)) {
        u.restaurantOrders.forEach(o => {
          if (o.restaurantId === managedRestaurant.id || true) { // managing all for simulation
            list.push({ order: o, userId: u.id, userName: u.name });
          }
        });
      }
    });

    // Sort by date/id descending
    return list.sort((a,b) => b.order.id.localeCompare(a.order.id));
  };

  const handleUpdateOrderStatus = (orderId: string, userId: string, nextStatus: 'cooking' | 'packing' | 'out' | 'delivered') => {
    const updatedUsers = users.map(u => {
      if (u.id === userId && u.restaurantOrders) {
        return {
          ...u,
          restaurantOrders: u.restaurantOrders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    alert(`Order #${orderId} status updated to ${nextStatus}!`);
  };

  const handleUpdateMenuPrice = (itemId: string, newP: number) => {
    const updatedMenu = menuItems.map(item => item.id === itemId ? { ...item, price: newP } : item);
    setMenuItems(updatedMenu);

    const updatedRestaurants = restaurants.map(r => {
      if (r.id === managedRestaurant.id) {
        return { ...r, menu: updatedMenu };
      }
      return r;
    });
    onUpdateRestaurants(updatedRestaurants);
    setEditingItem(null);
    alert(language === 'en' ? 'Menu item price updated successfully!' : 'मेनू आइटम की कीमत सफलतापूर्वक अपडेट हो गई!');
  };

  const orders = getRestaurantOrders();
  const totalRevenue = orders.filter(o => o.order.status === 'delivered').reduce((sum, o) => sum + o.order.total, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {header}

      {/* Navigation tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl max-w-sm">
        <button type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
            activeTab === 'orders' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🍔 Orders Queue ({orders.filter(o => o.order.status !== 'delivered').length})
        </button>
        <button type="button"
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
            activeTab === 'menu' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📋 Kitchen Menu ({menuItems.length})
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 cursor-pointer">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Today's Revenue</span>
          <span className="text-2xl font-black text-slate-800 block mt-1">₹{totalRevenue}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Active Orders</span>
          <span className="text-2xl font-black text-amber-500 block mt-1">{orders.filter(o => o.order.status !== 'delivered').length}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Completed</span>
          <span className="text-2xl font-black text-emerald-500 block mt-1">{orders.filter(o => o.order.status === 'delivered').length}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Kitchen Status</span>
          <span className="text-xs font-extrabold text-emerald-600 block mt-2.5">🟢 ACTIVE & TAKING ORDERS</span>
        </div>
      </div>

      {activeTab === 'orders' ? (
        /* RESTAURANT ORDERS QUEUE */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-sm">Active Restaurant Orders</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Live order statuses streaming from Maudaha consumers.</p>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No food orders recorded yet.</div>
            ) : (
              orders.map(({ order, userId, userName }) => (
                <div key={order.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-xs">Order #{order.id}</span>
                      <span className="text-[10px] text-slate-400 font-bold">• Client: {userName}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === 'cooking' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'packing' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'out' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1 pl-3.5 border-l-2 border-emerald-500/30">
                      {order.items.map((it, i) => (
                        <div key={i} className="text-xs font-medium text-slate-600">
                          {it.quantity}x {language === 'hi' ? it.item.nameHi : it.item.name} <span className="text-slate-400 font-mono">(₹{it.item.price})</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium">
                      <span>Total Ticket: <b className="text-slate-700">₹{order.total}</b></span> | 
                      <span className="ml-2">Mode: <b className="text-slate-700">{order.paymentMethod}</b></span> |
                      <span className="ml-2">Date: {order.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {order.status !== 'delivered' && (
                      <>
                        {order.status === 'cooking' && (
                          <button type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, userId, 'packing')}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            Mark Packed
                          </button>
                        )}
                        {order.status === 'packing' && (
                          <button type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, userId, 'out')}
                            className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            Dispatch Order
                          </button>
                        )}
                        {order.status === 'out' && (
                          <button type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, userId, 'delivered')}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* MENU MANAGEMENT */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-sm">Managed Restaurant Menu</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Add, edit, and configure your live food catalogue items.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3.5 justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-black text-slate-800 text-xs block truncate max-w-[120px]">
                      {language === 'hi' ? item.nameHi : item.name}
                    </span>
                    <span className="text-[10px] bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {editingItem?.id === item.id ? (
                    <div className="flex flex-col items-end gap-1.5 animate-in slide-in-from-right-2">
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-right outline-none focus:border-amber-500"
                      />
                      <div className="flex gap-1">
                        <button type="button"
                          onClick={() => handleUpdateMenuPrice(item.id, editPrice)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button type="button"
                          onClick={() => setEditingItem(null)}
                          className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded transition cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-800 block">₹{item.price}</span>
                      <button type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setEditPrice(item.price);
                        }}
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold mt-1 hover:underline cursor-pointer"
                      >
                        Edit Price
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   3, 4, 5. CLOTHING/SHOP OWNER DASHBOARD COMPONENT
   ========================================== */
interface ShopOwnerDashboardProps {
  language: Language;
  activeUser: RegisteredUser | undefined;
  users: RegisteredUser[];
  onUpdateUsers: (users: RegisteredUser[]) => void;
  boutiques: ClothingBoutique[];
  onUpdateBoutiques: (boutiques: ClothingBoutique[]) => void;
  shopType: 'boutique' | 'jewellery' | 'footwear';
  header: React.ReactNode;
}

function ShopOwnerDashboard({
  language, activeUser, users, onUpdateUsers, boutiques, onUpdateBoutiques, shopType, header
}: ShopOwnerDashboardProps) {

  // Match corresponding boutique/outlet or default
  const managedBoutique = boutiques.find(b => b.shopType === shopType) || boutiques[0] || { id: 'bt-1', name: 'Maudaha Fashion Lab', items: [] };
  const [items, setItems] = useState(managedBoutique.items || []);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  // Load shop orders from all users
  const getShopOrders = (): { order: ClothingOrder; userId: string; userName: string }[] => {
    const list: { order: ClothingOrder; userId: string; userName: string }[] = [];
    users.forEach(u => {
      if (u.clothingOrders && Array.isArray(u.clothingOrders)) {
        u.clothingOrders.forEach(o => {
          if (o.boutiqueId === managedBoutique.id || true) { // simulation manages all for testing ease
            list.push({ order: o, userId: u.id, userName: u.name });
          }
        });
      }
    });

    return list.sort((a,b) => b.order.id.localeCompare(a.order.id));
  };

  const handleUpdateOrderStatus = (orderId: string, userId: string, nextStatus: 'processing' | 'tailoring' | 'dispatched' | 'delivered') => {
    const updatedUsers = users.map(u => {
      if (u.id === userId && u.clothingOrders) {
        return {
          ...u,
          clothingOrders: u.clothingOrders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    alert(`Order #${orderId} status changed to ${nextStatus}!`);
  };

  const handleUpdateItemPrice = (itemId: string, newP: number) => {
    const updatedItems = items.map(it => it.id === itemId ? { ...it, price: newP } : it);
    setItems(updatedItems);

    const updatedBoutiques = boutiques.map(b => {
      if (b.id === managedBoutique.id) {
        return { ...b, items: updatedItems };
      }
      return b;
    });
    onUpdateBoutiques(updatedBoutiques);
    setEditingItem(null);
    alert('Price updated successfully!');
  };

  const orders = getShopOrders();
  const totalRevenue = orders.filter(o => o.order.status === 'delivered').reduce((sum, o) => sum + o.order.total, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {header}

      {/* Nav */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl max-w-sm">
        <button type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
            activeTab === 'orders' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📦 Active Orders ({orders.filter(o => o.order.status !== 'delivered').length})
        </button>
        <button type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
            activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🏷️ Inventory Control ({items.length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 cursor-pointer">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Gross Sales</span>
          <span className="text-2xl font-black text-slate-800 block mt-1">₹{totalRevenue}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Pending Jobs</span>
          <span className="text-2xl font-black text-amber-500 block mt-1">{orders.filter(o => o.order.status !== 'delivered').length}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Dispatch Mode</span>
          <span className="text-2xl font-black text-emerald-500 block mt-1">{orders.filter(o => o.order.status === 'delivered').length}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Outlet status</span>
          <span className="text-xs font-extrabold text-emerald-600 block mt-2.5">🛒 OPEN & READY</span>
        </div>
      </div>

      {activeTab === 'orders' ? (
        /* SHOP ORDERS QUEUE */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-sm">Active Customer Orders</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Seamless order pipeline tracking from Maudaha residents.</p>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No customer orders recorded yet.</div>
            ) : (
              orders.map(({ order, userId, userName }) => (
                <div key={order.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-xs">Order #{order.id}</span>
                      <span className="text-[10px] text-slate-400 font-bold">• Client: {userName}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'tailoring' ? 'bg-violet-100 text-violet-800' :
                        order.status === 'dispatched' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1 pl-3.5 border-l-2 border-emerald-500/30">
                      {order.items.map((it, i) => (
                        <div key={i} className="text-xs font-medium text-slate-600">
                          {it.quantity}x {language === 'hi' ? it.item.nameHi : it.item.name} 
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-2 font-bold font-mono">Sz: {it.selectedSize}</span>
                          {it.customStitching && <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded ml-1 font-black">Custom Stitching Requested</span>}
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium">
                      <span>Total Invoice: <b className="text-slate-700">₹{order.total}</b></span> | 
                      <span className="ml-2">Mode: <b className="text-slate-700">{order.paymentMethod}</b></span> |
                      <span className="ml-2">Date: {order.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {order.status !== 'delivered' && (
                      <>
                        {order.status === 'processing' && (
                          <button type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, userId, shopType === 'boutique' ? 'tailoring' : 'dispatched')}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            {shopType === 'boutique' ? 'Send to Tailor' : 'Ready to Dispatch'}
                          </button>
                        )}
                        {order.status === 'tailoring' && (
                          <button type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, userId, 'dispatched')}
                            className="px-3.5 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            Finish Stitching & Dispatch
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, userId, 'delivered')}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* CATALOGUE MANAGEMENT */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-sm">Managed Shop Catalogue</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Fine tune pricing matrices and toggle product listings.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3.5 justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-black text-slate-800 text-xs block truncate max-w-[120px]">
                      {language === 'hi' ? item.nameHi : item.name}
                    </span>
                    <span className="text-[10px] bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {editingItem?.id === item.id ? (
                    <div className="flex flex-col items-end gap-1.5">
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-right outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-1">
                        <button type="button"
                          onClick={() => handleUpdateItemPrice(item.id, editPrice)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button type="button"
                          onClick={() => setEditingItem(null)}
                          className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded transition cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-800 block">₹{item.price}</span>
                      <button type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setEditPrice(item.price);
                        }}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold mt-1 hover:underline cursor-pointer"
                      >
                        Edit Price
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   6, 7, 8, 9, 10. LOCAL SERVICE PROVIDER DASHBOARD COMPONENT
   ========================================== */
interface LocalServiceProviderDashboardProps {
  language: Language;
  role: 'beautician' | 'tailor' | 'plumber' | 'electrician' | 'mechanic';
  header: React.ReactNode;
}

function LocalServiceProviderDashboard({ language, role, header }: LocalServiceProviderDashboardProps) {
  const [bookings, setBookings] = useState<LocalServiceBooking[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [baseCharge, setBaseCharge] = useState(() => {
    return role === 'beautician' ? 350 : role === 'tailor' ? 200 : role === 'plumber' ? 150 : role === 'electrician' ? 180 : 250;
  });
  const [editingCharge, setEditingCharge] = useState(false);
  const [inputCharge, setInputCharge] = useState(baseCharge);

  useEffect(() => {
    const list: LocalServiceBooking[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mau_service_bookings_')) {
        try {
          const userBookings = JSON.parse(localStorage.getItem(key) || '[]');
          list.push(...userBookings.filter((b: any) => b.category === role));
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fallback simulation
    if (list.length === 0) {
      const fallbackBookings: LocalServiceBooking[] = [
        {
          id: 'SRV-549012',
          userId: 'user-1',
          userName: 'Alok Mishra',
          userPhone: '+91 91283 04910',
          serviceId: 'srv-1',
          serviceName: `${role.charAt(0).toUpperCase() + role.slice(1)} Partner`,
          category: role,
          date: new Date().toISOString().split('T')[0],
          timeslot: '11:00 AM',
          status: 'pending',
          address: 'Galla Mandi Ward, Maudaha, Uttar Pradesh',
          notes: 'Please arrive on time.'
        }
      ];
      setBookings(fallbackBookings);
    } else {
      setBookings(list);
    }
  }, [role]);

  const saveBookings = (updated: LocalServiceBooking[]) => {
    setBookings(updated);
    // Sync back to users so user can see updated status
    updated.forEach(b => {
      const key = `mau_service_bookings_${b.userId}`;
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const userBookingsFiltered = stored.filter((x: any) => x.id !== b.id);
        const updatedUserList = [b, ...userBookingsFiltered];
        localStorage.setItem(key, JSON.stringify(updatedUserList));
      } catch (e) {
        console.error(e);
      }
    });
  };

  const updateStatus = (id: string, nextStatus: 'pending' | 'accepted' | 'completed' | 'cancelled') => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: nextStatus } : b);
    saveBookings(updated);
    alert(`Service status successfully updated to: ${nextStatus}!`);
  };

  const earnings = bookings.filter(b => b.status === 'completed').length * baseCharge;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {header}

      {/* Profile controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Availability Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="font-extrabold text-slate-800 text-xs block">Service Availability</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Toggle whether you are currently taking active bookings.</span>
          </div>
          <button type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 cursor-pointer ${
              isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {isOnline ? '🟢 ONLINE & READY' : '🔴 OFFLINE'}
          </button>
        </div>

        {/* Pricing Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-extrabold text-slate-800 text-xs block">Service Callout Fee</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Base charge for visiting consumer's home.</span>
          </div>
          <div className="text-right">
            {editingCharge ? (
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={inputCharge}
                  onChange={e => setInputCharge(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black text-right"
                />
                <button type="button"
                  onClick={() => {
                    setBaseCharge(inputCharge);
                    setEditingCharge(false);
                  }}
                  className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-800">₹{baseCharge}</span>
                <button type="button"
                  onClick={() => {
                    setInputCharge(baseCharge);
                    setEditingCharge(true);
                  }}
                  className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Gross Service Revenue</span>
          <span className="text-2xl font-black text-slate-800 block mt-1">₹{earnings}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Pending Jobs</span>
          <span className="text-2xl font-black text-amber-500 block mt-1">{bookings.filter(b => b.status === 'pending').length}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Active Ongoing</span>
          <span className="text-2xl font-black text-sky-500 block mt-1">{bookings.filter(b => b.status === 'accepted').length}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Completed Jobs</span>
          <span className="text-2xl font-black text-emerald-500 block mt-1">{bookings.filter(b => b.status === 'completed').length}</span>
        </div>
      </div>

      {/* Bookings panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-slate-800 text-sm">Consumer Booking Request Desk</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage home visits, repair timeslots, and client contacts.</p>
        </div>

        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No service bookings booked yet.</div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-xs">{booking.userName}</span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      booking.status === 'accepted' ? 'bg-sky-100 text-sky-800' :
                      booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1.5 space-y-0.5">
                    <p>📞 Client Contact: <b className="text-slate-700">{booking.userPhone}</b></p>
                    <p>🗓️ Date: {booking.date} | Timeslot: {booking.timeslot}</p>
                    <p>📍 Location Address: {booking.address}</p>
                    {booking.notes && <p>📝 Extra Notes: <i className="text-slate-500">"{booking.notes}"</i></p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {booking.status === 'pending' && (
                    <>
                      <button type="button"
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-[10px] text-slate-500 font-extrabold transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button type="button"
                        onClick={() => updateStatus(booking.id, 'accepted')}
                        className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] text-xs font-extrabold transition cursor-pointer"
                      >
                        Accept Visit
                      </button>
                    </>
                  )}
                  {booking.status === 'accepted' && (
                    <button type="button"
                      onClick={() => updateStatus(booking.id, 'completed')}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] text-xs font-extrabold transition cursor-pointer"
                    >
                      Complete Service Job
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Paid & Settled
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
