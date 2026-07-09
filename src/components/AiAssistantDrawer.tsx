/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Tag, Send, Sparkles, ShoppingBag, Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Product, Store, Language } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  products: Product[];
  stores: Store[];
  onAddToCart: (storeId: string, product: Product) => void;
  activeUserId: string;
  onAddSearch?: (userId: string, query: string) => void;
}

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  language,
  products,
  stores,
  onAddToCart,
  activeUserId,
  onAddSearch
}: AiAssistantDrawerProps) {
  // --- States ---
  const [aiMode, setAiMode] = useState<'chat' | 'parse'>('chat');
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: language === 'en' 
        ? "Namaste! I am the Maudaha Mart Smart AI Assistant. 🤖 Ask me anything about groceries, recipes, or type/paste your shopping list in the other tab to instantly fill your cart!" 
        : "नमस्ते! मैं मौदहा मार्ट स्मार्ट एआई सहायक हूं। 🤖 मुझसे किराना सामान, व्यंजनों के बारे में कुछ भी पूछें, या अपना कार्ट भरने के लिए दूसरे टैब में सामान की सूची लिखें/पेस्ट करें!"
    }
  ]);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  
  const [rawTextList, setRawTextList] = useState('');
  const [aiParseLoading, setAiParseLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [parseError, setParseError] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiChatHistory, aiChatLoading, isOpen]);

  if (!isOpen) return null;

  // Handle AI Chat submit
  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = aiMessage.trim();
    if (!query) return;

    // Add user message to history
    const newUserTurn = { role: 'user' as const, text: query };
    setAiChatHistory(prev => [...prev, newUserTurn]);
    setAiMessage('');
    setAiChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: aiChatHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with AI server.');
      }

      const data = await response.json();
      setAiChatHistory(prev => [...prev, { role: 'model' as const, text: data.text }]);
      
      if (onAddSearch) {
        onAddSearch(activeUserId, query);
      }
    } catch (err: any) {
      console.error(err);
      setAiChatHistory(prev => [...prev, {
        role: 'model' as const,
        text: language === 'en' 
          ? "⚠️ Sorry, I had trouble connecting to the server. Please check your internet connection and verify GEMINI_API_KEY is configured."
          : "⚠️ क्षमा करें, मुझे सर्वर से जुड़ने में समस्या हुई। कृपया अपना इंटरनेट कनेक्शन जांचें और पुष्टि करें कि GEMINI_API_KEY कॉन्फ़िगर किया गया है।"
      }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Handle AI Shopping List Parse
  const handleAiParseList = async () => {
    const listText = rawTextList.trim();
    if (!listText) {
      setParseError(language === 'en' ? 'Please type or paste a list first!' : 'कृपया पहले एक सूची लिखें या पेस्ट करें!');
      return;
    }

    setAiParseLoading(true);
    setParseError('');
    setParsedItems([]);

    try {
      const response = await fetch('/api/ai-parse-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textList: listText })
      });

      if (!response.ok) {
        throw new Error('Failed to parse list with AI.');
      }

      const data = await response.json();
      if (data.offline) {
        setParseError(language === 'en' 
          ? "Maudaha AI is offline. Please configure GEMINI_API_KEY in Settings > Secrets to parse shopping lists instantly!" 
          : "मौदहा एआई ऑफ़लाइन है। कृपया सूचियों को तुरंत पार्स करने के लिए सेटिंग्स > सीक्रेट्स में GEMINI_API_KEY कॉन्फ़िगर करें!");
      } else {
        setParsedItems(data.items || []);
        if (!data.items || data.items.length === 0) {
          setParseError(language === 'en' ? 'No items could be parsed from your list.' : 'आपकी सूची से कोई वस्तु पार्स नहीं की जा सकी।');
        }
      }
    } catch (err: any) {
      console.error(err);
      setParseError(language === 'en' 
        ? "Failed to connect to AI server. Please verify your API key is configured." 
        : "एआई सर्वर से जुड़ने में विफल। कृपया सत्यापित करें कि आपकी एपीआई कुंजी कॉन्फ़िगर है।");
    } finally {
      setAiParseLoading(false);
    }
  };

  // Add individual parsed item to cart
  const addParsedItemToCart = (item: any) => {
    const productObj = products.find(p => p.id === item.matchedProductId);
    if (productObj && item.matchedStoreId) {
      const qty = parseInt(item.quantity) || 1;
      for (let i = 0; i < qty; i++) {
        onAddToCart(item.matchedStoreId, productObj);
      }
      alert(language === 'en' 
        ? `Added ${qty}x ${productObj.name} to cart!` 
        : `कार्ट में ${qty}x ${productObj.nameHi || productObj.name} जोड़ा गया!`);
    }
  };

  // Add all parsed & matched items to cart
  const addAllParsedItemsToCart = () => {
    let addedCount = 0;
    parsedItems.forEach(item => {
      if (item.matchedProductId && item.matchedStoreId) {
        const productObj = products.find(p => p.id === item.matchedProductId);
        if (productObj) {
          const qty = parseInt(item.quantity) || 1;
          for (let i = 0; i < qty; i++) {
            onAddToCart(item.matchedStoreId, productObj);
          }
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      alert(language === 'en' 
        ? `Successfully matched and added ${addedCount} items to your cart!` 
        : `सफलतापूर्वक मिलान किया गया और ${addedCount} वस्तुओं को आपके कार्ट में जोड़ा गया!`);
      setParsedItems([]);
      setRawTextList('');
    } else {
      alert(language === 'en' 
        ? "No matching items could be added to your cart." 
        : "आपके कार्ट में कोई भी मिलान वाली वस्तु नहीं जोड़ी जा सकी।");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="ai-assistant-drawer-modal">
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300" 
      />

      <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 text-white">
        
        {/* Header Area */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-extrabold shadow-inner animate-pulse">
              ✨
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                {language === 'en' ? 'Maudaha Mart Smart AI' : 'मौदहा मार्ट स्मार्ट एआई'}
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                  Gemini 3.5
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {language === 'en' ? 'AI Shopping Companion & List Matcher' : 'एआई शॉपिंग सहायक और सूची मिलानकर्ता'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {language === 'en' ? 'Select AI Mode' : 'एआई मोड चुनें'}
          </span>
          <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setAiMode('chat')}
              className={`px-3 py-1 rounded-md text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                aiMode === 'chat' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{language === 'en' ? 'AI Assistant' : 'एआई सहायक'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAiMode('parse')}
              className={`px-3 py-1 rounded-md text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                aiMode === 'parse' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="h-3 w-3" />
              <span>{language === 'en' ? 'AI List Parser' : 'एआई सूची पार्सर'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Panel Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* AI Chat Mode */}
          {aiMode === 'chat' && (
            <div className="flex flex-col h-full justify-between gap-4">
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-270px)] scrollbar-thin"
              >
                {aiChatHistory.map((turn, index) => {
                  const isUser = turn.role === 'user';
                  return (
                    <div 
                      key={index} 
                      className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 select-none ${
                        isUser ? 'bg-emerald-600 text-white' : 'bg-slate-850 text-emerald-400 border border-slate-700'
                      }`}>
                        {isUser ? '👤' : '🤖'}
                      </div>
                      <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                        isUser 
                          ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-100' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
                      }`}>
                        {turn.text}
                      </div>
                    </div>
                  );
                })}
                {aiChatLoading && (
                  <div className="flex gap-3 mr-auto items-center">
                    <div className="h-7 w-7 rounded-full bg-slate-850 text-emerald-400 flex items-center justify-center text-xs shrink-0 border border-slate-700">
                      🤖
                    </div>
                    <div className="bg-slate-900 border border-slate-800 text-slate-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span>{language === 'en' ? 'Maudaha AI is thinking...' : 'मौदहा एआई सोच रहा है...'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAiChatSubmit} className="flex gap-2 bg-slate-950/80 p-2 border border-slate-800 rounded-xl shrink-0">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? "Ask about Gupta Ji's inventory, recipes, or delivery..."
                      : "गुप्ता जी की सामग्री, व्यंजनों या डिलीवरी के बारे में पूछें..."
                  }
                  className="flex-1 px-3 py-2 bg-transparent text-xs font-bold text-white outline-none placeholder-slate-500"
                  disabled={aiChatLoading}
                />
                <button
                  type="submit"
                  disabled={aiChatLoading || !aiMessage.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{language === 'en' ? 'Send' : 'भेजें'}</span>
                </button>
              </form>
            </div>
          )}

          {/* AI List Parser Mode */}
          {aiMode === 'parse' && (
            <div className="space-y-4">
              {/* Text Input Block */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                  {language === 'en' ? 'Paste / Type Your Shopping List' : 'अपनी सामान सूची यहाँ लिखें या पेस्ट करें'}
                </label>
                <textarea
                  rows={5}
                  value={rawTextList}
                  onChange={(e) => setRawTextList(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? "Example:\n2 packet Maggi\n1 kg sugar\nFortune Premium oil 1ltr\nGupta Ji Atta 5kg..."
                      : "उदाहरण:\n२ पैकेट मैगी\n१ किलो चीनी\nफॉर्च्यून शुद्ध सरसों तेल १ लीटर\nप्रीमियम चक्की आटा ५ किलो..."
                  }
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-500 focus:bg-slate-950/90 transition placeholder-slate-600 resize-none font-mono"
                  disabled={aiParseLoading}
                />
                <button
                  type="button"
                  onClick={handleAiParseList}
                  disabled={aiParseLoading || !rawTextList.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide font-mono"
                >
                  {aiParseLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{language === 'en' ? 'Matching Catalog...' : 'सामग्रियों का मिलान किया जा रहा है...'}</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>{language === 'en' ? 'Smart Match with Maudaha Stores' : 'मौदहा दुकानों से स्मार्ट मिलान करें'}</span>
                    </>
                  )}
                </button>
                {parseError && (
                  <p className="text-xs text-rose-400 font-bold bg-rose-950/40 border border-rose-900/40 p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>⚠️ {parseError}</span>
                  </p>
                )}
              </div>

              {/* Matched Catalog Output */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                    {language === 'en' ? 'AI Matched Local Products' : 'एआई द्वारा मिलाए गए स्थानीय उत्पाद'}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-1.5 py-0.5 rounded font-black">
                    {parsedItems.length} {language === 'en' ? 'Items Found' : 'सामग्रियां मिलीं'}
                  </span>
                </div>

                {parsedItems.length === 0 ? (
                  <div className="py-8 text-center text-xs font-bold text-slate-500 italic">
                    {language === 'en' 
                      ? 'No matched products yet. Write your list and click match!' 
                      : 'अभी तक कोई मिलान उत्पाद नहीं मिला। सूची लिखें और मिलान करें!'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {parsedItems.map((item, idx) => {
                      const hasMatch = !!item.matchedProductId;
                      const matchingStore = stores.find(s => s.id === item.matchedStoreId);

                      return (
                        <div 
                          key={idx} 
                          className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-300 truncate">{item.itemName}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                                Qty: {item.quantity}
                              </span>
                            </div>

                            {hasMatch ? (
                              <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px]">
                                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {language === 'hi' ? item.matchedProductNameHi || item.matchedProductName : item.matchedProductName}
                                </span>
                                <span className="text-slate-500 font-medium">
                                  🏪 {language === 'hi' ? matchingStore?.nameHi : matchingStore?.name}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-1 text-[10px] text-rose-400 font-extrabold">
                                ❌ {language === 'en' ? 'No catalog product matches' : 'कोई उत्पाद मेल नहीं खाता'}
                              </div>
                            )}
                          </div>

                          {hasMatch && (
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-black text-emerald-400">₹{item.price}</span>
                              <button
                                type="button"
                                onClick={() => addParsedItemToCart(item)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer"
                                title={language === 'en' ? 'Add to Cart' : 'कार्ट में जोड़ें'}
                              >
                                🛒
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {parsedItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={addAllParsedItemsToCart}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider"
                    >
                      <span>🛒</span>
                      <span>
                        {language === 'en' 
                          ? `Add All Match Items to Cart` 
                          : 'सभी मिलान वस्तुओं को कार्ट में जोड़ें'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Helper */}
        <div className="p-4 bg-slate-950 text-center text-[10px] text-slate-500 font-bold border-t border-slate-800 select-none">
          {language === 'en' ? '⚡ Fully automated with local Maudaha Mart catalog search!' : '⚡ स्थानीय मौदहा मार्ट कैटलॉग खोज के साथ पूरी तरह से स्वचालित!'}
        </div>
      </div>
    </div>
  );
}
