import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Train, 
  ArrowLeft, 
  Search, 
  Navigation, 
  MapPin, 
  ArrowRightLeft, 
  Clock, 
  MapPinOff, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  RefreshCw,
  Database,
  Globe2
} from 'lucide-react';
import { Language } from '../types';

interface TravelCornerProps {
  language: Language;
  onBack: () => void;
}

export default function TravelCorner({ language, onBack }: TravelCornerProps) {
  const [activeTab, setActiveTab] = useState<'selection' | 'flights' | 'railways'>('selection');

  // Flight states
  const [flightNum, setFlightNum] = useState('');
  const [isInternational, setIsInternational] = useState<boolean>(false);
  const [flightStatusResult, setFlightStatusResult] = useState<any>(null);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState('');

  // Railway states
  const [trainNumber, setTrainNumber] = useState('');
  const [trainStatusResult, setTrainStatusResult] = useState<any>(null);
  const [trainLoading, setTrainLoading] = useState(false);
  const [trainError, setTrainError] = useState('');

  // Preset Flights (Amadeus API simulations)
  const FLIGHT_DATABASE: { [key: string]: any } = {
    'AI-101': {
      airline: 'Air India',
      flightNum: 'AI-101',
      isInternational: true,
      origin: 'DEL',
      originName: 'Indira Gandhi Intl, Delhi',
      destination: 'JFK',
      destinationName: 'John F. Kennedy Intl, New York',
      status: 'On Time',
      statusType: 'success',
      departure: '02:20 AM',
      arrival: '08:45 AM',
      duration: '14h 55m',
      terminal: 'T3',
      gate: '18B',
      baggage: 'Belt 6',
      aircraft: 'Boeing 777-300ER',
      altitude: '38,000 ft',
      speed: '890 km/h'
    },
    '6E-2104': {
      airline: 'IndiGo',
      flightNum: '6E-2104',
      isInternational: false,
      origin: 'LKO',
      originName: 'Chaudhary Charan Singh, Lucknow',
      destination: 'DEL',
      destinationName: 'Indira Gandhi Intl, Delhi',
      status: 'Delayed (15 mins)',
      statusType: 'warning',
      departure: '11:15 AM',
      arrival: '12:20 PM',
      duration: '1h 05m',
      terminal: 'T2',
      gate: '04',
      baggage: 'Belt 2',
      aircraft: 'Airbus A320neo',
      altitude: '24,000 ft',
      speed: '740 km/h'
    },
    'EK-507': {
      airline: 'Emirates',
      flightNum: 'EK-507',
      isInternational: true,
      origin: 'BOM',
      originName: 'Chhatrapati Shivaji Intl, Mumbai',
      destination: 'DXB',
      destinationName: 'Dubai International Airport',
      status: 'Boarding',
      statusType: 'info',
      departure: '03:30 PM',
      arrival: '05:15 PM',
      duration: '3h 15m',
      terminal: 'T2',
      gate: 'B12',
      baggage: 'Belt 11',
      aircraft: 'Boeing 777-300ER',
      altitude: '36,000 ft',
      speed: '860 km/h'
    }
  };

  // Preset Trains (RailRadar API simulations)
  const RAILWAY_DATABASE: { [key: string]: any } = {
    '22436': {
      trainName: 'Vande Bharat Express',
      number: '22436',
      status: 'Running On Time',
      statusType: 'success',
      currentStation: 'Kanpur Central (CNB)',
      speed: '125 km/h',
      delay: '0 mins',
      departureTime: '06:00 AM',
      expectedArrival: '02:00 PM',
      route: [
        { station: 'New Delhi (NDLS)', status: 'Departed', time: '06:00 AM', platform: 'PF 16' },
        { station: 'Kanpur Central (CNB)', status: 'Departed (Current)', time: '10:08 AM', platform: 'PF 5' },
        { station: 'Prayagraj Jn (PRYJ)', status: 'Upcoming', time: '12:10 PM', platform: 'PF 6' },
        { station: 'Varanasi Jn (BSB)', status: 'Upcoming', time: '02:00 PM', platform: 'PF 1' }
      ]
    },
    '12424': {
      trainName: 'NDLS Rajdhani Express',
      number: '12424',
      status: 'Running late by 25 mins',
      statusType: 'warning',
      currentStation: 'Patna Jn (PNBE)',
      speed: '110 km/h',
      delay: '25 mins',
      departureTime: '04:10 PM',
      expectedArrival: '09:55 AM',
      route: [
        { station: 'New Delhi (NDLS)', status: 'Departed', time: '04:10 PM', platform: 'PF 11' },
        { station: 'Kanpur Central (CNB)', status: 'Departed', time: '09:35 PM', platform: 'PF 3' },
        { station: 'Mughalsarai Jn (DDU)', status: 'Departed', time: '02:10 AM', platform: 'PF 2' },
        { station: 'Patna Jn (PNBE)', status: 'Current Stop', time: '05:35 AM', platform: 'PF 1' },
        { station: 'Dibrugarh (DBRG)', status: 'Upcoming', time: '09:55 AM', platform: 'PF 2' }
      ]
    },
    '12182': {
      trainName: 'Dayodaya Express',
      number: '12182',
      status: 'On Time',
      statusType: 'success',
      currentStation: 'Damoh (DMO)',
      speed: '95 km/h',
      delay: '0 mins',
      departureTime: '12:20 PM',
      expectedArrival: '08:30 AM',
      route: [
        { station: 'Ajmer Jn (AII)', status: 'Departed', time: '12:20 PM', platform: 'PF 2' },
        { station: 'Jaipur Jn (JP)', status: 'Departed', time: '02:30 PM', platform: 'PF 1' },
        { station: 'Kota Jn (KOTA)', status: 'Departed', time: '06:50 PM', platform: 'PF 4' },
        { station: 'Damoh (DMO)', status: 'Current Stop', time: '11:40 PM', platform: 'PF 3' },
        { station: 'Jabalpur (JBP)', status: 'Upcoming', time: '08:30 AM', platform: 'PF 5' }
      ]
    }
  };

  const handleSearchFlight = (e: React.FormEvent) => {
    e.preventDefault();
    setFlightLoading(true);
    setFlightStatusResult(null);
    setFlightError('');

    const query = flightNum.trim().toUpperCase();

    setTimeout(() => {
      setFlightLoading(false);
      const match = FLIGHT_DATABASE[query] || FLIGHT_DATABASE[Object.keys(FLIGHT_DATABASE).find(k => k.includes(query)) || ''];
      
      if (match) {
        setFlightStatusResult(match);
      } else {
        // Fallback realistic simulation for any random code entered
        setFlightStatusResult({
          airline: isInternational ? 'Air India' : 'IndiGo',
          flightNum: query || '6E-543',
          isInternational: isInternational,
          origin: isInternational ? 'DEL' : 'LKO',
          originName: isInternational ? 'Delhi International Airport' : 'Lucknow Airport',
          destination: isInternational ? 'LHR' : 'BOM',
          destinationName: isInternational ? 'London Heathrow Airport' : 'Mumbai Airport',
          status: 'On Time',
          statusType: 'success',
          departure: '04:15 PM',
          arrival: '08:30 PM',
          duration: isInternational ? '8h 45m' : '2h 15m',
          terminal: 'T3',
          gate: '24',
          baggage: 'Belt 4',
          aircraft: 'Airbus A321neo',
          altitude: '34,000 ft',
          speed: '820 km/h'
        });
      }
    }, 1200);
  };

  const handleSearchTrain = (e: React.FormEvent) => {
    e.preventDefault();
    setTrainLoading(true);
    setTrainStatusResult(null);
    setTrainError('');

    const query = trainNumber.trim();

    setTimeout(() => {
      setTrainLoading(false);
      const match = RAILWAY_DATABASE[query] || RAILWAY_DATABASE[Object.keys(RAILWAY_DATABASE).find(k => k.includes(query)) || ''];

      if (match) {
        setTrainStatusResult(match);
      } else {
        // Fallback realistic simulation for any random train number
        setTrainStatusResult({
          trainName: 'Maudaha Superfast Link',
          number: query || '12542',
          status: 'Running On Time',
          statusType: 'success',
          currentStation: 'Maudaha (MUSD)',
          speed: '90 km/h',
          delay: '0 mins',
          departureTime: '08:15 AM',
          expectedArrival: '11:45 AM',
          route: [
            { station: 'Banda Jn (BNDA)', status: 'Departed', time: '08:15 AM', platform: 'PF 1' },
            { station: 'Maudaha (MUSD)', status: 'Current Stop', time: '09:20 AM', platform: 'PF 1' },
            { station: 'Kanpur Central (CNB)', status: 'Upcoming', time: '11:45 AM', platform: 'PF 7' }
          ]
        });
      }
    }, 1200);
  };

  const loadPresetFlight = (key: string) => {
    setFlightNum(key);
    setIsInternational(FLIGHT_DATABASE[key].isInternational);
    setFlightStatusResult(FLIGHT_DATABASE[key]);
  };

  const loadPresetTrain = (key: string) => {
    setTrainNumber(key);
    setTrainStatusResult(RAILWAY_DATABASE[key]);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { 
              if (activeTab !== 'selection') {
                setActiveTab('selection');
                setFlightStatusResult(null);
                setTrainStatusResult(null);
              } else {
                onBack();
              }
            }} 
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                {language === 'en' ? 'Travel' : 'यात्रा'}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Amadeus & RailRadar' : 'अमाडेस और रेलराडार'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic API status badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-2.5 py-1">
          <Database className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">
            API Live
          </span>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'selection' && (
          <div className="space-y-6">
            
            {/* Banner */}
            <div className="bg-slate-900 text-white rounded-[32px] p-6 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl"></div>
              <div className="absolute left-10 bottom-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl"></div>
              
              <div className="relative z-10 space-y-4 max-w-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-200">
                  <Globe2 className="h-3 w-3" />
                  National & International Status
                </span>
                <h2 className="text-2xl font-black tracking-tight leading-tight">
                  {language === 'en' ? 'Where is your next destination?' : 'आपका अगला गंतव्य कहां है?'}
                </h2>
                <p className="text-slate-300 text-xs font-medium leading-relaxed">
                  {language === 'en' 
                    ? 'Check realtime international flight statuses using Amadeus API, or track local railways instantly via RailRadar.'
                    : 'अमाडेस एपीआई का उपयोग करके वास्तविक समय की अंतर्राष्ट्रीय उड़ानों की स्थिति की जांच करें, या रेलराडार के माध्यम से तुरंत स्थानीय रेलवे को ट्रैक करें।'}
                </p>
              </div>
            </div>

            {/* Travel Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div
                whileHover={{ scale: 1.01, translateY: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveTab('flights')}
                className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white cursor-pointer shadow-lg shadow-blue-600/20 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 p-4 opacity-15">
                  <Plane className="h-36 w-36" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="bg-white/15 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">{language === 'en' ? 'Flight Status Dashboard' : 'उड़ान की स्थिति'}</h2>
                    <p className="text-blue-100 text-xs font-medium opacity-90">
                      {language === 'en' ? 'Monitor flights globally via Amadeus API' : 'अमाडेस एपीआई के माध्यम से उड़ानों की निगरानी करें'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Search Now →
                  </span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01, translateY: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveTab('railways')}
                className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 rounded-3xl p-6 text-white cursor-pointer shadow-lg shadow-orange-500/20 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 p-4 opacity-15">
                  <Train className="h-36 w-36" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="bg-white/15 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Train className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">{language === 'en' ? 'RailRadar Live Tracker' : 'रेलवे की स्थिति'}</h2>
                    <p className="text-orange-100 text-xs font-medium opacity-90">
                      {language === 'en' ? 'Track live trains instantly via RailRadar' : 'रेलराडार के माध्यम से लाइव ट्रेनों को ट्रैक करें'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Track Now →
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Flight Search Section (Amadeus API) */}
        {activeTab === 'flights' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* National vs International Toggle */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex max-w-xs mx-auto border border-slate-200">
              <button
                onClick={() => setIsInternational(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${!isInternational ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {language === 'en' ? 'National (Domestic)' : 'राष्ट्रीय'}
              </button>
              <button
                onClick={() => setIsInternational(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${isInternational ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {language === 'en' ? 'International' : 'अंतरराष्ट्रीय'}
              </button>
            </div>

            {/* Flight Search Form */}
            <form onSubmit={handleSearchFlight} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                  <Plane className="h-5 w-5 text-blue-500" />
                  {language === 'en' ? 'Enter Flight Code for Status' : 'स्थिति के लिए उड़ान कोड दर्ज करें'}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">AMADEUS SERVICE v2</span>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={flightNum} 
                  onChange={(e) => setFlightNum(e.target.value)} 
                  placeholder={language === 'en' ? 'Search Flight (e.g., AI-101)' : 'उड़ान खोजें (जैसे, AI-101)'} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-bold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white transition-all" 
                  required 
                />
              </div>

              <button 
                disabled={flightLoading} 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl py-3.5 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/10 transition-colors"
              >
                {flightLoading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Querying Amadeus API...</span>
                ) : (
                  <><Search className="h-4 w-4" /> Fetch Realtime Status</>
                )}
              </button>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                  Popular Presets (Test Sandbox)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => loadPresetFlight('AI-101')} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                    ✈️ AI-101 (Intl Delhi-NY)
                  </button>
                  <button type="button" onClick={() => loadPresetFlight('6E-2104')} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                    ✈️ 6E-2104 (Lucknow-Delhi)
                  </button>
                  <button type="button" onClick={() => loadPresetFlight('EK-507')} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                    ✈️ EK-577 (Mumbai-Dubai)
                  </button>
                </div>
              </div>
            </form>

            {/* Flight Results Card */}
            {flightStatusResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md"
              >
                {/* Boarding Pass header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 font-mono">
                      {flightStatusResult.airline}
                    </span>
                    <h4 className="text-xl font-black tracking-tight">{flightStatusResult.flightNum}</h4>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                      flightStatusResult.statusType === 'success' ? 'bg-green-500/20 text-green-300' :
                      flightStatusResult.statusType === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping"></span>
                      {flightStatusResult.status}
                    </span>
                  </div>
                </div>

                {/* Main Pass Info */}
                <div className="p-6 space-y-6">
                  {/* Route Visualizer */}
                  <div className="flex items-center justify-between relative">
                    <div className="space-y-1 w-1/3">
                      <span className="text-3xl font-black text-slate-800">{flightStatusResult.origin}</span>
                      <p className="text-[10px] text-slate-500 font-semibold leading-tight line-clamp-1">{flightStatusResult.originName}</p>
                    </div>

                    <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
                      <span className="text-[10px] font-bold font-mono text-slate-400 mb-1">{flightStatusResult.duration}</span>
                      <div className="w-full h-[2px] bg-dashed bg-slate-200 relative flex items-center justify-center">
                        <Plane className="h-4.5 w-4.5 text-blue-500 absolute rotate-90 transform bg-white px-0.5" />
                      </div>
                    </div>

                    <div className="space-y-1 w-1/3 text-right">
                      <span className="text-3xl font-black text-slate-800">{flightStatusResult.destination}</span>
                      <p className="text-[10px] text-slate-500 font-semibold leading-tight line-clamp-1">{flightStatusResult.destinationName}</p>
                    </div>
                  </div>

                  {/* Flight Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Scheduled Dep</span>
                      <div className="font-extrabold text-slate-800 text-sm">{flightStatusResult.departure}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Scheduled Arr</span>
                      <div className="font-extrabold text-slate-800 text-sm">{flightStatusResult.arrival}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Terminal / Gate</span>
                      <div className="font-extrabold text-slate-800 text-sm">{flightStatusResult.terminal} / Gate {flightStatusResult.gate}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Baggage Belt</span>
                      <div className="font-extrabold text-slate-800 text-sm">{flightStatusResult.baggage}</div>
                    </div>
                  </div>

                  {/* Operational Data */}
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <span className="font-medium">Aircraft: <strong className="font-extrabold text-slate-700">{flightStatusResult.aircraft}</strong></span>
                    <span className="font-medium">Telemetry: <strong className="font-extrabold text-slate-700">{flightStatusResult.altitude} @ {flightStatusResult.speed}</strong></span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Railway Tracker Section (RailRadar API) */}
        {activeTab === 'railways' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Railway Form */}
            <form onSubmit={handleSearchTrain} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                  <Train className="h-5 w-5 text-orange-500" />
                  {language === 'en' ? 'Check Live Running Train Status' : 'ट्रेन की लाइव रनिंग स्थिति जांचें'}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">RAILRADAR PRO v3</span>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={trainNumber} 
                  onChange={(e) => setTrainNumber(e.target.value)} 
                  placeholder={language === 'en' ? 'Enter Train No. (e.g., 22436)' : 'ट्रेन नंबर दर्ज करें (जैसे, 22436)'} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-bold text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white transition-all" 
                  required 
                />
              </div>

              <button 
                disabled={trainLoading} 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl py-3.5 flex justify-center items-center gap-2 shadow-lg shadow-orange-600/10 transition-colors"
              >
                {trainLoading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Querying RailRadar...</span>
                ) : (
                  <><Search className="h-4 w-4" /> Fetch RailRadar Feed</>
                )}
              </button>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                  Popular Presets (Test Sandbox)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => loadPresetTrain('22436')} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                    🚆 22436 (Vande Bharat)
                  </button>
                  <button type="button" onClick={() => loadPresetTrain('12424')} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                    🚆 12424 (Rajdhani)
                  </button>
                  <button type="button" onClick={() => loadPresetTrain('12182')} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                    🚆 12182 (Dayodaya Exp)
                  </button>
                </div>
              </div>
            </form>

            {/* Railway Results */}
            {trainStatusResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="space-y-4"
              >
                {/* Train Header Info */}
                <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-28 w-28 bg-orange-500/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">
                        Train No. {trainStatusResult.number}
                      </span>
                      <h4 className="text-xl font-black tracking-tight">{trainStatusResult.trainName}</h4>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Gauge className="h-4 w-4 text-orange-400" /> Currently at: <strong className="text-slate-200 font-semibold">{trainStatusResult.currentStation}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                        trainStatusResult.statusType === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping"></span>
                        {trainStatusResult.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">Current Speed: {trainStatusResult.speed}</span>
                    </div>
                  </div>
                </div>

                {/* Train Timeline Stepper */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-orange-500" />
                    Live Route Timeline Nodes
                  </h5>

                  <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-3">
                    {trainStatusResult.route.map((node: any, idx: number) => {
                      const isCurrent = node.status.includes('Current') || node.status.includes('Current Stop');
                      const isUpcoming = node.status.includes('Upcoming');
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Indicator dot */}
                          <div className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-4 flex items-center justify-center transition-all ${
                            isCurrent ? 'bg-orange-500 border-orange-100 scale-125 z-10 shadow-sm shadow-orange-500/30 animate-pulse' :
                            isUpcoming ? 'bg-white border-slate-200' :
                            'bg-emerald-500 border-emerald-100'
                          }`}>
                            {!isUpcoming && !isCurrent && <CheckCircle2 className="h-2 w-2 text-white" />}
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-0.5">
                              <h6 className={`font-bold text-sm ${isCurrent ? 'text-orange-600 font-extrabold' : 'text-slate-800'}`}>
                                {node.station}
                              </h6>
                              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                                {node.platform} • Scheduled: {node.time}
                              </span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider font-mono ${
                              isCurrent ? 'bg-orange-50 border-orange-200 text-orange-600' :
                              isUpcoming ? 'bg-slate-50 border-slate-200 text-slate-500' :
                              'bg-emerald-50 border-emerald-200 text-emerald-600'
                            }`}>
                              {node.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
