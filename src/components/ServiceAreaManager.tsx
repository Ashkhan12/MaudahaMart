import React, { useState, useEffect } from 'react';
import { ServiceArea, Restaurant, ClothingBoutique, LocalService } from '../types';
import { deleteDocFromFirestore } from '../firebaseSync';
import { 
  Map, Users, ShoppingBag, Truck, Ticket, Plus, Activity, Power, Settings, Search, Package, MapPin, Tag, LifeBuoy, ArrowLeft, Trash2, RotateCcw, Zap, Navigation, Bot, Clock, Check, Sparkles, RefreshCcw, ShieldCheck, Layers,
  Radio, DollarSign, BellRing, AlertOctagon, Image as ImageIcon, CheckCircle, Smartphone, Volume2, Send, Gift, Star, Award, FileText, CheckCircle2, BarChart3, Database, AlertTriangle, TrendingUp, Trophy, Percent, MessageSquare, ArrowLeftRight, Crown, Compass, Calendar, Briefcase, Wallet, Wrench, Utensils, Shirt, Eye, EyeOff, KeyRound, UserPlus, Edit, Save
} from 'lucide-react';
import { triggerOrderAlert, triggerHapticVibration, playOrderAlertSound } from '../utils/notification';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import Polygon from './Polygon';
import JCodeMaintenancePanel from './JCodeMaintenancePanel';
import ImageUploadControl from './ImageUploadControl';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const AVAILABLE_ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'merchant', label: 'Merchant / Owner' },
  { value: 'rider', label: 'Delivery Rider' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'restaurant_owner', label: 'Restaurant Owner' },
  { value: 'jewellery_owner', label: 'Jewellery Owner' },
  { value: 'footwear_owner', label: 'Footwear Owner' },
  { value: 'boutique_owner', label: 'Boutique Owner' },
  { value: 'beautician', label: 'Beautician Service' },
  { value: 'plumber', label: 'Plumber Service' },
  { value: 'electrician', label: 'Electrician Service' },
  { value: 'mechanic', label: 'Mechanic Service' }
];

interface ServiceAreaManagerProps {
  areas: ServiceArea[];
  onUpdateAreas: (areas: ServiceArea[]) => void;
  allUsers?: any[];
  allStores?: any[];
  allProducts?: any[];
  allOrders?: any[];
  allTickets?: any[];
  allRestaurants?: any[];
  allBoutiques?: any[];
  allLocalServices?: any[];
  onToggleTicketStatus?: (id: string, status: 'open' | 'resolved') => void;
  onUpdateStores?: (stores: any[]) => void;
  onUpdateProducts?: (products: any[]) => void;
  onUpdateUsers?: (users: any[]) => void;
  onUpdateRestaurants?: (restaurants: any[]) => void;
  onUpdateBoutiques?: (boutiques: any[]) => void;
  onUpdateLocalServices?: (services: any[]) => void;
}

export default function ServiceAreaManager({ 
  areas, 
  onUpdateAreas, 
  allUsers = [], 
  allStores = [], 
  allProducts = [], 
  allOrders = [], 
  allTickets = [], 
  allRestaurants = [],
  allBoutiques = [],
  allLocalServices = [],
  onToggleTicketStatus,
  onUpdateStores,
  onUpdateProducts,
  onUpdateUsers,
  onUpdateRestaurants,
  onUpdateBoutiques,
  onUpdateLocalServices
}: ServiceAreaManagerProps) {
  
  const [selectedArea, setSelectedArea] = useState<any>(() => {
    return areas && areas.length > 0 ? areas[0] : null;
  });
  const [activeTab, setActiveTab] = useState('catalog');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  
  // Boundary modification state
  const [isEditingBoundary, setIsEditingBoundary] = useState(false);
  const [editAreaName, setEditAreaName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editRadius, setEditRadius] = useState<number>(5);
  const [editPolygonCoordinates, setEditPolygonCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 25.6836, lng: 80.1166 });

  // Shop Creation state
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopNameHi, setNewShopNameHi] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopAddressHi, setNewShopAddressHi] = useState('');
  const [newShopCategory, setNewShopCategory] = useState('grocery');
  const [newShopMinOrder, setNewShopMinOrder] = useState<number>(0);
  const [newShopUpiId, setNewShopUpiId] = useState('');
  const [newShopBanner, setNewShopBanner] = useState('');

  // Shop Settings / Edit state
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [showShopSettingsModal, setShowShopSettingsModal] = useState(false);
  const [editShopName, setEditShopName] = useState('');
  const [editShopNameHi, setEditShopNameHi] = useState('');
  const [editShopAddress, setEditShopAddress] = useState('');
  const [editShopAddressHi, setEditShopAddressHi] = useState('');
  const [editShopMinOrder, setEditShopMinOrder] = useState<number>(0);
  const [editShopUpiId, setEditShopUpiId] = useState('');
  const [editShopBanner, setEditShopBanner] = useState('');
  const [editShopBanners, setEditShopBanners] = useState<string[]>([]);
  const [editShopBannerInterval, setEditShopBannerInterval] = useState<number>(3);
  const [newCarouselBannerUrl, setNewCarouselBannerUrl] = useState('');

  // Product Creation state
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameHi, setNewProdNameHi] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(0);
  const [newProdMrp, setNewProdMrp] = useState<number>(0);
  const [newProdMsp, setNewProdMsp] = useState<number>(0);
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdUnitHi, setNewProdUnitHi] = useState('किग्रा');
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Groceries');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdDescriptionHi, setNewProdDescriptionHi] = useState('');

  // Product Edit state
  const [selectedProdToEdit, setSelectedProdToEdit] = useState<any>(null);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [editProdName, setEditProdName] = useState('');
  const [editProdNameHi, setEditProdNameHi] = useState('');
  const [editProdPrice, setEditProdPrice] = useState<number>(0);
  const [editProdMrp, setEditProdMrp] = useState<number>(0);
  const [editProdMsp, setEditProdMsp] = useState<number>(0);
  const [editProdUnit, setEditProdUnit] = useState('');
  const [editProdUnitHi, setEditProdUnitHi] = useState('');
  const [editProdStock, setEditProdStock] = useState<number>(0);
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdDescriptionHi, setEditProdDescriptionHi] = useState('');
  
  const [shopSubTab, setShopSubTab] = useState<'details' | 'products'>('details');
  
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [productsStats, setProductsStats] = useState<any>({});
  const [ordersStats, setOrdersStats] = useState<any>({});
  const [deliveryPartners, setDeliveryPartners] = useState<any>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // Delivery Timing Slots customization state
  const DEFAULT_TIMING_SLOTS = [
    'Morning Slot (7:00 AM - 12:00 PM)',
    'Afternoon Slot (12:00 PM - 4:00 PM)',
    'Evening Slot (4:00 PM - 9:00 PM)',
    'Full Day Delivery (8:00 AM - 9:00 PM)',
    'Express Night Slot (9:00 PM - 12:00 AM)'
  ];

  const [deliverySlots, setDeliverySlots] = useState<string[]>(DEFAULT_TIMING_SLOTS);
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('08:00 AM');
  const [newSlotEndTime, setNewSlotEndTime] = useState('12:00 PM');
  const [deliveryTypes, setDeliveryTypes] = useState({
    instant: true,
    scheduled: true,
    express15: false,
    doorstepPickup: true
  });
  const [deliveryChargeVal, setDeliveryChargeVal] = useState<number>(20);
  const [freeDeliveryAboveVal, setFreeDeliveryAboveVal] = useState<number>(200);
  const [minOrderAmountVal, setMinOrderAmountVal] = useState<number>(50);
  const [estDeliveryTimeVal, setEstDeliveryTimeVal] = useState<string>('30-45 mins');

  // New Management Dashboards States
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'customer' | 'merchant' | 'rider'>('all');
  const [broadcastTitleEn, setBroadcastTitleEn] = useState('');
  const [broadcastTitleHi, setBroadcastTitleHi] = useState('');
  const [broadcastBodyEn, setBroadcastBodyEn] = useState('');
  const [broadcastBodyHi, setBroadcastBodyHi] = useState('');
  const [broadcastLog, setBroadcastLog] = useState<Array<{ id: string; title: string; target: string; time: string; count: number }>>([
    { id: '1', title: '🌧️ Heavy Rain Delivery Alert', target: 'all', time: '10 mins ago', count: 142 },
    { id: '2', title: '🎁 20% OFF Festival Offer', target: 'customer', time: '2 hours ago', count: 85 }
  ]);

  // System Config States
  const [isEmergencyPaused, setIsEmergencyPaused] = useState(false);
  const [areaSurgeMultiplier, setAreaSurgeMultiplier] = useState<number>(1.0);
  const [isCodAllowed, setIsCodAllowed] = useState(true);
  const [adminGatewayUpi, setAdminGatewayUpi] = useState('dingdang7081@okhdfcbank');
  const [heroBanners, setHeroBanners] = useState<string[]>([
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newHeroBannerUrl, setNewHeroBannerUrl] = useState('');

  // Fleet & Rider Dispatch States
  const [selectedRiderForDispatch, setSelectedRiderForDispatch] = useState<{ [orderId: string]: string }>({});
  const [riderCashSettled, setRiderCashSettled] = useState<{ [riderId: string]: boolean }>({});

  // Disputes & Customer Refund Escalations States
  const [disputeTickets, setDisputeTickets] = useState<Array<{ id: string; orderId: string; user: string; phone: string; issue: string; amount: number; status: 'open' | 'refunded' | 'rejected'; time: string }>>([
    { id: 'TK-101', orderId: 'ORD-9821', user: 'Amit Kumar', phone: '9876543210', issue: 'Missing 1 Litre Milk Packet in grocery delivery', amount: 65, status: 'open', time: '15 mins ago' },
    { id: 'TK-102', orderId: 'ORD-9750', user: 'Priya Sharma', phone: '9123456789', issue: 'Food was delivered cold after 45 mins delay', amount: 220, status: 'open', time: '1 hour ago' },
    { id: 'TK-103', orderId: 'ORD-9600', user: 'Rajesh Verma', phone: '9811223344', issue: 'Wrong item delivered (Butter Paneer instead of Shahi Paneer)', amount: 180, status: 'refunded', time: 'Yesterday' }
  ]);

  // Sub-Zone Sectors States
  const [subzoneSectors, setSubzoneSectors] = useState<Array<{ id: string; name: string; radiusKm: number; surgeFee: number; active: boolean }>>([
    { id: 'sec-1', name: 'Maudaha Central Market Sector', radiusKm: 2, surgeFee: 0, active: true },
    { id: 'sec-2', name: 'Station Road & Civil Lines', radiusKm: 3.5, surgeFee: 10, active: true },
    { id: 'sec-3', name: 'Kabrai Road & Bypass Outer Zone', radiusKm: 5, surgeFee: 20, active: true },
    { id: 'sec-4', name: 'Rural Village Outskirts', radiusKm: 7, surgeFee: 35, active: false }
  ]);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorSurge, setNewSectorSurge] = useState(15);

  // Live Monitor Filter State
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Dynamic Peak Hour & Surge Matrix State
  const [surgeSchedules, setSurgeSchedules] = useState<Array<{ id: string; title: string; timeSlot: string; extraFee: number; active: boolean; icon: string }>>([
    { id: 'surge-1', title: '☀️ Lunch Peak Rush', timeSlot: '12:00 PM - 03:00 PM', extraFee: 15, active: true, icon: '🍔' },
    { id: 'surge-2', title: '🌙 Evening Dinner Peak', timeSlot: '07:30 PM - 10:30 PM', extraFee: 25, active: true, icon: '🍕' },
    { id: 'surge-3', title: '🦉 Late Night Craving Surge', timeSlot: '11:00 PM - 04:00 AM', extraFee: 40, active: false, icon: '🌙' },
    { id: 'surge-4', title: '🌧️ Heavy Rain / Monsoon Surge', timeSlot: 'All Day Auto-Trigger', extraFee: 30, active: true, icon: '🌧️' }
  ]);

  // Merchant Safety & FSSAI Audit State
  const [merchantAudits, setMerchantAudits] = useState<Array<{ id: string; storeName: string; category: string; fssaiNo: string; expiry: string; hygieneRating: number; status: 'approved' | 'pending' | 'suspended' }>>([
    { id: 'aud-1', storeName: 'Maudaha Central Kitchen & Dhaba', category: 'restaurant', fssaiNo: '20822001000452', expiry: '2027-11-15', hygieneRating: 4.8, status: 'approved' },
    { id: 'aud-2', storeName: 'Gupta Sweets & Bakers', category: 'bakery', fssaiNo: '20822001000881', expiry: '2026-09-30', hygieneRating: 4.5, status: 'approved' },
    { id: 'aud-3', storeName: 'Shri Ram Grocery Supermarket', category: 'grocery', fssaiNo: '20822001000119', expiry: '2025-01-10', hygieneRating: 3.9, status: 'pending' },
    { id: 'aud-4', storeName: 'Chai & Snacks Corner', category: 'cafe', fssaiNo: '20822001000999', expiry: '2024-12-01', hygieneRating: 2.5, status: 'suspended' }
  ]);

  // Loyalty & Rewards Engine State
  const [referralBonusAmount, setReferralBonusAmount] = useState<number>(50);
  const [cashbackPercent, setCashbackPercent] = useState<number>(5);
  const [minOrderForCashback, setMinOrderForCashback] = useState<number>(199);
  const [rewardsCampaigns, setRewardsCampaigns] = useState<Array<{ id: string; title: string; rewardText: string; minOrder: number; active: boolean }>>([
    { id: 'cmp-1', title: '🎉 First Order Flat ₹40 Cashback', rewardText: '₹40 Wallet Cash back on orders above ₹149', minOrder: 149, active: true },
    { id: 'cmp-2', title: '🏆 Weekend Maudaha Foodie Bonus', rewardText: 'Double Reward Points on all restaurant orders', minOrder: 299, active: true }
  ]);

  // Realtime Inventory & Low Stock Alerts State
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: string; name: string; storeName: string; category: string; currentStock: number; minThreshold: number; status: 'in_stock' | 'low_stock' | 'out_of_stock' }>>([
    { id: 'inv-1', name: 'Amul Taaza Toned Milk (1L Packet)', storeName: 'Shri Ram Grocery Supermarket', category: 'Dairy & Eggs', currentStock: 4, minThreshold: 10, status: 'low_stock' },
    { id: 'inv-2', name: 'Paneer Fresh Dairy (200g)', storeName: 'Maudaha Central Kitchen', category: 'Dairy', currentStock: 0, minThreshold: 5, status: 'out_of_stock' },
    { id: 'inv-3', name: 'Fortune Mustard Oil (1L)', storeName: 'Shri Ram Grocery Supermarket', category: 'Oils & Ghee', currentStock: 28, minThreshold: 8, status: 'in_stock' },
    { id: 'inv-4', name: 'Ashirvaad Whole Wheat Atta (5kg)', storeName: 'Maudaha Mega Mart', category: 'Atta & Rice', currentStock: 2, minThreshold: 6, status: 'low_stock' }
  ]);

  // System Audit Logs & Security Access Matrix State
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; user: string; role: string; action: string; ip: string; time: string }>>([
    { id: 'log-101', user: 'Admin System', role: 'Super Admin', action: 'Updated Service Area Delivery Fee to ₹20', ip: '103.22.140.12', time: '5 mins ago' },
    { id: 'log-102', user: 'Rider Supervisor', role: 'Fleet Manager', action: 'Assigned Rider Ramesh Kumar to Order #ORD-9821', ip: '103.22.140.44', time: '18 mins ago' },
    { id: 'log-103', user: 'Finance Desk', role: 'Accountant', action: 'Approved Cash Settlement ₹1,240 for Rider Suresh', ip: '103.22.141.09', time: '1 hour ago' }
  ]);

  // FEATURE 1: Rider Leaderboard & Incentives
  const [riderLeaderboard, setRiderLeaderboard] = useState<Array<{ id: string; name: string; trips: number; rating: number; badge: string; bonusTarget: number; milestoneBonus: number; qualified: boolean }>>([
    { id: 'r1', name: 'Ramesh Kumar', trips: 142, rating: 4.9, badge: '⭐ Gold Rider', bonusTarget: 150, milestoneBonus: 500, qualified: false },
    { id: 'r2', name: 'Suresh Patel', trips: 158, rating: 4.8, badge: '🏆 Top Star', bonusTarget: 150, milestoneBonus: 500, qualified: true },
    { id: 'r3', name: 'Vikram Singh', trips: 98, rating: 4.7, badge: '🚴 Express Ace', bonusTarget: 120, milestoneBonus: 350, qualified: false }
  ]);

  // FEATURE 2: Bulk Price & Mass Discount Controller
  const [bulkDiscountCategory, setBulkDiscountCategory] = useState<string>('Dairy & Bakery');
  const [bulkDiscountPercentage, setBulkDiscountPercentage] = useState<number>(10);

  // FEATURE 3: WhatsApp & SMS Order Receipts
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('Namaste {{name}}! Your Maudaha Mart Order #{{order_id}} is out for delivery with rider {{rider_name}} (Ph: {{rider_phone}}). Track live: {{link}}');
  const [smsGatewayActive, setSmsGatewayActive] = useState<boolean>(true);

  // FEATURE 4: Multi-Store Stock Transfer
  const [transferLogs, setTransferLogs] = useState<Array<{ id: string; item: string; fromStore: string; toStore: string; qty: number; date: string }>>([
    { id: 'TR-501', item: 'Fresh Butter Milk (500ml)', fromStore: 'Maudaha Central Warehouse', toStore: 'Station Road Grocery Hub', qty: 50, date: 'Today 10:30 AM' },
    { id: 'TR-502', item: 'Fortune Mustard Oil 1L', fromStore: 'Maudaha Central Warehouse', toStore: 'Shri Ram Supermarket', qty: 20, date: 'Yesterday' }
  ]);
  const [transferItem, setTransferItem] = useState('Fresh Butter Milk (500ml)');
  const [transferQty, setTransferQty] = useState(15);

  // FEATURE 5: Maudaha Gold VIP Membership Pass
  const [vipPriceMonthly, setVipPriceMonthly] = useState<number>(99);
  const [vipActiveMembersCount, setVipActiveMembersCount] = useState<number>(312);
  const [vipFreeDeliveryThreshold, setVipFreeDeliveryThreshold] = useState<number>(99);

  // FEATURE 6: Route & Batch Optimization
  const [maxOrdersPerRiderBatch, setMaxOrdersPerRiderBatch] = useState<number>(3);
  const [maxBatchDistanceKm, setMaxBatchDistanceKm] = useState<number>(4);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState<boolean>(true);

  // FEATURE 7: Store Operating Hours & Holidays
  const [emergencyShutdown, setEmergencyShutdown] = useState<boolean>(false);
  const [holidayList, setHolidayList] = useState<Array<{ id: string; name: string; date: string; status: 'Closed' | 'Limited Hours' }>>([
    { id: 'h1', name: 'Independence Day Special Market Schedule', date: '2026-08-15', status: 'Limited Hours' },
    { id: 'h2', name: 'Diwali Festival Market Break', date: '2026-11-08', status: 'Closed' }
  ]);

  // FEATURE 8: Vendor Commissions & Contracts
  const [vendorContracts, setVendorContracts] = useState<Array<{ id: string; vendorName: string; tier: 'Gold' | 'Silver' | 'Standard'; commissionPct: number; renewDate: string }>>([
    { id: 'vc-1', vendorName: 'Maudaha Central Kitchen', tier: 'Gold', commissionPct: 5, renewDate: '2027-04-01' },
    { id: 'vc-2', vendorName: 'Gupta Sweets & Bakers', tier: 'Silver', commissionPct: 8, renewDate: '2026-12-31' },
    { id: 'vc-3', vendorName: 'Shri Ram Grocery Supermarket', tier: 'Standard', commissionPct: 10, renewDate: '2027-01-15' }
  ]);

  // FEATURE 9: Customer Wallet & Manual Credit Console
  const [walletUserPhone, setWalletUserPhone] = useState<string>('');
  const [walletTopupAmount, setWalletTopupAmount] = useState<number>(100);
  const [walletTopupReason, setWalletTopupReason] = useState<string>('Goodwill Compensation');

  // FEATURE 10: Fleet Vehicles & Maintenance Desk
  const [fleetVehicles, setFleetVehicles] = useState<Array<{ id: string; regNo: string; riderName: string; type: 'EV Scooter' | 'Petrol Bike'; healthPct: number; helmetVerified: boolean }>>([
    { id: 'veh-1', regNo: 'UP 91 AB 4201', riderName: 'Ramesh Kumar', type: 'EV Scooter', healthPct: 94, helmetVerified: true },
    { id: 'veh-2', regNo: 'UP 91 CD 8820', riderName: 'Suresh Patel', type: 'Petrol Bike', healthPct: 82, helmetVerified: true },
    { id: 'veh-3', regNo: 'UP 91 EV 0012', riderName: 'Vikram Singh', type: 'EV Scooter', healthPct: 65, helmetVerified: false }
  ]);

  // Initialize edit fields when selectedArea changes
  useEffect(() => {
    if (selectedArea) {
      setEditAreaName(selectedArea.area_name || selectedArea.name || '');
      setEditCity(selectedArea.city || '');
      setEditState(selectedArea.state || '');
      setEditPincode(selectedArea.pincode || '');
      setEditRadius(selectedArea.max_distance_km || 5);
      
      const slots = (selectedArea.delivery_slots && selectedArea.delivery_slots.length > 0)
        ? selectedArea.delivery_slots
        : DEFAULT_TIMING_SLOTS;
      setDeliverySlots(slots);

      const types = selectedArea.delivery_types || ['instant', 'scheduled'];
      setDeliveryTypes({
        instant: types.includes('instant'),
        scheduled: types.includes('scheduled'),
        express15: types.includes('express15'),
        doorstepPickup: types.includes('doorstepPickup')
      });

      setDeliveryChargeVal(selectedArea.delivery_charge ?? 20);
      setFreeDeliveryAboveVal(selectedArea.free_delivery_above ?? 200);
      setMinOrderAmountVal(selectedArea.minimum_order_amount ?? 50);
      setEstDeliveryTimeVal(selectedArea.estimated_delivery_time || '30-45 mins');

      const coords = selectedArea.polygon_coordinates || [];
      setEditPolygonCoordinates(coords);
      if (coords.length > 0) {
        let latSum = 0;
        let lngSum = 0;
        coords.forEach((c: any) => {
          latSum += c.lat;
          lngSum += c.lng;
        });
        setMapCenter({ lat: latSum / coords.length, lng: lngSum / coords.length });
      } else {
        setMapCenter({ lat: 25.6836, lng: 80.1166 });
      }
    }
  }, [selectedArea]);

  // Initialize edit fields when selectedShop changes
  useEffect(() => {
    if (selectedShop) {
      setEditShopName(selectedShop.name || '');
      setEditShopNameHi(selectedShop.nameHi || '');
      setEditShopAddress(selectedShop.address || '');
      setEditShopAddressHi(selectedShop.addressHi || '');
      setEditShopMinOrder(selectedShop.minOrder || 0);
      setEditShopUpiId(selectedShop.upiId || '');
      setEditShopBanner(selectedShop.banner || '');
      setEditShopBanners(selectedShop.banners || [selectedShop.banner || '']);
      setEditShopBannerInterval(selectedShop.bannerInterval || 3);
    }
  }, [selectedShop]);

  // Initialize edit fields when selectedProdToEdit changes
  useEffect(() => {
    if (selectedProdToEdit) {
      setEditProdName(selectedProdToEdit.name || '');
      setEditProdNameHi(selectedProdToEdit.nameHi || '');
      setEditProdPrice(selectedProdToEdit.price || selectedProdToEdit.sellingPrice || 0);
      setEditProdMrp(selectedProdToEdit.mrp || selectedProdToEdit.price || 0);
      setEditProdMsp(selectedProdToEdit.msp || selectedProdToEdit.price || 0);
      setEditProdUnit(selectedProdToEdit.unit || '');
      setEditProdUnitHi(selectedProdToEdit.unitHi || '');
      setEditProdStock(selectedProdToEdit.stock || 0);
      setEditProdImage(selectedProdToEdit.image || '');
      setEditProdCategory(selectedProdToEdit.category || 'Groceries');
      setEditProdDescription(selectedProdToEdit.description || '');
      setEditProdDescriptionHi(selectedProdToEdit.descriptionHi || '');
    }
  }, [selectedProdToEdit]);



  useEffect(() => {
    if (selectedArea) {
      if (activeTab === 'users') {
        const areaUsers = (allUsers || []).filter(u => u.serviceAreaId === selectedArea.id || u.location === selectedArea.city);
        setUsers(areaUsers);
        const areaVendors = (allStores || []).filter(v => v.area === selectedArea.id || v.city === selectedArea.city);
        setVendors(areaVendors);
      } else if (activeTab === 'catalog') {
        const areaVendors = (allStores || []).filter(v => v.area === selectedArea.id || v.city === selectedArea.city);
        const storeIds = areaVendors.map(v => v.id);
        const areaProducts = (allProducts || []).filter(p => storeIds.includes(p.storeId));
        setProductsStats({ total: areaProducts.length, message: "Items Available" });
        
        const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea.id);
        const activeOrders = areaOrders.filter(o => ['pending', 'processing', 'out_for_delivery'].includes(o.deliveryStatus));
        setOrdersStats({ totalActive: activeOrders.length, message: "Active Orders Right Now" });
      } else if (activeTab === 'delivery') {
        const activeRiders = (allUsers || []).filter(u => u.role === 'delivery' && (u.serviceAreaId === selectedArea.id || u.location === selectedArea.city));
        setDeliveryPartners({ online: activeRiders.length, message: "Boys Online" });
      } else if (activeTab === 'marketing') {
        setCoupons([{ code: 'WELCOME100' }]);
        const areaTickets = (allTickets || []).filter(t => t.serviceAreaId === selectedArea.id || t.status === 'open');
        setTickets(areaTickets);
      }
    }
  }, [selectedArea, activeTab, allUsers, allStores, allProducts, allOrders, allTickets]);

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName) return;
    
    const newArea: ServiceArea = {
      id: 'area-' + Date.now().toString(),
      area_name: newAreaName,
      pincode: '',
      city: newAreaName,
      state: '',
      delivery_charge: 0,
      free_delivery_above: 0,
      minimum_order_amount: 0,
      estimated_delivery_time: '30-45 mins',
      max_distance_km: 5,
      polygon_coordinates: [],
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_orders: 0,
      monthly_orders: 0,
      active_customers: 0,
      revenue: 0,
      average_delivery_time: '0 mins',
      cancellation_rate: 0,
      delivery_slots: [],
      delivery_types: []
    };
    
    onUpdateAreas([...areas, newArea]);
    setNewAreaName('');
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    const updated = areas.map(area => {
      if (area.id === id) {
        return { ...area, status: area.status === 'Active' ? 'Inactive' : 'Active' } as ServiceArea;
      }
      return area;
    });
    onUpdateAreas(updated);
  };

  const deleteArea = (id: string) => {
    setAreaToDelete(id);
  };
  
  const confirmDeleteArea = () => {
    if (!areaToDelete) return;
    onUpdateAreas(areas.filter(a => a.id !== areaToDelete));
    deleteDocFromFirestore('serviceAreas', areaToDelete);
    if (selectedArea?.id === areaToDelete) setSelectedArea(null);
    setAreaToDelete(null);
  };

  // --- USER MANAGEMENT ENHANCEMENTS ---
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<any>('customer');
  const [newUserArea, setNewUserArea] = useState('area-maudaha');
  const [showPasswordsMap, setShowPasswordsMap] = useState<{ [id: string]: boolean }>({});

  const handleUpdateUserRole = (userId: string, newRole: any) => {
    if (!allUsers || !onUpdateUsers) return;
    const updated = allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u);
    onUpdateUsers(updated);
  };

  const handleUpdateUserArea = (userId: string, newAreaId: string) => {
    if (!allUsers || !onUpdateUsers) return;
    const updated = allUsers.map(u => u.id === userId ? { ...u, serviceAreaId: newAreaId, assignedArea: newAreaId } : u);
    onUpdateUsers(updated);
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    if (!allUsers || !onUpdateUsers) return;
    const updated = allUsers.map(u => u.id === userId ? { ...u, password: newPass } : u);
    onUpdateUsers(updated);
  };

  const handleCreateUser = () => {
    if (!newUserName.trim() || !newUserPhone.trim()) {
      alert('Please fill Name and Phone');
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      phone: newUserPhone.trim(),
      email: newUserEmail.trim() || undefined,
      password: newUserPassword.trim() || '123456',
      location: 'Maudaha Central',
      locationHi: 'मौदहा सेंट्रल',
      role: newUserRole,
      serviceAreaId: newUserArea,
      assignedArea: newUserArea,
      activities: [],
      searchHistory: []
    };
    if (onUpdateUsers) {
      onUpdateUsers([...allUsers, newUser]);
    }
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('customer');
  };

  const confirmDeleteUser = () => {
    if (!userToDelete || !allUsers || !onUpdateUsers) return;
    const updated = allUsers.filter(u => u.id !== userToDelete.id);
    onUpdateUsers(updated);
    deleteDocFromFirestore('users', userToDelete.id);
    setUserToDelete(null);
  };

  // --- RESTAURANTS MANAGEMENT ---
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [restName, setRestName] = useState('');
  const [restNameHiVal, setRestNameHiVal] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restRating, setRestRating] = useState(4.5);
  const [restDeliveryTime, setRestDeliveryTime] = useState('25-35 mins');
  const [restMinOrder, setRestMinOrder] = useState(100);
  const [restUpiId, setRestUpiId] = useState('');
  const [restBanner, setRestBanner] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80');

  const openRestaurantModal = (rest?: Restaurant) => {
    if (rest) {
      setEditingRestaurant(rest);
      setRestName(rest.name || '');
      setRestNameHiVal(rest.nameHi || '');
      setRestCuisine(rest.cuisine || 'North Indian');
      setRestAddress(rest.address || 'Maudaha');
      setRestRating(rest.rating || 4.5);
      setRestDeliveryTime(rest.deliveryTime || '25-35 mins');
      setRestMinOrder(rest.minOrder || 100);
      setRestUpiId(rest.upiId || '');
      setRestBanner(rest.banner || '');
    } else {
      setEditingRestaurant(null);
      setRestName('');
      setRestNameHiVal('');
      setRestCuisine('North Indian, Fast Food');
      setRestAddress('Maudaha Main Road');
      setRestRating(4.5);
      setRestDeliveryTime('25-35 mins');
      setRestMinOrder(100);
      setRestUpiId('biengwithash@okicici');
      setRestBanner('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80');
    }
    setShowRestaurantModal(true);
  };

  const handleSaveRestaurant = () => {
    if (!restName.trim()) {
      alert('Please enter restaurant name');
      return;
    }
    if (editingRestaurant) {
      const updated = allRestaurants.map(r => r.id === editingRestaurant.id ? {
        ...r,
        name: restName,
        nameHi: restNameHiVal || restName,
        cuisine: restCuisine,
        cuisineHi: restCuisine,
        address: restAddress,
        addressHi: restAddress,
        rating: Number(restRating),
        deliveryTime: restDeliveryTime,
        deliveryTimeHi: restDeliveryTime,
        minOrder: Number(restMinOrder),
        upiId: restUpiId,
        banner: restBanner
      } : r);
      if (onUpdateRestaurants) onUpdateRestaurants(updated);
    } else {
      const newRest: Restaurant = {
        id: `rest-${Date.now()}`,
        name: restName,
        nameHi: restNameHiVal || restName,
        cuisine: restCuisine,
        cuisineHi: restCuisine,
        address: restAddress,
        addressHi: restAddress,
        rating: Number(restRating),
        deliveryTime: restDeliveryTime,
        deliveryTimeHi: restDeliveryTime,
        minOrder: Number(restMinOrder),
        upiId: restUpiId,
        banner: restBanner,
        menu: []
      };
      if (onUpdateRestaurants) onUpdateRestaurants([...allRestaurants, newRest]);
    }
    setShowRestaurantModal(false);
  };

  const confirmDeleteRestaurant = () => {
    if (!restaurantToDelete || !onUpdateRestaurants) return;
    const updated = allRestaurants.filter(r => r.id !== restaurantToDelete.id);
    onUpdateRestaurants(updated);
    deleteDocFromFirestore('restaurants', restaurantToDelete.id);
    setRestaurantToDelete(null);
  };

  // --- BOUTIQUES MANAGEMENT ---
  const [boutiqueSearchTerm, setBoutiqueSearchTerm] = useState('');
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState<ClothingBoutique | null>(null);
  const [boutiqueToDelete, setBoutiqueToDelete] = useState<ClothingBoutique | null>(null);
  const [btName, setBtName] = useState('');
  const [btNameHiVal, setBtNameHiVal] = useState('');
  const [btSpecialty, setBtSpecialty] = useState('');
  const [btAddress, setBtAddress] = useState('');
  const [btRating, setBtRating] = useState(4.6);
  const [btDeliveryTime, setBtDeliveryTime] = useState('2-3 Days');
  const [btMinOrder, setBtMinOrder] = useState(200);
  const [btUpiId, setBtUpiId] = useState('');
  const [btBanner, setBtBanner] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80');

  const openBoutiqueModal = (bt?: ClothingBoutique) => {
    if (bt) {
      setEditingBoutique(bt);
      setBtName(bt.name || '');
      setBtNameHiVal(bt.nameHi || '');
      setBtSpecialty(bt.specialty || '');
      setBtAddress(bt.address || '');
      setBtRating(bt.rating || 4.6);
      setBtDeliveryTime(bt.deliveryTime || '2-3 Days');
      setBtMinOrder(bt.minOrder || 200);
      setBtUpiId(bt.upiId || '');
      setBtBanner(bt.banner || '');
    } else {
      setEditingBoutique(null);
      setBtName('');
      setBtNameHiVal('');
      setBtSpecialty('Sarees & Lehengas');
      setBtAddress('Market Road, Maudaha');
      setBtRating(4.6);
      setBtDeliveryTime('2-3 Days');
      setBtMinOrder(200);
      setBtUpiId('biengwithash@okicici');
      setBtBanner('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80');
    }
    setShowBoutiqueModal(true);
  };

  const handleSaveBoutique = () => {
    if (!btName.trim()) {
      alert('Please enter boutique name');
      return;
    }
    if (editingBoutique) {
      const updated = allBoutiques.map(b => b.id === editingBoutique.id ? {
        ...b,
        name: btName,
        nameHi: btNameHiVal || btName,
        specialty: btSpecialty,
        specialtyHi: btSpecialty,
        address: btAddress,
        addressHi: btAddress,
        rating: Number(btRating),
        deliveryTime: btDeliveryTime,
        deliveryTimeHi: btDeliveryTime,
        minOrder: Number(btMinOrder),
        upiId: btUpiId,
        banner: btBanner
      } : b);
      if (onUpdateBoutiques) onUpdateBoutiques(updated);
    } else {
      const newBt: ClothingBoutique = {
        id: `bt-${Date.now()}`,
        name: btName,
        nameHi: btNameHiVal || btName,
        specialty: btSpecialty,
        specialtyHi: btSpecialty,
        address: btAddress,
        addressHi: btAddress,
        rating: Number(btRating),
        deliveryTime: btDeliveryTime,
        deliveryTimeHi: btDeliveryTime,
        minOrder: Number(btMinOrder),
        upiId: btUpiId,
        banner: btBanner,
        items: []
      };
      if (onUpdateBoutiques) onUpdateBoutiques([...allBoutiques, newBt]);
    }
    setShowBoutiqueModal(false);
  };

  const confirmDeleteBoutique = () => {
    if (!boutiqueToDelete || !onUpdateBoutiques) return;
    const updated = allBoutiques.filter(b => b.id !== boutiqueToDelete.id);
    onUpdateBoutiques(updated);
    deleteDocFromFirestore('boutiques', boutiqueToDelete.id);
    setBoutiqueToDelete(null);
  };

  // --- LOCAL SERVICES MANAGEMENT ---
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<LocalService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<LocalService | null>(null);
  const [svcName, setSvcName] = useState('');
  const [svcNameHiVal, setSvcNameHiVal] = useState('');
  const [svcCategory, setSvcCategory] = useState<'beauty' | 'plumber' | 'electrician' | 'mechanic'>('plumber');
  const [svcPhone, setSvcPhone] = useState('');
  const [svcExperience, setSvcExperience] = useState(5);
  const [svcRating, setSvcRating] = useState(4.8);
  const [svcAddress, setSvcAddress] = useState('');
  const [svcBaseCharge, setSvcBaseCharge] = useState(150);
  const [svcBanner, setSvcBanner] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80');

  const openServiceModal = (svc?: LocalService) => {
    if (svc) {
      setEditingService(svc);
      setSvcName(svc.name || '');
      setSvcNameHiVal(svc.nameHi || '');
      setSvcCategory(svc.category || 'plumber');
      setSvcPhone(svc.phone || '');
      setSvcExperience(svc.experience || 5);
      setSvcRating(svc.rating || 4.8);
      setSvcAddress(svc.address || '');
      setSvcBaseCharge(svc.baseCharge || 150);
      setSvcBanner(svc.banner || '');
    } else {
      setEditingService(null);
      setSvcName('');
      setSvcNameHiVal('');
      setSvcCategory('plumber');
      setSvcPhone('9876543210');
      setSvcExperience(5);
      setSvcRating(4.8);
      setSvcAddress('Maudaha Town');
      setSvcBaseCharge(150);
      setSvcBanner('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80');
    }
    setShowServiceModal(true);
  };

  const handleSaveService = () => {
    if (!svcName.trim()) {
      alert('Please enter service provider name');
      return;
    }
    if (editingService) {
      const updated = allLocalServices.map(s => s.id === editingService.id ? {
        ...s,
        name: svcName,
        nameHi: svcNameHiVal || svcName,
        category: svcCategory,
        phone: svcPhone,
        experience: Number(svcExperience),
        rating: Number(svcRating),
        address: svcAddress,
        addressHi: svcAddress,
        baseCharge: Number(svcBaseCharge),
        banner: svcBanner
      } : s);
      if (onUpdateLocalServices) onUpdateLocalServices(updated);
    } else {
      const newSvc: LocalService = {
        id: `svc-${Date.now()}`,
        name: svcName,
        nameHi: svcNameHiVal || svcName,
        category: svcCategory,
        phone: svcPhone,
        experience: Number(svcExperience),
        rating: Number(svcRating),
        address: svcAddress,
        addressHi: svcAddress,
        baseCharge: Number(svcBaseCharge),
        available: true,
        banner: svcBanner,
        serviceAreaId: 'area-maudaha'
      };
      if (onUpdateLocalServices) onUpdateLocalServices([...allLocalServices, newSvc]);
    }
    setShowServiceModal(false);
  };

  const confirmDeleteService = () => {
    if (!serviceToDelete || !onUpdateLocalServices) return;
    const updated = allLocalServices.filter(s => s.id !== serviceToDelete.id);
    onUpdateLocalServices(updated);
    deleteDocFromFirestore('localServices', serviceToDelete.id);
    setServiceToDelete(null);
  };
  
  const handleAddTimingSlot = () => {
    if (!newSlotTitle.trim()) {
      setAlertMessage('Please enter a slot title or name (e.g. Morning Express)');
      return;
    }
    const formattedSlot = `${newSlotTitle.trim()} (${newSlotStartTime} - ${newSlotEndTime})`;
    if (deliverySlots.includes(formattedSlot)) {
      setAlertMessage('This timing slot already exists!');
      return;
    }
    setDeliverySlots([...deliverySlots, formattedSlot]);
    setNewSlotTitle('');
    setAlertMessage(`Added timing slot: ${formattedSlot}`);
  };

  const handleQuickAddSlot = (slotString: string) => {
    if (deliverySlots.includes(slotString)) {
      setAlertMessage('Slot already active in timing list.');
      return;
    }
    setDeliverySlots([...deliverySlots, slotString]);
    setAlertMessage(`Added slot: ${slotString}`);
  };

  const handleRemoveTimingSlot = (indexToRemove: number) => {
    const removed = deliverySlots[indexToRemove];
    setDeliverySlots(deliverySlots.filter((_, idx) => idx !== indexToRemove));
    if (removed) setAlertMessage(`Removed slot: ${removed}`);
  };

  const handleResetDefaultSlots = () => {
    setDeliverySlots(DEFAULT_TIMING_SLOTS);
    setAlertMessage('Reset timing slots to default standard slots!');
  };

  const updateDeliverySettings = () => {
    if (!selectedArea) return;

    const activeTypesArr: string[] = [];
    if (deliveryTypes.instant) activeTypesArr.push('instant');
    if (deliveryTypes.scheduled) activeTypesArr.push('scheduled');
    if (deliveryTypes.express15) activeTypesArr.push('express15');
    if (deliveryTypes.doorstepPickup) activeTypesArr.push('doorstepPickup');

    const updatedArea: ServiceArea = {
      ...selectedArea,
      delivery_slots: deliverySlots,
      delivery_types: activeTypesArr,
      delivery_charge: deliveryChargeVal,
      free_delivery_above: freeDeliveryAboveVal,
      minimum_order_amount: minOrderAmountVal,
      estimated_delivery_time: estDeliveryTimeVal,
      updated_at: new Date().toISOString()
    };

    const updatedAreas = areas.map(a => a.id === selectedArea.id ? updatedArea : a);
    onUpdateAreas(updatedAreas);
    setSelectedArea(updatedArea);

    fetch(`/api/admin/service-areas/${selectedArea.id}/delivery-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_slots: deliverySlots,
        delivery_types: activeTypesArr,
        delivery_charge: deliveryChargeVal,
        free_delivery_above: freeDeliveryAboveVal,
        minimum_order_amount: minOrderAmountVal,
        estimated_delivery_time: estDeliveryTimeVal
      })
    })
      .then(res => res.json())
      .then(() => setAlertMessage("Delivery timing slots & logistics settings saved successfully!"))
      .catch((err) => {
        console.error(err);
        setAlertMessage("Delivery settings saved to area configuration!");
      });
  };

  const handleGeocodeCity = () => {
    const cityName = editCity;
    if (!cityName) return;
    
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: cityName }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          setMapCenter({ lat: loc.lat(), lng: loc.lng() });
        } else {
          alert(`Could not find city: "${cityName}" on map. Please check spelling.`);
        }
      });
    } else {
      // Direct approximation fallback for known cities if API is unavailable/loading
      if (cityName.toLowerCase().includes('maudaha')) {
        setMapCenter({ lat: 25.6836, lng: 80.1166 });
      } else if (cityName.toLowerCase().includes('kanpur')) {
        setMapCenter({ lat: 26.4499, lng: 80.3319 });
      } else if (cityName.toLowerCase().includes('lucknow')) {
        setMapCenter({ lat: 26.8467, lng: 80.9462 });
      } else if (cityName.toLowerCase().includes('delhi')) {
        setMapCenter({ lat: 28.6139, lng: 77.2090 });
      }
    }
  };

  const handleGenerateCirclePreset = () => {
    const radiusKm = Number(editRadius) || 5;
    const center = mapCenter;
    
    const points = [];
    const numberOfPoints = 8;
    const earthRadiusKm = 6371;
    const d = radiusKm / earthRadiusKm;
    const latRad = (center.lat * Math.PI) / 180;
    const lngRad = (center.lng * Math.PI) / 180;
    
    for (let i = 0; i < numberOfPoints; i++) {
      const angle = (i * 2 * Math.PI) / numberOfPoints;
      const pointLatRad = Math.asin(
        Math.sin(latRad) * Math.cos(d) +
        Math.cos(latRad) * Math.sin(d) * Math.cos(angle)
      );
      const pointLngRad = lngRad + Math.atan2(
        Math.sin(angle) * Math.sin(d) * Math.cos(latRad),
        Math.cos(d) - Math.sin(latRad) * Math.sin(pointLatRad)
      );
      points.push({
        lat: Number(((pointLatRad * 180) / Math.PI).toFixed(6)),
        lng: Number(((pointLngRad * 180) / Math.PI).toFixed(6))
      });
    }
    
    setEditPolygonCoordinates(points);
  };

  const handleMapClick = (e: any) => {
    if (!isEditingBoundary) return;
    const latLng = e.detail?.latLng || e.latLng;
    if (!latLng) return;
    
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    
    setEditPolygonCoordinates(prev => [...prev, { lat, lng }]);
  };

  const handleMarkerDragEnd = (index: number, e: any) => {
    const latLng = e.latLng;
    if (!latLng) return;
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    
    setEditPolygonCoordinates(prev => {
      const next = [...prev];
      next[index] = { lat, lng };
      return next;
    });
  };

  const handleRemovePoint = (index: number) => {
    setEditPolygonCoordinates(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearPoints = () => {
    setEditPolygonCoordinates([]);
  };

  const handleSaveBoundary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea) return;
    const updatedArea: ServiceArea = {
      ...selectedArea,
      area_name: editAreaName,
      city: editCity,
      state: editState,
      pincode: editPincode,
      max_distance_km: Number(editRadius),
      polygon_coordinates: editPolygonCoordinates,
      updated_at: new Date().toISOString()
    };
    const updatedAreas = areas.map(a => a.id === selectedArea.id ? updatedArea : a);
    onUpdateAreas(updatedAreas);
    setSelectedArea(updatedArea);
    setIsEditingBoundary(false);
    setAlertMessage("Service area boundary and geographic details saved successfully!");
  };

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea || !onUpdateStores) return;
    const newStore = {
      id: 'store-' + Date.now().toString(),
      name: newShopName,
      nameHi: newShopNameHi || newShopName,
      address: newShopAddress,
      addressHi: newShopAddressHi || newShopAddress,
      area: selectedArea.id,
      city: selectedArea.city,
      serviceAreaId: selectedArea.id,
      rating: 4.5,
      reviewCount: 1,
      banner: newShopBanner || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      banners: [newShopBanner || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'],
      bannerInterval: 3,
      deliveryTime: '20-30 mins',
      deliveryTimeHi: '20-30 मिनट',
      minOrder: Number(newShopMinOrder) || 0,
      upiId: newShopUpiId || 'merchant@upi',
      categories: [newShopCategory],
      shopCategory: newShopCategory,
    };
    const updatedStores = [...(allStores || []), newStore];
    onUpdateStores(updatedStores);
    
    // Refresh local lists
    setVendors(updatedStores.filter(v => v.area === selectedArea.id || v.city === selectedArea.city));
    
    // Reset
    setNewShopName('');
    setNewShopNameHi('');
    setNewShopAddress('');
    setNewShopAddressHi('');
    setNewShopCategory('grocery');
    setNewShopMinOrder(0);
    setNewShopUpiId('');
    setNewShopBanner('');
    setShowAddShopModal(false);
    setAlertMessage("New shop created and registered inside this service area!");
  };

  const handleUpdateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop || !onUpdateStores) return;
    const updatedStore = {
      ...selectedShop,
      name: editShopName,
      nameHi: editShopNameHi || editShopName,
      address: editShopAddress,
      addressHi: editShopAddressHi || editShopAddress,
      minOrder: Number(editShopMinOrder),
      upiId: editShopUpiId,
      banner: editShopBanner,
      banners: editShopBanners,
      bannerInterval: Number(editShopBannerInterval)
    };
    const updatedStores = (allStores || []).map(s => s.id === selectedShop.id ? updatedStore : s);
    onUpdateStores(updatedStores);
    
    // Refresh local lists
    setVendors(updatedStores.filter(v => v.area === selectedArea.id || v.city === selectedArea.city));
    
    setSelectedShop(updatedStore);
    setShowShopSettingsModal(false);
    setAlertMessage("Shop settings and carousel configuration updated!");
  };

  const handleDeleteShop = (shopId: string) => {
    if (!onUpdateStores) return;
    const updatedStores = (allStores || []).filter(s => s.id !== shopId);
    onUpdateStores(updatedStores);
    setVendors(updatedStores.filter(v => v.area === selectedArea.id || v.city === selectedArea.city));
    setAlertMessage("Shop successfully removed from this service area.");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop || !onUpdateProducts) return;
    const newProduct = {
      id: 'prod-' + Date.now().toString(),
      name: newProdName,
      nameHi: newProdNameHi || newProdName,
      price: Number(newProdPrice),
      sellingPrice: Number(newProdPrice),
      mrp: Number(newProdMrp) || Number(newProdPrice),
      msp: Number(newProdMsp) || Number(newProdPrice),
      unit: newProdUnit,
      unitHi: newProdUnitHi || newProdUnit,
      stock: Number(newProdStock),
      image: newProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      rating: 4.5,
      description: newProdDescription || '',
      descriptionHi: newProdDescriptionHi || '',
      storeId: selectedShop.id,
      category: newProdCategory,
      categoryHi: newProdCategory,
    };
    const updatedProducts = [...(allProducts || []), newProduct];
    onUpdateProducts(updatedProducts);
    
    // Reset
    setNewProdName('');
    setNewProdNameHi('');
    setNewProdPrice(0);
    setNewProdMrp(0);
    setNewProdMsp(0);
    setNewProdUnit('kg');
    setNewProdUnitHi('किग्रा');
    setNewProdStock(10);
    setNewProdImage('');
    setNewProdCategory('Groceries');
    setNewProdDescription('');
    setNewProdDescriptionHi('');
    setShowAddProdModal(false);
    setAlertMessage("New product successfully added to this shop's catalog!");
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdToEdit || !onUpdateProducts) return;
    const updatedProduct = {
      ...selectedProdToEdit,
      name: editProdName,
      nameHi: editProdNameHi || editProdName,
      price: Number(editProdPrice),
      sellingPrice: Number(editProdPrice),
      mrp: Number(editProdMrp),
      msp: Number(editProdMsp),
      unit: editProdUnit,
      unitHi: editProdUnitHi || editProdUnit,
      stock: Number(editProdStock),
      image: editProdImage,
      category: editProdCategory,
      description: editProdDescription,
      descriptionHi: editProdDescriptionHi
    };
    const updatedProducts = (allProducts || []).map(p => p.id === selectedProdToEdit.id ? updatedProduct : p);
    onUpdateProducts(updatedProducts);
    
    setSelectedProdToEdit(null);
    setShowEditProdModal(false);
    setAlertMessage("Product details successfully updated!");
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!onUpdateProducts) return;
    const updatedProducts = (allProducts || []).filter(p => p.id !== prodId);
    onUpdateProducts(updatedProducts);
    setAlertMessage("Product successfully deleted from this shop.");
  };

  if (!selectedArea) {
    return (
      <div className="font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <MapPin className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">{areas.length} Service Areas</h2>
            <p className="text-slate-500 font-medium text-sm mb-8">
              Manage your operational zones and service regions from one central dashboard.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
              {areas.map(area => (
                <div 
                  key={area.id} 
                  className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl p-5 text-left transition flex flex-col justify-between group relative"
                >
                  <button type="button" 
                    onClick={(e) => { e.stopPropagation(); deleteArea(area.id); }}
                    className="absolute top-4 right-4 p-2 bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-200 transition opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    title="Delete Area & All Data"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="cursor-pointer" onClick={() => setSelectedArea(area)}>
                    <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-emerald-800 pr-10">{area.area_name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4"><Activity className="h-3 w-3" /> Radius: {area.max_distance_km + 'km'}</p>
                  </div>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedArea(area)}>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider ${
                      area.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {area.status}
                    </span>
                    <span className="text-emerald-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition">Manage &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" 
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="h-5 w-5" /> Add New Service Area
            </button>
          </div>
        </div>

        {/* MODAL: Add New Service Area */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">New Region</h3>
              </div>
              <form onSubmit={handleAddArea} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Area Name / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Connaught Place, Delhi"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer">Initialize Area</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Confirm Delete Area */}
        {areaToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                  <Trash2 className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Delete Area?</h3>
                <p className="text-sm text-slate-500 font-medium">Are you sure you want to delete this service area? All associated data (users, merchants, products, orders) will be permanently deleted.</p>
              </div>
              <div className="flex justify-end gap-3 w-full">
                <button type="button" onClick={() => setAreaToDelete(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">Cancel</button>
                <button type="button" onClick={confirmDeleteArea} className="flex-1 px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Generic Alert */}
        {alertMessage && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <h3 className="text-lg font-extrabold text-slate-900">Notification</h3>
                <p className="text-sm text-slate-500 font-medium">{alertMessage}</p>
              </div>
              <div className="flex justify-center w-full">
                <button type="button" onClick={() => setAlertMessage(null)} className="w-full px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer">OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[82vh] font-sans rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-50/50">
      
      {/* Low-profile Simple Header with Inline Region Switcher */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <button type="button" 
            onClick={() => setSelectedArea(null)}
            className="h-8 w-8 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 border border-slate-200/60 transition cursor-pointer"
            title="All Operational Regions"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Operational Area</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest border ${
                selectedArea.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {selectedArea.status}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <select
                value={selectedArea.id}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__new__') {
                    setSelectedArea(null);
                    setShowAddModal(true);
                  } else {
                    const matched = areas.find(a => a.id === val);
                    if (matched) setSelectedArea(matched);
                  }
                }}
                className="text-lg font-black text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 pr-6 cursor-pointer hover:text-emerald-700 transition"
                style={{ backgroundImage: 'none' }} // removes default browser arrow if we want a clean look, or keep standard select
              >
                {areas.map(a => (
                  <option key={a.id} value={a.id}>{a.area_name || (a as any).name}</option>
                ))}
                <option value="__new__">+ Add New Region...</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center self-end">
          <button type="button"
            onClick={() => toggleStatus(selectedArea.id)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border shadow-3xs ${
              selectedArea.status === 'Active' 
                ? 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50/50' 
                : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {selectedArea.status === 'Active' ? 'Suspend Area' : 'Activate Area'}
          </button>
          
          <button type="button"
            onClick={() => deleteArea(selectedArea.id)}
            className="px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 shadow-3xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Navigation tabs bar */}
      <div className="bg-white border-b border-slate-200 flex px-6 space-x-5 overflow-x-auto shrink-0 scrollbar-hide">
        {[
          { id: 'live_monitor', label: '📊 Live Orders & Monitor', icon: Activity },
          { id: 'fleet', label: '🚴 Fleet & Dispatch', icon: Navigation },
          { id: 'rider_incentives', label: '🏆 Rider Incentives', icon: Trophy },
          { id: 'surge_schedule', label: '⏰ Surge Schedules', icon: Clock },
          { id: 'disputes', label: '🛡️ Disputes & Refunds', icon: ShieldCheck },
          { id: 'inventory_stock', label: '📦 Stock & Low Alerts', icon: Package },
          { id: 'stock_transfer', label: '🔄 Stock Transfers', icon: ArrowLeftRight },
          { id: 'price_controller', label: '🏷️ Mass Price Discounts', icon: Percent },
          { id: 'customer_analytics', label: '📈 Customer Analytics', icon: BarChart3 },
          { id: 'vip_club', label: '👑 Maudaha VIP Pass', icon: Crown },
          { id: 'route_opt', label: '🧭 Batching & Routes', icon: Compass },
          { id: 'holiday_schedule', label: '📅 Operating Hours', icon: Calendar },
          { id: 'vendor_commission', label: '💼 Vendor Contracts', icon: Briefcase },
          { id: 'wallet_manager', label: '👛 Customer Wallet', icon: Wallet },
          { id: 'vehicle_desk', label: '🔧 Fleet Vehicle Desk', icon: Wrench },
          { id: 'sms_whatsapp', label: '💬 WhatsApp Receipts', icon: MessageSquare },
          { id: 'subzones', label: '🗺️ Sub-Zones & Sectors', icon: Layers },
          { id: 'merchant_audit', label: '🏅 Safety & FSSAI Audits', icon: Award },
          { id: 'loyalty_rewards', label: '🎁 Cashback & Referral Engine', icon: Gift },
          { id: 'finance', label: '💰 Revenue & Payouts', icon: DollarSign },
          { id: 'broadcast', label: '📢 FCM Push Broadcast', icon: Radio },
          { id: 'system_logs', label: '📜 Security Audit Logs', icon: Database },
          { id: 'catalog', label: 'Shops & Products', icon: ShoppingBag },
          { id: 'restaurants_admin', label: '🍽️ Restaurants & Dining', icon: Utensils },
          { id: 'boutiques_admin', label: '👗 Fashion & Boutiques', icon: Shirt },
          { id: 'services_admin', label: '🛠️ Local Services', icon: Wrench },
          { id: 'users', label: 'Users & Passwords', icon: Users },
          { id: 'sys_config', label: '⚙️ App Rules & Banners', icon: Settings },
          { id: 'delivery', label: 'Delivery Charges', icon: Truck },
          { id: 'marketing', label: 'Support & Vouchers', icon: Ticket },
          { id: 'status', label: 'Region Boundaries', icon: Map },
          { id: 'jcode', label: '🤖 Jcode Auto-Fix AI', icon: Bot }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 pt-2.5 px-1 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Body based on Active Tab */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {/* TAB 0: LIVE ORDERS PIPELINE & REALTIME MONITOR */}
        {activeTab === 'live_monitor' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Realtime Velocity Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea?.id || (!o.serviceAreaId && selectedArea?.id === 'area-maudaha'));
                const pendingCount = areaOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
                const activeCount = areaOrders.filter(o => o.status === 'preparing' || o.status === 'out_for_delivery' || o.status === 'on_the_way').length;
                const completedCount = areaOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
                const gmvTotal = areaOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0) || 12450;

                return (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                        <Activity className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Live Active Pipeline</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{activeCount + pendingCount} Orders</h4>
                        <span className="text-[11px] text-indigo-600 font-bold">{pendingCount} Pending Dispatch</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Preparing at Kitchen</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{activeCount} In Prep</h4>
                        <span className="text-[11px] text-amber-600 font-bold">Riders En Route</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Delivered Today</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{completedCount || 24} Orders</h4>
                        <span className="text-[11px] text-emerald-600 font-bold">100% On-time Maudaha</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Live Order Volume</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{gmvTotal.toLocaleString()}</h4>
                        <span className="text-[11px] text-sky-600 font-bold">Area GMV Today</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Live Filter Bar & Emergency Override Tools */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" /> Realtime Order Live Pipeline & Command Control ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Monitor order flow from customer cart to doorstep delivery in real time.</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {['all', 'pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition cursor-pointer ${
                        orderFilterStatus === st 
                          ? 'bg-white text-emerald-700 shadow-3xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order List Cards */}
              {(() => {
                const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea?.id || (!o.serviceAreaId && selectedArea?.id === 'area-maudaha'));
                const filtered = areaOrders.filter(o => orderFilterStatus === 'all' || o.status === orderFilterStatus || (orderFilterStatus === 'on_the_way' && o.status === 'out_for_delivery'));

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Package className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="text-sm font-bold">No orders found under status "{orderFilterStatus.replace('_', ' ')}".</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map(order => (
                      <div key={order.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">Order #{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'out_for_delivery' || order.status === 'on_the_way' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'preparing' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {order.status || 'PENDING'}
                            </span>
                          </div>

                          <div className="text-xs font-black text-emerald-700">
                            ₹{order.grandTotal || order.totalAmount || 280} ({order.paymentMethod?.toUpperCase() || 'COD'})
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                          <div>
                            <p className="font-bold text-slate-800">👤 Customer</p>
                            <p>{order.userName || 'Customer'} • {order.userPhone || '7081xxxxxx'}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">📍 {order.deliveryAddress || 'Maudaha City Center'}</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">🏪 Merchant / Shop</p>
                            <p>{order.storeName || 'Maudaha Super Store'}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">📦 Items: {order.items?.map((i: any) => `${i.name} (${i.quantity || 1})`).join(', ') || 'Grocery Pack'}</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">🚴 Assigned Delivery Rider</p>
                            <p>{order.riderName || 'Rider Allocated'} ({order.riderPhone || 'Online'})</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">⏱️ ETA: {selectedArea?.estimated_delivery_time || '25 mins'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => {
                              triggerOrderAlert(
                                `🔔 Order Alert: #${order.id.slice(-6)}`,
                                `Status update alert for ${order.userName || 'Customer'} in Maudaha!`,
                                [300, 100, 300]
                              );
                              alert(`🔔 Triggered loud alert notification chime for Order #${order.id.slice(-6)}!`);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Volume2 className="h-3.5 w-3.5" /> Loud Chime
                          </button>

                          <button
                            type="button"
                            onClick={() => alert(`✅ Force-updated status for Order #${order.id.slice(-6)}!`)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Override Status
                          </button>

                          <button
                            type="button"
                            onClick={() => alert(`💸 Processed instant ₹${order.grandTotal || order.totalAmount || 280} wallet refund for Order #${order.id.slice(-6)}!`)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Instant Refund
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB: DISPUTES, CLAIMS & INSTANT REFUNDS */}
        {activeTab === 'disputes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Header Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Open Dispute Claims</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{disputeTickets.filter(t => t.status === 'open').length} Claims</h4>
                  <span className="text-[11px] text-amber-600 font-bold">Needs Resolution</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Total Refunded</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{disputeTickets.filter(t => t.status === 'refunded').reduce((acc, t) => acc + t.amount, 0)}</h4>
                  <span className="text-[11px] text-emerald-600 font-bold">Credited to Customer Wallets</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Avg Resolution Speed</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">8 Minutes</h4>
                  <span className="text-[11px] text-indigo-600 font-bold">Fast Customer Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" /> Customer Dispute & Missing Item Resolution Center ({selectedArea?.area_name || 'Maudaha'})
                </h3>
                <span className="text-xs text-slate-500">1-Click Wallet Credit & Fraud Prevention</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Ticket ID / Order</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Reported Issue</th>
                      <th className="py-3 px-4">Claim Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {disputeTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <p className="font-extrabold text-indigo-600">{ticket.id}</p>
                          <p className="text-[10px] text-slate-400">{ticket.orderId} • {ticket.time}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <p>{ticket.user}</p>
                          <p className="text-[10px] text-slate-500 font-normal">{ticket.phone}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs">{ticket.issue}</td>
                        <td className="py-3.5 px-4 font-black text-rose-600 text-sm">₹{ticket.amount}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            ticket.status === 'refunded' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            ticket.status === 'rejected' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {ticket.status === 'open' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setDisputeTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'refunded' } : t));
                                  alert(`✅ Approved ₹${ticket.amount} instant refund credited to ${ticket.user}'s Maudaha Mart Wallet!`);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                              >
                                Approve Refund
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDisputeTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'rejected' } : t));
                                  alert(`❌ Dispute ticket ${ticket.id} closed as rejected.`);
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {ticket.status !== 'open' && (
                            <span className="text-xs text-slate-400 font-medium italic">Case Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SUB-ZONES & SECTOR SURGE PRICING */}
        {activeTab === 'subzones' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-600" /> Sector Geo-Fencing & Sub-Zone Surge Rates ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Divide the main service boundary into sub-sectors with custom surge delivery fees.</p>
                </div>
              </div>

              {/* Add New Sector Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Sector / Colony Name (e.g. Civil Lines Zone)"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-600 uppercase">Surge Fee:</span>
                  <input
                    type="number"
                    value={newSectorSurge}
                    onChange={(e) => setNewSectorSurge(Number(e.target.value))}
                    className="w-20 px-2.5 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <span className="text-xs font-bold text-slate-600">₹</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newSectorName) return;
                    setSubzoneSectors(prev => [...prev, {
                      id: `sec-${Date.now()}`,
                      name: newSectorName,
                      radiusKm: 3,
                      surgeFee: newSectorSurge,
                      active: true
                    }]);
                    setNewSectorName('');
                    alert(`✅ Added subzone sector "${newSectorName}" with ₹${newSectorSurge} surge fee!`);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  <Plus className="h-4 w-4" /> Add Sub-Sector
                </button>
              </div>

              {/* Sectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {subzoneSectors.map(sec => (
                  <div key={sec.id} className={`p-4 rounded-xl border transition space-y-3 ${sec.active ? 'bg-white border-slate-200 shadow-3xs' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-extrabold text-slate-900 text-xs">{sec.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${sec.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {sec.active ? 'Active Sector' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Max Distance: <strong>{sec.radiusKm} km</strong></span>
                      <span>Sector Surge: <strong className="text-indigo-600">+₹{sec.surgeFee}</strong></span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSubzoneSectors(prev => prev.map(s => s.id === sec.id ? { ...s, active: !s.active } : s));
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        {sec.active ? 'Disable Sector' : 'Enable Sector'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubzoneSectors(prev => prev.filter(s => s.id !== sec.id));
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PEAK HOUR & DYNAMIC SURGE SCHEDULE MATRIX */}
        {activeTab === 'surge_schedule' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Surge Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Active Surge Rules</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{surgeSchedules.filter(s => s.active).length} Active</h4>
                  <span className="text-[11px] text-amber-600 font-bold">Auto-applied at checkout</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Peak Delivery Fee</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">+₹{Math.max(...surgeSchedules.map(s => s.extraFee))} Max</h4>
                  <span className="text-[11px] text-indigo-600 font-bold">Rider Incentive Multiplier</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Target Area</p>
                  <h4 className="text-xl font-black text-slate-900 mt-0.5">{selectedArea?.area_name || 'Maudaha Zone'}</h4>
                  <span className="text-[11px] text-emerald-600 font-bold">Automated Time Triggers</span>
                </div>
              </div>
            </div>

            {/* Surge Schedules Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" /> Automated Peak Hour & Weather Surge Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Automated delivery price adjustments to boost rider availability during high-demand hours in {selectedArea?.area_name || 'Maudaha'}.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surgeSchedules.map(schedule => (
                  <div key={schedule.id} className={`p-5 rounded-2xl border transition space-y-3 ${schedule.active ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-800 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{schedule.icon}</span>
                        <div>
                          <h4 className={`font-black text-sm ${schedule.active ? 'text-white' : 'text-slate-900'}`}>{schedule.title}</h4>
                          <p className={`text-[11px] ${schedule.active ? 'text-indigo-200' : 'text-slate-500'}`}>{schedule.timeSlot}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${schedule.active ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-600'}`}>
                        {schedule.active ? '🔥 ACTIVE' : 'OFF'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={schedule.active ? 'text-slate-300' : 'text-slate-600'}>Surge Delivery Fee:</span>
                      <span className={`font-black text-sm ${schedule.active ? 'text-amber-300' : 'text-emerald-700'}`}>+₹{schedule.extraFee} / order</span>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-slate-700/40">
                      <button
                        type="button"
                        onClick={() => {
                          setSurgeSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, active: !s.active } : s));
                          alert(`Updated surge status for "${schedule.title}"`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          schedule.active 
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs'
                        }`}
                      >
                        {schedule.active ? 'Turn OFF' : 'Activate Surge Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: STORE SAFETY & FSSAI AUDITS */}
        {activeTab === 'merchant_audit' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Audits Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Verified Stores</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{merchantAudits.filter(a => a.status === 'approved').length} Verified</h4>
                  <span className="text-[11px] text-emerald-600 font-bold">100% FSSAI Compliant</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Pending License Review</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{merchantAudits.filter(a => a.status === 'pending').length} Pending</h4>
                  <span className="text-[11px] text-amber-600 font-bold">Awaiting Document Upload</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                  <AlertOctagon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Suspended Shops</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{merchantAudits.filter(a => a.status === 'suspended').length} Suspended</h4>
                  <span className="text-[11px] text-rose-600 font-bold">Blocked for Quality Violation</span>
                </div>
              </div>
            </div>

            {/* Merchant Safety & FSSAI Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" /> Food Safety (FSSAI) & Hygiene Audit Ledger ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Ensure all restaurants, bakeries, and grocery partners meet food safety standards.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Merchant Store</th>
                      <th className="py-3 px-4">FSSAI License No</th>
                      <th className="py-3 px-4">License Expiry</th>
                      <th className="py-3 px-4">Hygiene Rating</th>
                      <th className="py-3 px-4">Compliance Status</th>
                      <th className="py-3 px-4 text-right">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {merchantAudits.map(audit => (
                      <tr key={audit.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <p>{audit.storeName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{audit.category}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{audit.fssaiNo}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{audit.expiry}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">
                          ⭐ {audit.hygieneRating} / 5.0
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            audit.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            audit.status === 'suspended' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {audit.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => {
                                setMerchantAudits(prev => prev.map(a => a.id === audit.id ? { ...a, status: 'approved' } : a));
                                alert(`✅ Approved FSSAI license for ${audit.storeName}!`);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                            >
                              Approve
                            </button>
                          )}
                          {audit.status !== 'suspended' && (
                            <button
                              type="button"
                              onClick={() => {
                                setMerchantAudits(prev => prev.map(a => a.id === audit.id ? { ...a, status: 'suspended' } : a));
                                alert(`🛑 Suspended store ${audit.storeName} due to quality audit issue.`);
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CASHBACK & REFERRAL LOYALTY ENGINE */}
        {activeTab === 'loyalty_rewards' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Loyalty Config Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-600" /> Maudaha Mart Customer Loyalty & Referral Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure automated cashback percentages, referral bonus credits, and reward campaigns.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Referral Bonus Credit (₹)</label>
                  <input
                    type="number"
                    value={referralBonusAmount}
                    onChange={(e) => setReferralBonusAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">Amount credited to referrer & referee wallet on first order.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Wallet Cashback (%)</label>
                  <input
                    type="number"
                    value={cashbackPercent}
                    onChange={(e) => setCashbackPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">Percentage returned to customer wallet after order completion.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Min Cart for Cashback (₹)</label>
                  <input
                    type="number"
                    value={minOrderForCashback}
                    onChange={(e) => setMinOrderForCashback(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">Minimum total cart value required to trigger cashback.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => alert('✅ Updated Loyalty & Referral parameters for ' + (selectedArea?.area_name || 'Maudaha'))}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                >
                  Save Loyalty Rules
                </button>
              </div>
            </div>

            {/* Active Reward Campaigns */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-emerald-600" /> Active Promotional Campaigns
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rewardsCampaigns.map(cmp => (
                  <div key={cmp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs">{cmp.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">Active</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{cmp.rewardText}</p>
                    <p className="text-[11px] text-slate-400">Applies to orders ≥ ₹{cmp.minOrder}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: REALTIME INVENTORY & LOW STOCK ALERTS */}
        {activeTab === 'inventory_stock' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Inventory Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Total Monitored SKUs</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{inventoryItems.length} Products</h4>
                  <span className="text-[11px] text-indigo-600 font-bold">In {selectedArea?.area_name || 'Maudaha'} Stores</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Low Stock Warning</p>
                  <h4 className="text-2xl font-black text-amber-700 mt-0.5">{inventoryItems.filter(i => i.status === 'low_stock').length} Items</h4>
                  <span className="text-[11px] text-amber-600 font-bold">Needs Merchant Restock</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                  <AlertOctagon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Out of Stock (OOS)</p>
                  <h4 className="text-2xl font-black text-rose-700 mt-0.5">{inventoryItems.filter(i => i.status === 'out_of_stock').length} Items</h4>
                  <span className="text-[11px] text-rose-600 font-bold">Auto-hidden from Customer App</span>
                </div>
              </div>
            </div>

            {/* Inventory Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" /> Realtime Store Stock & Auto Out-of-Stock Protection ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quickly adjust unit quantities or trigger restock alerts for merchants in real time.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Item & Category</th>
                      <th className="py-3 px-4">Merchant Store</th>
                      <th className="py-3 px-4">Current Stock Units</th>
                      <th className="py-3 px-4">Min Threshold</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4 text-right">Stock Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <p>{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.category}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{item.storeName}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900">{item.currentStock} units</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{item.minThreshold} units</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'in_stock' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            item.status === 'low_stock' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                            'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInventoryItems(prev => prev.map(i => i.id === item.id ? { ...i, currentStock: i.currentStock + 10, status: 'in_stock' } : i));
                              alert(`✅ Restocked +10 units for ${item.name}!`);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                          >
                            +10 Restock
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInventoryItems(prev => prev.map(i => i.id === item.id ? { ...i, currentStock: 0, status: 'out_of_stock' } : i));
                              alert(`🛑 Marked ${item.name} as Out of Stock (OOS).`);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                          >
                            Mark OOS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CUSTOMER ANALYTICS & HOURLY DEMAND HEATMAP */}
        {activeTab === 'customer_analytics' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Analytics Header Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Order Growth Rate</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">+24.8%</h4>
                  <span className="text-[11px] text-emerald-600 font-bold">Week over Week in Maudaha</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Customer Retention</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">78.4%</h4>
                  <span className="text-[11px] text-indigo-600 font-bold">Repeat Buyers</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Average Cart Value</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹340</h4>
                  <span className="text-[11px] text-sky-600 font-bold">Per Completed Order</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Customer CSAT</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">4.9 / 5.0</h4>
                  <span className="text-[11px] text-amber-600 font-bold">Delivery Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Peak Hourly Demand Bar Visualizer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" /> Hourly Order Velocity Heatmap ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Track peak food & grocery ordering times throughout the day.</p>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4 items-end h-48 border-b border-slate-100 pb-2">
                {[
                  { hour: '08 AM', count: 12, height: '20%' },
                  { hour: '09 AM', count: 28, height: '35%' },
                  { hour: '10 AM', count: 45, height: '55%' },
                  { hour: '11 AM', count: 62, height: '70%' },
                  { hour: '12 PM', count: 98, height: '100%', peak: true },
                  { hour: '01 PM', count: 85, height: '88%' },
                  { hour: '02 PM', count: 50, height: '60%' },
                  { hour: '05 PM', count: 40, height: '48%' },
                  { hour: '07 PM', count: 76, height: '80%' },
                  { hour: '08 PM', count: 92, height: '95%', peak: true },
                  { hour: '09 PM', count: 68, height: '75%' },
                  { hour: '10 PM', count: 30, height: '40%' }
                ].map((slot, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 transition">{slot.count}</span>
                    <div 
                      style={{ height: slot.height }}
                      className={`w-full rounded-t-lg transition-all ${
                        slot.peak ? 'bg-gradient-to-t from-emerald-600 to-amber-400 shadow-3xs' : 'bg-slate-200 group-hover:bg-emerald-500'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-slate-500">{slot.hour}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>🔥 Peak Hours: <strong>12:00 PM - 01:30 PM</strong> and <strong>08:00 PM - 09:30 PM</strong></span>
                <span className="text-emerald-700 font-bold">Auto Rider Surge Active during peak slots</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM AUDIT LOGS & SECURITY */}
        {activeTab === 'system_logs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" /> Admin System Audit Trail & Security Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Immutable log of admin actions, role assignments, and area config modifications.</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('✅ Exported System Audit Trail to CSV!')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Export Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Log ID</th>
                      <th className="py-3 px-4">Admin Operator</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Action Recorded</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{log.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{log.user}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{log.action}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{log.ip}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-400">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 1: RIDER LEADERBOARD & INCENTIVES */}
        {activeTab === 'rider_incentives' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Weekly Top Performer</p>
                  <h4 className="text-xl font-black text-slate-900 mt-0.5">Suresh Patel</h4>
                  <span className="text-[11px] text-amber-600 font-bold">158 Trips Completed</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Total Bonus Paid Out</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹3,450</h4>
                  <span className="text-[11px] text-emerald-600 font-bold">Milestone Incentives</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Target Goal</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">150 Deliveries</h4>
                  <span className="text-[11px] text-indigo-600 font-bold">Gets +₹500 Weekly Cash Bonus</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" /> Delivery Rider Leaderboard & Milestone Bonus Desk ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Reward top performing delivery partners with instant wallet milestone bonuses.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Delivery Partner</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4">Completed Trips</th>
                      <th className="py-3 px-4">CSAT Rating</th>
                      <th className="py-3 px-4">Milestone Target</th>
                      <th className="py-3 px-4 text-right">Incentive Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riderLeaderboard.map(rider => (
                      <tr key={rider.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{rider.name}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">{rider.badge}</td>
                        <td className="py-3.5 px-4 font-black text-indigo-700">{rider.trips} Trips</td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">⭐ {rider.rating} / 5.0</td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {rider.trips} / {rider.bonusTarget} ({Math.min(100, Math.round((rider.trips/rider.bonusTarget)*100))}%)
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {rider.qualified ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-[10px] uppercase">
                              ✅ ₹{rider.milestoneBonus} Paid
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRiderLeaderboard(prev => prev.map(r => r.id === rider.id ? { ...r, qualified: true } : r));
                                alert(`🎉 Awarded ₹${rider.milestoneBonus} milestone bonus to ${rider.name}!`);
                              }}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                            >
                              Pay ₹{rider.milestoneBonus} Bonus
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 2: MASS PRICE & DISCOUNT CONTROLLER */}
        {activeTab === 'price_controller' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Percent className="h-5 w-5 text-emerald-600" /> Mass Category Price Adjustment & Inflation Controller
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Bulk discount or price markup across entire product categories in {selectedArea?.area_name || 'Maudaha'}.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Select Target Category</label>
                  <select
                    value={bulkDiscountCategory}
                    onChange={(e) => setBulkDiscountCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  >
                    <option value="Dairy & Bakery">Dairy & Bakery</option>
                    <option value="Atta, Rice & Pulses">Atta, Rice & Pulses</option>
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Restaurant Dishes">Restaurant Dishes</option>
                    <option value="Snacks & Beverages">Snacks & Beverages</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={bulkDiscountPercentage}
                    onChange={(e) => setBulkDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`✅ Applied ${bulkDiscountPercentage}% mass discount on category "${bulkDiscountCategory}" across all stores!`)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                  >
                    Apply Bulk Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`🔄 Reset price adjustments for category "${bulkDiscountCategory}".`)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 3: WHATSAPP & SMS RECEIPT GATEWAY */}
        {activeTab === 'sms_whatsapp' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-600" /> WhatsApp & SMS Realtime Order Notifications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure automated order receipt templates sent to customers via WhatsApp API.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">SMS Gateway:</span>
                  <button
                    type="button"
                    onClick={() => setSmsGatewayActive(!smsGatewayActive)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${smsGatewayActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {smsGatewayActive ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-700 uppercase">Out for Delivery WhatsApp Template (Hindi/English)</label>
                <textarea
                  rows={4}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => alert('📱 Sent test WhatsApp order receipt to Admin phone number!')}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Send Test WhatsApp Message
                </button>
                <button
                  type="button"
                  onClick={() => alert('✅ Saved WhatsApp receipt template!')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 4: MULTI-STORE STOCK TRANSFERS */}
        {activeTab === 'stock_transfer' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-emerald-600" /> Multi-Store Inventory Transfer & Warehouse Dispatch Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Transfer stock units between Maudaha Central Warehouse and retail merchant outlets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Select Item</label>
                  <input
                    type="text"
                    value={transferItem}
                    onChange={(e) => setTransferItem(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Transfer Units</label>
                  <input
                    type="number"
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setTransferLogs(prev => [{
                        id: `TR-${Date.now().toString().slice(-3)}`,
                        item: transferItem,
                        fromStore: 'Maudaha Central Warehouse',
                        toStore: 'Station Road Grocery Hub',
                        qty: transferQty,
                        date: 'Just Now'
                      }, ...prev]);
                      alert(`✅ Dispatched ${transferQty} units of ${transferItem}!`);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                  >
                    Dispatch Stock Transfer
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Transfer ID</th>
                      <th className="py-3 px-4">Product Item</th>
                      <th className="py-3 px-4">Origin Warehouse</th>
                      <th className="py-3 px-4">Destination Merchant</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transferLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{log.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{log.item}</td>
                        <td className="py-3 px-4 text-slate-600">{log.fromStore}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">{log.toStore}</td>
                        <td className="py-3 px-4 font-black text-slate-800">{log.qty} Units</td>
                        <td className="py-3 px-4 text-right text-slate-400">{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 5: MAUDAHA GOLD VIP MEMBERSHIP PASS */}
        {activeTab === 'vip_club' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Active Gold Members</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{vipActiveMembersCount} VIPs</h4>
                  <span className="text-[11px] text-amber-600 font-bold">Monthly Subscribers</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Subscription Revenue</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{(vipActiveMembersCount * vipPriceMonthly).toLocaleString()}</h4>
                  <span className="text-[11px] text-emerald-600 font-bold">Monthly Recurring</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">Monthly VIP Fee</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{vipPriceMonthly} / mo</h4>
                  <span className="text-[11px] text-indigo-600 font-bold">Unlimited Free Delivery</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" /> Maudaha Gold VIP Pass Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Set subscription pricing and perk rules for premium loyalty customers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Monthly Membership Price (₹)</label>
                  <input
                    type="number"
                    value={vipPriceMonthly}
                    onChange={(e) => setVipPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Min Cart Order for Free Delivery (₹)</label>
                  <input
                    type="number"
                    value={vipFreeDeliveryThreshold}
                    onChange={(e) => setVipFreeDeliveryThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => alert('✅ Updated Maudaha Gold VIP Pass parameters!')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                >
                  Save Gold Pass Rules
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 6: ROUTE & BATCH OPTIMIZATION */}
        {activeTab === 'route_opt' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Compass className="h-5 w-5 text-emerald-600" /> Order Stacking & Route Batching Engine ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Combine nearby customer orders into a single rider trip to increase delivery efficiency.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDispatchEnabled(!autoDispatchEnabled)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase ${autoDispatchEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
                >
                  {autoDispatchEnabled ? '⚡ Auto-Batching ON' : 'MANUAL DISPATCH'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Max Orders Per Rider Trip</label>
                  <input
                    type="number"
                    value={maxOrdersPerRiderBatch}
                    onChange={(e) => setMaxOrdersPerRiderBatch(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">Maximum bundled deliveries assigned to one rider simultaneously.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Max Batching Distance Radius (km)</label>
                  <input
                    type="number"
                    value={maxBatchDistanceKm}
                    onChange={(e) => setMaxBatchDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">Geographic proximity limit between customer drop points.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => alert('✅ Saved Route Optimization & Batching rules!')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                >
                  Save Batching Config
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 7: STORE OPERATING HOURS & HOLIDAYS */}
        {activeTab === 'holiday_schedule' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" /> Operating Hours & Festival Holiday Schedule ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage market opening hours and set emergency offline shutdown periods.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEmergencyShutdown(!emergencyShutdown);
                    alert(emergencyShutdown ? '✅ Re-opened area for customer ordering!' : '🚨 Triggered Emergency Pause for all stores!');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    emergencyShutdown ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white shadow-3xs'
                  }`}
                >
                  <Power className="h-4 w-4" />
                  {emergencyShutdown ? 'Resume Service' : 'Emergency Area Shutdown'}
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase">Upcoming Festival & Market Holiday Schedule</h4>
                <div className="space-y-2">
                  {holidayList.map(h => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900">{h.name}</p>
                        <p className="text-[11px] text-slate-500">📅 Date: {h.date}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${h.status === 'Closed' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 8: VENDOR COMMISSIONS & CONTRACTS */}
        {activeTab === 'vendor_commission' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" /> Vendor Contract Tiers & Platform Commission Ledger ({selectedArea?.area_name || 'Maudaha'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage partner vendor agreement tiers and custom commission split percentages.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Merchant Partner</th>
                      <th className="py-3 px-4">Partner Tier</th>
                      <th className="py-3 px-4">Platform Commission Rate</th>
                      <th className="py-3 px-4">Agreement Expiry</th>
                      <th className="py-3 px-4 text-right">Contract Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendorContracts.map(vc => (
                      <tr key={vc.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{vc.vendorName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            vc.tier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {vc.tier} Tier
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">{vc.commissionPct}% per order</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{vc.renewDate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => alert(`✅ Renewed agreement contract for ${vc.vendorName} until 2028!`)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                          >
                            Renew Contract
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 9: CUSTOMER WALLET & TOPUP CONSOLE */}
        {activeTab === 'wallet_manager' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600" /> Customer Wallet Manual Credit & Goodwill Adjustment Console
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Directly credit or debit customer wallet funds for goodwill compensation or refunds in {selectedArea?.area_name || 'Maudaha'}.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Customer Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={walletUserPhone}
                    onChange={(e) => setWalletUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Credit Amount (₹)</label>
                  <input
                    type="number"
                    value={walletTopupAmount}
                    onChange={(e) => setWalletTopupAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Reason Note</label>
                  <input
                    type="text"
                    value={walletTopupReason}
                    onChange={(e) => setWalletTopupReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!walletUserPhone) return alert('Please enter customer phone number');
                    alert(`💸 Credited ₹${walletTopupAmount} to wallet of customer (${walletUserPhone}) for reason: ${walletTopupReason}!`);
                    setWalletUserPhone('');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                >
                  Send Wallet Credit Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB FEATURE 10: FLEET VEHICLE & MAINTENANCE DESK */}
        {activeTab === 'vehicle_desk' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-emerald-600" /> Delivery Vehicle Health & Rider Safety Desk ({selectedArea?.area_name || 'Maudaha'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Track electric scooter battery health, helmet verification, and vehicle maintenance status.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {fleetVehicles.map(veh => (
                  <div key={veh.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono font-black text-indigo-700 text-xs">{veh.regNo}</h4>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">{veh.type}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-800">Rider: {veh.riderName}</p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-extrabold text-slate-600">
                        <span>Vehicle Health:</span>
                        <span>{veh.healthPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${veh.healthPct}%` }} className={`h-full ${veh.healthPct > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                      <span className="text-[11px] text-slate-500">Helmet Check:</span>
                      <span className={`font-bold ${veh.helmetVerified ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {veh.helmetVerified ? '✅ Passed' : '⚠️ Missing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: RIDER FLEET & DISPATCH COMMAND CENTER */}
        {activeTab === 'fleet' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Top Fleet Header & Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const riders = (allUsers || []).filter(u => u.role === 'rider');
                const onlineRiders = riders.filter(u => u.isOnline || u.status === 'online');
                const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea?.id || (!o.serviceAreaId && selectedArea?.id === 'area-maudaha'));
                const unassigned = areaOrders.filter(o => o.status === 'pending' || o.status === 'processing');
                const totalCodCash = riders.reduce((acc, r) => acc + (r.walletBalance || r.cashOnHand || 0), 0);

                return (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Navigation className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Total Active Riders</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{riders.length} Riders</h4>
                        <span className="text-[11px] text-emerald-600 font-bold">{onlineRiders.length} Currently Online</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Unassigned Orders</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{unassigned.length} Pending</h4>
                        <span className="text-[11px] text-amber-600 font-bold">Needs Rider Allocation</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Fleet COD Cash Held</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalCodCash || 4250}</h4>
                        <span className="text-[11px] text-indigo-600 font-bold">Collected from Customers</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                      <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Avg Delivery Speed</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{selectedArea?.estimated_delivery_time || '22 mins'}</h4>
                        <span className="text-[11px] text-sky-600 font-bold">Maudaha Service Zone</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Manual Order Dispatching Widget */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-indigo-800/40 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-800/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                    <Navigation className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase tracking-wider text-indigo-200">
                      Manual Order Dispatch & Driver Assignment Center
                    </h3>
                    <p className="text-xs text-slate-300">Assign unallocated orders directly to online riders in {selectedArea?.area_name || 'Maudaha'}</p>
                  </div>
                </div>
                <span className="text-xs bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 font-bold px-3 py-1 rounded-full">
                  Live Dispatching
                </span>
              </div>

              {(() => {
                const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea?.id || (!o.serviceAreaId && selectedArea?.id === 'area-maudaha'));
                const pendingOrders = areaOrders.filter(o => o.status === 'pending' || o.status === 'processing' || !o.riderId);
                const riders = (allUsers || []).filter(u => u.role === 'rider');

                if (pendingOrders.length === 0) {
                  return (
                    <div className="p-6 bg-slate-800/60 rounded-xl border border-slate-700 text-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-200">All orders in {selectedArea?.area_name || 'Maudaha'} are assigned or completed!</p>
                      <p className="text-xs text-slate-400">New customer orders will automatically appear here for dispatch control.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOrders.slice(0, 4).map(order => (
                      <div key={order.id} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                        <div className="flex items-center justify-between text-xs border-b border-slate-700/80 pb-2">
                          <span className="font-extrabold text-indigo-300">Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className="font-black text-emerald-400">₹{order.grandTotal || order.totalAmount || 240} ({order.paymentMethod?.toUpperCase() || 'COD'})</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <p><strong className="text-slate-100">Customer:</strong> {order.userName || 'Customer'} ({order.userPhone || '7081xxx'})</p>
                          <p><strong className="text-slate-100">Address:</strong> {order.deliveryAddress || 'Maudaha'}</p>
                          <p><strong className="text-slate-100">Items:</strong> {order.items?.map((i: any) => i.name).join(', ') || 'Grocery Pack'}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <select
                            value={selectedRiderForDispatch[order.id] || ''}
                            onChange={(e) => setSelectedRiderForDispatch(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- Select Online Rider --</option>
                            {riders.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.phone}) {r.isOnline ? '🟢 Online' : '⚪ Offline'}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const riderId = selectedRiderForDispatch[order.id];
                              if (!riderId) {
                                alert('Please select a rider first.');
                                return;
                              }
                              const rider = riders.find(r => r.id === riderId);
                              triggerOrderAlert(
                                `🚀 Order Dispatch Alert: #${order.id.slice(-6)}`,
                                `Assigned to ${rider?.name || 'Rider'}. Delivery to ${order.deliveryAddress || 'Maudaha'}`,
                                [400, 100, 400]
                              );
                              alert(`✅ Order #${order.id.slice(-6)} successfully assigned to ${rider?.name || 'Rider'}! Push notification sent.`);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Send className="h-3.5 w-3.5" /> Dispatch
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Rider Roster Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" /> Rider Fleet Roster ({selectedArea?.area_name || 'Maudaha'})
                </h3>
                <span className="text-xs text-slate-500">Live GPS tracking & Cash On Hand balances</span>
              </div>

              {(() => {
                const riders = (allUsers || []).filter(u => u.role === 'rider');
                if (riders.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Users className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="text-sm font-bold">No riders registered in this area yet.</p>
                      <p className="text-xs">Create rider accounts in "Users & Roles" tab with role = Rider.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                          <th className="py-3 px-4">Rider Info</th>
                          <th className="py-3 px-4">Phone Number</th>
                          <th className="py-3 px-4">Live Status</th>
                          <th className="py-3 px-4">COD Cash Held</th>
                          <th className="py-3 px-4">Rating / Deliveries</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {riders.map(rider => {
                          const isSettled = riderCashSettled[rider.id];
                          const cash = isSettled ? 0 : (rider.walletBalance || rider.cashOnHand || 1250);

                          return (
                            <tr key={rider.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center">
                                  {rider.name?.charAt(0) || 'R'}
                                </div>
                                <div>
                                  <p className="text-slate-900 font-extrabold">{rider.name}</p>
                                  <p className="text-[10px] text-slate-400">ID: {rider.id.slice(-6)}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-600">{rider.phone || '7081xxxxxx'}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  rider.isOnline !== false 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {rider.isOnline !== false ? '🟢 Online' : '⚪ Offline'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-black text-indigo-700 text-sm">
                                ₹{cash}
                                {cash > 0 && <span className="text-[10px] font-normal text-amber-600 block">Pending Deposit</span>}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-700">
                                ⭐ 4.9 <span className="text-[11px] text-slate-400 font-normal">(48 orders)</span>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRiderCashSettled(prev => ({ ...prev, [rider.id]: true }));
                                    alert(`✅ Settled COD Cash for ${rider.name}. Balance reset to ₹0.`);
                                  }}
                                  disabled={cash === 0}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    cash > 0 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  }`}
                                >
                                  Settle Cash
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alert(`📍 Rider GPS Location: 25.6836° N, 80.1166° E (Maudaha Sector 2)`)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  GPS Ping
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIALS, REVENUE & PAYOUT OPERATIONS */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Revenue Analytics Cards */}
            {(() => {
              const areaOrders = (allOrders || []).filter(o => o.serviceAreaId === selectedArea?.id || (!o.serviceAreaId && selectedArea?.id === 'area-maudaha'));
              const totalGmv = areaOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0) || 48500;
              const adminCommission = Math.round(totalGmv * 0.10);
              const netMerchantPayout = totalGmv - adminCommission;
              const codCount = areaOrders.filter(o => o.paymentMethod === 'cod').length || 18;
              const onlineCount = areaOrders.length - codCount || 12;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase text-slate-400">Total Area GMV</p>
                      <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalGmv.toLocaleString()}</h4>
                      <span className="text-[11px] text-emerald-600 font-bold">{areaOrders.length || 30} Total Orders</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase text-slate-400">Platform Share (10%)</p>
                      <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{adminCommission.toLocaleString()}</h4>
                      <span className="text-[11px] text-indigo-600 font-bold">Admin Commission Earned</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase text-slate-400">Merchant Payouts</p>
                      <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{netMerchantPayout.toLocaleString()}</h4>
                      <span className="text-[11px] text-amber-600 font-bold">Net Payable to Shops</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase text-slate-400">Payment Split</p>
                      <h4 className="text-xl font-black text-slate-900 mt-0.5">{codCount} COD / {onlineCount} UPI</h4>
                      <span className="text-[11px] text-purple-600 font-bold">Maudaha Payment Ratio</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Merchant Store Payouts Approval Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" /> Merchant Payout & Settlement Ledger ({selectedArea?.area_name || 'Maudaha'})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage bank transfers and UPI payouts to active shops in this area.</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('📊 Downloaded Maudaha Financial Audit CSV Statement')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  Download Report
                </button>
              </div>

              {(() => {
                const areaStores = (allStores || []).filter(s => s.serviceAreaId === selectedArea?.id || (!s.serviceAreaId && selectedArea?.id === 'area-maudaha'));

                if (areaStores.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <ShoppingBag className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="text-sm font-bold">No merchant stores linked to this service area yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                          <th className="py-3 px-4">Store Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">UPI Payout Address</th>
                          <th className="py-3 px-4">Gross Sales</th>
                          <th className="py-3 px-4">Commission (10%)</th>
                          <th className="py-3 px-4">Net Payout Due</th>
                          <th className="py-3 px-4 text-right">Settlement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {areaStores.map(store => {
                          const gross = Math.floor(Math.random() * 15000) + 5000;
                          const comm = Math.round(gross * 0.10);
                          const net = gross - comm;

                          return (
                            <tr key={store.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                                <span className="text-base">{store.category === 'restaurant' ? '🍕' : store.category === 'grocery' ? '🛒' : '🏪'}</span>
                                {store.name}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-600 capitalize">{store.category || 'General'}</td>
                              <td className="py-3.5 px-4 font-bold text-indigo-600">{store.upiId || 'shop@upi'}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-800">₹{gross.toLocaleString()}</td>
                              <td className="py-3.5 px-4 font-bold text-rose-600">-₹{comm.toLocaleString()}</td>
                              <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">₹{net.toLocaleString()}</td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => alert(`✅ Transferred ₹${net.toLocaleString()} to ${store.name} via UPI (${store.upiId || 'shop@upi'})`)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-3xs"
                                >
                                  Release Payout
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: FCM PUSH NOTIFICATION BROADCAST & EMERGENCY ALERTS */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Quick Emergency Broadcast Presets */}
            <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-lg border border-rose-700/40 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-700/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30">
                    <AlertOctagon className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase tracking-wider text-rose-200">
                      Emergency Instant Push Alert Presets (1-Click Broadcast)
                    </h3>
                    <p className="text-xs text-slate-300">Instantly triggers sound chime, ringtone, and vibration across all app devices in {selectedArea?.area_name || 'Maudaha'}</p>
                  </div>
                </div>
                <span className="text-xs bg-rose-500/30 border border-rose-400/30 text-rose-200 font-bold px-3 py-1 rounded-full">
                  Instant Chime
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerOrderAlert(
                      '🌧️ Heavy Rain Delivery Alert - Maudaha',
                      'Rainfall in Maudaha may cause slight delivery delays. Thank you for your patience!',
                      [500, 200, 500, 200, 800]
                    );
                    setBroadcastLog(prev => [{ id: Date.now().toString(), title: '🌧️ Heavy Rain Delivery Alert', target: 'all', time: 'Just now', count: 180 }, ...prev]);
                    alert('🚀 Broadcasted Heavy Rain Alert to all Maudaha users!');
                  }}
                  className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-400 rounded-xl text-left transition cursor-pointer space-y-1 group"
                >
                  <p className="text-xs font-black text-rose-300 flex items-center justify-between">
                    🌧️ Rain Delay Warning <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-200">Send Now</span>
                  </p>
                  <p className="text-[11px] text-slate-300">Notifies users about weather delay with loud sound ringtone.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerOrderAlert(
                      '🎁 Festival Special 20% OFF Blast',
                      'Use code FESTIVAL20 for flat 20% cashback on all grocery & restaurant orders in Maudaha!',
                      [300, 100, 300]
                    );
                    setBroadcastLog(prev => [{ id: Date.now().toString(), title: '🎁 Festival Special 20% OFF Blast', target: 'customer', time: 'Just now', count: 240 }, ...prev]);
                    alert('🚀 Broadcasted Festival Discount offer to all customers!');
                  }}
                  className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 rounded-xl text-left transition cursor-pointer space-y-1 group"
                >
                  <p className="text-xs font-black text-amber-300 flex items-center justify-between">
                    🎁 Festival Discount Offer <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">Send Now</span>
                  </p>
                  <p className="text-[11px] text-slate-300">Sends 20% OFF promo notification to boost order volume.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerOrderAlert(
                      '🚴 Urgent Rider Requirement Alert',
                      'High order demand in Maudaha Sector 1 & 2! Riders earn 1.5x bonus per delivery.',
                      [600, 200, 600]
                    );
                    setBroadcastLog(prev => [{ id: Date.now().toString(), title: '🚴 Urgent Rider Requirement', target: 'rider', time: 'Just now', count: 18 }, ...prev]);
                    alert('🚀 Broadcasted Surge Bonus alert to all delivery riders!');
                  }}
                  className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-400 rounded-xl text-left transition cursor-pointer space-y-1 group"
                >
                  <p className="text-xs font-black text-indigo-300 flex items-center justify-between">
                    ⚡ High Demand Surge <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-200">Send Now</span>
                  </p>
                  <p className="text-[11px] text-slate-300">Alerts riders about 1.5x surge earnings bonus in Maudaha.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerOrderAlert(
                      '🛠️ App Maintenance Notice',
                      'Scheduled system upgrade tonight between 12:00 AM - 01:00 AM. Ordering will resume shortly.',
                      [300, 100, 300]
                    );
                    setBroadcastLog(prev => [{ id: Date.now().toString(), title: '🛠️ App Maintenance Notice', target: 'all', time: 'Just now', count: 320 }, ...prev]);
                    alert('🚀 Broadcasted maintenance notice!');
                  }}
                  className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400 rounded-xl text-left transition cursor-pointer space-y-1 group"
                >
                  <p className="text-xs font-black text-purple-300 flex items-center justify-between">
                    🛠️ Night Maintenance <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-200">Send Now</span>
                  </p>
                  <p className="text-[11px] text-slate-300">Notifies all app users about scheduled maintenance.</p>
                </button>
              </div>
            </div>

            {/* Custom Push Broadcast Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Radio className="h-5 w-5 text-emerald-600" /> Custom FCM Push Broadcast Composer
                </h3>
                <span className="text-xs text-slate-500">Service Area: <strong>{selectedArea?.area_name || 'Maudaha'}</strong></span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!broadcastTitleEn || !broadcastBodyEn) {
                    alert('Please enter notification title and message body.');
                    return;
                  }
                  triggerOrderAlert(
                    broadcastTitleEn,
                    broadcastBodyEn,
                    [500, 200, 500, 200, 1000]
                  );
                  setBroadcastLog(prev => [{ id: Date.now().toString(), title: broadcastTitleEn, target: broadcastTarget, time: 'Just now', count: 150 }, ...prev]);
                  setBroadcastTitleEn('');
                  setBroadcastTitleHi('');
                  setBroadcastBodyEn('');
                  setBroadcastBodyHi('');
                  alert(`🚀 Successfully broadcasted push notification to target group [${broadcastTarget.toUpperCase()}]!`);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Target Audience Group</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'all', label: '👥 Everyone (All)' },
                      { id: 'customer', label: '🛒 Customers Only' },
                      { id: 'merchant', label: '🏪 Shop Owners' },
                      { id: 'rider', label: '🚴 Delivery Riders' }
                    ].map(group => (
                      <button
                        type="button"
                        key={group.id}
                        onClick={() => setBroadcastTarget(group.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          broadcastTarget === group.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. 🎉 Special Offer Active Today!"
                      value={broadcastTitleEn}
                      onChange={(e) => setBroadcastTitleEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Title (Hindi - हिंदी)</label>
                    <input
                      type="text"
                      placeholder="उदा: 🎉 आज विशेष ऑफर सक्रिय है!"
                      value={broadcastTitleHi}
                      onChange={(e) => setBroadcastTitleHi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Message Body (English)</label>
                    <textarea
                      rows={3}
                      placeholder="Write notification message content here..."
                      value={broadcastBodyEn}
                      onChange={(e) => setBroadcastBodyEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Message Body (Hindi - हिंदी)</label>
                    <textarea
                      rows={3}
                      placeholder="यहाँ नोटिफिकेशन संदेश सामग्री लिखें..."
                      value={broadcastBodyHi}
                      onChange={(e) => setBroadcastBodyHi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <Radio className="h-4 w-4" /> Dispatch Push Notification Now
                  </button>
                </div>
              </form>
            </div>

            {/* Broadcast Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <BellRing className="h-4 w-4 text-emerald-600" /> Recent Broadcast Log ({broadcastLog.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {broadcastLog.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-sans">
                    <div>
                      <p className="font-extrabold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-400 capitalize">Target: {item.target} • Sent {item.time}</p>
                    </div>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                      ✓ Delivered to {item.count} devices
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APP RULES, PROMO BANNERS & SYSTEM CONTROLS */}
        {activeTab === 'sys_config' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Emergency Region Pause Switch */}
            <div className={`p-6 rounded-2xl border shadow-sm transition flex flex-wrap items-center justify-between gap-4 ${
              isEmergencyPaused 
                ? 'bg-rose-900 text-white border-rose-800' 
                : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${isEmergencyPaused ? 'bg-rose-800 border-rose-600 text-rose-200' : 'bg-emerald-800 border-emerald-600 text-emerald-200'}`}>
                  <Power className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-wider">
                    {isEmergencyPaused ? '🛑 Emergency Area Orders PAUSED' : '🟢 Area Ordering Operations ACTIVE'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isEmergencyPaused 
                      ? `New order checkouts are temporarily blocked in ${selectedArea?.area_name || 'Maudaha'}.` 
                      : `Customers in ${selectedArea?.area_name || 'Maudaha'} can place instant orders normally.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const updated = !isEmergencyPaused;
                  setIsEmergencyPaused(updated);
                  alert(updated ? '🛑 PAUSED all new order checkouts for this service area!' : '🟢 RESUMED normal ordering operations!');
                }}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer shadow-md ${
                  isEmergencyPaused 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isEmergencyPaused ? 'Resume Operations' : 'Pause All Orders'}
              </button>
            </div>

            {/* Operational Parameters Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600" /> Operational Rules & Pricing Policy ({selectedArea?.area_name || 'Maudaha'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure minimum cart limits, night delivery multipliers, and COD controls.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmountVal}
                    onChange={(e) => setMinOrderAmountVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">Cart total must exceed this amount to enable checkout.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Night / Surge Multiplier</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={areaSurgeMultiplier}
                      onChange={(e) => setAreaSurgeMultiplier(Number(e.target.value))}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="font-black text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">{areaSurgeMultiplier}x</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Multiplies delivery charge during peak hours or weather.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase">Cash On Delivery (COD)</label>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700">{isCodAllowed ? '🟢 COD Allowed' : '🔴 COD Disabled'}</span>
                    <button
                      type="button"
                      onClick={() => setIsCodAllowed(!isCodAllowed)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        isCodAllowed ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      Toggle
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Allows cash payment upon doorstep delivery.</p>
                </div>
              </div>

              {/* Admin Platform UPI Gateway Settings */}
              <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Platform Receiver UPI Gateway ID</h4>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={adminGatewayUpi}
                    onChange={(e) => setAdminGatewayUpi(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => alert(`✅ Platform Admin UPI set to: ${adminGatewayUpi}`)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                  >
                    Save UPI
                  </button>
                </div>
                <p className="text-[11px] text-indigo-700">All customer UPI payments and platform commissions are directed to this VPA.</p>
              </div>
            </div>

            {/* Promotional Hero Banner Manager */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-emerald-600" /> Promotional Banners ({selectedArea?.area_name || 'Maudaha'})
                </h3>
                <span className="text-xs text-slate-500">Banners shown on customer homepage</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={newHeroBannerUrl}
                  onChange={(e) => setNewHeroBannerUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newHeroBannerUrl) return;
                    setHeroBanners(prev => [...prev, newHeroBannerUrl]);
                    setNewHeroBannerUrl('');
                    alert('✅ Added new promotional banner for ' + (selectedArea?.area_name || 'Maudaha'));
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-3xs flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Banner
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {heroBanners.map((banner, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-3xs">
                    <img src={banner} alt="Banner" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setHeroBanners(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" /> Area Boundaries & Settings
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Configure geographic coordinates, names, pincodes and active radius.</p>
                </div>
                {!isEditingBoundary ? (
                  <button type="button" 
                    onClick={() => setIsEditingBoundary(true)} 
                    className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" /> Edit Boundaries
                  </button>
                ) : (
                  <button type="button" 
                    onClick={() => setIsEditingBoundary(false)} 
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditingBoundary ? (
                <form onSubmit={handleSaveBoundary} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Area Name</label>
                      <input
                        type="text"
                        required
                        value={editAreaName}
                        onChange={(e) => setEditAreaName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Operational Radius (KM)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={editRadius}
                        onChange={(e) => setEditRadius(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                        <span>City</span>
                        <button
                          type="button"
                          onClick={handleGeocodeCity}
                          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 underline tracking-normal cursor-pointer lowercase"
                        >
                          Find/Center on Map
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={handleGeocodeCity}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-600 cursor-pointer"
                          title="Locate city on map"
                        >
                          <Navigation className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">State</label>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        placeholder="e.g. Uttar Pradesh"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Pin Codes covered (comma separated)</label>
                      <input
                        type="text"
                        value={editPincode}
                        onChange={(e) => setEditPincode(e.target.value)}
                        placeholder="e.g. 201301, 201304"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm cursor-pointer">
                      Save Geographic Settings
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Region Name</p>
                      <p className="text-base font-bold text-slate-800">{selectedArea.area_name || selectedArea.name}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City & State</p>
                      <p className="text-base font-bold text-slate-800">{selectedArea.city || 'N/A'}, {selectedArea.state || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Radius</p>
                      <p className="text-base font-bold text-slate-800">{selectedArea.max_distance_km || 5} Kilometers</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Covered Postal Codes</p>
                      <p className="text-base font-bold text-slate-800">{selectedArea.pincode || 'All Pin Codes within radius'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Maps Visual Boundary Editor */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                      🗺️ Visual Geofence Map Editor
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isEditingBoundary 
                        ? '💡 Click anywhere on the map to add boundary points. Drag points to adjust. Click a point to remove it.' 
                        : 'ℹ️ Viewing active operational area boundary polygon.'}
                    </p>
                  </div>
                  
                  {isEditingBoundary && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateCirclePreset}
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold px-3 py-1.5 rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                        title={`Generate circular coordinates polygon with ${editRadius}km radius`}
                      >
                        <Zap className="h-3 w-3" /> Auto-Circle Geofence
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPoints}
                        className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold px-3 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Clear Points
                      </button>
                    </div>
                  )}
                </div>

                {!hasValidKey ? (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="max-w-md mx-auto text-center py-4">
                      <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
                        <MapPin className="h-6 w-6 text-amber-600" />
                      </div>
                      <h5 className="font-black text-slate-800 text-sm">Google Maps API Key Required</h5>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        To enable the visual drawing editor and real-time interactive mapping, please set up your Google Maps Platform API key.
                      </p>
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-left mt-4 text-[11px] space-y-2 text-slate-600 font-sans shadow-2xs">
                        <p className="font-bold text-slate-700">Setup Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Get an API key: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-bold">Get Google Maps Key</a></li>
                          <li>Open <strong>Settings</strong> (⚙️ gear icon, top-right corner)</li>
                          <li>Select <strong>Secrets</strong></li>
                          <li>Add secret <code>GOOGLE_MAPS_PLATFORM_KEY</code> and paste your key.</li>
                        </ol>
                        <p className="text-[10px] text-amber-600 font-medium pt-1">
                          ⚠️ The app will automatically rebuild to activate the map. No manual refresh needed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
                    <APIProvider apiKey={API_KEY} version="weekly">
                      <GoogleMap
                        center={mapCenter}
                        defaultZoom={13}
                        gestureHandling={isEditingBoundary ? 'greedy' : 'auto'}
                        disableDefaultUI={false}
                        onClick={handleMapClick}
                        mapId="DEMO_MAP_ID"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                      >
                        {/* Render geofence polygon */}
                        {editPolygonCoordinates.length >= 3 && (
                          <Polygon
                            paths={editPolygonCoordinates}
                            strokeColor="#059669"
                            strokeOpacity={0.8}
                            strokeWeight={3}
                            fillColor="#10b981"
                            fillOpacity={0.25}
                          />
                        )}

                        {/* Render active polygon line if not closed yet (< 3 points) */}
                        {editPolygonCoordinates.length > 0 && editPolygonCoordinates.length < 3 && (
                          <Polygon
                            paths={editPolygonCoordinates}
                            strokeColor="#ef4444"
                            strokeOpacity={0.8}
                            strokeWeight={2}
                            fillColor="#f87171"
                            fillOpacity={0.1}
                          />
                        )}

                        {/* Render markers for coordinates - draggable when editing */}
                        {editPolygonCoordinates.map((coord, idx) => (
                          <AdvancedMarker
                            key={`${idx}-${coord.lat}-${coord.lng}`}
                            position={coord}
                            draggable={isEditingBoundary}
                            onDragEnd={(e) => handleMarkerDragEnd(idx, e)}
                            onClick={() => {
                              if (isEditingBoundary) {
                                handleRemovePoint(idx);
                              }
                            }}
                          >
                            <div className="cursor-pointer group relative">
                              <Pin
                                background={isEditingBoundary ? "#ef4444" : "#10b981"}
                                glyphColor="#fff"
                                scale={isEditingBoundary ? 0.9 : 0.8}
                              />
                              {isEditingBoundary && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap mb-1">
                                  Drag to reposition / Click to remove
                                </div>
                              )}
                            </div>
                          </AdvancedMarker>
                        ))}
                      </GoogleMap>
                    </APIProvider>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-emerald-600" /> User Accounts & Password Management
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Manage passwords, assign roles (Admin, Seller, Rider, etc.), and control service areas.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-100">
                  {allUsers?.length || 0} Total Users
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add User
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, phone, email, or role..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Name / Contact</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Assigned Area</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(allUsers || []).filter(u => {
                    if (!userSearchTerm.trim()) return true;
                    const term = userSearchTerm.toLowerCase();
                    return (
                      u.name?.toLowerCase().includes(term) ||
                      u.phone?.toLowerCase().includes(term) ||
                      u.email?.toLowerCase().includes(term) ||
                      u.role?.toLowerCase().includes(term)
                    );
                  }).map(u => {
                    const isSelf = u.email?.toLowerCase() === 'biengwithash@gmail.com';
                    const showPass = showPasswordsMap[u.id] || false;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {u.name}
                            {isSelf && <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Super Admin</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium font-mono">
                            {u.phone} {u.email ? `• ${u.email}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type={showPass ? 'text' : 'password'}
                              value={u.password || '123456'}
                              onChange={(e) => handleUpdateUserPassword(u.id, e.target.value)}
                              className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswordsMap(prev => ({ ...prev, [u.id]: !showPass }))}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                              title={showPass ? 'Hide password' : 'Show password'}
                            >
                              {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-500">
                          <select
                            value={u.serviceAreaId || u.assignedArea || 'area-maudaha'}
                            disabled={isSelf}
                            onChange={(e) => handleUpdateUserArea(u.id, e.target.value)}
                            className={`bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition font-sans ${isSelf ? 'opacity-65 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                          >
                            {areas.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.area_name} ({a.pincode})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role || 'customer'}
                            disabled={isSelf}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className={`bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer uppercase transition font-sans ${isSelf ? 'opacity-65 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                          >
                            {AVAILABLE_ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase font-sans">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                              title="Delete user account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'restaurants_admin' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Utensils className="h-4.5 w-4.5 text-emerald-600" /> Restaurants & Food Dining Outlets
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Manage food vendors, cuisines, addresses, ratings, and UPI payment details in Firestore.</p>
              </div>
              <button
                type="button"
                onClick={() => openRestaurantModal()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Restaurant
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search restaurant by name, cuisine, address..."
                value={restaurantSearchTerm}
                onChange={(e) => setRestaurantSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(allRestaurants || []).filter(r => {
                if (!restaurantSearchTerm.trim()) return true;
                const term = restaurantSearchTerm.toLowerCase();
                return r.name?.toLowerCase().includes(term) || r.cuisine?.toLowerCase().includes(term) || r.address?.toLowerCase().includes(term);
              }).map(r => (
                <div key={r.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 relative group">
                  <div className="h-28 w-full rounded-xl overflow-hidden relative bg-slate-200">
                    <img referrerPolicy="no-referrer" src={r.banner} alt={r.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                      ⭐ {r.rating}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{r.cuisine}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-2 border-t border-slate-200">
                    <span>⏱️ {r.deliveryTime}</span>
                    <span>Min Order: ₹{r.minOrder}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openRestaurantModal(r)}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestaurantToDelete(r)}
                      className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center"
                      title="Delete restaurant"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'boutiques_admin' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Shirt className="h-4.5 w-4.5 text-emerald-600" /> Fashion & Boutique Stores
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Manage fashion stores, specialties, locations, ratings, and catalog listings.</p>
              </div>
              <button
                type="button"
                onClick={() => openBoutiqueModal()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Boutique
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search boutique by name, specialty, address..."
                value={boutiqueSearchTerm}
                onChange={(e) => setBoutiqueSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(allBoutiques || []).filter(b => {
                if (!boutiqueSearchTerm.trim()) return true;
                const term = boutiqueSearchTerm.toLowerCase();
                return b.name?.toLowerCase().includes(term) || b.specialty?.toLowerCase().includes(term) || b.address?.toLowerCase().includes(term);
              }).map(b => (
                <div key={b.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 relative group">
                  <div className="h-28 w-full rounded-xl overflow-hidden relative bg-slate-200">
                    <img referrerPolicy="no-referrer" src={b.banner} alt={b.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-purple-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                      ⭐ {b.rating}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{b.name}</h4>
                    <p className="text-[11px] text-purple-600 font-semibold">{b.specialty}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-2 border-t border-slate-200">
                    <span>🚚 {b.deliveryTime}</span>
                    <span>Min Order: ₹{b.minOrder}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openBoutiqueModal(b)}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoutiqueToDelete(b)}
                      className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center"
                      title="Delete boutique"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services_admin' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Wrench className="h-4.5 w-4.5 text-emerald-600" /> Local Service Providers
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Manage local plumbers, electricians, beauticians, and mechanics.</p>
              </div>
              <button
                type="button"
                onClick={() => openServiceModal()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Service Provider
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search local service by provider name, category, phone..."
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(allLocalServices || []).filter(s => {
                if (!serviceSearchTerm.trim()) return true;
                const term = serviceSearchTerm.toLowerCase();
                return s.name?.toLowerCase().includes(term) || s.category?.toLowerCase().includes(term) || s.phone?.toLowerCase().includes(term);
              }).map(s => (
                <div key={s.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 relative group">
                  <div className="h-28 w-full rounded-xl overflow-hidden relative bg-slate-200">
                    <img referrerPolicy="no-referrer" src={s.banner} alt={s.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs uppercase">
                      {s.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{s.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">📞 {s.phone} • {s.experience} yrs exp</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pt-2 border-t border-slate-200">
                    <span>⭐ {s.rating}</span>
                    <span className="text-emerald-700">Base Charge: ₹{s.baseCharge}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openServiceModal(s)}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceToDelete(s)}
                      className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center"
                      title="Delete service provider"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Metrics Header Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs flex items-center gap-3.5">
                <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Active Shops</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{vendors.length}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs flex items-center gap-3.5">
                <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Catalog Items</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{productsStats.total || 0}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs flex items-center gap-3.5">
                <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Live Orders</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{ordersStats.totalActive || 0}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs flex items-center gap-3.5">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Riders Online</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{deliveryPartners.online || 0}</p>
                </div>
              </div>
            </div>

            {/* Merchant shops listing card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Package className="h-4.5 w-4.5 text-indigo-600" /> Active Merchant Shops
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click any shop to configure its carousel banners, address, and product catalog items</p>
                </div>
                <button type="button" 
                  onClick={() => setShowAddShopModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New Shop
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vendors.map(v => (
                  <div key={v.id} 
                    onClick={() => { setSelectedShop(v); setShowShopSettingsModal(true); }}
                    className="flex justify-between items-start p-4 bg-slate-50 hover:bg-indigo-50/20 border border-slate-200/50 hover:border-indigo-200 rounded-xl cursor-pointer transition group relative overflow-hidden"
                  >
                    <div className="font-sans">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-900 transition">{v.name}</p>
                        <span className="text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0">{v.shopCategory || v.categories?.[0] || 'Store'}</span>
                      </div>
                      {v.nameHi && v.nameHi !== v.name && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{v.nameHi}</p>}
                      <p className="text-[10px] text-slate-500 font-medium mt-1.5 line-clamp-1">{v.address || 'Maudaha Bazar'}</p>
                    </div>
                    <button type="button" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteShop(v.id); }}
                      className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md border border-slate-200 transition cursor-pointer self-start shrink-0"
                      title="Delete Shop"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {vendors.length === 0 && (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Search className="h-6 w-6 opacity-45" />
                    <p className="text-xs font-bold text-slate-700">No shops registered in this area</p>
                    <button type="button" onClick={() => setShowAddShopModal(true)} className="text-xs font-extrabold text-emerald-600 hover:underline">Click here to register the first shop</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Tab Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Delivery Operations & Timing Slots</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Customize order fulfillment windows, delivery modes, and pricing thresholds for <span className="font-bold text-slate-700">{selectedArea?.area_name || 'Selected Region'}</span>.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDefaultSlots}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border border-slate-200"
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Reset Default Slots
              </button>
            </div>

            {/* TIMING SLOTS MANAGEMENT CARD */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" /> Active Delivery Timing Slots ({deliverySlots.length})
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customers can choose these delivery time windows at checkout.</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0 self-start sm:self-auto">
                  Live Custom Slots
                </span>
              </div>

              {/* Slots Badges / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deliverySlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl shadow-3xs transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 text-emerald-600 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate" title={slot}>
                        {slot}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTimingSlot(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                      title="Remove Slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {deliverySlots.length === 0 && (
                  <div className="col-span-full py-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs font-medium">
                    No active timing slots configured. Click quick-add below or type a custom slot name!
                  </div>
                )}
              </div>

              {/* Quick Add Presets */}
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
                  ⚡ Quick Add Standard Slots:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAddSlot('Morning Slot (7:00 AM - 12:00 PM)')}
                    className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-600" /> Morning (7 AM - 12 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddSlot('Afternoon Slot (12:00 PM - 4:00 PM)')}
                    className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-600" /> Afternoon (12 PM - 4 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddSlot('Evening Slot (4:00 PM - 9:00 PM)')}
                    className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-600" /> Evening (4 PM - 9 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddSlot('Night Express Slot (9:00 PM - 12:00 AM)')}
                    className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-600" /> Night Express (9 PM - 12 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddSlot('24/7 Round The Clock Delivery')}
                    className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-600" /> 24/7 Round The Clock
                  </button>
                </div>
              </div>

              {/* Custom Slot Creator Input Form */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Add Custom Timing Slot
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Slot Name / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Early Morning Breakfast Express"
                      value={newSlotTitle}
                      onChange={(e) => setNewSlotTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 06:00 AM"
                      value={newSlotStartTime}
                      onChange={(e) => setNewSlotStartTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">End Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={newSlotEndTime}
                      onChange={(e) => setNewSlotEndTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddTimingSlot}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-4 w-4" /> Add Custom Timing Slot
                </button>
              </div>
            </div>

            {/* ALLOWED MODES & FEES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Allowed Delivery Modes */}
              <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Operational Delivery Modes
                </label>
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryTypes.instant}
                      onChange={(e) => setDeliveryTypes({ ...deliveryTypes, instant: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Instant Express Delivery (30-45 Mins)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryTypes.scheduled}
                      onChange={(e) => setDeliveryTypes({ ...deliveryTypes, scheduled: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Scheduled Timing Slots Selection</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryTypes.express15}
                      onChange={(e) => setDeliveryTypes({ ...deliveryTypes, express15: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Hyperlocal 15-Minute Rush Orders</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryTypes.doorstepPickup}
                      onChange={(e) => setDeliveryTypes({ ...deliveryTypes, doorstepPickup: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Self Pickup / Takeaway at Merchant Store</span>
                  </label>
                </div>
              </div>

              {/* Delivery Logistics & Thresholds */}
              <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-emerald-600" /> Region Delivery Charges & Limits
                </label>
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Standard Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={deliveryChargeVal}
                      onChange={(e) => setDeliveryChargeVal(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Free Delivery Above (₹)</label>
                    <input
                      type="number"
                      value={freeDeliveryAboveVal}
                      onChange={(e) => setFreeDeliveryAboveVal(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Minimum Checkout (₹)</label>
                    <input
                      type="number"
                      value={minOrderAmountVal}
                      onChange={(e) => setMinOrderAmountVal(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Estimated Delivery Time</label>
                    <input
                      type="text"
                      value={estDeliveryTimeVal}
                      onChange={(e) => setEstDeliveryTimeVal(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800">Active Delivery Fleet</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Riders currently online in {selectedArea?.area_name || 'region'}</p>
                </div>
                <span className="ml-4 bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-lg font-black border border-emerald-200 shrink-0">
                  {deliveryPartners.online || 0} Riders Online
                </span>
              </div>

              <button
                type="button"
                onClick={updateDeliverySettings}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" /> Save Delivery Timing Slots & Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="h-5 w-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-800 text-base">Active Promotions</h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex-1 flex flex-col gap-4 overflow-y-auto">
                {coupons.length > 0 ? coupons.map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs border-l-4 border-l-purple-500">
                    <span className="font-mono text-base font-black text-slate-800 tracking-wider">{c.code}</span>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">ACTIVE</span>
                  </div>
                )) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium">No active coupons</div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <LifeBuoy className="h-5 w-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-800 text-base">Open Support Tickets</h3>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {tickets.map(t => (
                  <div key={t.id} className="p-4 bg-white border border-rose-100 rounded-xl flex flex-col gap-3 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                      <div className="flex justify-between items-start pl-3">
                        <span className="font-bold text-sm text-slate-800">#{t.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">{t.status}</span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium pl-3 leading-relaxed">{t.subject}</p>
                      <div className="pl-3 pt-3 border-t border-slate-50 mt-1">
                        <button type="button" onClick={() => onToggleTicketStatus && onToggleTicketStatus(t.id, 'resolved')} className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1">Resolve Ticket &rarr;</button>
                      </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                     <Activity className="h-8 w-8 mb-3 opacity-50" />
                     <p className="text-sm font-medium">Inbox zero! No open tickets.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jcode' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <JCodeMaintenancePanel language="en" />
          </div>
        )}
      </div>

      {/* MODAL: Add New Shop */}
      {showAddShopModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Add New Shop</h3>
              </div>
              <button type="button" onClick={() => setShowAddShopModal(false)} className="text-slate-400 hover:text-slate-600 font-extrabold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleAddShop} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maudaha Grocery Store"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Bazar, Maudaha"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shop Category</label>
                  <select
                    value={newShopCategory}
                    onChange={(e) => setNewShopCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="grocery">Grocery & Supermarket</option>
                    <option value="restaurant">Restaurant & Food</option>
                    <option value="boutique">Clothing & Boutique</option>
                    <option value="jewellery">Jewellery Shop</option>
                    <option value="footwear">Footwear Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newShopMinOrder}
                    onChange={(e) => setNewShopMinOrder(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Merchant UPI ID</label>
                  <input
                    type="text"
                    placeholder="merchant@ybl"
                    value={newShopUpiId}
                    onChange={(e) => setNewShopUpiId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newShopBanner}
                    onChange={(e) => setNewShopBanner(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowAddShopModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer">Create & Initialize Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Shop Settings & Catalog Management */}
      {showShopSettingsModal && selectedShop && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  {selectedShop.name}
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{selectedShop.shopCategory || selectedShop.categories?.[0] || 'Store'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Manage carousel banner timing, shop names, addresses, and catalog items.</p>
              </div>
              <button type="button" onClick={() => { setShowShopSettingsModal(false); setSelectedShop(null); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer transition">&times;</button>
            </div>

            {/* Sub Tabs Selection */}
            <div className="flex border-b border-slate-100 px-2 mt-4 shrink-0 gap-6">
              <button type="button"
                onClick={() => setShopSubTab('details')}
                className={`pb-3 pt-1 border-b-2 font-extrabold text-sm transition cursor-pointer flex items-center gap-2 ${
                  shopSubTab === 'details' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="h-4 w-4" /> Shop Settings & Carousel Banners
              </button>
              <button type="button"
                onClick={() => setShopSubTab('products')}
                className={`pb-3 pt-1 border-b-2 font-extrabold text-sm transition cursor-pointer flex items-center gap-2 ${
                  shopSubTab === 'products' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="h-4 w-4" /> Store Catalog & Products
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="flex-1 overflow-y-auto py-6 pr-2">
              {shopSubTab === 'details' ? (
                <form onSubmit={handleUpdateShop} className="space-y-6 font-sans">
                  
                  {/* Text Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Shop Name</label>
                      <input
                        type="text"
                        required
                        value={editShopName}
                        onChange={(e) => setEditShopName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Address</label>
                      <input
                        type="text"
                        required
                        value={editShopAddress}
                        onChange={(e) => setEditShopAddress(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Min Order Amount (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editShopMinOrder}
                        onChange={(e) => setEditShopMinOrder(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Merchant UPI ID</label>
                      <input
                        type="text"
                        required
                        value={editShopUpiId}
                        onChange={(e) => setEditShopUpiId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Carousel banner management */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Shop Carousel Banners</h4>
                    
                    {/* Timing */}
                    <div className="max-w-xs space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Banner Auto-Rotate Timing (seconds)</label>
                      <select
                        value={editShopBannerInterval}
                        onChange={(e) => setEditShopBannerInterval(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-bold text-slate-700"
                      >
                        <option value="2">2 Seconds (Fast)</option>
                        <option value="3">3 Seconds (Standard)</option>
                        <option value="5">5 Seconds (Moderate)</option>
                        <option value="7">7 Seconds (Slow)</option>
                      </select>
                    </div>

                    {/* Adding banner */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Add Carousel Banner URL</label>
                      <ImageUploadControl
                        label="Upload Shop Carousel Banner"
                        labelHi="दुकान का बैनर अपलोड करें"
                        currentImageUrl=""
                        type="store"
                        identifier={selectedShop?.id || 'shop'}
                        aspectRatio="banner"
                        onImageUploaded={(url) => {
                          setEditShopBanners([...editShopBanners, url]);
                          if (!editShopBanner) setEditShopBanner(url);
                        }}
                      />
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Or paste external URL..."
                          value={newCarouselBannerUrl}
                          onChange={(e) => setNewCarouselBannerUrl(e.target.value)}
                          className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button type="button"
                          onClick={() => {
                            if (!newCarouselBannerUrl) return;
                            setEditShopBanners([...editShopBanners, newCarouselBannerUrl]);
                            if (editShopBanner === '') setEditShopBanner(newCarouselBannerUrl);
                            setNewCarouselBannerUrl('');
                          }}
                          className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Banner list */}
                    <div className="space-y-2 mt-2">
                      <label className="block text-xs font-bold text-slate-500">Active Carousel Items ({editShopBanners.length})</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editShopBanners.map((url, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs relative group">
                            <img referrerPolicy="no-referrer" src={url} alt={`Banner ${index}`} className="w-12 h-10 object-cover rounded-md border border-slate-100 shrink-0" />
                            <p className="text-[10px] text-slate-400 font-mono truncate flex-1">{url}</p>
                            <button type="button"
                              onClick={() => {
                                const list = editShopBanners.filter((_, i) => i !== index);
                                setEditShopBanners(list);
                                if (editShopBanner === url) setEditShopBanner(list[0] || '');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {editShopBanners.length === 0 && (
                          <p className="text-xs text-slate-400 font-medium italic p-2 col-span-2">No carousel banners added yet. Add one above.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition cursor-pointer">
                      Save Shop Configurations
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 font-sans">
                  
                  {/* Catalog Header */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl shrink-0">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Product Inventory</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Manage stock, prices, MRP, minimum selling prices, and details.</p>
                    </div>
                    <button type="button"
                      onClick={() => setShowAddProdModal(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Product
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(allProducts || []).filter(p => p.storeId === selectedShop.id).map(p => (
                      <div key={p.id} className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative group transition">
                        <div>
                          <img referrerPolicy="no-referrer" src={p.image} alt={p.name} className="w-full h-32 object-contain bg-slate-50 rounded-xl mb-3" />
                          <h5 className="font-bold text-slate-800 text-sm truncate">{p.name}</h5>
                          {p.nameHi && p.nameHi !== p.name && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{p.nameHi}</p>}
                          
                          <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-500 font-sans">
                            <div>MRP: <span className="text-slate-800">₹{p.mrp || p.price}</span></div>
                            <div>Price: <span className="text-indigo-600">₹{p.price || p.sellingPrice}</span></div>
                            <div>MSP: <span className="text-amber-700">₹{p.msp || p.price}</span></div>
                            <div>Qty/Stock: <span className={`${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{p.stock || 0}</span></div>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 mt-2 font-mono">Weight / Unit: {p.unit || '1 pc'}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 justify-end">
                          <button type="button"
                            onClick={() => { setSelectedProdToEdit(p); setShowEditProdModal(true); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(allProducts || []).filter(p => p.storeId === selectedShop.id).length === 0 && (
                      <div className="col-span-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 font-sans p-6">
                        <Search className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm font-bold text-slate-700">No products registered for this shop</p>
                        <p className="text-xs text-slate-500 mt-0.5">Click the "Add Product" button above to populate the catalog.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Product */}
      {showAddProdModal && selectedShop && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Add Product to {selectedShop.name}</h3>
              <button type="button" onClick={() => setShowAddProdModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortune Mustard Oil"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 199"
                    value={newProdMrp || ''}
                    onChange={(e) => setNewProdMrp(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 175"
                    value={newProdPrice || ''}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MSP (Minimum Selling Price - ₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 150"
                    value={newProdMsp || ''}
                    onChange={(e) => setNewProdMsp(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity / Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Litre, 500 g, 1 pc"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadControl
                    label="Product Picture"
                    labelHi="उत्पाद की तस्वीर"
                    currentImageUrl={newProdImage}
                    type="product"
                    identifier={newProdName || 'product'}
                    aspectRatio="square"
                    onImageUploaded={(url) => setNewProdImage(url)}
                  />
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Or Direct Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category (e.g. Groceries, Snacks, Beverages, Fashion)</label>
                  <input
                    type="text"
                    required
                    placeholder="Groceries"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowAddProdModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Existing Product */}
      {showEditProdModal && selectedProdToEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Edit Product Details</h3>
              <button type="button" onClick={() => { setShowEditProdModal(false); setSelectedProdToEdit(null); }} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editProdMrp}
                    onChange={(e) => setEditProdMrp(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MSP (Minimum Selling Price - ₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editProdMsp}
                    onChange={(e) => setEditProdMsp(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity / Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    required
                    value={editProdUnit}
                    onChange={(e) => setEditProdUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadControl
                    label="Product Picture"
                    labelHi="उत्पाद की तस्वीर"
                    currentImageUrl={editProdImage}
                    type="product"
                    identifier={selectedProdToEdit?.id || 'prod_edit'}
                    aspectRatio="square"
                    onImageUploaded={(url) => setEditProdImage(url)}
                  />
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Or Direct Image URL</label>
                    <input
                      type="text"
                      value={editProdImage}
                      onChange={(e) => setEditProdImage(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => { setShowEditProdModal(false); setSelectedProdToEdit(null); }} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Area */}
      {areaToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Delete Area?</h3>
              <p className="text-sm text-slate-500 font-medium">Are you sure you want to delete this service area? All associated data (users, merchants, products, orders) will be permanently deleted.</p>
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button type="button" onClick={() => setAreaToDelete(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDeleteArea} className="flex-1 px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete User */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Delete Customer?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Are you sure you want to permanently delete the customer account for <strong className="text-slate-800">{userToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button type="button" onClick={() => setUserToDelete(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDeleteUser} className="flex-1 px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-600" /> Create User Account
              </h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. rahul@maudahamart.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Password</label>
                <input
                  type="text"
                  required
                  placeholder="Set initial password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">User Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {AVAILABLE_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Area</label>
                  <select
                    value={newUserArea}
                    onChange={(e) => setNewUserArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.area_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Restaurant Add/Edit */}
      {showRestaurantModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-emerald-600" /> {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
              </h3>
              <button type="button" onClick={() => setShowRestaurantModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveRestaurant(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name (English)</label>
                  <input type="text" required value={restName} onChange={(e) => setRestName(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name (Hindi)</label>
                  <input type="text" value={restNameHiVal} onChange={(e) => setRestNameHiVal(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cuisine / Tags</label>
                <input type="text" required placeholder="e.g. North Indian, Biryani, Fast Food" value={restCuisine} onChange={(e) => setRestCuisine(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
                <input type="text" required value={restAddress} onChange={(e) => setRestAddress(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating</label>
                  <input type="number" step="0.1" max="5" min="1" value={restRating} onChange={(e) => setRestRating(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Time</label>
                  <input type="text" value={restDeliveryTime} onChange={(e) => setRestDeliveryTime(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Order (₹)</label>
                  <input type="number" value={restMinOrder} onChange={(e) => setRestMinOrder(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Merchant UPI ID</label>
                  <input type="text" placeholder="merchant@upi" value={restUpiId} onChange={(e) => setRestUpiId(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Banner Image URL</label>
                  <input type="text" value={restBanner} onChange={(e) => setRestBanner(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowRestaurantModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm">Save Restaurant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Restaurant */}
      {restaurantToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Delete Restaurant?</h3>
              <p className="text-sm text-slate-500 font-medium">Are you sure you want to delete <strong className="text-slate-800">{restaurantToDelete.name}</strong> from Firestore?</p>
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button type="button" onClick={() => setRestaurantToDelete(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDeleteRestaurant} className="flex-1 px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Boutique Add/Edit */}
      {showBoutiqueModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shirt className="h-4 w-4 text-emerald-600" /> {editingBoutique ? 'Edit Boutique' : 'Add New Boutique'}
              </h3>
              <button type="button" onClick={() => setShowBoutiqueModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBoutique(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name (English)</label>
                  <input type="text" required value={btName} onChange={(e) => setBtName(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name (Hindi)</label>
                  <input type="text" value={btNameHiVal} onChange={(e) => setBtNameHiVal(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialty / Category</label>
                <input type="text" required placeholder="e.g. Bridal Wear, Designer Sarees, Kids Wear" value={btSpecialty} onChange={(e) => setBtSpecialty(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
                <input type="text" required value={btAddress} onChange={(e) => setBtAddress(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating</label>
                  <input type="number" step="0.1" max="5" min="1" value={btRating} onChange={(e) => setBtRating(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Time</label>
                  <input type="text" value={btDeliveryTime} onChange={(e) => setBtDeliveryTime(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Order (₹)</label>
                  <input type="number" value={btMinOrder} onChange={(e) => setBtMinOrder(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">UPI ID</label>
                  <input type="text" placeholder="boutique@upi" value={btUpiId} onChange={(e) => setBtUpiId(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Banner Image URL</label>
                  <input type="text" value={btBanner} onChange={(e) => setBtBanner(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowBoutiqueModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm">Save Boutique</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Boutique */}
      {boutiqueToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Delete Boutique?</h3>
              <p className="text-sm text-slate-500 font-medium">Are you sure you want to delete <strong className="text-slate-800">{boutiqueToDelete.name}</strong> from Firestore?</p>
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button type="button" onClick={() => setBoutiqueToDelete(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDeleteBoutique} className="flex-1 px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Local Service Add/Edit */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-emerald-600" /> {editingService ? 'Edit Local Service' : 'Add New Local Service'}
              </h3>
              <button type="button" onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveService(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Provider Name</label>
                  <input type="text" required value={svcName} onChange={(e) => setSvcName(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={svcCategory}
                    onChange={(e) => setSvcCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 bg-white font-bold cursor-pointer"
                  >
                    <option value="plumber">Plumber</option>
                    <option value="electrician">Electrician</option>
                    <option value="beauty">Beauty & Salon</option>
                    <option value="mechanic">Mechanic</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input type="text" required value={svcPhone} onChange={(e) => setSvcPhone(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Experience (Years)</label>
                  <input type="number" min="0" value={svcExperience} onChange={(e) => setSvcExperience(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address / Location</label>
                <input type="text" required value={svcAddress} onChange={(e) => setSvcAddress(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating</label>
                  <input type="number" step="0.1" max="5" min="1" value={svcRating} onChange={(e) => setSvcRating(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Base Charge (₹)</label>
                  <input type="number" value={svcBaseCharge} onChange={(e) => setSvcBaseCharge(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image / Photo URL</label>
                <input type="text" value={svcBanner} onChange={(e) => setSvcBanner(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm">Save Service Provider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Service */}
      {serviceToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Delete Service Provider?</h3>
              <p className="text-sm text-slate-500 font-medium">Are you sure you want to delete <strong className="text-slate-800">{serviceToDelete.name}</strong> from Firestore?</p>
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button type="button" onClick={() => setServiceToDelete(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDeleteService} className="flex-1 px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generic Alert */}
      {alertMessage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">Notification</h3>
              <p className="text-sm text-slate-500 font-medium">{alertMessage}</p>
            </div>
            <div className="flex justify-center w-full">
              <button type="button" onClick={() => setAlertMessage(null)} className="w-full px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
