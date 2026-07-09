import React, { useState } from 'react';
import { Train, Search, ArrowRight, MapPin, Navigation, Calendar } from 'lucide-react';
import { RegisteredUser, Language } from '../types';

interface TrainStatusCornerProps {
  activeUserId: string;
  users: RegisteredUser[];
  onUpdateUsers: (updater: RegisteredUser[] | ((prev: RegisteredUser[]) => RegisteredUser[])) => void;
  language: Language;
  onAddActivity: (userId: string, actionEn: string, actionHi: string) => void;
}

export default function TrainStatusCorner({
  language,
  activeUserId,
  onAddActivity
}: TrainStatusCornerProps) {
  const [activeTab, setActiveTab] = useState<'between' | 'live'>('between');

  // State for "Trains Between Stations"
  const [sourceStation, setSourceStation] = useState('');
  const [destStation, setDestStation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [betweenResult, setBetweenResult] = useState<any[] | null>(null);

  // State for "Live Train Status"
  const [trainIdentifier, setTrainIdentifier] = useState('');
  const [liveResult, setLiveResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchBetween = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceStation || !destStation) return;
    
    setIsLoading(true);
    // Mock API Call
    setTimeout(() => {
      setBetweenResult([
        {
          id: 1,
          number: '11108',
          name: 'Bundelkhand Express',
          nameHi: 'बुंदेलखंड एक्सप्रेस',
          departure: '10:30 AM',
          arrival: '05:40 PM',
          duration: '07h 10m',
          days: 'Daily'
        },
        {
          id: 2,
          number: '22448',
          name: 'Sampark Kranti',
          nameHi: 'संपर्क क्रांति',
          departure: '02:15 PM',
          arrival: '10:00 PM',
          duration: '07h 45m',
          days: 'Mon, Wed, Fri'
        }
      ]);
      onAddActivity(
        activeUserId,
        `Searched trains between ${sourceStation} and ${destStation}`,
        `${sourceStation} और ${destStation} के बीच ट्रेनें खोजीं`
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleLiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainIdentifier) return;

    setIsLoading(true);
    // Mock API Call
    setTimeout(() => {
      setLiveResult({
        number: trainIdentifier,
        name: 'Vande Bharat Express',
        nameHi: 'वंदे भारत एक्सप्रेस',
        status: 'On Time',
        statusHi: 'समय पर',
        lastLocation: 'Kanpur Central',
        lastLocationHi: 'कानपुर सेंट्रल',
        delay: '0 mins',
        updatedAt: new Date().toLocaleTimeString()
      });
      onAddActivity(
        activeUserId,
        `Checked live status for train ${trainIdentifier}`,
        `ट्रेन ${trainIdentifier} का लाइव स्टेटस चेक किया`
      );
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="train-status-corner">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden border border-indigo-700">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 bg-white/5 h-44 w-44 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <Train className="h-8 w-8 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              {language === 'en' ? 'Indian Railways' : 'भारतीय रेलवे'}
            </h2>
            <p className="text-xs text-indigo-200/90 font-medium mt-1">
              {language === 'en' ? 'Search trains & check live status instantly' : 'ट्रेनें खोजें और तुरंत लाइव स्थिति जांचें'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
        <button
          onClick={() => {
            setActiveTab('between');
            setBetweenResult(null);
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'between' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {language === 'en' ? 'Trains Between Stations' : 'स्टेशनों के बीच ट्रेनें'}
        </button>
        <button
          onClick={() => {
            setActiveTab('live');
            setLiveResult(null);
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'live' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {language === 'en' ? 'Live Train Status' : 'ट्रेन की लाइव स्थिति'}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        {activeTab === 'between' && (
          <form onSubmit={handleSearchBetween} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'From Station' : 'कहाँ से'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={sourceStation}
                    onChange={(e) => setSourceStation(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. NDLS (New Delhi)' : 'जैसे NDLS (नई दिल्ली)'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'To Station' : 'कहाँ तक'}
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={destStation}
                    onChange={(e) => setDestStation(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. CNB (Kanpur)' : 'जैसे CNB (कानपुर)'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                {language === 'en' ? 'Travel Date (Optional)' : 'यात्रा की तिथि (वैकल्पिक)'}
              </label>
              <div className="relative max-w-xs">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto mt-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>{isLoading ? (language === 'en' ? 'Searching...' : 'खोजा जा रहा है...') : (language === 'en' ? 'Search Trains' : 'ट्रेनें खोजें')}</span>
            </button>
          </form>
        )}

        {activeTab === 'live' && (
          <form onSubmit={handleLiveSearch} className="space-y-4 max-w-md">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                {language === 'en' ? 'Train Name or Number' : 'ट्रेन का नाम या नंबर'}
              </label>
              <div className="relative">
                <Train className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={trainIdentifier}
                  onChange={(e) => setTrainIdentifier(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. 11108 or Bundelkhand Exp' : 'जैसे 11108 या बुंदेलखंड एक्सप्रेस'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>{isLoading ? (language === 'en' ? 'Checking...' : 'जांचा जा रहा है...') : (language === 'en' ? 'Check Live Status' : 'लाइव स्थिति जांचें')}</span>
            </button>
          </form>
        )}
      </div>

      {/* Results Section */}
      <div className="mt-6">
        {activeTab === 'between' && betweenResult && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-800 mb-2">
              {language === 'en' ? 'Available Trains' : 'उपलब्ध ट्रेनें'} ({betweenResult.length})
            </h3>
            {betweenResult.map(train => (
              <div key={train.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md border border-indigo-100 mb-1">
                    #{train.number}
                  </span>
                  <h4 className="font-bold text-slate-800">{language === 'en' ? train.name : train.nameHi}</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Runs: {train.days}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="block font-black text-slate-800">{train.departure}</span>
                  </div>
                  <div className="flex flex-col items-center px-4 border-b-2 border-slate-200 border-dashed pb-1">
                    <span className="text-[10px] text-slate-400 font-bold mb-1">{train.duration}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-slate-800">{train.arrival}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'live' && liveResult && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md border border-indigo-100 mb-1">
                  #{liveResult.number}
                </span>
                <h3 className="text-lg font-black text-slate-800">{language === 'en' ? liveResult.name : liveResult.nameHi}</h3>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'en' ? liveResult.status : liveResult.statusHi}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">Delay: {liveResult.delay}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
              <MapPin className="h-5 w-5 text-indigo-500" />
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'en' ? 'Last Location' : 'अंतिम स्थान'}
                </span>
                <p className="font-bold text-slate-800">
                  {language === 'en' ? liveResult.lastLocation : liveResult.lastLocationHi}
                </p>
                <span className="text-[10px] text-slate-500">
                  {language === 'en' ? 'Updated at' : 'अपडेट किया गया'}: {liveResult.updatedAt}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
