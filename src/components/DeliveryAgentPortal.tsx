/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Package, 
  CheckSquare, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Phone,
  Power,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Order, Language, DeliveryStatus } from '../types';

interface DeliveryAgentPortalProps {
  orders: Order[];
  language: Language;
  onUpdateOrders: (orders: Order[]) => void;
}

export default function DeliveryAgentPortal({
  orders,
  language,
  onUpdateOrders
}: DeliveryAgentPortalProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [riderWallet, setRiderWallet] = useState(() => {
    const saved = localStorage.getItem('mau_rider_wallet');
    return saved ? Number(saved) : 180; // Pre-filled with Rs. 180 starter earnings
  });
  
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    return localStorage.getItem('mau_active_job_id') || null;
  });

  const [verifiedItems, setVerifiedItems] = useState<{ [itemId: string]: boolean }>({});
  const [payoutUpiId, setPayoutUpiId] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [photoFile, setPhotoFile] = useState<string | null>(() => {
    const active = orders.find(o => o.id === (localStorage.getItem('mau_active_job_id') || null));
    return active?.photoUrl || null;
  });

  const saveWallet = (amount: number) => {
    setRiderWallet(amount);
    localStorage.setItem('mau_rider_wallet', String(amount));
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const activeJob = orders.find(o => o.id === activeJobId);

  // Bezier curve calculations for dynamic moving dot on the Map
  const startLat = 25.6840;
  const startLng = 80.1250;
  const destLat = 25.6920;
  const destLng = 80.1380;
  
  const currentLat = activeJob?.riderLat || startLat;
  const currentLng = activeJob?.riderLng || startLng;

  const totalDist = Math.sqrt(Math.pow(destLat - startLat, 2) + Math.pow(destLng - startLng, 2));
  const currentDist = Math.sqrt(Math.pow(currentLat - startLat, 2) + Math.pow(currentLng - startLng, 2));
  const progressPercent = totalDist > 0 ? Math.min(1, currentDist / totalDist) : 0;

  const tCoord = progressPercent;
  const rx = Math.round(Math.pow(1-tCoord, 2) * 20 + 2 * (1-tCoord) * tCoord * 90 + Math.pow(tCoord, 2) * 180);
  const ry = Math.round(Math.pow(1-tCoord, 2) * 40 + 2 * (1-tCoord) * tCoord * 10 + Math.pow(tCoord, 2) * 30);

  // Automatic Location Simulation when Out for Delivery
  React.useEffect(() => {
    if (!activeJob || activeJob.deliveryStatus !== 'out_for_delivery') return;

    const interval = setInterval(() => {
      const destLat = 25.6920;
      const destLng = 80.1380;
      const currentLat = activeJob.riderLat || 25.6840;
      const currentLng = activeJob.riderLng || 80.1250;

      if (Math.abs(currentLat - destLat) < 0.0001 && Math.abs(currentLng - destLng) < 0.0001) {
        clearInterval(interval);
        return;
      }

      // Progress closer by 15% each step to simulate real-time riding
      const nextLat = currentLat + (destLat - currentLat) * 0.15;
      const nextLng = currentLng + (destLng - currentLng) * 0.15;

      const updated = orders.map(o => {
        if (o.id === activeJob.id) {
          return {
            ...o,
            riderLat: Number(nextLat.toFixed(5)),
            riderLng: Number(nextLng.toFixed(5))
          };
        }
        return o;
      });
      onUpdateOrders(updated);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeJob?.deliveryStatus, activeJob?.id, orders, onUpdateOrders]);

  const handleAcceptJob = (jobId: string) => {
    if (!isOnline) {
      alert(language === 'en' ? 'Please go ONLINE first to accept delivery orders.' : 'ऑर्डर स्वीकार करने के लिए पहले ऑनलाइन जाएं।');
      return;
    }
    setActiveJobId(jobId);
    localStorage.setItem('mau_active_job_id', jobId);

    // Set order status to ready_for_delivery
    const updated = orders.map(o => {
      if (o.id === jobId) {
        return { 
          ...o, 
          deliveryStatus: 'ready_for_delivery' as DeliveryStatus,
          riderLat: 25.6840,
          riderLng: 80.1250
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    setVerifiedItems({});
    setPhotoFile(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoFile(base64String);
        if (activeJob) {
          const updated = orders.map(o => {
            if (o.id === activeJob.id) {
              return { ...o, photoUrl: base64String };
            }
            return o;
          });
          onUpdateOrders(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetRiderLocation = (lat: number, lng: number) => {
    if (!activeJob) return;
    const updated = orders.map(o => {
      if (o.id === activeJob.id) {
        return { ...o, riderLat: lat, riderLng: lng };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleProgressStatus = () => {
    if (!activeJob) return;

    if (activeJob.deliveryStatus === 'ready_for_delivery') {
      if (!photoFile) {
        alert(language === 'en' ? 'Please upload the products photo first!' : 'कृपया पहले सामान की फोटो अपलोड करें!');
        return;
      }
      // Move to out_for_delivery
      const updated = orders.map(o => {
        if (o.id === activeJob.id) {
          return { 
            ...o, 
            deliveryStatus: 'out_for_delivery' as DeliveryStatus,
            riderLat: 25.6840,
            riderLng: 80.1250
          };
        }
        return o;
      });
      onUpdateOrders(updated);
      alert(language === 'en' 
        ? 'Status updated to Out for Delivery! Live location simulation is now active.' 
        : 'वितरण के लिए बाहर स्थिति अपडेट की गई! लाइव स्थान सिमुलेशन अब सक्रिय है।'
      );
    } else if (activeJob.deliveryStatus === 'out_for_delivery') {
      // Complete delivery, set to arrived
      const updated = orders.map(o => {
        if (o.id === activeJob.id) {
          return { ...o, deliveryStatus: 'arrived' as DeliveryStatus, deliveredAt: Date.now() };
        }
        return o;
      });
      onUpdateOrders(updated);

      const newWalletBal = riderWallet + 20;
      saveWallet(newWalletBal);
      
      alert(language === 'en' 
        ? 'Delivery Successful! ₹20 delivery incentive added to your wallet.' 
        : 'वितरण सफल! ₹20 डिलीवरी प्रोत्साहन राशि आपके वॉलेट में जोड़ी गई।'
      );

      setActiveJobId(null);
      setPhotoFile(null);
      localStorage.removeItem('mau_active_job_id');
    }
  };

  const handleToggleVerifyItem = (indexKey: string) => {
    setVerifiedItems(prev => ({
      ...prev,
      [indexKey]: !prev[indexKey]
    }));
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutUpiId || riderWallet < 100) {
      alert(language === 'en' ? 'Minimum payout is ₹100. Enter a valid UPI ID.' : 'न्यूनतम भुगतान ₹100 है। वैध UPI आईडी दर्ज करें।');
      return;
    }

    alert(language === 'en' 
      ? `Payout of ₹${riderWallet} initiated successfully to ${payoutUpiId}! Deposited in 5 mins.` 
      : `₹${riderWallet} का भुगतान सफलतापूर्वक ${payoutUpiId} पर भेज दिया गया है!`
    );

    saveWallet(0);
    setShowPayoutModal(false);
  };

  const unassignedJobs = orders.filter(o => o.deliveryStatus !== 'arrived' && o.deliveryStatus !== 'cancelled' && o.id !== activeJobId);

  const t = {
    en: {
      riderConsole: 'Maudaha Mart delivery boy pannel',
      onlineStatus: 'Delivery boy Shift',
      online: 'ON DUTY (Online)',
      offline: 'OFF DUTY (Offline)',
      walletBalance: 'My Earnings Wallet',
      cashOut: 'Withdraw via UPI',
      activeTask: 'Active Delivery Task',
      noActiveTask: 'You have no active deliveries. Grab one below!',
      pendingDeliveries: 'Available Orders near Galla Mandi',
      acceptOrder: 'Accept & Set Off',
      progressStep: 'Update Delivery Status to',
      verifyChecklist: 'Item Packaging Verification',
      customerAddress: 'Customer Address',
      storeLocation: 'Pickup Store Location',
      paymentCollected: 'Payment Collected',
      payoutHeader: 'Delivery boy Incentive Payout',
      payoutSub: 'Transfer your hard-earned local incentives straight to Paytm, PhonePe, or GPay.',
      minPayoutMsg: 'Min. balance required: ₹100',
      completeChecks: 'Check all items before updating status'
    },
    hi: {
      riderConsole: 'मौदहा मार्ट डिलीवरी बॉय पैनल',
      onlineStatus: 'डिलीवरी बॉय शिफ्ट',
      online: 'ड्यूटी पर (ऑनलाइन)',
      offline: 'ड्यूटी समाप्त (ऑफलाइन)',
      walletBalance: 'मेरी कमाई वॉलेट',
      cashOut: 'UPI द्वारा निकालें',
      activeTask: 'सक्रिय डिलीवरी कार्य',
      noActiveTask: 'आपके पास कोई सक्रिय डिलीवरी नहीं है। नीचे से स्वीकार करें!',
      pendingDeliveries: 'गल्ला मंडी के पास उपलब्ध ऑर्डर',
      acceptOrder: 'स्वीकार करें और निकलें',
      progressStep: 'डिलीवरी स्थिति बदलें:',
      verifyChecklist: 'सामग्री पैकेजिंग सत्यापन',
      customerAddress: 'ग्राहक का पता',
      storeLocation: 'पिकअप दुकान का स्थान',
      paymentCollected: 'भुगतान प्राप्त किया',
      payoutHeader: 'डिलीवरी बॉय प्रोत्साहन भुगतान',
      payoutSub: 'अपने कठिन परिश्रम से अर्जित प्रोत्साहन को सीधे पेटीएम, फोनपे या जीपे में स्थानांतरित करें।',
      minPayoutMsg: 'न्यूनतम शेष राशि की आवश्यकता: ₹100',
      completeChecks: 'स्थिति अपडेट करने से पहले सभी सामग्री की जांच करें'
    }
  }[language];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Welcome Panel */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-[-40px] top-[-40px] w-56 h-56 rounded-full bg-emerald-900/20" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{t.riderConsole}</h1>
            <p className="text-xs text-emerald-300 mt-1">
              {language === 'en' ? 'Deliver hot grocery packets around Maudaha and earn instant commissions.' : 'मौदहा में किराना पैकेट डिलीवर करें और तुरंत कमीशन कमाएं।'}
            </p>
          </div>
        </div>

        {/* Shift online toggle */}
        <div className="relative z-10 flex items-center gap-3 bg-emerald-900/40 p-2.5 rounded-2xl border border-emerald-800/50">
          <span className="text-xs font-bold text-emerald-200">{t.onlineStatus}</span>
          <button type="button"
            onClick={handleToggleOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
              isOnline 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Power className="h-3.5 w-3.5 cursor-pointer" />
            <span>{isOnline ? t.online : t.offline}</span>
          </button>
        </div>
      </div>

      {/* Stats and Wallet Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Rider incentive wallet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.walletBalance}</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-slate-800 font-mono">₹{riderWallet}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Incentive Active</span>
            </div>
          </div>
          <button type="button"
            onClick={() => {
              if (riderWallet < 100) {
                alert(language === 'en' ? 'You need a minimum balance of ₹100 to request payout.' : 'भुगतान के लिए न्यूनतम ₹100 होना आवश्यक है।');
                return;
              }
              setShowPayoutModal(true);
            }}
            className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition uppercase tracking-wide cursor-pointer"
          >
            {t.cashOut}
          </button>
        </div>

        {/* Performance metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shift Statistics</span>
            <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Deliveries Completed</span>
                <span className="text-lg font-extrabold text-slate-800">9 Orders</span>
              </div>
              <div>
                <span className="text-slate-400 block">Today's Earnings</span>
                <span className="text-lg font-extrabold text-slate-800">₹180</span>
              </div>
            </div>
          </div>
          <span className="text-[9px] text-slate-400 mt-2 block italic">Payout settled within Maudaha limits.</span>
        </div>

        {/* Local weather conditions / Traffic limits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Maudaha Route Status</span>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
                ☀️
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Clear Route</p>
                <p className="text-[10px] text-slate-400">Normal traffic at Central Chauraha</p>
              </div>
            </div>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold mt-2 block">● ALL SECTORS LIVE & OPEN</span>
        </div>

      </div>

      {/* Main Core Layout: Active Task vs Pending Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active job panel (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-emerald-600" />
            <span>{t.activeTask}</span>
          </h2>

          {activeJob ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                <div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                    Order #{activeJob.id}
                  </span>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {language === 'hi' ? activeJob.storeNameHi : activeJob.storeName}
                  </p>
                </div>

                {/* Status stepper control */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Current Stage</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md mt-0.5 inline-block">
                      {activeJob.deliveryStatus === 'ready_for_delivery' && (language === 'en' ? 'Ready for Delivery' : 'वितरण के लिए तैयार')}
                      {activeJob.deliveryStatus === 'out_for_delivery' && (language === 'en' ? 'Out for Delivery' : 'वितरण चालू है (रास्ते में)')}
                    </span>
                  </div>

                  <button type="button"
                    onClick={handleProgressStatus}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md shadow-slate-950/10 active:scale-95 cursor-pointer"
                  >
                    <span>
                      {activeJob.deliveryStatus === 'ready_for_delivery' && (language === 'en' ? 'Mark Out for Delivery' : 'रवाना (Out for Delivery)')}
                      {activeJob.deliveryStatus === 'out_for_delivery' && (language === 'en' ? 'Mark Delivered' : 'वितरण सफल चिह्नित करें')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Location Route details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.storeLocation}</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {language === 'hi' ? 'गल्ला मंडी मेन रोड, मौदहा' : 'Galla Mandi Main Road, Maudaha'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-slate-200/50 pt-3">
                    <Navigation className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.customerAddress}</span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {language === 'hi' ? 'स्टेशन रोड, मौदहा' : 'Station Road, Maudaha'}
                        </p>
                      </div>
                      <a href="tel:+919876543210" className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100" title={language === 'hi' ? 'ग्राहक को कॉल करें' : 'Call Customer'}>
                        <Phone className="h-4 w-4 mb-0.5" />
                        <span className="text-[8px] font-bold uppercase">{language === 'hi' ? 'कॉल करें' : 'Call'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Simulated Interactive Route Map */}
                <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                  <div className="absolute right-0 bottom-0 top-0 left-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider uppercase">
                      Local Route Map
                    </span>
                    <span className="text-[10px] text-slate-400">Dist: ~1.2 km</span>
                  </div>

                  {/* Aesthetic local navigation lines */}
                  <div className="relative h-16 my-2">
                    <svg className="w-full h-full" viewBox="0 0 200 60">
                      {/* Dotted path */}
                      <path d="M 20 40 Q 90 10, 180 30" fill="none" stroke="#334155" strokeWidth="3" strokeDasharray="4" />
                      <path d="M 20 40 Q 90 10, 180 30" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="4" className="animate-[dash_5s_linear_infinite]" />
                      
                      {/* Store marker */}
                      <circle cx="20" cy="40" r="6" fill="#ef4444" />
                      <text x="20" y="55" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">Store</text>

                      {/* Rider dot moving dynamically */}
                      <circle cx={rx} cy={ry} r="5.5" fill="#f59e0b" className="animate-pulse stroke-white stroke-2" />

                      {/* Customer marker */}
                      <circle cx="180" cy="30" r="6" fill="#10b981" />
                      <text x="180" y="45" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">Home</text>
                    </svg>
                  </div>

                  <span className="text-[9px] text-slate-400 z-10">Maudaha Chauraha Bypass Road Route</span>
                </div>
              </div>

              {/* Verification items checklist */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                  <span>{t.verifyChecklist}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeJob.items.map((item, idx) => {
                    const indexKey = `${activeJob.id}-${idx}`;
                    const isChecked = !!verifiedItems[indexKey];
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleToggleVerifyItem(indexKey)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isChecked 
                            ? 'bg-emerald-50/50 border-emerald-500/20 text-slate-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-extrabold">{language === 'hi' ? item.product.nameHi : item.product.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[10px] bg-slate-200/50 px-2 py-0.5 rounded-full text-slate-600">x{item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Photo Verification and Location Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-4">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>📸</span>
                  <span>{language === 'hi' ? 'सामग्री फोटो सत्यापन (आवश्यक)' : 'Upload Products Verification Photo (Required)'}</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Input */}
                  <div className="w-full sm:w-auto">
                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition inline-block text-center active:scale-95 shadow-sm">
                      <span>{photoFile ? (language === 'hi' ? '🔄 फोटो बदलें' : '🔄 Change Photo') : (language === 'hi' ? '📤 फोटो अपलोड करें' : '📤 Upload Photo')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Photo Preview */}
                  {photoFile ? (
                    <div className="relative">
                      <img
                        src={photoFile}
                        alt="Verification preview"
                        className="w-16 h-16 object-cover rounded-lg border-2 border-emerald-500 shadow-xs"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-full">
                        ✓
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-bold italic">
                      {language === 'hi' ? 'कोई फोटो अपलोड नहीं की गई है' : 'No photo uploaded yet'}
                    </span>
                  )}
                </div>

                {/* Live Location Controls */}
                {activeJob.deliveryStatus === 'out_for_delivery' && (
                  <div className="border-t border-slate-200/50 pt-3 space-y-2">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                      <span>📍</span>
                      <span>{language === 'hi' ? 'लाइव डिलीवरी बॉय लोकेशन सिमुलेटर (लैंडमार्क बदलें)' : 'Live Delivery boy Location Simulator (Change Landmark)'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetRiderLocation(25.6840, 80.1250)}
                        className={`px-2.5 py-1.5 rounded-lg border font-black transition text-[10px] ${
                          Math.abs(currentLat - 25.6840) < 0.0005
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🏪 {language === 'hi' ? 'गल्ला मंडी (दुकान)' : 'Galla Mandi (Store)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRiderLocation(25.6880, 80.1310)}
                        className={`px-2.5 py-1.5 rounded-lg border font-black transition text-[10px] ${
                          Math.abs(currentLat - 25.6880) < 0.0005
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🚦 {language === 'hi' ? 'सेंट्रल चौराहा' : 'Central Chauraha'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRiderLocation(25.6920, 80.1380)}
                        className={`px-2.5 py-1.5 rounded-lg border font-black transition text-[10px] ${
                          Math.abs(currentLat - 25.6920) < 0.0005
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🏠 {language === 'hi' ? 'स्टेशन रोड (घर)' : 'Station Road (Home)'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic cursor-pointer">
                      {language === 'hi' 
                        ? 'डिलीवरी बॉय की स्थिति हर 4 सेकंड में ग्राहक की ओर अपने आप बढ़ रही है!' 
                        : 'Delivery boy position is also automatically moving closer to customer every 4 seconds!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment collected status indicator */}
              <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-bold">{t.paymentCollected}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Method: {activeJob.paymentMethod}</span>
                </div>
                <span className="font-mono font-black text-slate-800 text-sm">₹{activeJob.total}</span>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm font-bold">
              <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p>{t.noActiveTask}</p>
            </div>
          )}
        </div>

        {/* Available deliveries list sidebar (Right column) */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
            <Navigation className="h-4.5 w-4.5 text-rose-500" />
            <span>{t.pendingDeliveries}</span>
          </h2>

          <div className="space-y-3">
            {unassignedJobs.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 font-bold">
                No orders waiting for pickup. Tell merchants to pack packets!
              </div>
            ) : (
              unassignedJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-emerald-500/20 transition">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">#{job.id}</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">₹20 Commission</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{language === 'hi' ? job.storeNameHi : job.storeName}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      To: {language === 'hi' ? (job.customerLocationHi || job.customerLocation || 'स्टेशन रोड, मौदहा') : (job.customerLocation || 'Station Road, Maudaha')}
                    </p>
                  </div>
                  <button type="button"
                    onClick={() => handleAcceptJob(job.id)}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{t.acceptOrder}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Payout Withdrawal Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-black text-slate-800 text-sm">{t.payoutHeader}</h3>
              <button type="button" onClick={() => setShowPayoutModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 cursor-pointer">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {t.payoutSub}
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Transfer amount</span>
                <span className="text-2xl font-black font-mono text-slate-800 mt-1 block">₹{riderWallet}</span>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Enter your UPI ID (e.g. paytm/ybl)</label>
                <input
                  type="text"
                  required
                  value={payoutUpiId}
                  onChange={e => setPayoutUpiId(e.target.value)}
                  placeholder="yourname@paytm"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase transition shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                Request Instant Transfer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
