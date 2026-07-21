import { useState, useEffect } from 'react';
import { Smartphone, Download, Sparkles, Share2, CheckCircle2, Info, X, Settings, Tablet, RefreshCw, Zap } from 'lucide-react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AndroidAppHubProps {
  language: Language;
  onClose: () => void;
}

export default function AndroidAppHub({ language, onClose }: AndroidAppHubProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'capacitor'>('instant');

  // Detect PWA installability
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions if prompt is not available
      alert(
        language === 'en'
          ? "To install on your Android device:\n1. Tap the three dots (⋮) in Chrome's top right corner.\n2. Tap 'Add to Home screen' or 'Install app'.\n3. Start using it as a native full-screen app!"
          : "अपने एंड्रॉइड डिवाइस पर इंस्टॉल करने के लिए:\n1. क्रोम के ऊपरी दाएं कोने में तीन बिंदुओं (⋮) पर टैप करें।\n2. 'होम स्क्रीन पर जोड़ें' या 'ऐप इंस्टॉल करें' पर टैप करें।\n3. इसे एक नेटिव फुल-स्क्रीन ऐप के रूप में उपयोग करना शुरू करें!"
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const t = {
    title: language === 'en' ? 'Maudaha Mart Android Center' : 'मौदहा मार्ट एंड्रॉइड केंद्र',
    subtitle: language === 'en' ? 'Run Maudaha Mart as a standalone Android Application' : 'मौदहा मार्ट को एक स्टैंडअलोन एंड्रॉइड एप्लिकेशन के रूप में चलाएं',
    instantInstall: language === 'en' ? 'Instant Play Store-Style App' : 'इंस्टेंट प्ले स्टोर-स्टाइल ऐप',
    buildApk: language === 'en' ? 'Capacitor APK Wrapper' : 'कैपेसिटर एपीके रैपर',
    whyInstall: language === 'en' ? 'Why install Maudaha Mart on Android?' : 'एंड्रॉइड पर मौदहा मार्ट क्यों इंस्टॉल करें?',
    standaloneMode: language === 'en' ? 'Fullscreen App Mode' : 'फुलस्क्रीन ऐप मोड',
    standaloneDesc: language === 'en' ? 'Removes the browser search bar and operates like a native mobile app.' : 'ब्राउज़र सर्च बार को हटाता है और एक नेटिव मोबाइल ऐप की तरह काम करता है।',
    offlinePower: language === 'en' ? 'Offline Capabilities' : 'ऑफ़लाइन क्षमताएं',
    offlineDesc: language === 'en' ? 'Browse previous purchases, reward histories, and stores even during bad network drops.' : 'खराब नेटवर्क होने पर भी पिछली खरीदारियों, इनाम इतिहास और स्टोर को ब्राउज़ करें।',
    launcherIcon: language === 'en' ? 'Home Launcher Icon' : 'होम लॉन्चर आइकन',
    launcherDesc: language === 'en' ? 'Gets its own gorgeous high-resolution launcher icon directly in your Android App drawer.' : 'सीधे आपके एंड्रॉइड ऐप ड्रॉवर में अपना खुद का खूबसूरत हाई-रिज़ॉल्यूशन लॉन्चर आइकन मिलता है।',
    vibrationFeed: language === 'en' ? 'Haptic Response' : 'हैप्टिक रिस्पांस',
    vibrationDesc: language === 'en' ? 'Feels more tactile with physics-based sliding transitions and physical haptic click vibrations.' : 'भौतिक हैप्टिक क्लिक कंपन और स्लाइडिंग ट्रांज़िशन के साथ अधिक वास्तविक महसूस होता है।',
    installButtonText: language === 'en' ? 'Install App on Android' : 'एंड्रॉइड पर ऐप इंस्टॉल करें',
    installedText: language === 'en' ? '✓ Installed & Running Standalone!' : '✓ इंस्टॉल और स्टैंडअलोन चल रहा है!',
    manualTitle: language === 'en' ? 'How to Install Manually via Chrome' : 'क्रोम के माध्यम से मैन्युअल रूप से कैसे इंस्टॉल करें',
    step1: language === 'en' ? '1. Open Chrome on Android and visit this link' : '1. एंड्रॉइड पर क्रोम खोलें और इस लिंक पर जाएं',
    step2: language === 'en' ? "2. Tap the menu dots (⋮) beside the address bar" : "2. एड्रेस बार के पास मेनू डॉट्स (⋮) पर टैप करें",
    step3: language === 'en' ? "3. Choose 'Add to Home Screen' or 'Install App'" : "3. 'होम स्क्रीन पर जोड़ें' या 'ऐप इंस्टॉल करें' चुनें",
    capacitorTitle: language === 'en' ? 'Compile Native APK Guide' : 'नेटिव एपीके कंपाइल गाइड',
    capacitorSub: language === 'en' ? 'For developers who want to wrap this fullstack React app as a native Android APK package.' : 'उन डेवलपर्स के लिए जो इस फुलस्टैक रिएक्ट ऐप को नेटिव एंड्रॉइड एपीके पैकेज के रूप में रैप करना चाहते हैं।'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Colorful Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-6 text-white relative shrink-0">
          <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-white/10 blur-xl" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl border border-white/20 backdrop-blur-md shrink-0">
                <Smartphone className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider font-mono">
                  Android Native Mode
                </span>
                <h3 className="text-xl font-black tracking-tight mt-1">{t.title}</h3>
                <p className="text-xs text-emerald-100 mt-0.5 font-medium">{t.subtitle}</p>
              </div>
            </div>
            <button type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/10 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs inside Android Hub */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 shrink-0">
          <button type="button"
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-xl border transition ${
              activeTab === 'instant'
                ? 'bg-emerald-500 text-white border-transparent shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            🚀 {t.instantInstall}
          </button>
          <button type="button"
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-xl border transition ${
              activeTab === 'capacitor'
                ? 'bg-emerald-500 text-white border-transparent shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            🛠️ {t.capacitorTitle}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 cursor-pointer">
          {activeTab === 'instant' && (
            <>
              {/* Launcher/App Preview Card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 font-black text-7xl select-none select-none tracking-tighter">
                  PWA
                </div>
                <div className="h-20 w-20 bg-white rounded-2xl border border-slate-100 shadow-md p-1.5 shrink-0 flex items-center justify-center">
                  <img
                    src="/icon-192.png"
                    alt="Maudaha Mart Icon"
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // fallback icon
                      e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=192";
                    }}
                  />
                </div>
                <div className="text-center sm:text-left flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <h4 className="font-extrabold text-slate-800 text-base">Maudaha Mart (मौदहा मार्ट)</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black font-mono px-2 py-0.5 rounded-full border border-emerald-200">
                      v2.1-STABLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {language === 'en'
                      ? 'Lightweight web wrapper that registers as a system-integrated app on Android devices. Zero download overhead, secure sandboxing.'
                      : 'हल्का वेब रैपर जो एंड्रॉइड डिवाइसों पर सिस्टम-एकीकृत ऐप के रूप में पंजीकृत होता है। शून्य डाउनलोड ओवरहेड, सुरक्षित सैंडबॉक्सिंग।'}
                  </p>

                  <div className="pt-2">
                    {isInstalled ? (
                      <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-black">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t.installedText}</span>
                      </div>
                    ) : (
                      <button type="button"
                        onClick={handleInstallClick}
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 rounded-xl border border-emerald-400/20 shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                      >
                        <Download className="h-4 w-4 animate-bounce" />
                        <span>{t.installButtonText}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Core Features list */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>{t.whyInstall}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 rounded-2xl bg-white flex gap-3">
                    <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{t.standaloneMode}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-normal">{t.standaloneDesc}</p>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-2xl bg-white flex gap-3">
                    <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Tablet className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{t.launcherIcon}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-normal">{t.launcherDesc}</p>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-2xl bg-white flex gap-3">
                    <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <RefreshCw className="h-5 w-5 animate-spin-slow" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{t.offlinePower}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-normal">{t.offlineDesc}</p>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-2xl bg-white flex gap-3">
                    <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{t.vibrationFeed}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-normal">{t.vibrationDesc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Installation Instructions */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3.5">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Info className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-black">{t.manualTitle}</span>
                </div>
                <div className="text-xs text-slate-500 space-y-2 font-medium">
                  <p>{t.step1}</p>
                  <p>{t.step2}</p>
                  <p>{t.step3}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-5">
              <div className="flex gap-3 bg-emerald-50 border border-emerald-200/50 p-4 rounded-2xl">
                <Settings className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-emerald-950">{language === 'en' ? 'Developer APK Guide' : 'डेवलपर एपीके गाइड'}</p>
                  <p className="text-[11px] text-emerald-800 leading-normal font-medium">
                    {t.capacitorSub}
                  </p>
                </div>
              </div>

              {/* Step Code Blocks */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">
                    {language === 'en' ? 'Step 1: Install Capacitor in this React workspace' : 'चरण 1: इस रिएक्ट वर्कस्पेस में कैपेसिटर स्थापित करें'}
                  </span>
                  <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-nowrap shadow-inner">
                    npm install @capacitor/core @capacitor/cli
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">
                    {language === 'en' ? 'Step 2: Initialize Capacitor Config' : 'चरण 2: कैपेसिटर कॉन्फ़िगरेशन को इनिशियलाइज़ करें'}
                  </span>
                  <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-nowrap shadow-inner">
                    npx cap init "Maudaha Mart" "com.maudahamart.app" --web-dir=dist
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">
                    {language === 'en' ? 'Step 3: Add the Android platform project' : 'चरण 3: एंड्रॉइड प्लेटफ़ॉर्म प्रोजेक्ट जोड़ें'}
                  </span>
                  <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-nowrap shadow-inner">
                    npm install @capacitor/android && npx cap add android
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block">
                    {language === 'en' ? 'Step 4: Sync build artifacts and compile in Android Studio' : 'चरण 4: एंड्रॉइड स्टूडियो में सिंक करें और कंपाइल करें'}
                  </span>
                  <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-nowrap shadow-inner">
                    npm run build && npx cap sync && npx cap open android
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium">
                {language === 'en'
                  ? 'Once Android Studio is open, simply click "Build > Build Bundle(s) / APK(s) > Build APK" to output a standalone com.maudahamart.app.apk file that can be distributed directly to Android smartphones!'
                  : 'एक बार एंड्रॉइड स्टूडियो खुल जाने के बाद, सीधे अपने फोन पर चलाने के लिए "Build > Build Bundle(s) / APK(s) > Build APK" पर क्लिक करके .apk फ़ाइल डाउनलोड कर सकते हैं!'}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
          >
            {language === 'en' ? 'Close Hub' : 'बंद करें'}
          </button>
        </div>

        {/* Footer info panel */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 text-center text-[10px] text-slate-400 font-mono tracking-wide select-none">
          SECURE SANDBOXED INSTALL • DUAL HINDI-ENGLISH SUPPORTED
        </div>
      </motion.div>
    </div>
  );
}
