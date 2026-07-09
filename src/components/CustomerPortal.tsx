/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, Star, MapPin, Clock, Copy, Plus, Minus, Tag, Gift, Sparkles, Send, MessageSquare, ArrowRight, Mic, MicOff, X, Heart } from 'lucide-react';
import { Store, Product, Review, OrderItem, Language, Notification, LoyaltyInfo, RegisteredUser, SystemSettings, Order, ScratchCard } from '../types';
import { TRANSLATIONS } from '../data';
import UPIPayment from './UPIPayment';
import DeliveryZoneMap from './DeliveryZoneMap';
import SmartSearchBar from './SmartSearchBar';

interface CustomerPortalProps {
  stores: Store[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  cart: { [storeId: string]: OrderItem[] };
  loyalty: LoyaltyInfo;
  notifications: Notification[];
  selectedStoreId: string | null;
  activeOrderTrackingId: string | null;
  onSelectStore: (storeId: string | null) => void;
  onAddToCart: (storeId: string, product: Product) => void;
  onRemoveFromCart: (storeId: string, productId: string) => void;
  onClearCart: (storeId: string) => void;
  onAddReview: (review: Review) => void;
  onCheckout: (storeId: string, paymentMethod: 'UPI' | 'COD', upiId?: string, discount?: number, redeemedCoins?: number) => void;
  onUseCoins: (use: boolean) => void;
  useCoinsState: boolean;
  language: Language;
  activeUserId: string;
  users: RegisteredUser[];
  onSwitchUser: (userId: string) => void;
  onAddSearch: (userId: string, query: string) => void;
  settings: SystemSettings;
  onUpdateUsers: (users: RegisteredUser[]) => void;
  onNavigateTab?: (tab: 'browse' | 'orders' | 'loyalty' | 'support' | 'restaurants' | 'clothing' | 'trains' | 'flights') => void;
  scratchCards?: ScratchCard[];
}

export default function CustomerPortal({
  stores,
  products,
  reviews,
  orders,
  cart,
  loyalty,
  notifications,
  selectedStoreId,
  activeOrderTrackingId,
  onSelectStore,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onAddReview,
  onCheckout,
  onUseCoins,
  useCoinsState,
  language,
  activeUserId,
  users,
  onSwitchUser,
  onAddSearch,
  settings,
  onUpdateUsers,
  onNavigateTab,
  scratchCards = []
}: CustomerPortalProps) {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const activeUser = users.find(u => u.id === activeUserId);
  const watchlist = activeUser?.watchlist || [];

  const handleToggleWatchlist = (productId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === activeUserId) {
        const currentWatchlist = user.watchlist || [];
        const hasItem = currentWatchlist.includes(productId);
        const nextWatchlist = hasItem
          ? currentWatchlist.filter(id => id !== productId)
          : [...currentWatchlist, productId];
        return { ...user, watchlist: nextWatchlist };
      }
      return user;
    });
    onUpdateUsers(updatedUsers);
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isStoreSearchFocused, setIsStoreSearchFocused] = useState(false);

  // --- Customer Needs, Demands & Trends Intelligence ---
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiRecsExplanation, setAiRecsExplanation] = useState<{
    explanation: string;
    explanationHi: string;
    marketTrendAlert: string;
    marketTrendAlertHi: string;
  } | null>(null);
  const [showAiRecs, setShowAiRecs] = useState(false);

  const recommendationsData = React.useMemo(() => {
    const userSearchHistory = activeUser?.searchHistory || [];
    const userWatchlist = activeUser?.watchlist || [];

    // Extract recent purchased categories from orders
    const userOrders = orders.filter(o => o.userId === activeUserId);
    const userPurchasedCategories = new Set<string>();
    
    userOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.product?.category) {
          userPurchasedCategories.add(it.product.category);
        }
      });
    });

    // Count global purchase frequency to establish hot trends
    const globalPurchaseCounts: { [productId: string]: number } = {};
    orders.forEach(o => {
      o.items?.forEach(it => {
        if (it.product?.id) {
          globalPurchaseCounts[it.product.id] = (globalPurchaseCounts[it.product.id] || 0) + it.quantity;
        }
      });
    });

    // Score each product to find personalized recommendations
    const scoredProducts = products.map(prod => {
      let score = 0;

      // Rule A: Watchlist match (+6 points)
      if (userWatchlist.includes(prod.id)) {
        score += 6;
      }

      // Rule B: Search history match (+5 points for match, +3 for category match)
      const lowercaseName = prod.name?.toLowerCase() || '';
      const lowercaseNameHi = prod.nameHi?.toLowerCase() || '';
      const lowercaseCat = prod.category?.toLowerCase() || '';
      
      userSearchHistory.forEach(query => {
        const q = query.toLowerCase().trim();
        if (!q) return;
        if (lowercaseName.includes(q) || lowercaseNameHi.includes(q)) {
          score += 5;
        } else if (lowercaseCat.includes(q)) {
          score += 3;
        }
      });

      // Rule C: Purchased category match (+3 points)
      if (userPurchasedCategories.has(prod.category)) {
        score += 3;
      }

      // Rule D: Global popularity support (+0.5 point per unit ordered across Maudaha)
      const quantitySold = globalPurchaseCounts[prod.id] || 0;
      score += quantitySold * 0.5;

      // Out of stock penalty (never recommend completely unavailable items)
      if (prod.stock <= 0) {
        score = -100;
      }

      return { product: prod, score, quantitySold };
    });

    // Filter out zero-scored or out-of-stock items, sort descending
    const sortedRecommendations = [...scoredProducts]
      .filter(item => item.score > 0 && item.product.stock > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    // Backfill with top rated items if needed
    const backfill = products
      .filter(p => p.stock > 0 && !sortedRecommendations.some(sr => sr.id === p.id))
      .sort((a, b) => b.rating - a.rating);

    const finalRecs = [...sortedRecommendations, ...backfill].slice(0, 4);

    // Global Trending items
    const trendingList = products
      .filter(p => p.stock > 0)
      .map(p => ({
        product: p,
        sales: globalPurchaseCounts[p.id] || 0
      }))
      .sort((a, b) => b.sales - a.sales || b.product.rating - a.product.rating)
      .slice(0, 4)
      .map(item => item.product);

    return {
      personalized: finalRecs,
      trending: trendingList,
      userPurchasedCategories: Array.from(userPurchasedCategories),
      userSearchHistory,
      userWatchlist
    };
  }, [products, orders, activeUserId, users, activeUser]);

  const handleLoadAiRecommendations = async () => {
    setAiRecsLoading(true);
    try {
      const payload = {
        searchHistory: activeUser?.searchHistory || [],
        watchlist: activeUser?.watchlist || [],
        recentCategories: recommendationsData.userPurchasedCategories,
        trendingProducts: recommendationsData.trending.map(p => p.name),
        recommendedProducts: recommendationsData.personalized.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price
        })),
        language
      };

      const res = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecsExplanation(data);
        setShowAiRecs(true);
      }
    } catch (err) {
      console.error("Failed to load AI Recommendations explanation", err);
    } finally {
      setAiRecsLoading(false);
    }
  };

  // Integrated AI Search states
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResponse, setAiSearchResponse] = useState<{
    explanation: string;
    explanationHi: string;
    recommendedProductIds: string[];
    offline?: boolean;
  } | null>(null);
  const [aiSearchError, setAiSearchError] = useState('');

  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      alert(language === 'en' ? 'Please type something to search with AI first!' : 'कृपया पहले एआई से खोजने के लिए कुछ लिखें!');
      return;
    }

    setAiSearchLoading(true);
    setAiSearchError('');
    setAiSearchResponse(null);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language })
      });

      if (!response.ok) {
        throw new Error('AI search request failed.');
      }

      const data = await response.json();
      setAiSearchResponse(data);
      onAddSearch(activeUserId, query);
    } catch (err: any) {
      console.error(err);
      setAiSearchError(language === 'en' 
        ? 'Had trouble connecting to the AI search service. Please check your internet or key.'
        : 'एआई खोज सेवा से जुड़ने में परेशानी हुई। कृपया अपना इंटरनेट या की जांचें।');
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [activeRecognitionInstance, setActiveRecognitionInstance] = useState<any>(null);

  const toggleSpeechRecognition = (onTranscript: (text: string) => void) => {
    if (isListening && activeRecognitionInstance) {
      activeRecognitionInstance.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionConstructor) {
      alert(
        language === 'en'
          ? 'Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.'
          : 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया क्रोम, एज या सफारी का उपयोग करें।'
      );
      return;
    }

    try {
      const rec = new SpeechRecognitionConstructor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setActiveRecognitionInstance(null);
      };

      rec.start();
      setActiveRecognitionInstance(rec);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setActiveRecognitionInstance(null);
    }
  };

  // Synchronize delivery address with active user's location on load/switch
  React.useEffect(() => {
    if (activeUser) {
      setDeliveryAddress(language === 'hi' ? activeUser.locationHi : activeUser.location);
    }
  }, [activeUserId, language, activeUser]);

  // Dynamic popular grocery item suggestions from the active product inventory
  const suggestions = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const baseProducts = selectedStoreId 
      ? products.filter(p => p.storeId === selectedStoreId)
      : products;

    if (!query) {
      // Sort in-stock products by rating descending to show popular items by default
      return [...baseProducts]
        .filter(p => p.stock > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    }
    // Search matching products by name, category, or translated name
    return baseProducts
      .filter(p => (
        (p.name || '').toLowerCase().includes(query) ||
        (p.nameHi || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query) ||
        (p.categoryHi && (p.categoryHi || '').toLowerCase().includes(query))
      ))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [products, searchQuery, selectedStoreId]);

  const popularKeywords = [
    { en: 'Atta', hi: 'आटा' },
    { en: 'Milk', hi: 'दूध' },
    { en: 'Paneer', hi: 'पनीर' },
    { en: 'Mangoes', hi: 'आम' },
    { en: 'Peda', hi: 'पेड़ा' },
    { en: 'Ghee', hi: 'घी' }
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      onAddSearch(activeUserId, searchQuery.trim());
    }
  };
  
  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  
  // Checkout & coupon code state
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);



  // Filter products
  const activeStore = stores.find(s => s.id === selectedStoreId);
  const activeStoreCart = selectedStoreId ? cart[selectedStoreId] || [] : [];
  
  const activeStoreProducts = selectedStoreId
    ? products.filter(p => {
        const matchesStore = p.storeId === selectedStoreId;
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        const matchesWatchlist = !showWatchlistOnly || watchlist.includes(p.id);
        return matchesStore && matchesCategory && matchesWatchlist;
      })
    : [];

  const filteredStores = stores.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchName = (s.name || '').toLowerCase().includes(query) || (s.nameHi || '').toLowerCase().includes(query);
    const matchCat = (s.categories || []).some(c => (c || '').toLowerCase().includes(query));
    const matchAddr = (s.address || '').toLowerCase().includes(query) || (s.addressHi || '').toLowerCase().includes(query);
    
    // Dynamic match in-store products too
    const matchProduct = products.some(p => p.storeId === s.id && (
      (p.name || '').toLowerCase().includes(query) ||
      (p.nameHi || '').toLowerCase().includes(query) ||
      (p.category || '').toLowerCase().includes(query)
    ));

    return matchName || matchCat || matchAddr || matchProduct;
  });

  const filteredProducts = activeStoreProducts.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (p.name || '').toLowerCase().includes(query) || (p.nameHi || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query);
  });

  const activeStoreReviews = selectedStoreId
    ? reviews.filter(r => r.storeId === selectedStoreId)
    : [];

  // Cart Calculations
  const subtotal = activeStoreCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const minFreeDelivery = settings.minCheckoutAmount ?? 199;
  const isEligibleFreeDelivery = subtotal >= minFreeDelivery;
  const deliveryFee = subtotal === 0 ? 0 : (isEligibleFreeDelivery ? 0 : (settings.deliveryCharge ?? 15));
  
  // Coupon validation
  const handleApplyCoupon = (codeParam?: string) => {
    const codeToApply = codeParam || couponCode;
    const matched = notifications.find(n => n.code?.toUpperCase() === codeToApply.trim().toUpperCase());
    if (matched && matched.discountAmount) {
      setCouponDiscount(matched.discountAmount);
      setCouponCode(matched.code || '');
      alert(language === 'en' ? `Coupon '${matched.code}' applied successfully! ₹${matched.discountAmount} off.` : `कूपन '${matched.code}' सफलतापूर्वक लागू हुआ! ₹${matched.discountAmount} की छूट।`);
    } else {
      alert(language === 'en' ? 'Invalid coupon code.' : 'अमान्य कूपन कोड।');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponCode('');
    alert(language === 'en' ? 'Coupon removed successfully.' : 'कूपन सफलतापूर्वक हटा दिया गया।');
  };

  // Coins valuation (1 coin = settings.coinToRupeeRate rupees)
  const coinRate = settings.coinToRupeeRate ?? 1;
  const coinsRedeemValue = Math.min(loyalty.points * coinRate, subtotal * 0.2); // max 20% of subtotal can be paid by coins
  const finalDiscount = couponDiscount + (useCoinsState ? coinsRedeemValue : 0);
  const grandTotal = Math.max(0, subtotal - finalDiscount + deliveryFee);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment || !selectedStoreId) return;

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      storeId: selectedStoreId,
      author: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      commentHi: reviewComment, // Simple fallback translation
      date: new Date().toISOString().split('T')[0]
    };

    onAddReview(newRev);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    alert(language === 'en' ? 'Thank you for your feedback!' : 'आपकी प्रतिक्रिया के लिए धन्यवाद!');
  };

  const executeCheckout = (confirmedUpiId?: string) => {
    if (!selectedStoreId) return;
    if (!deliveryAddress) {
      alert(language === 'en' ? 'Please enter a delivery address.' : 'कृपया वितरण का पता दर्ज करें।');
      return;
    }
    onCheckout(
      selectedStoreId,
      paymentMethod,
      confirmedUpiId || upiId,
      finalDiscount,
      useCoinsState ? coinsRedeemValue : 0
    );
    setShowCartDrawer(false);
    setShowUpiCheckout(false);
  };

  const handleCheckoutBtn = () => {
    if (!deliveryAddress.trim()) {
      alert(language === 'en' ? 'Please enter a delivery address.' : 'कृपया वितरण का पता दर्ज करें।');
      return;
    }
    if (paymentMethod === 'UPI') {
      setShowUpiCheckout(true);
    } else {
      executeCheckout();
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      


      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Case A: Stores Dashboard (Store List Mode) */}
        {!selectedStoreId ? (
          <div className="space-y-8">

            {/* Real-time Search Panel */}
            <form onSubmit={handleSearchSubmit} className="relative z-40 mb-6">
              <div className="relative flex-1">
              <SmartSearchBar 
                language={language}
                products={products}
                searchQuery={searchQuery}
                onSearch={(query) => {
                  setSearchQuery(query);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              />

                    
                {isSearchFocused && !selectedStoreId && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 animate-in fade-in duration-200">
                    
                    {/* Header showing section name */}
                    <div className="p-3 bg-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 select-none">
                        {searchQuery ? (
                          <>
                            <span>✨</span>
                            <span>{language === 'en' ? 'Matched Items in Maudaha' : 'मौदहा में मेल खाने वाली सामग्रियां'}</span>
                          </>
                        ) : (
                          <>
                            <span>🔥</span>
                            <span>{language === 'en' ? 'Popular Grocery Inventory' : 'लोकप्रिय स्थानीय किराना सामग्रियां'}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black select-none">
                        {language === 'en' ? `${products.length} Items Live` : `${products.length} सामग्रियां लाइव`}
                      </span>
                    </div>

                    {/* Quick Tags section - only when search query is empty */}
                    {!searchQuery && (
                      <div className="p-3 bg-white border-b border-slate-100">
                        <span className="text-[9px] text-slate-400 font-extrabold block mb-2 uppercase tracking-wide select-none">
                          {language === 'en' ? 'Trending Searches' : 'चर्चित खोजें'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {popularKeywords.map((kw, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSearchQuery(kw[language]);
                                onAddSearch(activeUserId, kw[language]);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-bold text-slate-600 transition border border-slate-200/40"
                            >
                              🔍 {kw[language]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions list */}
                    <div className="divide-y divide-slate-100/60 max-h-[250px] overflow-y-auto">
                      {suggestions.length === 0 ? (
                        <div className="p-4 text-center text-xs font-bold text-slate-400 italic">
                          {language === 'en' ? 'No items matched your inquiry' : 'आपकी खोज से मेल खाने वाली कोई सामग्री नहीं मिली'}
                        </div>
                      ) : (
                        suggestions.map((p) => {
                          const itemStore = stores.find(s => s.id === p.storeId);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSearchQuery(p.name);
                                onSelectStore(p.storeId);
                                onAddSearch(activeUserId, p.name);
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-3 group border-0 focus:outline-none focus:bg-slate-50"
                            >
                              <div className="flex items-center gap-3">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0 group-hover:scale-105 transition"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                                    🥦
                                  </div>
                                )}
                                <div>
                                  <span className="font-extrabold text-xs text-slate-800 block group-hover:text-emerald-600 transition">
                                    {language === 'hi' ? p.nameHi : p.name}
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                      🏪 {language === 'hi' ? itemStore?.nameHi : itemStore?.name}
                                    </span>
                                    {p.originalPrice && (
                                      <span className="text-[8px] bg-amber-500 text-white font-extrabold px-1 rounded-sm animate-pulse shrink-0">
                                        🎁 {language === 'hi' ? 'विशेष छूट' : 'Extra Scratch Off'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[9px] text-slate-400 line-through block leading-none">
                                  ₹{p.mrp}
                                </span>
                                <span className="font-mono text-xs font-black text-emerald-600 block">
                                  ₹{p.price} <span className="text-[9px] text-slate-400 font-medium">/{language === 'hi' ? p.unitHi : p.unit}</span>
                                </span>
                                <div className="flex items-center justify-end gap-1 mt-0.5">
                                  <span className="text-[9px] bg-amber-50 text-amber-600 px-1 py-0.2 rounded font-black border border-amber-200/40 flex items-center gap-0.5">
                                    ★ {p.rating}
                                  </span>
                                  {p.stock <= 5 && (
                                    <span className="text-[8px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded font-extrabold border border-rose-200/40">
                                      {language === 'hi' ? 'सीमित' : 'Low Stock'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer helper */}
                    <div className="p-2 bg-slate-50/80 text-center text-[9px] text-slate-400 font-bold border-t border-slate-100 select-none">
                      {language === 'en' ? '⚡ Click any item to directly open its store & filter products!' : '⚡ सामग्री पर क्लिक करके सीधे दुकान खोलें और सामान देखें!'}
                    </div>

                  </div>
                )}
              </div>

            </form>

            {/* AI Search Loading / Results Panel */}
            {aiSearchLoading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="text-xs font-black text-slate-500">
                    {language === 'en' ? 'Maudaha Gemini AI is analyzing our local inventory...' : 'मौदहा जेमिनी एआई हमारे स्थानीय स्टॉक का विश्लेषण कर रहा है...'}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="h-24 bg-slate-100 rounded-2xl" />
                  <div className="h-24 bg-slate-100 rounded-2xl" />
                  <div className="h-24 bg-slate-100 rounded-2xl" />
                </div>
              </div>
            )}

            {aiSearchError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs font-bold">
                ⚠️ {aiSearchError}
              </div>
            )}

            {aiSearchResponse && (
              <div className="bg-gradient-to-br from-emerald-50/40 to-slate-50 border border-emerald-500/20 rounded-3xl p-6 shadow-md space-y-4 relative">
                <button
                  type="button"
                  onClick={() => setAiSearchResponse(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <h3 className="text-sm font-black text-slate-800">
                    {language === 'en' ? 'Maudaha AI Search Recommendations' : 'मौदहा एआई खोज अनुशंसाएं'}
                  </h3>
                  {aiSearchResponse.offline && (
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      Demo Mode
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-bold bg-white/60 p-3.5 rounded-2xl border border-slate-100 shadow-3xs">
                  {language === 'hi' ? aiSearchResponse.explanationHi : aiSearchResponse.explanation}
                </p>

                {aiSearchResponse.recommendedProductIds && aiSearchResponse.recommendedProductIds.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from(new Set(aiSearchResponse.recommendedProductIds)).map((prodId, idx) => {
                      const prod = products.find(p => p.id === prodId);
                      if (!prod) return null;
                      const store = stores.find(s => s.id === prod.storeId);
                      const isWishlisted = watchlist.includes(prod.id);

                      return (
                        <div key={`${prod.id}-${idx}`} className="bg-white border border-slate-200/60 hover:border-emerald-500/20 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-3xs hover:shadow-sm transition group">
                          <div className="flex items-center gap-3">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0 group-hover:scale-105 transition"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                                🥦
                              </div>
                            )}
                            <div>
                              <span className="font-extrabold text-xs text-slate-800 block leading-snug group-hover:text-emerald-600 transition">
                                {language === 'hi' ? prod.nameHi : prod.name}
                              </span>
                              <span className="text-[9px] text-slate-400 block mt-0.5 font-bold uppercase tracking-wide leading-none">
                                🏪 {language === 'hi' ? store?.nameHi : store?.name}
                              </span>
                              <span className="font-mono text-xs font-black text-emerald-600 mt-1.5 block">
                                ₹{prod.price} <span className="text-[9px] text-slate-400 font-medium">/{language === 'hi' ? prod.unitHi : prod.unit}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                onAddToCart(prod.storeId, prod);
                              }}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition"
                            >
                              🛒 {language === 'en' ? 'Add to Cart' : 'जोड़ें'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleWatchlist(prod.id)}
                              className={`p-1.5 rounded-lg border transition ${
                                isWishlisted 
                                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                              }`}
                              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- AI SMART PICKS & MAUDAHA TRENDS PANEL --- */}
            <div className="bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-slate-500/5 rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                      {language === 'en' ? 'AI ACTIVE' : 'एआई सक्रिय'}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      ✨ {language === 'en' ? 'Smart Intelligence' : 'स्मार्ट इंटेलिजेंस'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black font-display text-slate-800 tracking-tight mt-1">
                    {language === 'en' ? '💡 AI Smart Picks & Maudaha Trends' : '💡 एआई स्मार्ट पसंद और मौदहा रुझान'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'en' 
                      ? 'Analyzing your searches, watchlists, and community orders to suggest daily essentials.' 
                      : 'दैनिक आवश्यकताओं का सुझाव देने के लिए आपकी खोज, वॉचलिस्ट और समुदाय के ऑर्डर्स का विश्लेषण।'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadAiRecommendations}
                  disabled={aiRecsLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
                >
                  {aiRecsLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      <span>{language === 'en' ? 'Analyzing...' : 'विश्लेषण जारी...'}</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>{language === 'en' ? 'Explain My Matches' : 'मेरे मिलान स्पष्ट करें'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expended AI Explanation Response */}
              {showAiRecs && aiRecsExplanation && (
                <div className="bg-slate-900/95 text-slate-100 rounded-2xl p-5 text-xs font-medium space-y-3 shadow-inner relative z-10 border border-slate-800 animate-in slide-in-from-top-3 duration-300">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px]">
                      🤖 {language === 'en' ? 'Gemini Insight Engine' : 'जेमिनी इनसाइट इंजन'}
                    </span>
                    <button 
                      onClick={() => setShowAiRecs(false)} 
                      className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="leading-relaxed font-sans text-slate-200">
                    {language === 'hi' ? aiRecsExplanation.explanationHi : aiRecsExplanation.explanation}
                  </p>
                  <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold uppercase tracking-wide text-[9px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900/40">
                        {language === 'en' ? 'Maudaha Demand Alert' : 'मौदहा डिमांड अलर्ट'}
                      </span>
                      <span className="italic">
                        {language === 'hi' ? aiRecsExplanation.marketTrendAlertHi : aiRecsExplanation.marketTrendAlert}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid with 2 columns: Handpicked For You vs Hot Selling Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                
                {/* Section A: Handpicked personalized items */}
                <div className="space-y-3">
                  <div className="border-b border-slate-200 pb-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>{language === 'en' ? 'Handpicked for You' : 'आपके लिए चुनिंदा सामान'}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded-full lowercase">
                        {language === 'en' ? 'custom match' : 'अनुकूल'}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'en' ? 'Based on your watchlists, searches & order habits' : 'आपकी वॉचलिस्ट, खोज और ऑर्डर की आदतों के आधार पर'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendationsData.personalized.map((prod) => {
                      const itemStore = stores.find(s => s.id === prod.storeId);
                      return (
                        <div key={prod.id} className="bg-white border border-slate-200/60 rounded-2xl p-3 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-300 group">
                          <div>
                            <div className="relative aspect-video rounded-xl bg-slate-50 overflow-hidden mb-2">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">🥦</div>
                              )}
                              <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-xs">
                                ★ {prod.rating}
                              </span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                              🏪 {language === 'hi' ? itemStore?.nameHi : itemStore?.name}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-800 truncate mt-0.5">
                              {language === 'hi' ? prod.nameHi : prod.name}
                            </h4>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-emerald-600">
                              ₹{prod.price} <span className="text-[9px] text-slate-400 font-medium">/{language === 'hi' ? prod.unitHi : prod.unit}</span>
                            </span>
                            <button
                              onClick={() => {
                                onAddToCart(prod.storeId, prod);
                                const actUser = users.find(u => u.id === activeUserId);
                                if (actUser) {
                                  const updatedUsers = users.map(u => {
                                    if (u.id === activeUserId) {
                                      const newAct = {
                                        id: 'act-' + Date.now(),
                                        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US'),
                                        action: `Added smart pick "${prod.name}" to cart`,
                                        actionHi: `स्मार्ट पिक "${prod.nameHi}" को कार्ट में जोड़ा`
                                      };
                                      return { ...u, activities: [newAct, ...(u.activities || [])] };
                                    }
                                    return u;
                                  });
                                  onUpdateUsers(updatedUsers);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.95] text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{language === 'en' ? 'Add' : 'जोड़ें'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: Global selling trends */}
                <div className="space-y-3">
                  <div className="border-b border-slate-200 pb-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>📈</span>
                      <span>{language === 'en' ? 'Trending in Maudaha' : 'मौदहा में लोकप्रिय'}</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.2 rounded-full lowercase">
                        {language === 'en' ? 'high demand' : 'उच्च मांग'}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'en' ? 'Most frequently ordered items this week across town' : 'इस सप्ताह पूरे शहर में सबसे अधिक बार ऑर्डर की गई सामग्री'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendationsData.trending.map((prod) => {
                      const itemStore = stores.find(s => s.id === prod.storeId);
                      return (
                        <div key={prod.id} className="bg-white border border-slate-200/60 rounded-2xl p-3 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-300 group">
                          <div>
                            <div className="relative aspect-video rounded-xl bg-slate-50 overflow-hidden mb-2">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-amber-50 text-amber-700 flex items-center justify-center text-xl">🍊</div>
                              )}
                              <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-xs">
                                {language === 'en' ? 'HOT' : 'पॉपुलर'}
                              </span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                              🏪 {language === 'hi' ? itemStore?.nameHi : itemStore?.name}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-800 truncate mt-0.5">
                              {language === 'hi' ? prod.nameHi : prod.name}
                            </h4>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-emerald-600">
                              ₹{prod.price} <span className="text-[9px] text-slate-400 font-medium">/{language === 'hi' ? prod.unitHi : prod.unit}</span>
                            </span>
                            <button
                              onClick={() => {
                                onAddToCart(prod.storeId, prod);
                                const actUser = users.find(u => u.id === activeUserId);
                                if (actUser) {
                                  const updatedUsers = users.map(u => {
                                    if (u.id === activeUserId) {
                                      const newAct = {
                                        id: 'act-' + Date.now(),
                                        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US'),
                                        action: `Added trending product "${prod.name}" to cart`,
                                        actionHi: `ट्रेंडिंग उत्पाद "${prod.nameHi}" को कार्ट में जोड़ा`
                                      };
                                      return { ...u, activities: [newAct, ...(u.activities || [])] };
                                    }
                                    return u;
                                  });
                                  onUpdateUsers(updatedUsers);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.95] text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{language === 'en' ? 'Add' : 'जोड़ें'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Popular Stores Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold font-display text-slate-800 tracking-tight">
                {t.popularStores}
              </h2>

              {filteredStores.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs font-black text-slate-400">
                  {language === 'en' ? 'No local Maudaha stores match your search.' : 'आपकी खोज से मेल खाने वाली कोई स्थानीय मौदहा दुकान नहीं मिली।'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredStores.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSelectStore(s.id)}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-500/30 hover:translate-y-[-4px] transition-all duration-300 cursor-pointer flex flex-col h-full group"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={s.banner}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                          <span className="text-amber-500">★</span>
                          <span className="text-slate-800">{s.rating}</span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-base text-slate-800 tracking-tight group-hover:text-emerald-600 transition duration-200">
                            {language === 'hi' ? s.nameHi : s.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                            <span className="truncate">{language === 'hi' ? s.addressHi : s.address}</span>
                          </p>
                          
                          {/* Categories badge list */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {(s.categories || []).slice(0, 2).map((cat) => (
                              <span key={cat} className="text-[10px] bg-slate-50 text-slate-500 font-extrabold px-2 py-0.5 rounded-md border border-slate-100">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Clock className="h-4 w-4 text-slate-300" />
                            {language === 'hi' ? s.deliveryTimeHi : s.deliveryTime}
                          </span>
                          <span className="font-semibold">
                            {t.minOrder}: <strong className="text-slate-800 font-extrabold">₹{s.minOrder}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Zone Map Section */}
            <DeliveryZoneMap language={language} />

            {/* Watchlist Section - Only if they have items in their watchlist */}
            {watchlist.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-3xl p-6 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">
                      {language === 'en' ? 'My Starred Watchlist' : 'मेरी पसंदीदा वॉचलिस्ट'} 
                      <span className="text-amber-700 ml-1.5 text-sm font-mono font-bold">({watchlist.length} items)</span>
                    </h2>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {language === 'en' ? 'Tracked Live' : 'लाइव ट्रैक किया गया'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {products.filter(p => watchlist.includes(p.id)).map(p => {
                    const store = stores.find(s => s.id === p.storeId);
                    return (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between h-full hover:shadow-md transition">
                        <div>
                          <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2.5 border border-slate-100">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => handleToggleWatchlist(p.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-amber-400 text-slate-900 rounded-full border border-amber-300 shadow-xs cursor-pointer hover:bg-amber-500"
                              title={language === 'en' ? 'Remove' : 'हटाएं'}
                            >
                              <Star className="h-3 w-3 fill-current text-slate-900" />
                            </button>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">
                            {language === 'hi' ? p.nameHi : p.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 block font-medium mt-0.5">
                            🏢 {store ? (language === 'hi' ? store.nameHi : store.name) : 'Local Store'}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 mt-1 animate-pulse">
                              🎁 {language === 'en' ? 'Extra Scratch Discount!' : 'अतिरिक्त स्क्रैच छूट!'}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 line-through block leading-none">₹{p.mrp}</span>
                            <span className="text-sm font-black text-slate-800 font-mono">₹{p.price}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart(p.storeId, p);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            🛒 {language === 'en' ? 'Add' : 'जोड़ें'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          
          // Case B: Store Details & Shopping Portal
          <div className="space-y-8">
            
            {/* Store Breadcrumb Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <button
                  onClick={() => {
                    onSelectStore(null);
                    setSelectedCategory(null);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
                >
                  ← {t.backToBrowsing}
                </button>
                <h2 className="text-2xl font-black font-display text-slate-800 tracking-tight leading-none">
                  {language === 'hi' ? activeStore?.nameHi : activeStore?.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-300" />{language === 'hi' ? activeStore?.addressHi : activeStore?.address}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-300" />{language === 'hi' ? activeStore?.deliveryTimeHi : activeStore?.deliveryTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="text-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{t.rating}</span>
                  <span className="text-lg font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                    <span className="text-amber-500">★</span> {activeStore?.rating}
                  </span>
                </div>
                
                {/* Floating shopping cart visual */}
                {activeStoreCart.length > 0 && (
                  <button
                    onClick={() => setShowCartDrawer(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-40 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 animate-bounce"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>{t.viewCart} ({activeStoreCart.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid: Category and products list vs Shopping cart sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Product selector grid (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Search items inside this store (Fixed higher up) */}
                <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 relative">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={() => setIsStoreSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsStoreSearchFocused(false), 250)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsStoreSearchFocused(true);
                      }}
                      placeholder={language === 'en' ? `Search products inside ${activeStore?.name}...` : `${activeStore?.nameHi} में उत्पादों की खोज करें...`}
                      className="w-full pl-4 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSpeechRecognition((text) => {
                        setSearchQuery(text);
                        setIsStoreSearchFocused(true);
                      })}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening 
                          ? 'bg-rose-500 text-white animate-pulse' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={language === 'en' ? 'Search by voice' : 'आवाज से खोजें'}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsStoreSearchFocused(false);
                        }}
                        className="absolute right-11 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1 hover:bg-slate-100 rounded"
                      >
                        Clear
                      </button>
                    )}

                    {/* Store specific real-time suggestions popover */}
                    {isStoreSearchFocused && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[350px] overflow-y-auto divide-y divide-slate-100/80 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="p-3 bg-slate-50 flex items-center justify-between select-none">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            {searchQuery ? (
                              <>
                                <span>✨</span>
                                <span>{language === 'en' ? 'Matching Store Products' : 'दुकान की मेल खाती सामग्रियां'}</span>
                              </>
                            ) : (
                              <>
                                <span>🔥</span>
                                <span>{language === 'en' ? 'Popular In This Store' : 'इस दुकान की लोकप्रिय सामग्रियां'}</span>
                              </>
                            )}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                            {suggestions.length} {language === 'en' ? 'Available' : 'उपलब्ध'}
                          </span>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-100/60">
                          {suggestions.length === 0 ? (
                            <div className="p-4 text-center text-xs font-bold text-slate-400 italic">
                              {language === 'en' ? 'No store items match your inquiry' : 'इस दुकान में कोई मेल खाती सामग्री नहीं मिली'}
                            </div>
                          ) : (
                            suggestions.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSearchQuery(p.name);
                                  onAddSearch(activeUserId, p.name);
                                  setIsStoreSearchFocused(false);
                                }}
                                className="w-full text-left p-2.5 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-3 group border-0 focus:outline-none focus:bg-slate-50"
                              >
                                <div className="flex items-center gap-3">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0 group-hover:scale-105 transition"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                                      🥦
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-extrabold text-xs text-slate-800 block group-hover:text-emerald-600 transition">
                                      {language === 'hi' ? p.nameHi : p.name}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
                                      <span className="text-[10px] text-slate-400 font-bold">
                                        📁 {language === 'hi' ? p.categoryHi || p.category : p.category}
                                      </span>
                                      {p.originalPrice && (
                                        <span className="text-[8px] bg-amber-500 text-white font-extrabold px-1 rounded-sm animate-pulse">
                                          🎁 {language === 'hi' ? 'विशेष छूट' : 'Extra Scratch Off'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[9px] text-slate-400 line-through block leading-none">
                                    ₹{p.mrp}
                                  </span>
                                  <span className="font-mono text-xs font-black text-emerald-600 block">
                                    ₹{p.price} <span className="text-[9px] text-slate-400 font-medium">/{language === 'hi' ? p.unitHi : p.unit}</span>
                                  </span>
                                  <div className="flex items-center justify-end gap-1 mt-0.5">
                                    <span className="text-[9px] bg-amber-50 text-amber-600 px-1 py-0.2 rounded font-black border border-amber-200/40 flex items-center gap-0.5">
                                      ★ {p.rating}
                                    </span>
                                    {p.stock <= 5 && (
                                      <span className="text-[8px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded font-extrabold border border-rose-200/40">
                                        {language === 'hi' ? 'सीमित' : 'Low Stock'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 uppercase shrink-0 font-mono tracking-wider"
                  >
                    <span>🔍</span>
                    <span>{language === 'en' ? 'Audit Search' : 'खोजें'}</span>
                  </button>
                </form>

                {/* Category Horizontal list */}
                <div className="flex gap-2 overflow-x-auto pb-2 pr-1 scrollbar-thin">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowWatchlistOnly(false);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      !selectedCategory && !showWatchlistOnly
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'en' ? 'All Items' : 'सभी सामग्री'}
                  </button>

                  <button
                    onClick={() => {
                      setShowWatchlistOnly(!showWatchlistOnly);
                      setSelectedCategory(null);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                      showWatchlistOnly
                        ? 'bg-amber-500 text-slate-900 border-amber-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>⭐</span>
                    <span>{language === 'en' ? 'Watchlist' : 'वॉचलिस्ट'}</span>
                    {watchlist.length > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black rounded-full px-1.5 py-0.2">
                        {products.filter(p => p.storeId === selectedStoreId && watchlist.includes(p.id)).length}
                      </span>
                    )}
                  </button>

                  {(activeStore?.categories || []).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowWatchlistOnly(false);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                    {language === 'en' ? 'No products available in this category currently.' : 'इस श्रेणी में फिलहाल कोई सामग्री उपलब्ध नहीं है।'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => {
                      const cartItem = activeStoreCart.find(it => it.product.id === p.id);
                      const isOutOfStock = p.stock === 0;

                      return (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-emerald-500/20 transition flex flex-col justify-between h-full group">
                          <div>
                            <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3.5 relative border border-slate-100">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleWatchlist(p.id);
                                }}
                                className={`absolute top-2 right-2 p-1.5 rounded-full transition-all border shadow-xs z-10 cursor-pointer ${
                                  watchlist.includes(p.id)
                                    ? 'bg-amber-400 text-slate-900 border-amber-300 scale-105'
                                    : 'bg-white/90 text-slate-400 border-slate-200 hover:text-amber-500 hover:bg-white'
                                }`}
                                title={watchlist.includes(p.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                              >
                                <Star className={`h-3.5 w-3.5 ${watchlist.includes(p.id) ? 'fill-current text-slate-900' : 'text-slate-400'}`} />
                              </button>
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center">
                                  <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {t.outOfStock}
                                  </span>
                                </div>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug">
                              {language === 'hi' ? p.nameHi : p.name}
                            </h4>
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium inline-block">
                                  {language === 'hi' ? p.unitHi : p.unit}
                                </span>
                                {p.originalPrice && (
                                  <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 animate-pulse">
                                    🎁 {language === 'en' ? 'Scratch Card Applied!' : 'स्क्रैच कूपन लागू!'}
                                  </span>
                                )}
                              </div>
                              
                              {(p.warrantyPeriod || p.replacementPolicy) && (
                                <div className="flex flex-col gap-0.5 mt-0.5">
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
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">MRP: <span className="line-through">₹{p.mrp}</span></span>
                              <span className="text-base font-black text-slate-800 font-mono">₹{p.price}</span>
                            </div>

                            {/* Add / Qty selectors */}
                            {isOutOfStock ? (
                              <button
                                disabled
                                className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold"
                              >
                                {t.outOfStock}
                              </button>
                            ) : cartItem ? (
                              <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-2.5 py-1">
                                <button
                                  onClick={() => onRemoveFromCart(selectedStoreId!, p.id)}
                                  className="text-emerald-700 hover:bg-emerald-100 p-0.5 rounded-xs"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-mono font-bold text-xs">{cartItem.quantity}</span>
                                <button
                                  onClick={() => onAddToCart(selectedStoreId!, p)}
                                  className="text-emerald-700 hover:bg-emerald-100 p-0.5 rounded-xs"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onAddToCart(selectedStoreId!, p)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-[0.96]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                {t.addToCart}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Shopping Cart Drawer / Panel (4 cols) */}
              <div className={`lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 lg:sticky lg:top-24 fixed lg:static inset-0 z-50 lg:z-auto transition-transform duration-300 ${showCartDrawer ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:h-auto overflow-y-auto lg:overflow-visible`}>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    {t.cart} ({activeStoreCart.length})
                  </h3>
                  <div className="flex items-center gap-4">
                    {activeStoreCart.length > 0 && (
                      <button
                        onClick={() => onClearCart(selectedStoreId!)}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        {language === 'en' ? 'Clear' : 'साफ करें'}
                      </button>
                    )}
                    <button onClick={() => setShowCartDrawer(false)} className="lg:hidden text-slate-400 hover:text-slate-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {activeStoreCart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    {t.cartEmpty}
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Cart Items List */}
                    <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto pr-1">
                      {activeStoreCart.map((item) => (
                        <div key={item.product.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4 text-xs">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">
                              {language === 'hi' ? item.product.nameHi : item.product.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              ₹{item.product.price} / {item.product.unit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onRemoveFromCart(selectedStoreId!, item.product.id)}
                              className="text-slate-400 hover:text-emerald-600 p-0.5"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-mono font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => onAddToCart(selectedStoreId!, item.product)}
                              className="text-slate-400 hover:text-emerald-600 p-0.5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <span className="font-mono font-bold text-slate-800 w-12 text-right">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                     {/* Promo Codes & Coupons input */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">
                          {language === 'en' ? 'Apply Promo Coupon' : 'कूपन लागू करें'}
                        </label>
                        {couponDiscount > 0 && (
                          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-pulse">
                            ✨ {language === 'en' ? 'Discount Applied!' : 'छूट लागू!'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative flex-1 rounded-xl border border-slate-200 bg-white">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder={language === 'en' ? "e.g. MAUMANGO" : "जैसे MAUMANGO"}
                            className="w-full py-1.5 pl-8 pr-3 text-xs font-mono font-bold focus:outline-none text-slate-700 uppercase"
                          />
                        </div>
                        {couponDiscount > 0 ? (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            {language === 'en' ? 'Remove' : 'हटाएं'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer active:scale-95"
                          >
                            {language === 'en' ? 'Apply' : 'लागू करें'}
                          </button>
                        )}
                      </div>

                      {/* Interactive click-to-apply buttons for available codes */}
                      {notifications.filter(n => n.type === 'discount' && n.code).length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-slate-400">
                            {language === 'en' ? 'TAP TO APPLY ACTIVE OFFERS:' : 'ऑफ़र लागू करने के लिए टैप करें:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {notifications.filter(n => n.type === 'discount' && n.code).map(n => {
                              const isThisApplied = couponDiscount > 0 && couponCode.trim().toUpperCase() === n.code?.toUpperCase();
                              return (
                                <button
                                  key={n.id}
                                  type="button"
                                  onClick={() => {
                                    if (isThisApplied) {
                                      handleRemoveCoupon();
                                    } else {
                                      handleApplyCoupon(n.code);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all border flex items-center gap-1 cursor-pointer ${
                                    isThisApplied
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="font-mono uppercase">{n.code}</span>
                                  <span className="text-slate-300 font-normal">|</span>
                                  <span className={isThisApplied ? 'text-emerald-700' : 'text-slate-500'}>₹{n.discountAmount} Off</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Loyalty coins checkbox */}
                    {loyalty.points > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="use-coins-chk"
                          checked={useCoinsState}
                          onChange={(e) => onUseCoins(e.target.checked)}
                          className="mt-0.5 text-amber-500 focus:ring-amber-500 rounded-sm"
                        />
                        <label htmlFor="use-coins-chk" className="text-xs text-slate-700 leading-normal select-none">
                          {t.redeemCoins}<strong>{coinsRedeemValue}</strong>{' '}
                          ({language === 'en' ? `from ${loyalty.points} coins` : `${loyalty.points} कॉइन्स में से`})
                        </label>
                      </div>
                    )}

                    {/* Cart Pricing summary */}
                    <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>{t.subtotal}</span>
                        <span className="font-mono font-medium">₹{subtotal}</span>
                      </div>
                      
                      {finalDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>{t.discount}</span>
                          <span className="font-mono">-₹{finalDiscount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-500">
                        <span>{t.deliveryFee}</span>
                        <span className="font-mono">
                          {deliveryFee === 0 ? <strong className="text-emerald-600">{t.free}</strong> : `₹${deliveryFee}`}
                        </span>
                      </div>

                      {deliveryFee > 0 && (
                        <p className="text-[10px] text-slate-400">
                          {language === 'en' ? 'Add ₹' + (minFreeDelivery - subtotal) + ' more for FREE delivery!' : 'मुफ़्त डिलीवरी के लिए ₹' + (minFreeDelivery - subtotal) + ' और जोड़ें!'}
                        </p>
                      )}

                      <div className="flex justify-between text-sm font-black text-slate-800 pt-2 border-t border-slate-100">
                        <span>{t.grandTotal}</span>
                        <span className="font-mono">₹{grandTotal}</span>
                      </div>
                    </div>

                    {/* Instant Checkout form details */}
                    <div className="pt-4 border-t border-slate-100 space-y-3.5">
                      <h4 className="font-extrabold text-xs text-slate-800">{t.checkout}</h4>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.deliveryAddress}</label>
                        <textarea
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="e.g. Station Road, Near Chacha Chauraha, Maudaha or Sector 62, Noida, UP"
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.selectPayment}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('UPI')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                              paymentMethod === 'UPI'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            UPI
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('COD')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                              paymentMethod === 'COD'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            COD
                          </button>
                        </div>
                      </div>

                      {/* Display Coins Earnings */}
                      <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        ✨ {t.coinsEarnedMsg.replace('{coins}', Math.floor(subtotal / 20).toString())}
                      </p>

                      <button
                        onClick={handleCheckoutBtn}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/10 active:scale-[0.98]"
                      >
                        <span>{t.placeOrder}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* UPI QR Payment Modal integration */}
      {showUpiCheckout && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowUpiCheckout(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-extrabold font-mono text-base transition-colors duration-150 z-50"
            >
              ✕
            </button>
            <div className="p-1">
              <div className="bg-emerald-600 text-white p-5 text-center rounded-t-2xl">
                <span className="text-[10px] font-black tracking-widest font-mono uppercase opacity-85">Maudaha Mart UPI Gateway</span>
                <p className="text-2xl font-black mt-1">₹{grandTotal}</p>
              </div>
              <div className="p-5">
                <UPIPayment
                  amount={grandTotal}
                  onPaymentSuccess={(confirmedUpiId) => {
                    executeCheckout(confirmedUpiId);
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
