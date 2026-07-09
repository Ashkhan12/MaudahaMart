import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, MicOff, Volume2, Sparkles, Loader2, HeartPulse, X } from 'lucide-react';
import { Language, Product } from '../types';

interface SmartSearchBarProps {
  language: Language;
  products: Product[];
  onSearch: (query: string) => void;
  searchQuery: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SmartSearchBar({ language, products, onSearch, searchQuery, onFocus, onBlur }: SmartSearchBarProps) {
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  
  const [isVoiceToTextListening, setIsVoiceToTextListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const voiceToTextRef = useRef<any>(null);

  // Filter a few product names for the cycling placeholder
  const productNames = products.slice(0, 10).map(p => language === 'hi' ? p.nameHi : p.name);
  if (productNames.length === 0) {
    productNames.push(language === 'hi' ? 'ताज़ा सब्जियां' : 'Fresh Vegetables');
    productNames.push(language === 'hi' ? 'दैनिक उपयोग का सामान' : 'Daily Essentials');
    productNames.push(language === 'hi' ? 'स्वास्थ्य उत्पाद' : 'Health Products');
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex(prev => (prev + 1) % productNames.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [productNames.length]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSearch(transcript);
        setIsListening(false);
        handleVoiceQuery(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Normal voice to text recognition
      voiceToTextRef.current = new SpeechRecognition();
      voiceToTextRef.current.continuous = false;
      voiceToTextRef.current.interimResults = false;
      voiceToTextRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      voiceToTextRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSearch(transcript);
        if (onFocus) onFocus(); // Open the autocomplete popover
        setIsVoiceToTextListening(false);
      };

      voiceToTextRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsVoiceToTextListening(false);
      };

      voiceToTextRef.current.onend = () => {
        setIsVoiceToTextListening(false);
      };
    }
  }, [language, onSearch, onFocus]);

  const startListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        setAiReply(null);
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      alert(language === 'en' ? 'Voice search is not supported in your browser.' : 'आपके ब्राउज़र में वॉइस सर्च सपोर्ट नहीं है।');
    }
  };

  const startVoiceToText = () => {
    if (voiceToTextRef.current) {
      if (isVoiceToTextListening) {
        voiceToTextRef.current.stop();
      } else {
        try {
          voiceToTextRef.current.start();
          setIsVoiceToTextListening(true);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      alert(language === 'en' ? 'Voice search is not supported in your browser.' : 'आपके ब्राउज़र में वॉइस सर्च सपोर्ट नहीं है।');
    }
  };

  const handleVoiceQuery = async (query: string) => {
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/voice-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language,
          products: products.slice(0, 30) // send a subset to avoid huge payload
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiReply(data.reply);
        speakText(data.reply);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setAiReply(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 mt-2 relative">
      <div 
        className="relative group w-full flex items-center bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-emerald-100 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)] focus-within:shadow-[0_8px_40px_rgba(16,185,129,0.3)] focus-within:border-emerald-400 overflow-visible"
        style={{
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.4), inset 0 0 10px rgba(16, 185, 129, 0.1)',
        }}
      >
        <div className="pl-6 pr-3 py-4 flex-shrink-0 text-emerald-500">
          <Search className="h-6 w-6" />
        </div>
        
        <div className="relative flex-1 h-14">
          <input
            type="text"
            value={searchQuery}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder-transparent z-10 relative pr-24"
            style={{ paddingBottom: '2px' }}
          />
          
          {!searchQuery && (
            <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden">
              <div className="text-slate-400 text-sm font-semibold">
                {language === 'en' ? 'Search for ' : 'सर्च करें '}
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={suggestionIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-2 text-emerald-600 font-bold text-sm"
                >
                  "{productNames[suggestionIndex]}"
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearch('');
                if (onFocus) onFocus();
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-20"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={startVoiceToText}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-20 ${
              isVoiceToTextListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={language === 'en' ? 'Voice Typing' : 'बोल कर खोजें'}
          >
            {isVoiceToTextListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>

        {/* AI Assistant Button */}
        <div className="pr-3 pl-2 py-2 border-l border-emerald-100 flex items-center">
          <button
            onClick={startListening}
            className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all overflow-hidden ${
              isListening 
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]'
            }`}
          >
            {/* Sparkle effects when not listening */}
            {!isListening && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, white, transparent)'
                }}
              />
            )}
            
            {isProcessingAI ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
            
            <span className="hidden sm:inline-block relative z-10">
              {isProcessingAI 
                ? (language === 'hi' ? 'सोच रहा है...' : 'Thinking...')
                : isListening 
                  ? (language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...')
                  : (language === 'hi' ? 'स्मार्ट AI सर्च' : 'Smart AI Search')
              }
            </span>

            {!isListening && !isProcessingAI && <Sparkles className="h-4 w-4 relative z-10" />}
          </button>
        </div>
      </div>

      {/* AI Reply Bubble */}
      <AnimatePresence>
        {aiReply && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 z-50 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border-2 border-emerald-500/30 flex items-start gap-4"
          >
            <div className="bg-emerald-500/20 p-3 rounded-full flex-shrink-0 animate-pulse text-emerald-400">
              <Volume2 className="h-6 w-6" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">
                  {language === 'en' ? 'AI Assistant' : 'एआई सहायक'}
                </h4>
                {aiReply.toLowerCase().includes('health') || aiReply.toLowerCase().includes('स्वास्थ्य') || aiReply.toLowerCase().includes('immunity') ? (
                   <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-500/30 ml-auto">
                     <HeartPulse className="h-3 w-3" />
                     {language === 'en' ? 'Health Suggestion' : 'स्वास्थ्य सुझाव'}
                   </span>
                ) : null}
              </div>
              <p className="text-base leading-relaxed font-medium text-slate-100">
                {aiReply}
              </p>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={stopSpeaking}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-bold transition-colors text-slate-300"
                >
                  {language === 'en' ? 'Close & Stop Audio' : 'बंद करें और ऑडियो रोकें'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
