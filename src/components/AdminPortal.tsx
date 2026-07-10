/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Store as StoreIcon, 
  Package, 
  Tag, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Megaphone,
  X,
  Edit2,
  Settings as SettingsIcon,
  Layers as LayersIcon,
  Activity as ActivityIcon,
  Wrench as WrenchIcon,
  Cpu as CpuIcon,
  Coins as CoinsIcon,
  FileText as FileTextIcon,
  Check as CheckIcon,
  HelpCircle as HelpCircleIcon
} from 'lucide-react';
import { Store, Product, Review, Order, Notification, Language, RegisteredUser, UserActivity, SupportTicket, SystemSettings, CustomPanel, CustomPanelMetric, PayoutRequest, PriceChangeLog, Restaurant, ClothingBoutique, RestaurantMenuItem, ClothingItem, MerchantRequest } from '../types';
import ServiceAreaManagement from './ServiceAreaManagement';
import AdminFoodPanel from './AdminFoodPanel';
import AdminFashionPanel from './AdminFashionPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminPortalProps {
  stores: Store[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  notifications: Notification[];
  language: Language;
  users: RegisteredUser[];
  supportTickets: SupportTicket[];
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  customPanels: CustomPanel[];
  onUpdateCustomPanels: (panels: CustomPanel[]) => void;
  onUpdateStores: (stores: Store[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateReviews: (reviews: Review[]) => void;
  onUpdateUsers: (users: RegisteredUser[]) => void;
  onAddNotification: (notification: Notification) => void;
  onAdminReplySupportTicket: (ticketId: string, text: string) => void;
  onToggleTicketStatus: (ticketId: string, status: 'open' | 'resolved') => void;
  onUpdateOrders: (orders: Order[]) => void;
  payoutRequests: PayoutRequest[];
  onUpdatePayoutRequests: (requests: PayoutRequest[]) => void;
  merchantRequests?: MerchantRequest[];
  onUpdateMerchantRequests?: (requests: MerchantRequest[]) => void;
  priceLogs: PriceChangeLog[];
  onUpdateProductPricesAndStock?: (productId: string, updates: { mrp?: number; sellingPrice?: number; msp?: number; price?: number; stock?: number; name?: string; nameHi?: string; image?: string }, changedBy: 'seller' | 'admin', changerName: string) => void;
  restaurants: Restaurant[];
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  boutiques: ClothingBoutique[];
  onUpdateBoutiques: (boutiques: ClothingBoutique[]) => void;
  activeAdminTab?: string;
  setActiveAdminTab?: (tab: string) => void;
}

export default function AdminPortal({
  stores,
  products,
  reviews,
  orders,
  notifications,
  language,
  users,
  supportTickets,
  settings,
  onUpdateSettings,
  customPanels,
  onUpdateCustomPanels,
  onUpdateStores,
  onUpdateProducts,
  onUpdateReviews,
  onUpdateUsers,
  onAddNotification,
  onAdminReplySupportTicket,
  onToggleTicketStatus,
  onUpdateOrders,
  payoutRequests,
  onUpdatePayoutRequests,
  merchantRequests = [],
  onUpdateMerchantRequests,
  priceLogs,
  onUpdateProductPricesAndStock,
  restaurants,
  onUpdateRestaurants,
  boutiques,
  onUpdateBoutiques,
  activeAdminTab: propActiveAdminTab,
  setActiveAdminTab: propSetActiveAdminTab
}: AdminPortalProps) {
  const [localActiveAdminTab, setLocalActiveAdminTab] = useState<string>('overview');
  const activeAdminTab = propActiveAdminTab || localActiveAdminTab;
  const setActiveAdminTab = propSetActiveAdminTab || setLocalActiveAdminTab;
  const [selectedChartArea, setSelectedChartArea] = useState<string>('all');
  const [selectedUserDetailId, setSelectedUserDetailId] = useState<string | null>('user-1');
  const activeUserDetail = users.find(u => u.id === selectedUserDetailId);

  // Admin Food Panel States
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [selectedRestaurantToEdit, setSelectedRestaurantToEdit] = useState<Restaurant | null>(null);
  const [selectedRestaurantMenuToManage, setSelectedRestaurantMenuToManage] = useState<Restaurant | null>(null);

  // Restaurant form fields
  const [restName, setRestName] = useState('');
  const [restNameHi, setRestNameHi] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restAddressHi, setRestAddressHi] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  const [restCuisineHi, setRestCuisineHi] = useState('');
  const [restMinOrder, setRestMinOrder] = useState(100);
  const [restDeliveryTime, setRestDeliveryTime] = useState('20-30 mins');
  const [restDeliveryTimeHi, setRestDeliveryTimeHi] = useState('20-30 मिनट');
  const [restBanner, setRestBanner] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop');

  // Restaurant Menu Item form fields
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false);
  const [selectedMenuItemToEdit, setSelectedMenuItemToEdit] = useState<RestaurantMenuItem | null>(null);

  const [menuItemName, setMenuItemName] = useState('');
  const [menuItemNameHi, setMenuItemNameHi] = useState('');
  const [menuItemPrice, setMenuItemPrice] = useState(100);
  const [menuItemCategory, setMenuItemCategory] = useState<'veg' | 'nonveg' | 'sweet' | 'beverage'>('veg');
  const [menuItemImage, setMenuItemImage] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop');
  const [menuItemDesc, setMenuItemDesc] = useState('');
  const [menuItemDescHi, setMenuItemDescHi] = useState('');

  // Admin Fashion Panel States
  const [showAddBoutiqueModal, setShowAddBoutiqueModal] = useState(false);
  const [showEditBoutiqueModal, setShowEditBoutiqueModal] = useState(false);
  const [selectedBoutiqueToEdit, setSelectedBoutiqueToEdit] = useState<ClothingBoutique | null>(null);
  const [selectedBoutiqueItemsToManage, setSelectedBoutiqueItemsToManage] = useState<ClothingBoutique | null>(null);

  // Boutique form fields
  const [btName, setBtName] = useState('');
  const [btNameHi, setBtNameHi] = useState('');
  const [btAddress, setBtAddress] = useState('');
  const [btAddressHi, setBtAddressHi] = useState('');
  const [btSpecialty, setBtSpecialty] = useState('');
  const [btSpecialtyHi, setBtSpecialtyHi] = useState('');
  const [btMinOrder, setBtMinOrder] = useState(300);
  const [btDeliveryTime, setBtDeliveryTime] = useState('2-3 Days');
  const [btDeliveryTimeHi, setBtDeliveryTimeHi] = useState('2-3 दिन');
  const [btBanner, setBtBanner] = useState('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop');

  // Boutique Clothing Item form fields
  const [showAddClothingItemModal, setShowAddClothingItemModal] = useState(false);
  const [showEditClothingItemModal, setShowEditClothingItemModal] = useState(false);
  const [selectedClothingItemToEdit, setSelectedClothingItemToEdit] = useState<ClothingItem | null>(null);

  const [clothItemName, setClothItemName] = useState('');
  const [clothItemNameHi, setClothItemNameHi] = useState('');
  const [clothItemPrice, setClothItemPrice] = useState(499);
  const [clothItemCategory, setClothItemCategory] = useState<'ethnic' | 'western' | 'kids' | 'footwear' | 'accessories' | 'jewellery'>('ethnic');
  const [clothItemImage, setClothItemImage] = useState('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=250&auto=format&fit=crop');
  const [clothItemDesc, setClothItemDesc] = useState('');
  const [clothItemDescHi, setClothItemDescHi] = useState('');
  const [clothItemSizes, setClothItemSizes] = useState('S, M, L, XL');
  const [clothItemHasStitching, setClothItemHasStitching] = useState(false);

  // Handlers for Restaurants
  const handleAddRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    const newRest: Restaurant = {
      id: 'rest-' + Date.now(),
      name: restName,
      nameHi: restNameHi || restName,
      address: restAddress,
      addressHi: restAddressHi || restAddress,
      cuisine: restCuisine,
      cuisineHi: restCuisineHi || restCuisine,
      minOrder: Number(restMinOrder),
      deliveryTime: restDeliveryTime,
      deliveryTimeHi: restDeliveryTimeHi,
      banner: restBanner,
      rating: 4.5,
      menu: []
    };
    onUpdateRestaurants([...restaurants, newRest]);
    setShowAddRestaurantModal(false);
    setRestName(''); setRestNameHi(''); setRestAddress(''); setRestAddressHi(''); setRestCuisine(''); setRestCuisineHi('');
  };

  const handleEditRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantToEdit) return;
    const updated = restaurants.map(r => {
      if (r.id === selectedRestaurantToEdit.id) {
        return {
          ...r,
          name: restName,
          nameHi: restNameHi,
          address: restAddress,
          addressHi: restAddressHi,
          cuisine: restCuisine,
          cuisineHi: restCuisineHi,
          minOrder: Number(restMinOrder),
          deliveryTime: restDeliveryTime,
          deliveryTimeHi: restDeliveryTimeHi,
          banner: restBanner
        };
      }
      return r;
    });
    onUpdateRestaurants(updated);
    setShowEditRestaurantModal(false);
    setSelectedRestaurantToEdit(null);
  };

  const handleDeleteRestaurant = (id: string) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this restaurant?' : 'क्या आप वाकई इस रेस्टोरेंट को हटाना चाहते हैं?')) {
      onUpdateRestaurants(restaurants.filter(r => r.id !== id));
    }
  };

  const handleManageMenuAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantMenuToManage) return;
    const newItem: RestaurantMenuItem = {
      id: 'food-' + Date.now(),
      name: menuItemName,
      nameHi: menuItemNameHi || menuItemName,
      price: Number(menuItemPrice),
      category: menuItemCategory,
      image: menuItemImage,
      description: menuItemDesc,
      descriptionHi: menuItemDescHi || menuItemDesc
    };
    const updatedRestaurants = restaurants.map(r => {
      if (r.id === selectedRestaurantMenuToManage.id) {
        const updatedMenu = [...(r.menu || []), newItem];
        return { ...r, menu: updatedMenu };
      }
      return r;
    });
    onUpdateRestaurants(updatedRestaurants);
    const targetRest = updatedRestaurants.find(r => r.id === selectedRestaurantMenuToManage.id);
    if (targetRest) setSelectedRestaurantMenuToManage(targetRest);
    setShowAddMenuItemModal(false);
    setMenuItemName(''); setMenuItemNameHi(''); setMenuItemPrice(100); setMenuItemDesc(''); setMenuItemDescHi('');
  };

  const handleManageMenuEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantMenuToManage || !selectedMenuItemToEdit) return;
    const updatedRestaurants = restaurants.map(r => {
      if (r.id === selectedRestaurantMenuToManage.id) {
        const updatedMenu = r.menu.map(item => {
          if (item.id === selectedMenuItemToEdit.id) {
            return {
              ...item,
              name: menuItemName,
              nameHi: menuItemNameHi,
              price: Number(menuItemPrice),
              category: menuItemCategory,
              image: menuItemImage,
              description: menuItemDesc,
              descriptionHi: menuItemDescHi
            };
          }
          return item;
        });
        return { ...r, menu: updatedMenu };
      }
      return r;
    });
    onUpdateRestaurants(updatedRestaurants);
    const targetRest = updatedRestaurants.find(r => r.id === selectedRestaurantMenuToManage.id);
    if (targetRest) setSelectedRestaurantMenuToManage(targetRest);
    setShowEditMenuItemModal(false);
    setSelectedMenuItemToEdit(null);
  };

  const handleManageMenuDelete = (itemId: string) => {
    if (!selectedRestaurantMenuToManage) return;
    if (window.confirm(language === 'en' ? 'Delete this food item?' : 'क्या आप इस खाद्य सामग्री को हटाना चाहते हैं?')) {
      const updatedRestaurants = restaurants.map(r => {
        if (r.id === selectedRestaurantMenuToManage.id) {
          return { ...r, menu: r.menu.filter(i => i.id !== itemId) };
        }
        return r;
      });
      onUpdateRestaurants(updatedRestaurants);
      const targetRest = updatedRestaurants.find(r => r.id === selectedRestaurantMenuToManage.id);
      if (targetRest) setSelectedRestaurantMenuToManage(targetRest);
    }
  };

  // Handlers for Boutiques / Shops
  const handleAddBoutique = (e: React.FormEvent) => {
    e.preventDefault();
    const newBt: ClothingBoutique = {
      id: 'boutique-' + Date.now(),
      name: btName,
      nameHi: btNameHi || btName,
      address: btAddress,
      addressHi: btAddressHi || btAddress,
      specialty: btSpecialty,
      specialtyHi: btSpecialtyHi || btSpecialty,
      minOrder: Number(btMinOrder),
      deliveryTime: btDeliveryTime,
      deliveryTimeHi: btDeliveryTimeHi,
      banner: btBanner,
      rating: 4.5,
      items: [],
      shopType: (clothItemCategory === 'jewellery' || btSpecialty.toLowerCase().includes('jewel')) ? 'jewellery' : (clothItemCategory === 'footwear' || btSpecialty.toLowerCase().includes('foot')) ? 'footwear' : 'boutique'
    };
    onUpdateBoutiques([...boutiques, newBt]);
    setShowAddBoutiqueModal(false);
    setBtName(''); setBtNameHi(''); setBtAddress(''); setBtAddressHi(''); setBtSpecialty(''); setBtSpecialtyHi('');
  };

  const handleEditBoutique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoutiqueToEdit) return;
    const updated = boutiques.map(b => {
      if (b.id === selectedBoutiqueToEdit.id) {
        return {
          ...b,
          name: btName,
          nameHi: btNameHi,
          address: btAddress,
          addressHi: btAddressHi,
          specialty: btSpecialty,
          specialtyHi: btSpecialtyHi,
          minOrder: Number(btMinOrder),
          deliveryTime: btDeliveryTime,
          deliveryTimeHi: btDeliveryTimeHi,
          banner: btBanner
        };
      }
      return b;
    });
    onUpdateBoutiques(updated);
    setShowEditBoutiqueModal(false);
    setSelectedBoutiqueToEdit(null);
  };

  const handleDeleteBoutique = (id: string) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this fashion shop?' : 'क्या आप वाकई इस फैशन शॉप को हटाना चाहते हैं?')) {
      onUpdateBoutiques(boutiques.filter(b => b.id !== id));
    }
  };

  const handleManageItemAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoutiqueItemsToManage) return;
    const newItem: ClothingItem = {
      id: 'cloth-' + Date.now(),
      name: clothItemName,
      nameHi: clothItemNameHi || clothItemName,
      price: Number(clothItemPrice),
      category: clothItemCategory as any,
      image: clothItemImage,
      description: clothItemDesc,
      descriptionHi: clothItemDescHi || clothItemDesc,
      sizes: clothItemSizes.split(',').map(s => s.trim()).filter(Boolean),
      hasStitchingOption: clothItemHasStitching
    };
    const updatedBoutiques = boutiques.map(b => {
      if (b.id === selectedBoutiqueItemsToManage.id) {
        const updatedItems = [...(b.items || []), newItem];
        return { ...b, items: updatedItems };
      }
      return b;
    });
    onUpdateBoutiques(updatedBoutiques);
    const targetBt = updatedBoutiques.find(b => b.id === selectedBoutiqueItemsToManage.id);
    if (targetBt) setSelectedBoutiqueItemsToManage(targetBt);
    setShowAddClothingItemModal(false);
    setClothItemName(''); setClothItemNameHi(''); setClothItemPrice(499); setClothItemDesc(''); setClothItemDescHi('');
  };

  const handleManageItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoutiqueItemsToManage || !selectedClothingItemToEdit) return;
    const updatedBoutiques = boutiques.map(b => {
      if (b.id === selectedBoutiqueItemsToManage.id) {
        const updatedItems = b.items.map(item => {
          if (item.id === selectedClothingItemToEdit.id) {
            return {
              ...item,
              name: clothItemName,
              nameHi: clothItemNameHi,
              price: Number(clothItemPrice),
              category: clothItemCategory as any,
              image: clothItemImage,
              description: clothItemDesc,
              descriptionHi: clothItemDescHi,
              sizes: clothItemSizes.split(',').map(s => s.trim()).filter(Boolean),
              hasStitchingOption: clothItemHasStitching
            };
          }
          return item;
        });
        return { ...b, items: updatedItems };
      }
      return b;
    });
    onUpdateBoutiques(updatedBoutiques);
    const targetBt = updatedBoutiques.find(b => b.id === selectedBoutiqueItemsToManage.id);
    if (targetBt) setSelectedBoutiqueItemsToManage(targetBt);
    setShowEditClothingItemModal(false);
    setSelectedClothingItemToEdit(null);
  };

  const handleManageItemDelete = (itemId: string) => {
    if (!selectedBoutiqueItemsToManage) return;
    if (window.confirm(language === 'en' ? 'Delete this apparel item?' : 'क्या आप इस परिधान को हटाना चाहते हैं?')) {
      const updatedBoutiques = boutiques.map(b => {
        if (b.id === selectedBoutiqueItemsToManage.id) {
          return { ...b, items: b.items.filter(i => i.id !== itemId) };
        }
        return b;
      });
      onUpdateBoutiques(updatedBoutiques);
      const targetBt = updatedBoutiques.find(b => b.id === selectedBoutiqueItemsToManage.id);
      if (targetBt) setSelectedBoutiqueItemsToManage(targetBt);
    }
  };

  // Support Admin State
  const [selectedAdminTicketId, setSelectedAdminTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Admin Orders Management Filter State
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [adminDeliveryFilter, setAdminDeliveryFilter] = useState<'all' | 'pending' | 'processing' | 'ready_for_pickup' | 'ready_for_delivery' | 'out_for_delivery' | 'arrived'>('all');
  const [adminPaymentFilter, setAdminPaymentFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // New Store Form State
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreNameHi, setNewStoreNameHi] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreAddressHi, setNewStoreAddressHi] = useState('');
  const [newStoreDeliveryTime, setNewStoreDeliveryTime] = useState('10-15 mins');
  const [newStoreDeliveryTimeHi, setNewStoreDeliveryTimeHi] = useState('10-15 मिनट');
  const [newStoreMinOrder, setNewStoreMinOrder] = useState(50);
  const [newStoreBanner, setNewStoreBanner] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600');
  const [newStoreCategories, setNewStoreCategories] = useState('Daily Provisions, Snacks');

  // Edit Store Form State
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [selectedStoreToEdit, setSelectedStoreToEdit] = useState<Store | null>(null);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreNameHi, setEditStoreNameHi] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');
  const [editStoreAddressHi, setEditStoreAddressHi] = useState('');
  const [editStoreDeliveryTime, setEditStoreDeliveryTime] = useState('');
  const [editStoreDeliveryTimeHi, setEditStoreDeliveryTimeHi] = useState('');
  const [editStoreMinOrder, setEditStoreMinOrder] = useState(50);
  const [editStoreBanner, setEditStoreBanner] = useState('');
  const [editStoreCategories, setEditStoreCategories] = useState('');

  // New Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameHi, setNewProdNameHi] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(10);
  const [newProdUnit, setNewProdUnit] = useState('1 kg');
  const [newProdUnitHi, setNewProdUnitHi] = useState('1 किलो');
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdCategory, setNewProdCategory] = useState('Daily Provisions');
  const [newProdCategoryHi, setNewProdCategoryHi] = useState('दैनिक प्रावधान');
  const [newProdStoreId, setNewProdStoreId] = useState(stores[0]?.id || 'gupta-kirana');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdDescHi, setNewProdDescHi] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200');
  const [newProdWarranty, setNewProdWarranty] = useState('');
  const [newProdWarrantyHi, setNewProdWarrantyHi] = useState('');
  const [newProdReplacement, setNewProdReplacement] = useState('');
  const [newProdReplacementHi, setNewProdReplacementHi] = useState('');

  // Admin Product Detail & Price Editing State
  const [selectedDetailsProduct, setSelectedDetailsProduct] = useState<Product | null>(null);
  const [editAdminMrp, setEditAdminMrp] = useState<number>(0);
  const [editAdminSellingPrice, setEditAdminSellingPrice] = useState<number>(0);
  const [editAdminMsp, setEditAdminMsp] = useState<number>(0);
  const [editAdminName, setEditAdminName] = useState<string>('');
  const [editAdminNameHi, setEditAdminNameHi] = useState<string>('');
  const [editAdminImage, setEditAdminImage] = useState<string>('');

  // Push Broadcast Promo Form State
  const [promoTitle, setPromoTitle] = useState('');
  const [promoTitleHi, setPromoTitleHi] = useState('');
  const [promoBody, setPromoBody] = useState('');
  const [promoBodyHi, setPromoBodyHi] = useState('');

  // --- AI Admin Trends & Market Demands ---
  const [trendReportLoading, setTrendReportLoading] = useState(false);
  const [trendReport, setTrendReport] = useState<{
    summary: string;
    topDemands: Array<{
      category: string;
      keyword: string;
      estimatedGrowth: string;
      actionItem: string;
    }>;
    restockAdvice: Array<{
      merchantName: string;
      suggestedAction: string;
      reason: string;
    }>;
    offline?: boolean;
  } | null>(null);

  const handleLoadTrendReport = async () => {
    setTrendReportLoading(true);
    try {
      const allUserSearches = users.flatMap(u => (u.searchHistory || []).map(q => ({
        userId: u.id,
        userName: u.name,
        query: q
      })));

      const res = await fetch('/api/admin/trend-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allUserSearches,
          allOrders: orders,
          allProducts: products.map(p => ({ id: p.id, name: p.name, category: p.category })),
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTrendReport(data);
      }
    } catch (err) {
      console.error("Error generating Admin trend report", err);
    } finally {
      setTrendReportLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeAdminTab === 'ai-trends' && !trendReport && !trendReportLoading) {
      handleLoadTrendReport();
    }
  }, [activeAdminTab]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(25);
  const [promoType, setPromoType] = useState<'discount' | 'general'>('discount');

  // Custom Dynamic Panels Builder states
  const [newPanelName, setNewPanelName] = useState('');
  const [newPanelNameHi, setNewPanelNameHi] = useState('');
  const [newPanelIcon, setNewPanelIcon] = useState('TrendingUp');
  const [newPanelDescription, setNewPanelDescription] = useState('');
  const [newPanelDescriptionHi, setNewPanelDescriptionHi] = useState('');
  const [newPanelRichContent, setNewPanelRichContent] = useState('');
  const [newPanelRichContentHi, setNewPanelRichContentHi] = useState('');
  
  // Dynamic Metric Cards Form states
  const [newMetric1Label, setNewMetric1Label] = useState('');
  const [newMetric1LabelHi, setNewMetric1LabelHi] = useState('');
  const [newMetric1Value, setNewMetric1Value] = useState('');
  const [newMetric1Icon, setNewMetric1Icon] = useState('star');

  const [newMetric2Label, setNewMetric2Label] = useState('');
  const [newMetric2LabelHi, setNewMetric2LabelHi] = useState('');
  const [newMetric2Value, setNewMetric2Value] = useState('');
  const [newMetric2Icon, setNewMetric2Icon] = useState('users');

  // Calculated Stats
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const coinsIssued = orders.reduce((sum, o) => sum + (o.coinsEarned || 0), 0);
  const coinsRedeemed = orders.reduce((sum, o) => sum + (o.coinsRedeemed || 0), 0);

  const uniqueAreas = React.useMemo(() => {
    const areas = new Set<string>();
    stores.forEach(s => {
      if (s.area) areas.add(s.area);
    });
    return Array.from(areas);
  }, [stores]);

  const areaPerformanceData = React.useMemo(() => {
    if (selectedChartArea === 'all') {
      const data: Record<string, number> = {};
      orders.forEach(order => {
        const store = stores.find(s => s.id === order.storeId);
        const area = store?.area || 'Maudaha';
        data[area] = (data[area] || 0) + order.total;
      });
      return Object.entries(data).map(([area, sales]) => ({ name: area, sales }));
    } else {
      const data: Record<string, number> = {};
      orders.forEach(order => {
        const store = stores.find(s => s.id === order.storeId);
        const area = store?.area || 'Maudaha';
        if (area === selectedChartArea) {
          const storeName = language === 'hi' ? (store?.nameHi || store?.name || order.storeName) : (store?.name || order.storeName);
          data[storeName] = (data[storeName] || 0) + order.total;
        }
      });
      // Ensure all stores in this area are represented, even with 0 sales
      stores.forEach(store => {
        if ((store.area || 'Maudaha') === selectedChartArea) {
          const storeName = language === 'hi' ? (store.nameHi || store.name) : store.name;
          if (data[storeName] === undefined) {
            data[storeName] = 0;
          }
        }
      });
      return Object.entries(data).map(([storeName, sales]) => ({ name: storeName, sales }));
    }
  }, [orders, stores, selectedChartArea, language]);

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;

    const id = newStoreName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newStore: Store = {
      id,
      name: newStoreName,
      nameHi: newStoreNameHi || newStoreName,
      address: newStoreAddress,
      addressHi: newStoreAddressHi || newStoreAddress,
      rating: 5.0,
      reviewCount: 0,
      banner: newStoreBanner,
      deliveryTime: newStoreDeliveryTime,
      deliveryTimeHi: newStoreDeliveryTimeHi || newStoreDeliveryTime,
      minOrder: Number(newStoreMinOrder),
      categories: newStoreCategories.split(',').map(s => s.trim())
    };

    onUpdateStores([...stores, newStore]);
    setShowAddStoreModal(false);
    // Reset Form
    setNewStoreName('');
    setNewStoreNameHi('');
    setNewStoreAddress('');
    setNewStoreAddressHi('');
  };

  const handleDeleteStore = (storeId: string) => {
    if (confirm(language === 'en' ? 'Are you sure you want to delete this store? All associated items will also be hidden.' : 'क्या आप वाकई इस दुकान को हटाना चाहते हैं?')) {
      onUpdateStores(stores.filter(s => s.id !== storeId));
      onUpdateProducts(products.filter(p => p.storeId !== storeId));
    }
  };

  const handleEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreToEdit) return;

    const updatedStores = stores.map(st => {
      if (st.id === selectedStoreToEdit.id) {
        return {
          ...st,
          name: editStoreName,
          nameHi: editStoreNameHi || editStoreName,
          address: editStoreAddress,
          addressHi: editStoreAddressHi || editStoreAddress,
          deliveryTime: editStoreDeliveryTime,
          deliveryTimeHi: editStoreDeliveryTimeHi || editStoreDeliveryTime,
          minOrder: Number(editStoreMinOrder),
          banner: editStoreBanner,
          categories: editStoreCategories.split(',').map(s => s.trim())
        };
      }
      return st;
    });

    onUpdateStores(updatedStores);
    setShowEditStoreModal(false);
    setSelectedStoreToEdit(null);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const priceVal = Number(newProdPrice);
    const newProd: Product = {
      id: 'p-' + Date.now(),
      name: newProdName,
      nameHi: newProdNameHi || newProdName,
      price: priceVal,
      sellingPrice: priceVal,
      mrp: Math.round(priceVal * 1.25),
      msp: Math.round(priceVal * 0.85),
      unit: newProdUnit,
      unitHi: newProdUnitHi || newProdUnit,
      stock: Number(newProdStock),
      category: newProdCategory,
      categoryHi: newProdCategoryHi || newProdCategory,
      storeId: newProdStoreId,
      description: newProdDesc,
      descriptionHi: newProdDescHi || newProdDesc,
      image: newProdImage,
      rating: 5.0,
      warrantyPeriod: newProdWarranty || undefined,
      warrantyPeriodHi: newProdWarrantyHi || newProdWarranty || undefined,
      replacementPolicy: newProdReplacement || undefined,
      replacementPolicyHi: newProdReplacementHi || newProdReplacement || undefined
    };

    onUpdateProducts([newProd, ...products]);
    setShowAddProductModal(false);
    // Reset Form
    setNewProdName('');
    setNewProdNameHi('');
    setNewProdDesc('');
    setNewProdDescHi('');
    setNewProdWarranty('');
    setNewProdWarrantyHi('');
    setNewProdReplacement('');
    setNewProdReplacementHi('');
  };

  const handleDeleteProduct = (prodId: string) => {
    onUpdateProducts(products.filter(p => p.id !== prodId));
  };

  const handleServiceAreaActivity = (userId: string, actionEn: string, actionHi: string) => {
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    if (!adminUser) return;
    const newAct: UserActivity = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US'),
      action: actionEn,
      actionHi: actionHi
    };
    const updated = users.map(u => {
      if (u.id === adminUser.id) {
        return {
          ...u,
          activities: [newAct, ...(u.activities || [])]
        };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle) return;

    const newNotif: Notification = {
      id: 'n-' + Date.now(),
      title: promoTitle,
      titleHi: promoTitleHi || promoTitle,
      body: promoBody,
      bodyHi: promoBodyHi || promoBody,
      code: promoCode || undefined,
      discountAmount: promoType === 'discount' ? Number(promoDiscount) : undefined,
      type: promoType,
      date: new Date().toISOString().split('T')[0],
      isRead: false
    };

    onAddNotification(newNotif);
    
    // Clear fields
    setPromoTitle('');
    setPromoTitleHi('');
    setPromoBody('');
    setPromoBodyHi('');
    setPromoCode('');
    
    alert(language === 'en' ? 'Broadcast notification pushed to all users successfully!' : 'सभी उपयोगकर्ताओं को प्रसारण सफलतापूर्वक भेजा गया!');
  };

  const handleDeleteReview = (reviewId: string) => {
    onUpdateReviews(reviews.filter(r => r.id !== reviewId));
  };

  const t = {
    en: {
      adminConsole: 'Mart Super-Admin Control Panel',
      overview: 'System Overview',
      stores: 'Manage Stores',
      catalog: 'Global Catalog',
      broadcast: 'Campaigns Broadcaster',
      reviews: 'Reviews Moderation',
      users: 'User Audit Panel',
      support: 'Support Tickets',
      totalRevenue: 'Total Gross Revenue',
      activeStores: 'Partner Outlets',
      registeredItems: 'Catalog SKUs',
      totalOrdersPlaced: 'Processed Orders',
      addStore: 'Register New Store',
      addProduct: 'Register New Product',
      pushedAlerts: 'Active Campaigns',
      sendBroadcastBtn: 'Broadcast Promo Coupon',
      storeName: 'Store Name (English)',
      storeNameHi: 'Store Name (Hindi)',
      address: 'Physical Address',
      categories: 'Categories (comma separated)',
      minOrder: 'Min Order Req.',
      deliveryTime: 'Est. Delivery Time',
      prodName: 'Product Name',
      price: 'Price (₹)',
      stock: 'Stock Qty',
      moderate: 'Review Control',
      noReviews: 'No client reviews in moderation list.',
      coinsSystem: 'Loyalty Coins Audit',
      coinsEarned: 'Total Coins Issued',
      coinsRedeemed: 'Total Coins Redeemed',
      savingImpact: 'Total Promo Savings'
    },
    hi: {
      adminConsole: 'मार्ट सुपर-एडमिन कंट्रोल पैनल',
      overview: 'सिस्टम का अवलोकन',
      stores: 'दुकानें प्रबंधित करें',
      catalog: 'वैश्विक उत्पाद कैटलॉग',
      broadcast: 'प्रचार अभियान प्रसारक',
      reviews: 'समीक्षा मॉडरेशन',
      totalRevenue: 'कुल सकल राजस्व',
      activeStores: 'साझेदार दुकानें',
      registeredItems: 'पंजीकृत उत्पाद (SKUs)',
      totalOrdersPlaced: 'कुल संसाधित आदेश',
      addStore: 'नई दुकान पंजीकृत करें',
      addProduct: 'नया उत्पाद जोड़ें',
      pushedAlerts: 'सक्रिय अभियान और संदेश',
      sendBroadcastBtn: 'प्रचार कूपन प्रसारित करें',
      storeName: 'दुकान का नाम (अंग्रेजी)',
      storeNameHi: 'दुकान का नाम (हिंदी)',
      address: 'दुकान का पता',
      categories: 'श्रेणियां (अल्पविराम से अलग करें)',
      minOrder: 'न्यूनतम आर्डर राशि',
      deliveryTime: 'अनुमानित वितरण समय',
      prodName: 'उत्पाद का नाम',
      price: 'मूल्य (₹)',
      stock: 'स्टॉक मात्रा',
      moderate: 'समीक्षा नियंत्रण',
      users: 'उपयोगकर्ता ऑडिट',
      support: 'सहायता टिकटें',
      noReviews: 'मॉडरेशन सूची में कोई समीक्षा नहीं है।',
      coinsSystem: 'सिक्का वफादारी लेखा परीक्षा',
      coinsEarned: 'जारी किए गए कुल सिक्के',
      coinsRedeemed: 'भुनाए गए कुल सिक्के',
      savingImpact: 'कुल प्रचार बचत'
    }
  }[language];

  const pendingRequestsCount = merchantRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full bg-slate-800/20" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t.adminConsole}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'en' ? 'Maudaha Mart Central Control and Operations Administration Hub' : 'मौदहा मार्ट केंद्रीय नियंत्रण और संचालन प्रशासन केंद्र'}
            </p>
          </div>
        </div>

        {/* Quick Tabs Menu */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {(['overview', 'ai-trends', 'orders', 'merchant-requests', 'stores', 'food-panel', 'fashion-panel', 'service-area', 'catalog', 'broadcast', 'payouts', 'reviews', 'users', 'support'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide border ${
                activeAdminTab === tab 
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {tab === 'orders' ? (language === 'en' ? 'Orders' : 'ऑर्डर') :
               tab === 'ai-trends' ? (language === 'en' ? '📈 AI Trends' : '📈 एआई मांग विश्लेषण') :
               tab === 'service-area' ? (language === 'en' ? '📍 Service Areas' : '📍 सेवा क्षेत्र') :
               tab === 'payouts' ? (language === 'en' ? 'Payouts & Wishlists' : 'भुगतान और पसंदीदा') :
               tab === 'food-panel' ? (language === 'en' ? '🍔 Food Panel' : '🍔 फूड पैनल') :
               tab === 'fashion-panel' ? (language === 'en' ? '👕 Fashion Panel' : '👕 फैशन पैनल') :
               tab === 'merchant-requests' ? (language === 'en' ? `🏪 Merchant Requests ${pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}` : `🏪 मर्चेंट अनुरोध ${pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}`) :
               t[tab]}
            </button>
          ))}

          {/* Active Custom Panels dynamically added */}
          {customPanels.filter(p => p.status === 'active').map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActiveAdminTab(panel.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide border flex items-center gap-1.5 ${
                activeAdminTab === panel.id 
                  ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm' 
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
              }`}
            >
              <LayersIcon className="h-3 w-3" />
              <span>{language === 'hi' ? panel.nameHi : panel.name}</span>
            </button>
          ))}

          {/* Master Control Settings Tab */}
          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide border flex items-center gap-1.5 ${
              activeAdminTab === 'settings' 
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
          >
            <SettingsIcon className="h-3 w-3" />
            <span>{language === 'en' ? '⚙️ Settings' : '⚙️ सेटिंग्स'}</span>
          </button>
        </div>
      </div>

      {/* --- Tab: AI Market Trends & Demands --- */}
      {activeAdminTab === 'ai-trends' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-100 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-400/20">
                  {language === 'en' ? 'LIVE MODEL: GEMINI-3.5-FLASH' : 'लाइव मॉडल: जेमिनी-3.5-फ्लैश'}
                </span>
                <span className="text-xs font-bold text-amber-300">
                  ✨ {language === 'en' ? 'Active Demand Analyst' : 'सक्रिय मांग विश्लेषक'}
                </span>
              </div>
              <h2 className="text-xl font-black font-display tracking-tight mt-1.5">
                {language === 'en' ? '📈 Maudaha Market Demand Intelligence' : '📈 मौदहा बाजार मांग इंटेलिजेंस'}
              </h2>
              <p className="text-xs text-emerald-100/80 max-w-xl mt-1">
                {language === 'en'
                  ? 'Real-time analysis of customer searches, watchlists, and orders to forecast supply shortages and strategic merchant restock needs.'
                  : 'आपूर्ति की कमी और रणनीतिक व्यापारी पुनः स्टॉक आवश्यकताओं का पूर्वानुमान लगाने के लिए ग्राहक खोजों, वॉचलिस्ट और ऑर्डर्स का वास्तविक समय विश्लेषण।'}
              </p>
            </div>

            <button
              onClick={handleLoadTrendReport}
              disabled={trendReportLoading}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
            >
              {trendReportLoading ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin"></div>
                  <span>{language === 'en' ? 'Re-analyzing Catalog...' : 'पुनः विश्लेषण जारी...'}</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>{language === 'en' ? 'Run Intelligence Engine' : 'इंटेलीजेंस इंजन चलाएं'}</span>
                </>
              )}
            </button>
          </div>

          {/* AI Demand Summary Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl"></div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
              <span>🤖</span>
              <span>{language === 'en' ? 'Strategic Market Insight Summary' : 'रणनीतिक बाजार इनसाइट सारांश'}</span>
            </h3>
            {trendReportLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            ) : trendReport ? (
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {trendReport.summary}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {language === 'en' ? 'Click Run Intelligence Engine to synthesize report' : 'रिपोर्ट संश्लेषित करने के लिए इंटेलीजेंस इंजन चलाएं पर क्लिक करें'}
              </p>
            )}
            {trendReport?.offline && (
              <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{language === 'en' ? 'GEMINI_API_KEY is offline. Showing high-fidelity deterministic local forecast.' : 'GEMINI_API_KEY ऑफलाइन है। उच्च-निष्ठा नियतात्मक स्थानीय पूर्वानुमान दिखाया जा रहा है।'}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column A: Demand Forecasts Matrix */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {language === 'en' ? '📊 High-Demand Commodities & Forecasts' : '📊 उच्च मांग वाली सामग्री और पूर्वानुमान'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                    {language === 'en' ? 'Latent search demands vs available stock analysis' : 'अव्यक्त खोज मांग बनाम उपलब्ध स्टॉक विश्लेषण'}
                  </p>
                </div>

                {trendReportLoading ? (
                  <div className="space-y-4 py-6">
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                ) : trendReport ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px]">
                          <th className="py-2.5">{language === 'en' ? 'Category' : 'श्रेणी'}</th>
                          <th className="py-2.5">{language === 'en' ? 'Target Keyword' : 'लक्ष्य कीवर्ड'}</th>
                          <th className="py-2.5 text-right">{language === 'en' ? 'Est. Growth' : 'अनुमानित वृद्धि'}</th>
                          <th className="py-2.5 pl-6">{language === 'en' ? 'Merchant Action Plan' : 'व्यापारी कार्य योजना'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 font-medium text-slate-600">
                        {trendReport.topDemands.map((demand, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition">
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[9px] uppercase tracking-wider">
                                {demand.category}
                              </span>
                            </td>
                            <td className="py-3 font-black text-slate-800">
                              {demand.keyword}
                            </td>
                            <td className="py-3 text-right font-mono font-black text-emerald-600 text-[13px]">
                              +{demand.estimatedGrowth}
                            </td>
                            <td className="py-3 pl-6 text-slate-500 text-[11px]">
                              {demand.actionItem}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-400 italic">
                    {language === 'en' ? 'No forecast loaded' : 'कोई पूर्वानुमान लोड नहीं है'}
                  </div>
                )}
              </div>

              {/* Merchant Strategic Advice List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {language === 'en' ? '🏪 Local Merchant Restocking Advices' : '🏪 स्थानीय व्यापारी रीस्टॉकिंग सलाह'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                    {language === 'en' ? 'Actionable restocking alerts for Galla Mandi, Naya Bazar & partner shops across India' : 'गल्ला मंडी, नया बाजार और अन्य पार्टनर दुकानों के लिए रीस्टॉकिंग अलर्ट'}
                  </p>
                </div>

                {trendReportLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                  </div>
                ) : trendReport ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendReport.restockAdvice.map((advice, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 font-display">
                            🏪 {advice.merchantName}
                          </span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-md uppercase">
                            {language === 'en' ? 'HIGH PRIORITY' : 'उच्च प्राथमिकता'}
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-700">
                          🎯 {advice.suggestedAction}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {advice.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-400 italic">
                    {language === 'en' ? 'No advices loaded' : 'कोई सलाह लोड नहीं है'}
                  </div>
                )}
              </div>
            </div>

            {/* Column B: Real-time Customer Search Logs Volume */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {language === 'en' ? '🔍 Real-time Search Logs' : '🔍 लाइव खोज इतिहास विवरण'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                    {language === 'en' ? 'Raw search keywords volume across Maudaha' : 'मौदहा में कच्ची खोज सामग्री की मात्रा'}
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {users.flatMap(u => (u.searchHistory || []).map(q => q.trim().toLowerCase())).filter(Boolean).length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold italic">
                      {language === 'en' ? 'No searches recorded yet' : 'अभी तक कोई खोज दर्ज नहीं की गई है'}
                    </div>
                  ) : (
                    (() => {
                      // Compute search volume frequency in-situ safely
                      const frequency: { [key: string]: number } = {};
                      users.forEach(u => {
                        (u.searchHistory || []).forEach(q => {
                          const cleaned = q.trim().toLowerCase();
                          if (cleaned) frequency[cleaned] = (frequency[cleaned] || 0) + 1;
                        });
                      });
                      return Object.entries(frequency)
                        .sort((a, b) => b[1] - a[1])
                        .map(([kw, count], idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200/40 hover:bg-emerald-50 hover:border-emerald-200 px-3 py-2 rounded-xl transition">
                            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
                              <span className="text-[9px] bg-slate-200 text-slate-500 font-black h-4 w-4 rounded-full flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span>{kw}</span>
                            </span>
                            <span className="font-mono text-xs font-black text-slate-500 bg-white px-2 py-0.5 border border-slate-100 rounded-lg shadow-2xs">
                              {count} {language === 'en' ? 'Searches' : 'खोजें'}
                            </span>
                          </div>
                        ));
                    })()
                  )}
                </div>
              </div>

              {/* Watchlist Interest Tracker */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {language === 'en' ? '💖 Watchlist Latent Intends' : '💖 वॉचलिस्ट अव्यक्त इरादे'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                    {language === 'en' ? 'Products waiting to be converted to orders' : 'ऑर्डर में परिवर्तित होने की प्रतीक्षा में उत्पाद'}
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {(() => {
                    // Count watchlist occurrences safely
                    const wlCounts: { [prodId: string]: number } = {};
                    users.forEach(u => {
                      (u.watchlist || []).forEach(pId => {
                        wlCounts[pId] = (wlCounts[pId] || 0) + 1;
                      });
                    });

                    const sortedWl = Object.entries(wlCounts)
                      .map(([pId, count]) => {
                        const prod = products.find(p => p.id === pId);
                        return { prod, count };
                      })
                      .filter(item => item.prod)
                      .sort((a, b) => b.count - a.count);

                    if (sortedWl.length === 0) {
                      return (
                        <div className="py-12 text-center text-xs text-slate-400 font-bold italic">
                          {language === 'en' ? 'No items in user watchlists' : 'उपयोगकर्ता की वॉचलिस्ट में कोई सामग्री नहीं है'}
                        </div>
                      );
                    }

                    return sortedWl.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200/40 px-3 py-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-700 truncate max-w-[120px]">
                            {language === 'hi' ? item.prod?.nameHi : item.prod?.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-100 rounded-lg flex items-center gap-1 shrink-0">
                          ♥ {item.count} {language === 'en' ? 'Saves' : 'सहेजें'}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- Tab 1: System Overview Metrics --- */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.totalRevenue}</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-800 font-mono mt-3">₹{totalSales.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-emerald-600 font-bold block mt-2">100% Instant Settlements</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.activeStores}</span>
                <StoreIcon className="h-4 w-4 text-sky-600" />
              </div>
              <p className="text-2xl font-black text-slate-800 font-mono mt-3">{stores.length}</p>
              <span className="text-[10px] text-slate-500 font-bold block mt-2">Active Maudaha Markets</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.registeredItems}</span>
                <Package className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-800 font-mono mt-3">{products.length}</p>
              <span className="text-[10px] text-indigo-600 font-bold block mt-2">Managed Catalog SKUs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.totalOrdersPlaced}</span>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-800 font-mono mt-3">{orders.length}</p>
              <span className="text-[10px] text-slate-500 font-bold block mt-2">Delivered & Processing</span>
            </div>

          </div>

          {/* Area Performance Overview Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <ActivityIcon className="h-4 w-4 text-indigo-500" />
                {selectedChartArea === 'all' 
                  ? (language === 'en' ? 'Area Performance Overview (Sales Volume)' : 'क्षेत्र प्रदर्शन अवलोकन (बिक्री मात्रा)')
                  : (language === 'en' ? `Store Sales Breakdown - ${selectedChartArea}` : `स्टोर बिक्री विवरण - ${selectedChartArea}`)}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {language === 'en' ? 'Filter Area:' : 'क्षेत्र फ़िल्टर करें:'}
                </span>
                <select
                  value={selectedChartArea}
                  onChange={(e) => setSelectedChartArea(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs cursor-pointer focus:border-indigo-500 outline-none hover:bg-slate-100 transition"
                >
                  <option value="all">🌍 {language === 'en' ? 'Global Summary' : 'वैश्विक सारांश'}</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>📍 {area}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, language === 'en' ? 'Sales Volume' : 'बिक्री मात्रा']}
                  />
                  <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Coins System Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                {t.coinsSystem}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[9px] font-bold text-amber-800 uppercase block">{t.coinsEarned}</span>
                  <span className="text-xl font-black font-mono text-slate-800 mt-1 block">{coinsIssued} 🪙</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">{t.coinsRedeemed}</span>
                  <span className="text-xl font-black font-mono text-slate-800 mt-1 block">{coinsRedeemed} 🪙</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-emerald-800 block">{t.savingImpact}</span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">Via coupon discount campaigns</span>
                </div>
                <span className="font-mono font-black text-lg text-emerald-700">₹{totalDiscount}</span>
              </div>
            </div>

            {/* Recent system notification feed logs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Megaphone className="h-4 w-4 text-slate-500" />
                {t.pushedAlerts}
              </h3>
              <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div key={notif.id} className="py-2.5 first:pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{language === 'hi' ? notif.titleHi : notif.title}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">{notif.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{language === 'hi' ? notif.bodyHi : notif.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- Tab 2: Manage Partner Stores --- */}
      {activeAdminTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-slate-800">{language === 'en' ? 'Registered Merchant Outlets' : 'पंजीकृत मर्चेंट आउटलेट्स'}</h2>
            <button
              onClick={() => setShowAddStoreModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.addStore}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((st) => (
              <div key={st.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col md:flex-row">
                <img src={st.banner} alt={st.name} className="h-28 md:h-auto md:w-36 object-cover" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">{language === 'hi' ? st.nameHi : st.name}</h3>
                      <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-bold lowercase">#{st.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{language === 'hi' ? st.addressHi : st.address}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(st.categories || []).map((cat, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-xs text-slate-400">
                    <div className="flex gap-3">
                      <span>Min: <b className="text-slate-700">₹{st.minOrder}</b></span>
                      <span>Del: <b className="text-slate-700">{language === 'hi' ? st.deliveryTimeHi : st.deliveryTime}</b></span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStoreToEdit(st);
                          setEditStoreName(st.name);
                          setEditStoreNameHi(st.nameHi);
                          setEditStoreAddress(st.address);
                          setEditStoreAddressHi(st.addressHi);
                          setEditStoreDeliveryTime(st.deliveryTime);
                          setEditStoreDeliveryTimeHi(st.deliveryTimeHi);
                          setEditStoreMinOrder(st.minOrder);
                          setEditStoreBanner(st.banner);
                          setEditStoreCategories(st.categories?.join(', ') || '');
                          setShowEditStoreModal(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition"
                        title="Edit Store Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStore(st.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition"
                        title="Remove Store"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Store Modal Form */}
          {showAddStoreModal && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-black text-slate-800 text-base">{t.addStore}</h3>
                  <button onClick={() => setShowAddStoreModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAddStore} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.storeName}</label>
                    <input
                      type="text"
                      required
                      value={newStoreName}
                      onChange={e => setNewStoreName(e.target.value)}
                      placeholder="e.g. Verma Provisions"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.address} (English)</label>
                    <input
                      type="text"
                      required
                      value={newStoreAddress}
                      onChange={e => setNewStoreAddress(e.target.value)}
                      placeholder="Station Road, Maudaha or New Delhi, Delhi"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t.minOrder}</label>
                      <input
                        type="number"
                        required
                        value={newStoreMinOrder}
                        onChange={e => setNewStoreMinOrder(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Banner URL</label>
                      <input
                        type="text"
                        value={newStoreBanner}
                        onChange={e => setNewStoreBanner(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.deliveryTime}</label>
                    <input
                      type="text"
                      value={newStoreDeliveryTime}
                      onChange={e => setNewStoreDeliveryTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.categories}</label>
                    <input
                      type="text"
                      value={newStoreCategories}
                      onChange={e => setNewStoreCategories(e.target.value)}
                      placeholder="Groceries, Spices, Flour"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase transition mt-4"
                  >
                    {language === 'en' ? 'Add Store to Network' : 'नेटवर्क में दुकान जोड़ें'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Edit Store Modal Form */}
          {showEditStoreModal && selectedStoreToEdit && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-black text-slate-800 text-base">
                    {language === 'en' ? 'Edit Store Details' : 'दुकान का विवरण संपादित करें'}
                  </h3>
                  <button onClick={() => { setShowEditStoreModal(false); setSelectedStoreToEdit(null); }} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleEditStore} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Store Name</label>
                    <input
                      type="text"
                      required
                      value={editStoreName}
                      onChange={e => setEditStoreName(e.target.value)}
                      placeholder="e.g. Verma Provisions"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.address} (English)</label>
                    <input
                      type="text"
                      required
                      value={editStoreAddress}
                      onChange={e => setEditStoreAddress(e.target.value)}
                      placeholder="Station Road, Maudaha or New Delhi, Delhi"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t.minOrder}</label>
                      <input
                        type="number"
                        required
                        value={editStoreMinOrder}
                        onChange={e => setEditStoreMinOrder(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Banner URL / Image</label>
                      <input
                        type="text"
                        required
                        value={editStoreBanner}
                        onChange={e => setEditStoreBanner(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-[10px] text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.deliveryTime}</label>
                    <input
                      type="text"
                      value={editStoreDeliveryTime}
                      onChange={e => setEditStoreDeliveryTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.categories}</label>
                    <input
                      type="text"
                      value={editStoreCategories}
                      onChange={e => setEditStoreCategories(e.target.value)}
                      placeholder="Groceries, Spices, Flour"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase transition mt-4"
                  >
                    {language === 'en' ? 'Save Store Changes' : 'दुकान के बदलाव सुरक्षित करें'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Tab 3: Global Catalog --- */}
      {activeAdminTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-slate-800">{language === 'en' ? 'Global Food & Grocery Catalog' : 'वैश्विक खाद्य और किराना कैटलॉग'}</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.addProduct}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-wider">
                    <th className="p-4">{t.prodName}</th>
                    <th className="p-4">{language === 'en' ? 'Belongs To Store' : 'संबंधित दुकान'}</th>
                    <th className="p-4">{language === 'en' ? 'Category' : 'श्रेणी'}</th>
                    <th className="p-4">{language === 'en' ? 'MRP (₹)' : 'एमआरपी (₹)'}</th>
                    <th className="p-4">{language === 'en' ? 'Selling Price (₹)' : 'विक्रय मूल्य (₹)'}</th>
                    <th className="p-4">{language === 'en' ? 'MSP (₹)' : 'एमएसपी (₹)'}</th>
                    <th className="p-4">{t.stock}</th>
                    <th className="p-4 text-center">{language === 'en' ? 'Action' : 'कार्रवाई'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {products.map((p) => {
                    const linkedStore = stores.find(st => st.id === p.storeId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded-lg border border-slate-100" />
                          <div>
                            <p className="font-extrabold text-slate-800">{language === 'hi' ? p.nameHi : p.name}</p>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400 block font-mono">{p.unit}</span>
                              {p.warrantyPeriod && (
                                <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  🛡️ {language === 'hi' && p.warrantyPeriodHi ? p.warrantyPeriodHi : p.warrantyPeriod}
                                </span>
                              )}
                              {p.replacementPolicy && (
                                <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  🔄 {language === 'hi' && p.replacementPolicyHi ? p.replacementPolicyHi : p.replacementPolicy}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded-md">
                            {linkedStore ? (language === 'hi' ? linkedStore.nameHi : linkedStore.name) : 'Unknown Store'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px] font-bold">
                          {language === 'hi' ? p.categoryHi : p.category}
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-500">
                          ₹{p.mrp ?? Math.round((p.sellingPrice ?? p.price ?? 0) * 1.25)}
                        </td>
                        <td className="p-4 font-mono font-black text-emerald-600">
                          ₹{p.sellingPrice ?? p.price}
                        </td>
                        <td className="p-4 font-mono">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black border border-blue-100">
                            ₹{p.msp ?? Math.round((p.sellingPrice ?? p.price ?? 0) * 0.85)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedDetailsProduct(p);
                              setEditAdminMrp(p.mrp ?? Math.round((p.sellingPrice ?? p.price ?? 0) * 1.25));
                              setEditAdminSellingPrice(p.sellingPrice ?? p.price ?? 0);
                              setEditAdminMsp(p.msp ?? Math.round((p.sellingPrice ?? p.price ?? 0) * 0.85));
                              setEditAdminName(p.name);
                              setEditAdminNameHi(p.nameHi || '');
                              setEditAdminImage(p.image);
                            }}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition inline-flex items-center gap-1 font-bold mr-2 text-[10px]"
                            title="Edit Price & View Logs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>{language === 'en' ? 'Edit & Logs' : 'एडिट और लॉग्स'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition inline-flex"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Product Modal Form */}
          {showAddProductModal && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-black text-slate-800 text-base">{t.addProduct}</h3>
                  <button onClick={() => setShowAddProductModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t.prodName}</label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={e => setNewProdName(e.target.value)}
                      placeholder="e.g. Pure Desi Ghee"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t.price}</label>
                      <input
                        type="number"
                        required
                        value={newProdPrice}
                        onChange={e => setNewProdPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Unit (e.g. 500 g)</label>
                      <input
                        type="text"
                        required
                        value={newProdUnit}
                        onChange={e => setNewProdUnit(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t.stock}</label>
                      <input
                        type="number"
                        required
                        value={newProdStock}
                        onChange={e => setNewProdStock(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Select Store' : 'दुकान चुनें'}</label>
                      <select
                        value={newProdStoreId}
                        onChange={e => setNewProdStoreId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                      >
                        {stores.map(st => (
                          <option key={st.id} value={st.id}>
                            {language === 'hi' ? st.nameHi : st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Description</label>
                    <textarea
                      value={newProdDesc}
                      onChange={e => setNewProdDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl h-16"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Warranty Period' : 'वारंटी अवधि'} (Optional)</label>
                      <input
                        type="text"
                        value={newProdWarranty}
                        onChange={e => { setNewProdWarranty(e.target.value); setNewProdWarrantyHi(e.target.value); }}
                        placeholder="e.g. 1 Year Warranty"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Replacement Policy' : 'रिप्लेसमेंट नीति'} (Optional)</label>
                      <input
                        type="text"
                        value={newProdReplacement}
                        onChange={e => { setNewProdReplacement(e.target.value); setNewProdReplacementHi(e.target.value); }}
                        placeholder="e.g. 7 Days Replacement"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newProdImage}
                      onChange={e => setNewProdImage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[10px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase transition mt-4"
                  >
                    {language === 'en' ? 'Publish Product globally' : 'उत्पाद को प्रकाशित करें'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Admin Edit Price & View Logs Modal */}
          {selectedDetailsProduct && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <img src={selectedDetailsProduct.image} alt={selectedDetailsProduct.name} className="h-10 w-10 object-cover rounded-lg border border-slate-200" />
                    <div>
                      <h3 className="font-black text-slate-800 text-sm">
                        {language === 'en' ? 'Product Details, Prices & Logs' : 'सामग्री का विवरण, मूल्य और मूल्य बदलाव इतिहास'}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">{language === 'hi' ? selectedDetailsProduct.nameHi : selectedDetailsProduct.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDetailsProduct(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Left Column: Edit Product Details & Prices */}
                  <div className="space-y-4 border-r border-slate-100 pr-6">
                    <div>
                      <h4 className="font-black text-slate-700 uppercase tracking-wider text-[10px] mb-3">{language === 'en' ? 'Product Information' : 'सामग्री की जानकारी'}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">
                            {language === 'en' ? 'Product Name' : 'उत्पाद का नाम'}
                          </label>
                          <input
                            type="text"
                            value={editAdminName}
                            onChange={(e) => setEditAdminName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">
                            {language === 'en' ? 'Product Image URL' : 'उत्पाद की छवि (Image) URL'}
                          </label>
                          <input
                            type="text"
                            value={editAdminImage}
                            onChange={(e) => setEditAdminImage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-[10px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-black text-slate-700 uppercase tracking-wider text-[10px] mb-3">{language === 'en' ? 'Change Prices' : 'मूल्य बदलें'}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">
                            {language === 'en' ? 'MRP (Maximum Retail Price) (₹)' : 'अधिकतम खुदरा मूल्य (MRP) (₹)'}
                          </label>
                          <input
                            type="number"
                            value={editAdminMrp}
                            onChange={(e) => setEditAdminMrp(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-bold mb-1">
                            {language === 'en' ? 'Selling Price (₹)' : 'विक्रय मूल्य / Selling Price (₹)'}
                          </label>
                          <input
                            type="number"
                            value={editAdminSellingPrice}
                            onChange={(e) => setEditAdminSellingPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold font-mono text-emerald-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-bold mb-1">
                            {language === 'en' ? 'MSP (Master Selling Price) (₹)' : 'मास्टर सेलिंग प्राइस (MSP) (₹)'}
                          </label>
                          <input
                            type="number"
                            value={editAdminMsp}
                            onChange={(e) => setEditAdminMsp(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold font-mono text-blue-600 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateProductPricesAndStock) {
                          onUpdateProductPricesAndStock(
                            selectedDetailsProduct.id,
                            {
                              mrp: editAdminMrp,
                              sellingPrice: editAdminSellingPrice,
                              msp: editAdminMsp,
                              price: editAdminSellingPrice,
                              name: editAdminName,
                              nameHi: editAdminNameHi || editAdminName,
                              image: editAdminImage
                            },
                            'admin',
                            'System Admin'
                          );
                        } else {
                          // Fallback local update
                          const updated = products.map(p => {
                            if (p.id === selectedDetailsProduct.id) {
                              return {
                                ...p,
                                price: editAdminSellingPrice,
                                sellingPrice: editAdminSellingPrice,
                                mrp: editAdminMrp,
                                msp: editAdminMsp,
                                name: editAdminName,
                                nameHi: editAdminNameHi || editAdminName,
                                image: editAdminImage
                              };
                            }
                            return p;
                          });
                          onUpdateProducts(updated);
                        }
                        setSelectedDetailsProduct(null);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase transition mt-2 text-center text-xs"
                    >
                      {language === 'en' ? 'Save Product Details & Log' : 'विवरण सुरक्षित करें और लॉग करें'}
                    </button>
                  </div>

                  {/* Right Column: Price Change Logs History */}
                  <div className="space-y-4 flex flex-col max-h-[50vh]">
                    <h4 className="font-black text-slate-700 uppercase tracking-wider text-[10px] flex justify-between items-center">
                      <span>{language === 'en' ? 'Price Change Logs History' : 'मूल्य परिवर्तन लॉग इतिहास'}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {priceLogs.filter(log => log.productId === selectedDetailsProduct.id).length}
                      </span>
                    </h4>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {priceLogs.filter(log => log.productId === selectedDetailsProduct.id).length === 0 ? (
                        <div className="text-center py-8 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          {language === 'en' ? 'No price logs yet for this product.' : 'इस सामग्री के लिए अभी कोई मूल्य परिवर्तन लॉग नहीं हैं।'}
                        </div>
                      ) : (
                        priceLogs
                          .filter(log => log.productId === selectedDetailsProduct.id)
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((log) => (
                            <div key={log.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-2">
                              <div className="flex justify-between items-start">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                  log.userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {log.changedBy} ({log.userRole})
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold font-mono">
                                  {new Date(log.timestamp).toLocaleTimeString()} - {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 font-mono text-[10px] font-bold text-slate-600">
                                <div>
                                  <span className="block text-[8px] text-slate-400 uppercase leading-none mb-0.5">MRP</span>
                                  <span className="text-slate-500 line-through">₹{log.oldMrp}</span>
                                  <span className="text-slate-800 ml-1">→ ₹{log.newMrp}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-slate-400 uppercase leading-none mb-0.5">Selling</span>
                                  <span className="text-slate-500 line-through">₹{log.oldSellingPrice}</span>
                                  <span className="text-emerald-600 ml-1">→ ₹{log.newSellingPrice}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-slate-400 uppercase leading-none mb-0.5">MSP</span>
                                  <span className="text-slate-500 line-through">₹{log.oldMsp}</span>
                                  <span className="text-blue-600 ml-1">→ ₹{log.newMsp}</span>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Tab 4: Push Campaigns Broadcaster --- */}
      {activeAdminTab === 'broadcast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-emerald-600" />
              {t.sendBroadcastBtn}
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 font-bold text-slate-700">
                  <input
                    type="radio"
                    checked={promoType === 'discount'}
                    onChange={() => setPromoType('discount')}
                  />
                  <span>Discount Coupon Campaign</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold text-slate-700">
                  <input
                    type="radio"
                    checked={promoType === 'general'}
                    onChange={() => setPromoType('general')}
                  />
                  <span>General Public Broadcast</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={e => setPromoTitle(e.target.value)}
                  placeholder="e.g. Rakhi Sweet Fest!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Details</label>
                <textarea
                  required
                  value={promoBody}
                  onChange={e => setPromoBody(e.target.value)}
                  placeholder="Claim Rs. 40 off on premium local sweets!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl h-16"
                />
              </div>

              {promoType === 'discount' && (
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-250">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Promo Code (e.g. SWEET40)</label>
                    <input
                      type="text"
                      required={promoType === 'discount'}
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Discount amount (₹)</label>
                    <input
                      type="number"
                      required={promoType === 'discount'}
                      value={promoDiscount}
                      onChange={e => setPromoDiscount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase transition flex items-center justify-center gap-1.5"
              >
                <Megaphone className="h-4 w-4 text-amber-400" />
                <span>{language === 'en' ? 'Publish Campaign Notification' : 'प्रचार संदेश जारी करें'}</span>
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-indigo-600" />
              {language === 'en' ? 'Pushed Broadcast Alerts History' : 'प्रसारित संदेश इतिहास'}
            </h3>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="h-8 w-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold">
                    🔔
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-extrabold text-slate-800">{language === 'hi' ? notif.titleHi : notif.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{language === 'hi' ? notif.bodyHi : notif.body}</p>
                    {notif.code && (
                      <span className="inline-block mt-2 font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold uppercase">
                        Code: {notif.code} (₹{notif.discountAmount} Off)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- Tab 5: Reviews Moderation --- */}
      {activeAdminTab === 'reviews' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-400" />
            {t.moderate}
          </h2>

          {reviews.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-bold">{t.noReviews}</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => {
                const associatedStore = stores.find(st => st.id === r.storeId);
                return (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500/10 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-xs">{r.author}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`h-3 w-3 ${idx < r.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                          {associatedStore ? (language === 'hi' ? associatedStore.nameHi : associatedStore.name) : 'Store'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        "{language === 'hi' && r.commentHi ? r.commentHi : r.comment}"
                      </p>
                      <span className="text-[10px] text-slate-400 block font-mono">{r.date}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 flex items-center gap-1.5 transition self-end sm:self-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Review</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Tab 6: Registered Users Audit & Activities --- */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                {language === 'en' ? 'Maudaha Mart Registered Resident Profiles' : 'मौदहा मार्ट पंजीकृत निवासी प्रोफाइल'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'en' ? 'Audit registered shopper details, search query patterns, and interaction histories.' : 'पंजीकृत खरीदार विवरण, खोज इतिहास पैटर्न और गतिविधि इतिहास की जांच करें।'}
              </p>
            </div>
            <div className="text-xs bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-xl border border-amber-200/60 font-bold self-start sm:self-auto shrink-0">
              👤 {users.length} Registered Shoppers
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side list of users (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              {users.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs font-bold text-slate-400">
                  {language === 'en' ? 'No registered users available.' : 'कोई पंजीकृत उपयोगकर्ता उपलब्ध नहीं है।'}
                </div>
              ) : (
                users.map((usr) => {
                  const getRoleBadge = (role: string) => {
                    switch (role) {
                      case 'admin':
                        return <span className="text-[9px] font-black tracking-wider text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md uppercase">ADMIN</span>;
                      case 'merchant':
                        return <span className="text-[9px] font-black tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase">STORE OWNER</span>;
                      case 'rider':
                        return <span className="text-[9px] font-black tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md uppercase">RIDER</span>;
                      default:
                        return <span className="text-[9px] font-black tracking-wider text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md uppercase">USER</span>;
                    }
                  };

                  return (
                    <div 
                      key={usr.id} 
                      onClick={() => setSelectedUserDetailId(usr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                        selectedUserDetailId === usr.id 
                          ? 'bg-amber-500/10 border-amber-500 shadow-xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-extrabold text-slate-800 text-sm truncate">{usr.name}</p>
                          {getRoleBadge(usr.role || 'customer')}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono font-extrabold">{usr.phone}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold inline-block truncate max-w-full">
                          📍 {language === 'hi' ? usr.locationHi : usr.location}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black block mb-1">
                          {usr.activities.length} Actions
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono font-bold">
                          {usr.searchHistory.length} searches
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right side detailed log (8 cols) */}
            <div className="lg:col-span-8">
              {activeUserDetail ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
                  {/* Selected User Header */}
                  <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-slate-800">{activeUserDetail.name}</h3>
                        {activeUserDetail.role === 'admin' && <span className="text-[10px] font-black tracking-widest text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md">ADMIN</span>}
                        {activeUserDetail.role === 'merchant' && <span className="text-[10px] font-black tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">STORE OWNER</span>}
                        {activeUserDetail.role === 'rider' && <span className="text-[10px] font-black tracking-widest text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">RIDER</span>}
                        {activeUserDetail.role === 'manager' && <span className="text-[10px] font-black tracking-widest text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md">MANAGER</span>}
                        {(activeUserDetail.role === 'customer' || !activeUserDetail.role) && <span className="text-[10px] font-black tracking-widest text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">USER</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-2 font-bold">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md">📞 {activeUserDetail.phone}</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md">📍 {language === 'hi' ? activeUserDetail.locationHi : activeUserDetail.location}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(language === 'en' ? 'Are you sure you want to delete this user profile?' : 'क्या आप वाकई इस उपयोगकर्ता प्रोफ़ाइल को हटाना चाहते हैं?')) {
                          onUpdateUsers(users.filter(u => u.id !== activeUserDetail.id));
                          setSelectedUserDetailId(null);
                        }
                      }}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-150 flex items-center gap-1.5 transition active:scale-[0.98]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{language === 'en' ? 'Delete Profile' : 'प्रोफ़ाइल हटाएं'}</span>
                    </button>
                  </div>

                  {/* Interactive Role Switch Panel */}
                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        {language === 'en' ? 'Manage Shopper Role & Permissions' : 'उपयोगकर्ता की भूमिका और अनुमतियां प्रबंधित करें'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {language === 'en' ? 'Assign rider console, store inventory, or customer panels instantly.' : 'तुरंत राइडर कंसोल, स्टोर इन्वेंट्री या उपयोगकर्ता पैनल आवंटित करें।'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Set Authority:</span>
                      <select
                        value={activeUserDetail.role || 'customer'}
                        onChange={(e) => {
                          const newRole = e.target.value as 'customer' | 'merchant' | 'rider' | 'admin' | 'manager';
                          const updated = users.map(u => {
                            if (u.id === activeUserDetail.id) {
                              const newAct = {
                                id: 'act-' + Date.now(),
                                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US'),
                                action: `Authority level transitioned to "${newRole.toUpperCase()}"`,
                                actionHi: `अधिकार स्तर बदलकर "${newRole.toUpperCase()}" कर दिया गया`
                              };
                              return {
                                ...u,
                                role: newRole,
                                activities: [newAct, ...u.activities]
                              };
                            }
                            return u;
                          });
                          onUpdateUsers(updated);
                        }}
                        className="bg-white border border-slate-200 text-slate-800 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs cursor-pointer focus:border-amber-500 outline-none hover:bg-slate-50 transition"
                      >
                        <option value="customer">🛒 {language === 'en' ? 'User / Shopper' : 'उपयोगकर्ता / खरीदार'}</option>
                        <option value="merchant">🏪 {language === 'en' ? 'Merchant / Store Owner' : 'मर्चेंट / स्टोर मालिक'}</option>
                        <option value="rider">🚴 {language === 'en' ? 'Delivery Boy' : 'डिलीवरी बॉय'}</option>
                        <option value="manager">👔 {language === 'en' ? 'Manager' : 'मैनेजर'}</option>
                        <option value="admin">🛡️ {language === 'en' ? 'Admin' : 'एडमिन'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Manager Area Assignment Panel */}
                  {activeUserDetail.role === 'manager' && (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {language === 'en' ? 'Assign Service Area' : 'सेवा क्षेत्र आवंटित करें'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {language === 'en' ? 'Specify the area this manager is responsible for.' : 'निर्दिष्ट करें कि यह प्रबंधक किस क्षेत्र के लिए ज़िम्मेदार है।'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <input
                          type="text"
                          value={activeUserDetail.assignedArea || ''}
                          onChange={(e) => {
                            const newArea = e.target.value;
                            const updated = users.map(u => u.id === activeUserDetail.id ? { ...u, assignedArea: newArea } : u);
                            onUpdateUsers(updated);
                          }}
                          placeholder={language === 'en' ? 'Enter Area (e.g., Banda)' : 'क्षेत्र दर्ज करें'}
                          className="bg-white border border-slate-200 text-slate-800 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs focus:border-indigo-500 outline-none w-48"
                        />
                      </div>
                    </div>
                  )}



                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Search History */}
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2 uppercase tracking-wide">
                        🔍 {language === 'en' ? 'Search Queries Audit' : 'खोज इतिहास ऑडिट'}
                      </p>
                      {activeUserDetail.searchHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">{language === 'en' ? 'No recent search queries recorded.' : 'कोई हालिया खोज इतिहास दर्ज नहीं है।'}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {activeUserDetail.searchHistory.map((term, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-slate-50 border border-slate-200 hover:border-amber-400 text-slate-700 px-3 py-1.5 rounded-xl font-bold font-mono tracking-wide transition uppercase"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* User Actions / Activities */}
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2 uppercase tracking-wide">
                        ⚡ {language === 'en' ? 'Real-Time Activity Logs' : 'वास्तविक समय गतिविधि लॉग'}
                      </p>
                      {activeUserDetail.activities.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">{language === 'en' ? 'No actions logged for this session.' : 'इस सत्र के लिए कोई गतिविधि दर्ज नहीं की गई है।'}</p>
                      ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                          {activeUserDetail.activities.map((act) => (
                            <div key={act.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 hover:border-amber-500/10 transition">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[9px] font-black tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">SYSTEM LOG</span>
                                <span className="text-[9px] font-mono text-slate-400 font-bold">{act.timestamp}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-700 leading-normal">
                                {language === 'hi' ? act.actionHi : act.action}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-black shadow-xs">
                  👤 {language === 'en' ? 'Select a Maudaha resident from the list to audit activities and searches' : 'गतिविधियों और खोजों को देखने के लिए सूची से किसी निवासी को चुनें'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab: Orders Management Panel --- */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                {language === 'en' ? 'Active Orders' : 'सक्रिय ऑर्डर'}
              </span>
              <p className="text-2xl font-black text-amber-600 font-mono mt-2">
                {orders.filter(o => o.deliveryStatus !== 'arrived').length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                {language === 'en' ? 'Delivered successfully' : 'वितरित ऑर्डर'}
              </span>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-2">
                {orders.filter(o => o.deliveryStatus === 'arrived').length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                {language === 'en' ? 'Digital Payments' : 'डिजिटल भुगतान (UPI)'}
              </span>
              <p className="text-2xl font-black text-blue-600 font-mono mt-2">
                ₹{orders.filter(o => o.paymentMethod === 'UPI').reduce((sum, o) => sum + o.total, 0)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                {language === 'en' ? 'Cash Collected' : 'नकद संग्रह (COD)'}
              </span>
              <p className="text-2xl font-black text-indigo-600 font-mono mt-2">
                ₹{orders.filter(o => o.paymentMethod === 'COD').reduce((sum, o) => sum + o.total, 0)}
              </p>
            </div>
          </div>

          {/* Search and Filters panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search by Order ID, customer name, store...' : 'ऑर्डर आईडी, ग्राहक का नाम, दुकान से खोजें...'}
                  value={adminOrderSearch}
                  onChange={(e) => setAdminOrderSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Delivery status filter */}
              <div className="w-full md:w-48">
                <select
                  value={adminDeliveryFilter}
                  onChange={(e) => setAdminDeliveryFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">{language === 'en' ? 'All Deliveries' : 'सभी डिलीवरी'}</option>
                  <option value="pending">{language === 'en' ? 'Pending (लंबित)' : 'लंबित ऑर्डर'}</option>
                  <option value="processing">{language === 'en' ? 'Processing (तैयारी)' : 'तैयारी चालू है'}</option>
                  <option value="ready_for_pickup">{language === 'en' ? 'Ready for Pickup (पिकअप)' : 'पिकअप हेतु तैयार'}</option>
                  <option value="ready_for_delivery">{language === 'en' ? 'Ready for Delivery (सवार पिक)' : 'वितरण हेतु तैयार'}</option>
                  <option value="out_for_delivery">{language === 'en' ? 'Out for Delivery (रास्ते में)' : 'रास्ते में है'}</option>
                  <option value="arrived">{language === 'en' ? 'Arrived / Delivered (वितरित)' : 'वितरित / पहुंच गया'}</option>
                </select>
              </div>

              {/* Payment status filter */}
              <div className="w-full md:w-48">
                <select
                  value={adminPaymentFilter}
                  onChange={(e) => setAdminPaymentFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">{language === 'en' ? 'All Payments' : 'सभी भुगतान स्थिति'}</option>
                  <option value="pending">{language === 'en' ? 'Pending' : 'लंबित'}</option>
                  <option value="completed">{language === 'en' ? 'Completed' : 'पूर्ण'}</option>
                  <option value="failed">{language === 'en' ? 'Failed' : 'विफल'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders list container */}
          <div className="space-y-4">
            {(() => {
              const filteredOrders = orders.filter((order) => {
                // Search filter
                const searchLower = adminOrderSearch.toLowerCase();
                const matchedId = order.id.toLowerCase().includes(searchLower);
                const matchedStore = order.storeName.toLowerCase().includes(searchLower) || order.storeNameHi.includes(searchLower);
                
                // Find user details for search match
                const matchedUser = users.find(u => u.id === order.userId);
                const matchedUserName = matchedUser ? (matchedUser.name || '').toLowerCase().includes(searchLower) : false;

                const searchMatch = !adminOrderSearch || matchedId || matchedStore || matchedUserName;

                // Delivery filter
                const deliveryMatch = adminDeliveryFilter === 'all' || order.deliveryStatus === adminDeliveryFilter;

                // Payment filter
                const paymentMatch = adminPaymentFilter === 'all' || order.paymentStatus === adminPaymentFilter;

                return searchMatch && deliveryMatch && paymentMatch;
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-black">
                    {language === 'en' ? 'No orders match your selected filters.' : 'चुने गए फिल्टर के अनुसार कोई ऑर्डर नहीं मिला।'}
                  </div>
                );
              }

              return filteredOrders.map((order) => {
                const customer = users.find(u => u.id === order.userId);
                return (
                  <div 
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 relative overflow-hidden hover:border-slate-300 transition"
                  >
                    {/* Top status bar and general info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md font-mono font-bold uppercase">
                            #{order.id}
                          </span>
                          <span className="text-xs text-slate-400 font-bold font-mono">{order.date}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 mt-2">
                          {language === 'hi' ? order.storeNameHi : order.storeName}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 font-bold">
                          👤 {customer ? `${customer.name} (${customer.phone})` : 'Guest User'} - <span className="text-slate-400">{customer ? (language === 'hi' ? customer.locationHi : customer.location) : 'Maudaha'}</span>
                        </div>
                      </div>

                      {/* Controls and quick actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Delivery Status selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">
                            {language === 'en' ? 'Delivery' : 'डिलिवरी'}
                          </span>
                          <select
                            value={order.deliveryStatus}
                            onChange={(e) => {
                              const updated = orders.map(o => o.id === order.id ? { ...o, deliveryStatus: e.target.value as any } : o);
                              onUpdateOrders(updated);
                            }}
                            className="bg-amber-500 text-slate-950 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border border-amber-600 focus:outline-hidden"
                          >
                            <option value="pending">Pending (लंबित)</option>
                            <option value="processing">Processing (तैयारी)</option>
                            <option value="ready_for_pickup">Ready for Pickup (पिकअप तैयार)</option>
                            <option value="ready_for_delivery">Ready for Delivery (सवार पिक)</option>
                            <option value="out_for_delivery">Out for Delivery (रास्ते में)</option>
                            <option value="arrived">Arrived/Delivered (वितरित)</option>
                          </select>
                        </div>

                        {/* Payment Status toggle */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">
                            {language === 'en' ? 'Payment' : 'भुगतान'}
                          </span>
                          <button
                            onClick={() => {
                              const nextStatus = order.paymentStatus === 'completed' ? 'pending' : 'completed';
                              const updated = orders.map(o => o.id === order.id ? { ...o, paymentStatus: nextStatus as any } : o);
                              onUpdateOrders(updated);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition ${
                              order.paymentStatus === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {order.paymentStatus === 'completed' ? 'PAID' : 'PENDING'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Products details expansion */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                      <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        {language === 'en' ? 'Order Invoice Details' : 'ऑर्डर इनवॉइस विवरण'}
                      </div>
                      <div className="space-y-1.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-700">
                            <span>
                              {language === 'hi' ? it.product.nameHi : it.product.name} ({it.product.unit})
                            </span>
                            <span className="font-mono text-slate-500">
                              {it.quantity} × ₹{it.product.price} = ₹{it.quantity * it.product.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary prices and coins info */}
                      <div className="border-t border-slate-150/50 pt-3 flex flex-wrap justify-between items-center text-xs gap-3">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                          <span>Method: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                          {order.upiId && <span>UPI ID: <strong className="text-slate-800 font-mono">{order.upiId}</strong></span>}
                          <span>Coins: <strong className="text-slate-800">+{order.coinsEarned || 0} / -{order.coinsRedeemed || 0}</strong></span>
                        </div>

                        <div className="font-mono font-black text-slate-800">
                          {order.discount > 0 && <span className="text-xs text-red-500 mr-3">Discount: -₹{order.discount}</span>}
                          <span className="text-sm">Total: <strong className="text-emerald-600 text-base">₹{order.total}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Admin GPS & Photo Feed when dispatching */}
                    {(order.photoUrl || (order.riderLat && order.deliveryStatus === 'out_for_delivery')) && (
                      <div className="bg-amber-50/20 border border-amber-500/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {order.photoUrl && (
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <img
                              src={order.photoUrl}
                              alt="Verification proof"
                              className="w-12 h-12 object-cover rounded-lg border border-amber-500/20 shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md uppercase block w-max">
                                {language === 'hi' ? 'सत्यापित' : 'Products Verified'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                                {language === 'hi' ? 'सामान की पुष्टि फोटो' : 'Rider Uploaded Item Photo'}
                              </span>
                            </div>
                          </div>
                        )}

                        {order.riderLat && order.deliveryStatus === 'out_for_delivery' && (
                          <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl flex items-center gap-2.5 text-[10px] font-mono w-full sm:w-auto justify-between sm:justify-start border border-slate-950">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-emerald-400 font-black">Rider GPS Live:</span>
                            </div>
                            <span className="font-extrabold text-slate-300">Lat: {order.riderLat.toFixed(4)}, Lng: {order.riderLng?.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* --- Tab 7: Support Tickets Console --- */}
      {activeAdminTab === 'support' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left panel: Ticket list (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-100 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800">
                  {language === 'en' ? 'User Support Tickets' : 'उपयोगकर्ता सहायता कूपन/टिकटें'}
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-800 font-extrabold px-2 py-0.5 rounded-full font-mono">
                  {supportTickets.filter(t => t.status === 'open').length} {language === 'en' ? 'OPEN' : 'सक्रिय'}
                </span>
              </div>

              {/* Filters */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['all', 'open', 'resolved'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTicketStatusFilter(filter)}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition ${
                      ticketStatusFilter === filter
                        ? 'bg-white text-slate-950 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filter === 'all' && (language === 'en' ? 'ALL' : 'सभी')}
                    {filter === 'open' && (language === 'en' ? 'OPEN' : 'सक्रिय')}
                    {filter === 'resolved' && (language === 'en' ? 'RESOLVED' : 'हल')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[450px]">
              {supportTickets.filter(t => {
                if (ticketStatusFilter === 'open') return t.status === 'open';
                if (ticketStatusFilter === 'resolved') return t.status === 'resolved';
                return true;
              }).length === 0 ? (
                <p className="text-center text-slate-400 text-xs italic py-12">
                  {language === 'en' ? 'No tickets match this filter.' : 'इस फ़िल्टर से मेल खाने वाले कोई टिकट नहीं हैं।'}
                </p>
              ) : (
                supportTickets
                  .filter(t => {
                    if (ticketStatusFilter === 'open') return t.status === 'open';
                    if (ticketStatusFilter === 'resolved') return t.status === 'resolved';
                    return true;
                  })
                  .map((ticket) => {
                    const isSelected = selectedAdminTicketId === ticket.id;
                    const latestMsg = ticket.messages[ticket.messages.length - 1];

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedAdminTicketId(ticket.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold truncate max-w-[110px]">
                            {ticket.category}
                          </span>
                          <span className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-full uppercase ${
                            ticket.status === 'open'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {ticket.status === 'open' ? 'OPEN' : 'RESOLVED'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-xs mt-2 line-clamp-1">
                          {ticket.subject}
                        </h4>

                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                          👤 {ticket.userName} ({ticket.userPhone})
                        </p>

                        {latestMsg && (
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-1 border-t border-slate-50 pt-1.5">
                            <strong className="text-slate-600">
                              {latestMsg.sender === 'admin' ? 'Admin' : 'User'}:
                            </strong>{' '}
                            {latestMsg.text}
                          </p>
                        )}

                        <div className="mt-2 flex justify-between items-center text-[9px] text-slate-400 font-mono font-bold">
                          <span>#{ticket.id.toUpperCase()}</span>
                          <span>{ticket.createdAt}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Right panel: Chat dialogue (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-full bg-slate-50/10">
            {selectedAdminTicketId && supportTickets.find(t => t.id === selectedAdminTicketId) ? (
              (() => {
                const ticket = supportTickets.find(t => t.id === selectedAdminTicketId)!;

                return (
                  <div className="flex flex-col h-full flex-1">
                    {/* Header with status controls */}
                    <div className="p-4 sm:p-5 border-b border-slate-150 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                            ID: #{ticket.id.toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                            ticket.status === 'open'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ticket.status === 'open' ? '● OPEN' : '✓ RESOLVED'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-800 mt-2">{ticket.subject}</h3>
                        <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                          Query Raised By: <strong className="text-slate-700">{ticket.userName}</strong> ({ticket.userPhone})
                        </p>
                      </div>

                      {/* Status toggle actions */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                        {ticket.status === 'open' ? (
                          <button
                            type="button"
                            onClick={() => onToggleTicketStatus(ticket.id, 'resolved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[10px] font-black rounded-lg transition uppercase tracking-wider shadow-xs"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleTicketStatus(ticket.id, 'open')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 text-[10px] font-black rounded-lg transition uppercase tracking-wider shadow-xs"
                          >
                            Re-Open Ticket
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[350px]">
                      {ticket.messages.map((msg) => {
                        const isAdmin = msg.sender === 'admin';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-slate-500">
                                {isAdmin ? `🛡️ Admin (You)` : `${msg.senderName} (${language === 'en' ? 'User' : 'उपयोगकर्ता'})`}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono font-medium">
                                {msg.timestamp}
                              </span>
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed shadow-xs ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 rounded-tr-none font-bold'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply input */}
                    <div className="p-4 border-t border-slate-150 bg-white shrink-0">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!adminReplyText.trim()) return;
                          onAdminReplySupportTicket(ticket.id, adminReplyText.trim());
                          setAdminReplyText('');
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          required
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Type response back to Maudaha shopper..."
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl text-xs font-bold outline-none transition"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition uppercase tracking-wider font-mono shadow-xs"
                        >
                          Send Response
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                <Megaphone className="h-10 w-10 text-slate-300 stroke-[1.5] mb-3" />
                <p className="text-slate-800 text-xs font-black uppercase tracking-wider">
                  Select A Support Ticket
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-medium">
                  Review open queries regarding cancellation refunds, deliveries near Chauraha, or general app feedback. Only Maudaha Admins can respond.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- Tab: Service Area Management --- */}
      {activeAdminTab === 'service-area' && (
        <ServiceAreaManagement
          language={language}
          orders={orders}
          onAddActivity={handleServiceAreaActivity}
        />
      )}

      {/* --- Tab: Food Panel --- */}
      {activeAdminTab === 'food-panel' && (
        <AdminFoodPanel
          restaurants={restaurants}
          onUpdateRestaurants={onUpdateRestaurants}
          language={language}
        />
      )}

      {/* --- Tab: Fashion Panel --- */}
      {activeAdminTab === 'fashion-panel' && (
        <AdminFashionPanel
          boutiques={boutiques}
          onUpdateBoutiques={onUpdateBoutiques}
          language={language}
        />
      )}

      {/* --- Tab: Merchant Onboarding Requests --- */}
      {activeAdminTab === 'merchant-requests' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-slate-800/20" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black">
                <StoreIcon className="h-5 w-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">
                  {language === 'en' ? 'Merchant Partner Self-Onboarding Hub' : 'मर्चेंट पार्टनर स्व-ऑनबोर्डिंग हब'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'en' 
                    ? 'Review and verify requests from local Maudaha residents who want to open digital storefronts.'
                    : 'स्थानीय मौदहा निवासियों के अनुरोधों की समीक्षा करें जो डिजिटल स्टोर खोलना चाहते हैं।'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                {language === 'en' ? `Pending Requests (${merchantRequests.filter(r => r.status === 'pending').length})` : `लंबित अनुरोध (${merchantRequests.filter(r => r.status === 'pending').length})`}
              </span>
            </div>

            {merchantRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs italic space-y-2">
                <p>{language === 'en' ? 'No merchant requests found.' : 'कोई मर्चेंट अनुरोध नहीं मिला।'}</p>
                <p className="text-[10px] text-slate-300">
                  {language === 'en' ? 'Users can apply to be a merchant from their Resident Account profile drawer.' : 'उपयोगकर्ता अपने निवासी खाता प्रोफ़ाइल दराज से मर्चेंट बनने के लिए आवेदन कर सकते हैं।'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {merchantRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                          {req.businessType === 'grocery' ? '🏪 Grocery' :
                           req.businessType === 'restaurant' ? '🍔 Restaurant' : '👕 Boutique'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono ml-auto md:ml-0">
                          📅 {req.date}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                          {req.businessName} <span className="text-slate-400">({req.businessNameHi})</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1">
                          📍 {req.businessAddress} <span className="text-slate-400">({req.businessAddressHi})</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-bold">
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px] uppercase font-mono">Applicant Name</span>
                          <span className="text-slate-700">{req.userName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px] uppercase font-mono">Phone Number</span>
                          <span className="text-slate-700 font-mono">{req.userPhone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px] uppercase font-mono">Settlement UPI ID</span>
                          <span className="text-slate-700 font-mono text-emerald-600">{req.upiId}</span>
                        </div>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <button
                          onClick={() => {
                            // Reject Request
                            const updatedRequests = merchantRequests.map(r => r.id === req.id ? { ...r, status: 'rejected' as const } : r);
                            if (onUpdateMerchantRequests) onUpdateMerchantRequests(updatedRequests);

                            // Update user status
                            const updatedUsers = users.map(u => {
                              if (u.id === req.userId) {
                                return { ...u, merchantRequestStatus: 'rejected' as const };
                              }
                              return u;
                            });
                            onUpdateUsers(updatedUsers);

                            // Add Notification
                            onAddNotification({
                              id: 'notif-' + Date.now(),
                              title: 'Merchant Application Status',
                              titleHi: 'मर्चेंट आवेदन की स्थिति',
                              body: `Your application for "${req.businessName}" was rejected. Please review details and apply again.`,
                              bodyHi: `आपका "${req.businessName}" के लिए मर्चेंट आवेदन अस्वीकार कर दिया गया। कृपया जानकारी की समीक्षा करें और फिर से आवेदन करें।`,
                              type: 'general' as const,
                              date: new Date().toLocaleDateString('en-IN'),
                              isRead: false
                            });

                            alert('Merchant onboarding application rejected.');
                          }}
                          className="flex-1 md:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 text-xs font-extrabold rounded-xl transition border border-rose-200 cursor-pointer text-center"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            // Approve Request
                            const updatedRequests = merchantRequests.map(r => r.id === req.id ? { ...r, status: 'approved' as const } : r);
                            if (onUpdateMerchantRequests) onUpdateMerchantRequests(updatedRequests);

                            // Update user role & request status
                            const updatedUsers = users.map(u => {
                              if (u.id === req.userId) {
                                return { 
                                  ...u, 
                                  role: 'merchant' as const, 
                                  merchantRequestStatus: 'approved' as const 
                                };
                              }
                              return u;
                            });
                            onUpdateUsers(updatedUsers);

                            // Add appropriate store
                            if (req.businessType === 'grocery') {
                              const newStore: Store = {
                                id: `store-merchant-${req.userId}`,
                                name: req.businessName,
                                nameHi: req.businessNameHi,
                                address: req.businessAddress,
                                addressHi: req.businessAddressHi,
                                area: 'Maudaha Central',
                                rating: 4.5,
                                reviewCount: 1,
                                banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60',
                                deliveryTime: '25-40 mins',
                                deliveryTimeHi: '25-40 मिनट',
                                minOrder: 100,
                                upiId: req.upiId,
                                categories: ['Groceries', 'Fruits', 'Vegetables']
                              };
                              onUpdateStores([newStore, ...stores]);
                            } else if (req.businessType === 'restaurant') {
                              const newRestaurant: Restaurant = {
                                id: `rest-merchant-${req.userId}`,
                                name: req.businessName,
                                nameHi: req.businessNameHi,
                                address: req.businessAddress,
                                addressHi: req.businessAddressHi,
                                area: 'Maudaha Central',
                                rating: 4.5,
                                deliveryTime: '30-45 mins',
                                deliveryTimeHi: '30-45 मिनट',
                                minOrder: 100,
                                upiId: req.upiId,
                                cuisine: 'North Indian, Fast Food',
                                cuisineHi: 'उत्तर भारतीय, फास्ट फूड',
                                banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60',
                                menu: []
                              };
                              onUpdateRestaurants([newRestaurant, ...restaurants]);
                            } else if (req.businessType === 'boutique') {
                              const newBoutique: ClothingBoutique = {
                                id: `boutique-merchant-${req.userId}`,
                                name: req.businessName,
                                nameHi: req.businessNameHi,
                                address: req.businessAddress,
                                addressHi: req.businessAddressHi,
                                area: 'Maudaha Central',
                                rating: 4.5,
                                deliveryTime: '1-2 days',
                                deliveryTimeHi: '1-2 दिन',
                                minOrder: 200,
                                upiId: req.upiId,
                                specialty: 'Ethnic Wear, Custom Stitching',
                                specialtyHi: 'पारंपरिक पोशाक, कस्टम सिलाई',
                                banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=60',
                                items: [],
                                shopType: 'boutique'
                              };
                              onUpdateBoutiques([newBoutique, ...boutiques]);
                            }

                            // Add Notification
                            onAddNotification({
                              id: 'notif-' + Date.now(),
                              title: '🎉 Welcome Partner Store!',
                              titleHi: '🎉 आपका स्वागत है पार्टनर स्टोर!',
                              body: `Your partner application for "${req.businessName}" has been APPROVED. You can now access your merchant portal dashboard and manage catalog.`,
                              bodyHi: `"${req.businessName}" के लिए आपका पार्टनर आवेदन स्वीकार कर लिया गया है। अब आप मर्चेंट पोर्टल तक पहुंच सकते हैं और कैटलॉग प्रबंधित कर सकते हैं।`,
                              type: 'general' as const,
                              date: new Date().toLocaleDateString('en-IN'),
                              isRead: false
                            });

                            alert(`Merchant onboarding approved successfully! A new ${req.businessType} storefront has been provisioned.`);
                          }}
                          className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-emerald-600/10 cursor-pointer text-center"
                        >
                          Approve Onboarding
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Tab: Payouts & Wishlists Manager --- */}
      {activeAdminTab === 'payouts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Payout requests (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">
                      {language === 'en' ? 'Seller Payout Verification' : 'विक्रेता भुगतान सत्यापन'}
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      {language === 'en' ? 'Review and approve bank UPI payout requests from local merchants.' : 'स्थानीय व्यापारियों से बैंक यूपीआई भुगतान अनुरोधों की समीक्षा और अनुमोदन करें।'}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-xl font-mono">
                    {payoutRequests.filter(r => r.status === 'pending').length} {language === 'en' ? 'Pending' : 'लंबित'}
                  </span>
                </div>

                {payoutRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs italic">
                    {language === 'en' ? 'No payout requests exist in the system.' : 'सिस्टम में कोई भुगतान अनुरोध मौजूद नहीं है।'}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {payoutRequests.slice().reverse().map(req => {
                      const reqStore = stores.find(s => s.id === req.sellerId);
                      return (
                        <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 text-sm">₹{req.amount}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                                req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                req.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {req.status === 'approved' && (language === 'hi' ? 'स्वीकृत' : 'Approved')}
                                {req.status === 'rejected' && (language === 'hi' ? 'अस्वीकृत' : 'Rejected')}
                                {req.status === 'pending' && (language === 'hi' ? 'लंबित' : 'Pending')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-bold">
                              {req.sellerName} <span className="text-[10px] text-slate-400 font-normal">({reqStore ? (language === 'hi' ? reqStore.addressHi : reqStore.address) : 'Maudaha'})</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              📅 {req.date} • 💳 UPI ID: <span className="font-semibold text-slate-600 select-all">{req.upiId}</span>
                            </p>
                          </div>

                          {req.status === 'pending' && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  const updated = payoutRequests.map(r => r.id === req.id ? { ...r, status: 'approved' as const } : r);
                                  onUpdatePayoutRequests(updated);

                                  // Broadcast in-app notification to merchant
                                  const notifId = 'notif-' + Date.now();
                                  const newNotif: Notification = {
                                    id: notifId,
                                    title: 'Payout Request Approved! 💰',
                                    titleHi: 'भुगतान अनुरोध स्वीकृत! 💰',
                                    body: `Your payout of ₹${req.amount} has been successfully verified and sent to your UPI ${req.upiId}.`,
                                    bodyHi: `आपका ₹${req.amount} का भुगतान सफलतापूर्वक सत्यापित कर लिया गया है और आपके यूपीआई ${req.upiId} पर भेज दिया गया है।`,
                                    type: 'general',
                                    date: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                    isRead: false
                                  };
                                  onAddNotification(newNotif);
                                  alert(language === 'en' ? 'Payout request approved and verified successfully!' : 'भुगतान अनुरोध स्वीकृत और सफलतापूर्वक सत्यापित!');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                              >
                                ✓ {language === 'en' ? 'Approve & Pay' : 'स्वीकार करें'}
                              </button>
                              <button
                                onClick={() => {
                                  const updated = payoutRequests.map(r => r.id === req.id ? { ...r, status: 'rejected' as const } : r);
                                  onUpdatePayoutRequests(updated);

                                  // Broadcast notification
                                  const notifId = 'notif-' + Date.now();
                                  const newNotif: Notification = {
                                    id: notifId,
                                    title: 'Payout Request Rejected ⚠️',
                                    titleHi: 'भुगतान अनुरोध अस्वीकृत ⚠️',
                                    body: `Your payout request of ₹${req.amount} was rejected. Please verify your UPI ID and try again.`,
                                    bodyHi: `आपका ₹${req.amount} का भुगतान अनुरोध अस्वीकृत कर दिया गया था। कृपया अपनी यूपीआई आईडी सत्यापित करें और पुनः प्रयास करें।`,
                                    type: 'general',
                                    date: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                    isRead: false
                                  };
                                  onAddNotification(newNotif);
                                  alert(language === 'en' ? 'Payout request rejected.' : 'भुगतान अनुरोध अस्वीकृत।');
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                              >
                                {language === 'en' ? 'Reject' : 'अस्वीकार करें'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Wishlist & Cart Audit Panel (Right 5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>❤️</span>
                    {language === 'en' ? 'User Wishlist & Cart Audit' : 'उपयोगकर्ता विशलिस्ट और कार्ट ऑडिट'}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {language === 'en' ? 'Real-time auditing of item selections, saving trends, and shopping carts.' : 'वस्तु चयन, बचत प्रवृत्तियों और शॉपिंग कार्ट का वास्तविक समय लेखा परीक्षा।'}
                  </p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                  {users.map(u => {
                    const userWatchlist = u.watchlist || [];
                    const userCart = u.cart || {};

                    const starredProducts = products.filter(p => userWatchlist.includes(p.id));
                    
                    // Count total cart items
                    let cartItemsCount = 0;
                    Object.values(userCart).forEach(items => {
                      items.forEach(it => {
                        cartItemsCount += it.quantity;
                      });
                    });

                    if (userWatchlist.length === 0 && cartItemsCount === 0) {
                      return null;
                    }

                    return (
                      <div key={u.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                          <span className="font-extrabold text-slate-800">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">{u.role}</span>
                        </div>
                        {starredProducts.length > 0 && (
                          <div>
                            <span className="font-extrabold text-amber-700 text-[10px] block mb-1">⭐ {language === 'en' ? 'Watchlist' : 'वॉचलिस्ट'}:</span>
                            <div className="flex flex-wrap gap-1">
                              {starredProducts.map(p => (
                                <span key={`${u.id}-${p.id}`} className="bg-amber-50 text-amber-800 border border-amber-150 rounded px-1.5 py-0.5 text-[9px] font-bold">
                                  {language === 'hi' ? p.nameHi : p.name} (₹{p.price})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {cartItemsCount > 0 && (
                          <div>
                            <span className="font-extrabold text-emerald-700 text-[10px] block mb-1">🛒 {language === 'en' ? 'Active Cart' : 'सक्रिय कार्ट'}:</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(userCart).flatMap(([storeId, items]) => {
                                const store = stores.find(s => s.id === storeId);
                                return items.map(it => (
                                  <span key={`${u.id}-${storeId}-${it.product.id}`} className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded px-1.5 py-0.5 text-[9px] font-bold">
                                    {language === 'hi' ? it.product.nameHi : it.product.name} x{it.quantity} [{store ? (language === 'hi' ? store.nameHi : store.name) : 'Store'}]
                                  </span>
                                ));
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {users.every(u => (u.watchlist || []).length === 0 && Object.values(u.cart || {}).every(items => items.length === 0)) && (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      {language === 'en' ? 'No users have starred or added items to cart yet.' : 'किसी भी उपयोगकर्ता ने अभी तक कोई सामग्री पसंदीदा या कार्ट में नहीं जोड़ी है।'}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- Dynamic Custom Panel View --- */}
      {(() => {
        const matchingPanel = customPanels.find(p => p.id === activeAdminTab);
        if (matchingPanel && matchingPanel.status === 'active') {
          return (
            <div className="space-y-6">
              
              {/* Panel Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <LayersIcon className="h-4 w-4" />
                    </span>
                    <h2 className="text-base font-extrabold text-slate-800">
                      {language === 'hi' ? matchingPanel.nameHi : matchingPanel.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'hi' ? matchingPanel.descriptionHi : matchingPanel.description}
                  </p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 font-mono rounded-full self-start sm:self-auto">
                  CREATED: {matchingPanel.dateCreated}
                </span>
              </div>

              {/* Metrics Grid */}
              {matchingPanel.metrics && matchingPanel.metrics.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {matchingPanel.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {language === 'hi' ? metric.labelHi : metric.label}
                        </span>
                        {metric.icon === 'zap' && <CpuIcon className="h-4 w-4 text-amber-500" />}
                        {metric.icon === 'users' && <Users className="h-4 w-4 text-sky-500" />}
                        {metric.icon === 'dollar' && <DollarSign className="h-4 w-4 text-emerald-500" />}
                        {metric.icon === 'star' && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />}
                        {metric.icon === 'box' && <Package className="h-4 w-4 text-indigo-500" />}
                        {!['zap', 'users', 'dollar', 'star', 'box'].includes(metric.icon) && <ActivityIcon className="h-4 w-4 text-slate-500" />}
                      </div>
                      <p className="text-2xl font-black text-slate-800 mt-3 font-mono">
                        {metric.value}
                      </p>
                      <span className="text-[9px] text-emerald-600 font-bold mt-1">
                        ● Live Admin Synced
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rich Narrative / Log Content */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2.5">
                  {language === 'en' ? 'Generated Intelligence & Report Narrative' : 'उत्पन्न रिपोर्ट और डेटा विवरण'}
                </h3>
                <div className="prose max-w-none text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap">
                  {language === 'hi' ? matchingPanel.richContentHi : matchingPanel.richContent}
                </div>
              </div>

            </div>
          );
        }
        return null;
      })()}

      {/* --- Tab 9: Settings & Custom Panels Builder --- */}
      {activeAdminTab === 'settings' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Settings Form (Columns 1 & 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Component Control Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CpuIcon className="h-5 w-5 text-amber-500" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {language === 'en' ? 'Manage System Components' : 'सिस्टम घटकों को प्रबंधित करें'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'en' ? 'Turn on/off specific modules or portals of Maudaha Mart in real-time.' : 'वास्तविक समय में मौदहा मार्ट के विशिष्ट मॉड्यूल या पोर्टल्स को चालू/बंद करें।'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Storefront */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">🛒 {language === 'en' ? 'Customer Storefront' : 'ग्राहक स्टोरफ्रंट'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'User shopping front-end' : 'उपयोगकर्ता शॉपिंग फ्रंट-एंड'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableCustomerPortal} 
                        onChange={e => onUpdateSettings({ ...settings, enableCustomerPortal: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Merchant Console */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">🏪 {language === 'en' ? 'Merchant Console' : 'मर्चेंट कंसोल'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'Outlets inventory & order manager' : 'दुकानदारों की इन्वेंट्री और ऑर्डर प्रबंधक'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableMerchantDashboard} 
                        onChange={e => onUpdateSettings({ ...settings, enableMerchantDashboard: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Rider Portal */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">🚴 {language === 'en' ? 'Rider Delivery Desk' : 'राइडर डिलीवरी डेस्क'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'Rider tracking & status manager' : 'राइडर ट्रैकिंग और स्थिति प्रबंधक'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableRiderPortal} 
                        onChange={e => onUpdateSettings({ ...settings, enableRiderPortal: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Help Support Panel */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">🙋 {language === 'en' ? 'Support Panel' : 'सहायता पैनल'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'User ticket submissions' : 'उपयोगकर्ता टिकट सबमिशन'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableSupportPanel} 
                        onChange={e => onUpdateSettings({ ...settings, enableSupportPanel: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* UPI Payments */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">💳 {language === 'en' ? 'UPI QR Codes Payments' : 'UPI क्यूआर कोड भुगतान'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'Instant secure QR checks' : 'तत्काल सुरक्षित क्यूआर भुगतान'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableUpiPayment ?? true} 
                        onChange={e => onUpdateSettings({ ...settings, enableUpiPayment: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* UPI Shops Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition ml-4">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">🛒 {language === 'en' ? 'UPI for Shops' : 'दुकानों के लिए UPI'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableUpiPaymentShops ?? true} 
                        onChange={e => onUpdateSettings({ ...settings, enableUpiPaymentShops: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* UPI Restaurants Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition ml-4">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">🍔 {language === 'en' ? 'UPI for Restaurants' : 'रेस्तरां के लिए UPI'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableUpiPaymentRestaurants ?? true} 
                        onChange={e => onUpdateSettings({ ...settings, enableUpiPaymentRestaurants: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* UPI Fashion Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition ml-4">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">👗 {language === 'en' ? 'UPI for Fashion' : 'फैशन के लिए UPI'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableUpiPaymentFashion ?? true} 
                        onChange={e => onUpdateSettings({ ...settings, enableUpiPaymentFashion: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Live Route Tracker */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">📍 {language === 'en' ? 'Live GPS Route Tracking' : 'लाइव जीपीएस रूट ट्रैकिंग'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'Simulate route progress maps' : 'नक्शे पर डिलीवरी सिमुलेशन'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableLiveRouteTracker} 
                        onChange={e => onUpdateSettings({ ...settings, enableLiveRouteTracker: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Financial and Simulation Parameters */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CoinsIcon className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {language === 'en' ? 'System Variables & Parameters' : 'सिस्टम वैरिएबल और पैरामीटर'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'en' ? 'Configure checkout logic, fees, rewards, and simulation controls.' : 'चेकआउट लॉजिक, फीस, रिवार्ड्स और सिमुलेशन कंट्रोल को कॉन्फ़िगर करें।'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Flat Delivery Charge (₹)' : 'फ्लैट डिलीवरी शुल्क (₹)'}</label>
                    <input 
                      type="number"
                      value={settings.deliveryCharge}
                      onChange={e => onUpdateSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Min Order for Free Delivery (₹)' : 'फ्री डिलीवरी के लिए न्यूनतम ऑर्डर (₹)'}</label>
                    <input 
                      type="number"
                      value={settings.minCheckoutAmount}
                      onChange={e => onUpdateSettings({ ...settings, minCheckoutAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Welcome Loyalty Points (🪙)' : 'स्वागत वफादारी सिक्के (🪙)'}</label>
                    <input 
                      type="number"
                      value={settings.welcomeLoyaltyPoints}
                      onChange={e => onUpdateSettings({ ...settings, welcomeLoyaltyPoints: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{language === 'en' ? 'Loyalty Coin Value (e.g. 1 coin = ₹ X)' : 'सिक्का मूल्य (जैसे 1 सिक्का = ₹ X)'}</label>
                    <input 
                      type="number"
                      value={settings.coinToRupeeRate}
                      onChange={e => onUpdateSettings({ ...settings, coinToRupeeRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-mono font-bold bg-slate-50"
                    />
                  </div>
                </div>

                {/* Simulated delivery toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={settings.manualRiderSimulation}
                      onChange={e => onUpdateSettings({ ...settings, manualRiderSimulation: e.target.checked })}
                      className="h-4 w-4 text-emerald-600 border-slate-300 rounded"
                    />
                    <span>{language === 'en' ? 'Enable Real-time Automatic Rider Progress Simulation' : 'वास्तविक समय स्वचालित राइडर प्रगति सिमुलेशन सक्षम करें'}</span>
                  </label>
                </div>
              </div>

              {/* Card 3: Global Announcement Alert */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Megaphone className="h-5 w-5 text-sky-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {language === 'en' ? 'Global App Announcement Banner' : 'ग्लोबल ऐप घोषणा बैनर'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'en' ? 'Show a persistent promo campaign alert to all shoppers at the top of their portal.' : 'सभी खरीदारों को उनके पोर्टल के शीर्ष पर एक स्थायी प्रचार अलर्ट दिखाएं।'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Banner Alert Text</label>
                    <input 
                      type="text"
                      value={settings.globalPromoBannerText}
                      onChange={e => onUpdateSettings({ ...settings, globalPromoBannerText: e.target.value, globalPromoBannerTextHi: settings.globalPromoBannerTextHi || e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 outline-none bg-slate-50 font-bold"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right side: Custom Panels Creator (Column 3) */}
            <div className="space-y-6 font-semibold">
              
              {/* Dynamic Panel Creation Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <WrenchIcon className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {language === 'en' ? 'Custom Panels Generator' : 'कस्टम पैनल जनरेटर'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'en' ? 'Design and spawn new operational hubs dynamically.' : 'गतिशील रूप से नए परिचालन हब डिजाइन और स्पॉन करें।'}
                    </p>
                  </div>
                </div>

                <form 
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newPanelName) {
                      alert(language === 'en' ? 'Please fill in the Panel Name' : 'कृपया पैनल का नाम भरें');
                      return;
                    }
                    const panelId = 'custom-' + newPanelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    
                    // Construct metrics list
                    const metricsList: CustomPanelMetric[] = [];
                    if (newMetric1Label && newMetric1Value) {
                      metricsList.push({
                        label: newMetric1Label,
                        labelHi: newMetric1LabelHi || newMetric1Label,
                        value: newMetric1Value,
                        icon: newMetric1Icon
                      });
                    }
                    if (newMetric2Label && newMetric2Value) {
                      metricsList.push({
                        label: newMetric2Label,
                        labelHi: newMetric2LabelHi || newMetric2Label,
                        value: newMetric2Value,
                        icon: newMetric2Icon
                      });
                    }

                    const newPanelObj: CustomPanel = {
                      id: panelId,
                      name: newPanelName,
                      nameHi: newPanelNameHi || newPanelName,
                      icon: newPanelIcon,
                      description: newPanelDescription || 'Live dynamic panel operational area',
                      descriptionHi: newPanelDescriptionHi || newPanelDescription || 'लाइव गतिशील पैनल परिचालन क्षेत्र',
                      metrics: metricsList,
                      richContent: newPanelRichContent || 'Default generated panel workspace logs.',
                      richContentHi: newPanelRichContentHi || newPanelRichContent || 'डिफ़ॉल्ट जेनरेट किया गया पैनल वर्कस्पेस लॉग।',
                      dateCreated: new Date().toISOString().split('T')[0],
                      status: 'active'
                    };

                    onUpdateCustomPanels([...customPanels, newPanelObj]);
                    
                    // Reset Form
                    setNewPanelName('');
                    setNewPanelNameHi('');
                    setNewPanelDescription('');
                    setNewPanelDescriptionHi('');
                    setNewPanelRichContent('');
                    setNewPanelRichContentHi('');
                    setNewMetric1Label('');
                    setNewMetric1LabelHi('');
                    setNewMetric1Value('');
                    setNewMetric2Label('');
                    setNewMetric2LabelHi('');
                    setNewMetric2Value('');

                    alert(language === 'en' ? `Custom Panel "${newPanelName}" generated and added as a tab successfully!` : `कस्टम पैनल "${newPanelName}" उत्पन्न हुआ और सफलतापूर्वक टैब के रूप में जोड़ा गया!`);
                    setActiveAdminTab(panelId);
                  }}
                  className="space-y-4 text-xs font-semibold"
                >
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Panel Name</label>
                    <input 
                      type="text"
                      required
                      value={newPanelName}
                      onChange={e => setNewPanelName(e.target.value)}
                      placeholder="e.g. Audit Logs"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-amber-500 outline-none bg-slate-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Brief Subtitle</label>
                    <input 
                      type="text"
                      value={newPanelDescription}
                      onChange={e => setNewPanelDescription(e.target.value)}
                      placeholder="Live system logs"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    />
                  </div>

                  {/* Metric 1 Form */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-extrabold text-[10px] text-slate-400 block uppercase tracking-wider">Metrics Card 1</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        value={newMetric1Label}
                        onChange={e => setNewMetric1Label(e.target.value)}
                        placeholder="Label (e.g. Speed)"
                        className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-bold"
                      />
                      <input 
                        type="text"
                        value={newMetric1Value}
                        onChange={e => setNewMetric1Value(e.target.value)}
                        placeholder="Value (e.g. 98%)"
                        className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <select
                        value={newMetric1Icon}
                        onChange={e => setNewMetric1Icon(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-bold"
                      >
                        <option value="star">⭐ Star Icon</option>
                        <option value="users">👥 Users Icon</option>
                        <option value="zap">⚡ Zap/Speed Icon</option>
                        <option value="dollar">💸 Dollar Icon</option>
                        <option value="box">📦 Package Icon</option>
                      </select>
                    </div>
                  </div>

                  {/* Metric 2 Form */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-extrabold text-[10px] text-slate-400 block uppercase tracking-wider">Metrics Card 2</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        value={newMetric2Label}
                        onChange={e => setNewMetric2Label(e.target.value)}
                        placeholder="Label (e.g. Comm Saved)"
                        className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-bold"
                      />
                      <input 
                        type="text"
                        value={newMetric2Value}
                        onChange={e => setNewMetric2Value(e.target.value)}
                        placeholder="Value (e.g. ₹5,400)"
                        className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <select
                        value={newMetric2Icon}
                        onChange={e => setNewMetric2Icon(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-bold"
                      >
                        <option value="star">⭐ Star Icon</option>
                        <option value="users">👥 Users Icon</option>
                        <option value="zap">⚡ Zap/Speed Icon</option>
                        <option value="dollar">💸 Dollar Icon</option>
                        <option value="box">📦 Package Icon</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Rich Narrative Context</label>
                    <textarea 
                      value={newPanelRichContent}
                      onChange={e => setNewPanelRichContent(e.target.value)}
                      placeholder="Write system notes, summaries, or static analytical logs here..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl h-20 bg-slate-50 font-bold outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-black uppercase transition shadow-md font-mono"
                  >
                    🛠️ Spawn Operational Tab
                  </button>
                </form>
              </div>

              {/* List of existing custom-built panels to delete/toggle */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 font-semibold">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-1.5 border-b border-slate-100">
                  {language === 'en' ? 'Active Custom Dashboards' : 'सक्रिय कस्टम डैशबोर्ड'}
                </h4>
                {customPanels.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic text-center py-2">
                    {language === 'en' ? 'No custom panels registered.' : 'कोई कस्टम पैनल पंजीकृत नहीं है।'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customPanels.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <span className="font-extrabold text-xs text-slate-700 block">
                            {language === 'hi' ? p.nameHi : p.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">#{p.id}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(language === 'en' ? `Delete panel "${p.name}"?` : `क्या आप वाकई "${p.nameHi}" पैनल को हटाना चाहते हैं?`)) {
                              onUpdateCustomPanels(customPanels.filter(cp => cp.id !== p.id));
                              if (activeAdminTab === p.id) {
                                setActiveAdminTab('overview');
                              }
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
