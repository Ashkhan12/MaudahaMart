/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { ClothingBoutique, ClothingItem, Language } from '../types';

interface AdminFashionPanelProps {
  boutiques: ClothingBoutique[];
  onUpdateBoutiques: (boutiques: ClothingBoutique[]) => void;
  language: Language;
}

export default function AdminFashionPanel({
  boutiques,
  onUpdateBoutiques,
  language
}: AdminFashionPanelProps) {
  const [selectedBoutiqueItemsToManage, setSelectedBoutiqueItemsToManage] = useState<ClothingBoutique | null>(null);

  // Admin Fashion Panel States
  const [showAddBoutiqueModal, setShowAddBoutiqueModal] = useState(false);
  const [showEditBoutiqueModal, setShowEditBoutiqueModal] = useState(false);
  const [selectedBoutiqueToEdit, setSelectedBoutiqueToEdit] = useState<ClothingBoutique | null>(null);

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
  const [btShopType, setBtShopType] = useState<'boutique' | 'jewellery' | 'footwear'>('boutique');

  // Clothing Item form fields
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

  // Handlers for Boutiques
  const handleAddBoutique = (e: React.FormEvent) => {
    e.preventDefault();
    const newBt: ClothingBoutique = {
      id: 'bt-' + Date.now(),
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
      rating: 4.6,
      items: [],
      shopType: btShopType
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
          nameHi: btNameHi || btName,
          address: btAddress,
          addressHi: btAddressHi || btAddress,
          specialty: btSpecialty,
          specialtyHi: btSpecialtyHi || btSpecialty,
          minOrder: Number(btMinOrder),
          deliveryTime: btDeliveryTime,
          deliveryTimeHi: btDeliveryTimeHi,
          banner: btBanner,
          shopType: btShopType
        };
      }
      return b;
    });
    onUpdateBoutiques(updated);
    setShowEditBoutiqueModal(false);
    setSelectedBoutiqueToEdit(null);
  };

  const handleDeleteBoutique = (id: string) => {
    if (window.confirm(language === 'en' ? 'Delete this boutique?' : 'क्या आप वाकई इस बुटीक को हटाना चाहते हैं?')) {
      onUpdateBoutiques(boutiques.filter(b => b.id !== id));
    }
  };

  const handleManageClothingItemAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoutiqueItemsToManage) return;
    const sizeArr = clothItemSizes.split(',').map(s => s.trim()).filter(Boolean);
    const newItem: ClothingItem = {
      id: 'cloth-' + Date.now(),
      name: clothItemName,
      nameHi: clothItemNameHi || clothItemName,
      price: Number(clothItemPrice),
      category: clothItemCategory,
      image: clothItemImage,
      description: clothItemDesc,
      descriptionHi: clothItemDescHi || clothItemDesc,
      sizes: sizeArr,
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
    setClothItemName(''); setClothItemNameHi(''); setClothItemPrice(499); setClothItemDesc(''); setClothItemDescHi(''); setClothItemSizes('S, M, L, XL'); setClothItemHasStitching(false);
  };

  const handleManageClothingItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoutiqueItemsToManage || !selectedClothingItemToEdit) return;
    const sizeArr = clothItemSizes.split(',').map(s => s.trim()).filter(Boolean);
    const updatedBoutiques = boutiques.map(b => {
      if (b.id === selectedBoutiqueItemsToManage.id) {
        const updatedItems = b.items.map(item => {
          if (item.id === selectedClothingItemToEdit.id) {
            return {
              ...item,
              name: clothItemName,
              nameHi: clothItemNameHi || clothItemName,
              price: Number(clothItemPrice),
              category: clothItemCategory,
              image: clothItemImage,
              description: clothItemDesc,
              descriptionHi: clothItemDescHi || clothItemDesc,
              sizes: sizeArr,
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

  return (
    <div className="space-y-6">
      {!selectedBoutiqueItemsToManage ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                {language === 'en' ? 'Manage Fashion Shops' : 'फैशन की दुकानें प्रबंधित करें'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {language === 'en'
                  ? 'Add, edit, or remove local boutiques, jewelry shops, footwear outlets, and manage their catalogs.'
                  : 'स्थानीय बुटीक, आभूषण की दुकानों, फुटवियर आउटलेट जोड़ें, संपादित करें या हटाएं और उनके कैटलॉग प्रबंधित करें।'}
              </p>
            </div>
            <button
              onClick={() => {
                setBtName('');
                setBtNameHi('');
                setBtAddress('');
                setBtAddressHi('');
                setBtSpecialty('');
                setBtSpecialtyHi('');
                setBtMinOrder(300);
                setBtDeliveryTime('2-3 Days');
                setBtDeliveryTimeHi('2-3 दिन');
                setBtBanner('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop');
                setBtShopType('boutique');
                setShowAddBoutiqueModal(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Add Boutique/Shop' : 'दुकान जोड़ें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boutiques.map((bt) => (
              <div key={bt.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col sm:flex-row">
                <img src={bt.banner} alt={bt.name} className="h-32 sm:h-auto sm:w-40 object-cover" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        {language === 'hi' ? bt.nameHi : bt.name}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-bold lowercase">
                        #{bt.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      📍 {language === 'hi' ? bt.addressHi : bt.address}
                    </p>
                    <p className="text-xs text-purple-600 mt-1 font-bold">
                      ✨ {language === 'hi' ? bt.specialtyHi : bt.specialty}
                    </p>
                    <div className="flex gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-md font-bold">Min: ₹{bt.minOrder}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded-md font-bold uppercase text-[9px]">Type: {bt.shopType || 'boutique'}</span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-0.5">★ {bt.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                    <button
                      onClick={() => setSelectedBoutiqueItemsToManage(bt)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                    >
                      👗 {language === 'en' ? 'Manage Catalog' : 'सामग्री प्रबंधित करें'} ({bt.items?.length || 0})
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedBoutiqueToEdit(bt);
                          setBtName(bt.name);
                          setBtNameHi(bt.nameHi);
                          setBtAddress(bt.address);
                          setBtAddressHi(bt.addressHi);
                          setBtSpecialty(bt.specialty);
                          setBtSpecialtyHi(bt.specialtyHi);
                          setBtMinOrder(bt.minOrder);
                          setBtDeliveryTime(bt.deliveryTime);
                          setBtDeliveryTimeHi(bt.deliveryTimeHi);
                          setBtBanner(bt.banner);
                          setBtShopType(bt.shopType || 'boutique');
                          setShowEditBoutiqueModal(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition cursor-pointer"
                        title="Edit Boutique"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBoutique(bt.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                        title="Delete Boutique"
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
        /* Manage Fashion Products Catalog */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <button
                onClick={() => setSelectedBoutiqueItemsToManage(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-extrabold flex items-center gap-1 transition mb-1 cursor-pointer"
              >
                ← {language === 'en' ? 'Back to Shops' : 'वापस जाएं'}
              </button>
              <h3 className="text-base font-extrabold text-slate-800">
                {language === 'en' ? 'Clothing & Accessories' : 'कपड़े और सहायक उपकरण'}: {language === 'hi' ? selectedBoutiqueItemsToManage.nameHi : selectedBoutiqueItemsToManage.name}
              </h3>
            </div>
            <button
              onClick={() => {
                setClothItemName('');
                setClothItemNameHi('');
                setClothItemPrice(499);
                setClothItemCategory('ethnic');
                setClothItemImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=250&auto=format&fit=crop');
                setClothItemDesc('');
                setClothItemDescHi('');
                setClothItemSizes('S, M, L, XL');
                setClothItemHasStitching(false);
                setShowAddClothingItemModal(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Add Fashion Item' : 'सामग्री जोड़ें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(selectedBoutiqueItemsToManage.items || []).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm transition">
                <div className="relative">
                  <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-300">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm">{language === 'hi' ? item.nameHi : item.name}</h4>
                      <span className="font-extrabold text-purple-600 text-xs">₹{item.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {language === 'hi' ? item.descriptionHi : item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2 text-[9px]">
                      {(item.sizes || []).map(sz => (
                        <span key={sz} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{sz}</span>
                      ))}
                      {item.hasStitchingOption && (
                        <span className="bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-bold">✂️ Stitching</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">#{item.id}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedClothingItemToEdit(item);
                          setClothItemName(item.name);
                          setClothItemNameHi(item.nameHi);
                          setClothItemPrice(item.price);
                          setClothItemCategory(item.category);
                          setClothItemImage(item.image);
                          setClothItemDesc(item.description);
                          setClothItemDescHi(item.descriptionHi);
                          setClothItemSizes(item.sizes?.join(', ') || 'S, M, L, XL');
                          setClothItemHasStitching(!!item.hasStitchingOption);
                          setShowEditClothingItemModal(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleManageItemDelete(item.id)}
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

      {/* Add Boutique Modal */}
      {showAddBoutiqueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">🛍️ {language === 'en' ? 'Add Boutique/Shop' : 'नई दुकान जोड़ें'}</h3>
              <button onClick={() => setShowAddBoutiqueModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddBoutique} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={btName} onChange={e => setBtName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Specialty/Type</label>
                <input required type="text" value={btSpecialty} onChange={e => setBtSpecialty(e.target.value)} placeholder="Sarees, Custom Boutique" className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Min Order Amount (₹)</label>
                  <input required type="number" value={btMinOrder} onChange={e => setBtMinOrder(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Shop Type</label>
                  <select value={btShopType} onChange={e => setBtShopType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 animate-none">
                    <option value="boutique">Boutique</option>
                    <option value="jewellery">Jewellery</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Address</label>
                <input required type="text" value={btAddress} onChange={e => setBtAddress(e.target.value)} placeholder="Naya Bazar, Maudaha" className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Banner Image URL</label>
                <input required type="text" value={btBanner} onChange={e => setBtBanner(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddBoutiqueModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Create' : 'बनाएं'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Boutique Modal */}
      {showEditBoutiqueModal && selectedBoutiqueToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">📝 {language === 'en' ? 'Edit Boutique/Shop' : 'दुकान संपादित करें'}</h3>
              <button onClick={() => setShowEditBoutiqueModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditBoutique} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={btName} onChange={e => setBtName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Specialty/Type</label>
                <input required type="text" value={btSpecialty} onChange={e => setBtSpecialty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Min Order (₹)</label>
                  <input required type="number" value={btMinOrder} onChange={e => setBtMinOrder(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Shop Type</label>
                  <select value={btShopType} onChange={e => setBtShopType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500">
                    <option value="boutique">Boutique</option>
                    <option value="jewellery">Jewellery</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Address</label>
                <input required type="text" value={btAddress} onChange={e => setBtAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Banner URL</label>
                <input required type="text" value={btBanner} onChange={e => setBtBanner(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowEditBoutiqueModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Save Changes' : 'बदलाव सहेजें'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Clothing/Apparel Item Modal */}
      {showAddClothingItemModal && selectedBoutiqueItemsToManage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">👗 {language === 'en' ? 'Add Fashion Item' : 'नया फैशन सामान जोड़ें'}</h3>
              <button onClick={() => setShowAddClothingItemModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleManageClothingItemAdd} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={clothItemName} onChange={e => setClothItemName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Price (₹)</label>
                  <input required type="number" value={clothItemPrice} onChange={e => setClothItemPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Category</label>
                  <select value={clothItemCategory} onChange={e => setClothItemCategory(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500">
                    <option value="ethnic">Ethnic Wear</option>
                    <option value="western">Western Wear</option>
                    <option value="kids">Kids Wear</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                    <option value="jewellery">Jewellery</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Sizes (comma sep)</label>
                  <input required type="text" value={clothItemSizes} onChange={e => setClothItemSizes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={clothItemHasStitching} onChange={e => setClothItemHasStitching(e.target.checked)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded animate-none" />
                  <label className="text-xs text-slate-700 font-bold">Stitching Available</label>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Image URL</label>
                <input required type="text" value={clothItemImage} onChange={e => setClothItemImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Description</label>
                <textarea value={clothItemDesc} onChange={e => setClothItemDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 h-16 resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddClothingItemModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Add Item' : 'जोड़ें'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Clothing/Apparel Item Modal */}
      {showEditClothingItemModal && selectedBoutiqueItemsToManage && selectedClothingItemToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">📝 {language === 'en' ? 'Edit Fashion Item' : 'सामग्री संपादित करें'}</h3>
              <button onClick={() => setShowEditClothingItemModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleManageClothingItemEdit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Name</label>
                <input required type="text" value={clothItemName} onChange={e => setClothItemName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Price (₹)</label>
                  <input required type="number" value={clothItemPrice} onChange={e => setClothItemPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Category</label>
                  <select value={clothItemCategory} onChange={e => setClothItemCategory(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500">
                    <option value="ethnic">Ethnic Wear</option>
                    <option value="western">Western Wear</option>
                    <option value="kids">Kids Wear</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                    <option value="jewellery">Jewellery</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Sizes (comma sep)</label>
                  <input required type="text" value={clothItemSizes} onChange={e => setClothItemSizes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={clothItemHasStitching} onChange={e => setClothItemHasStitching(e.target.checked)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded" />
                  <label className="text-xs text-slate-700 font-bold">Stitching Available</label>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Image URL</label>
                <input required type="text" value={clothItemImage} onChange={e => setClothItemImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Description</label>
                <textarea value={clothItemDesc} onChange={e => setClothItemDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 h-16 resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowEditClothingItemModal(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">{language === 'en' ? 'Cancel' : 'रद्द करें'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">{language === 'en' ? 'Save Changes' : 'बदलाव सहेजें'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
