/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plane, Search, Calendar, User, Shield, PlaneTakeoff, Info, Ticket, 
  QrCode, Clock, ShieldAlert, Globe, Sparkles, Coffee, Wifi, Check, ChevronDown, ArrowRight 
} from 'lucide-react';
import { RegisteredUser, Language, FlightBooking } from '../types';

interface FlightBookingCornerProps {
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: (updater: RegisteredUser[] | ((prev: RegisteredUser[]) => RegisteredUser[])) => void;
  language: Language;
  onAddActivity: (userId: string, actionEn: string, actionHi: string) => void;
}

// Popular preloaded National and International airports
const AIRPORTS_LIST = [
  // National (India)
  { code: 'DEL', name: 'Indira Gandhi Intl Airport', city: 'Delhi', country: 'India', isIntl: false },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Airport', city: 'Mumbai', country: 'India', isIntl: false },
  { code: 'BLR', name: 'Kempegowda Intl Airport', city: 'Bengaluru', country: 'India', isIntl: false },
  { code: 'LKO', name: 'Chaudhary Charan Singh Airport', city: 'Lucknow', country: 'India', isIntl: false },
  { code: 'KNU', name: 'Kanpur Chakeri Airport', city: 'Kanpur', country: 'India', isIntl: false },
  { code: 'CCU', name: 'Netaji Subhash Chandra Bose Airport', city: 'Kolkata', country: 'India', isIntl: false },
  // International
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', isIntl: true },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', isIntl: true },
  { code: 'JFK', name: 'John F. Kennedy Intl Airport', city: 'New York', country: 'USA', isIntl: true },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', isIntl: true },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', isIntl: true },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', isIntl: true }
];

export default function FlightBookingCorner({
  activeUserId,
  users,
  onUpdateUsers,
  language,
  onAddActivity
}: FlightBookingCornerProps) {
  // Search state
  const [fromCode, setFromCode] = useState('LKO');
  const [toCode, setToCode] = useState('DEL');
  const [fromSearch, setFromSearch] = useState('LKO - Lucknow');
  const [toSearch, setToSearch] = useState('DEL - Delhi');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Custom added airports tracker
  const [customAirports, setCustomAirports] = useState<Record<string, typeof AIRPORTS_LIST[0]>>({});

  const [journeyDate, setJourneyDate] = useState('2026-07-20');
  const [passenger, setPassenger] = useState('');
  const [searched, setSearched] = useState(false);
  const [availableFlights, setAvailableFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookingClass, setBookingClass] = useState<'Economy' | 'Business'>('Economy');
  const [showPayment, setShowPayment] = useState(false);
  const [bookedTicket, setBookedTicket] = useState<FlightBooking | null>(null);

  // Payment UI states
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [paymentVerifying, setPaymentVerifying] = useState(false);

  const currentUser = users.find(u => u.id === activeUserId);
  const bookings = currentUser?.flightBookings || [];

  // Get details for any code (preloaded or custom)
  const getAirport = (code: string) => {
    if (customAirports[code]) return customAirports[code];
    const std = AIRPORTS_LIST.find(a => a.code === code);
    if (std) return std;
    return { code, name: `${code} Custom Terminal`, city: code, country: 'Custom Location', isIntl: true };
  };

  const currentFrom = getAirport(fromCode);
  const currentTo = getAirport(toCode);
  const isRouteIntl = currentFrom.isIntl || currentTo.isIntl;

  // Handle typed custom airports
  const handleCustomRegister = (text: string, type: 'from' | 'to') => {
    const clean = text.trim();
    if (!clean) return;
    const parts = clean.split('-');
    const code = parts[0].trim().toUpperCase().substring(0, 4);
    const city = parts[1] ? parts[1].trim() : clean;
    
    const customAp = {
      code,
      name: `${city} International Hub`,
      city,
      country: 'International',
      isIntl: true
    };

    setCustomAirports(prev => ({ ...prev, [code]: customAp }));
    if (type === 'from') {
      setFromCode(code);
      setFromSearch(`${code} - ${city}`);
      setFromOpen(false);
    } else {
      setToCode(code);
      setToSearch(`${code} - ${city}`);
      setToOpen(false);
    }
  };

  // Generate realistic flights on the fly
  const handleSearchFlights = (e: React.FormEvent) => {
    e.preventDefault();
    const isIntl = isRouteIntl;
    const basePrice = isIntl ? 28000 : 3900;
    
    const airlines = isIntl 
      ? ['Emirates', 'Air India', 'Singapore Airlines', 'Qatar Airways'] 
      : ['IndiGo', 'Air India', 'SpiceJet', 'Akasa Air'];

    const times = [
      { dep: '07:30 AM', arr: '09:15 AM', duration: '1h 45m', gate: '3B' },
      { dep: '12:15 PM', arr: '02:00 PM', duration: '1h 45m', gate: '1A' },
      { dep: '05:40 PM', arr: '07:25 PM', duration: '1h 45m', gate: '2C' },
      { dep: '09:50 PM', arr: '11:35 PM', duration: '1h 45m', gate: '4' }
    ];

    const generated = times.map((t, idx) => {
      const airline = airlines[idx % airlines.length];
      const code = airline.substring(0, 2).toUpperCase();
      const num = 100 + Math.floor(Math.sin(idx + 1) * 899);
      
      // Calculate realistic duration based on international
      const actualDuration = isIntl ? '7h 15m' : t.duration;
      const actualArrTime = isIntl ? '04:45 PM' : t.arr;
      const actualPrice = Math.round(basePrice * (1 + (idx * 0.15)));

      return {
        id: `fl-${fromCode}-${toCode}-${idx}`,
        flightNumber: `${code}-${num}`,
        airline,
        price: actualPrice,
        departureTime: t.dep,
        arrivalTime: actualArrTime,
        duration: actualDuration,
        gate: t.gate,
        isIntl
      };
    });

    setAvailableFlights(generated);
    setSearched(true);
    setSelectedFlight(null);
    setSelectedSeat(null);
    setShowPayment(false);
    setBookedTicket(null);
  };

  // Simulated occupied seats based on flight selection
  const occupiedSeats = React.useMemo(() => {
    if (!selectedFlight) return new Set<string>();
    const set = new Set<string>();
    const list = ['1B', '1D', '3A', '3E', '4C', '5F', '6B', '6D', '7E', '8A'];
    list.forEach(s => {
      // Deterministic based on flightNumber
      if ((selectedFlight.flightNumber.charCodeAt(3) || 5) % 2 === 0) {
        set.add(s);
      }
    });
    return set;
  }, [selectedFlight]);

  const handleBookTicket = (priceValue: number, adminProfitValue: number) => {
    if (!selectedFlight) return;
    const finalPassenger = passenger.trim() || currentUser?.name || 'Guest Passenger';
    const finalSeat = selectedSeat || '4A';

    const newBooking: FlightBooking = {
      id: `fl-bk-${Date.now()}`,
      flightNumber: selectedFlight.flightNumber,
      airline: selectedFlight.airline,
      from: fromCode,
      to: toCode,
      departureTime: selectedFlight.departureTime,
      departureDate: journeyDate,
      arrivalTime: selectedFlight.arrivalTime,
      seat: finalSeat,
      passengerName: finalPassenger,
      className: bookingClass,
      gate: selectedFlight.gate,
      qrCode: `FLIGHT-${selectedFlight.flightNumber}-${finalSeat}-${Date.now()}`,
      price: priceValue,
      adminProfit: adminProfitValue,
      adminUpiId: 'dingdang7081@okhdfcbank',
      paymentStatus: 'completed'
    };

    onUpdateUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === activeUserId) {
          const bks = u.flightBookings || [];
          return { ...u, flightBookings: [newBooking, ...bks] };
        }
        return u;
      })
    );

    onAddActivity(
      activeUserId,
      `Booked ${isRouteIntl ? 'International' : 'Domestic'} flight ticket ${selectedFlight.flightNumber} from ${fromCode} to ${toCode} (₹${priceValue} paid with 3% Admin commission ₹${adminProfitValue} routed to dingdang7081@okhdfcbank)`,
      `फ्लाइट टिकट ${selectedFlight.flightNumber} ${fromCode} से ${toCode} बुक किया (₹${priceValue} का भुगतान 3% एडमिन लाभांश ₹${adminProfitValue} के साथ यूपीआई dingdang7081@okhdfcbank पर भेजा गया)`
    );

    setBookedTicket(newBooking);
    setShowPayment(false);
    setSelectedFlight(null);
    setSearched(false);
  };

  const businessAddon = isRouteIntl ? 12000 : 3000;
  const currentBasePrice = selectedFlight ? (selectedFlight.price + (bookingClass === 'Business' ? businessAddon : 0)) : 0;
  const adminProfit = Math.round(currentBasePrice * 0.03);
  const finalTotal = currentBasePrice + adminProfit;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="flight-booking-corner">
      {/* Search close helper overlays */}
      {fromOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setFromOpen(false)} />}
      {toOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setToOpen(false)} />}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden border border-emerald-950/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-white/5 h-44 w-44 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <Plane className="h-8 w-8 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">
                  {language === 'en' ? 'Maudaha Jetway Airport Desk' : 'मौदहा जेटवे एयरपोर्ट डेस्क'}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/10">
                  {isRouteIntl ? '🌐 INTL HUB' : '🇮🇳 NATIONAL'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-1">
                {language === 'en' 
                  ? 'Book departures from ANY domestic or international airport in the world.' 
                  : 'दुनिया के किसी भी घरेलू या अंतर्राष्ट्रीय हवाई अड्डे से टिकट बुक करें।'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <PlaneTakeoff className="h-4 w-4 text-emerald-600" />
              <span>{language === 'en' ? 'Search Flight Route' : 'फ्लाइट मार्ग खोजें'}</span>
            </h3>

            <form onSubmit={handleSearchFlights} className="space-y-4">
              {/* Departure Search input */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'Departure Airport' : 'कहां से (हवाई अड्डा)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fromSearch}
                    onFocus={(e) => { e.target.select(); setFromOpen(true); }}
                    onChange={(e) => {
                      setFromSearch(e.target.value);
                      setFromOpen(true);
                    }}
                    placeholder="Search city/code, e.g. LKO"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>

                {fromOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest p-1 block">Popular Terminals</span>
                    {AIRPORTS_LIST.filter(a => 
                      a.code.toLowerCase().includes(fromSearch.toLowerCase()) ||
                      a.city.toLowerCase().includes(fromSearch.toLowerCase()) ||
                      a.name.toLowerCase().includes(fromSearch.toLowerCase())
                    ).map(a => (
                      <button
                        type="button"
                        key={a.code}
                        onClick={() => {
                          setFromCode(a.code);
                          setFromSearch(`${a.code} - ${a.city}`);
                          setFromOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer"
                      >
                        <span>{a.code} - {a.city}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{a.name}</span>
                      </button>
                    ))}
                    {fromSearch.trim().length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleCustomRegister(fromSearch, 'from')}
                        className="w-full text-left p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>➕ Use Typed Custom:</span>
                        <span className="underline">{fromSearch.trim().toUpperCase()}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Destination Search input */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'Arrival Airport' : 'कहां तक (हवाई अड्डा)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={toSearch}
                    onFocus={(e) => { e.target.select(); setToOpen(true); }}
                    onChange={(e) => {
                      setToSearch(e.target.value);
                      setToOpen(true);
                    }}
                    placeholder="Search city/code, e.g. DXB"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>

                {toOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest p-1 block">Popular Terminals</span>
                    {AIRPORTS_LIST.filter(a => 
                      a.code.toLowerCase().includes(toSearch.toLowerCase()) ||
                      a.city.toLowerCase().includes(toSearch.toLowerCase()) ||
                      a.name.toLowerCase().includes(toSearch.toLowerCase())
                    ).map(a => (
                      <button
                        type="button"
                        key={a.code}
                        onClick={() => {
                          setToCode(a.code);
                          setToSearch(`${a.code} - ${a.city}`);
                          setToOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer"
                      >
                        <span>{a.code} - {a.city}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{a.name}</span>
                      </button>
                    ))}
                    {toSearch.trim().length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleCustomRegister(toSearch, 'to')}
                        className="w-full text-left p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>➕ Use Typed Custom:</span>
                        <span className="underline">{toSearch.trim().toUpperCase()}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Departure Date */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'Departure Date' : 'यात्रा की तारीख'}
                </label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              {/* Passenger Name */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'Passenger Name' : 'यात्री का नाम'}
                </label>
                <input
                  type="text"
                  placeholder={currentUser?.name || 'Ramesh Kumar'}
                  value={passenger}
                  onChange={(e) => setPassenger(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="h-4 w-4" />
                <span>{language === 'en' ? 'Search Flight Connections' : 'फ्लाइट कनेक्शन खोजें'}</span>
              </button>
            </form>
          </div>

          {/* Dynamic International Desk Advisor */}
          {isRouteIntl && (
            <div className="bg-gradient-to-br from-cyan-900 to-indigo-950 text-white p-5 rounded-3xl space-y-3 shadow-md animate-in fade-in duration-300">
              <h4 className="text-xs font-black tracking-wider flex items-center gap-1.5 text-cyan-300">
                <Globe className="h-4 w-4 animate-spin-slow" />
                <span>🌐 INTERNATIONAL TRANSIT ADVISORY</span>
              </h4>
              <p className="text-[11px] text-cyan-100 font-bold leading-relaxed">
                {language === 'en'
                  ? 'You are searching an international route. Ensure you possess a valid passport (minimum 6 months remaining) and required transit/visa clearance.'
                  : 'आप अंतर्राष्ट्रीय मार्ग की खोज कर रहे हैं। सुनिश्चित करें कि आपके पास कम से कम 6 महीने की वैधता वाला पासपोर्ट और आवश्यक वीजा हो।'}
              </p>
              <div className="border-t border-cyan-800/50 pt-2 text-[10px] space-y-1.5 text-cyan-200">
                <div className="flex justify-between font-mono">
                  <span>Currency Est:</span>
                  <span>1 USD ≈ ₹83.40</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Luggage Allowance:</span>
                  <span>7kg Cabin / 30kg Checked</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results/Details Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Confirmed booked ticket boarding pass */}
          {bookedTicket && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-4 border-t-4 border-t-emerald-600 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <span className="text-lg">🎉</span>
                    <span>{language === 'en' ? 'Boarding Pass Issued Successfully!' : 'बोर्डिंग पास सफलतापूर्वक जारी किया गया!'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    Keep your digital copy ready to display at airport security gate.
                  </p>
                </div>
                <Ticket className="h-6 w-6 text-emerald-600" />
              </div>

              {/* Digital Tear-Off Boarding Stub */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 relative overflow-hidden">
                {/* Visual Dotted tear-off line */}
                <div className="absolute right-1/4 top-0 bottom-0 border-l-2 border-dashed border-slate-300 hidden md:block"></div>
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-white rounded-full border border-slate-200/60"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-white rounded-full border border-slate-200/60"></div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Left Main Ticket Details */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block">AIRLINE</span>
                        <span className="text-xs font-black text-slate-800">{bookedTicket.airline}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block">FLIGHT NO</span>
                        <span className="text-xs font-black text-slate-800">{bookedTicket.flightNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block">CABIN CLASS</span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{bookedTicket.className}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-b border-slate-200/40">
                      <div>
                        <span className="text-xl font-black text-slate-800 block">{bookedTicket.from}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{getAirport(bookedTicket.from).city}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Plane className="h-5 w-5 text-emerald-600 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">DIRECT</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-800 block">{bookedTicket.to}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{getAirport(bookedTicket.to).city}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black block">PASSENGER</span>
                        <span className="font-bold text-slate-700 truncate block">{bookedTicket.passengerName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black block">SEAT CODE</span>
                        <span className="font-bold text-slate-700 block">{bookedTicket.seat}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black block">BOARDING TIME</span>
                        <span className="font-bold text-indigo-700 block">{bookedTicket.departureTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Stub Area */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/50">
                    <QrCode className="h-16 w-16 text-slate-800" />
                    <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-wider">GATE {bookedTicket.gate}</span>
                    <span className="text-[7px] text-slate-400 font-bold mt-0.5">{bookedTicket.departureDate}</span>
                  </div>
                </div>

                {bookedTicket.price && (
                  <div className="mt-3 text-[10px] text-emerald-800 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/15 font-bold flex justify-between">
                    <span>💳 Paid via UPI Secure Gateway</span>
                    <span className="font-mono">₹{bookedTicket.price} (3% Admin share ₹{bookedTicket.adminProfit} routed to {bookedTicket.adminUpiId})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flights list */}
          {searched && !selectedFlight && !bookedTicket && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <PlaneTakeoff className="h-4 w-4 text-emerald-600" />
                  <span>{language === 'en' ? `Available Connections (${availableFlights.length})` : `उपलब्ध उड़ानें (${availableFlights.length})`}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-black font-mono bg-slate-50 px-2.5 py-1 rounded-lg">
                  {currentFrom.city} ({fromCode}) ➔ {currentTo.city} ({toCode})
                </span>
              </div>

              <div className="space-y-3">
                {availableFlights.map((flight) => (
                  <div key={flight.id} className="p-4 border border-slate-100 rounded-2xl hover:border-emerald-100 hover:shadow-sm transition flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded border border-emerald-100">
                          {flight.airline}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{flight.flightNumber}</span>
                        {isRouteIntl && (
                          <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded">
                            Baggage: 30KG
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-base font-black text-slate-800">{flight.departureTime}</span>
                        <span className="text-xs text-slate-400 font-bold">({fromCode})</span>
                        <span className="text-slate-300">➔</span>
                        <span className="text-base font-black text-slate-800">{flight.arrivalTime}</span>
                        <span className="text-xs text-slate-400 font-bold">({toCode})</span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-slate-400 font-bold mt-1">
                        <span>Duration: {flight.duration}</span>
                        <span>•</span>
                        <span>Gate: {flight.gate}</span>
                        <span>•</span>
                        <span className="text-emerald-600">Non-Stop</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-800 block">₹{flight.price}</span>
                      <button type="button"
                        onClick={() => setSelectedFlight(flight)}
                        className="mt-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl transition cursor-pointer"
                      >
                        {language === 'en' ? 'Select Cabin' : 'कैबिन चुनें'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seat & Cabin configuration (Interactive Flight cabin mock) */}
          {selectedFlight && !bookedTicket && !showPayment && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Configure Cabin Details</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{selectedFlight.airline} • {selectedFlight.flightNumber}</p>
                </div>
                <button type="button" 
                  onClick={() => setSelectedFlight(null)} 
                  className="text-xs font-black text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Back to flights
                </button>
              </div>

              {/* Economy/Business selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cabin Class Upgrade</span>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button"
                    onClick={() => { setBookingClass('Economy'); setSelectedSeat(null); }}
                    className={`py-2.5 px-3 text-xs font-black rounded-xl border transition cursor-pointer flex justify-between items-center ${
                      bookingClass === 'Economy' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Economy Class</span>
                    <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500 cursor-pointer">Standard</span>
                  </button>
                  <button type="button"
                    onClick={() => { setBookingClass('Business'); setSelectedSeat(null); }}
                    className={`py-2.5 px-3 text-xs font-black rounded-xl border transition cursor-pointer flex justify-between items-center ${
                      bookingClass === 'Business' ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Business Class Upgrade</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-mono font-black px-1.5 py-0.5 rounded cursor-pointer">+₹{businessAddon}</span>
                  </button>
                </div>
              </div>

              {/* Layout Cabin Grid Seat Selection */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">Interactive Aircraft Cabin Map</span>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center">
                  
                  {/* Aircraft nose mockup */}
                  <div className="w-full max-w-[280px] bg-white border-2 border-slate-200 rounded-t-[80px] p-4 shadow-sm relative space-y-4">
                    <div className="text-center pt-4 pb-2 border-b border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 tracking-widest block uppercase">FRONT GALLEY / COCKPIT</span>
                      <span className="text-xs font-mono text-indigo-600 font-bold block mt-1">↕ AISLE ↕</span>
                    </div>

                    {/* Seat list */}
                    <div className="space-y-2">
                      {(bookingClass === 'Business' ? ['1', '2'] : ['3', '4', '5', '6', '7', '8']).map((row) => (
                        <div key={row} className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-black text-slate-300 w-3 text-center">{row}</span>
                          
                          {/* Left Seats */}
                          <div className="flex gap-1.5">
                            {['A', 'B', 'C'].filter(letter => bookingClass === 'Economy' || letter !== 'B').map((letter) => {
                              const seat = `${row}${letter}`;
                              const isOccupied = occupiedSeats.has(seat);
                              const isSelected = selectedSeat === seat;
                              return (
                                <button type="button"
                                  key={seat}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seat)}
                                  className={`h-7 w-7 rounded-lg border text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                                    isOccupied 
                                      ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed line-through' 
                                      : isSelected 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md animate-pulse'
                                        : bookingClass === 'Business'
                                          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  {seat}
                                </button>
                              );
                            })}
                          </div>

                          {/* Central Aisle */}
                          <span className="text-[8px] font-mono text-slate-300 select-none cursor-pointer">AISLE</span>

                          {/* Right Seats */}
                          <div className="flex gap-1.5">
                            {['D', 'E', 'F'].filter(letter => bookingClass === 'Economy' || letter !== 'E').map((letter) => {
                              const seat = `${row}${letter}`;
                              const isOccupied = occupiedSeats.has(seat);
                              const isSelected = selectedSeat === seat;
                              return (
                                <button type="button"
                                  key={seat}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seat)}
                                  className={`h-7 w-7 rounded-lg border text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                                    isOccupied 
                                      ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed line-through' 
                                      : isSelected 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md animate-pulse'
                                        : bookingClass === 'Business'
                                          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  {seat}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-2 border-t border-slate-100 text-[8px] font-bold text-slate-400 cursor-pointer">
                      CABIN EXIT ROW
                    </div>
                  </div>

                  {/* Seat Map Legend */}
                  <div className="flex gap-4 mt-4 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="h-3.5 w-3.5 rounded border border-slate-200 bg-white inline-block"></span>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-3.5 w-3.5 rounded bg-emerald-600 inline-block"></span>
                      <span>Your Choice</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-3.5 w-3.5 rounded bg-slate-200 border border-slate-300 inline-block line-through"></span>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom total summary row */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block font-bold">Configure Total Fare:</span>
                  <span className="text-xl font-black text-slate-800">₹{currentBasePrice}</span>
                  <span className="text-[10px] text-slate-400 block font-bold mt-0.5">Selected Seat: <span className="text-emerald-600">{selectedSeat || 'Select seat map above'}</span></span>
                </div>
                <button type="button"
                  onClick={() => {
                    if (!selectedSeat) {
                      alert(language === 'en' ? 'Please select your desired seat first!' : 'कृपया पहले अपनी मनपसंद सीट चुनें!');
                      return;
                    }
                    setShowPayment(true);
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md transition cursor-pointer"
                >
                  {language === 'en' ? 'Proceed to Billing' : 'बिलिंग के लिए आगे बढ़ें'}
                </button>
              </div>
            </div>
          )}

          {/* Secure Payment routing UPI (3% Admin Profit) */}
          {selectedFlight && !bookedTicket && showPayment && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 text-emerald-600">
                  <Shield className="h-4 w-4" />
                  <span>{language === 'en' ? 'UPI Security Payment Gateway' : 'यूपीआई सुरक्षा भुगतान गेटवे'}</span>
                </h3>
                <button type="button" 
                  onClick={() => setShowPayment(false)} 
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {language === 'en' ? '← Back' : '← वापस'}
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Passenger Full Name:</span>
                  <span className="text-slate-800 font-black">{passenger.trim() || currentUser?.name || 'Guest Passenger'}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Route Code Details:</span>
                  <span className="text-slate-800 font-black">{fromCode} ➔ {toCode} ({bookingClass})</span>
                </div>
                <hr className="border-dashed border-slate-200" />
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Base Flight Ticket Fare:</span>
                  <span className="text-slate-800 font-black">₹{currentBasePrice}</span>
                </div>
                <div className="flex justify-between text-xs font-black bg-emerald-500/10 text-emerald-800 p-2 rounded-xl border border-emerald-500/15">
                  <span>Maudaha Admin Profit Share (3%):</span>
                  <span>+₹{adminProfit}</span>
                </div>
                <hr className="border-dashed border-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">Total Payable Amount:</span>
                  <span className="text-base font-black text-slate-900 font-mono">₹{finalTotal}</span>
                </div>
              </div>

              {/* Dynamic simulated payment qr */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-emerald-50 border border-emerald-500/10 p-3 rounded-2xl text-center w-full">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-0.5">🔒 Verified UPI ID Recipient</p>
                  <p className="text-xs font-mono font-black text-slate-800">dingdang7081@okhdfcbank</p>
                </div>

                <div className="relative p-3 bg-slate-900 rounded-2xl border-2 border-emerald-500/20">
                  <div className="w-36 h-36 bg-white p-1 rounded-xl flex flex-col items-center justify-center">
                    <QrCode className="h-28 w-28 text-slate-900" />
                    <span className="text-[8px] font-black text-slate-400 mt-1">BHIM UPI QR</span>
                  </div>
                  {paymentVerifying && (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center rounded-2xl text-white text-center p-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2"></div>
                      <p className="text-xs font-black">Settling routing commission with Admin...</p>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Your UPI ID to Pay</label>
                  <input
                    type="text"
                    value={customerUpiId}
                    onChange={(e) => setCustomerUpiId(e.target.value)}
                    placeholder="e.g. user@ybl"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none"
                  />
                </div>

                <button type="button"
                  onClick={() => {
                    if (!customerUpiId.trim() || !customerUpiId.includes('@')) {
                      alert(language === 'en' ? 'Please specify a valid UPI ID!' : 'कृपया एक वैध यूपीआई आईडी दर्ज करें!');
                      return;
                    }
                    setPaymentVerifying(true);
                    setTimeout(() => {
                      setPaymentVerifying(false);
                      handleBookTicket(finalTotal, adminProfit);
                    }, 2000);
                  }}
                  disabled={paymentVerifying}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>⚡ Pay ₹{finalTotal} & Confirm Boarding</span>
                </button>
              </div>
            </div>
          )}

          {/* Placeholder default state */}
          {!searched && !selectedFlight && !bookedTicket && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-bold space-y-4">
              <div className="h-14 w-14 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-sm">
                ✈️
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-black text-slate-800">Maudaha Air Gateway Search</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'en'
                    ? 'Enter any origin and destination hubs in the left panel to display direct flights, routes, and seat availability.'
                    : 'सीधी उड़ानों, मार्गों और सीट की उपलब्धता देखने के लिए बाईं ओर कोई भी गंतव्य हवाई अड्डा दर्ज करें।'}
                </p>
              </div>
            </div>
          )}

          {/* Booked boarding tickets log list */}
          {bookings.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                {language === 'en' ? 'Your Registered Boarding Passes' : 'आपके पंजीकृत बोर्डिंग पास'}
              </h3>
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] rounded border border-emerald-100 font-black">CNF</span>
                        <span>{b.airline} ({b.flightNumber}) • Seat {b.seat}</span>
                      </span>
                      <div className="text-[10px] text-slate-400 font-bold space-y-0.5">
                        <p>Route: <span className="text-slate-600 font-black">{b.from} ➔ {b.to}</span> | Date: {b.departureDate}</p>
                        <p>Gate: {b.gate} | Class: {b.className} | Passenger: {b.passengerName}</p>
                      </div>
                      {b.price && (
                        <p className="text-[8px] text-emerald-700 font-black bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded inline-block">
                          Total paid: ₹{b.price} (Includes 3% admin commission ₹{b.adminProfit} to {b.adminUpiId})
                        </p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <QrCode className="h-8 w-8 text-slate-700 hidden sm:block" />
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full uppercase">
                        Issued
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
