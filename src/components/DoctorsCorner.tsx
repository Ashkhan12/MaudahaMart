import React, { useState } from 'react';
import { Sparkles, Phone, MapPin, Calendar, Clock, Check, X, Shield, Star, Video, MessageSquare, Heart, CreditCard, User, Landmark, ShieldCheck, FileText, Download, Play, MessageCircle } from 'lucide-react';
import { Doctor, DoctorAppointment, RegisteredUser, Language } from '../types';
import { INITIAL_DOCTORS } from '../data';
import UPIPayment from './UPIPayment';

interface DoctorsCornerProps {
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: (updater: RegisteredUser[] | ((prev: RegisteredUser[]) => RegisteredUser[])) => void;
  language: Language;
  onAddActivity: (userId: string, actionEn: string, actionHi: string) => void;
}

export default function DoctorsCorner({
  language,
  activeUserId,
  onAddActivity,
  users,
  onUpdateUsers
}: DoctorsCornerProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(() => {
    const saved = localStorage.getItem(`mau_doctor_appointments_${activeUserId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingType, setBookingType] = useState<'telehealth' | 'clinic'>('telehealth');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [showUpiScreen, setShowUpiScreen] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [lastAppointmentId, setLastAppointmentId] = useState('');
  const [viewMode, setViewMode] = useState<'explore' | 'appointments' | 'telehealth-live'>('explore');

  // Telehealth live consultation simulator states
  const [activeConsultation, setActiveConsultation] = useState<DoctorAppointment | null>(null);
  const [consultMessages, setConsultMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);
  const [consultStep, setConsultStep] = useState<number>(0); // 0: initial, 1: connecting, 2: active, 3: prescription
  const [showPrescription, setShowPrescription] = useState(false);

  const activeUser = users.find(u => u.id === activeUserId);

  const specialties = [
    { id: 'General Physician', name: 'General Physician', nameHi: 'सामान्य चिकित्सक', icon: '🩺' },
    { id: 'Orthopedics & Joint Specialist', name: 'Orthopedics', nameHi: 'हड्डी रोग विशेषज्ञ', icon: '🦴' },
    { id: 'Gynecologist & Obstetrician', name: 'Gynecologist', nameHi: 'स्त्री रोग विशेषज्ञ', icon: '👶' }
  ];

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialty === selectedSpecialty)
    : doctors;

  const handleOpenBooking = (doc: Doctor) => {
    setBookingDoctor(doc);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingSlot(doc.availableTimeslots[0] || '10:00 AM');
    setBookingType('telehealth');
    setShowUpiScreen(false);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUpiScreen(true);
  };

  const handlePaymentSuccess = () => {
    if (!bookingDoctor) return;

    const appointmentId = 'DOC-' + Math.floor(100000 + Math.random() * 900000);
    const fee = bookingType === 'telehealth' ? bookingDoctor.telehealthFee : bookingDoctor.consultationFee;

    const newAppointment: DoctorAppointment = {
      id: appointmentId,
      userId: activeUserId,
      userName: activeUser?.name || 'Resident',
      userPhone: activeUser?.phone || '9000000000',
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      specialty: bookingDoctor.specialty,
      appointmentType: bookingType,
      date: bookingDate,
      timeslot: bookingSlot,
      feePaid: fee,
      paymentStatus: 'paid',
      status: 'booked',
      telehealthLink: bookingType === 'telehealth' ? `https://telehealth.maudahamart.in/join/${appointmentId}` : undefined,
      prescription: bookingType === 'telehealth' ? undefined : undefined
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    localStorage.setItem(`mau_doctor_appointments_${activeUserId}`, JSON.stringify(updated));

    setLastAppointmentId(appointmentId);
    setShowUpiScreen(false);
    setShowSuccessOverlay(true);
    setBookingDoctor(null);

    onAddActivity(
      activeUserId,
      `Booked ${bookingType} doctor consultation with ${bookingDoctor.name} for ₹${fee}`,
      `${bookingDoctor.name} के साथ ₹${fee} में ${bookingType === 'telehealth' ? 'वीडियो' : 'क्लीनिक'} परामर्श बुक किया`
    );
  };

  // Telehealth live consultation session simulator
  const handleStartTelehealth = (appointment: DoctorAppointment) => {
    setActiveConsultation(appointment);
    setViewMode('telehealth-live');
    setConsultStep(1);
    setConsultMessages([]);
    setShowPrescription(false);

    // Simulate connection
    setTimeout(() => {
      setConsultStep(2);
      const docName = appointment.doctorName;
      setConsultMessages([
        {
          id: 1,
          sender: 'doctor',
          text: language === 'en'
            ? `Hello ${appointment.userName}, I am ${docName}. Thank you for joining our Telehealth consultation today. How can I help you?`
            : `नमस्ते ${appointment.userName}, मैं ${docName} हूँ। आज हमारे टेलीहेल्थ परामर्श में शामिल होने के लिए धन्यवाद। मैं आपकी क्या मदद कर सकता हूँ?`,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConsultation) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setConsultMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.toLowerCase();
    setChatInput('');
    setIsDoctorTyping(true);

    // Simulate doctor dynamic diagnostics answer based on keywords
    setTimeout(() => {
      setIsDoctorTyping(false);
      let reply = '';
      let hiReply = '';

      if (currentInput.includes('fever') || currentInput.includes('bukhar') || currentInput.includes('तापमान')) {
        reply = "I see. It sounds like a viral fever. Please stay hydrated and rest. I will write a digital prescription with Paracetamol (650mg) thrice a day after food.";
        hiReply = "मुझे समझ आ गया। यह वायरल बुखार की तरह लग रहा है। कृपया हाइड्रेटेड रहें और आराम करें। मैं भोजन के बाद दिन में तीन बार पैरासिटामोल (650mg) की डिजिटल पर्ची लिख रहा हूँ।";
      } else if (currentInput.includes('cough') || currentInput.includes('khansi') || currentInput.includes('सर्द')) {
        reply = "A dry cough can be irritating. I suggest warm water gargles and a cough syrup (Benadryl/Ascoril) 10ml twice a day. Rest is highly recommended.";
        hiReply = "सूखी खांसी परेशान करने वाली हो सकती है। मेरा सुझाव है कि आप गर्म पानी से गरारे करें और कफ सिरप (Benadryl/Ascoril) दिन में दो बार 10ml लें। आराम की बहुत सलाह दी जाती है।";
      } else if (currentInput.includes('pain') || currentInput.includes('dard') || currentInput.includes('दर्द')) {
        reply = "Understood. For the pain/inflammation, please avoid heavy lifting. I am prescribing an anti-inflammatory tablet (Aceclofenac) to be taken only SOS (when needed) after food.";
        hiReply = "समझ गया। दर्द/सूजन के लिए, कृपया भारी वजन उठाने से बचें। मैं एक दर्द निवारक टैबलेट (Aceclofenac) लिख रहा हूँ जिसे भोजन के बाद केवल आवश्यकता पड़ने पर ही लिया जाना चाहिए।";
      } else {
        reply = "Thank you for explaining the symptoms. I have noted them down. Based on our clinical discussion, I am creating a medical treatment plan and generating your digital prescription.";
        hiReply = "लक्षणों को समझाने के लिए धन्यवाद। मैंने उन्हें नोट कर लिया है। हमारी चर्चा के आधार पर, मैं एक उपचार योजना तैयार कर रहा हूँ और आपकी डिजिटल पर्ची जनरेट कर रहा हूँ।";
      }

      const docMsg = {
        id: Date.now() + 1,
        sender: 'doctor',
        text: language === 'en' ? reply : hiReply,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setConsultMessages(prev => [...prev, docMsg]);

      // Trigger prescription generation step shortly after
      setTimeout(() => {
        setConsultStep(3);
        const updatedAppointments = appointments.map(app => {
          if (app.id === activeConsultation.id) {
            return {
              ...app,
              status: 'completed' as const,
              prescription: language === 'en'
                ? `Rx:\n1. Tab. Paracetamol 650mg -- 1 tab thrice a day for 3 days.\n2. Syr. Benadryl -- 10ml twice a day for 5 days.\n3. Tab. Vitamin C -- Once a day for 10 days.\n\nAdvice: Rest well, drink lukewarm fluids.`
                : `Rx:\n1. टैबलेट पैरासिटामोल 650mg -- 1 टैबलेट दिन में तीन बार, 3 दिनों के लिए।\n2. सिरप बेनाड्रिल -- 10ml दिन में दो बार, 5 दिनों के लिए।\n3. टैबलेट विटामिन सी -- दिन में एक बार, 10 दिनों के लिए।\n\nसलाह: आराम करें, गुनगुना पानी पिएं।`
            };
          }
          return app;
        });
        setAppointments(updatedAppointments);
        localStorage.setItem(`mau_doctor_appointments_${activeUserId}`, JSON.stringify(updatedAppointments));
      }, 3000);

    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="doctors-corner">
      {/* Doctors Corner Header */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden border border-blue-600">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-white/5 h-44 w-44 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/30 text-blue-100 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-400/20">
              {language === 'en' ? 'MAUDAHA DIGITAL HEALTH' : 'मौदहा डिजिटल स्वास्थ्य'}
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              ★ {language === 'en' ? 'Verified Specialists' : 'सत्यापित विशेषज्ञ डॉक्टर'}
            </span>
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight mt-1.5">
            {language === 'en' ? 'Doctor Booking Desk' : 'डॉक्टर बुकिंग डेस्क'}
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-lg font-medium leading-relaxed">
            {language === 'en'
              ? 'Onboard qualified doctors under two distinct formats: secure virtual consultations (Telehealth) entirely within our app, or physical clinic bookings with easy online slot registration.'
              : 'विशेषज्ञ डॉक्टरों से परामर्श लें: ऐप के भीतर सुरक्षित वर्चुअल परामर्श (टेलीहेल्थ), या आसान ऑनलाइन स्लॉट बुकिंग के साथ क्लिनिक अपॉइंटमेंट।'}
          </p>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => {
                setViewMode('explore');
                setActiveConsultation(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                viewMode === 'explore'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/20'
              }`}
            >
              🩺 {language === 'en' ? 'Find Doctors' : 'डॉक्टर खोजें'}
            </button>
            <button
              onClick={() => {
                setViewMode('appointments');
                setActiveConsultation(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                viewMode === 'appointments'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/20'
              }`}
            >
              📂 {language === 'en' ? 'My Appointments' : 'मेरे अपॉइंटमेंट'}
              {appointments.filter(a => a.status === 'booked').length > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {appointments.filter(a => a.status === 'booked').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'explore' ? (
        <div className="space-y-6">
          {/* Specialties horizontal scroller */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedSpecialty(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 border ${
                selectedSpecialty === null
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🏥 {language === 'en' ? 'All Specialists' : 'सभी विशेषज्ञ'}
            </button>
            {specialties.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 border flex items-center gap-1.5 ${
                  selectedSpecialty === spec.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{spec.icon}</span>
                <span>{language === 'en' ? spec.name : spec.nameHi}</span>
              </button>
            ))}
          </div>

          {/* Doctors Listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={doc.banner}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 shadow-sm">
                        {language === 'hi' ? doc.specialtyHi : doc.specialty}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg text-xs font-black text-slate-800 border border-slate-100 flex items-center gap-0.5">
                      <span className="text-amber-500">★</span>
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight">
                      {language === 'hi' ? doc.nameHi : doc.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                      <span>🏥</span>
                      <span>{language === 'hi' ? doc.clinicNameHi : doc.clinicName}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
                      <span>{language === 'hi' ? doc.addressHi : doc.address}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-bold">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        💼 {doc.experience} {language === 'en' ? 'Yrs Exp' : 'साल अनुभव'}
                      </span>
                      {doc.isTelehealthAvailable && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md flex items-center gap-0.5">
                          <Video className="h-2.5 w-2.5" />
                          {language === 'en' ? 'Telehealth Available' : 'ऑनलाइन परामर्श'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-50 flex items-center gap-2 mt-2">
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">{language === 'en' ? 'Consult Fee' : 'शुल्क'}</span>
                    <span className="font-mono text-xs font-black text-emerald-600">
                      ₹{doc.telehealthFee} <span className="text-[9px] text-slate-400 font-bold">/ {language === 'en' ? 'Online' : 'ऑनलाइन'}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenBooking(doc)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition"
                  >
                    📅 {language === 'en' ? 'Book Now' : 'बुक करें'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'appointments' ? (
        /* My Appointments History & Status */
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Consultation Appointments' : 'परामर्श अपॉइंटमेंट'}
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2 py-0.5 rounded-full">
              {appointments.length} {language === 'en' ? 'total' : 'कुल'}
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
              <div className="text-3xl">📂</div>
              <p className="text-xs font-bold text-slate-400">
                {language === 'en' ? 'No consultation history found.' : 'कोई परामर्श इतिहास नहीं मिला।'}
              </p>
              <button
                onClick={() => setViewMode('explore')}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition"
              >
                {language === 'en' ? 'Explore Doctors' : 'डॉक्टर देखें'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((app) => {
                const isTelehealth = app.appointmentType === 'telehealth';
                const isBooked = app.status === 'booked';
                const isCompleted = app.status === 'completed';
                return (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 hover:border-blue-500/20 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black font-mono">
                          #{app.id}
                        </span>
                        <h3 className="font-black text-sm text-slate-800 tracking-tight mt-1">
                          {app.doctorName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          {isTelehealth ? <Video className="h-3 w-3 text-emerald-500" /> : '📍'}
                          {isTelehealth ? (language === 'en' ? 'TELEHEALTH CONSULT' : 'वीडियो परामर्श') : (language === 'en' ? 'CLINIC VISIT' : 'क्लीनिक विज़िट')}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border ${
                        isBooked
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-rose-50 text-rose-500 border-rose-200'
                      }`}>
                        {app.status === 'booked' && (language === 'en' ? 'BOOKED' : 'निर्धारित')}
                        {app.status === 'completed' && (language === 'en' ? 'COMPLETED' : 'पूर्ण')}
                        {app.status === 'cancelled' && (language === 'en' ? 'CANCELLED' : 'रद्द')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-50">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Appointment Date' : 'तारीख'}</span>
                        <span className="font-bold flex items-center gap-1">📅 {app.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Scheduled Slot' : 'समय'}</span>
                        <span className="font-bold flex items-center gap-1">⏰ {app.timeslot}</span>
                      </div>
                      <div className="col-span-2 mt-2">
                        <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Consultation Fee Paid (Online)' : 'शुल्क भुगतान (ऑनलाइन)'}</span>
                        <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">💳 ₹{app.feePaid} (Paid Via UPI)</span>
                      </div>
                    </div>

                    {/* Booking-specific active actions */}
                    {isBooked && (
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                        {isTelehealth ? (
                          <button
                            onClick={() => handleStartTelehealth(app)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition animate-pulse"
                          >
                            <Play className="h-3 w-3 fill-white" />
                            <span>{language === 'en' ? 'Start Consult Now' : 'परामर्श शुरू करें'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md font-semibold italic">
                            📍 {language === 'en' ? 'Show slip at the physical clinic desk' : 'क्लीनिक काउंटर पर यह पर्ची दिखाएं'}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            const updated = appointments.map(a => a.id === app.id ? { ...a, status: 'cancelled' as const } : a);
                            setAppointments(updated);
                            localStorage.setItem(`mau_doctor_appointments_${activeUserId}`, JSON.stringify(updated));
                          }}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 text-xs font-bold rounded-xl transition"
                        >
                          {language === 'en' ? 'Cancel' : 'रद्द करें'}
                        </button>
                      </div>
                    )}

                    {/* Prescription view */}
                    {isCompleted && app.prescription && (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mt-2 space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                          <span className="text-[10px] text-emerald-700 font-black tracking-wider uppercase flex items-center gap-1">
                            📄 {language === 'en' ? 'DIGITAL PRESCRIPTION GENERATED' : 'डिजिटल पर्ची उपलब्ध'}
                          </span>
                          <button
                            onClick={() => alert(language === 'en' ? 'Downloading PDF Prescription...' : 'डिजिटल पर्ची PDF डाउनलोड हो रही है...')}
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            <Download className="h-3 w-3" />
                            {language === 'en' ? 'Download' : 'डाउनलोड'}
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {app.prescription}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Telehealth Live Consultation Simulator Screen */
        <div className="bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[520px]">
          {/* Top Video call bar */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500 overflow-hidden flex items-center justify-center font-bold text-blue-400">
                {activeConsultation?.doctorName.substring(4, 6) || 'DR'}
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white leading-tight">
                  {activeConsultation?.doctorName}
                </h3>
                <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  {language === 'en' ? 'LIVE TELEHEALTH SESSION' : 'लाइव टेलीहेल्थ सत्र'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm(language === 'en' ? 'Are you sure you want to exit the consultation?' : 'क्या आप वाकई परामर्श सत्र से बाहर निकलना चाहते हैं?')) {
                  setViewMode('appointments');
                  setActiveConsultation(null);
                }
              }}
              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition duration-200"
              title={language === 'en' ? 'Disconnect Consultation' : 'सत्र समाप्त करें'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Video Simulator split panel (Mock camera and chat box) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Mock Camera feed (takes 40% of space) */}
            <div className="h-44 md:h-full md:w-5/12 bg-slate-950 relative border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-center items-center overflow-hidden">
              {consultStep === 1 ? (
                <div className="text-center space-y-2.5 z-10 p-4">
                  <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                    {language === 'en' ? 'CONNECTING SECURE CHANNEL...' : 'सुरक्षित चैनल कनेक्ट हो रहा है...'}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-3">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-10"></div>
                  {/* Mock Doctor Video background */}
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600"
                    alt="Doctor Video Feed"
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* Participant Labels */}
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-white px-2 py-0.5 rounded-lg border border-slate-800 z-20">
                    🔴 {activeConsultation?.doctorName}
                  </span>

                  <div className="absolute bottom-3 right-3 h-20 w-16 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden z-20 shadow-lg">
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-black">
                      👩‍⚕️ {language === 'en' ? 'You' : 'आप'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Chat Box (takes remaining space) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {consultMessages.map((msg) => {
                  const isDoc = msg.sender === 'doctor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isDoc ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isDoc
                          ? 'bg-slate-800 text-slate-100 border border-slate-700'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-500 font-bold mt-0.5 px-1">
                        {msg.time}
                      </span>
                    </div>
                  );
                })}

                {isDoctorTyping && (
                  <div className="flex items-center gap-1.5 p-2 bg-slate-850 border border-slate-800 rounded-2xl max-w-[120px]">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}

                {consultStep === 3 && (
                  <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-2xl p-4 text-center space-y-2 animate-in slide-in-from-bottom-2">
                    <span className="text-[18px]">📄</span>
                    <p className="text-xs font-extrabold text-emerald-400">
                      {language === 'en' ? 'Digital Prescription Available!' : 'डिजिटल पर्ची तैयार है!'}
                    </p>
                    <button
                      onClick={() => {
                        setShowPrescription(true);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition"
                    >
                      🔍 {language === 'en' ? 'View Prescription' : 'पर्ची देखें'}
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              {consultStep === 2 && (
                <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={language === 'en' ? 'Type symptom (fever, cough, pain)...' : 'लक्षण दर्ज करें (बुखार, खांसी, दर्द)...'}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prescription Overlay Dialog */}
      {showPrescription && activeConsultation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-30">
          <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black font-mono">
                  Maudaha Smart Rx Slip
                </span>
                <h3 className="font-black text-sm text-slate-800 tracking-tight mt-1">
                  {language === 'en' ? 'Digital Rx Slip' : 'डिजिटल पर्ची (Rx)'}
                </h3>
              </div>
              <button
                onClick={() => setShowPrescription(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200/60 pb-2 mb-2">
                <span>Patient: {activeUser?.name}</span>
                <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <pre className="text-xs font-mono font-medium leading-relaxed whitespace-pre-wrap text-slate-700">
                {language === 'en'
                  ? `Rx:\n1. Tab. Paracetamol 650mg -- 1 tab thrice a day for 3 days.\n2. Syr. Benadryl -- 10ml twice a day for 5 days.\n3. Tab. Vitamin C -- Once a day for 10 days.\n\nAdvice: Rest well, drink lukewarm fluids.\n\nSigned,\n${activeConsultation.doctorName}`
                  : `Rx:\n1. टैबलेट पैरासिटामोल 650mg -- 1 टैबलेट दिन में तीन बार, 3 दिनों के लिए।\n2. सिरप बेनाड्रिल -- 10ml दिन में दो बार, 5 दिनों के लिए।\n3. टैबलेट विटामिन सी -- दिन में एक बार, 10 दिनों के लिए।\n\nसलाह: आराम करें, गुनगुना पानी पिएं।\n\nहस्ताक्षर,\n${activeConsultation.doctorName}`}
              </pre>
            </div>

            <button
              onClick={() => {
                setShowPrescription(false);
                setViewMode('appointments');
                setActiveConsultation(null);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition"
            >
              {language === 'en' ? 'Close & Save to History' : 'बंद करें और इतिहास में सहेजें'}
            </button>
          </div>
        </div>
      )}

      {/* Booking Slot Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-30">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="font-black text-sm text-blue-800 uppercase tracking-wider">
                  {language === 'en' ? 'Book Consultation' : 'परामर्श बुक करें'}
                </h2>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                  {bookingDoctor.name}
                </p>
              </div>
              <button
                onClick={() => setBookingDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!showUpiScreen ? (
              <form onSubmit={handleProceedToPayment} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    {language === 'en' ? 'Select Consultation Type' : 'परामर्श प्रकार चुनें'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingType('telehealth')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        bookingType === 'telehealth'
                          ? 'border-blue-500 bg-blue-50/50 text-blue-800 font-black'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                      <span className="text-xs block">{language === 'en' ? 'Telehealth (Online)' : 'वर्चुअल (वीडियो)'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">₹{bookingDoctor.telehealthFee}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingType('clinic')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        bookingType === 'clinic'
                          ? 'border-blue-500 bg-blue-50/50 text-blue-800 font-black'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg block mb-1">📍</span>
                      <span className="text-xs block">{language === 'en' ? 'Clinic Booking' : 'क्लिनिक अपॉइंटमेंट'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">₹{bookingDoctor.consultationFee}</span>
                    </button>
                  </div>
                </div>

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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    {language === 'en' ? 'Select Timeslot' : 'समय स्लॉट चुनें'}
                  </label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-blue-500 bg-white"
                  >
                    {bookingDoctor.availableTimeslots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">
                    {language === 'en' ? 'Payable Consultation Fee:' : 'कुल देय परामर्श शुल्क:'}
                  </span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    ₹{bookingType === 'telehealth' ? bookingDoctor.telehealthFee : bookingDoctor.consultationFee}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition uppercase tracking-wider font-mono"
                >
                  {language === 'en' ? 'Proceed to Online Payment' : 'ऑनलाइन भुगतान के लिए आगे बढ़ें'}
                </button>
              </form>
            ) : (
              /* Online Payment UPI Integration screen */
              <div className="p-5">
                <UPIPayment
                  amount={bookingType === 'telehealth' ? bookingDoctor.telehealthFee : bookingDoctor.consultationFee}
                  sellerUpiId={bookingDoctor.upiId || 'maudahadoctors@upi'}
                  onPaymentSuccess={handlePaymentSuccess}
                  language={language}
                />
                <button
                  type="button"
                  onClick={() => setShowUpiScreen(false)}
                  className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  {language === 'en' ? 'Cancel Payment' : 'भुगतान रद्द करें'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification Popup */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-30">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-sm w-full border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-extrabold animate-bounce">
              <Check className="h-6 w-6 stroke-[3px]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                {language === 'en' ? 'Appointment Confirmed!' : 'अपॉइंटमेंट की पुष्टि हो गई!'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1">
                {language === 'en' ? 'Appointment ID:' : 'अपॉइंटमेंट आईडी:'}{' '}
                <span className="font-mono text-blue-600 font-black">{lastAppointmentId}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {language === 'en'
                  ? 'Your slot has been reserved. For virtual consultations, join via active room from My Appointments tab.'
                  : 'आपका स्लॉट आरक्षित कर लिया गया है। वीडियो परामर्श के लिए, मेरे अपॉइंटमेंट टैब से लाइव रूम में शामिल हों।'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccessOverlay(false);
                setViewMode('appointments');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition"
            >
              {language === 'en' ? 'Go to Appointments' : 'अपॉइंटमेंट देखें'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
