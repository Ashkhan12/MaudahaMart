import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, Zap, Activity, Eye, ChevronRight, ShoppingCart, Sliders, Info, Check, ArrowUpRight, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Store, RegisteredUser, Language } from '../types';
import { calculateTensorFlowAttention, TensorFlowSummary, ItemAttentionResult } from '../lib/attentionModel';

interface AIAttentionSectionProps {
  products: Product[];
  stores: Store[];
  activeUser: RegisteredUser | null;
  language: Language;
  onAddToCart?: (product: Product) => void;
  onOpenStore?: (storeId: string) => void;
  searchQuery?: string;
  activeTab?: string;
}

export default function AIAttentionSection({
  products,
  stores,
  activeUser,
  language,
  onAddToCart,
  onOpenStore,
  searchQuery = '',
  activeTab = 'all'
}: AIAttentionSectionProps) {
  const [attentionData, setAttentionData] = useState<TensorFlowSummary | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<ItemAttentionResult<Product> | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Simulation tweak controls for interactive demonstration
  const [simulatedUrgency, setSimulatedUrgency] = useState<number>(80);
  const [simulatedBudget, setSimulatedBudget] = useState<number>(50);

  useEffect(() => {
    let isMounted = true;
    setIsCalculating(true);

    // Calculate TensorFlow Attention asynchronously
    calculateTensorFlowAttention(products, stores, activeUser, searchQuery, activeTab)
      .then((result) => {
        if (isMounted) {
          setAttentionData(result);
          setIsCalculating(false);
        }
      })
      .catch((err) => {
        console.error("TensorFlow Attention Calculation Error:", err);
        if (isMounted) setIsCalculating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [products, stores, activeUser, searchQuery, activeTab, simulatedUrgency, simulatedBudget]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddedItemIds(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItemIds(prev => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  if (!products || products.length === 0) return null;

  const topProducts = attentionData?.rankedProducts.slice(0, 4) || [];

  return (
    <div className="my-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-7 text-white shadow-2xl border border-indigo-500/20 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-[11px] font-bold font-mono tracking-wide">
            <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>TensorFlow.js Self-Attention Neural Model</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{language === 'hi' ? 'आपके लिए एआई अटेंशन सिफारिशें' : 'AI Attention Powered Recommendations'}</span>
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {language === 'hi'
              ? 'टेंसरफ्लो न्यूरल नेटवर्क आपकी ब्राउज़िंग, समय और खोज के आधार पर उत्पादों का सॉफ्टमैक्स (Softmax QK^T / √d_k) अटेंशन स्कोर की गणना करता है।'
              : 'Our deep learning model calculates real-time Query-Key-Value attention weights over your live search, context, and preferences.'}
          </p>
        </div>

        {/* Live Tensor Execution Stats */}
        <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md shrink-0 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 rounded-xl text-indigo-200">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{attentionData?.inferenceTimeMs || '1.4'} ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 rounded-xl text-purple-200">
            <Cpu className="w-3.5 h-3.5 text-purple-300" />
            <span>{attentionData?.tensorCount || '12'} Tensors</span>
          </div>
          <button
            onClick={() => setShowMatrixModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-sans rounded-xl transition duration-200 cursor-pointer text-xs shadow-lg shadow-emerald-500/20"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'अटेंशन हीटमैप देखें' : 'View Attention Heatmap'}</span>
          </button>
        </div>
      </div>

      {/* Recommended Products Grid */}
      {isCalculating ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
          {topProducts.map((pResult, idx) => {
            const product = pResult.item;
            const isAdded = addedItemIds[product.id];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                onClick={() => setSelectedProduct(pResult)}
                className="group relative bg-white/10 hover:bg-white/15 border border-white/15 hover:border-indigo-400/50 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer backdrop-blur-md shadow-lg"
              >
                {/* AI Attention Match Badge */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md font-mono">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>{pResult.attentionScore}% Match</span>
                </div>

                {/* Product Image */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800 mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-300"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute bottom-2 right-2 bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1 flex-1">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">
                    {product.category || 'Featured'}
                  </p>
                  <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-indigo-200 transition">
                    {language === 'hi' ? (product.nameHi || product.name) : product.name}
                  </h4>

                  {/* Top Match Feature Pill */}
                  <div className="pt-1 flex items-center gap-1">
                    <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-md font-mono truncate">
                      🎯 {pResult.featureBreakdown[0]?.featureName || 'High Relevancy'}
                    </span>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="pt-3 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-sm font-black text-white">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through ml-1 font-mono">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`p-2 rounded-xl transition cursor-pointer font-bold ${
                        isAdded
                          ? 'bg-emerald-500 text-slate-950 scale-105'
                          : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                      }`}
                      title={language === 'hi' ? 'कार्ट में जोड़ें' : 'Add to cart'}
                    >
                      {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Inspect Selected Product Attention Breakdown Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-lg w-full text-white space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.item.image}
                    alt={selectedProduct.item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/20"
                  />
                  <div>
                    <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full font-mono">
                      <span>TensorFlow Score: {selectedProduct.attentionScore}%</span>
                    </div>
                    <h3 className="font-extrabold text-base text-white mt-0.5">
                      {language === 'hi' ? (selectedProduct.item.nameHi || selectedProduct.item.name) : selectedProduct.item.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              {/* Attention Feature Weights Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Feature Attention Weights (Softmax QKᵀ / √dₖ)</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedProduct.featureBreakdown.map((f, i) => (
                    <div key={i} className="space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-200">
                          {language === 'hi' ? f.featureNameHi : f.featureName}
                        </span>
                        <span className="font-mono text-indigo-300 font-bold">{f.score}% Weight</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div className="text-sm font-extrabold text-amber-300 font-mono">
                  Price: ₹{selectedProduct.item.price}
                </div>
                <button
                  onClick={(e) => {
                    handleAddToCart(selectedProduct.item, e);
                    setSelectedProduct(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{language === 'hi' ? 'कार्ट में जोड़ें' : 'Add to Cart'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Attention Heatmap & Query Matrix Modal */}
      <AnimatePresence>
        {showMatrixModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-3xl w-full text-white space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-mono px-3 py-1 rounded-full border border-indigo-500/30">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>TensorFlow.js Self-Attention Transformer Inspector</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    Query-Key Attention Weight Matrix (Softmax QKᵀ / √dₖ)
                  </h3>
                </div>
                <button
                  onClick={() => setShowMatrixModal(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              {/* Attention Formula Visual Box */}
              <div className="bg-indigo-950/60 border border-indigo-500/30 p-4 rounded-2xl space-y-2 font-mono text-xs text-indigo-200">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>Equation: Attention(Q, K, V) = softmax(Q · Kᵀ / √dₖ) · V</span>
                  <span className="text-[10px] bg-indigo-500/30 px-2 py-0.5 rounded">dₖ = 8 Dimensions</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Query vector (Q) represents customer context (Search intent, Time of day, Budget).
                  Key vectors (K) represent candidate product feature embeddings. The Softmax values below represent the exact attention intensity.
                </p>
              </div>

              {/* Attention Matrix Heatmap Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Product Feature Attention Matrix</span>
                  <span className="text-emerald-400 text-[11px]">Live Inferenced</span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                        <th className="text-left py-2 px-3">Product Name</th>
                        {attentionData?.queryFeatureLabels.slice(0, 4).map((label, idx) => (
                          <th key={idx} className="text-center py-2 px-2">{label}</th>
                        ))}
                        <th className="text-right py-2 px-3">Total Attention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {attentionData?.rankedProducts.slice(0, 6).map((pRes, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition">
                          <td className="py-2.5 px-3 font-medium text-white truncate max-w-[140px]">
                            {pRes.item.name}
                          </td>
                          {pRes.featureBreakdown.slice(0, 4).map((f, fIdx) => {
                            const weightPercent = f.score;
                            // Color intensity based on weight
                            const bgOpacity = Math.max(0.15, weightPercent / 100);

                            return (
                              <td key={fIdx} className="py-2.5 px-2 text-center">
                                <span
                                  className="inline-block px-2 py-1 rounded-md text-[11px] font-bold"
                                  style={{
                                    backgroundColor: `rgba(99, 102, 241, ${bgOpacity})`,
                                    color: weightPercent > 50 ? '#ffffff' : '#cbd5e1'
                                  }}
                                >
                                  {weightPercent}%
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-3 text-right">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
                              {pRes.attentionScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Model: {attentionData?.modelVersion}</span>
                <button
                  onClick={() => setShowMatrixModal(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
                >
                  Close Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
