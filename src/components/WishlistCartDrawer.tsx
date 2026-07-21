/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Product, Store, OrderItem, Language, RegisteredUser, SystemSettings } from '../types';

interface WishlistCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'cart' | 'wishlist';
  language: Language;
  products: Product[];
  stores: Store[];
  cart: { [storeId: string]: OrderItem[] };
  watchlist: string[];
  onAddToCart: (storeId: string, product: Product) => void;
  onRemoveFromCart: (storeId: string, productId: string) => void;
  onClearCart: (storeId: string) => void;
  onToggleWatchlist: (productId: string) => void;
  onCheckoutDirectly: (storeId: string) => void;
  settings: SystemSettings;
}

export default function WishlistCartDrawer({
  isOpen,
  onClose,
  initialTab = 'cart',
  language,
  products,
  stores,
  cart,
  watchlist,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onToggleWatchlist,
  onCheckoutDirectly,
  settings
}: WishlistCartDrawerProps) {
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  // 1. Resolve Watchlist Products
  const watchlistProducts = products.filter(p => watchlist.includes(p.id));

  // 2. Group Cart items by store, and verify they exist in catalog
  const storesInCart = Object.keys(cart).filter(storeId => {
    return cart[storeId] && cart[storeId].length > 0;
  });

  const totalCartItemCount = storesInCart.reduce((sum, storeId) => {
    return sum + (cart[storeId]?.reduce((s, it) => s + it.quantity, 0) || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="wishlist-cart-drawer-modal">
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" 
      />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        
        {/* Header Tabs */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl">
            <button type="button"
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition ${
                activeTab === 'cart' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-emerald-600 cursor-pointer" />
              <span>{language === 'en' ? 'Cart' : 'कार्ट'}</span>
              {totalCartItemCount > 0 && (
                <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-full">
                  {totalCartItemCount}
                </span>
              )}
            </button>
            <button type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition ${
                activeTab === 'wishlist' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 cursor-pointer" />
              <span>{language === 'en' ? 'Wishlist' : 'इच्छासूची'}</span>
              {watchlistProducts.length > 0 && (
                <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded-full">
                  {watchlistProducts.length}
                </span>
              )}
            </button>
          </div>

          <button type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {activeTab === 'cart' ? (
            // ================= CART TAB =================
            storesInCart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {language === 'en' ? 'Your cart is empty' : 'आपका कार्ट खाली है'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    {language === 'en' 
                      ? 'Select items from Galla Mandi, Naya Bazar, or any other partner stores and add them here to order.' 
                      : 'गल्ला मंडी, नया बाजार या अन्य पार्टनर स्टोर्स से सामान चुनें और ऑर्डर करने के लिए यहां जोड़ें।'}
                  </p>
                </div>
                <button type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer"
                >
                  {language === 'en' ? 'Start Shopping' : 'खरीदारी शुरू करें'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {storesInCart.map((storeId) => {
                  const store = stores.find(s => s.id === storeId);
                  const items = cart[storeId] || [];
                  const storeSubtotal = items.reduce((sum, it) => sum + (it.product.price * it.quantity), 0);
                  const freeDeliveryLimit = 199;
                  const isFree = storeSubtotal >= freeDeliveryLimit;
                  const progressPct = Math.min(100, (storeSubtotal / freeDeliveryLimit) * 100);

                  return (
                    <div key={storeId} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 shadow-xs">
                      
                      {/* Store Card Header */}
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                        <div>
                          <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block font-mono">Store Outlet</span>
                          <span className="text-sm font-black text-slate-800 block">
                            🏪 {language === 'hi' ? store?.nameHi : store?.name}
                          </span>
                        </div>
                        <button type="button"
                          onClick={() => onClearCart(storeId)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-600 transition cursor-pointer"
                          title={language === 'en' ? 'Clear store cart' : 'कार्ट साफ़ करें'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Items list */}
                      <div className="divide-y divide-slate-100">
                        {items.map((it) => (
                          <div key={it.product.id} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              {it.product.image ? (
                                <img
                                  src={it.product.image}
                                  alt={it.product.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center text-sm shrink-0">
                                  🥦
                                </div>
                              )}
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">
                                  {language === 'hi' ? it.product.nameHi : it.product.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                                  ₹{it.product.price} / {language === 'hi' ? it.product.unitHi : it.product.unit}
                                </span>
                              </div>
                            </div>

                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2">
                              <button type="button"
                                onClick={() => onRemoveFromCart(storeId, it.product.id)}
                                className="h-5 w-5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded flex items-center justify-center text-xs font-bold transition cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-mono text-xs font-black text-slate-700 min-w-3 text-center">
                                {it.quantity}
                              </span>
                              <button type="button"
                                onClick={() => onAddToCart(storeId, it.product)}
                                className="h-5 w-5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded flex items-center justify-center text-xs font-bold transition cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Charge Indicator & Progress */}
                      <div className="space-y-2 border-t border-slate-200/50 pt-3">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">
                            {isFree 
                              ? (language === 'en' ? '🎉 Free Delivery Active!' : '🎉 मुफ्त वितरण सक्रिय है!') 
                              : (language === 'en' ? `Add ₹${Math.ceil(freeDeliveryLimit - storeSubtotal)} more for Free Delivery` : `मुफ्त वितरण के लिए ₹${Math.ceil(freeDeliveryLimit - storeSubtotal)} और जोड़ें`)}
                          </span>
                          <span className="font-mono text-slate-700">₹{storeSubtotal}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Complementary Products Suggestion */}
                      {(() => {
                        const inCartIds = new Set(items.map(it => it.product.id));
                        const cartCategories = new Set(items.map(it => it.product.category));
                        const suggested = products.filter(p => 
                          p.storeId === storeId && 
                          !inCartIds.has(p.id) &&
                          p.stock > 0
                        ).sort((a, b) => {
                          const aCat = cartCategories.has(a.category) ? 1 : 0;
                          const bCat = cartCategories.has(b.category) ? 1 : 0;
                          return bCat - aCat || (b.rating || 0) - (a.rating || 0); // Prefer same category, then rating
                        }).slice(0, 2);

                        if (suggested.length === 0) return null;

                        return (
                          <div className="pt-3 border-t border-slate-200/50">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500" /> 
                              {language === 'en' ? 'Pairs well with your items' : 'इनके साथ अच्छा लगेगा'}
                            </h5>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {suggested.map(p => (
                                <div key={p.id} className="min-w-[120px] bg-white border border-slate-100 rounded-lg p-2 flex flex-col gap-1.5 shadow-sm">
                                  <div className="flex items-center gap-2">
                                    {p.image ? (
                                      <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded-md shrink-0" />
                                    ) : (
                                      <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-xs shrink-0">🛍️</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold text-slate-800 truncate">{language === 'hi' ? (p.nameHi || p.name) : p.name}</p>
                                      <p className="font-mono text-[9px] text-emerald-600 font-bold">₹{p.price}</p>
                                    </div>
                                  </div>
                                  <button type="button"
                                    onClick={() => onAddToCart(storeId, p)}
                                    className="w-full py-1 bg-slate-50 hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded text-[9px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="h-2.5 w-2.5" />
                                    {language === 'en' ? 'Add' : 'जोड़ें'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action direct checkout button */}
                      <button type="button"
                        onClick={() => {
                          onCheckoutDirectly(storeId);
                          onClose();
                        }}
                        className="w-full mt-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{language === 'en' ? 'Checkout Store Order' : 'इस दुकान का ऑर्डर करें'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // ================= WISHLIST TAB =================
            watchlistProducts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center text-3xl">
                  ❤️
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {language === 'en' ? 'Your Wishlist is empty' : 'आपकी इच्छासूची खाली है'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    {language === 'en' 
                      ? 'Save your favorite items here to purchase them easily anytime in the future.' 
                      : 'भविष्य में कभी भी आसानी से खरीदने के लिए अपनी पसंदीदा सामग्रियों को यहां सहेजें।'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 select-none">
                  <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-wider">
                    {language === 'en' ? 'Saved Groceries' : 'सहेजी गई सामग्रियां'}
                  </span>
                  <span className="text-[10px] bg-rose-50 text-rose-600 font-mono font-black px-1.5 py-0.2 rounded">
                    {watchlistProducts.length} Items
                  </span>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {watchlistProducts.map((p) => {
                    const store = stores.find(s => s.id === p.storeId);
                    return (
                      <div key={p.id} className="p-2.5 bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-200 transition">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-11 h-11 object-cover rounded-lg border border-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-11 h-11 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                              ❤️
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 block leading-tight">
                              {language === 'hi' ? p.nameHi : p.name}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-1 font-semibold leading-none">
                              🏪 {language === 'hi' ? store?.nameHi : store?.name}
                            </span>
                            <span className="font-mono text-xs font-black text-emerald-600 mt-1 block">
                              ₹{p.price} <span className="text-[9px] text-slate-400 font-medium">/{language === 'hi' ? p.unitHi : p.unit}</span>
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button type="button"
                            onClick={() => onToggleWatchlist(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
                            title={language === 'en' ? 'Remove from Wishlist' : 'इच्छासूची से हटाएँ'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          
                          <button type="button"
                            onClick={() => {
                              onAddToCart(p.storeId, p);
                              alert(language === 'en' 
                                ? `Added ${p.name} to cart!` 
                                : `कार्ट में ${p.nameHi || p.name} जोड़ा गया!`);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition cursor-pointer"
                          >
                            {language === 'en' ? '+ Add' : '+ जोड़ें'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}
