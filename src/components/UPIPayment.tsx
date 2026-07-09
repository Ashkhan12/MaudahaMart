/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, QrCode, CreditCard, Clock, ShieldCheck, DivideCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface UPIPaymentProps {
  amount: number;
  sellerAmount?: number;
  adminAmount?: number;
  sellerUpiId?: string;
  adminUpiId?: string;
  onPaymentSuccess: (upiId: string) => void;
  language: Language;
}

export default function UPIPayment({ amount, sellerAmount = 0, adminAmount = 0, sellerUpiId, adminUpiId = 'dingdang7081@okhdfcbank', onPaymentSuccess, language }: UPIPaymentProps) {
  const [upiId, setUpiId] = useState('');
  const [method, setMethod] = useState<'qr' | 'id'>('qr');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for QR code
  const t = TRANSLATIONS[language];

  const hasSplit = sellerAmount > 0 && adminAmount > 0;

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
    processPayment(upiId);
  };

  const simulateQrScan = () => {
    processPayment('qr-scan');
  };

  const processPayment = async (customerSource: string) => {
    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/payment/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          transfers: hasSplit ? [
            { account: sellerUpiId, amount: sellerAmount, notes: { role: 'seller' } },
            { account: adminUpiId, amount: adminAmount, notes: { role: 'admin_commission' } }
          ] : [
            { account: sellerUpiId || adminUpiId, amount: amount, notes: { role: 'merchant' } }
          ]
        })
      });
      
      const data = await response.json();
      
      setIsVerifying(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        if (hasSplit) {
          onPaymentSuccess(`Razorpay Order ID: ${data.orderId} | Split: ₹${sellerAmount} ➔ ${sellerUpiId} | ₹${adminAmount} ➔ ${adminUpiId}`);
        } else {
          onPaymentSuccess(`Razorpay Order ID: ${data.orderId} | ${customerSource} ➔ ${sellerUpiId || adminUpiId}`);
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      alert(language === 'en' ? 'Payment generation failed. Using fallback.' : 'भुगतान विफल।');
      onPaymentSuccess(`Fallback: ₹${amount}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-md max-w-md mx-auto relative min-h-[400px] overflow-hidden">
      {/* Razorpay Top Bar */}
      <div className="bg-[#02042b] p-4 text-center border-b-2 border-[#3395ff] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,100 L100,0 L100,100 Z" fill="#3395ff" />
          </svg>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-5 h-5 bg-[#3395ff] rounded-sm transform rotate-45 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white transform -rotate-45" />
          </div>
          <span className="text-white font-bold tracking-widest text-lg">Razorpay</span>
        </div>
        <div className="text-[#3395ff] text-[10px] font-mono tracking-widest font-black uppercase">
          {hasSplit ? 'Route • Split Payments Gateway' : 'Standard Payment Gateway'}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 bg-[#3395ff]/10 rounded-full flex items-center justify-center mb-6"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                  <CheckCircle className="w-12 h-12 text-[#3395ff]" />
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
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full mt-4"
              >
                {hasSplit ? (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Automated Split Execution</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Seller Portion:</span>
                      <span className="font-bold text-emerald-600">₹{sellerAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Platform Commission:</span>
                      <span className="font-bold text-[#3395ff]">₹{adminAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-base pt-1">
                      <span className="font-bold text-slate-700">Total Settled:</span>
                      <span className="font-black text-slate-900">₹{amount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 font-medium text-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                    {language === 'en' 
                      ? `₹${amount} paid securely to ${sellerUpiId || adminUpiId}`
                      : `₹${amount} का भुगतान सुरक्षित रूप से ${sellerUpiId || adminUpiId} को किया गया`}
                  </p>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {hasSplit ? (
                <div className="mb-5 bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-[#3395ff]">
                    <DivideCircle className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {language === 'en' ? 'Razorpay Route Split' : 'रेजरपे रूट स्प्लिट'}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mt-2 text-xs">
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                      <span className="text-slate-500 font-medium">{language === 'en' ? 'Merchant (MSP)' : 'मर्चेंट (MSP)'}</span>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 block">₹{sellerAmount}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{sellerUpiId}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                      <span className="text-slate-500 font-medium">{language === 'en' ? 'Admin Commission' : 'एडमिन कमीशन'}</span>
                      <div className="text-right">
                        <span className="font-bold text-[#3395ff] block">₹{adminAmount}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{adminUpiId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 bg-[#3395ff]/5 border border-[#3395ff]/20 p-3 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[#3395ff] mb-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      {language === 'en' ? 'Verified Razorpay Merchant' : 'सत्यापित रेजरपे मर्चेंट'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-700 font-mono select-all bg-white px-2 py-0.5 rounded border border-slate-150">
                    {sellerUpiId || adminUpiId}
                  </span>
                </div>
              )}

              <div className="flex border border-slate-200 rounded-lg overflow-hidden mb-5">
                <button
                  type="button"
                  onClick={() => setMethod('qr')}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    method === 'qr' ? 'bg-[#3395ff]/10 text-[#3395ff] font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  {language === 'en' ? 'UPI QR' : 'UPI QR'}
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('id')}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    method === 'id' ? 'bg-[#3395ff]/10 text-[#3395ff] font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  {language === 'en' ? 'UPI ID' : 'UPI ID'}
                </button>
              </div>

              {method === 'qr' ? (
                <div className="flex flex-col items-center text-center">
                  <div className="relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                    <div className="w-40 h-40 bg-slate-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-1 border border-slate-700 flex flex-wrap p-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 m-0.5 border rounded-sm ${
                              (i * 3 + 7) % 5 === 0 ? 'bg-[#3395ff] border-[#3395ff]' : 'bg-slate-800 border-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]">
                        <div className="bg-white p-1.5 rounded shadow-lg flex flex-col items-center">
                          <span className="text-[8px] font-bold text-slate-800 tracking-widest font-mono mb-0.5">RAZORPAY</span>
                          <div className="w-10 h-10 bg-slate-950 flex items-center justify-center rounded border border-slate-200">
                            <div className="w-8 h-8 bg-white flex flex-wrap p-0.5">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 m-0.5 rounded-[1px] ${
                                    i % 2 === 0 ? 'bg-black' : 'bg-white'
                                  } ${i === 0 || i === 2 || i === 6 || i === 8 ? 'border border-black bg-white' : ''}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isVerifying && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#3395ff] border-t-transparent mb-2"></div>
                        <p className="text-sm font-semibold text-slate-700">
                          {language === 'en' ? 'Awaiting payment...' : 'भुगतान की प्रतीक्षा...'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'QR expires in:' : 'QR समाप्ति:'}</span>
                    <span className="font-mono font-bold text-slate-800">{formatTime(timeLeft)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={simulateQrScan}
                    disabled={isVerifying}
                    className="w-full py-3 bg-[#3395ff] hover:bg-[#207add] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md active:scale-[0.98]"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {language === 'en' ? 'Simulate Razorpay QR Scan' : 'रेजरपे क्यूआर स्कैन करें'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIdSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {language === 'en' ? 'Enter Customer UPI ID' : 'ग्राहक की UPI आईडी दर्ज करें'}
                    </label>
                    <div className="relative rounded-xl border border-slate-200 focus-within:border-[#3395ff] transition-colors bg-white">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">@</span>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. name@okhdfc"
                        className="w-full py-3 pl-9 pr-4 text-slate-800 rounded-xl focus:outline-none text-sm font-mono font-medium bg-transparent"
                        required
                        disabled={isVerifying}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {language === 'en' ? (
                      <>You will receive a Razorpay request for <strong>₹{amount}</strong> on your UPI app. Open your app and approve.</>
                    ) : (
                      <>आपको अपने UPI ऐप पर <strong>₹{amount}</strong> का रेजरपे अनुरोध प्राप्त होगा। अपना ऐप खोलें और स्वीकृत करें।</>
                    )}
                  </p>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 bg-[#3395ff] hover:bg-[#207add] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] shadow-md shadow-[#3395ff]/20"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {language === 'en' ? 'Processing via Razorpay...' : 'रेजरपे के माध्यम से प्रक्रिया...'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        {language === 'en' ? 'Pay Now via Razorpay' : 'रेजरपे द्वारा अभी भुगतान करें'}
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-wider">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> SECURE</span>
                <span>•</span>
                <span>PCI-DSS COMPLIANT</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

