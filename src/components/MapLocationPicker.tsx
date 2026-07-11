import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Navigation, X, Check, ShieldAlert, AlertTriangle } from 'lucide-react';

const LOCAL_SITES = [
  { name: "Maudaha Town Centre", nameHi: "मौदहा नगर केंद्र", lat: 25.6815, lng: 80.1132, desc: "Main commercial and residential hub" },
  { name: "Husain Ganj", nameHi: "हुसैन गंज", lat: 25.6945, lng: 80.1082, desc: "North-west residential expansion" },
  { name: "Ragauli", nameHi: "रागौल", lat: 25.6605, lng: 80.1255, desc: "Southern agricultural & brick-kiln suburb" },
  { name: "Chhani", nameHi: "छानी", lat: 25.7150, lng: 80.1450, desc: "Northeast highway village node" },
  { name: "Silauli", nameHi: "सिलौली", lat: 25.6580, lng: 80.0880, desc: "Southwest boundary village" },
  { name: "Sisolar", nameHi: "सिसोलर", lat: 25.6150, lng: 80.0550, desc: "Distant southwest trading outpost" },
  { name: "Khanna", nameHi: "खन्ना", lat: 25.7510, lng: 80.1650, desc: "North major junction & bypass" },
  { name: "Ghaura", nameHi: "घौरा", lat: 25.6980, lng: 80.0750, desc: "Western dairy farms settlement" },
  { name: "Rahmanpur", nameHi: "रहमानपुर", lat: 25.6720, lng: 80.1550, desc: "East fringe agricultural ward" }
];

const getNearestLocalSiteName = (lat: number, lng: number, language: 'en' | 'hi') => {
  let minDistance = Infinity;
  let nearest = LOCAL_SITES[0];
  for (const site of LOCAL_SITES) {
    const dist = Math.hypot(site.lat - lat, site.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = site;
    }
  }
  const siteName = language === 'hi' ? nearest.nameHi : nearest.name;
  if (minDistance < 0.003) {
    return siteName;
  } else if (minDistance < 0.015) {
    return language === 'hi' ? `${siteName} के पास, मौदहा` : `Near ${siteName}, Maudaha`;
  } else {
    return language === 'hi' ? `${siteName} बाहरी इलाका, मौदहा क्षेत्र` : `${siteName} Outskirts, Maudaha Region`;
  }
};

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat?: number, lng?: number) => void;
  initialAddress?: string;
  language?: 'en' | 'hi';
}

export default function MapLocationPicker({
  isOpen,
  onClose,
  onSelectLocation,
  initialAddress = '',
  language = 'en'
}: MapLocationPickerProps) {
  const [selectedCoords, setSelectedCoords] = useState({ lat: 25.6815, lng: 80.1132 });
  const [searchText, setSearchText] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState(initialAddress);
  const [isLocating, setIsLocating] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<typeof LOCAL_SITES>([]);
  const [useRealMap, setUseRealMap] = useState(hasValidKey);

  // Set initial coordinates if there's any matching village
  useEffect(() => {
    if (initialAddress) {
      const match = LOCAL_SITES.find(site => 
        initialAddress.toLowerCase().includes(site.name.toLowerCase()) || 
        initialAddress.includes(site.nameHi)
      );
      if (match) {
        setSelectedCoords({ lat: match.lat, lng: match.lng });
      }
    }
  }, [initialAddress]);

  // Geocode when coords change
  useEffect(() => {
    const fetchAddress = async () => {
      if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: selectedCoords }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            setResolvedAddress(results[0].formatted_address);
          } else {
            setResolvedAddress(getNearestLocalSiteName(selectedCoords.lat, selectedCoords.lng, language));
          }
        });
      } else {
        setResolvedAddress(getNearestLocalSiteName(selectedCoords.lat, selectedCoords.lng, language));
      }
    };
    fetchAddress();
  }, [selectedCoords, language]);

  if (!isOpen) return null;

  // Search local landmarks if offline or real map search isn't ready
  const handleSearchChange = (val: string) => {
    setSearchText(val);
    if (!val.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const filtered = LOCAL_SITES.filter(s => 
      s.name.toLowerCase().includes(val.toLowerCase()) || 
      s.nameHi.includes(val) ||
      s.desc.toLowerCase().includes(val.toLowerCase())
    );
    setSearchSuggestions(filtered);
  };

  const selectSuggestion = (site: typeof LOCAL_SITES[0]) => {
    setSelectedCoords({ lat: site.lat, lng: site.lng });
    setResolvedAddress(language === 'hi' ? site.nameHi : site.name);
    setSearchText('');
    setSearchSuggestions([]);
  };

  // Get current device location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(language === 'en' ? 'Geolocation is not supported by your browser.' : 'आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता है।');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Fallback or alert
        alert(language === 'en' 
          ? 'Failed to get your precise live location. Defaulting to Maudaha town center.' 
          : 'आपकी सटीक लाइव स्थिति प्राप्त करने में विफल। डिफ़ॉल्ट रूप से मौदहा नगर केंद्र पर सेट किया गया है।');
        setSelectedCoords({ lat: 25.6815, lng: 80.1132 });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans" id="map-location-picker-modal">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col h-[600px] border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <span className="text-emerald-500 text-lg">📍</span>
              {language === 'en' ? 'Choose Live Location' : 'लाइव लोकेशन चुनें'}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
              {language === 'en' ? 'Pin your exact address on Maudaha Map' : 'मौदहा के नक्शे पर अपना सटीक पता पिन करें'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 relative bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={language === 'en' ? 'Search neighborhood, street, or landmark...' : 'आस-पड़ोस, गली या मील का पत्थर खोजें...'}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-8 py-2 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white font-bold text-slate-700"
            />
            {searchText && (
              <button 
                onClick={() => { setSearchText(''); setSearchSuggestions([]); }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Suggestions dropdown */}
          {searchSuggestions.length > 0 && (
            <div className="absolute left-3 right-3 top-[48px] bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-slate-50 max-h-[200px] overflow-y-auto">
              {searchSuggestions.map((site) => (
                <button
                  key={site.name}
                  onClick={() => selectSuggestion(site)}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/50 text-xs flex items-start gap-2 transition"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">{language === 'hi' ? site.nameHi : site.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{site.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Area */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden flex items-center justify-center">
          {useRealMap ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                center={selectedCoords}
                onCenterChanged={(ev) => {
                  if (ev.detail.center) {
                    setSelectedCoords(ev.detail.center);
                  }
                }}
                zoom={14}
                mapId="CUSTOMER_PICKER_MAP"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                disableDefaultUI={true}
                zoomControl={true}
              >
                <AdvancedMarker position={selectedCoords}>
                  <Pin background="#10b981" borderColor="#059669" glyphColor="#ffffff" />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            /* Interactive offline SVG Mock Map */
            <div className="relative w-full h-full bg-slate-50 flex flex-col items-center justify-center select-none overflow-hidden">
              <div className="absolute top-2 left-2 right-2 bg-slate-900/5 backdrop-blur-xs px-3 py-1.5 rounded-xl text-[9px] font-bold text-slate-500 flex items-center justify-between border border-slate-200/20 z-10">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  {language === 'en' 
                    ? 'Google Maps API Key not active. Running Simulator Map Mode.' 
                    : 'गूगल मैप्स कुंजी सक्रिय नहीं है। सिम्युलेटर मानचित्र मोड चालू है।'}
                </span>
                <span className="text-emerald-600 underline font-extrabold cursor-help" onClick={() => alert(
                  language === 'en' 
                    ? 'To enable live satellite and full Google Maps, register VITE_GOOGLE_MAPS_PLATFORM_KEY in Secrets.' 
                    : 'लाइव सैटेलाइट और वास्तविक गूगल मैप्स के लिए सीक्रेट्स में VITE_GOOGLE_MAPS_PLATFORM_KEY दर्ज करें।'
                )}>
                  {language === 'en' ? 'Setup Info' : 'सेटअप निर्देश'}
                </span>
              </div>

              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

              {/* SVG Map Lines */}
              <svg className="absolute inset-0 w-full h-full text-slate-200" xmlns="http://www.w3.org/2000/svg">
                {/* Town boundaries and simulated roads */}
                <path d="M 0 100 Q 200 150 500 120" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                <path d="M 50 0 C 120 200 180 350 200 600" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                <path d="M 0 300 Q 250 280 500 320" fill="none" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
                <path d="M 350 0 C 300 180 280 420 400 600" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                
                {/* Highlight active sector circle */}
                <circle cx="250" cy="200" r="140" fill="rgba(16, 185, 129, 0.02)" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" strokeDasharray="4" />
                <circle cx="250" cy="200" r="70" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" />
              </svg>

              {/* Interactive clickable Landmark Pins */}
              <div className="absolute inset-0">
                {LOCAL_SITES.map((site) => {
                  // Project coordinates roughly to SVG bounding layout
                  // Maudaha Town Center is centered
                  const x = 250 + (site.lng - 80.1132) * 5000;
                  const y = 250 - (site.lat - 25.6815) * 5000;
                  const isThisSelected = Math.hypot(site.lat - selectedCoords.lat, site.lng - selectedCoords.lng) < 0.001;

                  return (
                    <button
                      key={site.name}
                      onClick={() => setSelectedCoords({ lat: site.lat, lng: site.lng })}
                      className="absolute group -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all"
                      style={{ left: `${Math.max(30, Math.min(470, x))}px`, top: `${Math.max(40, Math.min(340, y))}px` }}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-1.5 rounded-full shadow-lg border transition ${
                          isThisSelected 
                            ? 'bg-emerald-500 border-emerald-400 text-white scale-110' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-500 hover:scale-105'
                        }`}>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded-md font-bold shadow-2xs whitespace-nowrap transition ${
                          isThisSelected 
                            ? 'bg-emerald-600 text-white font-extrabold' 
                            : 'bg-white/90 text-slate-700 border border-slate-100 group-hover:bg-emerald-50'
                        }`}>
                          {language === 'hi' ? site.nameHi : site.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Instruction banner */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-100 shadow-md text-center">
                <p className="text-[11px] font-bold text-slate-700 leading-snug">
                  {language === 'en' 
                    ? '🗺️ Interactive Town Map Simulator is Active! Click any landmark pin above to set your location instantly.' 
                    : '🗺️ इंटरएक्टिव नगर मानचित्र सिम्युलेटर सक्रिय है! अपना स्थान तुरंत सेट करने के लिए ऊपर किसी भी पिन पर क्लिक करें।'}
                </p>
              </div>
            </div>
          )}

          {/* Floating 'Locate Me' Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="absolute bottom-4 right-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white h-10 px-4 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black transition z-10 cursor-pointer hover:scale-103"
          >
            <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating 
              ? (language === 'en' ? 'Locating...' : 'खोज रहा है...') 
              : (language === 'en' ? 'Use My Live GPS' : 'मेरे लाइव जीपीएस का उपयोग करें')}
          </button>
        </div>

        {/* Footer / Selected Address Display */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3.5">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/60 flex items-start gap-2.5 shadow-3xs">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                {language === 'en' ? 'SELECTED DELIVERY LOCATION' : 'चयनित डिलीवरी स्थान'}
              </p>
              <p className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug mt-0.5">
                {resolvedAddress || (language === 'en' ? 'Resolving address...' : 'पता खोजा जा रहा है...')}
              </p>
              <p className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">
                Lat: {selectedCoords.lat.toFixed(5)}, Lng: {selectedCoords.lng.toFixed(5)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-100 transition"
            >
              {language === 'en' ? 'Cancel' : 'रद्द करें'}
            </button>
            <button
              onClick={() => {
                onSelectLocation(resolvedAddress, selectedCoords.lat, selectedCoords.lng);
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition hover:scale-102"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              {language === 'en' ? 'Confirm Location' : 'स्थान की पुष्टि करें'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
