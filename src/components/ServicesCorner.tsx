import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, MapPin, Calendar, Clock, Check, X, Shield, Star, Briefcase, Scissors, Wrench, Zap, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { LocalService, LocalServiceBooking, RegisteredUser, Language, BeautyServiceItem, BeautyCategoryType } from '../types';
import { INITIAL_SERVICES, INITIAL_BEAUTY_ITEMS } from '../data';
import { BEAUTY_CATEGORIES } from './BeautyCatalogManager';

interface ServicesCornerProps {
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: (updater: RegisteredUser[] | ((prev: RegisteredUser[]) => RegisteredUser[])) => void;
  language: Language;
  onAddActivity: (userId: string, actionEn: string, actionHi: string) => void;
  selectedServiceAreaId?: string;
}

export default function ServicesCorner({
  language,
  activeUserId,
  onAddActivity,
  users,
  onUpdateUsers,
  selectedServiceAreaId = 'area-maudaha'
}: ServicesCornerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<LocalService[]>(INITIAL_SERVICES);
  const [beautyCatalog, setBeautyCatalog] = useState<BeautyServiceItem[]>(() => {
    const saved = localStorage.getItem('mau_beauty_catalog_ser1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BEAUTY_ITEMS;
  });
  const [activeBeautyTab, setActiveBeautyTab] = useState<BeautyCategoryType>('bridal_makeup');
  const [selectedBeautyPackage, setSelectedBeautyPackage] = useState<BeautyServiceItem | null>(null);

  const [bookings, setBookings] = useState<LocalServiceBooking[]>(() => {
    const saved = localStorage.getItem(`mau_service_bookings_${activeUserId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('mau_beauty_catalog_ser1');
      if (saved) {
        try {
          setBeautyCatalog(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [bookingService, setBookingService] = useState<LocalService | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM');
  const [bookingAddress, setBookingAddress] = useState(() => {
    const activeUser = users.find(u => u.id === activeUserId);
    return activeUser?.location || 'Station Road, Maudaha';
  });
  const [bookingNotes, setBookingNotes] = useState('');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [lastBookingId, setLastBookingId] = useState('');
  const [viewMode, setViewMode] = useState<'explore' | 'bookings'>('explore');

  const activeUser = users.find(u => u.id === activeUserId);

  const [parlourActiveTabs, setParlourActiveTabs] = useState<Record<string, BeautyCategoryType>>({});
  const [rateCardService, setRateCardService] = useState<LocalService | null>(null);
  const [rateCardCategoryTab, setRateCardCategoryTab] = useState<BeautyCategoryType>('bridal_makeup');

  const getBeautyItemsForParlour = (parlourId: string, customItems?: BeautyServiceItem[]) => {
    const saved = localStorage.getItem(`mau_beauty_catalog_${parlourId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    if (customItems && customItems.length > 0) return customItems;
    return beautyCatalog;
  };

  const categories = [
    { 
      id: 'beauty', 
      name: 'Beauty Parlour & Salon', 
      nameHi: 'ब्यूटी पार्लर और सैलून', 
      icon: Scissors, 
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
      gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
      descEn: 'Bridal makeup, side makeup, mehendi, lehenga variety & parlour care',
      descHi: 'ब्राइडल मेकअप, साइड मेकअप, मेहंदी, लहंगा वैरायटी व पार्लर सेवाएं'
    },
    { 
      id: 'plumber', 
      name: 'Plumber Services', 
      nameHi: 'प्लंबर सेवाएं', 
      icon: Wrench, 
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
      gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
      descEn: 'Pipe repairs, bathroom fittings, water pump install & drainage fix',
      descHi: 'पाइप मरम्मत, बाथरूम फिटिंग, वॉटर पंप इंस्टॉल व ड्रेनेज रिपेयर'
    },
    { 
      id: 'electrician', 
      name: 'Electrician', 
      nameHi: 'इलेक्ट्रीशियन', 
      icon: Zap, 
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      descEn: 'Wiring, inverter setup, fan & switch repair, MCB panel installation',
      descHi: 'वायरिंग, इनवर्टर सेटअप, पंखे व स्विच रिपेयर, एमसीबी पैनल इंस्टॉलेशन'
    },
    { 
      id: 'mechanic', 
      name: 'Mechanic', 
      nameHi: 'मैकेनिक (बाइक/कार)', 
      icon: Wrench, 
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
      gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      descEn: 'Two-wheeler servicing, breakdown repair, battery jumpstart & oil change',
      descHi: 'टू-व्हीलर सर्विसिंग, ब्रेकडाउन रिपेयर, बैटरी जंपस्टार्ट व ऑयल चेंज'
    }
  ];

  const visibleServices = services.filter(s => {
    const areaId = s.serviceAreaId || 'area-maudaha';
    return areaId === selectedServiceAreaId;
  });

  const groupedCategories = categories.map(cat => {
    const catServices = visibleServices.filter(s => s.category === cat.id);
    return {
      ...cat,
      services: catServices
    };
  }).filter(group => selectedCategory === null || selectedCategory === group.id);

  const handleOpenBooking = (service: LocalService) => {
    setBookingService(service);
    setSelectedBeautyPackage(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingSlot('10:00 AM');
    setBookingNotes('');
  };

  const handleOpenBeautyPackageBooking = (service: LocalService, item: BeautyServiceItem) => {
    setBookingService(service);
    setSelectedBeautyPackage(item);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingSlot('10:00 AM');
    setBookingNotes(language === 'en' ? `Package: ${item.title}` : `पैकेज: ${item.titleHi}`);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService) return;

    const bookingId = 'SRV-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: LocalServiceBooking = {
      id: bookingId,
      userId: activeUserId,
      userName: activeUser?.name || 'Resident',
      userPhone: activeUser?.phone || '9000000000',
      serviceId: bookingService.id,
      serviceName: selectedBeautyPackage 
        ? `${bookingService.name} - ${selectedBeautyPackage.title}` 
        : bookingService.name,
      category: bookingService.category,
      date: bookingDate,
      timeslot: bookingSlot,
      status: 'pending',
      address: bookingAddress,
      notes: bookingNotes,
      selectedBeautyItemName: selectedBeautyPackage?.title,
      price: selectedBeautyPackage?.price || bookingService.baseCharge
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem(`mau_service_bookings_${activeUserId}`, JSON.stringify(updatedBookings));

    setLastBookingId(bookingId);
    setShowSuccessOverlay(true);
    setBookingService(null);
    setSelectedBeautyPackage(null);

    onAddActivity(
      activeUserId,
      `Booked service "${bookingService.name}" for ${bookingDate} at ${bookingSlot}`,
      `सेवा "${bookingService.nameHi}" को ${bookingDate} को ${bookingSlot} के लिए बुक किया`
    );
  };

  const handleCancelBooking = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
    setBookings(updated);
    localStorage.setItem(`mau_service_bookings_${activeUserId}`, JSON.stringify(updated));
    onAddActivity(
      activeUserId,
      `Cancelled service booking #${id}`,
      `सेवा बुकिंग #${id} को निरस्त किया`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="services-corner">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white rounded-2xl p-5 shadow-md mb-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-100 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-400/20">
                {language === 'en' ? 'LOCAL HOME SERVICES' : 'स्थानीय गृह सेवाएं'}
              </span>
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                ✨ {language === 'en' ? 'Verified Experts' : 'सत्यापित विशेषज्ञ'}
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight mt-1">
              {language === 'en' ? 'Maudaha Service Desk' : 'मौदहा सेवा डेस्क'}
            </h1>
            <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
              {language === 'en'
                ? 'Quickly book plumbers, electricians, mechanics & beauty experts at fixed rates.'
                : 'प्लंबर, इलेक्ट्रीशियन, मैकेनिक व ब्यूटी एक्सपर्ट्स को सीधे व किफायती दरों पर बुक करें।'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('explore')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'explore'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/20'
              }`}
            >
              <span>🔍</span>
              <span>{language === 'en' ? 'Find Experts' : 'सेवाएं खोजें'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bookings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'bookings'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/20'
              }`}
            >
              <span>📂</span>
              <span>{language === 'en' ? 'My Bookings' : 'मेरी बुकिंग'}</span>
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'explore' ? (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 flex items-center gap-2 border cursor-pointer ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🏠</span>
              <span>{language === 'en' ? 'All Services' : 'सभी सेवाएं'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {visibleServices.length}
              </span>
            </button>

            {categories.map((cat) => {
              const IconComp = cat.icon;
              const count = visibleServices.filter(s => s.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'en' ? cat.name : cat.nameHi}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Simple Clean Grid of Service Provider Cards */}
          {visibleServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <p className="text-xs font-bold text-slate-500">
                {language === 'en' ? 'No local service providers found in this area.' : 'इस क्षेत्र में कोई सेवा प्रदाता उपलब्ध नहीं है।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleServices
                .filter(ser => selectedCategory === null || ser.category === selectedCategory)
                .map((ser) => {
                  const catObj = categories.find(c => c.id === ser.category);
                  const isBeauty = ser.category === 'beauty';
                  const parlourBeautyItems = isBeauty ? getBeautyItemsForParlour(ser.id, ser.beautyItems) : [];

                  return (
                    <div
                      key={ser.id}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Provider Header Image */}
                        <div className="relative h-36 bg-slate-100 overflow-hidden">
                          <img
                            src={ser.banner}
                            alt={ser.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-white/95 text-slate-800 shadow-xs border border-slate-200/80">
                              {language === 'en' ? catObj?.name : catObj?.nameHi}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg text-white shadow-xs ${
                              ser.available ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}>
                              {ser.available 
                                ? (language === 'en' ? 'Available' : 'उपलब्ध') 
                                : (language === 'en' ? 'Busy' : 'व्यस्त')}
                            </span>
                          </div>

                          <div className="absolute top-2.5 right-2.5 bg-white/95 px-2 py-0.5 rounded-lg text-xs font-black text-slate-800 border border-slate-200 flex items-center gap-1 shadow-xs">
                            <span className="text-amber-500">★</span>
                            <span>{ser.rating}</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-extrabold text-base text-slate-800 tracking-tight">
                              {language === 'hi' ? ser.nameHi : ser.name}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{language === 'hi' ? ser.addressHi : ser.address}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-1 font-bold text-slate-600">
                              <span className="text-emerald-600">💼</span>
                              <span>{ser.experience} {language === 'en' ? 'Yrs Exp' : 'साल का अनुभव'}</span>
                            </div>
                            <div className="flex items-center gap-1 font-extrabold text-slate-800">
                              <span className="text-slate-400 font-normal">{language === 'en' ? 'Fee:' : 'शुल्क:'}</span>
                              <span className="text-emerald-700">₹{ser.baseCharge}</span>
                            </div>
                          </div>

                          {/* Beauty Rate Card Trigger */}
                          {isBeauty && parlourBeautyItems.length > 0 && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRateCardService(ser);
                                  setRateCardCategoryTab('bridal_makeup');
                                }}
                                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200/80 text-xs font-bold transition flex items-center justify-between cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>✂️</span>
                                  <span>{language === 'en' ? 'View Rate Card & Menu' : 'रेट कार्ड व रेट सूची देखें'}</span>
                                </span>
                                <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-extrabold">
                                  {parlourBeautyItems.length} {language === 'en' ? 'Items' : 'सेवाएं'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="p-4 pt-0 flex items-center gap-2">
                        <a
                          href={`tel:+91${ser.phone}`}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200 flex items-center justify-center cursor-pointer"
                          title={language === 'en' ? 'Call' : 'कॉल करें'}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenBooking(ser)}
                          disabled={!ser.available}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>📅</span>
                          <span>{language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        /* My Bookings View */
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Your Service Bookings' : 'आपकी सेवा बुकिंग'}
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
              {bookings.length} {language === 'en' ? 'total' : 'कुल'}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
              <div className="text-3xl">📂</div>
              <p className="text-xs font-bold text-slate-400">
                {language === 'en' ? 'You have no active service bookings.' : 'आपकी कोई सक्रिय सेवा बुकिंग नहीं है।'}
              </p>
              <button type="button"
                onClick={() => setViewMode('explore')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                {language === 'en' ? 'Browse Services' : 'सेवाएं देखें'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const isPending = booking.status === 'pending';
                const isCancelled = booking.status === 'cancelled';
                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 hover:border-emerald-500/20 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black font-mono">
                          #{booking.id}
                        </span>
                        <h3 className="font-black text-sm text-slate-800 tracking-tight mt-1">
                          {booking.serviceName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                          💼 {booking.category.toUpperCase()}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border ${
                        booking.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : booking.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-rose-50 text-rose-500 border-rose-200'
                      }`}>
                        {booking.status === 'pending' && (language === 'en' ? 'PENDING' : 'लंबित')}
                        {booking.status === 'completed' && (language === 'en' ? 'COMPLETED' : 'पूर्ण')}
                        {booking.status === 'cancelled' && (language === 'en' ? 'CANCELLED' : 'रद्द')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-50">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Date' : 'तारीख'}</span>
                        <span className="font-bold flex items-center gap-1">📅 {booking.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Timeslot' : 'समय'}</span>
                        <span className="font-bold flex items-center gap-1">⏰ {booking.timeslot}</span>
                      </div>
                      <div className="col-span-2 mt-2">
                        <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Service Address' : 'सेवा का पता'}</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">📍 {booking.address}</span>
                      </div>
                      {booking.notes && (
                        <div className="col-span-2 mt-1">
                          <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Instructions' : 'निर्देश'}</span>
                          <span className="italic text-slate-500">“{booking.notes}”</span>
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex justify-end pt-2 border-t border-slate-50">
                        <button type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                        >
                          {language === 'en' ? 'Cancel Request' : 'अनुरोध रद्द करें'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Beauty Rate Card Modal */}
      {rateCardService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-30">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-rose-100 flex justify-between items-center bg-rose-50/80">
              <div>
                <div className="flex items-center gap-1.5">
                  <Scissors className="h-4 w-4 text-rose-600" />
                  <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                    {language === 'hi' ? rateCardService.nameHi : rateCardService.name} - {language === 'en' ? 'Rate Card' : 'रेट कार्ड'}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'en' ? 'Select a package to book or check rates' : 'पैकेज चुनें या रेट देखें'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRateCardService(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-thin">
              {BEAUTY_CATEGORIES.map(bCat => {
                const items = getBeautyItemsForParlour(rateCardService.id, rateCardService.beautyItems);
                const count = items.filter(i => i.category === bCat.id).length;
                const isActive = rateCardCategoryTab === bCat.id;
                return (
                  <button
                    key={bCat.id}
                    type="button"
                    onClick={() => setRateCardCategoryTab(bCat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    <span>{bCat.icon}</span>
                    <span>{language === 'en' ? bCat.nameEn : bCat.nameHi}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Items Grid */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {(() => {
                const items = getBeautyItemsForParlour(rateCardService.id, rateCardService.beautyItems);
                const filtered = items.filter(i => i.category === rateCardCategoryTab);

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold">
                      {language === 'en' ? 'No services in this category.' : 'इस श्रेणी में कोई सेवा उपलब्ध नहीं है।'}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-rose-300 transition"
                      >
                        <div>
                          <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2 bg-slate-100">
                            <img
                              src={item.image}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-extrabold px-2 py-0.5 rounded-lg">
                              ₹{item.price}
                            </div>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-800">
                            {language === 'hi' ? item.titleHi : item.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {language === 'hi' ? item.descriptionHi || item.description : item.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-emerald-700">₹{item.price}</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenBeautyPackageBooking(rateCardService, item);
                              setRateCardService(null);
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <span>💅</span>
                            <span>{language === 'en' ? 'Book Package' : 'बुक करें'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-30">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h2 className="font-black text-sm text-emerald-800 uppercase tracking-wider">
                  {language === 'en' ? 'Book Local Service' : 'स्थानीय सेवा बुक करें'}
                </h2>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {bookingService.name}
                </p>
              </div>
              <button type="button"
                onClick={() => {
                  setBookingService(null);
                  setSelectedBeautyPackage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedBeautyPackage && (
              <div className="bg-rose-50/80 p-3 mx-5 mt-4 rounded-2xl border border-rose-200/80 flex items-center gap-3">
                <img
                  src={selectedBeautyPackage.image}
                  alt={selectedBeautyPackage.title}
                  className="w-12 h-12 rounded-xl object-cover border border-rose-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-rose-600 block">Selected Beauty Package</span>
                  <p className="text-xs font-black text-slate-800 truncate">
                    {language === 'hi' ? selectedBeautyPackage.titleHi : selectedBeautyPackage.title}
                  </p>
                  <span className="text-xs font-extrabold text-emerald-700">₹{selectedBeautyPackage.price}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  {language === 'en' ? 'Select Date' : 'तारीख चुनें'}
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  {language === 'en' ? 'Select Preferred Slot' : 'पसंदीदा समय चुनें'}
                </label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-emerald-500 bg-white"
                >
                  <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                  <option value="01:00 PM">01:00 PM - 03:00 PM</option>
                  <option value="03:00 PM">03:00 PM - 05:00 PM</option>
                  <option value="05:00 PM">05:00 PM - 07:00 PM</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  {language === 'en' ? 'Home Visit Address' : 'घर का पता'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  placeholder={language === 'en' ? 'Enter address for home service' : 'होम सर्विस के लिए पता दर्ज करें'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  {language === 'en' ? 'Instructions for Professional (Optional)' : 'विशेषज्ञ के लिए निर्देश (वैकल्पिक)'}
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Bring extra wiring cable, specific parts, etc.' : 'जैसे- अतिरिक्त वायरिंग केबल लाएं, विशेष स्पेयर पार्ट आदि।'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500 resize-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">
                  {language === 'en' ? 'Estimated Base Charge:' : 'अनुमानित शुरुआती शुल्क:'}
                </span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  ₹{bookingService.baseCharge}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition uppercase tracking-wider font-mono cursor-pointer"
              >
                {language === 'en' ? 'Confirm Booking' : 'बुकिंग की पुष्टि करें'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success SuccessOverlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-30">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-sm w-full border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-extrabold animate-bounce">
              <Check className="h-6 w-6 stroke-[3px]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                {language === 'en' ? 'Service Scheduled Successfully!' : 'सेवा सफलतापूर्वक निर्धारित की गई!'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1">
                {language === 'en' ? 'Booking Reference ID:' : 'बुकिंग संदर्भ आईडी:'}{' '}
                <span className="font-mono text-emerald-600 font-black">{lastBookingId}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {language === 'en'
                  ? 'Your service professional has been notified. They will call you on your registered number to coordinate.'
                  : 'आपके सेवा विशेषज्ञ को सूचित कर दिया गया है। वे समन्वय के लिए आपके पंजीकृत नंबर पर कॉल करेंगे।'}
              </p>
            </div>
            <button type="button"
              onClick={() => {
                setShowSuccessOverlay(false);
                setViewMode('bookings');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition cursor-pointer"
            >
              {language === 'en' ? 'View Bookings' : 'बुकिंग देखें'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
