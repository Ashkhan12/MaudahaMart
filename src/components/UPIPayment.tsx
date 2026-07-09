/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, QrCode, CreditCard, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface UPIPaymentProps {
  amount: number;
  onPaymentSuccess: (upiId: string) => void;
  language: Language;
}

const MERCHANT_UPI_ID = 'dingdang7081@okhdfcbank';

export default function UPIPayment({ amount, onPaymentSuccess, language }: UPIPaymentProps) {
  const [upiId, setUpiId] = useState('');
  const [method, setMethod] = useState<'qr' | 'id'>('qr');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for QR code
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (method === 'qr' && timeLeft > 0 && !isSuccess) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [method, timeLeft, isSuccess]);

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId || !upiId.includes('@')) {
      alert(language === 'en' ? 'Please enter a valid UPI ID (e.g. name@okhdfc)' : 'कृपया एक मान्य UPI आईडी दर्ज करें (जैसे name@okhdfc)');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        // Return both customer UPI and recipient merchant UPI
        onPaymentSuccess(`${upiId} ➔ ${MERCHANT_UPI_ID}`);
      }, 2500);
    }, 2000);
  };

  const simulateQrScan = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(`qr-scan ➔ ${MERCHANT_UPI_ID}`);
      }, 2500);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-md mx-auto relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white rounded-2xl z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-emerald-200/50"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </motion.div>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-slate-800 mb-2 tracking-tight"
            >
              {language === 'en' ? 'Payment Successful!' : 'भुगतान सफल रहा!'}
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-500 font-medium text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100"
            >
              {language === 'en' 
                ? `₹${amount} paid securely to ${MERCHANT_UPI_ID}`
                : `₹${amount} का भुगतान सुरक्षित रूप से ${MERCHANT_UPI_ID} को किया गया`}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">
        {t.selectPayment}
      </h3>

      {/* Prominent Verified Payee Merchant Badge */}
      <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 text-emerald-800">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] font-extrabold tracking-wider uppercase">
            {language === 'en' ? 'Verified Merchant Recipient' : 'सत्यापित मर्चेंट प्राप्तकर्ता'}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-sm font-black text-slate-800 font-mono select-all select-text px-2 py-0.5 bg-white/70 rounded border border-slate-150">
            {MERCHANT_UPI_ID}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 font-bold block mt-1.5">
          {language === 'en' ? 'All payments are securely routed to this official ID' : 'सभी भुगतान सुरक्षित रूप से इस आधिकारिक आईडी पर भेजे जाते हैं'}
        </span>
      </div>

      <div className="flex border border-slate-200 rounded-lg overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => setMethod('qr')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${
            method === 'qr' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="h-4 w-4" />
          {language === 'en' ? 'Scan QR Code' : 'QR कोड स्कैन करें'}
        </button>
        <button
          type="button"
          onClick={() => setMethod('id')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${
            method === 'id' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          {language === 'en' ? 'Enter UPI ID' : 'UPI आईडी डालें'}
        </button>
      </div>

      {method === 'qr' ? (
        <div className="flex flex-col items-center text-center">
          <div className="relative bg-slate-50 p-4 rounded-xl border-2 border-dashed border-emerald-500/30 mb-4">
            {/* Simulated QR Code using styling elements for high-end look */}
            <div className="w-48 h-48 bg-slate-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-2 border border-slate-700 flex flex-wrap p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 m-1 border rounded-sm ${
                      (i * 3 + 7) % 5 === 0 ? 'bg-emerald-400 border-emerald-300' : 'bg-slate-800 border-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px]">
                <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col items-center">
                  <span className="text-[9px] font-bold text-emerald-600 tracking-widest font-mono">BHIM UPI</span>
                  <div className="w-16 h-16 bg-slate-950 flex items-center justify-center rounded border border-slate-200">
                    <div className="w-12 h-12 bg-white flex flex-wrap p-0.5">
                      {/* Inner QR patterns */}
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3.5 h-3.5 m-0.5 rounded-xs ${
                            i % 2 === 0 ? 'bg-black' : 'bg-white'
                          } ${i === 0 || i === 2 || i === 6 || i === 8 ? 'border-2 border-black bg-white' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isVerifying && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2"></div>
                <p className="text-sm font-semibold text-slate-700">
                  {language === 'en' ? 'Verifying payment...' : 'भुगतान सत्यापित किया जा रहा है...'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
            <Clock className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'Expires in:' : 'समाप्ति समय:'}</span>
            <span className="font-mono font-bold text-slate-800">{formatTime(timeLeft)}</span>
          </div>

          <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
            {language === 'en' ? (
              <>Scan this QR using <strong>BHIM, PhonePe, Google Pay, or Paytm</strong> to pay <strong>₹{amount}</strong> instantly to merchant UPI <strong>{MERCHANT_UPI_ID}</strong>.</>
            ) : (
              <><strong>BHIM, PhonePe, Google Pay, या Paytm</strong> का उपयोग करके इस QR को स्कैन करें और तुरंत मर्चेंट UPI <strong>{MERCHANT_UPI_ID}</strong> को <strong>₹{amount}</strong> का भुगतान करें।</>
            )}
          </p>

          <button
            type="button"
            onClick={simulateQrScan}
            disabled={isVerifying}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/10 active:scale-[0.98]"
          >
            <CheckCircle className="h-5 w-5" />
            {language === 'en' ? 'Simulate QR Code Scan' : 'QR कोड स्कैन का अनुकरण करें'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleIdSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {t.enterUpiId}
            </label>
            <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 transition-colors">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">@</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. user@ybl, name@okhdfc"
                className="w-full py-3 pl-9 pr-4 text-slate-800 rounded-xl focus:outline-none text-sm font-mono font-medium"
                required
                disabled={isVerifying}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'en' ? (
              <>You will receive a payment request notification on your linked UPI app from merchant <strong>{MERCHANT_UPI_ID}</strong>. Confirm the amount of <strong>₹{amount}</strong> there.</>
            ) : (
              <>आपको मर्चेंट <strong>{MERCHANT_UPI_ID}</strong> से अपने लिंक्ड UPI ऐप पर भुगतान अनुरोध का नोटिफिकेशन मिलेगा। वहां <strong>₹{amount}</strong> की राशि की पुष्टि करें।</>
            )}
          </p>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] shadow-md shadow-emerald-600/10"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {language === 'en' ? 'Sending Request...' : 'अनुरोध भेजा जा रहा है...'}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                {t.payNow}
              </>
            )}
          </button>
        </form>
      )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono tracking-wider">
              <span>🔒 256-BIT ENCRYPTION</span>
              <span>•</span>
              <span>NPCI APPROVED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
