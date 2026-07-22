import React, { useState, useEffect } from 'react';
import { ServiceArea } from '../types';
import { Map, Users, ShoppingBag, Truck, Ticket, Plus, Activity, Power, Settings, Search, Package, MapPin, Tag, LifeBuoy, ArrowLeft, Trash2, RotateCcw, Zap, Navigation, Bot, Clock, Check, Sparkles, RefreshCcw, ShieldCheck, Layers } from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import Polygon from './Polygon';
import JCodeMaintenancePanel from './JCodeMaintenancePanel';

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
  { value: 'tailor', label: 'Tailor Service' },
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
  onUpdateStores?: (stores: any[]) => void;
  onUpdateProducts?: (products: any[]) => void;
}

export default function ServiceAreaManager({ 
  areas, 
  onUpdateAreas, 
  allUsers, 
  allStores, 
  allProducts, 
  allOrders, 
  allTickets, 
  onToggleTicketStatus,
  onUpdateStores,
  onUpdateProducts,
  onUpdateUsers
}: { 
  areas: ServiceArea[], 
  onUpdateAreas: (areas: ServiceArea[]) => void, 
  allUsers?: any[], 
  allStores?: any[], 
  allProducts?: any[], 
  allOrders?: any[], 
  allTickets?: any[], 
  onToggleTicketStatus?: (id: string, status: 'open' | 'resolved') => void,
  onUpdateStores?: (stores: any[]) => void,
  onUpdateProducts?: (products: any[]) => void,
  onUpdateUsers?: (users: any[]) => void
}) {
  
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
    if (selectedArea?.id === areaToDelete) setSelectedArea(null);
    setAreaToDelete(null);
  };

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

  const confirmDeleteUser = () => {
    if (!userToDelete || !allUsers || !onUpdateUsers) return;
    const updated = allUsers.filter(u => u.id !== userToDelete.id);
    onUpdateUsers(updated);
    setUserToDelete(null);
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

      {/* Simple navigation tabs bar */}
      <div className="bg-white border-b border-slate-200 flex px-6 space-x-5 overflow-x-auto shrink-0 scrollbar-hide">
        {[
          { id: 'catalog', label: 'Products & Shops', icon: ShoppingBag },
          { id: 'users', label: 'Registered Users', icon: Users },
          { id: 'delivery', label: 'Delivery Settings', icon: Truck },
          { id: 'marketing', label: 'Support & Coupons', icon: Ticket },
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
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-emerald-600" /> Registered Customers
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">View customer accounts registered in this operational boundary</p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">{users.length} Customers</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Name / Contact</th>
                    <th className="py-3 px-4">Location / Area</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => {
                    const isSelf = u.email?.toLowerCase() === 'biengwithash@gmail.com';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium font-mono">
                            {u.phone} {u.email ? `• ${u.email}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-500">
                          <div className="font-semibold text-slate-800">{u.location || 'Maudaha Central'}</div>
                          <select
                            value={u.serviceAreaId || u.assignedArea || 'area-maudaha'}
                            disabled={isSelf}
                            onChange={(e) => handleUpdateUserArea(u.id, e.target.value)}
                            className={`bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition font-sans mt-1 ${isSelf ? 'opacity-65 cursor-not-allowed' : 'hover:bg-slate-100'}`}
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
                              title="Delete customer account"
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
              {users.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Search className="h-6 w-6 opacity-45" />
                  <p className="text-xs font-bold text-slate-700">No registered customers</p>
                </div>
              )}
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
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/photo-..."
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Image URL</label>
                  <input
                    type="text"
                    value={editProdImage}
                    onChange={(e) => setEditProdImage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
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
