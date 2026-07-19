import React from 'react';
import { motion } from 'motion/react';
import { 
  Store as StoreIcon, 
  Utensils, 
  Shirt, 
  Wrench, 
  Plane, 
  MapPin, 
  CloudSun, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search
} from 'lucide-react';
import { Language } from '../types';

interface CustomerHomeProps {
  language: Language;
  onNavigateTab: (tab: 'browse' | 'restaurants' | 'clothing' | 'services' | 'travel') => void;
}

export default function CustomerHome({ language, onNavigateTab }: CustomerHomeProps) {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'en' ? 'Good Morning' : 'शुभ प्रभात';
    } else if (hour < 17) {
      return language === 'en' ? 'Good Afternoon' : 'नमस्कार';
    } else {
      return language === 'en' ? 'Good Evening' : 'शुभ संध्या';
    }
  };

  const categories = [
    { 
      id: 'browse', 
      name: language === 'en' ? 'Shop & Grocery' : 'सामग्री और किराना', 
      desc: language === 'en' ? 'Super Mart, Kirana & Daily Needs' : 'सुपर मार्ट, किराना और दैनिक जरूरतें',
      icon: StoreIcon, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50/75 hover:bg-blue-100/80 border-blue-100',
      tag: language === 'en' ? 'Fast Delivery' : 'तेज डिलीवरी'
    },
    { 
      id: 'restaurants', 
      name: language === 'en' ? 'Food & Dining' : 'भोजन और रेस्तरां', 
      desc: language === 'en' ? 'Delectable Local Cuisines' : 'स्वादिष्ट स्थानीय व्यंजन',
      icon: Utensils, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50/75 hover:bg-orange-100/80 border-orange-100',
      tag: language === 'en' ? 'Hot & Fresh' : 'ताजा और गर्म'
    },
    { 
      id: 'clothing', 
      name: language === 'en' ? 'Fashion Boutique' : 'फैशन और बुटीक', 
      desc: language === 'en' ? 'Premium Trends & Tailoring' : 'प्रीमियम ट्रेंड्स और सिलाई',
      icon: Shirt, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50/75 hover:bg-pink-100/80 border-pink-100',
      tag: language === 'en' ? 'New Arrivals' : 'नए डिजाइन'
    },
    { 
      id: 'services', 
      name: language === 'en' ? 'Local Services' : 'स्थानीय सेवाएं', 
      desc: language === 'en' ? 'Trusted Technicians & Tailors' : 'विश्वसनीय तकनीशियन और दर्जी',
      icon: Wrench, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50/75 hover:bg-indigo-100/80 border-indigo-100',
      tag: language === 'en' ? 'Top Rated' : 'टॉप रेटेड'
    },
    { 
      id: 'travel', 
      name: language === 'en' ? 'Travel' : 'यात्रा', 
      desc: language === 'en' ? 'Live Flight & Train Status' : 'लाइव उड़ान और ट्रेन स्थिति',
      icon: Plane, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50/75 hover:bg-emerald-100/80 border-emerald-100',
      tag: language === 'en' ? 'Amadeus • RailRadar' : 'अमाडेस • रेलराडार'
    },
  ];

  return (
    <div className="p-5 space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header Welcome Card */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 space-y-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {getGreeting()}
            </h1>
            <p className="mt-1 text-emerald-50 text-sm font-medium">
              {language === 'en' 
                ? 'What would you like to explore today?' 
                : 'आज आप क्या खोजना चाहेंगे?'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Services Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
            {language === 'en' ? 'Categories' : 'श्रेणियाँ'}
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
            {language === 'en' ? 'Choose Service' : 'सेवा चुनें'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab(cat.id as any)}
              className={`p-4 rounded-3xl cursor-pointer flex flex-col items-center text-center justify-center border border-slate-100 shadow-sm transition-all duration-200 ${cat.bg} ${idx === 4 ? 'col-span-2' : ''}`}
            >
              <div className={`p-4 bg-white rounded-2xl shadow-sm ${cat.color} border border-slate-100/50 mb-3`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{cat.name}</h3>
              <p className="text-[10px] text-slate-600 font-medium">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Promotion card */}
    </div>
  );
}
