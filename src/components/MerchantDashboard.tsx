/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, TrendingUp, CheckCircle, Package, Send, Star, Layers, Bell, Eye, EyeOff, Map, Sliders, Sparkles, AlertTriangle, Check } from 'lucide-react';
import { Product, Store, Review, Order, Notification, Language, RegisteredUser, PayoutRequest, OrderItem } from '../types';
import { TRANSLATIONS } from '../data';
import { D3DemandHeatmap } from './D3DemandHeatmap';
import { HeatmapView } from './HeatmapView';

interface ZoneDemandData {
  id: string;
  name: string;
  nameHi: string;
  pincode: string;
  polygon: { lat: number; lng: number }[];
  description: string;
  descriptionHi: string;
}

const HEATMAP_ZONES: ZoneDemandData[] = [
  {
    id: 'sa-1',
    name: 'Maudaha Town Centre',
    nameHi: 'मौदहा नगर केंद्र',
    pincode: '210424',
    polygon: [
      { lat: 25.695, lng: 80.100 },
      { lat: 25.695, lng: 80.130 },
      { lat: 25.670, lng: 80.130 },
      { lat: 25.670, lng: 80.100 }
    ],
    description: 'Naya Bazar, Devi Mandir, Station Road, Qila area',
    descriptionHi: 'नया बाजार, देवी मंदिर, स्टेशन रोड, किला क्षेत्र'
  },
  {
    id: 'sa-2',
    name: 'Husain Ganj & North Ward',
    nameHi: 'हुसैन गंज और उत्तरी वार्ड',
    pincode: '210424',
    polygon: [
      { lat: 25.710, lng: 80.090 },
      { lat: 25.710, lng: 80.120 },
      { lat: 25.692, lng: 80.120 },
      { lat: 25.692, lng: 80.090 }
    ],
    description: 'Husain Ganj, Galla Mandi, bypass links',
    descriptionHi: 'हुसैन गंज, गल्ला मंडी, बाईपास मार्ग'
  },
  {
    id: 'sa-3',
    name: 'Ragauli South Suburb',
    nameHi: 'रागौल दक्षिणी उपनगर',
    pincode: '210424',
    polygon: [
      { lat: 25.670, lng: 80.115 },
      { lat: 25.670, lng: 80.140 },
      { lat: 25.650, lng: 80.140 },
      { lat: 25.650, lng: 80.115 }
    ],
    description: 'Ragauli proper, bypass warehouse belt',
    descriptionHi: 'रागौल खुद, बाईपास गोदाम बेल्ट'
  },
  {
    id: 'sa-4',
    name: 'Chhani Border Zone',
    nameHi: 'छानी सीमा क्षेत्र',
    pincode: '210424',
    polygon: [
      { lat: 25.730, lng: 80.130 },
      { lat: 25.730, lng: 80.160 },
      { lat: 25.700, lng: 80.160 },
      { lat: 25.700, lng: 80.130 }
    ],
    description: 'Chhani Kalan village, NH-34 checkpost',
    descriptionHi: 'छानी कलां गांव, एनएच-34 चेकपोस्ट'
  }
];

const BASELINE_DEMAND: { [zoneId: string]: { [category: string]: { orders: number; searches: number; saves: number } } } = {
  'sa-1': {
    'Atta, Rice & Dal': { orders: 45, searches: 180, saves: 32 },
    'Oils & Spices': { orders: 28, searches: 95, saves: 14 },
    'Vegetables': { orders: 82, searches: 310, saves: 45 },
    'Fresh Fruits': { orders: 54, searches: 210, saves: 38 },
    'Milk & Butter': { orders: 60, searches: 240, saves: 28 },
    'Paneer & Curd': { orders: 48, searches: 190, saves: 22 },
    'Maudaha Special Sweets': { orders: 75, searches: 320, saves: 50 },
    'Namkeen & Savories': { orders: 35, searches: 140, saves: 18 },
    'Fresh Bakery': { orders: 40, searches: 155, saves: 22 },
  },
  'sa-2': {
    'Atta, Rice & Dal': { orders: 65, searches: 280, saves: 48 },
    'Oils & Spices': { orders: 42, searches: 160, saves: 25 },
    'Vegetables': { orders: 50, searches: 190, saves: 20 },
    'Fresh Fruits': { orders: 35, searches: 140, saves: 18 },
    'Milk & Butter': { orders: 25, searches: 90, saves: 12 },
    'Paneer & Curd': { orders: 22, searches: 80, saves: 10 },
    'Maudaha Special Sweets': { orders: 30, searches: 110, saves: 15 },
    'Namkeen & Savories': { orders: 48, searches: 195, saves: 30 },
    'Fresh Bakery': { orders: 55, searches: 220, saves: 35 },
  },
  'sa-3': {
    'Atta, Rice & Dal': { orders: 20, searches: 85, saves: 10 },
    'Oils & Spices': { orders: 15, searches: 60, saves: 8 },
    'Vegetables': { orders: 38, searches: 130, saves: 15 },
    'Fresh Fruits': { orders: 25, searches: 95, saves: 12 },
    'Milk & Butter': { orders: 52, searches: 215, saves: 38 },
    'Paneer & Curd': { orders: 45, searches: 180, saves: 30 },
    'Maudaha Special Sweets': { orders: 18, searches: 70, saves: 9 },
    'Namkeen & Savories': { orders: 22, searches: 90, saves: 11 },
    'Fresh Bakery': { orders: 28, searches: 115, saves: 14 },
  },
  'sa-4': {
    'Atta, Rice & Dal': { orders: 8, searches: 35, saves: 4 },
    'Oils & Spices': { orders: 5, searches: 22, saves: 2 },
    'Vegetables': { orders: 12, searches: 48, saves: 6 },
    'Fresh Fruits': { orders: 8, searches: 30, saves: 3 },
    'Milk & Butter': { orders: 14, searches: 55, saves: 8 },
    'Paneer & Curd': { orders: 11, searches: 45, saves: 5 },
    'Maudaha Special Sweets': { orders: 5, searches: 20, saves: 2 },
    'Namkeen & Savories': { orders: 10, searches: 42, saves: 5 },
    'Fresh Bakery': { orders: 12, searches: 50, saves: 6 },
  }
};

const mapLocationToZoneId = (location: string): string => {
  const loc = (location || '').toLowerCase();
  if (loc.includes('bhatipura') || loc.includes('station') || loc.includes('town') || loc.includes('centre') || loc.includes('naya bazar')) return 'sa-1';
  if (loc.includes('galla') || loc.includes('husain') || loc.includes('north')) return 'sa-2';
  if (loc.includes('ragauli') || loc.includes('rahmaniya') || loc.includes('south')) return 'sa-3';
  if (loc.includes('chhani') || loc.includes('bypass') || loc.includes('border') || loc.includes('highway')) return 'sa-4';
  return 'sa-1'; // fallback to town centre
};

interface MerchantDashboardProps {
  stores: Store[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  notifications: Notification[];
  merchantStoreId: string;
  setMerchantStoreId: (storeId: string) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
  onUpdateOrders: (updatedOrders: Order[]) => void;
  onAddNotification: (notification: Notification) => void;
  language: Language;
  users: RegisteredUser[];
  payoutRequests: PayoutRequest[];
  onAddPayoutRequest: (req: PayoutRequest) => void;
  cart: { [storeId: string]: OrderItem[] };
  onUpdateProductPricesAndStock?: (productId: string, updates: { mrp?: number; sellingPrice?: number; msp?: number; price?: number; stock?: number }, changedBy: 'seller' | 'admin', changerName: string) => void;
}

export default function MerchantDashboard({
  stores,
  products,
  reviews,
  orders,
  notifications,
  merchantStoreId,
  setMerchantStoreId,
  onUpdateProducts,
  onUpdateOrders,
  onAddNotification,
  language,
  users,
  payoutRequests,
  onAddPayoutRequest,
  cart,
  onUpdateProductPricesAndStock
}: MerchantDashboardProps) {
  const t = TRANSLATIONS[language];
  const activeStore = stores.find(s => s.id === merchantStoreId) || stores[0];

  // Forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    nameHi: '',
    category: (activeStore?.categories || [])[0] || 'Groceries',
    price: '',
    mrp: '',
    msp: '',
    unit: '',
    unitHi: '',
    description: '',
    descriptionHi: '',
    image: '',
    warrantyPeriod: '',
    warrantyPeriodHi: '',
    replacementPolicy: '',
    replacementPolicyHi: ''
  });

  // Custom Push Notification State
  const [promoTitle, setPromoTitle] = useState('');
  const [promoTitleHi, setPromoTitleHi] = useState('');
  const [promoBody, setPromoBody] = useState('');
  const [promoBodyHi, setPromoBodyHi] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');

  // Editing States
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMrp, setEditMrp] = useState('');
  const [editMsp, setEditMsp] = useState('');
  const [editStock, setEditStock] = useState('');

  // Bulk Operations States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<'set' | 'adjust'>('set');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkMrp, setBulkMrp] = useState('');
  const [bulkMsp, setBulkMsp] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [bulkPricePercent, setBulkPricePercent] = useState('');
  const [bulkStockDelta, setBulkStockDelta] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Heatmap & Optimization States
  const [activeMapTab, setActiveMapTab] = useState<'category' | 'pincode'>('pincode');
  const [heatmapCategory, setHeatmapCategory] = useState<string>('ALL');
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [selectedInventoryProductId, setSelectedInventoryProductId] = useState<string>('');
  const [allocations, setAllocations] = useState<{ [zoneId: string]: number }>({
    'sa-1': 50,
    'sa-2': 25,
    'sa-3': 15,
    'sa-4': 10
  });
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // Filtering products for the active store
  const storeProducts = products.filter(p => p.storeId === merchantStoreId);
  const storeReviews = reviews.filter(r => r.storeId === merchantStoreId);
  const storeOrders = orders.filter(o => o.storeId === merchantStoreId);

  // Sync default selected product
  React.useEffect(() => {
    if (storeProducts.length > 0 && !storeProducts.some(p => p.id === selectedInventoryProductId)) {
      setSelectedInventoryProductId(storeProducts[0].id);
    }
  }, [merchantStoreId, storeProducts]);

  // Clear selection when active store changes
  React.useEffect(() => {
    setSelectedProductIds([]);
  }, [merchantStoreId]);

  // Map translation utilities
  const MAP_CENTER = { lat: 25.6815, lng: 80.1132 };
  const latToY = (lat: number) => {
    const diff = lat - MAP_CENTER.lat;
    return 160 - diff * 2100;
  };
  const lngToX = (lng: number) => {
    const diff = lng - MAP_CENTER.lng;
    return 160 + diff * 2100;
  };

  const getZoneDemandStats = (zoneId: string, category: string) => {
    let ordersCount = 0;
    let searchesCount = 0;
    let savesCount = 0;

    // 1. Add Baseline values to ensure high-fidelity visual curves
    if (category === 'ALL') {
      const categoriesList = Object.keys(BASELINE_DEMAND[zoneId] || {});
      categoriesList.forEach(cat => {
        const b = BASELINE_DEMAND[zoneId]?.[cat] || { orders: 0, searches: 0, saves: 0 };
        ordersCount += b.orders;
        searchesCount += b.searches;
        savesCount += b.saves;
      });
    } else {
      const b = BASELINE_DEMAND[zoneId]?.[category] || { orders: 12, searches: 40, saves: 5 };
      ordersCount += b.orders;
      searchesCount += b.searches;
      savesCount += b.saves;
    }

    // 2. Aggregate Live Registered Users data
    const zoneUsers = users.filter(u => mapLocationToZoneId(u.location) === zoneId);
    const zoneUserIds = zoneUsers.map(u => u.id);

    zoneUsers.forEach(u => {
      // Live searches weight
      (u.searchHistory || []).forEach(keyword => {
        const kw = keyword.toLowerCase();
        if (category === 'ALL') {
          searchesCount += 1;
        } else {
          const cat = category.toLowerCase();
          if (kw.includes(cat) || cat.includes(kw) || (kw === 'atta' && cat.includes('atta')) || (kw === 'milk' && cat.includes('milk')) || (kw === 'paneer' && cat.includes('paneer')) || (kw === 'fruit' && cat.includes('fruit')) || (kw === 'vegetable' && cat.includes('vegetable')) || (kw === 'ghee' && cat.includes('butter'))) {
            searchesCount += 4;
          }
        }
      });

      // Live watchlists weight
      (u.watchlist || []).forEach(prodId => {
        const p = products.find(prod => prod.id === prodId);
        if (p) {
          if (category === 'ALL' || p.category === category) {
            savesCount += 2;
          }
        }
      });
    });

    // 3. Aggregate Live Orders data
    const zoneOrders = orders.filter(o => o.userId && zoneUserIds.includes(o.userId));
    zoneOrders.forEach(o => {
      o.items.forEach(item => {
        if (category === 'ALL' || item.product.category === category) {
          ordersCount += item.quantity;
        }
      });
    });

    // Score calculation
    const score = Math.round(ordersCount * 12 + searchesCount * 1.5 + savesCount * 4);

    return {
      orders: ordersCount,
      searches: searchesCount,
      saves: savesCount,
      score: Math.max(10, score)
    };
  };

  const zoneScores = HEATMAP_ZONES.map(z => getZoneDemandStats(z.id, heatmapCategory).score);
  const maxScore = Math.max(...zoneScores) || 1;

  const getZoneHeatStyles = (zoneId: string) => {
    const stats = getZoneDemandStats(zoneId, heatmapCategory);
    const ratio = stats.score / maxScore;

    if (ratio > 0.75) {
      return {
        fill: 'rgba(239, 68, 68, 0.45)',
        fillHover: 'rgba(239, 68, 68, 0.7)',
        stroke: 'rgb(239, 68, 68)',
        colorText: 'text-rose-600',
        bgBadge: 'bg-rose-50 text-rose-700 border-rose-100',
        labelText: language === 'en' ? 'Critical Demand 🔥' : 'अति-उच्च मांग 🔥'
      };
    } else if (ratio > 0.35) {
      return {
        fill: 'rgba(245, 158, 11, 0.38)',
        fillHover: 'rgba(245, 158, 11, 0.65)',
        stroke: 'rgb(245, 158, 11)',
        colorText: 'text-amber-600',
        bgBadge: 'bg-amber-50 text-amber-700 border-amber-100',
        labelText: language === 'en' ? 'Moderate Demand 📈' : 'मध्यम मांग 📈'
      };
    } else {
      return {
        fill: 'rgba(16, 185, 129, 0.18)',
        fillHover: 'rgba(16, 185, 129, 0.45)',
        stroke: 'rgb(16, 185, 129)',
        colorText: 'text-emerald-600',
        bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        labelText: language === 'en' ? 'Stable Demand 🟢' : 'स्थिर मांग 🟢'
      };
    }
  };

  const activeSelectedProduct = storeProducts.find(p => p.id === selectedInventoryProductId) || storeProducts[0];

  const activeProdCategory = activeSelectedProduct?.category || 'ALL';
  const z1Score = getZoneDemandStats('sa-1', activeProdCategory).score;
  const z2Score = getZoneDemandStats('sa-2', activeProdCategory).score;
  const z3Score = getZoneDemandStats('sa-3', activeProdCategory).score;
  const z4Score = getZoneDemandStats('sa-4', activeProdCategory).score;
  const totScore = z1Score + z2Score + z3Score + z4Score || 1;

  const targetZ1 = Math.round((z1Score / totScore) * 100);
  const targetZ2 = Math.round((z2Score / totScore) * 100);
  const targetZ3 = Math.round((z3Score / totScore) * 100);
  const targetZ4 = Math.round((z4Score / totScore) * 100);

  const currentZ1 = allocations['sa-1'] ?? 50;
  const currentZ2 = allocations['sa-2'] ?? 25;
  const currentZ3 = allocations['sa-3'] ?? 15;
  const currentZ4 = allocations['sa-4'] ?? 10;

  const alignmentScore = Math.round(
    100 - (
      Math.abs(currentZ1 - targetZ1) +
      Math.abs(currentZ2 - targetZ2) +
      Math.abs(currentZ3 - targetZ3) +
      Math.abs(currentZ4 - targetZ4)
    ) / 2
  );

  const handleSliderChange = (zoneId: string, value: number) => {
    const otherZoneIds = ['sa-1', 'sa-2', 'sa-3', 'sa-4'].filter(id => id !== zoneId);
    const oldVal = allocations[zoneId] ?? 0;
    const diff = value - oldVal;

    const sumOthers = otherZoneIds.reduce((sum, id) => sum + (allocations[id] ?? 0), 0) || 1;
    
    const nextAllocations = { ...allocations };
    nextAllocations[zoneId] = value;

    otherZoneIds.forEach(id => {
      const share = (allocations[id] ?? 0) / sumOthers;
      const adjusted = Math.max(0, Math.round((allocations[id] ?? 0) - diff * share));
      nextAllocations[id] = adjusted;
    });

    const totalSum = Object.keys(nextAllocations).reduce((sum, key) => sum + (nextAllocations[key] ?? 0), 0);
    const error = 100 - totalSum;
    if (error !== 0) {
      nextAllocations[otherZoneIds[0]] = Math.max(0, (nextAllocations[otherZoneIds[0]] ?? 0) + error);
    }

    setAllocations(nextAllocations);
  };

  const handleDeployAllocations = () => {
    setSaveSuccessMessage(
      language === 'en'
        ? `⚡ Stock placement plan deployed successfully! Inventory for ${activeSelectedProduct ? activeSelectedProduct.name : 'item'} is now optimized across Maudaha delivery nodes.`
        : `⚡ स्टॉक प्लेसमेंट योजना सफलतापूर्वक लागू की गई! ${activeSelectedProduct ? activeSelectedProduct.nameHi : 'वस्तु'} की इन्वेंट्री अब मौदहा वितरण नोड्स में अनुकूलित है।`
    );
    
    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 4500);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.unit) return;

    const parsedPrice = parseFloat(newProduct.price);
    const added: Product = {
      id: 'p-' + Date.now(),
      name: newProduct.name,
      nameHi: newProduct.nameHi || newProduct.name,
      category: newProduct.category,
      categoryHi: language === 'hi' ? newProduct.category : newProduct.category,
      price: parsedPrice,
      sellingPrice: parsedPrice,
      mrp: parseFloat(newProduct.mrp) || Math.round(parsedPrice * 1.25),
      msp: parseFloat(newProduct.msp) || Math.round(parsedPrice * 0.85),
      unit: newProduct.unit,
      unitHi: newProduct.unitHi || newProduct.unit,
      stock: 50, // Default generous stock
      image: newProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      rating: 5.0,
      description: newProduct.description || 'Fresh item sourced locally in Maudaha.',
      descriptionHi: newProduct.descriptionHi || 'मौदहा में स्थानीय रूप से प्राप्त ताजी वस्तु।',
      storeId: merchantStoreId,
      warrantyPeriod: newProduct.warrantyPeriod || undefined,
      warrantyPeriodHi: newProduct.warrantyPeriodHi || undefined,
      replacementPolicy: newProduct.replacementPolicy || undefined,
      replacementPolicyHi: newProduct.replacementPolicyHi || undefined
    };

    onUpdateProducts([...products, added]);
    setShowAddForm(false);
    setNewProduct({
      name: '',
      nameHi: '',
      category: (activeStore?.categories || [])[0] || 'Groceries',
      price: '',
      mrp: '',
      msp: '',
      unit: '',
      unitHi: '',
      description: '',
      descriptionHi: '',
      image: '',
      warrantyPeriod: '',
      warrantyPeriodHi: '',
      replacementPolicy: '',
      replacementPolicyHi: ''
    });
  };

  const handleToggleStock = (product: Product) => {
    const updated = products.map(p => {
      if (p.id === product.id) {
        return { ...p, stock: p.stock > 0 ? 0 : 35 };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditPrice((p.sellingPrice ?? p.price ?? 0).toString());
    setEditMrp((p.mrp ?? Math.round((p.sellingPrice ?? p.price ?? 0) * 1.25)).toString());
    setEditMsp((p.msp ?? Math.round((p.sellingPrice ?? p.price ?? 0) * 0.85)).toString());
    setEditStock(p.stock.toString());
  };

  const saveProductEdits = (productId: string) => {
    const numPrice = parseFloat(editPrice);
    const numMrp = parseFloat(editMrp);
    const numMsp = parseFloat(editMsp);
    const numStock = parseInt(editStock);

    if (onUpdateProductPricesAndStock) {
      onUpdateProductPricesAndStock(
        productId,
        {
          price: numPrice,
          sellingPrice: numPrice,
          mrp: numMrp,
          msp: numMsp,
          stock: isNaN(numStock) ? undefined : numStock
        },
        'seller',
        activeStore?.name || 'Seller'
      );
    } else {
      const updated = products.map(p => {
        if (p.id === productId) {
          const sp = isNaN(numPrice) ? p.price : numPrice;
          return {
            ...p,
            price: sp,
            sellingPrice: sp,
            mrp: isNaN(numMrp) ? (p.mrp ?? sp) : numMrp,
            msp: isNaN(numMsp) ? (p.msp ?? sp) : numMsp,
            stock: isNaN(numStock) ? p.stock : numStock
          };
        }
        return p;
      });
      onUpdateProducts(updated);
    }
    setEditingProductId(null);
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAllProducts = () => {
    const activeProductIds = storeProducts.map(p => p.id);
    const allSelected = activeProductIds.length > 0 && activeProductIds.every(id => selectedProductIds.includes(id));

    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !activeProductIds.includes(id)));
    } else {
      setSelectedProductIds(prev => {
        const otherSelected = prev.filter(id => !activeProductIds.includes(id));
        return [...otherSelected, ...activeProductIds];
      });
    }
  };

  const handleBulkApply = () => {
    if (selectedProductIds.length === 0) return;

    let updatedCount = 0;

    const updatedProducts = products.map(p => {
      if (!selectedProductIds.includes(p.id)) return p;

      updatedCount++;

      let newPPrice = p.sellingPrice ?? p.price;
      let newPMrp = p.mrp ?? Math.round((p.sellingPrice ?? p.price) * 1.25);
      let newPMsp = p.msp ?? Math.round((p.sellingPrice ?? p.price) * 0.85);
      let newPStock = p.stock;

      if (bulkMode === 'set') {
        if (bulkPrice) {
          const parsed = parseFloat(bulkPrice);
          if (!isNaN(parsed)) newPPrice = parsed;
        }
        if (bulkMrp) {
          const parsed = parseFloat(bulkMrp);
          if (!isNaN(parsed)) newPMrp = parsed;
        }
        if (bulkMsp) {
          const parsed = parseFloat(bulkMsp);
          if (!isNaN(parsed)) newPMsp = parsed;
        }
        if (bulkStock) {
          const parsed = parseInt(bulkStock);
          if (!isNaN(parsed)) newPStock = parsed;
        }
      } else {
        // adjust mode
        if (bulkPricePercent) {
          const percent = parseFloat(bulkPricePercent);
          if (!isNaN(percent)) {
            newPPrice = Math.round((p.sellingPrice ?? p.price) * (1 + percent / 100) * 100) / 100;
            newPMrp = Math.round((p.mrp ?? Math.round((p.sellingPrice ?? p.price) * 1.25)) * (1 + percent / 100) * 100) / 100;
            newPMsp = Math.round((p.msp ?? Math.round((p.sellingPrice ?? p.price) * 0.85)) * (1 + percent / 100) * 100) / 100;
          }
        }
        if (bulkStockDelta) {
          const delta = parseInt(bulkStockDelta);
          if (!isNaN(delta)) {
            newPStock = Math.max(0, p.stock + delta);
          }
        }
      }

      if (onUpdateProductPricesAndStock) {
        onUpdateProductPricesAndStock(
          p.id,
          {
            price: newPPrice,
            sellingPrice: newPPrice,
            mrp: newPMrp,
            msp: newPMsp,
            stock: newPStock
          },
          'seller',
          activeStore?.name || 'Seller'
        );
      }

      return {
        ...p,
        price: newPPrice,
        sellingPrice: newPPrice,
        mrp: newPMrp,
        msp: newPMsp,
        stock: newPStock
      };
    });

    if (!onUpdateProductPricesAndStock) {
      onUpdateProducts(updatedProducts);
    }

    setBulkSuccessMsg(
      language === 'en'
        ? `Successfully updated ${updatedCount} products in bulk!`
        : `सफलतापूर्वक ${updatedCount} उत्पादों को थोक में अपडेट किया गया!`
    );

    // Reset fields
    setBulkPrice('');
    setBulkMrp('');
    setBulkMsp('');
    setBulkStock('');
    setBulkPricePercent('');
    setBulkStockDelta('');
    setSelectedProductIds([]);

    setTimeout(() => {
      setBulkSuccessMsg('');
    }, 4500);
  };

  const handleBulkSetOutOfStock = () => {
    if (selectedProductIds.length === 0) return;

    const updatedProducts = products.map(p => {
      if (!selectedProductIds.includes(p.id)) return p;

      if (onUpdateProductPricesAndStock) {
        onUpdateProductPricesAndStock(
          p.id,
          { stock: 0 },
          'seller',
          activeStore?.name || 'Seller'
        );
      }
      return { ...p, stock: 0 };
    });

    if (!onUpdateProductPricesAndStock) {
      onUpdateProducts(updatedProducts);
    }

    setBulkSuccessMsg(
      language === 'en'
        ? `Marked ${selectedProductIds.length} products as Out of Stock!`
        : `${selectedProductIds.length} उत्पादों को आउट ऑफ़ स्टॉक चिह्नित किया गया!`
    );
    setSelectedProductIds([]);
    setTimeout(() => {
      setBulkSuccessMsg('');
    }, 4500);
  };

  const handleBulkRestock = () => {
    if (selectedProductIds.length === 0) return;

    const updatedProducts = products.map(p => {
      if (!selectedProductIds.includes(p.id)) return p;

      if (onUpdateProductPricesAndStock) {
        onUpdateProductPricesAndStock(
          p.id,
          { stock: 50 },
          'seller',
          activeStore?.name || 'Seller'
        );
      }
      return { ...p, stock: 50 };
    });

    if (!onUpdateProductPricesAndStock) {
      onUpdateProducts(updatedProducts);
    }

    setBulkSuccessMsg(
      language === 'en'
        ? `Restocked ${selectedProductIds.length} products to 50 Units!`
        : `${selectedProductIds.length} उत्पादों को 50 यूनिट्स के साथ पुन: स्टॉक किया गया!`
    );
    setSelectedProductIds([]);
    setTimeout(() => {
      setBulkSuccessMsg('');
    }, 4500);
  };

  const updateOrderStatus = (orderId: string, nextStatus: Order['deliveryStatus']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, deliveryStatus: nextStatus };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleBroadcastPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle || !promoBody) return;

    const newNotification: Notification = {
      id: 'n-' + Date.now(),
      title: promoTitle,
      titleHi: promoTitleHi || promoTitle,
      body: promoBody,
      bodyHi: promoBodyHi || promoBody,
      code: promoCode ? promoCode.toUpperCase() : undefined,
      discountAmount: promoDiscount ? parseFloat(promoDiscount) : undefined,
      type: 'discount',
      date: '2026-06-28',
      isRead: false
    };

    onAddNotification(newNotification);

    // Clear form
    setPromoTitle('');
    setPromoTitleHi('');
    setPromoBody('');
    setPromoBodyHi('');
    setPromoCode('');
    setPromoDiscount('');
    alert(language === 'en' ? 'Push notification broadcasted to all customers!' : 'सभी ग्राहकों को पुश नोटिफिकेशन भेज दिया गया है!');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Merchant Header bar */}
      <div className="bg-slate-900 text-white py-6 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-emerald-400 font-bold tracking-wider text-xs block uppercase font-mono">
              ★ {t.merchantTitle}
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-0.5">
              {language === 'hi' ? activeStore.nameHi : activeStore.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              📍 {language === 'hi' ? activeStore.addressHi : activeStore.address}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">{t.storeHeaderLabel}:</span>
            <select
              value={merchantStoreId}
              onChange={(e) => setMerchantStoreId(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>
                  {language === 'hi' ? s.nameHi : s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Inventory & Incoming Orders */}
        <div className="lg:col-span-8 space-y-8">

          {/* Delivery Zone Demand Heatmap & Stock Placement Optimizer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Map className="h-5.5 w-5.5 text-emerald-600 animate-pulse" />
                  {language === 'en' ? '📍 Local Demand Heatmap & Inventory Planner' : '📍 स्थानीय मांग हीटमैप और इन्वेंट्री प्लानर'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'en' 
                    ? 'Map high-demand product categories to delivery zones and optimize inventory distribution.' 
                    : 'उच्च मांग वाले उत्पाद श्रेणियों को वितरण क्षेत्रों से जोड़ें और स्टॉक वितरण का अनुकूलन करें।'}
                </p>

                {/* View Selector Toggle */}
                <div className="flex gap-1.5 mt-3 bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveMapTab('pincode')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      activeMapTab === 'pincode'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🚀 {language === 'en' ? 'Pincode Hotspots (D3)' : 'पिनकोड हॉटस्पॉट (D3)'}
                  </button>
                  <button
                    onClick={() => setActiveMapTab('category')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      activeMapTab === 'category'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    📦 {language === 'en' ? 'Category Demand' : 'श्रेणी मांग'}
                  </button>
                </div>
              </div>

              {/* Category selector - only show for category view */}
              {activeMapTab === 'category' && (
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl max-h-[140px] overflow-y-auto">
                  {['ALL', ...(activeStore?.categories || [])].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setHeatmapCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        heatmapCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'ALL' 
                        ? (language === 'en' ? 'All Items 📦' : 'सभी सामान 📦')
                        : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* D3.js Demand Heatmap Overlay Engine */}
            <div className="mt-4">
              {activeMapTab === 'pincode' ? (
                <HeatmapView
                  orders={orders}
                  users={users}
                  language={language}
                  onAddNotification={onAddNotification}
                />
              ) : (
                <D3DemandHeatmap
                  products={products}
                  orders={orders}
                  users={users}
                  activeStore={activeStore}
                  language={language}
                  selectedCategory={heatmapCategory}
                  setSelectedCategory={setHeatmapCategory}
                  hoveredZoneId={hoveredZoneId}
                  setHoveredZoneId={setHoveredZoneId}
                />
              )}
            </div>

            {/* Inventory Placement Planner & Auto-Balancer */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Selector column (4 cols) */}
                  <div className="md:col-span-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs uppercase tracking-wider mb-2">
                        <Sliders className="h-4 w-4 text-emerald-600" />
                        <span>{language === 'en' ? 'Stock Placement Optimizer' : 'स्टॉक प्लेसमेंट अनुकूलक'}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed">
                        {language === 'en'
                          ? 'Choose a product from your inventory to model delivery node allocation. Adjust sliders to match the D3 demand index targets.'
                          : 'वितरण नोड आवंटन को मॉडल करने के लिए अपनी इन्वेंट्री से एक उत्पाद चुनें। डी3 मांग सूचकांक लक्ष्यों से मिलान करने के लिए स्लाइडर्स को समायोजित करें।'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'Choose Product to Plan' : 'योजना बनाने के लिए उत्पाद चुनें'}
                      </label>
                      <select
                        value={selectedInventoryProductId}
                        onChange={(e) => {
                          setSelectedInventoryProductId(e.target.value);
                          setAllocations({ 'sa-1': 50, 'sa-2': 25, 'sa-3': 15, 'sa-4': 10 });
                        }}
                        className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 shadow-xs"
                      >
                        {storeProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {language === 'hi' ? p.nameHi : p.name} ({p.unit}) - {p.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sliders column (5 cols) */}
                  <div className="md:col-span-5 space-y-3.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                      <span>{language === 'en' ? 'Delivery Zone Node' : 'वितरण क्षेत्र नोड'}</span>
                      <span>{language === 'en' ? 'Stock Allocation' : 'स्टॉक आवंटन'}</span>
                    </div>

                    {HEATMAP_ZONES.map((zone) => {
                      const scoreStats = getZoneDemandStats(zone.id, activeSelectedProduct?.category || 'ALL');
                      const totalDemand = z1Score + z2Score + z3Score + z4Score || 1;
                      const targetShare = Math.round((scoreStats.score / totalDemand) * 100);
                      const currentAlloc = allocations[zone.id] ?? 25;

                      return (
                        <div key={zone.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="truncate max-w-[150px]">{language === 'hi' ? zone.nameHi : zone.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-slate-400">
                                {language === 'en' ? 'Target:' : 'लक्ष्य:'} <strong className="text-slate-600">{targetShare}%</strong>
                              </span>
                              <span className="bg-emerald-50 text-emerald-800 text-[10.5px] px-1.5 py-0.5 rounded-md font-black">
                                {currentAlloc}%
                              </span>
                            </div>
                          </div>
                          
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentAlloc}
                            onChange={(e) => handleSliderChange(zone.id, parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Alignment column (3 cols) */}
                  <div className="md:col-span-3 space-y-3 pt-2 md:pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                          {language === 'en' ? 'Alignment Health' : 'संरेखण स्वास्थ्य'}
                        </span>
                        <span className={`text-[11px] font-black ${
                          alignmentScore >= 90 ? 'text-emerald-600' : alignmentScore >= 70 ? 'text-blue-600' : 'text-amber-500'
                        }`}>
                          {alignmentScore}% {alignmentScore >= 90 ? 'Optimal' : alignmentScore >= 70 ? 'Good' : 'Low'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            alignmentScore >= 90 ? 'bg-emerald-500' : alignmentScore >= 70 ? 'bg-blue-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${alignmentScore}%` }}
                        ></div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal italic">
                        {alignmentScore >= 90 
                          ? (language === 'en' ? 'Perfect placement! Minimizes transit delays.' : 'सही विवरण क्षेत्रीय मांग से मेल खाता है।')
                          : (language === 'en' ? 'Align sliders close to targets.' : 'स्लाइडर्स को मांग लक्ष्य प्रतिशत के पास खींचें।')}
                      </p>
                    </div>

                    {/* Success confirmation */}
                    {saveSuccessMessage && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 rounded-lg text-[9.5px] font-bold flex items-start gap-1">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{saveSuccessMessage}</span>
                      </div>
                    )}

                    <button
                      onClick={handleDeployAllocations}
                      className="w-full bg-slate-900 text-white hover:bg-slate-800 text-[11px] py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all shadow-sm active:scale-98 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{language === 'en' ? 'Deploy Plan' : 'योजना लागू करें'}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
          
          {/* Active Incoming Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              {t.allOrders} ({storeOrders.length})
            </h2>

            {storeOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {t.noMerchantOrders}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {storeOrders.map((order) => {
                  const itemsSummary = order.items
                    .map(it => `${language === 'hi' ? it.product.nameHi : it.product.name} (x${it.quantity})`)
                    .join(', ');

                  return (
                    <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm text-slate-800">
                            {t.orderId}: <span className="font-mono text-xs">#{order.id}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {itemsSummary}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {language === 'en' ? 'Method' : 'विधि'}: <span className="font-semibold text-slate-600">{order.paymentMethod}</span> | {language === 'en' ? 'Total' : 'कुल'}: <span className="font-bold text-slate-800">₹{order.total}</span>
                          </p>
                        </div>

                        {/* Status Label */}
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                            order.deliveryStatus === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                            order.deliveryStatus === 'arrived' ? 'bg-emerald-50 text-emerald-700' :
                            order.deliveryStatus === 'pending' ? 'bg-rose-50 text-rose-700' :
                            order.deliveryStatus === 'processing' ? 'bg-blue-50 text-blue-700' :
                            order.deliveryStatus === 'ready_for_pickup' ? 'bg-amber-50 text-amber-700' :
                            order.deliveryStatus === 'ready_for_delivery' ? 'bg-purple-50 text-purple-700' :
                            'bg-sky-50 text-sky-700'
                          }`}>
                            {order.deliveryStatus === 'cancelled' && (language === 'hi' ? 'रद्द किया गया' : 'Cancelled')}
                            {order.deliveryStatus === 'pending' && (language === 'hi' ? 'लंबित (स्वीकृति लंबित)' : 'Pending Acceptance')}
                            {order.deliveryStatus === 'processing' && (language === 'hi' ? 'प्रसंस्करण चालू है' : 'Processing (Preparing)')}
                            {order.deliveryStatus === 'ready_for_pickup' && (language === 'hi' ? 'पिकअप के लिए तैयार' : 'Ready for Pickup')}
                            {order.deliveryStatus === 'ready_for_delivery' && (language === 'hi' ? 'वितरण के लिए तैयार' : 'Ready for Delivery')}
                            {order.deliveryStatus === 'out_for_delivery' && (language === 'hi' ? 'वितरण चालू है (रास्ते में)' : 'Out for Delivery')}
                            {order.deliveryStatus === 'arrived' && (language === 'hi' ? 'वितरित (सफल)' : 'Delivered')}
                          </span>
                        </div>
                      </div>

                      {/* Merchant actions for active orders */}
                      {order.deliveryStatus !== 'arrived' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.deliveryStatus === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-[0.98]"
                            >
                              ✓ {language === 'hi' ? 'ऑर्डर स्वीकार करें' : 'Accept Order'}
                            </button>
                          )}
                          {order.deliveryStatus === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-[0.98]"
                            >
                              📦 {language === 'hi' ? 'तैयार चिह्नित करें' : 'Mark as Ready'}
                            </button>
                          )}
                          {(order.deliveryStatus === 'ready_for_pickup' || order.deliveryStatus === 'ready_for_delivery' || order.deliveryStatus === 'out_for_delivery') && (
                            <span className="text-xs text-slate-400 italic">
                              {language === 'hi' ? 'डिलीवरी राइडर के अपडेट का इंतजार है' : 'Waiting for rider updates'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Stock List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                {t.inventoryTitle} ({storeProducts.length})
              </h2>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'Add Item' : 'सामग्री जोड़ें'}
              </button>
            </div>

            {/* Add product form */}
            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800">{t.addMenuItem}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'Product Name (English)' : 'सामग्री का नाम (अंग्रेजी)'}</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Fresh Red Carrots"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'Product Name (Hindi)' : 'सामग्री का नाम (हिंदी)'}</label>
                    <input
                      type="text"
                      required
                      value={newProduct.nameHi}
                      onChange={(e) => setNewProduct({ ...newProduct, nameHi: e.target.value })}
                      placeholder="जैसे- ताजी लाल गाजर"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.categories}</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {(activeStore?.categories || []).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'Selling Price (₹)' : 'विक्रय मूल्य / Selling Price (₹)'}</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="e.g. 80"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'MRP (₹)' : 'एमआरपी / MRP (₹)'}</label>
                    <input
                      type="number"
                      required
                      value={newProduct.mrp}
                      onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                      placeholder="e.g. 100"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'MSP / Master Selling Price (₹)' : 'एमएसपी / MSP (₹) (सिर्फ सेलर/एडमिन)'}</label>
                    <input
                      type="number"
                      required
                      value={newProduct.msp}
                      onChange={(e) => setNewProduct({ ...newProduct, msp: e.target.value })}
                      placeholder="e.g. 70"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'Unit Size' : 'यूनिट साइज'}</label>
                    <input
                      type="text"
                      required
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value, unitHi: e.target.value })}
                      placeholder="e.g. 500 g, 1 kg"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Description (English)</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={2}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">विवरण (Hindi)</label>
                    <textarea
                      value={newProduct.descriptionHi}
                      onChange={(e) => setNewProduct({ ...newProduct, descriptionHi: e.target.value })}
                      rows={2}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'Warranty Period (Optional)' : 'वारंटी अवधि (वैकल्पिक)'}</label>
                    <input
                      type="text"
                      value={newProduct.warrantyPeriod}
                      onChange={(e) => setNewProduct({ ...newProduct, warrantyPeriod: e.target.value, warrantyPeriodHi: e.target.value })}
                      placeholder="e.g. 1 Year Warranty"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'en' ? 'Replacement Policy (Optional)' : 'रिप्लेसमेंट नीति (वैकल्पिक)'}</label>
                    <input
                      type="text"
                      value={newProduct.replacementPolicy}
                      onChange={(e) => setNewProduct({ ...newProduct, replacementPolicy: e.target.value, replacementPolicyHi: e.target.value })}
                      placeholder="e.g. 7 Days Replacement"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    {t.submit}
                  </button>
                </div>
              </form>
            )}

            {/* Bulk Operations Panel */}
            {selectedProductIds.length > 0 && (
              <div className="bg-emerald-50/75 border border-emerald-150 rounded-xl p-4 mb-5 space-y-4 animate-in fade-in duration-250">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-150/45 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-black font-mono">
                      {selectedProductIds.length}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                        {language === 'en' ? 'Bulk Inventory & Price Updater' : 'थोक सूची और मूल्य अद्यतनकर्ता'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {language === 'en'
                          ? `Apply updates to all ${selectedProductIds.length} selected items simultaneously.`
                          : `सभी ${selectedProductIds.length} चयनित वस्तुओं पर एक साथ अद्यतन लागू करें।`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedProductIds([])}
                      className="text-[10.5px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-black px-2.5 py-1 rounded-lg cursor-pointer transition"
                    >
                      {language === 'en' ? 'Clear Selection' : 'चयन हटाएँ'}
                    </button>
                  </div>
                </div>

                {/* Mode Selectors */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkMode('set')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      bulkMode === 'set'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🎯 {language === 'en' ? 'Set Constant Values' : 'निश्चित मूल्य सेट करें'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode('adjust')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      bulkMode === 'adjust'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📈 {language === 'en' ? 'Adjust Relatively (%)' : 'प्रतिशत/इकाई द्वारा समायोजित करें'}
                  </button>
                </div>

                {/* Bulk Inputs Row */}
                {bulkMode === 'set' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'Selling Price (₹)' : 'विक्रय मूल्य (₹)'}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'MRP (₹)' : 'एमआरपी (₹)'}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={bulkMrp}
                        onChange={(e) => setBulkMrp(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'MSP (₹)' : 'एमएसपी (₹)'}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 70"
                        value={bulkMsp}
                        onChange={(e) => setBulkMsp(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'Stock (Units)' : 'स्टॉक मात्रा (इकाई)'}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'Adjust Prices by Percentage' : 'प्रतिशत द्वारा मूल्य समायोजित करें'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="e.g. +10, -5"
                          value={bulkPricePercent}
                          onChange={(e) => setBulkPricePercent(e.target.value)}
                          className="w-full bg-white border border-slate-200 pl-3 pr-8 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
                      </div>
                      <p className="text-[9px] text-slate-400">
                        {language === 'en'
                          ? 'Increases or decreases Price, MRP, and MSP by this percentage.'
                          : 'इस प्रतिशत द्वारा मूल्य, एमआरपी और एमएसपी को बढ़ाता या घटाता है।'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">
                        {language === 'en' ? 'Adjust Stock Quantity (Delta)' : 'स्टॉक मात्रा जोड़ें/घटाएं'}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. +20, -10"
                        value={bulkStockDelta}
                        onChange={(e) => setBulkStockDelta(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[9px] text-slate-400">
                        {language === 'en'
                          ? 'Adds or subtracts specific number of units to/from current stock.'
                          : 'वर्तमान स्टॉक में निर्दिष्ट संख्या में इकाइयों को जोड़ता या घटाता है।'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bulk Actions Button Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-150/45">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleBulkSetOutOfStock}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      🚫 {language === 'en' ? 'Set Out of Stock' : 'आउट ऑफ़ स्टॉक करें'}
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkRestock}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      📦 {language === 'en' ? 'Restock to 50' : '50 यूनिट्स पुन: स्टॉक'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBulkApply}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    ⚡ {language === 'en' ? 'Apply Bulk Changes' : 'थोक परिवर्तन लागू करें'}
                  </button>
                </div>
              </div>
            )}

            {bulkSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold mb-5 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            {/* Seamless stock management table */}
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={storeProducts.length > 0 && storeProducts.every(p => selectedProductIds.includes(p.id))}
                        onChange={toggleSelectAllProducts}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title={language === 'en' ? 'Select all store products' : 'सभी स्टोर उत्पाद चुनें'}
                      />
                    </th>
                    <th className="py-3 px-4">{language === 'en' ? 'Product' : 'सामग्री'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'MRP (₹)' : 'एमआरपी (₹)'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'Selling Price (₹)' : 'विक्रय मूल्य (₹)'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'MSP (₹) (Seller Paid)' : 'एमएसपी (₹) (भुगतान मूल्य)'}</th>
                    <th className="py-3 px-4">{t.stock}</th>
                    <th className="py-3 px-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storeProducts.map((p) => {
                    const isEditing = editingProductId === p.id;
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}>
                        <td className="py-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {language === 'hi' ? p.nameHi : p.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                  {p.unit}
                                </span>
                                {p.warrantyPeriod && (
                                  <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded w-fit flex items-center gap-1">
                                    🛡️ {language === 'hi' && p.warrantyPeriodHi ? p.warrantyPeriodHi : p.warrantyPeriod}
                                  </span>
                                )}
                                {p.replacementPolicy && (
                                  <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded w-fit flex items-center gap-1">
                                    🔄 {language === 'hi' && p.replacementPolicyHi ? p.replacementPolicyHi : p.replacementPolicy}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {isEditing ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-slate-400 font-semibold uppercase leading-none">MRP</span>
                              <input
                                type="number"
                                value={editMrp}
                                onChange={(e) => setEditMrp(e.target.value)}
                                className="w-20 border border-slate-200 px-2 py-1 rounded text-xs bg-white"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-500 font-medium">₹{p.mrp ?? Math.round(p.price * 1.25)}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                          {isEditing ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-slate-400 font-semibold uppercase leading-none">Selling</span>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 border border-slate-200 px-2 py-1 rounded text-xs bg-white"
                              />
                            </div>
                          ) : (
                            `₹${p.sellingPrice ?? p.price}`
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {isEditing ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-slate-400 font-semibold uppercase leading-none">MSP</span>
                              <input
                                type="number"
                                value={editMsp}
                                onChange={(e) => setEditMsp(e.target.value)}
                                className="w-20 border border-slate-200 px-2 py-1 rounded text-xs bg-white"
                              />
                            </div>
                          ) : (
                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-black border border-blue-200/40">₹{p.msp ?? Math.round(p.price * 0.85)}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-16 border border-slate-200 px-2 py-1 rounded text-sm bg-white"
                            />
                          ) : (
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                                p.stock > 0
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700 group'
                                  : 'bg-red-50 text-red-700 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              {p.stock > 0 ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-red-500" />
                                  <span className="group-hover:hidden">{p.stock} Units</span>
                                  <span className="hidden group-inline font-semibold">Toggle Out</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  {t.outOfStock} (Restock)
                                </>
                              )}
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <button
                              onClick={() => saveProductEdits(p.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditing(p)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition"
                            >
                              <Edit2 className="h-4 w-4" />
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
        </div>

        {/* Right Column (4 cols): Store Performance & Reviews & Broadcast Promo */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Performance Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              {language === 'en' ? 'Store Performance' : 'दुकान प्रदर्शन'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'en' ? 'Revenue' : 'राजस्व'}</p>
                <p className="text-lg font-black text-slate-800 font-mono mt-0.5">
                  ₹{storeOrders.reduce((acc, o) => acc + o.total, 0)}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'en' ? 'Rating' : 'रेटिंग'}</p>
                <p className="text-lg font-black text-slate-800 mt-0.5 flex items-center gap-1">
                  ★ {activeStore.rating}{' '}
                  <span className="text-xs text-slate-400 font-normal">({storeReviews.length})</span>
                </p>
              </div>
            </div>
          </div>

          {/* Wishlist & Cart Analytics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-1.5">
              <span className="text-rose-500">❤️</span>
              {language === 'en' ? 'Wishlist & Cart Analytics' : 'विशलिस्ट और कार्ट विश्लेषण'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {language === 'en' ? 'See which of your products are starred by shoppers or currently in their carts.' : 'देखें कि आपके कौन से उत्पाद खरीदारों द्वारा पसंदीदा हैं या वर्तमान में उनके कार्ट में हैं।'}
            </p>

            {(() => {
              const storeProducts = products.filter(p => p.storeId === merchantStoreId);
              const analytics = storeProducts.map(product => {
                const watchlistCount = users.reduce((acc, user) => {
                  if (user.watchlist?.includes(product.id)) return acc + 1;
                  return acc;
                }, 0);

                let cartQty = 0;
                const activeCartItems = cart[merchantStoreId] || [];
                const activeMatch = activeCartItems.find(it => it.product.id === product.id);
                if (activeMatch) cartQty += activeMatch.quantity;

                users.forEach(user => {
                  if (user.cart) {
                    const userCartItems = user.cart[merchantStoreId] || [];
                    const match = userCartItems.find(it => it.product.id === product.id);
                    if (match) cartQty += match.quantity;
                  }
                });

                return { product, watchlistCount, cartQty };
              }).filter(item => item.watchlistCount > 0 || item.cartQty > 0);

              if (analytics.length === 0) {
                return (
                  <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    {language === 'en' ? 'No items in customer wishlists or carts yet.' : 'अभी तक ग्राहकों की विशलिस्ट या कार्ट में कोई सामान नहीं है।'}
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {analytics.map(({ product, watchlistCount, cartQty }) => (
                    <div key={product.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-2 truncate">
                        <img src={product.image} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="truncate">{language === 'hi' ? product.nameHi : product.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        {watchlistCount > 0 && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-mono font-bold">
                            ⭐ {watchlistCount}
                          </span>
                        )}
                        {cartQty > 0 && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-mono font-bold">
                            🛒 {cartQty}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Seller Earnings & Payout Requests */}
          {(() => {
            const revenue = storeOrders.reduce((acc, o) => {
              if (o.deliveryStatus === 'cancelled') return acc;
              const orderMspTotal = o.items.reduce((itemAcc, item) => {
                const itemMsp = item.product.msp ?? Math.round((item.product.sellingPrice ?? item.product.price ?? 0) * 0.85);
                return itemAcc + (item.quantity * itemMsp);
              }, 0);
              return acc + orderMspTotal;
            }, 0);
            const approvedPayouts = payoutRequests
              .filter(req => req.sellerId === merchantStoreId && req.status === 'approved')
              .reduce((acc, r) => acc + r.amount, 0);
            const balance = Math.max(0, revenue - approvedPayouts);

            const myPayoutRequests = payoutRequests.filter(req => req.sellerId === merchantStoreId);

            // Local form states
            const [payoutAmount, setPayoutAmount] = useState('');
            const [payoutUpi, setPayoutUpi] = useState('');

            const handleRequestPayout = (e: React.FormEvent) => {
              e.preventDefault();
              const amt = parseFloat(payoutAmount);
              if (isNaN(amt) || amt <= 0) {
                alert(language === 'en' ? 'Please enter a valid positive payout amount.' : 'कृपया वैध सकारात्मक भुगतान राशि दर्ज करें।');
                return;
              }
              if (amt > balance) {
                alert(language === 'en' ? `Insufficient balance. Your available balance is ₹${balance}.` : `अपर्याप्त शेष राशि। आपका उपलब्ध शेष राशि ₹${balance} है।`);
                return;
              }
              if (!payoutUpi.trim()) {
                alert(language === 'en' ? 'Please specify a UPI ID for payout routing.' : 'कृपया भुगतान के लिए यूपीआई आईडी निर्दिष्ट करें।');
                return;
              }

              const newRequest: PayoutRequest = {
                id: 'payout-req-' + Date.now(),
                sellerId: merchantStoreId,
                sellerName: language === 'hi' ? activeStore.nameHi : activeStore.name,
                amount: amt,
                upiId: payoutUpi.trim(),
                status: 'pending',
                date: new Date().toISOString().split('T')[0]
              };

              onAddPayoutRequest(newRequest);
              setPayoutAmount('');
              setPayoutUpi('');
              alert(language === 'en' ? 'Payout request submitted successfully! Pending admin approval.' : 'भुगतान अनुरोध सफलतापूर्वक सबमिट किया गया! व्यवस्थापक स्वीकृति लंबित है।');
            };

            return (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                  <span>💰</span>
                  {language === 'en' ? 'Earnings & Payout Requests' : 'कमाई और भुगतान अनुरोध'}
                </h3>

                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1 relative overflow-hidden">
                  <div className="absolute right-[-10px] bottom-[-10px] text-slate-800/20 font-mono text-7xl font-black">₹</div>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{language === 'en' ? 'Withdrawal Balance (Based strictly on MSP)' : 'निकासी योग्य शेष राशि (strictly MSP पर आधारित)'}</p>
                  <p className="text-2xl font-black font-mono">₹{balance}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'en' ? `Total MSP Earnings: ₹${revenue} | Approved Payouts: ₹${approvedPayouts}` : `कुल MSP कमाई: ₹${revenue} | स्वीकृत भुगतान: ₹${approvedPayouts}`}
                  </p>
                  <p className="text-[9px] text-amber-300 font-medium">
                    {language === 'en' ? '⚠️ Earnings are computed from product MSPs, not retail customer pricing.' : '⚠️ कमाई की गणना सामग्री की MSP पर होती है, न कि ग्राहक मूल्य पर।'}
                  </p>
                </div>

                {balance > 0 ? (
                  <form onSubmit={handleRequestPayout} className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">{language === 'en' ? 'Amount (₹)' : 'राशि (₹)'}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={payoutAmount}
                            onChange={e => setPayoutAmount(e.target.value)}
                            placeholder={balance.toString()}
                            className="w-full bg-slate-50 text-xs font-mono font-bold border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                            max={balance}
                            min={1}
                          />
                          <button
                            type="button"
                            onClick={() => setPayoutAmount(balance.toString())}
                            className="absolute right-2 top-1.5 text-[9px] bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-1.5 py-0.5 rounded font-black uppercase"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">{language === 'en' ? 'UPI ID' : 'यूपीआई आईडी'}</label>
                        <input
                          type="text"
                          value={payoutUpi}
                          onChange={e => setPayoutUpi(e.target.value)}
                          placeholder="store@okupi"
                          className="w-full bg-slate-50 text-xs border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider"
                    >
                      🚀 {language === 'en' ? 'Submit Payout Request' : 'भुगतान अनुरोध सबमिट करें'}
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center text-[11px] font-bold text-slate-500">
                    {language === 'en' ? 'Zero balance. Complete more orders to withdraw payouts!' : 'शून्य शेष राशि। भुगतान निकालने के लिए अधिक ऑर्डर पूरे करें!'}
                  </div>
                )}

                {/* Requests history list */}
                {myPayoutRequests.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Payout Requests History' : 'भुगतान अनुरोधों का इतिहास'}</p>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                      {myPayoutRequests.slice().reverse().map(req => (
                        <div key={req.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                          <div>
                            <span className="font-extrabold text-slate-700">₹{req.amount}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{req.date} • {req.upiId}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {req.status === 'approved' && (language === 'hi' ? 'स्वीकृत' : 'Approved')}
                            {req.status === 'rejected' && (language === 'hi' ? 'अस्वीकृत' : 'Rejected')}
                            {req.status === 'pending' && (language === 'hi' ? 'लंबित' : 'Pending')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Broadcast Discounts & Promotions Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-emerald-600" />
              {t.notificationHeading}
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {language === 'en' ? 'Create a promo deal to push instantly to customer notification panels!' : 'ग्राहक सूचना पैनल पर तुरंत भेजने के लिए एक प्रचार सौदा बनाएं!'}
            </p>

            <form onSubmit={handleBroadcastPromo} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.promoTitleInput} (English)</label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. Gupta Ji Flash 20% Off!"
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.promoTitleInput} (Hindi)</label>
                <input
                  type="text"
                  required
                  value={promoTitleHi}
                  onChange={(e) => setPromoTitleHi(e.target.value)}
                  placeholder="जैसे- गुप्ता जी फ्लैश 20% छूट!"
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.promoBodyInput} (English)</label>
                <input
                  type="text"
                  required
                  value={promoBody}
                  onChange={(e) => setPromoBody(e.target.value)}
                  placeholder="Enjoy 20% discount on Atta packs."
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.promoBodyInput} (Hindi)</label>
                <input
                  type="text"
                  required
                  value={promoBodyHi}
                  onChange={(e) => setPromoBodyHi(e.target.value)}
                  placeholder="आटा पैक पर 20% की छूट का आनंद लें।"
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.promoCodeInput}</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="GUPTA20"
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.promoDiscountInput}</label>
                  <input
                    type="number"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(e.target.value)}
                    placeholder="50"
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Send className="h-3.5 w-3.5 text-emerald-400" />
                {t.sendNotification}
              </button>
            </form>
          </div>

          {/* Customer Reviews for active store */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              {t.clientReviews}
            </h3>

            {storeReviews.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">
                {language === 'en' ? 'No feedback left yet.' : 'अभी तक कोई फीडबैक नहीं मिला है।'}
              </p>
            ) : (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {storeReviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700">{rev.author}</span>
                      <span className="text-amber-500 font-bold font-mono">★ {rev.rating}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed italic">
                      "{language === 'hi' ? rev.commentHi : rev.comment}"
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1.5">{rev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
