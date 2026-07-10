import React, { useState } from 'react';
import { Sparkles, Phone, MapPin, Calendar, Clock, Check, X, Shield, Star, Briefcase, Scissors, Wrench, Zap, Eye, CheckCircle2 } from 'lucide-react';
import { LocalService, LocalServiceBooking, RegisteredUser, Language } from '../types';
import { INITIAL_SERVICES } from '../data';

interface ServicesCornerProps {
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: (updater: RegisteredUser[] | ((prev: RegisteredUser[]) => RegisteredUser[])) => void;
  language: Language;
  onAddActivity: (userId: string, actionEn: string, actionHi: string) => void;
}

export default function ServicesCorner({
  language,
  activeUserId,
  onAddActivity,
  users,
  onUpdateUsers
}: ServicesCornerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<LocalService[]>(INITIAL_SERVICES);
  const [bookings, setBookings] = useState<LocalServiceBooking[]>(() => {
    const saved = localStorage.getItem(`mau_service_bookings_${activeUserId}`);
    return saved ? JSON.parse(saved) : [];
  });

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

  const categories = [
    { id: 'beauty', name: 'Beauty Parlour & Salon', nameHi: 'ब्यूटी पार्लर और सैलून', icon: Scissors, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { id: 'tailor', name: 'Tailor & Boutique', nameHi: 'दर्जी और बुटीक', icon: Briefcase, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { id: 'plumber', name: 'Plumber Services', nameHi: 'प्लंबर सेवाएं', icon: Wrench, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { id: 'electrician', name: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { id: 'mechanic', name: 'Mechanic', nameHi: 'मैकेनिक (बाइक/कार)', icon: Wrench, color: 'text-purple-500 bg-purple-50 border-purple-200' }
  ];

  const filteredServices = selectedCategory
    ? services.filter(s => s.category === selectedCategory)
    : services;

  const handleOpenBooking = (service: LocalService) => {
    setBookingService(service);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingSlot('10:00 AM');
    setBookingNotes('');
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
      serviceName: bookingService.name,
      category: bookingService.category,
      date: bookingDate,
      timeslot: bookingSlot,
      status: 'pending',
      address: bookingAddress,
      notes: bookingNotes
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem(`mau_service_bookings_${activeUserId}`, JSON.stringify(updatedBookings));

    setLastBookingId(bookingId);
    setShowSuccessOverlay(true);
    setBookingService(null);

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
      {/* Services Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden border border-emerald-600">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-white/5 h-44 w-44 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-100 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-400/20">
              {language === 'en' ? 'LOCAL HOME SERVICES' : 'स्थानीय गृह सेवाएं'}
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              ✨ {language === 'en' ? 'Verified Professionals' : 'सत्यापित विशेषज्ञ'}
            </span>
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight mt-1.5">
            {language === 'en' ? 'Maudaha Service Desk' : 'मौदहा सेवा डेस्क'}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-lg font-medium leading-relaxed">
            {language === 'en'
              ? 'Find verified local beauty specialists, tailors, plumbers, electricians, and mechanics. Book instantly at transparent base rates.'
              : 'सत्यापित स्थानीय सौंदर्य विशेषज्ञों, दर्जियों, प्लंबर, इलेक्ट्रीशियन और मैकेनिकों को खोजें। पारदर्शी दरों पर तुरंत बुक करें।'}
          </p>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => setViewMode('explore')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                viewMode === 'explore'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/20'
              }`}
            >
              🔍 {language === 'en' ? 'Find Services' : 'सेवाएं खोजें'}
            </button>
            <button
              onClick={() => setViewMode('bookings')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                viewMode === 'bookings'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/20'
              }`}
            >
              📂 {language === 'en' ? 'My Bookings' : 'मेरी बुकिंग'}
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'explore' ? (
        <div className="space-y-6">
          {/* Categories Horizontal Scroller */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 border ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🏠 {language === 'en' ? 'All Categories' : 'सभी श्रेणियां'}
            </button>
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 border flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'en' ? cat.name : cat.nameHi}</span>
                </button>
              );
            })}
          </div>

          {/* Service Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredServices.map((ser) => {
              const catObj = categories.find(c => c.id === ser.category);
              return (
                <div
                  key={ser.id}
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover image */}
                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                      <img
                        src={ser.banner}
                        alt={ser.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border backdrop-blur-md ${catObj?.color || 'bg-white/95 text-slate-800'}`}>
                          {language === 'en' ? catObj?.name : catObj?.nameHi}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg text-xs font-black text-slate-800 border border-slate-100 flex items-center gap-0.5">
                        <span className="text-amber-500">★</span>
                        <span>{ser.rating}</span>
                      </div>
                    </div>

                    {/* Content details */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight">
                        {language === 'hi' ? ser.nameHi : ser.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{language === 'hi' ? ser.addressHi : ser.address}</span>
                      </p>
                      
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold pt-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-600">💼</span>
                          <span>{ser.experience} {language === 'en' ? 'Years Exp' : 'साल अनुभव'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-600">💳</span>
                          <span>₹{ser.baseCharge} {language === 'en' ? 'Base Fee' : 'शुरुआती शुल्क'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="p-4 pt-0 border-t border-slate-50 flex items-center gap-2 mt-2">
                    <a
                      href={`tel:+91${ser.phone}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition duration-200 border border-slate-200/60 flex items-center justify-center"
                      title={language === 'en' ? 'Call Professional' : 'विशेषज्ञ को कॉल करें'}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleOpenBooking(ser)}
                      disabled={!ser.available}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <span>📅</span>
                      <span>{language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
              <button
                onClick={() => setViewMode('explore')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition"
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
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition"
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
              <button
                onClick={() => setBookingService(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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
                  placeholder={language === 'en' ? 'e.g. Bring extra wiring cable, tailoring fabric specs, etc.' : 'जैसे- अतिरिक्त वायरिंग केबल लाएं, दर्जी के लिए कपड़ा विवरण आदि।'}
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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition uppercase tracking-wider font-mono"
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
            <button
              onClick={() => {
                setShowSuccessOverlay(false);
                setViewMode('bookings');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition"
            >
              {language === 'en' ? 'View Bookings' : 'बुकिंग देखें'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
