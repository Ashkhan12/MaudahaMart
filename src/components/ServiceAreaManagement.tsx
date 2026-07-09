/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Sliders, 
  TrendingUp, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Save, 
  Info, 
  Globe, 
  Warehouse, 
  Clock, 
  Eye, 
  Map as MapIcon, 
  List, 
  FileText, 
  Check, 
  Users, 
  Activity, 
  ChevronRight, 
  HelpCircle,
  Undo
} from 'lucide-react';
import { ServiceArea, ServiceAreaAuditLog, Language, Order } from '../types';

interface ServiceAreaManagementProps {
  language: Language;
  orders: Order[]; // to check active orders
  onAddActivity?: (userId: string, actionEn: string, actionHi: string) => void;
}

// Coordinate mappings for Maudaha (UP)
// Center of Maudaha Town: 25.6815 N, 80.1132 E
const MAP_CENTER = { lat: 25.6815, lng: 80.1132 };

// Known local villages/areas around Maudaha with actual coordinates
const LOCAL_SITES = [
  { name: "Maudaha Town Centre", nameHi: "मौदहा नगर केंद्र", lat: 25.6815, lng: 80.1132, pop: 45000, desc: "Main commercial and residential center" },
  { name: "Husain Ganj", nameHi: "हुसैन गंज", lat: 25.6945, lng: 80.1082, pop: 8500, desc: "North-west residential expansion" },
  { name: "Ragauli", nameHi: "रागौल", lat: 25.6605, lng: 80.1255, pop: 12000, desc: "Southern agricultural & brick-kiln suburb" },
  { name: "Chhani", nameHi: "छानी", lat: 25.7150, lng: 80.1450, pop: 15000, desc: "Northeast highway village node" },
  { name: "Silauli", nameHi: "सिलौली", lat: 25.6580, lng: 80.0880, pop: 6200, desc: "Southwest boundary village" },
  { name: "Sisolar", nameHi: "सिसोलर", lat: 25.6150, lng: 80.0550, pop: 18000, desc: "Distant southwest trading outpost" },
  { name: "Khanna", nameHi: "खन्ना", lat: 25.7510, lng: 80.1650, pop: 22000, desc: "North major junction & bypass" },
  { name: "Ghaura", nameHi: "घौरा", lat: 25.6980, lng: 80.0750, pop: 4800, desc: "Western dairy farms settlement" },
  { name: "Rahmanpur", nameHi: "रहमानपुर", lat: 25.6720, lng: 80.1550, pop: 5400, desc: "East fringe agricultural ward" }
];

// Initial seeded Service Areas
const INITIAL_SERVICE_AREAS: ServiceArea[] = [
  {
    id: "sa-1",
    area_name: "Maudaha Town Centre",
    pincode: "210424",
    city: "Maudaha",
    state: "Uttar Pradesh",
    delivery_charge: 15,
    free_delivery_above: 299,
    minimum_order_amount: 99,
    estimated_delivery_time: "15-25 mins",
    max_distance_km: 3.5,
    status: "Active",
    village_locality: "Naya Bazar, Devi Mandir, Station Road, Qila area",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-06-15T14:30:00Z",
    total_orders: 1420,
    monthly_orders: 340,
    active_customers: 680,
    revenue: 245300,
    average_delivery_time: "18 mins",
    cancellation_rate: 1.2,
    polygon_coordinates: [
      { lat: 25.695, lng: 80.100 },
      { lat: 25.695, lng: 80.130 },
      { lat: 25.670, lng: 80.130 },
      { lat: 25.670, lng: 80.100 }
    ]
  },
  {
    id: "sa-2",
    area_name: "Husain Ganj & North Ward",
    pincode: "210424",
    city: "Maudaha",
    state: "Uttar Pradesh",
    delivery_charge: 20,
    free_delivery_above: 399,
    minimum_order_amount: 149,
    estimated_delivery_time: "20-35 mins",
    max_distance_km: 5.0,
    status: "Active",
    village_locality: "Husain Ganj, Galla Mandi, bypass links",
    created_at: "2026-02-15T11:20:00Z",
    updated_at: "2026-05-10T09:15:00Z",
    total_orders: 680,
    monthly_orders: 180,
    active_customers: 320,
    revenue: 112800,
    average_delivery_time: "24 mins",
    cancellation_rate: 1.8,
    polygon_coordinates: [
      { lat: 25.710, lng: 80.090 },
      { lat: 25.710, lng: 80.120 },
      { lat: 25.692, lng: 80.120 },
      { lat: 25.692, lng: 80.090 }
    ]
  },
  {
    id: "sa-3",
    area_name: "Ragauli South Suburb",
    pincode: "210424",
    city: "Maudaha",
    state: "Uttar Pradesh",
    delivery_charge: 30,
    free_delivery_above: 499,
    minimum_order_amount: 199,
    estimated_delivery_time: "30-45 mins",
    max_distance_km: 8.0,
    status: "Active",
    village_locality: "Ragauli proper, bypass warehouse belt",
    created_at: "2026-03-20T14:45:00Z",
    updated_at: "2026-03-20T14:45:00Z",
    total_orders: 310,
    monthly_orders: 75,
    active_customers: 140,
    revenue: 54200,
    average_delivery_time: "36 mins",
    cancellation_rate: 2.1,
    polygon_coordinates: [
      { lat: 25.670, lng: 80.115 },
      { lat: 25.670, lng: 80.140 },
      { lat: 25.650, lng: 80.140 },
      { lat: 25.650, lng: 80.115 }
    ]
  },
  {
    id: "sa-4",
    area_name: "Chhani Border Zone",
    pincode: "210424",
    city: "Maudaha",
    state: "Uttar Pradesh",
    delivery_charge: 45,
    free_delivery_above: 599,
    minimum_order_amount: 249,
    estimated_delivery_time: "45-60 mins",
    max_distance_km: 12.0,
    status: "Inactive",
    village_locality: "Chhani Kalan village, NH-34 checkpost",
    created_at: "2026-04-12T08:30:00Z",
    updated_at: "2026-06-01T11:45:00Z",
    total_orders: 120,
    monthly_orders: 25,
    active_customers: 55,
    revenue: 21500,
    average_delivery_time: "52 mins",
    cancellation_rate: 3.5,
    polygon_coordinates: [
      { lat: 25.730, lng: 80.130 },
      { lat: 25.730, lng: 80.160 },
      { lat: 25.700, lng: 80.160 },
      { lat: 25.700, lng: 80.130 }
    ]
  }
];

const INITIAL_AUDIT_LOGS: ServiceAreaAuditLog[] = [
  {
    id: "log-1",
    area_id: "sa-1",
    area_name: "Maudaha Town Centre",
    action: "Update",
    details: "Minimum order amount adjusted from ₹79 to ₹99. Delivery charge adjusted from ₹10 to ₹15.",
    changed_by: "SuperAdmin (Anand)",
    timestamp: "2026-06-15T14:30:00Z"
  },
  {
    id: "log-2",
    area_id: "sa-4",
    area_name: "Chhani Border Zone",
    action: "Disable",
    details: "Temporarily disabled delivery operations due to severe monsoon waterlogging on bypass.",
    changed_by: "OpsManager (Raman)",
    timestamp: "2026-06-01T11:45:00Z"
  },
  {
    id: "log-3",
    area_id: "sa-2",
    area_name: "Husain Ganj & North Ward",
    action: "Create",
    details: "Registered new service area with initial coordinates covering the North bypass bypass link.",
    changed_by: "SuperAdmin (Anand)",
    timestamp: "2026-02-15T11:20:00Z"
  }
];

// Flat earth distance calculation helper
const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function ServiceAreaManagement({ language, orders, onAddActivity }: ServiceAreaManagementProps) {
  // Persistence state
  const [areas, setAreas] = useState<ServiceArea[]>(() => {
    const saved = localStorage.getItem('mau_service_areas');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_AREAS;
  });

  const [auditLogs, setAuditLogs] = useState<ServiceAreaAuditLog[]>(() => {
    const saved = localStorage.getItem('mau_service_area_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mau_service_areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('mau_service_area_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'map' | 'logs'>('list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [orderCountFilter, setOrderCountFilter] = useState<'All' | 'High' | 'Low'>('All');
  const [revenueFilter, setRevenueFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  // Selected Area for detailed Map or Editing
  const [selectedAreaId, setSelectedAreaId] = useState<string>("sa-1");
  const selectedArea = areas.find(a => a.id === selectedAreaId) || areas[0] || null;

  // Active Radius control state
  const [radiusKm, setRadiusKm] = useState<number>(5.5);

  // Form states (Add / Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState('');

  const [formId, setFormId] = useState('');
  const [formAreaName, setFormAreaName] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [formCity, setFormCity] = useState('Maudaha');
  const [formState, setFormState] = useState('Uttar Pradesh');
  const [formDeliveryCharge, setFormDeliveryCharge] = useState(20);
  const [formFreeDeliveryAbove, setFormFreeDeliveryAbove] = useState(399);
  const [formMinimumOrder, setFormMinimumOrder] = useState(149);
  const [formEstDeliveryTime, setFormEstDeliveryTime] = useState('25-35 mins');
  const [formMaxDistance, setFormMaxDistance] = useState(5);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formVillageLocality, setFormVillageLocality] = useState('');

  // Bulk operation states
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Safety controls dialog states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState<'disable' | 'delete'>('disable');
  const [targetAreaId, setTargetAreaId] = useState<string | null>(null);
  const [modalWarning, setModalWarning] = useState('');
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Map dragging coordinate reference
  const mapContainerRef = useRef<SVGSVGElement | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Convert coordinate to/from SVG pixel map (500x500 box centered on Maudaha)
  const latToY = (lat: number) => {
    const diff = lat - MAP_CENTER.lat;
    return 250 - diff * 1900; // scaling factor
  };
  const lngToX = (lng: number) => {
    const diff = lng - MAP_CENTER.lng;
    return 250 + diff * 1900;
  };
  const yToLat = (y: number) => {
    const diff = 250 - y;
    return MAP_CENTER.lat + diff / 1900;
  };
  const xToLng = (x: number) => {
    const diff = x - 250;
    return MAP_CENTER.lng + diff / 1900;
  };

  // Log audit helper
  const addAuditLog = (areaId: string, areaName: string, action: string, details: string) => {
    const newLog: ServiceAreaAuditLog = {
      id: "log-" + Date.now(),
      area_id: areaId,
      area_name: areaName,
      action,
      details,
      changed_by: "SuperAdmin (Anand)",
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper: check pending orders for an area (for Maudaha we can map active orders or generate mock orders associated with the area)
  // Let's assume some mock pending orders exist for sa-1 (3 orders) and sa-2 (1 order)
  const getPendingOrders = (areaId: string) => {
    if (areaId === 'sa-1') return 3;
    if (areaId === 'sa-2') return 1;
    return 0;
  };

  // Filtered areas
  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.area_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          area.pincode.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || area.status === statusFilter;
    
    let matchesOrders = true;
    if (orderCountFilter === 'High') matchesOrders = area.total_orders >= 500;
    if (orderCountFilter === 'Low') matchesOrders = area.total_orders < 500;

    let matchesRevenue = true;
    if (revenueFilter === 'High') matchesRevenue = area.revenue >= 150000;
    if (revenueFilter === 'Medium') matchesRevenue = area.revenue >= 50000 && area.revenue < 150000;
    if (revenueFilter === 'Low') matchesRevenue = area.revenue < 50000;

    return matchesSearch && matchesStatus && matchesOrders && matchesRevenue;
  });

  // Toggle selection
  const handleSelectRow = (id: string) => {
    setSelectedRowIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredAreas.map(a => a.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  // Add / Edit submission
  const openEditForm = (area: ServiceArea) => {
    setFormId(area.id);
    setFormAreaName(area.area_name);
    setFormPincode(area.pincode);
    setFormCity(area.city);
    setFormState(area.state);
    setFormDeliveryCharge(area.delivery_charge);
    setFormFreeDeliveryAbove(area.free_delivery_above);
    setFormMinimumOrder(area.minimum_order_amount);
    setFormEstDeliveryTime(area.estimated_delivery_time);
    setFormMaxDistance(area.max_distance_km);
    setFormStatus(area.status);
    setFormVillageLocality(area.village_locality || '');
    setFormError('');
    setIsEditing(true);
    setIsAdding(false);
  };

  const openAddForm = () => {
    setFormId('');
    setFormAreaName('');
    setFormPincode('');
    setFormCity('Maudaha');
    setFormState('Uttar Pradesh');
    setFormDeliveryCharge(20);
    setFormFreeDeliveryAbove(399);
    setFormMinimumOrder(149);
    setFormEstDeliveryTime('25-35 mins');
    setFormMaxDistance(5);
    setFormStatus('Active');
    setFormVillageLocality('');
    setFormError('');
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formAreaName.trim()) {
      setFormError(language === 'en' ? 'Area name is required' : 'क्षेत्र का नाम आवश्यक है');
      return;
    }
    if (!/^\d{6}$/.test(formPincode)) {
      setFormError(language === 'en' ? 'Pincode must be exactly 6 digits' : 'पिनकोड ठीक 6 अंकों का होना चाहिए');
      return;
    }

    // Pincode validation: warn if duplicate pincode in another active area
    const duplicate = areas.find(a => a.pincode === formPincode && a.id !== formId && a.status === 'Active');
    if (duplicate && formStatus === 'Active') {
      // Allow saving, but show a custom alert warning in form log
    }

    if (isAdding) {
      // Create polygon around Maudaha center with offsets
      const offset = 0.015;
      const defaultPolygon = [
        { lat: MAP_CENTER.lat + offset, lng: MAP_CENTER.lng - offset },
        { lat: MAP_CENTER.lat + offset, lng: MAP_CENTER.lng + offset },
        { lat: MAP_CENTER.lat - offset, lng: MAP_CENTER.lng + offset },
        { lat: MAP_CENTER.lat - offset, lng: MAP_CENTER.lng - offset }
      ];

      const newArea: ServiceArea = {
        id: "sa-" + Date.now(),
        area_name: formAreaName,
        pincode: formPincode,
        city: formCity,
        state: formState,
        delivery_charge: Number(formDeliveryCharge),
        free_delivery_above: Number(formFreeDeliveryAbove),
        minimum_order_amount: Number(formMinimumOrder),
        estimated_delivery_time: formEstDeliveryTime,
        max_distance_km: Number(formMaxDistance),
        polygon_coordinates: defaultPolygon,
        status: formStatus,
        village_locality: formVillageLocality,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_orders: 0,
        monthly_orders: 0,
        active_customers: 0,
        revenue: 0,
        average_delivery_time: formEstDeliveryTime,
        cancellation_rate: 0
      };

      setAreas(prev => [...prev, newArea]);
      addAuditLog(newArea.id, newArea.area_name, "Create", `Created new service area with pincode ${newArea.pincode}`);
      if (onAddActivity) {
        onAddActivity("admin", `Created delivery area ${newArea.area_name}`, `नया वितरण क्षेत्र ${newArea.area_name} बनाया गया`);
      }
      setIsAdding(false);
    } else {
      // Update
      setAreas(prev => prev.map(a => {
        if (a.id === formId) {
          const updated = {
            ...a,
            area_name: formAreaName,
            pincode: formPincode,
            city: formCity,
            state: formState,
            delivery_charge: Number(formDeliveryCharge),
            free_delivery_above: Number(formFreeDeliveryAbove),
            minimum_order_amount: Number(formMinimumOrder),
            estimated_delivery_time: formEstDeliveryTime,
            max_distance_km: Number(formMaxDistance),
            status: formStatus,
            village_locality: formVillageLocality,
            updated_at: new Date().toISOString()
          };
          
          let changeDetails = `Updated configurations: Pincode: ${formPincode}, Delivery Charge: ₹${formDeliveryCharge}, Status: ${formStatus}`;
          addAuditLog(a.id, formAreaName, "Update", changeDetails);
          return updated;
        }
        return a;
      }));
      if (onAddActivity) {
        onAddActivity("admin", `Modified delivery area settings for ${formAreaName}`, `${formAreaName} की डिलीवरी क्षेत्र सेटिंग्स बदली गईं`);
      }
      setIsEditing(false);
    }
  };

  // Safety dialog controls
  const handleToggleStatus = (id: string, currentStatus: 'Active' | 'Inactive') => {
    if (currentStatus === 'Active') {
      const pending = getPendingOrders(id);
      if (pending > 0) {
        setTargetAreaId(id);
        setModalType('disable');
        setPendingOrdersCount(pending);
        setModalWarning(language === 'en' 
          ? `This area has ${pending} active pending order(s) right now! Disabling it will prevent customers from checking out in this region but will preserve current order routes.` 
          : `इस क्षेत्र में अभी ${pending} सक्रिय लंबित ऑर्डर हैं! इसे अक्षम करने से नए ऑर्डर रुकेंगे लेकिन सक्रिय ऑर्डर प्रभावित नहीं होंगे।`
        );
        setShowConfirmModal(true);
      } else {
        // Direct disable
        setAreas(prev => prev.map(a => a.id === id ? { ...a, status: 'Inactive', updated_at: new Date().toISOString() } : a));
        const area = areas.find(a => a.id === id);
        addAuditLog(id, area?.area_name || '', "Disable", "Disabled delivery service in area (No active pending orders)");
      }
    } else {
      // Direct enable
      setAreas(prev => prev.map(a => a.id === id ? { ...a, status: 'Active', updated_at: new Date().toISOString() } : a));
      const area = areas.find(a => a.id === id);
      addAuditLog(id, area?.area_name || '', "Enable", "Re-enabled delivery service in area");
    }
  };

  const handleDeleteArea = (id: string) => {
    const pending = getPendingOrders(id);
    setTargetAreaId(id);
    setModalType('delete');
    setPendingOrdersCount(pending);
    
    if (pending > 0) {
      setModalWarning(language === 'en' 
        ? `CRITICAL ERROR: Deletion is blocked! There are ${pending} active pending orders inside this service area. You must fulfill or cancel these orders before deleting this boundary.` 
        : `महत्वपूर्ण चेतावनी: विलोपन अवरुद्ध है! इस क्षेत्र में ${pending} सक्रिय ऑर्डर लंबित हैं। हटाने से पहले इन्हें पूरा या रद्द करें।`
      );
    } else {
      setModalWarning(language === 'en' 
        ? `Are you sure you want to permanently delete this service area? All delivery boundary coordinates will be removed. This action is irreversible.` 
        : `क्या आप वाकई इस वितरण क्षेत्र को स्थायी रूप से हटाना चाहते हैं? सभी सीमा निर्देशांक हटा दिए जाएंगे। यह क्रिया अपरिवर्तनीय है।`
      );
    }
    setShowConfirmModal(true);
  };

  const confirmSafetyAction = () => {
    if (!targetAreaId) return;

    const area = areas.find(a => a.id === targetAreaId);
    if (!area) return;

    if (modalType === 'disable') {
      setAreas(prev => prev.map(a => a.id === targetAreaId ? { ...a, status: 'Inactive', updated_at: new Date().toISOString() } : a));
      addAuditLog(targetAreaId, area.area_name, "Disable", `Forced disabled with ${pendingOrdersCount} pending active orders.`);
    } else if (modalType === 'delete') {
      if (pendingOrdersCount > 0) {
        // Blocked delete
        setShowConfirmModal(false);
        alert(language === 'en' 
          ? 'Cannot delete service area with pending active orders! Fulfill the orders first.' 
          : 'सक्रिय लंबित ऑर्डरों के कारण सेवा क्षेत्र को नहीं हटाया जा सकता!'
        );
        return;
      }
      setAreas(prev => prev.filter(a => a.id !== targetAreaId));
      addAuditLog(targetAreaId, area.area_name, "Delete", `Permanently deleted service area boundary from catalog.`);
      if (selectedAreaId === targetAreaId) {
        const remaining = areas.filter(a => a.id !== targetAreaId);
        if (remaining.length > 0) setSelectedAreaId(remaining[0].id);
      }
    }
    setShowConfirmModal(false);
    setTargetAreaId(null);
  };

  // Bulk Operations
  const handleApplyBulkAction = () => {
    if (selectedRowIds.length === 0) {
      alert(language === 'en' ? 'No service areas selected' : 'कोई सेवा क्षेत्र चयनित नहीं है');
      return;
    }

    if (bulkAction === 'enable') {
      setAreas(prev => prev.map(a => selectedRowIds.includes(a.id) ? { ...a, status: 'Active' } : a));
      selectedRowIds.forEach(id => {
        const area = areas.find(a => a.id === id);
        addAuditLog(id, area?.area_name || '', "Enable", "Bulk enabled via Admin console");
      });
      setSelectedRowIds([]);
      setBulkAction('');
    } else if (bulkAction === 'disable') {
      // Check if any selected area has active orders
      const areasWithOrders = selectedRowIds.filter(id => getPendingOrders(id) > 0);
      if (areasWithOrders.length > 0) {
        const names = areasWithOrders.map(id => areas.find(a => a.id === id)?.area_name).join(', ');
        alert(language === 'en' 
          ? `Bulk action stopped! The following areas have pending active orders: ${names}. Fulfill them before bulk disabling.` 
          : `थोक कार्रवाई रुकी! निम्नलिखित क्षेत्रों में लंबित आर्डर हैं: ${names}।`
        );
        return;
      }

      setAreas(prev => prev.map(a => selectedRowIds.includes(a.id) ? { ...a, status: 'Inactive' } : a));
      selectedRowIds.forEach(id => {
        const area = areas.find(a => a.id === id);
        addAuditLog(id, area?.area_name || '', "Disable", "Bulk disabled via Admin console");
      });
      setSelectedRowIds([]);
      setBulkAction('');
    } else if (bulkAction === 'delete') {
      const areasWithOrders = selectedRowIds.filter(id => getPendingOrders(id) > 0);
      if (areasWithOrders.length > 0) {
        const names = areasWithOrders.map(id => areas.find(a => a.id === id)?.area_name).join(', ');
        alert(language === 'en' 
          ? `Bulk deletion blocked! Active pending orders exist in: ${names}.` 
          : `थोक विलोपन अवरुद्ध! इनमें सक्रिय आर्डर हैं: ${names}।`
        );
        return;
      }

      if (confirm(language === 'en' ? `Are you sure you want to bulk-delete ${selectedRowIds.length} service area(s)?` : `क्या आप वाकई ${selectedRowIds.length} सेवा क्षेत्रों को थोक में हटाना चाहते हैं?`)) {
        setAreas(prev => prev.filter(a => !selectedRowIds.includes(a.id)));
        selectedRowIds.forEach(id => {
          const area = areas.find(a => a.id === id);
          addAuditLog(id, area?.area_name || '', "Delete", "Bulk deleted permanently");
        });
        setSelectedRowIds([]);
        setBulkAction('');
      }
    }
  };

  // CSV Exporter (Real client-side downloader)
  const exportToCSV = () => {
    const headers = ["ID", "Area Name", "Pincode", "City", "State", "Status", "Delivery Charge", "Min Order Amount", "Free Delivery Above", "Est. Time", "Max Distance KM", "Total Orders", "Active Customers", "Revenue"];
    const rows = areas.map(a => [
      a.id,
      `"${a.area_name}"`,
      a.pincode,
      a.city,
      a.state,
      a.status,
      a.delivery_charge,
      a.minimum_order_amount,
      a.free_delivery_above,
      `"${a.estimated_delivery_time}"`,
      a.max_distance_km,
      a.total_orders,
      a.active_customers,
      a.revenue
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maudaha_mart_service_areas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onAddActivity) {
      onAddActivity("admin", "Exported delivery service area configuration as CSV sheet", "सेवा क्षेत्र विन्यास को CSV शीट के रूप में निर्यात किया");
    }
  };

  // Map mouse event trackers for polygon dragging
  const handleMapMouseDown = (index: number) => {
    setDraggingIndex(index);
  };

  const handleMapMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIndex === null || !selectedArea || !mapContainerRef.current) return;

    // Get mouse position inside SVG
    const rect = mapContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Constrain inside map box (0 to 500)
    const boundedX = Math.max(10, Math.min(490, mouseX));
    const boundedY = Math.max(10, Math.min(490, mouseY));

    // Convert pixel coordinates to lat/lng
    const newLat = yToLat(boundedY);
    const newLng = xToLng(boundedX);

    // Update coordinate in the active polygon
    const updatedCoordinates = [...selectedArea.polygon_coordinates];
    updatedCoordinates[draggingIndex] = { lat: Number(newLat.toFixed(5)), lng: Number(newLng.toFixed(5)) };

    setAreas(prev => prev.map(a => {
      if (a.id === selectedArea.id) {
        return {
          ...a,
          polygon_coordinates: updatedCoordinates,
          updated_at: new Date().toISOString()
        };
      }
      return a;
    }));
  };

  const handleMapMouseUp = () => {
    if (draggingIndex !== null && selectedArea) {
      addAuditLog(selectedArea.id, selectedArea.area_name, "Map Edit", `Dragged boundary polygon vertex ${draggingIndex + 1} to customize delivery coordinates.`);
    }
    setDraggingIndex(null);
  };

  // Quick reset / auto-align polygon to beautiful default circle bounds
  const resetAreaPolygon = () => {
    if (!selectedArea) return;
    const offset = selectedArea.max_distance_km * 0.0035; // mapping KM to Lat/Lng offsets
    const resetPoly = [
      { lat: MAP_CENTER.lat + offset, lng: MAP_CENTER.lng - offset },
      { lat: MAP_CENTER.lat + offset, lng: MAP_CENTER.lng + offset },
      { lat: MAP_CENTER.lat - offset, lng: MAP_CENTER.lng + offset },
      { lat: MAP_CENTER.lat - offset, lng: MAP_CENTER.lng - offset }
    ];

    setAreas(prev => prev.map(a => {
      if (a.id === selectedArea.id) {
        return {
          ...a,
          polygon_coordinates: resetPoly,
          updated_at: new Date().toISOString()
        };
      }
      return a;
    }));
    addAuditLog(selectedArea.id, selectedArea.area_name, "Map Reset", `Reset polygon coordinates to standard delivery radius bounds (${selectedArea.max_distance_km} KM).`);
  };

  // Add click to add custom polygon vertex point
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only allow adding vertex if clicking map without dragging, and with shift key or custom mode
    if (draggingIndex !== null || !selectedArea || !mapContainerRef.current) return;
    
    // If clicking close to existing point, don't add
    const rect = mapContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Verify if clicked a node
    let clickedNode = false;
    selectedArea.polygon_coordinates.forEach((coord) => {
      const px = lngToX(coord.lng);
      const py = latToY(coord.lat);
      const dist = Math.sqrt((px - mouseX) ** 2 + (py - mouseY) ** 2);
      if (dist < 15) clickedNode = true;
    });

    if (clickedNode) return;

    // Add point to polygon if double click or Alt key pressed
    if (e.altKey || e.shiftKey) {
      const clickLat = yToLat(mouseY);
      const clickLng = xToLng(mouseX);
      const updated = [...selectedArea.polygon_coordinates, { lat: Number(clickLat.toFixed(5)), lng: Number(clickLng.toFixed(5)) }];
      
      setAreas(prev => prev.map(a => {
        if (a.id === selectedArea.id) {
          return {
            ...a,
            polygon_coordinates: updated,
            updated_at: new Date().toISOString()
          };
        }
        return a;
      }));
      addAuditLog(selectedArea.id, selectedArea.area_name, "Map Vertex Add", `Added vertex point ${updated.length} to boundary polygon.`);
    }
  };

  // Dynamic calculations based on slider radius (1 KM to 50 KM)
  // Let's check which local villages fall inside the radius
  const coveredSites = LOCAL_SITES.filter(site => {
    const dist = getDistanceKm(MAP_CENTER.lat, MAP_CENTER.lng, site.lat, site.lng);
    return dist <= radiusKm;
  });

  const totalPopulationCovered = coveredSites.reduce((sum, s) => sum + s.pop, 0);
  const estimatedCustomers = Math.round(totalPopulationCovered * 0.18); // 18% penetration rate in Maudaha

  // Calculations for KPI Cards
  const totalAreas = areas.length;
  const activeAreasCount = areas.filter(a => a.status === 'Active').length;
  const inactiveAreasCount = areas.filter(a => a.status === 'Inactive').length;
  const totalOrdersVal = areas.reduce((sum, a) => sum + a.total_orders, 0);
  const todayOrdersVal = Math.round(areas.reduce((sum, a) => sum + a.monthly_orders, 0) / 30);
  const totalCustomersVal = areas.reduce((sum, a) => sum + a.active_customers, 0);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
            <h2 className="text-lg font-black tracking-tight uppercase">
              {language === 'en' ? 'Service Area Management' : 'सेवा क्षेत्र प्रबंधन'}
            </h2>
            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {language === 'en' ? 'Maudaha Hub Only' : 'केवल मौदहा हब'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'en' 
              ? 'Define geofenced delivery boundaries, regulate charges, review village demographics coverage, and monitor local cancellation rates.' 
              : 'भू-सीमाएं परिभाषित करें, शुल्क नियंत्रित करें, गांव जनसांख्यिकी कवरेज की समीक्षा करें और स्थानीय रद्दीकरण दरों की निगरानी करें।'}
          </p>
        </div>

        {/* Top tab menu toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveSubTab('list'); setIsEditing(false); setIsAdding(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'list' && !isEditing && !isAdding
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'Area List' : 'क्षेत्र सूची'}</span>
          </button>
          <button 
            onClick={() => { setActiveSubTab('map'); setIsEditing(false); setIsAdding(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'map'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'Interactive GIS Map' : 'जीआईएस मानचित्र'}</span>
          </button>
          <button 
            onClick={() => { setActiveSubTab('logs'); setIsEditing(false); setIsAdding(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'logs'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'Audit Logs' : 'ऑडिट लॉग'}</span>
          </button>
        </div>
      </div>

      {/* 1. Dashboard KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Total Areas' : 'कुल क्षेत्र'}</span>
          <p className="text-xl font-mono font-black mt-2 text-slate-800 dark:text-slate-100">{totalAreas}</p>
          <span className="text-[9px] text-slate-500 mt-1">{language === 'en' ? 'Maudaha block limits' : 'मौदहा ब्लॉक सीमा'}</span>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Active Areas' : 'सक्रिय क्षेत्र'}</span>
          <p className="text-xl font-mono font-black mt-2 text-emerald-600 dark:text-emerald-400">{activeAreasCount}</p>
          <span className="text-[9px] text-emerald-600/80 font-bold mt-1">● Live Deliveries</span>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Inactive Areas' : 'अक्रिय क्षेत्र'}</span>
          <p className="text-xl font-mono font-black mt-2 text-rose-500">{inactiveAreasCount}</p>
          <span className="text-[9px] text-slate-500 mt-1">{language === 'en' ? 'Operations paused' : 'संचालन स्थगित'}</span>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Total Orders' : 'कुल ऑर्डर'}</span>
          <p className="text-xl font-mono font-black mt-2 text-slate-800 dark:text-slate-100">{totalOrdersVal.toLocaleString()}</p>
          <span className="text-[9px] text-emerald-600 font-bold mt-1">99.8% Fulfill rate</span>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? "Today's Orders" : 'आज के ऑर्डर'}</span>
          <p className="text-xl font-mono font-black mt-2 text-amber-500">{todayOrdersVal}</p>
          <span className="text-[9px] text-slate-500 mt-1">{language === 'en' ? 'Running average' : 'चल रहा औसत'}</span>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Total Customers' : 'कुल ग्राहक'}</span>
          <p className="text-xl font-mono font-black mt-2 text-indigo-500">{totalCustomersVal}</p>
          <span className="text-[9px] text-indigo-500/80 font-bold mt-1">Active Accounts</span>
        </div>
      </div>

      {/* 2. Main Content Split Panel (Form, Map, List depending on selection) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Area list or Logs or main details) */}
        <div className={`space-y-6 ${activeSubTab === 'map' ? 'lg:col-span-4' : 'lg:col-span-8'}`}>
          
          {/* Add / Edit Form override */}
          {isEditing || isAdding ? (
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Edit2 className="h-3.5 w-3.5 text-emerald-600" />
                  {isAdding 
                    ? (language === 'en' ? 'Register New Service Boundary' : 'नया सेवा सीमा पंजीकृत करें')
                    : (language === 'en' ? `Edit Service Area - ${formAreaName}` : `सेवा क्षेत्र संपादित करें - ${formAreaName}`)
                  }
                </h3>
                <button 
                  onClick={() => { setIsEditing(false); setIsAdding(false); }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 p-2.5 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Area Name *' : 'क्षेत्र का नाम *'}
                    </label>
                    <input 
                      type="text" 
                      value={formAreaName}
                      onChange={(e) => setFormAreaName(e.target.value)}
                      placeholder={language === 'en' ? "e.g., Maudaha Town East" : "जैसे, मौदहा पूर्व"}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Pincode *' : 'पिनकोड *'}
                    </label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={formPincode}
                      onChange={(e) => setFormPincode(e.target.value)}
                      placeholder="210424"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {language === 'en' ? 'Village / Localities Covered' : 'कवर किए गए गांव / इलाके'}
                  </label>
                  <input 
                    type="text" 
                    value={formVillageLocality}
                    onChange={(e) => setFormVillageLocality(e.target.value)}
                    placeholder={language === 'en' ? "List main neighborhoods, e.g. Devi Mandir Ward, Rahmanpur Road" : "मुख्य इलाकों को सूचीबद्ध करें"}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Delivery Charge (₹)' : 'वितरण शुल्क (₹)'}
                    </label>
                    <input 
                      type="number" 
                      min={0}
                      value={formDeliveryCharge}
                      onChange={(e) => setFormDeliveryCharge(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Min Order (₹)' : 'न्यूनतम ऑर्डर (₹)'}
                    </label>
                    <input 
                      type="number" 
                      min={0}
                      value={formMinimumOrder}
                      onChange={(e) => setFormMinimumOrder(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Free Delivery Above (₹)' : 'इस राशि से ऊपर मुफ्त वितरण (₹)'}
                    </label>
                    <input 
                      type="number" 
                      min={0}
                      value={formFreeDeliveryAbove}
                      onChange={(e) => setFormFreeDeliveryAbove(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Est. Time' : 'अनुमानित समय'}
                    </label>
                    <input 
                      type="text" 
                      value={formEstDeliveryTime}
                      onChange={(e) => setFormEstDeliveryTime(e.target.value)}
                      placeholder="15-25 mins"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Max Radius (KM)' : 'अधिकतम त्रिज्या (KM)'}
                    </label>
                    <input 
                      type="number" 
                      min={1}
                      max={50}
                      value={formMaxDistance}
                      onChange={(e) => setFormMaxDistance(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {language === 'en' ? 'Status' : 'स्थिति'}
                    </label>
                    <select 
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                    >
                      <option value="Active">{language === 'en' ? 'Active' : 'सक्रिय'}</option>
                      <option value="Inactive">{language === 'en' ? 'Inactive' : 'अक्रिय'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">City</label>
                    <input type="text" disabled value={formCity} className="w-full bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">State</label>
                    <input type="text" disabled value={formState} className="w-full bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                  <button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setIsAdding(false); }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>
                  <button 
                    type="submit" 
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs shadow-emerald-600/10"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'Save Service Area' : 'सेवा क्षेत्र सहेजें'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : activeSubTab === 'logs' ? (
            
            /* --- Audit Logs Sub-tab --- */
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  {language === 'en' ? 'Service Area Administrative Audit Logs' : 'सेवा क्षेत्र प्रशासनिक ऑडिट लॉग'}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {auditLogs.length} events logged
                </span>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 border-l border-slate-100 dark:border-slate-900 pb-4 last:pb-0">
                    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-500 shadow-xs" />
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-700 dark:text-slate-200">{log.changed_by}</span>
                        <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${
                          log.action === 'Create' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' :
                          log.action === 'Disable' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40' :
                          log.action === 'Delete' ? 'bg-slate-100 text-slate-700 dark:bg-slate-950/40' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-950/40'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.area_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            
            /* --- Main Service Area List Tab --- */
            <div className="space-y-4">
              
              {/* Filters Panel */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between shadow-xs">
                <div className="flex flex-wrap gap-2.5 items-center">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'en' ? "Search by name or pincode..." : "नाम या पिनकोड से खोजें..."}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden dark:text-white w-48 font-bold"
                  />

                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold"
                  >
                    <option value="All">{language === 'en' ? 'All Status' : 'सभी स्थिति'}</option>
                    <option value="Active">{language === 'en' ? 'Active' : 'सक्रिय'}</option>
                    <option value="Inactive">{language === 'en' ? 'Inactive' : 'अक्रिय'}</option>
                  </select>

                  <select 
                    value={orderCountFilter}
                    onChange={(e) => setOrderCountFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold"
                  >
                    <option value="All">{language === 'en' ? 'Orders Volume' : 'ऑर्डर मात्रा'}</option>
                    <option value="High">&gt; 500 orders</option>
                    <option value="Low">&lt; 500 orders</option>
                  </select>

                  <select 
                    value={revenueFilter}
                    onChange={(e) => setRevenueFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold"
                  >
                    <option value="All">{language === 'en' ? 'Revenue Tiers' : 'राजस्व स्तर'}</option>
                    <option value="High">₹1,50,000 +</option>
                    <option value="Medium">₹50,000 - ₹1,50,000</option>
                    <option value="Low">&lt; ₹50,000</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'CSV Export' : 'CSV निर्यात'}</span>
                  </button>

                  <button 
                    onClick={openAddForm}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-3.5 py-1.5 text-xs font-black transition shadow-xs cursor-pointer shadow-emerald-600/15"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'Add Area' : 'क्षेत्र जोड़ें'}</span>
                  </button>
                </div>
              </div>

              {/* Bulk Actions Panel */}
              {selectedRowIds.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-3 flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Selected {selectedRowIds.length} service area(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="">{language === 'en' ? 'Choose Action...' : 'कार्रवाई चुनें...'}</option>
                      <option value="enable">🟢 {language === 'en' ? 'Enable Areas' : 'क्षेत्र सक्षम करें'}</option>
                      <option value="disable">🔴 {language === 'en' ? 'Disable Areas' : 'क्षेत्र अक्षम करें'}</option>
                      <option value="delete">🗑️ {language === 'en' ? 'Delete Areas' : 'क्षेत्र हटाएं'}</option>
                    </select>
                    <button 
                      onClick={handleApplyBulkAction}
                      className="bg-amber-600 text-white hover:bg-amber-700 px-3 py-1 rounded-lg font-black text-xs transition cursor-pointer"
                    >
                      {language === 'en' ? 'Apply' : 'लागू करें'}
                    </button>
                  </div>
                </div>
              )}

              {/* Table List */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        <th className="py-3.5 px-4 w-10">
                          <input 
                            type="checkbox"
                            checked={selectedRowIds.length === filteredAreas.length && filteredAreas.length > 0}
                            onChange={handleSelectAllRows}
                            className="rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="py-3.5 px-3">{language === 'en' ? 'Area Name' : 'क्षेत्र का नाम'}</th>
                        <th className="py-3.5 px-3">Pincode</th>
                        <th className="py-3.5 px-3 text-center">Status</th>
                        <th className="py-3.5 px-3 text-right">Min Order</th>
                        <th className="py-3.5 px-3 text-right">Delivery Charge</th>
                        <th className="py-3.5 px-3">Est. Time</th>
                        <th className="py-3.5 px-3 text-right">Total Orders</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                      {filteredAreas.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                            {language === 'en' ? 'No service areas match current filter query.' : 'कोई भी सेवा क्षेत्र वर्तमान फिल्टर से मेल नहीं खाता।'}
                          </td>
                        </tr>
                      ) : (
                        filteredAreas.map((area) => {
                          const isSelected = selectedRowIds.includes(area.id);
                          const isActiveSelection = area.id === selectedAreaId;
                          
                          return (
                            <tr 
                              key={area.id} 
                              className={`hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition ${
                                isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                              } ${isActiveSelection ? 'border-l-4 border-l-emerald-500 bg-slate-50/30' : ''}`}
                            >
                              <td className="py-3 px-4">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(area.id)}
                                  className="rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-emerald-500"
                                />
                              </td>
                              <td className="py-3 px-3">
                                <div>
                                  <button 
                                    onClick={() => setSelectedAreaId(area.id)}
                                    className="font-black text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-left block focus:outline-hidden"
                                  >
                                    {area.area_name}
                                  </button>
                                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate max-w-[150px]">
                                    {area.village_locality || "Maudaha central boundary"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-500">{area.pincode}</td>
                              <td className="py-3 px-3 text-center">
                                <button 
                                  onClick={() => handleToggleStatus(area.id, area.status)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase transition cursor-pointer ${
                                    area.status === 'Active' 
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-rose-100 hover:text-rose-800 dark:hover:bg-rose-950/30' 
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-950/30'
                                  }`}
                                >
                                  {area.status === 'Active' 
                                    ? (language === 'en' ? 'Active' : 'सक्रिय') 
                                    : (language === 'en' ? 'Inactive' : 'अक्रिय')
                                  }
                                </button>
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300 font-bold">₹{area.minimum_order_amount}</td>
                              <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">₹{area.delivery_charge}</td>
                              <td className="py-3 px-3 text-slate-500 font-semibold">{area.estimated_delivery_time}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-500">{area.total_orders}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => setSelectedAreaId(area.id)}
                                    title="View Boundary on Map"
                                    className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition"
                                  >
                                    <MapIcon className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => openEditForm(area)}
                                    title="Edit configs"
                                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteArea(area.id)}
                                    title="Delete Area"
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Interactive Map controls and Radius calculations) */}
        <div className={`space-y-6 ${activeSubTab === 'map' ? 'lg:col-span-8' : 'lg:col-span-4'}`}>
          
          {/* Active Area Summary Header if in listing sub-tab */}
          {activeSubTab !== 'map' && selectedArea && (
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                    ID: {selectedArea.id}
                  </span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">
                    {selectedArea.area_name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                    📍 {selectedArea.pincode} • {selectedArea.city}, {selectedArea.state}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  selectedArea.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40'
                }`}>
                  {selectedArea.status}
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-900">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Revenue</span>
                  <p className="text-sm font-mono font-black text-slate-800 dark:text-slate-200 mt-1">
                    ₹{selectedArea.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Active Users</span>
                  <p className="text-sm font-mono font-black text-slate-800 dark:text-slate-200 mt-1">
                    {selectedArea.active_customers}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Delivery Time</span>
                  <p className="text-sm font-mono font-bold text-emerald-600 mt-1">
                    {selectedArea.average_delivery_time}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Cancellation Rate</span>
                  <p className={`text-sm font-mono font-black mt-1 ${
                    selectedArea.cancellation_rate > 2.5 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {selectedArea.cancellation_rate}%
                  </p>
                </div>
              </div>

              {/* Area boundary visual indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Boundary Boundary Points</span>
                  <span className="text-[10px] font-mono text-emerald-600">{selectedArea.polygon_coordinates.length} coordinates</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl text-[9px] font-mono text-slate-400 max-h-16 overflow-y-auto space-y-0.5">
                  {selectedArea.polygon_coordinates.map((coord, i) => (
                    <div key={i} className="flex justify-between">
                      <span>Point #{i + 1}</span>
                      <span>({coord.lat.toFixed(4)}° N, {coord.lng.toFixed(4)}° E)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setActiveSubTab('map'); }}
                  className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 py-2 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  Edit Polygon Boundary
                </button>
                <button 
                  onClick={() => openEditForm(selectedArea)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2 rounded-xl cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Map-Based Area Selection & Live preview canvas */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapIcon className="h-4 w-4 text-emerald-600" />
                  {language === 'en' ? 'Interactive GIS Polygon Boundary Editor' : 'जीआईएस सीमा विन्यास मानचित्र'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'en' 
                    ? 'Drag control handles to resize geofence. Shift-Click to append new coordinates.' 
                    : 'निर्देशांक बदलने के लिए नियंत्रण हैंडल खींचें। नया पॉइंट जोड़ने के लिए Shift-Click करें।'}
                </p>
              </div>
              
              {selectedArea && (
                <button 
                  onClick={resetAreaPolygon}
                  title="Reset Polygon bounds to default circle radius"
                  className="p-1 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <Undo className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* SVG Interactive Map Canvas */}
            <div className="relative bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner h-[380px] w-full select-none">
              
              {/* GIS Grid Coordinates */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:25px_25px] opacity-10" />

              {/* Map UI overlays */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
                <div className="text-emerald-400 font-extrabold">{language === 'en' ? 'MAP FOCUS: MAUDAHA, UP' : 'नक्शा: मौदहा, उत्तर प्रदेश'}</div>
                <div>Lat: {MAP_CENTER.lat.toFixed(4)}° N | Lng: {MAP_CENTER.lng.toFixed(4)}° E</div>
                <div>Scale: 1 KM ~ 0.009°</div>
              </div>

              {/* Map Compass */}
              <div className="absolute top-3 right-3 bg-slate-950/80 p-2 rounded-full border border-slate-800 pointer-events-none">
                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center font-mono font-bold text-[8px] text-slate-400">
                  N
                </div>
              </div>

              {/* Active Area selector inside Map block */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]">
                <div className="text-slate-300 font-bold">
                  {selectedArea ? `${selectedArea.area_name} (${selectedArea.status})` : 'No area selected'}
                </div>
                <select 
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[9px] text-emerald-400 px-2 py-1 rounded focus:outline-hidden"
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.area_name}</option>
                  ))}
                </select>
              </div>

              {/* Interactive Vector SVG */}
              <svg 
                ref={mapContainerRef}
                className="w-full h-full cursor-crosshair"
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                onMouseLeave={handleMapMouseUp}
                onClick={handleMapClick}
              >
                {/* 1. Draw national highway NH-34 and other bypass roads */}
                <path d="M 50,0 Q 180,180 250,250 T 450,500" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="3 3" />
                <path d="M 0,220 L 500,280" fill="none" stroke="#1e293b" strokeWidth="2" />
                <path d="M 250,0 L 250,500" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5 15" />

                {/* 2. Draw Hamirpur Railway Line passing through Maudaha Station */}
                <path d="M 0,100 L 500,400" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="6 6" />

                {/* 3. Draw Circular radius of delivery operations from center */}
                {radiusKm && (
                  <circle 
                    cx={250} 
                    cy={250} 
                    r={radiusKm * 8.5} 
                    fill="rgba(16, 185, 129, 0.04)" 
                    stroke="rgba(16, 185, 129, 0.25)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                )}

                {/* 4. Draw Polygons for all Service Areas */}
                {areas.map((area) => {
                  const isActive = area.id === selectedAreaId;
                  const isAreaActiveStatus = area.status === 'Active';
                  const pointsStr = area.polygon_coordinates
                    .map(c => `${lngToX(c.lng)},${latToY(c.lat)}`)
                    .join(" ");

                  return (
                    <polygon
                      key={area.id}
                      points={pointsStr}
                      fill={isActive 
                        ? (isAreaActiveStatus ? "rgba(16, 185, 129, 0.16)" : "rgba(239, 68, 68, 0.1)") 
                        : "rgba(148, 163, 184, 0.05)"
                      }
                      stroke={isActive 
                        ? (isAreaActiveStatus ? "#10b981" : "#ef4444") 
                        : "#475569"
                      }
                      strokeWidth={isActive ? "2.5" : "1"}
                      className="transition"
                    />
                  );
                })}

                {/* 5. Draw local sites/villages as markers */}
                {LOCAL_SITES.map((site, i) => {
                  const px = lngToX(site.lng);
                  const py = latToY(site.lat);
                  const distFromCenter = getDistanceKm(MAP_CENTER.lat, MAP_CENTER.lng, site.lat, site.lng);
                  const isCoveredByRadius = distFromCenter <= radiusKm;

                  return (
                    <g key={i}>
                      {/* Village point outer highlight */}
                      <circle 
                        cx={px} 
                        cy={py} 
                        r={isCoveredByRadius ? "7" : "3"} 
                        fill={isCoveredByRadius ? "rgba(16, 185, 129, 0.2)" : "transparent"} 
                        className="animate-pulse"
                      />
                      {/* Village main circle point */}
                      <circle 
                        cx={px} 
                        cy={py} 
                        r="3.5" 
                        fill={isCoveredByRadius ? "#10b981" : "#ef4444"} 
                        stroke="#0f172a" 
                        strokeWidth="1" 
                      />
                      {/* Village name text */}
                      <text 
                        x={px + 6} 
                        y={py + 3} 
                        fill={isCoveredByRadius ? "#cbd5e1" : "#64748b"} 
                        fontSize="8.5" 
                        fontFamily="monospace"
                        fontWeight={isCoveredByRadius ? "bold" : "normal"}
                        className="pointer-events-none select-none"
                      >
                        {language === 'en' ? site.name : site.nameHi}
                      </text>
                    </g>
                  );
                })}

                {/* 6. Active draggable vertex nodes overlay (only for active selected area) */}
                {selectedArea && selectedArea.polygon_coordinates.map((coord, i) => {
                  const px = lngToX(coord.lng);
                  const py = latToY(coord.lat);

                  return (
                    <g key={i}>
                      <circle 
                        cx={px} 
                        cy={py} 
                        r="12" 
                        fill="transparent" 
                        className="cursor-move"
                        onMouseDown={() => handleMapMouseDown(i)}
                      />
                      <circle 
                        cx={px} 
                        cy={py} 
                        r="6" 
                        fill="#10b981" 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                        className="pointer-events-none shadow-xs"
                      />
                      <text 
                        x={px - 3} 
                        y={py + 10} 
                        fill="#34d399" 
                        fontSize="7" 
                        fontWeight="black" 
                        fontFamily="monospace"
                        className="pointer-events-none select-none"
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Delivery Radius Control & COVERAGE ESTIMATES */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-900 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-600" />
                  {language === 'en' ? 'Operations Delivery Radius Control' : 'संचालन वितरण त्रिज्या नियंत्रण'}
                </span>
                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  {radiusKm} KM
                </span>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <input 
                  type="range" 
                  min={1} 
                  max={50} 
                  step={0.5}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>1 KM</span>
                  <span>10 KM</span>
                  <span>25 KM</span>
                  <span>50 KM</span>
                </div>
              </div>

              {/* Coverage Live Estimates */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="h-3 w-3 text-emerald-500" />
                    <span>Population Covered</span>
                  </div>
                  <p className="text-base font-mono font-black text-slate-800 dark:text-slate-200">
                    {totalPopulationCovered.toLocaleString()} people
                  </p>
                  <span className="text-[9px] text-slate-400 block">Based on Maudaha Census</span>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span>Est. Addressable Customers</span>
                  </div>
                  <p className="text-base font-mono font-black text-emerald-600">
                    {estimatedCustomers.toLocaleString()} households
                  </p>
                  <span className="text-[9px] text-slate-400 block">18% penetration forecast</span>
                </div>
              </div>

              {/* List of covered villages */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Covered Villages/Localities ({coveredSites.length} total)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {coveredSites.map((site, idx) => (
                    <span 
                      key={idx}
                      className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                    >
                      {language === 'en' ? site.name : site.nameHi}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 3. Future Expansion Map Indicators */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-600" />
              {language === 'en' ? 'Future Enterprise Expansion Roadmap' : 'भविष्य की उद्यम विस्तार योजना'}
            </h3>
            <p className="text-[10px] text-slate-400">
              The service boundaries architecture is built for multi-location scale:
            </p>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-2">
                <Globe className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="font-extrabold block text-slate-700 dark:text-slate-300">Multi-City Scale</span>
                  <span className="text-[9px] text-slate-400">Add Hamirpur, Bharuwa Sumerpur</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-2">
                <Warehouse className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-extrabold block text-slate-700 dark:text-slate-300">Multi-Warehouse</span>
                  <span className="text-[9px] text-slate-400">Zone-wise dispatch centers</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-2">
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-extrabold block text-slate-700 dark:text-slate-300">Time-Slot Delivery</span>
                  <span className="text-[9px] text-slate-400">Schedule slots per zip-code</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-2">
                <Layers className="h-4 w-4 text-rose-500 shrink-0" />
                <div>
                  <span className="font-extrabold block text-slate-700 dark:text-slate-300">Zone Pricing</span>
                  <span className="text-[9px] text-slate-400">Surcharge for highway villages</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Safety Controls Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 bg-rose-50 dark:bg-rose-950/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                {modalType === 'disable' ? 'Disable Boundary warning' : 'Delete Boundary request'}
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                {modalWarning}
              </p>

              {pendingOrdersCount > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 space-y-1">
                  <span className="font-extrabold block">BLOCKING PROTECTION ACTIVE:</span>
                  <span>Pending active orders are currently routing through this area. Deleting is strictly blocked. Disabling will halt further orders while active deliveries are finalized.</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <button 
                onClick={() => { setShowConfirmModal(false); setTargetAreaId(null); }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-900 rounded-xl cursor-pointer"
              >
                {language === 'en' ? 'Keep Unchanged' : 'अपरिवर्तित रखें'}
              </button>
              
              <button 
                onClick={confirmSafetyAction}
                disabled={modalType === 'delete' && pendingOrdersCount > 0}
                className={`px-4 py-2 text-xs font-black text-white rounded-xl cursor-pointer shadow-xs ${
                  modalType === 'delete' && pendingOrdersCount > 0 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {modalType === 'disable' 
                  ? (language === 'en' ? 'Force Disable Area' : 'बलपूर्वक अक्षम करें')
                  : (language === 'en' ? 'Confirm Permanent Delete' : 'स्थायी विलोपन की पुष्टि करें')
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
