/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Award, History, X, Edit2, Check, Languages, Palette, Layers, LogOut, Smartphone, Sparkles, Building, Landmark, ChevronLeft } from 'lucide-react';
import { RegisteredUser, Language, MerchantRequest } from '../types';
import { THEMES } from '../theme';

interface UserProfileCornerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSwitchLanguage?: (lang: Language) => void;
  themeId?: string;
  onSwitchTheme?: (themeId: string) => void;
  role?: 'customer' | 'merchant' | 'admin' | 'rider' | 'manager';
  onSwitchRole?: (role: 'customer' | 'merchant' | 'admin' | 'rider' | 'manager') => void;
  activeUserId: string;
  users: RegisteredUser[];
  onSwitchUser: (userId: string) => void;
  onUpdateUsers: (users: RegisteredUser[]) => void;
  loyaltyPoints: number;
  loyaltyTier: string;
  onLogOut?: () => void;
  onOpenAndroidHub?: () => void;
  merchantRequests?: MerchantRequest[];
  onAddMerchantRequest?: (req: MerchantRequest) => void;
  weather?: {
    temp: number;
    code: number;
    wind: number;
    description: string;
    descriptionHi: string;
    icon: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function UserProfileCorner({
  isOpen,
  onClose,
  language,
  onSwitchLanguage,
  themeId,
  onSwitchTheme,
  role,
  onSwitchRole,
  activeUserId,
  users,
  onSwitchUser,
  onUpdateUsers,
  loyaltyPoints,
  loyaltyTier,
  onLogOut,
  weather,
  onOpenAndroidHub,
  merchantRequests = [],
  onAddMerchantRequest
}: UserProfileCornerProps) {
  const activeUser = users.find(u => u.id === activeUserId);
  
  // Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activeUser?.name || '');
  const [editPhone, setEditPhone] = useState(activeUser?.phone || '');
  const [editEmail, setEditEmail] = useState(activeUser?.email || '');
  const [editLocation, setEditLocation] = useState(activeUser?.location || '');

  // Merchant request form states
  const [showMerchantRequestForm, setShowMerchantRequestForm] = useState(false);
  const [reqBusinessName, setReqBusinessName] = useState('');
  const [reqBusinessNameHi, setReqBusinessNameHi] = useState('');
  const [reqBusinessType, setReqBusinessType] = useState<'grocery' | 'restaurant' | 'boutique'>('grocery');
  const [reqBusinessAddress, setReqBusinessAddress] = useState('');
  const [reqBusinessAddressHi, setReqBusinessAddressHi] = useState('');
  const [reqUpiId, setReqUpiId] = useState('');
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async (text: string, targetField: 'businessNameHi' | 'businessAddressHi') => {
    if (!text.trim()) return;
    setTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          if (targetField === 'businessNameHi') {
            setReqBusinessNameHi(data.translatedText);
          } else {
            setReqBusinessAddressHi(data.translatedText);
          }
        }
      }
    } catch (err) {
      console.error('Failed to translate:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleMerchantRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    if (!reqBusinessName.trim() || !reqBusinessAddress.trim() || !reqUpiId.trim()) {
      alert(language === 'en' ? 'All fields are required.' : 'सभी फ़ील्ड आवश्यक हैं।');
      return;
    }
    
    // Check if the phone number is the default one or invalid
    const cleanPhone = activeUser.phone.replace(/\D/g, '');
    if (cleanPhone === '9000000000' || cleanPhone === '' || cleanPhone.length < 10) {
      alert(language === 'en' 
        ? 'Please update your Personal Details first with a real active 10-digit phone number before requesting to be a merchant!' 
        : 'मर्चेंट बनने का अनुरोध करने से पहले कृपया अपने व्यक्तिगत विवरण में एक वास्तविक सक्रिय 10-अंकीय फ़ोन नंबर दर्ज करें!');
      return;
    }

    const newRequest: MerchantRequest = {
      id: 'req-' + Date.now(),
      userId: activeUserId,
      userName: activeUser.name,
      userPhone: activeUser.phone,
      businessName: reqBusinessName.trim(),
      businessNameHi: reqBusinessNameHi.trim() || reqBusinessName.trim(),
      businessAddress: reqBusinessAddress.trim(),
      businessAddressHi: reqBusinessAddressHi.trim() || reqBusinessAddress.trim(),
      businessType: reqBusinessType,
      upiId: reqUpiId.trim(),
      status: 'pending',
      date: new Date().toLocaleDateString('en-IN')
    };

    if (onAddMerchantRequest) {
      onAddMerchantRequest(newRequest);
    }

    // Set user's request status to pending
    const updatedUsers = users.map(u => {
      if (u.id === activeUserId) {
        return {
          ...u,
          merchantRequestStatus: 'pending' as const,
          activities: [
            {
              id: 'act-' + Date.now(),
              timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
              action: `Requested merchant portal for ${reqBusinessName}`,
              actionHi: `${reqBusinessName} के लिए मर्चेंट पोर्टल का अनुरोध किया`
            },
            ...(u.activities || [])
          ]
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    alert(language === 'en'
      ? 'Merchant self-onboarding request submitted successfully! Admin will approve it shortly.'
      : 'मर्चेंट ऑनबोर्डिंग अनुरोध सफलतापूर्वक सबमिट किया गया! एडमिन जल्द ही इसे स्वीकृत करेंगे।');

    // Reset Form
    setShowMerchantRequestForm(false);
    setReqBusinessName('');
    setReqBusinessNameHi('');
    setReqBusinessAddress('');
    setReqBusinessAddressHi('');
    setReqUpiId('');
  };

  React.useEffect(() => {
    if (activeUser) {
      setEditName(activeUser.name);
      setEditPhone(activeUser.phone);
      setEditEmail(activeUser.email || '');
      setEditLocation(activeUser.location);
    }
  }, [activeUserId, activeUser]);

  if (!isOpen || !activeUser) return null;

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      alert(language === 'en' ? 'Name and Phone are required.' : 'नाम और फोन नंबर आवश्यक हैं।');
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === activeUserId) {
        return {
          ...u,
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim() || undefined,
          location: editLocation.trim(),
          locationHi: editLocation.trim(), // simple translation fallback
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setIsEditing(false);
    
    // Push new activity
    const newAct = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      action: 'Updated profile contact details',
      actionHi: 'प्रोफ़ाइल संपर्क विवरण अपडेट किए'
    };

    onUpdateUsers(users.map(u => {
      if (u.id === activeUserId) {
        return {
          ...u,
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim() || undefined,
          location: editLocation.trim(),
          locationHi: editLocation.trim(),
          activities: [newAct, ...(u.activities || [])]
        };
      }
      return u;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="user-profile-corner-modal">
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" 
      />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 leading-tight">
                {language === 'en' ? 'Resident Account' : 'निवासी खाता'}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                {language === 'en' ? `User ID: ${activeUserId}` : `यूज़र आईडी: ${activeUserId}`}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main User Card with Avatar & Quick Info */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/5" />
            
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-inner transition cursor-pointer select-none border border-white/25">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight leading-tight">{activeUser.name}</h3>
                <span className="text-xs bg-emerald-500/30 text-emerald-100 font-bold px-2 py-0.5 rounded-md mt-1 inline-block border border-white/10">
                  📍 {activeUser.location}
                </span>
                <p className="text-[10px] text-emerald-200 mt-1 uppercase font-black tracking-widest font-mono">
                  Role: {activeUser.role}
                </p>
              </div>
            </div>

            {/* Loyalty Score Summary Inside Profile Card */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-emerald-200 font-extrabold uppercase tracking-widest font-mono">Loyalty Tier</span>
                <span className="text-sm font-black text-amber-300 flex items-center gap-1 mt-0.5">
                  <Award className="h-4 w-4 fill-amber-300 text-amber-400" />
                  {loyaltyTier}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-emerald-200 font-extrabold uppercase tracking-widest font-mono">Available Balance</span>
                <span className="text-lg font-black text-yellow-300 font-mono mt-0.5 block">
                  💎 {loyaltyPoints} Coins
                </span>
              </div>
            </div>
          </div>

          {/* Quick Log Out option (Moved Higher Up) */}
          {onLogOut && (
            <button
              onClick={() => {
                onLogOut();
              }}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>{language === 'en' ? 'Log Out Account' : 'खाता लॉग आउट करें'}</span>
            </button>
          )}

          {/* Contact Details & Profile Editing Form */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-[11px] font-mono text-slate-400 font-black uppercase tracking-wider">
                {language === 'en' ? 'Personal Details' : 'व्यक्तिगत विवरण'}
              </span>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 hover:underline transition"
                >
                  <Edit2 className="h-3 w-3" />
                  {language === 'en' ? 'Edit Info' : 'बदलें'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:text-slate-600 font-bold transition"
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">
                      {language === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}
                    </span>
                    <span className="font-bold text-slate-700 font-mono">{activeUser.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">
                      {language === 'en' ? 'Email Address' : 'ईमेल पता'}
                    </span>
                    <span className="font-bold text-slate-700">{activeUser.email || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">
                      {language === 'en' ? 'Standard Delivery Area' : 'मानक वितरण क्षेत्र'}
                    </span>
                    <span className="font-bold text-slate-700">{activeUser.location}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveChanges} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                    {language === 'en' ? 'Name' : 'नाम'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                    {language === 'en' ? 'Phone' : 'फ़ोन'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                    {language === 'en' ? 'Email' : 'ईमेल'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                    {language === 'en' ? 'Delivery Address' : 'वितरण का पता'}
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {language === 'en' ? 'Save Changes' : 'बदलाव सहेजें'}
                </button>
              </form>
            )}
          </div>

          {/* Become a Merchant Portal / मर्चेंट बनें */}
          {activeUser.role === 'customer' && (
            <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black text-emerald-800 tracking-tight block">
                    {language === 'en' ? 'Become a Partner Store' : 'मौदहा मर्चेंट पार्टनर बनें'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {language === 'en' ? 'Start selling locally on Maudaha Mart' : 'मार्ट पर ऑनलाइन बिक्री शुरू करें'}
                  </span>
                </div>
              </div>

              {activeUser.merchantRequestStatus === 'pending' ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                  <span className="text-xs font-extrabold text-amber-800 block">
                    ⏳ {language === 'en' ? 'Onboarding Request Pending' : 'ऑनबोर्डिंग अनुरोध लंबित है'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-semibold">
                    {language === 'en'
                      ? 'The Super Admin is reviewing your UPI settlements & location details. You will get access shortly!'
                      : 'सुपर एडमिन आपके यूपीआई सेटलमेंट और दुकान के विवरण की समीक्षा कर रहे हैं। आपको जल्द ही पहुंच मिलेगी!'}
                  </p>
                </div>
              ) : activeUser.merchantRequestStatus === 'rejected' ? (
                <div className="bg-red-500/10 border border-red-500/10 rounded-xl p-3 text-center">
                  <span className="text-xs font-extrabold text-red-800 block">
                    ❌ {language === 'en' ? 'Application Rejected' : 'आवेदन अस्वीकार कर दिया गया'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">
                    {language === 'en'
                      ? 'Ensure your business details are authentic and update your phone number before re-applying.'
                      : 'पुनः आवेदन करने से पहले सुनिश्चित करें कि आपकी दुकान की जानकारी वास्तविक है।'}
                  </p>
                  <button
                    onClick={() => {
                      const updatedUsers = users.map(u => {
                        if (u.id === activeUserId) {
                          return { ...u, merchantRequestStatus: 'none' as const };
                        }
                        return u;
                      });
                      onUpdateUsers(updatedUsers);
                    }}
                    className="text-[10px] text-emerald-600 font-black mt-2 uppercase hover:underline block mx-auto cursor-pointer"
                  >
                    {language === 'en' ? 'Re-Apply Now' : 'फिर से आवेदन करें'}
                  </button>
                </div>
              ) : !showMerchantRequestForm ? (
                <button
                  onClick={() => setShowMerchantRequestForm(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{language === 'en' ? 'Apply to onboard' : 'ऑनबोर्डिंग के लिए आवेदन करें'}</span>
                </button>
              ) : (
                <form onSubmit={handleMerchantRequestSubmit} className="space-y-3.5 pt-2 border-t border-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'en' ? 'Store Registration' : 'दुकान का पंजीकरण'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMerchantRequestForm(false)}
                      className="text-[10px] text-slate-500 hover:text-slate-700 font-bold flex items-center gap-0.5"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      {language === 'en' ? 'Back' : 'पीछे'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                      {language === 'en' ? 'Shop Name (English)' : 'दुकान का नाम (अंग्रेज़ी में)'}
                    </label>
                    <input
                      type="text"
                      value={reqBusinessName}
                      onChange={e => setReqBusinessName(e.target.value)}
                      placeholder="e.g. Maudaha Fresh Kirana"
                      className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                      {language === 'en' ? 'Shop Category' : 'दुकान की श्रेणी'}
                    </label>
                    <select
                      value={reqBusinessType}
                      onChange={e => setReqBusinessType(e.target.value as any)}
                      className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                    >
                      <option value="grocery">{language === 'en' ? '🏪 Groceries & Daily Needs' : '🏪 किराना और दैनिक ज़रूरतें'}</option>
                      <option value="restaurant">{language === 'en' ? '🍔 Restaurant / Food Point' : '🍔 रेस्टोरेंट / भोजन बिंदु'}</option>
                      <option value="boutique">{language === 'en' ? '👕 Fashion Boutique / Clothing' : '👕 फैशन बुटीक और कपड़े'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                      {language === 'en' ? 'Shop Location (English)' : 'दुकान का पता (अंग्रेज़ी में)'}
                    </label>
                    <input
                      type="text"
                      value={reqBusinessAddress}
                      onChange={e => setReqBusinessAddress(e.target.value)}
                      placeholder="e.g. Galla Mandi, Maudaha"
                      className="w-full text-xs font-bold text-slate-700 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">
                      {language === 'en' ? 'UPI ID for Payout Settlements' : 'भुगतान के लिए यूपीआई आईडी'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={reqUpiId}
                        onChange={e => setReqUpiId(e.target.value)}
                        placeholder="e.g. merchant@okaxis"
                        className="w-full text-xs font-bold text-slate-700 pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition font-mono"
                        required
                      />
                      <Landmark className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {activeUser.phone.includes('9000000000') && (
                    <div className="bg-red-50 text-[10px] p-2.5 rounded-xl border border-red-200 text-red-700 font-bold leading-normal">
                      ⚠️ {language === 'en' 
                        ? 'Please edit your Profile above to add a real phone number before submitting. Registrations with +91 90000 00000 default cannot be verified.'
                        : 'कृपया जमा करने से पहले अपना वास्तविक फोन नंबर दर्ज करें। डिफ़ॉल्ट +91 90000 00000 नंबर सत्यापित नहीं किया जा सकता।'}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    {language === 'en' ? 'Submit Registration' : 'पंजीकरण जमा करें'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Account Switcher - Global Simulation Sandbox */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-3">
            <div>
              <span className="text-[11px] font-mono text-amber-600 font-black uppercase tracking-wider flex items-center gap-1 select-none">
                <span>🔄</span>
                <span>{language === 'en' ? 'Simulate Other Accounts' : 'अन्य खाते सिम्युलेट करें'}</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                {language === 'en' 
                  ? 'Instantly switch user sessions to experience different profiles (Merchant, Admin, loyal customers).'
                  : 'विभिन्न प्रोफाइल (व्यापारी, एडमिन, वफादार ग्राहकों) का अनुभव करने के लिए तुरंत यूज़र सत्र बदलें।'}
              </p>
            </div>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {users.map((u) => {
                const isActive = u.id === activeUserId;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      isActive 
                        ? 'bg-amber-500/15 border-amber-400 text-amber-900 font-bold' 
                        : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{u.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mt-0.5">
                          {u.role === 'customer' ? '🛒 Customer' : u.role === 'merchant' ? '🏪 Merchant' : u.role === 'rider' ? '🚴 Rider' : '🛡️ Admin'}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile and Desktop Quick Settings & Controls */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-[11px] font-mono text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100 select-none">
              <Palette className="h-4 w-4 text-slate-400" />
              <span>{language === 'en' ? 'Quick Controls & Theme' : 'त्वरित सेटिंग्स और थीम'}</span>
            </h4>

            {/* Language Selection */}
            {onSwitchLanguage && (
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200/50 rounded-xl">
                <span className="text-xs font-bold text-slate-600 pl-2">
                  {language === 'en' ? 'App Language' : 'ऐप की भाषा'}
                </span>
                <button
                  onClick={() => onSwitchLanguage(language === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-black rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Languages className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{language === 'en' ? 'हिन्दी में बदलें' : 'English'}</span>
                </button>
              </div>
            )}

            {/* Theme Picker */}
            {onSwitchTheme && themeId && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">
                  {language === 'en' ? 'Color Theme' : 'रंग और थीम'}
                </span>

                {/* Weather Adaptive Theme Card */}
                {weather && (
                  <button
                    onClick={() => onSwitchTheme('weather')}
                    className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition active:scale-98 cursor-pointer ${
                      themeId === 'weather'
                        ? 'bg-gradient-to-r from-amber-50 to-emerald-50 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                    title={language === 'en' ? 'Adaptive to live Maudaha weather!' : 'मौदहा के लाइव मौसम के अनुकूल!'}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl animate-bounce shrink-0" style={{ animationDuration: '4s' }}>
                        {weather.icon}
                      </span>
                      <div className="text-left">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          {language === 'en' ? 'Weather Adaptive' : 'मौसम अनुकूल थीम'}
                          {themeId === 'weather' && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase">
                              {language === 'en' ? 'Active' : 'सक्रिय'}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                          {language === 'en'
                            ? `Live: ${weather.temp}°C, ${weather.description}`
                            : `लाइव: ${weather.temp}°C, ${weather.descriptionHi}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <span className="h-4.5 w-4.5 rounded-full border border-slate-200/50 block" style={{ backgroundColor: weather.primaryColor }} />
                      <span className="h-4.5 w-4.5 rounded-full border border-slate-200/50 block" style={{ backgroundColor: weather.secondaryColor }} />
                    </div>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-1.5">
                  {THEMES.map((t) => {
                    const isSelected = t.id === themeId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSwitchTheme(t.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                          isSelected ? 'bg-slate-100 border-slate-300 shadow-sm font-extrabold' : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                        title={t.name}
                      >
                        <span 
                          className="h-5 w-5 rounded-full border border-slate-200 block shadow-inner shrink-0" 
                          style={{ backgroundColor: t.primary }} 
                        />
                        <span className="text-[9px] font-bold text-slate-500 truncate max-w-full block">
                          {language === 'hi' ? t.nameHi : t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role/Portal Switcher */}
            {onSwitchRole && role && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">
                  {language === 'en' ? 'Switch Portal' : 'पोर्टल बदलें'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onSwitchRole('customer');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      role === 'customer' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold' : 'bg-white border-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="text-sm">🛒</span>
                    <span className="text-xs">{language === 'en' ? 'User' : 'ग्राहक'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole('merchant');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      role === 'merchant' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold' : 'bg-white border-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="text-sm">🏪</span>
                    <span className="text-xs">{language === 'en' ? 'Merchant' : 'व्यापारी'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole('rider');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      role === 'rider' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold' : 'bg-white border-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="text-sm">🚴</span>
                    <span className="text-xs">{language === 'en' ? 'Rider' : 'राइडर'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole('admin');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      role === 'admin' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold' : 'bg-white border-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="text-sm">🛡️</span>
                    <span className="text-xs">{language === 'en' ? 'Admin' : 'एडमिन'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Android App Install Hub */}
            {onOpenAndroidHub && (
              <div className="pt-1">
                <button
                  onClick={onOpenAndroidHub}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer active:scale-95"
                >
                  <Smartphone className="h-4 w-4 text-white" />
                  <span>{language === 'en' ? 'Android Native App Center' : 'एंड्रॉइड ऐप केंद्र'}</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
