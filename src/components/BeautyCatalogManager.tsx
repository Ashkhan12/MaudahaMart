/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Eye,
  Scissors,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { BeautyCategoryType, BeautyServiceItem, Language } from '../types';
import { INITIAL_BEAUTY_ITEMS } from '../data';
import ImageUploadControl from './ImageUploadControl';

interface BeautyCatalogManagerProps {
  language: Language;
  parlourId?: string;
  onCatalogChange?: (updatedItems: BeautyServiceItem[]) => void;
}

export const BEAUTY_CATEGORIES: { id: BeautyCategoryType; nameEn: string; nameHi: string; icon: string; bg: string }[] = [
  { id: 'bridal_makeup', nameEn: 'Bridal Makeup', nameHi: 'ब्राइडल मेकअप', icon: '👰', bg: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'side_makeup', nameEn: 'Side Makeup', nameHi: 'साइड मेकअप', icon: '💄', bg: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'bridal_mehendi', nameEn: 'Bridal Mehendi', nameHi: 'ब्राइडल मेहंदी', icon: '🌿', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'side_mehendi', nameEn: 'Side Mehendi', nameHi: 'साइड मेहंदी', icon: '✨', bg: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'bridal_lehenga', nameEn: 'Bridal Lehenga Variety', nameHi: 'ब्राइडल लहंगा वैरायटी', icon: '👗', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'side_lehenga', nameEn: 'Side Lehenga Variety', nameHi: 'साइड लहंगा वैरायटी', icon: '💃', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' }
];

export default function BeautyCatalogManager({ language, parlourId = 'ser1', onCatalogChange }: BeautyCatalogManagerProps) {
  const [items, setItems] = useState<BeautyServiceItem[]>(() => {
    const saved = localStorage.getItem(`mau_beauty_catalog_${parlourId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BEAUTY_ITEMS;
  });

  const [activeTab, setActiveTab] = useState<BeautyCategoryType>('bridal_makeup');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BeautyServiceItem | null>(null);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newTitleHi, setNewTitleHi] = useState('');
  const [newCategory, setNewCategory] = useState<BeautyCategoryType>('bridal_makeup');
  const [newPrice, setNewPrice] = useState<number | ''>(1500);
  const [newDesc, setNewDesc] = useState('');
  const [newDescHi, setNewDescHi] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600');

  useEffect(() => {
    localStorage.setItem(`mau_beauty_catalog_${parlourId}`, JSON.stringify(items));
    if (onCatalogChange) {
      onCatalogChange(items);
    }
  }, [items, parlourId, onCatalogChange]);

  const filteredItems = items.filter(item => item.category === activeTab);

  const handleToggleAvailable = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, available: !item.available } : item);
    setItems(updated);
  };

  const handlePriceChange = (id: string, price: number) => {
    const updated = items.map(item => item.id === id ? { ...item, price: Math.max(0, price) } : item);
    setItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm(language === 'en' ? 'Are you sure you want to delete this service item?' : 'क्या आप इस सेवा आइटम को हटाना चाहते हैं?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItemObj: BeautyServiceItem = {
      id: 'bsi_' + Date.now(),
      category: newCategory,
      title: newTitle.trim(),
      titleHi: newTitleHi.trim() || newTitle.trim(),
      price: Number(newPrice) || 500,
      description: newDesc.trim() || undefined,
      descriptionHi: newDescHi.trim() || undefined,
      image: newImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
      available: true,
      parlourId
    };

    setItems([...items, newItemObj]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = items.map(item => item.id === editingItem.id ? editingItem : item);
    setItems(updated);
    setEditingItem(null);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewTitleHi('');
    setNewCategory(activeTab);
    setNewPrice(1500);
    setNewDesc('');
    setNewDescHi('');
    setNewImage('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                {language === 'en' ? 'Beauty & Bridal Services Menu Manager' : 'ब्यूटी और ब्राइडल सेवा सूची प्रबंधक'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en'
                  ? 'Manage Bridal Makeup, Side Makeup, Mehendi & Lehenga packages, update photos & charges.'
                  : 'ब्राइडल मेकअप, साइड मेकअप, मेहंदी और लहंगा पैकेज प्रबंधित करें, फोटो व रेट अपडेट करें।'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewCategory(activeTab);
            setShowAddModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          {language === 'en' ? 'Add Beauty Service' : 'नई सेवा जोड़ें'}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {BEAUTY_CATEGORIES.map(cat => {
          const isActive = activeTab === cat.id;
          const count = items.filter(i => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{cat.icon}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </div>
              <div>
                <span className="text-xs font-black block leading-tight">
                  {language === 'en' ? cat.nameEn : cat.nameHi}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Catalog Grid for Active Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            {BEAUTY_CATEGORIES.find(c => c.id === activeTab)?.icon}{' '}
            {language === 'en'
              ? BEAUTY_CATEGORIES.find(c => c.id === activeTab)?.nameEn
              : BEAUTY_CATEGORIES.find(c => c.id === activeTab)?.nameHi}{' '}
            ({filteredItems.length})
          </h3>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-500">
              {language === 'en' ? 'No items in this category yet.' : 'इस श्रेणी में अभी कोई आइटम नहीं है।'}
            </p>
            <button
              type="button"
              onClick={() => {
                setNewCategory(activeTab);
                setShowAddModal(true);
              }}
              className="mt-2 text-xs font-black text-rose-600 hover:underline"
            >
              + {language === 'en' ? 'Add first service item' : 'पहला आइटम जोड़ें'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white p-3.5 shadow-2xs transition hover:shadow-md flex flex-col justify-between ${
                  item.available ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20 opacity-75'
                }`}
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailable(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide backdrop-blur-md shadow-xs transition cursor-pointer ${
                          item.available
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-rose-600/90 text-white'
                        }`}
                      >
                        {item.available ? 'In Stock / Ready' : 'Unavailable'}
                      </button>
                    </div>
                  </div>

                  {/* Titles */}
                  <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs font-bold text-rose-600 mt-0.5">
                    {item.titleHi}
                  </p>

                  {(item.description || item.descriptionHi) && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {language === 'en' ? item.description : item.descriptionHi || item.description}
                    </p>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Rate (₹)</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-emerald-700">₹</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                        className="w-20 px-2 py-0.5 border border-slate-200 rounded-lg text-xs font-black text-slate-800 focus:outline-rose-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                      title="Edit photo & details"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                      title="Delete service"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD NEW BEAUTY SERVICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative my-8 font-sans">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {language === 'en' ? 'Add New Beauty Service Package' : 'नई ब्यूटी सेवा पैकेज जोड़ें'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'en' ? 'Upload photo & configure prices for customers' : 'फोटो अपलोड करें और ग्राहकों के लिए रेट तय करें'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-4">
              {/* Category Select */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                  Category (श्रेणी)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BeautyCategoryType)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-rose-500"
                >
                  {BEAUTY_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.nameEn} ({cat.nameHi})
                    </option>
                  ))}
                </select>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Airbrush Bridal Makeup"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे- एयरब्रश ब्राइडल मेकअप"
                    value={newTitleHi}
                    onChange={(e) => setNewTitleHi(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-rose-500"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                  Charge / Rate (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-emerald-700 focus:outline-rose-500"
                />
              </div>

              {/* Photo Upload via Storage */}
              <div>
                <ImageUploadControl
                  label="Upload Service Photo"
                  labelHi="सर्विस फोटो अपलोड करें"
                  currentImageUrl={newImage}
                  type="product"
                  identifier={`beauty_${Date.now()}`}
                  aspectRatio="square"
                  onImageUploaded={(url) => setNewImage(url)}
                />
                <div className="mt-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Or External Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs text-slate-700 focus:outline-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What is included in this service?"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-rose-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                    Description (Hindi)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="इस सेवा में क्या शामिल है?"
                    value={newDescHi}
                    onChange={(e) => setNewDescHi(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-rose-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SERVICE MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative my-8 font-sans">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Edit Beauty Service Details
                </h3>
              </div>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                  Title (Hindi)
                </label>
                <input
                  type="text"
                  value={editingItem.titleHi}
                  onChange={(e) => setEditingItem({ ...editingItem, titleHi: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 mb-1">
                  Charge / Rate (₹)
                </label>
                <input
                  type="number"
                  required
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-emerald-700 focus:outline-rose-500"
                />
              </div>

              <div>
                <ImageUploadControl
                  label="Update Service Photo"
                  labelHi="सर्विस फोटो बदलें"
                  currentImageUrl={editingItem.image}
                  type="product"
                  identifier={editingItem.id}
                  aspectRatio="square"
                  onImageUploaded={(url) => setEditingItem({ ...editingItem, image: url })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
