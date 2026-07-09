import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, Store, User } from 'lucide-react';
import { Order, Language } from '../types';

interface OrderReviewPopupProps {
  orders: Order[];
  language: Language;
  onUpdateOrders: (orders: Order[]) => void;
  onAddReview: (review: any) => void;
  activeUserId: string;
}

export default function OrderReviewPopup({ orders, language, onUpdateOrders, onAddReview, activeUserId }: OrderReviewPopupProps) {
  const [orderToReview, setOrderToReview] = useState<Order | null>(null);
  const [storeRating, setStoreRating] = useState(0);
  const [riderRating, setRiderRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkOrders = () => {
      const now = Date.now();
      const fifteenMins = 15 * 60 * 1000;
      
      const unreviewedOrder = orders.find(o => 
        o.userId === activeUserId &&
        o.deliveryStatus === 'arrived' && 
        o.deliveredAt && 
        !o.isReviewed &&
        (now - o.deliveredAt) >= fifteenMins
      );

      if (unreviewedOrder && !orderToReview) {
        setOrderToReview(unreviewedOrder);
      }
    };

    // Check immediately and then every minute
    checkOrders();
    const interval = setInterval(checkOrders, 60000);
    return () => clearInterval(interval);
  }, [orders, activeUserId, orderToReview]);

  if (!orderToReview) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeRating === 0 || riderRating === 0) {
      alert(language === 'en' ? 'Please rate both store and rider.' : 'कृपया स्टोर और डिलीवरी पार्टनर दोनों को रेट करें।');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Create a store review
      const newStoreReview = {
        id: `rev-${Date.now()}`,
        storeId: orderToReview.storeId,
        author: 'You', // In a real app we'd use the user's name
        rating: storeRating,
        comment: comment,
        commentHi: comment,
        date: new Date().toISOString().split('T')[0]
      };
      onAddReview(newStoreReview);

      // Mark order as reviewed
      const updatedOrders = orders.map(o => {
        if (o.id === orderToReview.id) {
          return { ...o, isReviewed: true };
        }
        return o;
      });
      onUpdateOrders(updatedOrders);

      setOrderToReview(null);
      setStoreRating(0);
      setRiderRating(0);
      setComment('');
      setIsSubmitting(false);
      
      alert(language === 'en' ? 'Thank you for your feedback!' : 'आपकी प्रतिक्रिया के लिए धन्यवाद!');
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="bg-emerald-600 p-6 text-white text-center relative">
            <button 
              onClick={() => {
                const updatedOrders = orders.map(o => o.id === orderToReview.id ? { ...o, isReviewed: true } : o);
                onUpdateOrders(updatedOrders);
                setOrderToReview(null);
              }}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3 backdrop-blur-md">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {language === 'en' ? 'Order Delivered!' : 'ऑर्डर डिलीवर हो गया!'}
            </h2>
            <p className="text-emerald-100 text-sm font-medium opacity-90">
              {language === 'en' 
                ? 'How was your experience with us?' 
                : 'हमारे साथ आपका अनुभव कैसा रहा?'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Store Rating */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Store className="w-4 h-4 text-emerald-600" />
                <label className="text-sm font-bold uppercase tracking-wide">
                  {language === 'en' 
                    ? `Rate ${orderToReview.storeName || 'the Store'}` 
                    : `${orderToReview.storeNameHi || 'स्टोर'} को रेट करें`}
                </label>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`store-${star}`}
                    type="button"
                    onClick={() => setStoreRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= storeRating 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm' 
                          : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Rider Rating */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-emerald-600" />
                <label className="text-sm font-bold uppercase tracking-wide">
                  {language === 'en' ? 'Rate your Delivery Rider' : 'डिलीवरी पार्टनर को रेट करें'}
                </label>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`rider-${star}`}
                    type="button"
                    onClick={() => setRiderRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= riderRating 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm' 
                          : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'en' ? 'Any additional feedback?' : 'कोई अतिरिक्त प्रतिक्रिया?'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={language === 'en' ? "Tell us what you liked or what we can improve..." : "हमें बताएं कि आपको क्या पसंद आया या हम क्या सुधार कर सकते हैं..."}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-colors min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || storeRating === 0 || riderRating === 0}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-600/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  {language === 'en' ? 'Submitting...' : 'जमा कर रहा है...'}
                </>
              ) : (
                language === 'en' ? 'Submit Feedback' : 'प्रतिक्रिया भेजें'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
