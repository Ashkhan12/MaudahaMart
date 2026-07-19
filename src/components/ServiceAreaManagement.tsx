import React, { useState } from 'react';
import { 
  MapPin, Plus, Shield, CheckCircle, XCircle, ToggleLeft, ToggleRight, 
  Map, Users, Store, Package, ShoppingCart, Truck, Clock, Tag, LifeBuoy,
  Edit2, Trash2, Check, X, AlertCircle, TrendingUp, DollarSign, Calendar, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ServiceArea, RegisteredUser, Store as StoreType, Restaurant, ClothingBoutique,
  Product, Order, SupportTicket, Notification 
} from '../types';

interface ServiceAreaManagementProps {
  serviceAreas: ServiceArea[];
  onUpdateServiceAreas: (areas: ServiceArea[]) => void;
  users: RegisteredUser[];
  stores: StoreType[];
  restaurants: Restaurant[];
  boutiques: ClothingBoutique[];
  products: Product[];
  orders: Order[];
  supportTickets: SupportTicket[];
  onUpdateUsers: (users: RegisteredUser[]) => void;
  onUpdateStores: (stores: StoreType[]) => void;
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  onUpdateBoutiques: (boutiques: ClothingBoutique[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSupportTickets: (tickets: SupportTicket[]) => void;
  language: 'en' | 'hi';
}

type TabType = 'controls' | 'boundary' | 'users' | 'shops' | 'products' | 'orders' | 'riders' | 'timing' | 'coupons' | 'tickets';

/**
 * Checks if a coordinate (lat, lng) falls within a specified polygon using the Ray Casting algorithm.
 */
export function isCoordinateInPolygon(
  lat: number,
  lng: number,
  polygon: { lat: number; lng: number }[]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const x = lng;
  const y = lat;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Checks if a coordinate (lat, lng) falls within the selected service area's polygon boundary.
 */
export function isCoordinateInServiceArea(
  lat: number,
  lng: number,
  selectedServiceAreaId: string,
  serviceAreas: ServiceArea[]
): boolean {
  const area = serviceAreas.find(a => a.id === selectedServiceAreaId);
  if (!area || !area.polygon_coordinates) return false;
  return isCoordinateInPolygon(lat, lng, area.polygon_coordinates);
}

export default function ServiceAreaManagement(props: ServiceAreaManagementProps) {
  const { 
    serviceAreas, onUpdateServiceAreas, 
    users, stores, restaurants, boutiques, 
    products, orders, supportTickets,
    onUpdateUsers, onUpdateStores, onUpdateRestaurants, onUpdateBoutiques,
    onUpdateOrders, onUpdateSupportTickets, language 
  } = props;

  const [selectedAreaId, setSelectedAreaId] = useState<string>(serviceAreas[0]?.id || 'area-maudaha');
  const [activeTab, setActiveTab] = useState<TabType>('controls');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Adding New Service Area
  const [newArea, setNewArea] = useState({
    area_name: '',
    pincode: '',
    city: '',
    state: 'Uttar Pradesh',
    delivery_charge: 15,
    free_delivery_above: 199,
    minimum_order_amount: 49,
    estimated_delivery_time: '15-30 Mins',
    max_distance_km: 5,
  });

  // State for adding items to the selected service area in management tabs
  const [newSlot, setNewSlot] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(50);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(199);
  const [customCoupons, setCustomCoupons] = useState<{[areaId: string]: Array<{code: string, discount: number, minOrder: number, id: string}>}>({
    'area-maudaha': [
      { id: 'c1', code: 'MAUMANGO', discount: 50, minOrder: 199 },
      { id: 'c2', code: 'MAUFAST', discount: 30, minOrder: 149 }
    ],
    'area-hamirpur': [
      { id: 'c3', code: 'HAMIR50', discount: 50, minOrder: 249 }
    ]
  });

  // Map Boundary Coordinates Edit State
  const [newLat, setNewLat] = useState('25.680');
  const [newLng, setNewLng] = useState('80.120');

  // Coordinate Checker Simulator State
  const [testLat, setTestLat] = useState('25.6815');
  const [testLng, setTestLng] = useState('80.1132');
  const [testResult, setTestResult] = useState<'inside' | 'outside' | null>(null);

  const selectedArea = serviceAreas.find(a => a.id === selectedAreaId) || serviceAreas[0];

  if (!selectedArea) {
    return (
      <div className="p-8 text-center bg-white border rounded-2xl">
        <AlertCircle className="mx-auto text-amber-500 h-12 w-12" />
        <p className="mt-4 font-semibold text-slate-700">No Service Areas configured yet.</p>
      </div>
    );
  }

  // --- Multi-Tenant Data Filters ---
  // Helper to check if a user is in this service area
  const getAreaUsers = () => {
    return users.filter(u => {
      if (u.serviceAreaId) return u.serviceAreaId === selectedArea.id;
      // Fallback: If no serviceAreaId is specified, map to 'area-maudaha' (Maudaha Central)
      return selectedArea.id === 'area-maudaha';
    });
  };

  const handleTestCoordinate = () => {
    const latNum = parseFloat(testLat);
    const lngNum = parseFloat(testLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }
    const isInside = isCoordinateInPolygon(latNum, lngNum, selectedArea.polygon_coordinates || []);
    setTestResult(isInside ? 'inside' : 'outside');
  };

  // Helper to check if a store, restaurant, or boutique is in this area
  const getAreaStores = () => {
    const sList = stores.filter(s => (s as any).serviceAreaId === selectedArea.id || (!(s as any).serviceAreaId && selectedArea.id === 'area-maudaha'));
    const rList = restaurants.filter(r => (r as any).serviceAreaId === selectedArea.id || (!(r as any).serviceAreaId && selectedArea.id === 'area-maudaha'));
    const bList = boutiques.filter(b => (b as any).serviceAreaId === selectedArea.id || (!(b as any).serviceAreaId && selectedArea.id === 'area-maudaha'));
    
    return [
      ...sList.map(s => ({ ...s, type: 'Grocery/General' })),
      ...rList.map(r => ({ ...r, type: 'Restaurant/Food' })),
      ...bList.map(b => ({ ...b, type: 'Boutique/Fashion' }))
    ];
  };

  // Helper to check products in this area
  const getAreaProducts = () => {
    const sIds = new Set(stores.filter(s => (s as any).serviceAreaId === selectedArea.id || (!(s as any).serviceAreaId && selectedArea.id === 'area-maudaha')).map(s => s.id));
    return products.filter(p => sIds.has(p.storeId));
  };

  // Helper to check orders placed in this area
  const getAreaOrders = () => {
    return orders.filter(o => {
      if ((o as any).serviceAreaId) return (o as any).serviceAreaId === selectedArea.id;
      // Fallback
      return selectedArea.id === 'area-maudaha';
    });
  };

  // Helper to get delivery boys (riders) assigned to this area
  const getAreaRiders = () => {
    return users.filter(u => u.role === 'rider' && (u.assignedArea === selectedArea.id || u.serviceAreaId === selectedArea.id || (!u.serviceAreaId && selectedArea.id === 'area-maudaha')));
  };

  // Helper to get support tickets from this area
  const getAreaTickets = () => {
    return supportTickets.filter(t => {
      if ((t as any).serviceAreaId) return (t as any).serviceAreaId === selectedArea.id;
      // Or map via user location matching
      const user = users.find(u => u.id === t.userId);
      if (user) {
        if (user.serviceAreaId) return user.serviceAreaId === selectedArea.id;
        return selectedArea.id === 'area-maudaha';
      }
      return selectedArea.id === 'area-maudaha';
    });
  };

  // --- Actions ---
  const handleToggleStatus = () => {
    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          status: area.status === 'Active' ? 'Inactive' : 'Active' as 'Active' | 'Inactive',
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
  };

  const handleUpdateNumericField = (field: keyof ServiceArea, val: number) => {
    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          [field]: val,
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
  };

  const handleUpdateStringField = (field: keyof ServiceArea, val: string) => {
    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          [field]: val,
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
  };

  const handleAddSlot = () => {
    if (!newSlot.trim()) return;
    const currentSlots = selectedArea.delivery_slots || [];
    if (currentSlots.includes(newSlot.trim())) return;

    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          delivery_slots: [...currentSlots, newSlot.trim()],
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
    setNewSlot('');
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    const currentSlots = selectedArea.delivery_slots || [];
    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          delivery_slots: currentSlots.filter(s => s !== slotToRemove),
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
  };

  const handleToggleDeliveryType = (type: string) => {
    const currentTypes = selectedArea.delivery_types || [];
    let updatedTypes: string[];
    if (currentTypes.includes(type)) {
      updatedTypes = currentTypes.filter(t => t !== type);
    } else {
      updatedTypes = [...currentTypes, type];
    }

    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          delivery_types: updatedTypes,
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
  };

  const handleAddCoordinate = () => {
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const currentCoords = selectedArea.polygon_coordinates || [];
    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          polygon_coordinates: [...currentCoords, { lat, lng }],
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
    setNewLat('');
    setNewLng('');
  };

  const handleRemoveCoordinate = (index: number) => {
    const currentCoords = selectedArea.polygon_coordinates || [];
    const updated = serviceAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          polygon_coordinates: currentCoords.filter((_, i) => i !== index),
          updated_at: new Date().toISOString()
        };
      }
      return area;
    });
    onUpdateServiceAreas(updated);
  };

  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.area_name.trim() || !newArea.pincode.trim() || !newArea.city.trim()) return;

    const newId = `area-${newArea.area_name.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Create actual unique ServiceArea
    const created: ServiceArea = {
      id: newId,
      area_name: newArea.area_name,
      pincode: newArea.pincode,
      city: newArea.city,
      state: newArea.state,
      delivery_charge: newArea.delivery_charge,
      free_delivery_above: newArea.free_delivery_above,
      minimum_order_amount: newArea.minimum_order_amount,
      estimated_delivery_time: newArea.estimated_delivery_time,
      max_distance_km: newArea.max_distance_km,
      polygon_coordinates: [
        { lat: 25.680, lng: 80.120 },
        { lat: 25.688, lng: 80.130 },
        { lat: 25.672, lng: 80.140 }
      ],
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_orders: 0,
      monthly_orders: 0,
      active_customers: 0,
      revenue: 0,
      average_delivery_time: '25 mins',
      cancellation_rate: 0.0,
      delivery_slots: ["Instant Delivery", "Evening Rush (05:00 PM - 09:00 PM)"],
      delivery_types: ["Instant", "Scheduled"]
    };

    onUpdateServiceAreas([...serviceAreas, created]);
    setSelectedAreaId(newId);
    setShowAddModal(false);
    
    // Reset form
    setNewArea({
      area_name: '',
      pincode: '',
      city: '',
      state: 'Uttar Pradesh',
      delivery_charge: 15,
      free_delivery_above: 199,
      minimum_order_amount: 49,
      estimated_delivery_time: '15-30 Mins',
      max_distance_km: 5,
    });
  };

  const handleAddCoupon = () => {
    if (!newCouponCode.trim()) return;
    const code = newCouponCode.trim().toUpperCase();
    
    const areaCoupons = customCoupons[selectedArea.id] || [];
    if (areaCoupons.some(c => c.code === code)) return;

    const newCoupon = {
      id: `coupon-${Date.now()}`,
      code,
      discount: newCouponDiscount,
      minOrder: newCouponMinOrder
    };

    setCustomCoupons(prev => ({
      ...prev,
      [selectedArea.id]: [...areaCoupons, newCoupon]
    }));

    setNewCouponCode('');
  };

  const handleRemoveCoupon = (id: string) => {
    const areaCoupons = customCoupons[selectedArea.id] || [];
    setCustomCoupons(prev => ({
      ...prev,
      [selectedArea.id]: areaCoupons.filter(c => c.id !== id)
    }));
  };

  const areaUsers = getAreaUsers();
  const areaStores = getAreaStores();
  const areaProducts = getAreaProducts();
  const areaOrders = getAreaOrders();
  const areaRiders = getAreaRiders();
  const areaTickets = getAreaTickets();
  const areaCoupons = customCoupons[selectedArea.id] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left max-w-7xl mx-auto px-4 py-8">
      
      {/* --- SIDEBAR: Available Service Areas --- */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight">Service Areas</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-amber-500 text-slate-900 hover:bg-amber-400 rounded-xl transition duration-200 flex items-center justify-center shadow-lg shadow-amber-500/15"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Active service areas partitioned for absolute multi-tenant customer, rider, and seller isolation.
          </p>
        </div>

        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {serviceAreas.map(area => {
            const isSelected = area.id === selectedArea.id;
            return (
              <button
                key={area.id}
                onClick={() => setSelectedAreaId(area.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-400' 
                    : 'bg-slate-50 border-slate-200/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`h-4 w-4 ${isSelected ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                      <span className="font-bold text-slate-900">{area.area_name}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      PIN: {area.pincode} | {area.city}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    area.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {area.status}
                  </span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Orders</span>
                    <span className="text-slate-700 font-bold font-mono">{area.total_orders || 0}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Charge</span>
                    <span className="text-slate-700 font-bold font-mono">₹{area.delivery_charge}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Min Order</span>
                    <span className="text-slate-700 font-bold font-mono">₹{area.minimum_order_amount}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- DASHBOARD: Service Area Settings --- */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Header Stats */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-md inline-block">
                Service Area ID: {selectedArea.id}
              </span>
              <h1 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2">
                {selectedArea.area_name} Management Hub
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                {selectedArea.city}, {selectedArea.state} — Isolated database metrics & permissions controls.
              </p>
            </div>

            <div className="flex gap-2">
              <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                selectedArea.status === 'Active' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}>
                {selectedArea.status === 'Active' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
                {selectedArea.status === 'Active' ? 'Open for Business' : 'Closed Area'}
              </span>
            </div>
          </div>

          {/* Core Analytics Blocks for This Service Area */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black font-mono text-slate-800">{areaOrders.length}</span>
                <span className="text-[10px] text-slate-400">orders</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Customers</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black font-mono text-slate-800">
                  {areaUsers.filter(u => u.role === 'customer').length}
                </span>
                <span className="text-[10px] text-slate-400">users</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shops & Partners</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black font-mono text-slate-800">{areaStores.length}</span>
                <span className="text-[10px] text-slate-400">merchants</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue Stream</span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-xl font-black font-mono text-slate-800">₹{
                  areaOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()
                }</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABS BAR --- */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40 flex flex-wrap gap-1">
          {[
            { id: 'controls', label: 'Controls', icon: ToggleLeft },
            { id: 'boundary', label: 'Boundary', icon: Map },
            { id: 'users', label: 'Users', icon: Users, badge: areaUsers.length },
            { id: 'shops', label: 'Sellers', icon: Store, badge: areaStores.length },
            { id: 'products', label: 'Products', icon: Package, badge: areaProducts.length },
            { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: areaOrders.length },
            { id: 'riders', label: 'Riders', icon: Truck, badge: areaRiders.length },
            { id: 'timing', label: 'Timing', icon: Clock },
            { id: 'coupons', label: 'Coupons', icon: Tag, badge: areaCoupons.length },
            { id: 'tickets', label: 'Tickets', icon: LifeBuoy, badge: areaTickets.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all duration-150 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT AREA --- */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm min-h-[400px]">
          
          {/* TAB: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-0.5 text-left">
                  <h3 className="font-bold text-slate-900">Service Area Operational Status</h3>
                  <p className="text-xs text-slate-400 font-medium">Turn off to completely halt deliveries and order placement in this area.</p>
                </div>
                <button 
                  onClick={handleToggleStatus}
                  className="focus:outline-none transition duration-200 active:scale-95"
                >
                  {selectedArea.status === 'Active' ? (
                    <ToggleRight className="h-14 w-14 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="h-14 w-14 text-slate-300" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Charge */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 block tracking-wider">Delivery Fee (₹)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={selectedArea.delivery_charge}
                      onChange={(e) => handleUpdateNumericField('delivery_charge', parseInt(e.target.value))}
                      className="w-full accent-slate-900" 
                    />
                    <span className="font-mono font-bold bg-slate-50 border px-3 py-1.5 rounded-xl text-slate-800 text-sm min-w-[50px] text-center">
                      ₹{selectedArea.delivery_charge}
                    </span>
                  </div>
                </div>

                {/* Free Delivery Above */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 block tracking-wider">Free Delivery Minimum (₹)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={selectedArea.free_delivery_above}
                      onChange={(e) => handleUpdateNumericField('free_delivery_above', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-sm font-mono font-bold" 
                    />
                  </div>
                </div>

                {/* Minimum Checkout Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 block tracking-wider">Minimum Checkout Threshold (₹)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={selectedArea.minimum_order_amount}
                      onChange={(e) => handleUpdateNumericField('minimum_order_amount', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-sm font-mono font-bold" 
                    />
                  </div>
                </div>

                {/* Estimated Delivery Time */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 block tracking-wider">Estimated Delivery Speed</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="text" 
                      value={selectedArea.estimated_delivery_time}
                      onChange={(e) => handleUpdateStringField('estimated_delivery_time', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-sm font-bold" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MAP BOUNDARY */}
          {activeTab === 'boundary' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* SVG Visual Polygon Grid Mockup */}
                <div className="md:col-span-7 bg-slate-900 rounded-3xl p-4 border border-slate-800 relative min-h-[280px] flex items-center justify-center overflow-hidden">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 border border-slate-800 text-slate-400 rounded text-[9px] font-mono tracking-wider">
                    Interactive Grid & Geo-fence
                  </div>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
                  
                  {/* Render SVG Polygon */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Highlighted Boundary Area */}
                    <polygon 
                      points={
                        (selectedArea.polygon_coordinates || []).map((_, i) => {
                          // Simple mock positioning
                          const x = 20 + (i % 3) * 25 + Math.sin(i) * 5;
                          const y = 20 + Math.floor(i / 2) * 35 + Math.cos(i) * 5;
                          return `${x},${y}`;
                        }).join(' ')
                      } 
                      className="fill-amber-500/15 stroke-amber-500 stroke-[1.5px]" 
                      strokeDasharray="2"
                    />
                    
                    {/* Render Coordinates Dots */}
                    {(selectedArea.polygon_coordinates || []).map((_, i) => {
                      const x = 20 + (i % 3) * 25 + Math.sin(i) * 5;
                      const y = 20 + Math.floor(i / 2) * 35 + Math.cos(i) * 5;
                      return (
                        <circle 
                          key={i} 
                          cx={x} 
                          cy={y} 
                          r="3" 
                          className="fill-amber-400 stroke-slate-900 stroke-[1px] cursor-pointer hover:r-4 transition-all" 
                        />
                      );
                    })}
                  </svg>
                  
                  <div className="relative z-10 text-center space-y-2 pointer-events-none">
                    <Map className="h-10 w-10 text-amber-500/80 mx-auto animate-bounce" />
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">GeoJSON Polygon Locked</p>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Coordinates create a hardware-level virtual fence restricting buyers & merchants outside bounds.
                    </p>
                  </div>
                </div>

                {/* Coordinates Editor */}
                <div className="md:col-span-5 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Polygon Coordinates List</h3>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {(selectedArea.polygon_coordinates || []).map((coord, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-mono font-medium">
                        <span className="text-slate-600">P{i+1}: {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}</span>
                        <button 
                          onClick={() => handleRemoveCoordinate(i)}
                          className="p-1 hover:bg-slate-200 rounded text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add coordinate tool */}
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Latitude" 
                      value={newLat}
                      onChange={(e) => setNewLat(e.target.value)}
                      className="bg-slate-50 border p-2 rounded-xl text-xs font-mono font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Longitude" 
                      value={newLng}
                      onChange={(e) => setNewLng(e.target.value)}
                      className="bg-slate-50 border p-2 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <button 
                    onClick={handleAddCoordinate}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Border Landmark Point
                  </button>

                  {/* Real-time Geofence Boundary Check Simulator */}
                  <div className="pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">🎯</span>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Geofence Boundary Validator</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-normal">Verify if arbitrary GPS coordinates fall inside the active boundary polygon.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Test Latitude</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 25.6815" 
                          value={testLat}
                          onChange={(e) => {
                            setTestLat(e.target.value);
                            setTestResult(null);
                          }}
                          className="w-full bg-white border p-2 rounded-xl text-xs font-mono font-extrabold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Test Longitude</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 80.1132" 
                          value={testLng}
                          onChange={(e) => {
                            setTestLng(e.target.value);
                            setTestResult(null);
                          }}
                          className="w-full bg-white border p-2 rounded-xl text-xs font-mono font-extrabold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleTestCoordinate}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      Check Geofence Status
                    </button>

                    {testResult !== null && (
                      <div className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center justify-center gap-1 animate-in fade-in duration-300 ${
                        testResult === 'inside'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : 'bg-rose-50 border-rose-100 text-rose-700'
                      }`}>
                        <span>{testResult === 'inside' ? '✅ INSIDE BOUNDARY' : '❌ OUTSIDE BOUNDARY'}</span>
                        <span className="text-[10px] font-medium opacity-80">
                          ({selectedArea.area_name} Operational Region)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm">Users Registered in {selectedArea.area_name}</h3>
              {areaUsers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No customers registered in this specific area yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">User Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Location Details</th>
                        <th className="p-3">System Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaUsers.map(user => (
                        <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{user.name}</td>
                          <td className="p-3 font-mono text-slate-600">{user.phone}</td>
                          <td className="p-3 text-slate-500">{user.location}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold capitalize">
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: SHOPS & SELLERS */}
          {activeTab === 'shops' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm">Shops & Service Partners</h3>
              {areaStores.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No operational shops, restaurants, or boutiques in this area.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Store Name</th>
                        <th className="p-3">Category Type</th>
                        <th className="p-3">UPI ID</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3">Min Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaStores.map((store: any) => (
                        <tr key={store.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{store.name}</td>
                          <td className="p-3 text-slate-500 font-medium">{store.type}</td>
                          <td className="p-3 font-mono text-slate-500">{store.upiId || 'N/A'}</td>
                          <td className="p-3 font-bold text-amber-600">★ {store.rating || 'New'}</td>
                          <td className="p-3 font-mono text-slate-800 font-bold">₹{store.minOrder || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm">Area Inventory / Catalog Items</h3>
              {areaProducts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No products published under shops belonging to this area.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {areaProducts.map(prod => (
                    <div key={prod.id} className="flex gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                      <img src={prod.image} alt={prod.name} className="h-12 w-12 rounded-xl object-cover bg-slate-200" />
                      <div className="space-y-0.5 text-left flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{prod.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Category: {prod.category}</p>
                        <div className="flex justify-between items-baseline pt-1">
                          <span className="text-xs font-black font-mono text-slate-900">₹{prod.sellingPrice || prod.price}</span>
                          <span className="text-[10px] text-slate-500">Stock: {prod.stock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm">Active & Completed Sales Orders</h3>
              {areaOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No orders placed in this service area yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Store Name</th>
                        <th className="p-3">Grand Total</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaOrders.map(order => (
                        <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-700">{order.id}</td>
                          <td className="p-3 font-bold text-slate-800">{order.storeName}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">₹{order.total}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-black capitalize text-[9px] uppercase tracking-wider ${
                              order.deliveryStatus === 'arrived' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : order.deliveryStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}>
                              {order.deliveryStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: RIDERS / DELIVERY BOYS */}
          {activeTab === 'riders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm">Assigned Delivery Riders</h3>
              {areaRiders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No active delivery boys or riders mapped to this service area.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {areaRiders.map(rider => (
                    <div key={rider.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Active Agent</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{rider.name}</h4>
                        <p className="text-xs text-slate-400 font-bold font-mono">Ph: {rider.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-500 text-xs">★ 4.8 Rating</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TIMING & SLOTS */}
          {activeTab === 'timing' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Configure Timing & Delivery Slots</h3>
                <p className="text-xs text-slate-400 font-medium">Customers can select these slots during checkout. Define precise intervals to control dispatch loads.</p>
              </div>

              {/* Delivery Types Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 block tracking-wider">Enabled Delivery Channels</label>
                <div className="flex flex-wrap gap-3">
                  {['Instant', 'Scheduled', 'Free', 'Paid'].map(type => {
                    const isEnabled = (selectedArea.delivery_types || []).includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleDeliveryType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isEnabled 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {type} Delivery
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots List */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-black uppercase text-slate-400 block tracking-wider">Checkout Time Slots</label>
                
                <div className="flex flex-wrap gap-2">
                  {(selectedArea.delivery_slots || []).map((slot, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      {slot}
                      <button 
                        onClick={() => handleRemoveSlot(slot)}
                        className="text-slate-400 hover:text-rose-500 font-bold transition"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-md pt-2">
                  <input 
                    type="text" 
                    placeholder="e.g., Midnight Delivery (10:00 PM - 02:00 AM)" 
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="flex-1 bg-slate-50 border px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                  />
                  <button 
                    onClick={handleAddSlot}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    Add Slot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Service Area Promo Codes & Coupons</h3>
                <p className="text-xs text-slate-400 font-medium">Create exclusive coupons that can only be redeemed within {selectedArea.area_name}.</p>
              </div>

              {/* New Coupon Creation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Coupon Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MONSOON20" 
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full bg-white border px-3 py-1.5 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Discount Value (₹)</label>
                  <input 
                    type="number" 
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border px-3 py-1.5 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Min Order Requirement</label>
                  <input 
                    type="number" 
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border px-3 py-1.5 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <button 
                  onClick={handleAddCoupon}
                  className="py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Plus className="h-4 w-4" /> Add Code
                </button>
              </div>

              {/* Coupons List Table */}
              {areaCoupons.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No custom active coupons configured for this service area.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Coupon Code</th>
                        <th className="p-3">Instant Discount</th>
                        <th className="p-3">Min Order Needed</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaCoupons.map((coupon) => (
                        <tr key={coupon.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-indigo-600">{coupon.code}</td>
                          <td className="p-3 font-bold text-slate-800">₹{coupon.discount} Off</td>
                          <td className="p-3 text-slate-600">₹{coupon.minOrder}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => handleRemoveCoupon(coupon.id)}
                              className="p-1 hover:bg-slate-100 rounded text-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-slate-900 text-sm">Open & Resolved Support Tickets</h3>
              {areaTickets.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-400 text-xs font-medium">
                  No support tickets logged from this area.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Subject Matter</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaTickets.map(ticket => (
                        <tr key={ticket.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-500">{ticket.id}</td>
                          <td className="p-3 font-bold text-slate-800">{ticket.userName}</td>
                          <td className="p-3 text-slate-600 font-medium">{ticket.subject}</td>
                          <td className="p-3 capitalize text-slate-500">{ticket.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              ticket.status === 'resolved' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-amber-50 text-amber-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* --- ADD MODAL --- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-lg border text-left space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900">Provision New Service Area</h3>
                  <p className="text-xs text-slate-400 font-medium">All database schemas are auto-partitioned mapping this new ID.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateArea} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Area Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Maudaha West" 
                      required
                      value={newArea.area_name}
                      onChange={(e) => setNewArea({...newArea, area_name: e.target.value})}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Pincode</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 210507" 
                      required
                      value={newArea.pincode}
                      onChange={(e) => setNewArea({...newArea, pincode: e.target.value})}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">City</label>
                    <input 
                      type="text" 
                      required
                      value={newArea.city}
                      onChange={(e) => setNewArea({...newArea, city: e.target.value})}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">State</label>
                    <input 
                      type="text" 
                      value={newArea.state}
                      onChange={(e) => setNewArea({...newArea, state: e.target.value})}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-sm font-bold text-slate-800 animate-pulse"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Delivery (₹)</label>
                    <input 
                      type="number" 
                      value={newArea.delivery_charge}
                      onChange={(e) => setNewArea({...newArea, delivery_charge: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border p-2 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Free Above (₹)</label>
                    <input 
                      type="number" 
                      value={newArea.free_delivery_above}
                      onChange={(e) => setNewArea({...newArea, free_delivery_above: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border p-2 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Min Order (₹)</label>
                    <input 
                      type="number" 
                      value={newArea.minimum_order_amount}
                      onChange={(e) => setNewArea({...newArea, minimum_order_amount: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border p-2 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Speed (Mins)</label>
                    <input 
                      type="text" 
                      value={newArea.estimated_delivery_time}
                      onChange={(e) => setNewArea({...newArea, estimated_delivery_time: e.target.value})}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Max Radius (km)</label>
                    <input 
                      type="number" 
                      value={newArea.max_distance_km}
                      onChange={(e) => setNewArea({...newArea, max_distance_km: parseInt(e.target.value) || 1})}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-600 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/15"
                  >
                    Save Service Area
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
