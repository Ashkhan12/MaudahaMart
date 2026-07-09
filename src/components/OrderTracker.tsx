/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ShoppingBag, Truck, CheckCircle2, Navigation, Star, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Compass, Info } from 'lucide-react';
import { Order, Language, ScratchCard } from '../types';
import { TRANSLATIONS } from '../data';
import ScratchCardComponent from './ScratchCardComponent';

function ConfettiEffect() {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  const shapes = ['rect', 'circle', 'triangle'];
  
  const pieces = Array.from({ length: 65 }).map((_, i) => {
    const size = Math.random() * 8 + 6; // 6px to 14px
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * 2; // 0s to 2s
    const duration = Math.random() * 3 + 2.5; // 2.5s to 5.5s
    const rotate = Math.random() * 360;
    const rotateDirection = Math.random() > 0.5 ? 360 : -360;
    
    return {
      id: i,
      size,
      shape,
      color,
      left,
      delay,
      duration,
      rotate,
      rotateDirection,
      xOffset: Math.random() * 80 - 40 // drift left/right
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: -20,
            x: `${p.left}%`,
            rotate: p.rotate,
            opacity: 1,
            scale: 0.8
          }}
          animate={{
            y: '100vh',
            x: `${p.left + p.xOffset}%`,
            rotate: p.rotate + p.rotateDirection,
            opacity: [1, 1, 0.8, 0],
            scale: [0.8, 1, 1, 0.5]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: Math.random() * 1
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'triangle' ? p.color : undefined,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : undefined,
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function ColorfulBubblesBackground() {
  const bubbles = [
    { size: 160, color: 'rgba(16, 185, 129, 0.15)', left: '8%', top: '12%', duration: 25, delay: 0 },
    { size: 210, color: 'rgba(59, 130, 246, 0.15)', left: '82%', top: '8%', duration: 28, delay: 2 },
    { size: 140, color: 'rgba(245, 158, 11, 0.12)', left: '42%', top: '48%', duration: 22, delay: 1 },
    { size: 180, color: 'rgba(139, 92, 246, 0.15)', left: '76%', top: '72%', duration: 30, delay: 3 },
    { size: 170, color: 'rgba(236, 72, 153, 0.12)', left: '4%', top: '58%', duration: 24, delay: 4 },
    { size: 150, color: 'rgba(20, 184, 166, 0.15)', left: '22%', top: '78%', duration: 26, delay: 2.5 },
    { size: 110, color: 'rgba(16, 185, 129, 0.10)', left: '58%', top: '22%', duration: 18, delay: 0.5 },
    { size: 130, color: 'rgba(245, 158, 11, 0.15)', left: '32%', top: '8%', duration: 20, delay: 1.5 }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -35, 25, 0],
            x: [0, 25, -15, 0],
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.6, 0.8, 0.7, 0.6]
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            backgroundColor: b.color,
            left: b.left,
            top: b.top,
            filter: 'blur(50px)',
          }}
        />
      ))}
    </div>
  );
}

interface OrderTrackerProps {
  order: Order;
  language: Language;
  onClose: () => void;
  scratchCards?: ScratchCard[];
  onScratchCardComplete?: (cardId: string) => void;
  onRateRider?: (orderId: string, rating: number) => void;
}

export default function OrderTracker({
  order,
  language,
  onClose,
  scratchCards = [],
  onScratchCardComplete,
  onRateRider
}: OrderTrackerProps) {
  const t = TRANSLATIONS[language];

  const [zoom, setZoom] = useState(1);
  const [autoCenter, setAutoCenter] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getRatingText = (rating: number, lang: Language) => {
    const texts = {
      en: {
        1: "Terrible",
        2: "Bad",
        3: "Okay",
        4: "Good",
        5: "Excellent!"
      },
      hi: {
        1: "बहुत खराब",
        2: "खराब",
        3: "ठीक-ठाक",
        4: "अच्छा",
        5: "उत्कृष्ट!"
      }
    };
    return texts[lang][rating as 1|2|3|4|5] || "";
  };
  const [showTraffic, setShowTraffic] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState<{
    name: string;
    nameHi: string;
    desc: string;
    descHi: string;
    type: string;
  } | null>(null);

  const landmarkDetails: Record<string, { descEn: string, descHi: string, type: string }> = {
    'gupta-kirana': {
      descEn: 'Galla Mandi famous store. Fresh grocery provisions & high-quality mustard oils.',
      descHi: 'गल्ला मंडी की प्रसिद्ध दुकान। ताजा किराना सामान और उच्च गुणवत्ता वाला सरसों का तेल।',
      type: 'store'
    },
    'siddiqui-fruits': {
      descEn: 'Naya Bazar fresh orchards partner. Famous for sweet seasonal mangoes & crisp apples.',
      descHi: 'नया बाजार ताजे फलों के भागीदार। मीठे मौसमी आम और कुरकुरे सेब के लिए प्रसिद्ध।',
      type: 'store'
    },
    'maudaha-dairy': {
      descEn: 'Rahmaniya Ward milk hub. Pure local cow ghee, fresh paneer, and rich cream.',
      descHi: 'रहमानिया वार्ड का दूध केंद्र। शुद्ध स्थानीय गाय का घी, ताजा पनीर और गाढ़ी मलाई।',
      type: 'store'
    },
    'bundelkhand-sweets': {
      descEn: 'Subhash Nagar traditional confectioners. Renowned for authentic Maudaha Peda since 1978.',
      descHi: 'सुभाष नगर के पारंपरिक हलवाई। 1978 से प्रामाणिक मौदहा पेड़ा के लिए प्रसिद्ध।',
      type: 'bakery'
    },
    'chauraha': {
      descEn: 'Maudaha Central Chauraha. The lively heart of town connecting all major sectors.',
      descHi: 'मौदहा सेंट्रल चौराहा। सभी प्रमुख क्षेत्रों को जोड़ने वाला शहर का जीवंत केंद्र।',
      type: 'hub'
    },
    'home': {
      descEn: 'Your Delivery Destination. Fast delivery partner is arriving soon.',
      descHi: 'आपका डिलीवरी गंतव्य। त्वरित डिलीवरी पार्टनर जल्द ही पहुंच रहा है।',
      type: 'home'
    }
  };

  // Map coordinates of landmarks
  const landmarks = [
    { name: 'Galla Mandi (गुप्ता किराना)', x: 300, y: 60, color: 'text-amber-600', key: 'gupta-kirana' },
    { name: 'Naya Bazar Chauraha (सिद्दीकी फ्रूट्स)', x: 100, y: 320, color: 'text-emerald-600', key: 'siddiqui-fruits' },
    { name: 'Rahmaniya Ward (मौदहा डेयरी)', x: 80, y: 150, color: 'text-blue-600', key: 'maudaha-dairy' },
    { name: 'Subhash Nagar Rd (बुंदेलखंड स्वीट्स)', x: 340, y: 220, color: 'text-red-600', key: 'bundelkhand-sweets' },
    { name: 'Maudaha Central Chauraha (मुख्य चौराहा)', x: 220, y: 200, color: 'text-slate-800', isHub: true, key: 'chauraha' },
    { name: 'National Highway NH-34', x: 40, y: 250, isHighway: true },
    { name: 'Your Address (आपका घर)', x: 220, y: 340, isHome: true, key: 'home' }
  ];

  // Path definition based on store
  // Start from store coordinates -> pass Central Chauraha -> arrive at Home
  const getRouteCoordinates = (storeId: string) => {
    switch (storeId) {
      case 'gupta-kirana':
        return [
          { x: 300, y: 70 }, // Galla Mandi Store
          { x: 220, y: 120 }, // Galla Mandi Rd intersection
          { x: 220, y: 200 }, // Central Chauraha
          { x: 220, y: 340 }  // Home
        ];
      case 'siddiqui-fruits':
        return [
          { x: 100, y: 310 }, // Naya Bazar
          { x: 140, y: 240 }, // Naya Bazar Road
          { x: 220, y: 200 }, // Central Chauraha
          { x: 220, y: 340 }  // Home
        ];
      case 'maudaha-dairy':
        return [
          { x: 90, y: 160 },  // Rahmaniya Store
          { x: 160, y: 160 }, // Rahmaniya Road
          { x: 220, y: 200 }, // Central Chauraha
          { x: 220, y: 340 }  // Home
        ];
      case 'bundelkhand-sweets':
        return [
          { x: 330, y: 210 }, // Subhash Nagar Rd
          { x: 260, y: 200 }, // Subhash Nagar Junction
          { x: 220, y: 200 }, // Central Chauraha
          { x: 220, y: 340 }  // Home
        ];
      default:
        return [
          { x: 220, y: 200 },
          { x: 220, y: 340 }
        ];
    }
  };

  const route = getRouteCoordinates(order.storeId);

  const getCoordinatesAlongRoute = (routeCoords: { x: number, y: number }[], p: number) => {
    if (routeCoords.length === 0) return { x: 220, y: 340 };
    if (p <= 0) return routeCoords[0];
    if (p >= 1) return routeCoords[routeCoords.length - 1];
    
    const segmentCount = routeCoords.length - 1;
    const scaledP = p * segmentCount;
    const segmentIndex = Math.floor(scaledP);
    const segmentProgress = scaledP - segmentIndex;
    
    const startNode = routeCoords[segmentIndex];
    const endNode = routeCoords[segmentIndex + 1];
    
    return {
      x: startNode.x + (endNode.x - startNode.x) * segmentProgress,
      y: startNode.y + (endNode.y - startNode.y) * segmentProgress
    };
  };

  const startLat = 25.6840;
  const startLng = 80.1250;
  const destLat = 25.6920;
  const destLng = 80.1380;
  
  const currentLat = order.riderLat || startLat;
  const currentLng = order.riderLng || startLng;

  // Calculate distance progress
  const totalDist = Math.sqrt(Math.pow(destLat - startLat, 2) + Math.pow(destLng - startLng, 2));
  const currentDist = Math.sqrt(Math.pow(currentLat - startLat, 2) + Math.pow(currentLng - startLng, 2));
  const progressPercent = totalDist > 0 ? Math.min(1, currentDist / totalDist) : 0;

  // Determine riderCoords based on status
  let riderCoords = { x: route[0].x, y: route[0].y };
  if (order.deliveryStatus === 'arrived') {
    riderCoords = route[route.length - 1];
  } else if (order.deliveryStatus === 'out_for_delivery') {
    riderCoords = getCoordinatesAlongRoute(route, progressPercent);
  } else if (order.deliveryStatus === 'ready_for_delivery') {
    riderCoords = route[0];
  } else {
    // For pending, processing, ready_for_pickup
    riderCoords = route[0];
  }

  const getRiderAngle = (routeCoords: { x: number, y: number }[], p: number) => {
    if (routeCoords.length < 2) return 0;
    const adjustedP = Math.max(0.001, Math.min(0.999, p));
    const segmentCount = routeCoords.length - 1;
    const scaledP = adjustedP * segmentCount;
    const segmentIndex = Math.floor(scaledP);
    
    const startNode = routeCoords[segmentIndex];
    const endNode = routeCoords[segmentIndex + 1];
    if (!startNode || !endNode) return 0;
    
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  };

  const riderAngle = getRiderAngle(route, progressPercent);

  // Dynamic Camera ViewBox calculations based on Zoom & AutoCenter
  const centerX = autoCenter ? riderCoords.x : 200;
  const centerY = autoCenter ? riderCoords.y : 200;
  const viewSize = 400 / zoom;
  const minX = Math.max(0, Math.min(400 - viewSize, centerX - viewSize / 2));
  const minY = Math.max(0, Math.min(400 - viewSize, centerY - viewSize / 2));
  const viewBoxStr = `${minX} ${minY} ${viewSize} ${viewSize}`;

  // Convert points array to SVG path
  const svgPathData = `M ${route.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const steps = [
    { key: 'pending', label: language === 'en' ? 'Order Placed' : 'ऑर्डर किया गया', desc: language === 'en' ? 'Waiting for merchant acceptance' : 'व्यापारी की स्वीकृति की प्रतीक्षा है' },
    { key: 'processing', label: language === 'en' ? 'Preparing Order' : 'ऑर्डर तैयार हो रहा है', desc: language === 'en' ? 'Merchant is preparing fresh items' : 'व्यापारी सामग्री तैयार कर रहा है' },
    { key: 'ready_for_pickup', label: language === 'en' ? 'Ready for Pickup' : 'पिकअप के लिए तैयार', desc: language === 'en' ? 'Order is packed and ready for delivery boy' : 'ऑर्डर पैक है और डिलीवरी बॉय के लिए तैयार है' },
    { key: 'ready_for_delivery', label: language === 'en' ? 'Picked Up' : 'पिकअप किया गया', desc: language === 'en' ? 'Delivery boy has picked up and verified items' : 'डिलीवरी बॉय ने सामान उठा लिया है और सत्यापित किया है' },
    { key: 'out_for_delivery', label: language === 'en' ? 'Out for Delivery' : 'वितरण के लिए बाहर', desc: language === 'en' ? 'Delivery boy is en-route to your address' : 'डिलीवरी बॉय आपके पते पर आ रहा है' },
    { key: 'arrived', label: language === 'en' ? 'Delivered' : 'पहुंच गया', desc: language === 'en' ? 'Order delivered successfully!' : 'ऑर्डर सफलतापूर्वक पहुंच गया!' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.deliveryStatus);

  const orderTime = (() => {
    try {
      const d = new Date(order.date);
      if (isNaN(d.getTime())) return new Date();
      return d;
    } catch (e) {
      return new Date();
    }
  })();

  const formatTime = (dateObj: Date) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getMilestoneTime = (offsetMinutes: number) => {
    const d = new Date(orderTime.getTime() + offsetMinutes * 60000);
    return formatTime(d);
  };

  const milestones = [
    {
      key: 'pending',
      labelEn: 'Placed',
      labelHi: 'ऑर्डर हुआ',
      time: getMilestoneTime(0),
      isEst: false,
      icon: '📝',
      descEn: 'We received your order',
      descHi: 'आपका ऑर्डर प्राप्त हुआ'
    },
    {
      key: 'processing',
      labelEn: 'Preparing',
      labelHi: 'तैयारी शुरू',
      time: getMilestoneTime(3),
      isEst: currentStepIndex < 1,
      icon: '🍳',
      descEn: 'Merchant preparing items',
      descHi: 'किचन में भोजन तैयार किया जा रहा है'
    },
    {
      key: 'ready_for_pickup',
      labelEn: 'Packed',
      labelHi: 'पैक हुआ',
      time: getMilestoneTime(8),
      isEst: currentStepIndex < 2,
      icon: '📦',
      descEn: 'Awaiting delivery driver',
      descHi: 'डिलीवरी पार्टनर की प्रतीक्षा है'
    },
    {
      key: 'ready_for_delivery',
      labelEn: 'Picked Up',
      labelHi: 'पिकअप हुआ',
      time: getMilestoneTime(11),
      isEst: currentStepIndex < 3,
      icon: '🛵',
      descEn: 'Driver verified package',
      descHi: 'पार्टनर ने सामान सत्यापित किया'
    },
    {
      key: 'out_for_delivery',
      labelEn: 'En Route',
      labelHi: 'मार्ग पर है',
      time: getMilestoneTime(14),
      isEst: currentStepIndex < 4,
      icon: '⚡',
      descEn: 'Rider is en route via NH-34',
      descHi: 'पार्टनर मार्ग पर आगे बढ़ रहा है'
    },
    {
      key: 'arrived',
      labelEn: 'Delivered',
      labelHi: 'पहुंच गया',
      time: getMilestoneTime(22),
      isEst: currentStepIndex < 5,
      icon: '🏠',
      descEn: 'Delivered at your doorstep',
      descHi: 'द्वार पर डिलीवरी पहुंचाई गई'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-emerald-50/10 to-teal-50/20 min-h-screen relative overflow-hidden">
      <ColorfulBubblesBackground />
      {order.deliveryStatus === 'arrived' && <ConfettiEffect />}
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 transition font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.backToBrowsing}</span>
          </button>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-mono">#{order.id}</span>
            <span className="text-sm font-bold text-slate-800">
              {language === 'en' ? order.storeName : order.storeNameHi}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Timeline Bar with ETA updates */}
      <div className="max-w-4xl mx-auto px-4 pt-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          whileHover={{ y: -2 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-emerald-100/80 shadow-[0_20px_40px_rgba(16,185,129,0.06)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.12)] transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <span className="text-emerald-500 text-sm animate-pulse">⏱️</span>
                <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-800 bg-clip-text text-transparent">
                  {language === 'en' ? 'Estimated Delivery Timeline' : 'अनुमानित डिलीवरी समयरेखा'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {language === 'en' 
                  ? 'Hyper-local milestone forecasting powered by Maudaha Mart speed-routing' 
                  : 'मौदहा मार्ट स्पीड-रूटिंग द्वारा संचालित हाइपर-लोकल मील के पत्थर का पूर्वानुमान'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-800 font-mono text-[11px] font-black px-4 py-2 rounded-2xl border border-emerald-500/10 shrink-0 self-start sm:self-center shadow-xs">
              <span className="text-[10px]">🕒 {language === 'en' ? 'FINAL ETA' : 'अंतिम ईटीए'}:</span>
              <span className="text-emerald-700 font-extrabold text-xs">
                {order.deliveryStatus === 'arrived' 
                  ? (language === 'en' ? 'Arrived!' : 'पहुंच गया!') 
                  : milestones[5].time}
              </span>
            </div>
          </div>

          <div className="relative pt-2 pb-2">
            {/* Horizontal Line behind steps for Desktop layout */}
            <div className="absolute top-[32px] left-[8%] right-[8%] h-1 bg-slate-100/80 rounded-full hidden md:block" />
            
            {/* Animated Progress Line */}
            <div className="absolute top-[32px] left-[8%] right-[8%] h-1 hidden md:block">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(0, currentStepIndex) / (milestones.length - 1) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 md:gap-2 relative">
              {milestones.map((m, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;

                return (
                  <div key={m.key} className="flex flex-col items-start md:items-center text-left md:text-center group relative">
                    <div className="relative mb-2 md:mx-auto">
                      {/* Node Icon Circle with spring scale, bounce, and hover feedback */}
                      <motion.div
                        layout
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ 
                          scale: isCurrent ? 1.15 : 1, 
                          opacity: 1,
                          y: isCurrent ? [0, -4, 0] : 0
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 18,
                          y: isCurrent ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : undefined
                        }}
                        whileHover={{ scale: isCurrent ? 1.22 : 1.1, y: -2 }}
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg border cursor-default select-none transition-all duration-500 shadow-xs ${
                          isCurrent 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white shadow-md shadow-amber-500/30' 
                            : isPassed 
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/10' 
                            : 'bg-slate-50/80 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span>
                          {m.icon}
                        </span>
                      </motion.div>

                      {/* Small checklist dot badge with pop-in spring transitions */}
                      {isPassed && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                          className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-600 rounded-full flex items-center justify-center text-[8px] text-white border border-white font-extrabold shadow-sm"
                        >
                          ✓
                        </motion.span>
                      )}
                      {isCurrent && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                          transition={{ type: "tween", ease: "easeInOut", repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                          className="absolute -top-1 -right-1 h-4 w-4 bg-amber-600 rounded-full flex items-center justify-center text-[8px] text-white border border-white font-extrabold shadow-sm"
                        />
                      )}
                    </div>

                    <div className="mt-1 md:px-1">
                      <span className={`block text-xs font-black leading-tight tracking-tight ${
                        isCurrent ? 'text-amber-600' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {language === 'hi' ? m.labelHi : m.labelEn}
                      </span>
                      
                      {/* EST / ACT Label pill */}
                      <div className="flex items-center gap-1 mt-1 justify-start md:justify-center">
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full shadow-xs border ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent animate-pulse' 
                            : isPassed 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                            : 'bg-slate-50 text-slate-400 border-slate-200/50'
                        }`}>
                          {m.time}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                          {m.isEst ? (language === 'en' ? 'Est' : 'अनु.') : (language === 'en' ? 'Act' : 'पुष्ट')}
                        </span>
                      </div>

                      <span className="hidden md:block text-[9px] text-slate-400 font-medium leading-tight mt-1.5 opacity-90">
                        {language === 'hi' ? m.descHi : m.descEn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* Left Hand: Tracking Steps */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 16 }}
          whileHover={{ y: -2 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_45px_rgba(16,185,129,0.08)] transition-all duration-300 md:col-span-5 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shadow-xs">
                <Truck className="h-5 w-5 animate-bounce" />
              </span>
              <span className="bg-gradient-to-r from-slate-800 to-emerald-800 bg-clip-text text-transparent">
                {t.trackOrder}
              </span>
            </h2>

            {/* Stepper */}
            <div className="relative pl-8 space-y-6">
              {/* Stepper line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100">
                <motion.div
                  className="bg-gradient-to-b from-emerald-500 to-teal-500 w-full rounded-full"
                  initial={{ height: 0 }}
                  animate={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>

              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={step.key} className="relative flex gap-4">
                    {/* Circle icon */}
                    <div className="absolute left-[-25px] top-1 z-10">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/25">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={`font-black text-sm leading-tight transition-colors duration-300 ${isActive ? 'text-emerald-700' : isCompleted ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-slate-600 font-semibold' : isCompleted ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">{language === 'en' ? 'Estimated Time' : 'अनुमानित समय'}:</span>
              <span className="font-black text-emerald-600 font-mono text-base px-2.5 py-1 bg-emerald-50 rounded-xl border border-emerald-100/50">
                {order.deliveryStatus === 'arrived' ? (language === 'en' ? 'Arrived!' : 'पहुंच गया!') : '5-10 mins'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">{language === 'en' ? 'Delivery Agent' : 'डिलिवरी पार्टनर'}:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-100">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Rahul Kumar <span className="text-amber-500 font-extrabold">★ 4.9</span>
              </span>
            </div>

            {/* Rider Rating Interactive Stars (only if order is marked as arrived) */}
            {order.deliveryStatus === 'arrived' && (
              <div className="mt-4 p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl space-y-2.5 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span>⭐</span>
                      <span>{language === 'en' ? 'Rate Rahul Kumar' : 'राहुल कुमार को रेटिंग दें'}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {language === 'en' ? 'Rate your delivery rider' : 'अपने डिलीवरी बॉय को रेटिंग दें'}
                    </p>
                  </div>
                  
                  {/* Star interactive selection */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = order.riderRating ? star <= order.riderRating : star <= (hoverRating ?? 0);
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={!!order.riderRating}
                          onMouseEnter={() => !order.riderRating && setHoverRating(star)}
                          onMouseLeave={() => !order.riderRating && setHoverRating(null)}
                          onClick={() => onRateRider && onRateRider(order.id, star)}
                          className={`p-1 transition-transform active:scale-90 ${order.riderRating ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                        >
                          <Star
                            className={`h-5 w-5 transition-colors ${
                              isFilled 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating State / Feedback Text */}
                {order.riderRating ? (
                  <p className="text-[10px] text-emerald-700 font-black flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                    <span>✓</span>
                    <span>
                      {language === 'en' 
                        ? `You rated ${order.riderRating} out of 5 stars. Thank you!` 
                        : `आपने ${order.riderRating} स्टार रेटिंग दी। धन्यवाद!`}
                    </span>
                  </p>
                ) : hoverRating ? (
                  <p className="text-[10px] text-amber-600 font-extrabold text-left sm:text-right pr-1">
                    {getRatingText(hoverRating, language)}
                  </p>
                ) : null}
              </div>
            )}
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-3 shadow-xs">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-emerald-500/10 shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">{language === 'en' ? 'Earned Rewards' : 'अर्जित इनाम'}</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  +{order.coinsEarned} Maudaha {t.loyaltyCoins}
                </p>
              </div>
            </div>

            {/* Scratch Card Reward celebration */}
            {scratchCards && scratchCards.filter(c => c.userId === order.userId && !c.isScratched).map(card => (
              <div key={card.id} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-black text-amber-600 flex items-center gap-1.5 animate-bounce">
                  <span>🎁</span>
                  <span>{language === 'hi' ? 'विशेष स्क्रैच कार्ड मिला है!' : 'You Won a Special Scratch Card!'}</span>
                </p>
                <ScratchCardComponent
                  card={card}
                  language={language}
                  onScratchComplete={(cardId) => {
                    if (onScratchCardComplete) {
                      onScratchCardComplete(cardId);
                    }
                  }}
                />
              </div>
            ))}

            {/* Verification Photo block */}
            {order.photoUrl && (
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 rounded-2xl space-y-2.5 shadow-xs">
                <p className="text-xs font-black text-emerald-800 flex items-center gap-1">
                  <span>📸</span>
                  <span>{language === 'hi' ? 'डिलीवरी बॉय द्वारा अपलोड की गई सामान की फोटो' : 'Products Verification Photo Uploaded by Delivery boy'}</span>
                </p>
                <div className="relative group overflow-hidden rounded-xl border border-emerald-500/10 shadow-xs">
                  <img
                    src={order.photoUrl}
                    alt="Products verified"
                    className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-md">
                    {language === 'hi' ? 'सत्यापित' : 'Verified'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Hand: Simulated Maudaha Town Map */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 16 }}
          whileHover={{ y: -2 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_45px_rgba(16,185,129,0.08)] transition-all duration-300 md:col-span-7 flex flex-col justify-between"
        >
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span className="text-emerald-500 text-base">🗺️</span>
                <span className="bg-gradient-to-r from-slate-800 to-emerald-800 bg-clip-text text-transparent">
                  {language === 'en' ? 'Maudaha City Interactive Map' : 'मौदहा नगर इंटरैक्टिव मानचित्र'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {language === 'en' ? 'Simulated instant delivery transit path' : 'सिम्युलेटेड इंस्टेंट डिलीवरी ट्रांजिट मार्ग'}
              </p>
            </div>
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black font-mono tracking-widest border border-emerald-400 flex items-center gap-1 shadow-[0_2px_10px_rgba(16,185,129,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              LIVE GPS
            </span>
          </div>

          {/* Map Controls Panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/60 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.5))}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-emerald-300 rounded-xl text-slate-700 hover:text-emerald-600 shadow-xs flex items-center justify-center gap-1 font-bold transition duration-200"
                title={language === 'en' ? "Zoom In" : "ज़ूम इन"}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-emerald-300 rounded-xl text-slate-700 hover:text-emerald-600 shadow-xs flex items-center justify-center gap-1 font-bold transition duration-200"
                title={language === 'en' ? "Zoom Out" : "ज़ूम आउट"}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setAutoCenter(false);
                }}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-amber-300 rounded-xl text-slate-700 hover:text-amber-600 shadow-xs flex items-center justify-center gap-1 text-[10px] font-bold transition duration-200"
                title={language === 'en' ? "Reset Map" : "रीसेट"}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Traffic Toggle */}
              <button
                type="button"
                onClick={() => setShowTraffic(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wide flex items-center gap-1 border transition duration-300 shadow-xs ${
                  showTraffic 
                    ? 'bg-emerald-500 text-white border-transparent shadow-[0_2px_10px_rgba(16,185,129,0.15)]' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                🚦 {language === 'en' ? 'Traffic' : 'ट्रैफिक'}
              </button>

              {/* Auto-Center Toggle */}
              <button
                type="button"
                onClick={() => setAutoCenter(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wide flex items-center gap-1 border transition duration-300 shadow-xs ${
                  autoCenter 
                    ? 'bg-amber-500 text-white border-transparent shadow-[0_2px_10px_rgba(245,158,11,0.15)]' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                🎯 {language === 'en' ? 'Track Rider' : 'डिलीवरी बॉय को ट्रैक करें'}
              </button>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative bg-slate-900 aspect-square md:aspect-auto md:h-[450px] rounded-xl overflow-hidden shadow-inner border border-slate-950 flex items-center justify-center">
            
            {/* Clickable Landmark Info Tooltip Overlay */}
            {selectedLandmark && (
              <div className="absolute top-3 left-3 right-3 bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl z-10 flex items-start gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xl shrink-0 mt-0.5">
                  {selectedLandmark.type === 'store' ? '🏪' :
                   selectedLandmark.type === 'bakery' ? '🍬' :
                   selectedLandmark.type === 'hub' ? '🏛️' : '🏠'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">
                      {language === 'hi' ? selectedLandmark.nameHi : selectedLandmark.name}
                    </h4>
                    <span className="text-[8px] font-black uppercase bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
                      {selectedLandmark.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold mt-1 leading-relaxed">
                    {language === 'hi' ? selectedLandmark.descHi : selectedLandmark.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLandmark(null)}
                  className="text-slate-400 hover:text-white font-extrabold text-xs px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 transition"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Dark Cyberpunk-ish Map Style */}
            <svg viewBox={viewBoxStr} className="w-full h-full text-slate-700 select-none transition-all duration-300">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff0a" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Water channel / local canal (Maudaha lake/canal) */}
              <path
                d="M 0 50 Q 150 70 200 120 T 400 150"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M 0 50 Q 150 70 200 120 T 400 150"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.2"
              />

              {/* Highway NH-34 */}
              <line x1="40" y1="0" x2="40" y2="400" stroke="#f59e0b" strokeWidth="8" strokeDasharray="6 4" opacity="0.15" />
              <line x1="40" y1="0" x2="40" y2="400" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="8 6" opacity="0.3" />

              {/* Town Streets (Gray Lines) */}
              {/* Main horizontal crossroad */}
              <line x1="0" y1="200" x2="400" y2="200" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

              {/* Main vertical crossroad */}
              <line x1="220" y1="0" x2="220" y2="400" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
              <line x1="220" y1="0" x2="220" y2="400" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

              {/* Neighborhood branch streets */}
              <line x1="80" y1="150" x2="220" y2="150" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="340" y1="220" x2="220" y2="220" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="300" y1="60" x2="300" y2="120" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="300" y1="120" x2="220" y2="120" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="320" x2="140" y2="320" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="140" y1="320" x2="140" y2="240" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="140" y1="240" x2="220" y2="200" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

              {/* Traffic Overlays */}
              {showTraffic && (
                <g opacity="0.65">
                  {/* Main horizontal crossroad - Green (Fast) */}
                  <line x1="0" y1="200" x2="180" y2="200" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Near chauraha - Orange (Moderate traffic) */}
                  <line x1="180" y1="200" x2="260" y2="200" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="260" y1="200" x2="400" y2="200" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Main vertical crossroad - Green & Yellow */}
                  <line x1="220" y1="0" x2="220" y2="160" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Near Chauraha / Market - Orange/Red congestion */}
                  <line x1="220" y1="160" x2="220" y2="240" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="220" y1="240" x2="220" y2="400" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Neighborhood branch streets */}
                  <line x1="80" y1="150" x2="220" y2="150" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="340" y1="220" x2="220" y2="220" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="300" y1="60" x2="300" y2="120" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="300" y1="120" x2="220" y2="120" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="100" y1="320" x2="140" y2="320" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="140" y1="320" x2="140" y2="240" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="140" y1="240" x2="220" y2="200" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}

              {/* Street Names / Text Labels */}
              <g className="opacity-40 select-none">
                <text x="50" y="245" className="text-[7px] font-mono font-black fill-slate-300" transform="rotate(-90 50 245)">NH-34 HIGHWAY</text>
                <text x="250" y="115" className="text-[6px] font-bold fill-slate-400">Galla Mandi Rd</text>
                <text x="110" y="145" className="text-[6px] font-bold fill-slate-400">Rahmaniya Ln</text>
                <text x="270" y="232" className="text-[6px] font-bold fill-slate-400">Subhash Nagar Rd</text>
                <text x="145" y="280" className="text-[6px] font-bold fill-slate-400" transform="rotate(-60 145 280)">Naya Bazar Rd</text>
                <text x="230" y="380" className="text-[6px] font-bold fill-slate-400" transform="rotate(90 230 380)">Station Rd</text>
              </g>

              {/* Transit Route (Active Glowing Path) */}
              <motion.path
                d={svgPathData}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />

              {/* Animated pulse trail on the route */}
              <path
                d={svgPathData}
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="15 50"
                className="animate-[dash_3s_linear_infinite]"
              />

              {/* Landmarks */}
              {landmarks.map((l, index) => {
                if (l.isHighway) return null;

                const isHome = l.isHome;
                const isSelectedStore =
                  (order.storeId === 'gupta-kirana' && l.name.includes('Gupta')) ||
                  (order.storeId === 'siddiqui-fruits' && l.name.includes('Siddiqui')) ||
                  (order.storeId === 'maudaha-dairy' && l.name.includes('Dairy')) ||
                  (order.storeId === 'bundelkhand-sweets' && l.name.includes('Sweets'));

                return (
                  <g 
                    key={index} 
                    transform={`translate(${l.x}, ${l.y})`}
                    className="cursor-pointer group/landmark select-none"
                    onClick={() => {
                      let key = l.key || '';
                      if (key && landmarkDetails[key]) {
                        setSelectedLandmark({
                          name: l.name.split(' (')[0],
                          nameHi: l.name.includes('Gupta') ? 'गुप्ता किराना' :
                                  l.name.includes('Siddiqui') ? 'सिद्दीकी फ्रूट्स' :
                                  l.name.includes('Dairy') ? 'रहमानिया डेयरी' :
                                  l.name.includes('Sweets') ? 'बुंदेलखंड स्वीट्स' :
                                  l.name.includes('Chauraha') ? 'मुख्य चौराहा' : 'आपका घर',
                          desc: landmarkDetails[key].descEn,
                          descHi: landmarkDetails[key].descHi,
                          type: landmarkDetails[key].type
                        });
                      }
                    }}
                  >
                    {/* Pulsing glow ring for store & home */}
                    {(isSelectedStore || isHome || l.isHub) && (
                      <circle
                        r={isHome ? "16" : "12"}
                        fill="none"
                        stroke={isHome ? "#10b981" : l.isHub ? "#38bdf8" : "#f59e0b"}
                        strokeWidth="2"
                        className="animate-ping opacity-30 group-hover/landmark:scale-110 transition-transform"
                      />
                    )}

                    {/* Dot */}
                    <circle
                      r={isHome ? "7" : l.isHub ? "4" : "6"}
                      fill={isHome ? "#10b981" : l.isHub ? "#38bdf8" : isSelectedStore ? "#f59e0b" : "#475569"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="group-hover/landmark:stroke-amber-400 transition"
                    />

                    {/* Text Labels */}
                    <text
                      y={isHome ? "-14" : "16"}
                      textAnchor="middle"
                      className="text-[9px] font-bold tracking-tight font-sans fill-white stroke-slate-900 stroke-[2px] paint-order-stroke group-hover/landmark:fill-amber-400 transition"
                    >
                      {language === 'hi' ? (
                        l.name.includes('Gupta') ? 'गुप्ता किराना (गल्ला मंडी)' :
                        l.name.includes('Siddiqui') ? 'सिद्दीकी फ्रूट्स (भाटीपुरा)' :
                        l.name.includes('Dairy') ? 'रहमानिया डेयरी' :
                        l.name.includes('Sweets') ? 'बुंदेलखंड स्वीट्स' :
                        l.name.includes('Chauraha') ? 'मुख्य चौराहा (मौदहा)' : 'आपका घर'
                      ) : (
                        l.name.split(' (')[0]
                      )}
                    </text>
                  </g>
                );
              })}

              {/* Live Moving Rider Marker */}
              <motion.g
                animate={{ 
                  x: riderCoords.x, 
                  y: riderCoords.y,
                  rotate: order.deliveryStatus === 'out_for_delivery' ? riderAngle : 0
                }}
                transition={{ type: 'spring', stiffness: 60, damping: 12 }}
              >
                {/* Rider glow background */}
                <circle r="14" fill="#10b981" className="opacity-25 animate-pulse" />
                <circle r="8" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />

                {/* Bike navigation pin pointer shape */}
                <path
                  d="M -4 -4 L 0 -12 L 4 -4 Z"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1"
                />

                {/* Rider icon representation (tiny helmet dot) */}
                <circle cy="-1" r="2" fill="#ffffff" />
              </motion.g>
            </svg>

            {/* Float HUD card */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-slate-800 p-3 rounded-lg flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 font-mono tracking-wider uppercase">
                  {language === 'en' ? 'DELIVERY BOY STATUS' : 'डिलीवरी बॉय की स्थिति'}:{' '}
                  {order.deliveryStatus === 'pending' || order.deliveryStatus === 'processing'
                    ? (language === 'en' ? 'Order preparing at store' : 'दुकान पर ऑर्डर तैयार हो रहा है')
                    : order.deliveryStatus === 'ready_for_pickup'
                    ? (language === 'en' ? 'Packed! Awaiting pickup' : 'पैक हो गया! पिकअप की प्रतीक्षा है')
                    : order.deliveryStatus === 'ready_for_delivery'
                    ? (language === 'en' ? 'Delivery boy accepted & loading items' : 'डिलीवरी बॉय ने स्वीकार किया और सामान ले रहा है')
                    : order.deliveryStatus === 'out_for_delivery'
                    ? (language === 'en' ? `En-Route (${Math.round(progressPercent * 100)}% custom route)` : `रास्ते में है (मार्ग ${Math.round(progressPercent * 100)}%)`)
                    : (language === 'en' ? 'Arrived at your doorstep!' : 'आपके दरवाजे पर पहुंच गया है!')}
                </span>
              </div>
              <span className="text-[10px] font-semibold font-mono text-emerald-400">
                ⚡ LIVE GPS 1 Hz
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-semibold text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block border border-white" />
              <span>{language === 'en' ? 'Merchant Store' : 'विक्रेता की दुकान'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block border border-white" />
              <span>{language === 'en' ? 'Your House' : 'आपका घर'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block border border-white" />
              <span>{language === 'en' ? 'Central Hub' : 'मुख्य चौराहा'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-emerald-400 inline-block" />
              <span>{language === 'en' ? 'Delivery Route' : 'वितरण मार्ग'}</span>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Styled css animation keyframes for trail pulse */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -70;
          }
        }
        .paint-order-stroke {
          paint-order: stroke fill;
        }
      `}</style>
    </div>
  );
}
