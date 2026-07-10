/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'hi';

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  price: number; // Selling Price (for backward compatibility)
  sellingPrice?: number; // Explicit Selling Price field
  mrp?: number; // Maximum Retail Price
  msp?: number; // Master Selling Price (Seller & Admin only)
  unit: string;
  unitHi: string;
  stock: number;
  image: string;
  rating: number;
  description: string;
  descriptionHi: string;
  storeId: string;
  originalPrice?: number;
  warrantyPeriod?: string;
  warrantyPeriodHi?: string;
  replacementPolicy?: string;
  replacementPolicyHi?: string;
}

export interface PriceChangeLog {
  id: string;
  productId: string;
  productName: string;
  oldMrp: number;
  newMrp: number;
  oldSellingPrice: number;
  newSellingPrice: number;
  oldMsp: number;
  newMsp: number;
  changedBy: string; // user name/email
  changedByEmail: string;
  userRole: 'merchant' | 'admin';
  timestamp: string;
}

export interface Store {
  id: string;
  name: string;
  nameHi: string;
  address: string;
  addressHi: string;
  area?: string;
  rating: number;
  reviewCount: number;
  banner: string;
  deliveryTime: string;
  deliveryTimeHi: string;
  minOrder: number;
  upiId?: string;
  categories: string[];
  shopCategory?: string;
}

export interface Review {
  id: string;
  storeId: string;
  author: string;
  rating: number;
  comment: string;
  commentHi: string;
  date: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export type DeliveryStatus = 'pending' | 'processing' | 'ready_for_pickup' | 'ready_for_delivery' | 'out_for_delivery' | 'arrived' | 'cancelled';

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  total: number;
  discount: number;
  paymentMethod: 'UPI' | 'COD';
  upiId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryStatus: DeliveryStatus;
  date: string;
  storeId: string;
  storeName: string;
  storeNameHi: string;
  coinsEarned: number;
  coinsRedeemed: number;
  photoUrl?: string;
  riderLat?: number;
  riderLng?: number;
  deliveredAt?: number;
  isReviewed?: boolean;
  riderRating?: number;
  customerLocation?: string;
  customerLocationHi?: string;
}

export interface LoyaltyHistoryItem {
  date: string;
  description: string;
  descriptionHi: string;
  points: number;
  type: 'earn' | 'redeem';
}

export interface LoyaltyInfo {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  history: LoyaltyHistoryItem[];
}

export interface Notification {
  id: string;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  code?: string;
  discountAmount?: number;
  type: 'discount' | 'order' | 'general';
  date: string;
  isRead: boolean;
}

export interface UserActivity {
  id: string;
  timestamp: string;
  action: string;
  actionHi: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  locationHi: string;
  role: 'customer' | 'merchant' | 'rider' | 'admin' | 'manager';
  assignedArea?: string;
  activities: UserActivity[];
  searchHistory: string[];
  watchlist?: string[];
  cart?: { [storeId: string]: OrderItem[] };
  restaurantCart?: { [restaurantId: string]: RestaurantOrderItem[] };
  restaurantOrders?: RestaurantOrder[];
  clothingCart?: { [boutiqueId: string]: ClothingOrderItem[] };
  clothingOrders?: ClothingOrder[];
  trainQueries?: TrainQuery[];
  flightBookings?: FlightBooking[];
  trainBookings?: TrainBooking[];
  merchantRequestStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface MerchantRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  businessName: string;
  businessNameHi: string;
  businessAddress: string;
  businessAddressHi: string;
  businessType: 'grocery' | 'restaurant' | 'boutique';
  shopCategory?: string;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface RestaurantMenuItem {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  category: 'veg' | 'nonveg' | 'sweet' | 'beverage';
  image: string;
  description: string;
  descriptionHi: string;
}

export interface Restaurant {
  id: string;
  name: string;
  nameHi: string;
  rating: number;
  deliveryTime: string;
  deliveryTimeHi: string;
  minOrder: number;
  upiId?: string;
  address: string;
  addressHi: string;
  area?: string;
  cuisine: string;
  cuisineHi: string;
  banner: string;
  menu: RestaurantMenuItem[];
}

export interface RestaurantOrderItem {
  item: RestaurantMenuItem;
  quantity: number;
}

export interface RestaurantOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantNameHi: string;
  items: RestaurantOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'UPI' | 'COD';
  status: 'cooking' | 'packing' | 'out' | 'delivered';
  date: string;
}

export interface TrainQuery {
  id: string;
  trainNumber: string;
  trainName: string;
  pnr?: string;
  date: string;
  statusText: string;
  statusTextHi: string;
}

export interface FlightBooking {
  id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  departureDate: string;
  arrivalTime: string;
  seat: string;
  passengerName: string;
  className: 'Economy' | 'Business';
  gate: string;
  qrCode: string;
  price?: number;
  adminProfit?: number;
  adminUpiId?: string;
  paymentStatus?: 'pending' | 'completed';
}

export interface TrainBooking {
  id: string;
  trainNumber: string;
  trainName: string;
  trainNameHi: string;
  from: string;
  to: string;
  departureTime: string;
  departureDate: string;
  arrivalTime: string;
  seat: string;
  passengerName: string;
  className: string; // e.g. Sleeper, AC 3 Tier
  qrCode: string;
  price?: number;
  adminProfit?: number;
  adminUpiId?: string;
  paymentStatus?: 'pending' | 'completed';
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  category: string;
  status: 'open' | 'resolved';
  createdAt: string;
  messages: SupportMessage[];
}

export interface SystemSettings {
  enableCustomerPortal: boolean;
  enableMerchantDashboard: boolean;
  enableRiderPortal: boolean;
  enableSupportPanel: boolean;
  enableUpiPayment: boolean;
  enableUpiPaymentShops: boolean;
  enableUpiPaymentRestaurants: boolean;
  enableUpiPaymentFashion: boolean;
  enableLiveRouteTracker: boolean;
  deliveryCharge: number;
  minCheckoutAmount: number;
  welcomeLoyaltyPoints: number;
  coinToRupeeRate: number;
  manualRiderSimulation: boolean;
  enableHindiTranslation: boolean;
  globalPromoBannerText: string;
  globalPromoBannerTextHi: string;
}

export interface CustomPanelMetric {
  label: string;
  labelHi: string;
  value: string;
  icon: string;
}

export interface CustomPanel {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  description: string;
  descriptionHi: string;
  metrics: CustomPanelMetric[];
  richContent: string;
  richContentHi: string;
  dateCreated: string;
  status: 'active' | 'inactive';
}

export interface AppState {
  language: Language;
  role: 'customer' | 'merchant';
  selectedStoreId: string | null;
  activeTab: 'browse' | 'orders' | 'loyalty' | 'notifications';
  cart: { [storeId: string]: OrderItem[] };
  orders: Order[];
  loyalty: LoyaltyInfo;
  notifications: Notification[];
  stores: Store[];
  products: Product[];
  reviews: Review[];
  activeOrderTrackingId: string | null;
  merchantStoreId: string; // The store the logged-in merchant is managing
}

export interface ClothingItem {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  category: 'ethnic' | 'western' | 'kids' | 'footwear' | 'accessories' | 'jewellery';
  image: string;
  description: string;
  descriptionHi: string;
  sizes: string[]; // e.g. ['S', 'M', 'L', 'XL']
  hasStitchingOption?: boolean;
  warrantyPeriod?: string;
  warrantyPeriodHi?: string;
  replacementPolicy?: string;
  replacementPolicyHi?: string;
}

export interface ClothingBoutique {
  id: string;
  name: string;
  nameHi: string;
  rating: number;
  deliveryTime: string;
  deliveryTimeHi: string;
  minOrder: number;
  upiId?: string;
  address: string;
  addressHi: string;
  area?: string;
  specialty: string;
  specialtyHi: string;
  banner: string;
  items: ClothingItem[];
  shopType?: 'boutique' | 'jewellery' | 'footwear';
}

export interface ClothingOrderItem {
  item: ClothingItem;
  quantity: number;
  selectedSize: string;
  customStitching?: boolean;
}

export interface ClothingOrder {
  id: string;
  boutiqueId: string;
  boutiqueName: string;
  boutiqueNameHi: string;
  items: ClothingOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'UPI' | 'COD';
  status: 'processing' | 'tailoring' | 'dispatched' | 'delivered';
  date: string;
}

export interface ServiceArea {
  id: string;
  area_name: string;
  pincode: string;
  city: string;
  state: string;
  delivery_charge: number;
  free_delivery_above: number;
  minimum_order_amount: number;
  estimated_delivery_time: string;
  max_distance_km: number;
  polygon_coordinates: { lat: number; lng: number }[];
  status: 'Active' | 'Inactive';
  village_locality?: string;
  created_at: string;
  updated_at: string;
  total_orders: number;
  monthly_orders: number;
  active_customers: number;
  revenue: number;
  average_delivery_time: string;
  cancellation_rate: number; // e.g. 2.4 (for 2.4%)
}

export interface ServiceAreaAuditLog {
  id: string;
  area_id: string;
  area_name: string;
  action: string;
  details: string;
  changed_by: string;
  timestamp: string;
}

export interface ScratchCard {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productNameHi: string;
  discountPercentage: number;
  isScratched: boolean;
  isUsed: boolean;
  createdAt: string;
  storeId: string;
}export interface Doctor {
  id: string;
  name: string;
  nameHi: string;
  specialty: string;
  specialtyHi: string;
  experience: number;
  rating: number;
  clinicName: string;
  clinicNameHi: string;
  address: string;
  addressHi: string;
  consultationFee: number;
  telehealthFee: number;
  availableTimeslots: string[];
  banner: string;
  isTelehealthAvailable: boolean;
  isClinicBookingAvailable: boolean;
  upiId?: string;
}

export interface DoctorAppointment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentType: 'telehealth' | 'clinic';
  date: string;
  timeslot: string;
  feePaid: number;
  paymentStatus: 'paid' | 'pending';
  status: 'booked' | 'completed' | 'cancelled';
  telehealthLink?: string;
  prescription?: string;
}

export interface LocalService {
  id: string;
  category: 'beauty' | 'tailor' | 'plumber' | 'electrician' | 'mechanic';
  name: string;
  nameHi: string;
  phone: string;
  experience: number;
  rating: number;
  address: string;
  addressHi: string;
  baseCharge: number;
  available: boolean;
  banner: string;
}

export interface LocalServiceBooking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  serviceName: string;
  category: string;
  date: string;
  timeslot: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  address: string;
  notes?: string;
}
