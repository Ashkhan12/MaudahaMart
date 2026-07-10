/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Restaurant, RestaurantMenuItem, Language } from '../types';

interface AdminFoodPanelProps {
  restaurants: Restaurant[];
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  language: Language;
}

export default function AdminFoodPanel({
  restaurants,
  onUpdateRestaurants,
  language
}: AdminFoodPanelProps) {
  const [selectedRestaurantMenuToManage, setSelectedRestaurantMenuToManage] = useState<Restaurant | null>(null);

  // Admin Food Panel States
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [selectedRestaurantToEdit, setSelectedRestaurantToEdit] = useState<Restaurant | null>(null);

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
          nameHi: restNameHi || restName,
          address: restAddress,
          addressHi: restAddressHi || restAddress,
          cuisine: restCuisine,
          cuisineHi: restCuisineHi || restCuisine,
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
              nameHi: menuItemNameHi || menuItemName,
              price: Number(menuItemPrice),
              category: menuItemCategory,
              image: menuItemImage,
              description: menuItemDesc,
              descriptionHi: menuItemDescHi || menuItemDesc
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

  return (
    <div className="space-y-6">
      {/* Main Restaurants Section */}
      {!selectedRestaurantMenuToManage ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                {language === 'en' ? 'Manage Restaurants' : 'रेस्टोरेंट प्रबंधित करें'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {language === 'en'
                  ? 'Add, edit, or remove restaurants in Maudaha and configure their digital menus.'
                  : 'मौदहा में रेस्टोरेंट जोड़ें, संपादित करें या हटाएं और उनके डिजिटल मेनू को कॉन्फ़िगर करें।'}
              </p>
            </div>
            <button
              onClick={() => {
                setRestName('');
                setRestNameHi('');
                setRestAddress('');
                setRestAddressHi('');
                setRestCuisine('');
                setRestCuisineHi('');
                setRestMinOrder(100);
                setRestDeliveryTime('20-30 mins');
                setRestDeliveryTimeHi('20-30 मिनट');
                setRestBanner('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop');
                setShowAddRestaurantModal(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Add Restaurant' : 'रेस्टोरेंट जोड़ें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((rest) => (
              <div key={rest.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col sm:flex-row">
                <img src={rest.banner} alt={rest.name} className="h-32 sm:h-auto sm:w-40 object-cover" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        {language === 'hi' ? rest.nameHi : rest.name}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-bold lowercase">
                        #{rest.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      📍 {language === 'hi' ? rest.addressHi : rest.address}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 font-bold">
                      🍲 {language === 'hi' ? rest.cuisineHi : rest.cuisine}
                    </p>
                    <div className="flex gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-md font-bold">Min: ₹{rest.minOrder}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded-md font-bold">Time: {language === 'hi' ? rest.deliveryTimeHi : rest.deliveryTime}</span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-0.5">★ {rest.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                    <button
                      onClick={() => setSelectedRestaurantMenuToManage(rest)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                    >
                      🍴 {language === 'en' ? 'Manage Menu' : 'मेनू प्रबंधित करें'} ({rest.menu?.length || 0})
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedRestaurantToEdit(rest);
                          setRestName(rest.name);
                          setRestNameHi(rest.nameHi);
                          setRestAddress(rest.address);
                          setRestAddressHi(rest.addressHi);
                          setRestCuisine(rest.cuisine);
                          setRestCuisineHi(rest.cuisineHi);
                          setRestMinOrder(rest.minOrder);
                          setRestDeliveryTime(rest.deliveryTime);
                          setRestDeliveryTimeHi(rest.deliveryTimeHi);
                          setRestBanner(rest.banner);
                          setShowEditRestaurantModal(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition cursor-pointer"
                        title="Edit Restaurant"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(rest.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                        title="Delete Restaurant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Manage Digital Menu Section */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <button
                onClick={() => setSelectedRestaurantMenuToManage(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-extrabold flex items-center gap-1 transition mb-1 cursor-pointer"
              >
                ← {language === 'en' ? 'Back to Restaurants' : 'वापस जाएं'}
              </button>
              <h3 className="text-base font-extrabold text-slate-800">
                {language === 'en' ? 'Digital Menu' : 'डिजिटल मेनू'}: {language === 'hi' ? selectedRestaurantMenuToManage.nameHi : selectedRestaurantMenuToManage.name}
              </h3>
            </div>
            <button
              onClick={() => {
                setMenuItemName('');
                setMenuItemNameHi('');
                setMenuItemPrice(100);
                setMenuItemCategory('veg');
                setMenuItemImage('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop');
                setMenuItemDesc('');
                setMenuItemDescHi('');
                setShowAddMenuItemModal(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Add Food Item' : 'सामग्री जोड़ें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(selectedRestaurantMenuToManage.menu || []).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm transition">
                <div className="relative">
                  <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    item.category === 'veg' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {item.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm">{language === 'hi' ? item.nameHi : item.name}</h4>
                      <span className="font-extrabold text-emerald-600 text-xs">₹{item.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {language === 'hi' ? item.descriptionHi : item.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">#{item.id}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedMenuItemToEdit(item);
                          setMenuItemName(item.name);
                          setMenuItemNameHi(item.nameHi);
                          setMenuItemPrice(item.price);
                          setMenuItemCategory(item.category);
                          setMenuItemImage(item.image);
                          setMenuItemDesc(item.description);
                          setMenuItemDescHi(item.descriptionHi);
                          setShowEditMenuItemModal(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleManageMenuDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">🍔 {language === 'en' ? 'Add Restaurant' : 'नया रेस्टोरेंट जोड़ें'}</h3>
              <button onClick={() => setShowAddRestaurantModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddRestaurant} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={restName} onChange={e => setRestName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Cuisine</label>
                <input required type="text" value={restCuisine} onChange={e => setRestCuisine(e.target.value)} placeholder="North Indian, Sweets" className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Min Order Amount (₹)</label>
                  <input required type="number" value={restMinOrder} onChange={e => setRestMinOrder(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Banner Image URL</label>
                  <input required type="text" value={restBanner} onChange={e => setRestBanner(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Address</label>
                <input required type="text" value={restAddress} onChange={e => setRestAddress(e.target.value)} placeholder="Station Road, Maudaha" className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddRestaurantModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Create' : 'बनाएं'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditRestaurantModal && selectedRestaurantToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">📝 {language === 'en' ? 'Edit Restaurant' : 'रेस्टोरेंट संपादित करें'}</h3>
              <button onClick={() => setShowEditRestaurantModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditRestaurant} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={restName} onChange={e => setRestName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Cuisine</label>
                <input required type="text" value={restCuisine} onChange={e => setRestCuisine(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Min Order (₹)</label>
                  <input required type="number" value={restMinOrder} onChange={e => setRestMinOrder(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Banner URL</label>
                  <input required type="text" value={restBanner} onChange={e => setRestBanner(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Address</label>
                <input required type="text" value={restAddress} onChange={e => setRestAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowEditRestaurantModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Save Changes' : 'बदलाव सहेजें'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuItemModal && selectedRestaurantMenuToManage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">🍲 {language === 'en' ? 'Add Menu Item' : 'नया व्यंजन जोड़ें'}</h3>
              <button onClick={() => setShowAddMenuItemModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleManageMenuAdd} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={menuItemName} onChange={e => setMenuItemName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Price (₹)</label>
                  <input required type="number" value={menuItemPrice} onChange={e => setMenuItemPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Category</label>
                  <select value={menuItemCategory} onChange={e => setMenuItemCategory(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500">
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="sweet">Sweet</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Image URL</label>
                <input required type="text" value={menuItemImage} onChange={e => setMenuItemImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Description</label>
                <textarea value={menuItemDesc} onChange={e => setMenuItemDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 h-16 resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddMenuItemModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Add Item' : 'जोड़ें'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditMenuItemModal && selectedRestaurantMenuToManage && selectedMenuItemToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">📝 {language === 'en' ? 'Edit Menu Item' : 'व्यंजन संपादित करें'}</h3>
              <button onClick={() => setShowEditMenuItemModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleManageMenuEdit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={menuItemName} onChange={e => setMenuItemName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Price (₹)</label>
                  <input required type="number" value={menuItemPrice} onChange={e => setMenuItemPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Category</label>
                  <select value={menuItemCategory} onChange={e => setMenuItemCategory(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500">
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="sweet">Sweet</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Image URL</label>
                <input required type="text" value={menuItemImage} onChange={e => setMenuItemImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Description</label>
                <textarea value={menuItemDesc} onChange={e => setMenuItemDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 h-16 resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowEditMenuItemModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Save Changes' : 'बदलाव सहेजें'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
