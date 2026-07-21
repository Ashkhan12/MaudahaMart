/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  HelpCircle, 
  History, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Coins, 
  CreditCard,
  ExternalLink,
  XCircle,
  Star
} from 'lucide-react';
import { Order, Language, Product, OrderItem } from '../types';

interface UserOrderPanelProps {
  orders: Order[];
  activeUserId: string;
  language: Language;
  onTrackOrder: (orderId: string) => void;
  onNavigateToSupport: () => void;
  products: Product[];
  cart: { [storeId: string]: OrderItem[] };
  onUpdateCart: (updatedCart: { [storeId: string]: OrderItem[] }) => void;
  onCancelOrder: (orderId: string) => void;
  onRateRider?: (orderId: string, rating: number) => void;
}

export default function UserOrderPanel({
  orders,
  activeUserId,
  language,
  onTrackOrder,
  onNavigateToSupport,
  products,
  cart,
  onUpdateCart,
  onCancelOrder,
  onRateRider
}: UserOrderPanelProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [hoverRatings, setHoverRatings] = useState<{[orderId: string]: number | null}>({});

  const getRatingText = (rating: number, lang: Language) => {
    const texts = {
      en: {
        1: "Terrible",
        2: "Bad",
        3: "Okay",
        4: "Good",
        5: "Excellent!"
      },
      hi: {
        1: "बहुत खराब",
        2: "खराब",
        3: "ठीक-ठाक",
        4: "अच्छा",
        5: "उत्कृष्ट!"
      }
    };
    return texts[lang][rating as 1|2|3|4|5] || "";
  };

  // Filter orders for active user
  const userOrders = orders.filter(o => o.userId === activeUserId);
  const activeOrders = userOrders.filter(o => o.deliveryStatus !== 'arrived' && o.deliveryStatus !== 'cancelled');
  const pastOrders = userOrders.filter(o => o.deliveryStatus === 'arrived' || o.deliveryStatus === 'cancelled');

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleReorderAction = (order: Order) => {
    const storeId = order.storeId;
    const currentStoreCart = cart[storeId] || [];
    
    let addedItems: string[] = [];
    let partialItems: { name: string; requested: number; added: number }[] = [];
    let outOfStockItems: string[] = [];
    let notFoundItems: string[] = [];
    
    // Create a mutable copy of the current store cart items for updating
    const newStoreCart = [...currentStoreCart];
    
    order.items.forEach(orderItem => {
      // Find current product in the catalog
      const currentProduct = products.find(p => p.id === orderItem.product.id);
      
      if (!currentProduct) {
        notFoundItems.push(language === 'hi' ? orderItem.product.nameHi : orderItem.product.name);
        return;
      }
      
      const productName = language === 'hi' ? currentProduct.nameHi : currentProduct.name;
      
      // Check if product is already in the cart, get its current quantity
      const existingCartItemIndex = newStoreCart.findIndex(it => it.product.id === currentProduct.id);
      const currentCartQty = existingCartItemIndex > -1 ? newStoreCart[existingCartItemIndex].quantity : 0;
      
      const requestedQty = orderItem.quantity;
      const totalAvailableStock = currentProduct.stock;
      
      // Check remaining stock that can be added
      const maxCanAdd = Math.max(0, totalAvailableStock - currentCartQty);
      
      if (maxCanAdd <= 0) {
        // No stock available to add more
        outOfStockItems.push(productName);
      } else if (requestedQty <= maxCanAdd) {
        // We can add the full requested quantity
        if (existingCartItemIndex > -1) {
          newStoreCart[existingCartItemIndex] = {
            ...newStoreCart[existingCartItemIndex],
            quantity: newStoreCart[existingCartItemIndex].quantity + requestedQty
          };
        } else {
          newStoreCart.push({
            product: currentProduct,
            quantity: requestedQty
          });
        }
        addedItems.push(`${productName} (x${requestedQty})`);
      } else {
        // We can only add a partial quantity
        const partialQty = maxCanAdd;
        if (existingCartItemIndex > -1) {
          newStoreCart[existingCartItemIndex] = {
            ...newStoreCart[existingCartItemIndex],
            quantity: newStoreCart[existingCartItemIndex].quantity + partialQty
          };
        } else {
          newStoreCart.push({
            product: currentProduct,
            quantity: partialQty
          });
        }
        partialItems.push({
          name: productName,
          requested: requestedQty,
          added: partialQty
        });
      }
    });
    
    // If we updated anything, call onUpdateCart
    if (addedItems.length > 0 || partialItems.length > 0) {
      onUpdateCart({
        ...cart,
        [storeId]: newStoreCart
      });
    }
    
    // Construct feedback message
    let message = '';
    if (language === 'en') {
      if (addedItems.length > 0) {
        message += `Successfully added to cart:\n${addedItems.map(item => `• ${item}`).join('\n')}\n\n`;
      }
      if (partialItems.length > 0) {
        message += `Added partial quantities due to limited stock:\n${partialItems.map(p => `• ${p.name}: requested ${p.requested}, added ${p.added} (max stock)`).join('\n')}\n\n`;
      }
      if (outOfStockItems.length > 0) {
        message += `Could not add (out of stock/reached stock limit):\n${outOfStockItems.map(item => `• ${item}`).join('\n')}\n\n`;
      }
      if (notFoundItems.length > 0) {
        message += `Items no longer available in this store:\n${notFoundItems.map(item => `• ${item}`).join('\n')}\n`;
      }
      
      if (addedItems.length === 0 && partialItems.length === 0) {
        alert(`Could not reorder items from this order.\n\n${message}`);
      } else {
        alert(`Reordered successfully!\n\n${message}`);
      }
    } else {
      // Hindi translations
      if (addedItems.length > 0) {
        message += `कार्ट में सफलतापूर्वक जोड़ा गया:\n${addedItems.map(item => `• ${item}`).join('\n')}\n\n`;
      }
      if (partialItems.length > 0) {
        message += `सीमित स्टॉक के कारण आंशिक मात्रा जोड़ी गई:\n${partialItems.map(p => `• ${p.name}: अनुरोधित ${p.requested}, जोड़ा गया ${p.added} (अधिकतम स्टॉक)`).join('\n')}\n\n`;
      }
      if (outOfStockItems.length > 0) {
        message += `जोड़ा नहीं जा सका (स्टॉक खत्म/स्टॉक सीमा तक पहुंच गया):\n${outOfStockItems.map(item => `• ${item}`).join('\n')}\n\n`;
      }
      if (notFoundItems.length > 0) {
        message += `सामग्री अब इस दुकान में उपलब्ध नहीं है:\n${notFoundItems.map(item => `• ${item}`).join('\n')}\n`;
      }
      
      if (addedItems.length === 0 && partialItems.length === 0) {
        alert(`इस ऑर्डर से सामग्री पुनः ऑर्डर नहीं की जा सकी।\n\n${message}`);
      } else {
        alert(`सफलतापूर्वक पुनः ऑर्डर किया गया!\n\n${message}`);
      }
    }
  };

  // Translations
  const text = {
    en: {
      title: 'My Orders Console',
      subtitle: 'Track your live groceries and review past bills',
      activeTab: 'Active Deliveries',
      historyTab: 'Past Purchases',
      noActive: 'No active orders right now',
      noActiveDesc: 'Stock up your kitchen with fresh items from Galla Mandi, Naya Bazar, or other partner stores!',
      noHistory: 'No past orders yet',
      noHistoryDesc: 'Your completed orders and printable invoices will show up here.',
      orderId: 'Order ID',
      placedOn: 'Placed on',
      status: 'Status',
      payment: 'Payment',
      itemsCount: 'Items',
      total: 'Grand Total',
      trackLive: 'Track Live on Map',
      viewReceipt: 'View Full Receipt',
      hideReceipt: 'Hide Receipt Details',
      coinsEarned: 'Maudaha Coins Earned',
      coinsRedeemed: 'Coins Redeemed',
      paidVia: 'Paid via',
      cod: 'Cash on Delivery',
      upi: 'UPI Secured Digital Gateway',
      supportBtn: 'Need Support?',
      shopNow: 'Browse Local Stores',
      deliveryAddress: 'Delivery Area',
      itemsSummary: 'Items Summary',
      statusPending: 'Order Placed (Pending)',
      statusProcessing: 'Merchant Preparing Order',
      statusReadyForPickup: 'Packed & Ready for Pickup',
      statusReadyForDelivery: 'Picked Up by Rider',
      statusOutForDelivery: 'Rider is Out for Delivery',
      statusArrived: 'Delivered Successfully',
      discount: 'Discounts Applied'
    },
    hi: {
      title: 'मेरे ऑर्डर कंसोल',
      subtitle: 'अपने लाइव किराना सामान को ट्रैक करें और पिछले बिलों की समीक्षा करें',
      activeTab: 'सक्रिय डिलीवरी',
      historyTab: 'पुराने ऑर्डर',
      noActive: 'अभी कोई सक्रिय ऑर्डर नहीं है',
      noActiveDesc: 'गल्ला मंडी, नया बाजार या अन्य स्थानीय दुकानों से ताज़ा सामानों के साथ अपनी रसोई का स्टॉक बढ़ाएं!',
      noHistory: 'अभी तक कोई पुराना ऑर्डर नहीं है',
      noHistoryDesc: 'आपके पूरे किए गए ऑर्डर और बिल रसीदें यहाँ दिखाई देंगी।',
      orderId: 'ऑर्डर आईडी',
      placedOn: 'दिनांक',
      status: 'स्थिति',
      payment: 'भुगतान',
      itemsCount: 'सामग्री',
      total: 'कुल राशि',
      trackLive: 'नक्शे पर लाइव देखें',
      viewReceipt: 'पूरी रसीद देखें',
      hideReceipt: 'रसीद छुपाएं',
      coinsEarned: 'अर्जित मौदहा कॉइन्स',
      coinsRedeemed: 'रिडीम किए गए कॉइन्स',
      paidVia: 'भुगतान विधि',
      cod: 'कैश ऑन डिलीवरी (COD)',
      upi: 'UPI सुरक्षित डिजिटल गेटवे',
      supportBtn: 'मदद की ज़रूरत है?',
      shopNow: 'स्थानीय दुकानें देखें',
      deliveryAddress: 'डिलिवरी क्षेत्र',
      itemsSummary: 'सामग्री विवरण',
      statusPending: 'ऑर्डर किया गया (लंबित)',
      statusProcessing: 'व्यापारी द्वारा तैयारी चालू है',
      statusReadyForPickup: 'पैक और पिकअप हेतु तैयार',
      statusReadyForDelivery: 'सवार ने सामान उठा लिया है',
      statusOutForDelivery: 'वितरण के लिए बाहर (मार्ग में है)',
      statusArrived: 'सफलतापूर्वक वितरित',
      discount: 'लागू छूट'
    }
  }[language];

  // Helper to translate status
  const getStatusLabel = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'pending': return text.statusPending;
      case 'processing': return text.statusProcessing;
      case 'ready_for_pickup': return text.statusReadyForPickup;
      case 'ready_for_delivery': return text.statusReadyForDelivery;
      case 'out_for_delivery': return text.statusOutForDelivery;
      case 'arrived': return text.statusArrived;
      default: return status;
    }
  };

  const getStatusProgress = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'pending': return 15;
      case 'processing': return 35;
      case 'ready_for_pickup': return 55;
      case 'ready_for_delivery': return 75;
      case 'out_for_delivery': return 90;
      case 'arrived': return 100;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Upper Brand Info Banner */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 block shadow-inner">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{text.title}</h1>
          </div>
          <p className="text-xs text-slate-400 font-bold leading-normal mt-1 ml-1">
            {text.subtitle}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'active'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck className="h-4 w-4 cursor-pointer" />
            <span>{text.activeTab}</span>
            {activeOrders.length > 0 && (
              <span className="h-5 w-5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeOrders.length}
              </span>
            )}
          </button>
          <button type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="h-4 w-4 cursor-pointer" />
            <span>{text.historyTab}</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content Area */}
      {activeTab === 'active' ? (
        <div className="space-y-6">
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto border-dashed">
              <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <Truck className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-black text-slate-800">{text.noActive}</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed mt-2">
                {text.noActiveDesc}
              </p>
            </div>
          ) : (
            activeOrders.map((order) => {
              const progress = getStatusProgress(order.deliveryStatus);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-emerald-500/20 shadow-md p-6 relative overflow-hidden"
                >
                  {/* Decorative corner pulse indicator */}
                  <span className="absolute top-0 right-0 h-2 w-24 bg-emerald-500 animate-pulse rounded-bl-full" />

                  {/* Top order summary row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-5 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
                          #{order.id}
                        </span>
                        <span className="text-xs text-slate-400 font-bold font-mono">{order.date}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-800 mt-2">
                        {language === 'hi' ? order.storeNameHi : order.storeName}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">{text.total}</span>
                      <span className="text-xl font-mono font-black text-emerald-600">₹{order.total}</span>
                    </div>
                  </div>

                  {/* Delivery Status Indicator & Bar */}
                  <div className="space-y-3 mb-6 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-slate-500 uppercase tracking-wider">{text.status}:</span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {getStatusLabel(order.deliveryStatus)}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative border border-slate-200">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-6 text-[8px] text-slate-400 font-black text-center pt-1 leading-tight">
                      <span className={order.deliveryStatus === 'pending' ? 'text-emerald-600' : ''}>{language === 'hi' ? 'लंबित' : 'PENDING'}</span>
                      <span className={order.deliveryStatus === 'processing' ? 'text-emerald-600' : ''}>{language === 'hi' ? 'तैयारी' : 'PREPARING'}</span>
                      <span className={order.deliveryStatus === 'ready_for_pickup' ? 'text-emerald-600' : ''}>{language === 'hi' ? 'पैक' : 'PACKED'}</span>
                      <span className={order.deliveryStatus === 'ready_for_delivery' ? 'text-emerald-600' : ''}>{language === 'hi' ? 'पिक' : 'PICKED UP'}</span>
                      <span className={order.deliveryStatus === 'out_for_delivery' ? 'text-emerald-600' : ''}>{language === 'hi' ? 'मार्ग' : 'OUT'}</span>
                      <span className={order.deliveryStatus === 'arrived' ? 'text-emerald-600' : ''}>{language === 'hi' ? 'वितरित' : 'DELIVERED'}</span>
                    </div>
                  </div>

                  {/* Items brief block */}
                  <div className="space-y-2.5 mb-6">
                    <h4 className="text-[11px] uppercase text-slate-400 font-black tracking-widest">{text.itemsSummary}:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border border-slate-100 bg-white p-2.5 rounded-xl font-bold">
                          <span className="text-slate-700 truncate max-w-[180px]">
                            {language === 'hi' ? it.product.nameHi : it.product.name}
                          </span>
                          <span className="text-slate-400 text-xs shrink-0 font-mono">
                            Qty: {it.quantity} × ₹{it.product.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons row */}
                  <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-100">
                    {(order.deliveryStatus === 'pending' || order.deliveryStatus === 'processing') && (
                      <button type="button"
                        onClick={() => {
                          if (window.confirm(language === 'en' ? 'Are you sure you want to cancel this order?' : 'क्या आप वाकई इस ऑर्डर को रद्द करना चाहते हैं?')) {
                            onCancelOrder(order.id);
                          }
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" />
                        {language === 'en' ? 'Cancel Order' : 'ऑर्डर रद्द करें'}
                      </button>
                    )}
                    <button type="button"
                      onClick={onNavigateToSupport}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle className="h-4 w-4" />
                      {text.supportBtn}
                    </button>
                    <button type="button"
                      onClick={() => onTrackOrder(order.id)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all active:scale-[0.98] shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{text.trackLive}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pastOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto border-dashed">
              <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <History className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-black text-slate-800">{text.noHistory}</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed mt-2">
                {text.noHistoryDesc}
              </p>
            </div>
          ) : (
            pastOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-150 shadow-xs hover:border-slate-300 transition overflow-hidden"
                >
                  {/* Collapsed view header */}
                  <div 
                    onClick={() => toggleOrderExpand(order.id)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center ${order.deliveryStatus === 'cancelled' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {order.deliveryStatus === 'cancelled' ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-slate-500">#{order.id}</span>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">{order.date}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 mt-1">
                          {language === 'hi' ? order.storeNameHi : order.storeName}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-black block">Grand Total</span>
                        <span className="font-mono text-sm font-black text-slate-800">₹{order.total}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.deliveryStatus === 'cancelled' ? (
                          <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                            {language === 'en' ? 'CANCELLED' : 'रद्द किया गया'}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                            DELIVERED
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderAction(order);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-1 shadow-xs shadow-emerald-600/10 active:scale-95 cursor-pointer"
                          title={language === 'en' ? 'Reorder all items' : 'पुनः ऑर्डर करें'}
                        >
                          🔄 {language === 'en' ? 'Reorder' : 'पुनः ऑर्डर'}
                        </button>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded receipt details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4"
                    >
                      {/* Products break-up list */}
                      <div>
                        <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Itemized Invoice</h5>
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="p-3 flex justify-between items-center text-xs font-bold text-slate-700">
                              <div>
                                <p>{language === 'hi' ? it.product.nameHi : it.product.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{it.product.unit}</p>
                              </div>
                              <div className="text-right font-mono text-slate-800">
                                <span>{it.quantity} × ₹{it.product.price}</span>
                                <span className="w-16 inline-block text-right font-black pl-2">₹{it.quantity * it.product.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cash back / coins summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                          <Coins className="h-5 w-5 text-amber-500" />
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block leading-none">{text.coinsEarned}</span>
                            <span className="text-xs font-black text-slate-800">+{order.coinsEarned || 0}</span>
                          </div>
                        </div>

                        {order.coinsRedeemed > 0 && (
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                            <Coins className="h-5 w-5 text-emerald-500" />
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block leading-none">{text.coinsRedeemed}</span>
                              <span className="text-xs font-black text-red-500">-{order.coinsRedeemed}</span>
                            </div>
                          </div>
                        )}

                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2 sm:col-span-1">
                          <CreditCard className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block leading-none">{text.paidVia}</span>
                            <span className="text-[11px] font-black text-slate-800">
                              {order.paymentMethod === 'UPI' ? 'UPI' : 'COD'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rider Rating Section (only if order is marked as arrived) */}
                      {order.deliveryStatus === 'arrived' && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="p-2 bg-amber-50 text-amber-500 rounded-xl border border-amber-100/50">
                                <Star className="h-4 w-4 fill-current" />
                              </span>
                              <div>
                                <h5 className="text-xs font-black text-slate-800">
                                  {language === 'en' ? 'Rate Delivery Rider' : 'डिलिवरी बॉय को रेटिंग दें'}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                  {language === 'en' ? 'How was your experience with Rahul Kumar?' : 'राहुल कुमार के साथ आपका अनुभव कैसा रहा?'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Star interactive selection */}
                            <div className="flex items-center gap-1.5 self-start sm:self-auto">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const currentHover = hoverRatings[order.id] ?? null;
                                const isFilled = order.riderRating ? star <= order.riderRating : star <= (currentHover ?? 0);
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    disabled={!!order.riderRating}
                                    onMouseEnter={() => !order.riderRating && setHoverRatings(prev => ({ ...prev, [order.id]: star }))}
                                    onMouseLeave={() => !order.riderRating && setHoverRatings(prev => ({ ...prev, [order.id]: null }))}
                                    onClick={() => onRateRider && onRateRider(order.id, star)}
                                    className={`p-1 transition-transform active:scale-90 ${order.riderRating ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                                  >
                                    <Star
                                      className={`h-5 w-5 transition-colors ${
                                        isFilled 
                                          ? 'fill-amber-400 text-amber-400' 
                                          : 'text-slate-200'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Confirmation/Label state */}
                          {order.riderRating ? (
                            <p className="text-[10px] text-emerald-700 font-black flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 cursor-pointer">
                              <span>✓</span>
                              <span>
                                {language === 'en' 
                                  ? `You rated ${order.riderRating} out of 5 stars. Thank you for your feedback!` 
                                  : `आपने ${order.riderRating} स्टार रेटिंग दी। प्रतिक्रिया के लिए धन्यवाद!`}
                              </span>
                            </p>
                          ) : hoverRatings[order.id] ? (
                            <p className="text-[10px] text-amber-600 font-extrabold text-left sm:text-right sm:pr-2">
                              {getRatingText(hoverRatings[order.id]!, language)}
                            </p>
                          ) : null}
                        </div>
                      )}

                      {/* Pricing detail items */}
                      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2 text-xs font-bold text-slate-600">
                        {order.discount > 0 && (
                          <div className="flex justify-between">
                            <span>{text.discount}:</span>
                            <span className="text-red-500 font-mono">-₹{order.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-800 font-black">
                          <span>{text.total}:</span>
                          <span className="font-mono text-emerald-600">₹{order.total}</span>
                        </div>
                      </div>

                      {/* Big Reorder Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderAction(order);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-semibold shadow-md shadow-emerald-600/15 active:scale-[0.99] cursor-pointer"
                      >
                        🔄 {language === 'en' ? 'Reorder All Items Back to Cart' : 'सभी सामग्री कार्ट में पुनः ऑर्डर करें'}
                      </button>

                      {/* Footer help connection */}
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1">
                        <span className="font-mono">Method: {order.paymentMethod === 'UPI' ? text.upi : text.cod}</span>
                        <button type="button"
                          onClick={onNavigateToSupport}
                          className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="h-3 w-3" />
                          {text.supportBtn}
                        </button>
                      </div>

                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
