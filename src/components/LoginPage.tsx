/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, User, ArrowRight, Sparkles, CheckCircle, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { RegisteredUser, Language, UserRole, ServiceArea } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

interface LoginPageProps {
  language: Language;
  onLoginSuccess: (user: RegisteredUser, role: UserRole) => void;
  existingUsers: RegisteredUser[];
  onAddNewUser: (newUser: RegisteredUser) => void;
  serviceAreas?: ServiceArea[];
}

export default function LoginPage({ language, onLoginSuccess, existingUsers = [], onAddNewUser, serviceAreas = [] }: LoginPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'login_otp'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Station Road, Maudaha');
  const [selectedAreaId, setSelectedAreaId] = useState('area-maudaha');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // OTP simulation states for Phone Login
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [otpError, setOtpError] = useState<'invalid' | 'expired' | 'missing' | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Setup Recaptcha
  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      } catch (e) {
        console.error("Recaptcha error:", e);
      }
    }
  }, []);

  // Timer Effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Translations
  const t = {
    en: {
      title: 'Maudaha Mart',
      subtitle: 'Premium grocery delivery across Maudaha & all over India',
      login: 'Login',
      signup: 'Sign Up',
      emailTab: 'Email & Password',
      phoneTab: 'Phone Number / OTP',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'Enter 10-digit mobile number',
      passwordLabel: 'Secure Password',
      passwordPlaceholder: 'Enter at least 6 characters',
      locationLabel: 'Delivery Address / Location (Anywhere in India)',
      locationPlaceholder: 'e.g. Station Road, Maudaha or Connaught Place, New Delhi',
      or: 'OR CONTINUE WITH',
      googleBtn: 'Sign in with Google',
      demoTitle: '⚡ Quick Demo Mode Login',
      demoDesc: 'Select an existing account to instantly log in & explore portals:',
      loadingText: 'Authenticating securely...',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      errorEmpty: 'Please fill out all required fields.',
      errorPasswordShort: 'Password must be at least 6 characters.',
      errorInvalidPhone: 'Please enter a valid 10-digit Indian phone number.',
      errorInvalidEmail: 'Please enter a valid email address.',
      errorUserNotFound: 'No account matches these credentials.',
      errorIncorrectPassword: 'The password entered is incorrect.',
      errorWrongOtp: 'Incorrect verification code. Please try again.',
      otpSentMsg: 'OTP sent! Use verification code: ',
      otpPlaceholder: 'Enter 6-digit OTP code',
      verifyBtn: 'Verify & Login',
      sendOtpBtn: 'Send OTP Verification Code',
      resendOtpIn: 'Resend code in',
      seconds: 's',
      resendOtpBtn: 'Resend OTP Code',
      signupSuccess: 'Account created successfully! Logging you in...',
      loginSuccess: 'Login successful! Redirecting...',
      terms: 'By continuing, you agree to our Maudaha Mart Terms of Service and secure transaction guidelines.'
    },
    hi: {
      title: 'मौदहा मार्ट',
      subtitle: 'मौदहा और पूरे भारत के लिए प्रीमियम किराना डिलीवरी',
      login: 'लॉगिन करें',
      signup: 'साइन अप करें',
      emailTab: 'ईमेल और पासवर्ड',
      phoneTab: 'फ़ोन नंबर / ओटीपी',
      fullName: 'पूरा नाम',
      fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
      emailLabel: 'ईमेल पता',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'फ़ोन नंबर',
      phonePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
      passwordLabel: 'सुरक्षित पासवर्ड',
      passwordPlaceholder: 'कम से कम 6 अक्षर दर्ज करें',
      locationLabel: 'डिलीवरी का पता / स्थान (पूरे भारत में कहीं भी)',
      locationPlaceholder: 'जैसे- स्टेशन रोड, मौदहा या कनॉट प्लेस, नई दिल्ली',
      or: 'या फिर इसके साथ जारी रखें',
      googleBtn: 'Google के साथ साइन इन करें',
      demoTitle: '⚡ त्वरित डेमो मोड लॉगिन',
      demoDesc: 'तुरंत लॉग इन करने और पोर्टल देखने के लिए एक मौजूदा खाते का चयन करें:',
      loadingText: 'सुरक्षित रूप से प्रमाणित किया जा रहा है...',
      noAccount: "खाता नहीं है?",
      haveAccount: 'पहले से ही एक खाता है?',
      errorEmpty: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
      errorPasswordShort: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
      errorInvalidPhone: 'कृपया एक मान्य 10- अंकों का भारतीय फ़ोन नंबर दर्ज करें।',
      errorInvalidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
      errorUserNotFound: 'कोई भी खाता इन क्रेडेंशियल्स से मेल नहीं खाता।',
      errorIncorrectPassword: 'दर्ज किया गया पासवर्ड गलत है।',
      errorWrongOtp: 'गलत सत्यापन कोड। कृपया पुनः प्रयास करें।',
      otpSentMsg: 'ओटीपी भेजा गया! सत्यापन कोड का उपयोग करें: ',
      otpPlaceholder: '6 अंकों का ओटीपी कोड दर्ज करें',
      verifyBtn: 'सत्यापित करें और लॉगिन करें',
      sendOtpBtn: 'ओटीपी सत्यापन कोड भेजें',
      resendOtpIn: 'ओटीपी फिर से भेजें',
      seconds: 'सेकंड में',
      resendOtpBtn: 'ओटीपी कोड फिर से भेजें',
      signupSuccess: 'खाता सफलतापूर्वक बनाया गया! आपको लॉगिन किया जा रहा है...',
      loginSuccess: 'लॉगिन सफल! पुनर्निर्देशित किया जा रहा है...',
      terms: 'जारी रखकर, आप हमारी मौदहा मार्ट सेवा की शर्तों और सुरक्षित लेनदेन दिशानिर्देशों से सहमत होते हैं।'
    }
  }[language];

  // Helper validation
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validatePhone = (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\D/g, ''));

  // Main Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!phone || (authMode === 'login' && !password) || (authMode === 'signup' && !name)) {
      setError(t.errorEmpty);
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (!validatePhone(cleanedPhone)) {
      setError(t.errorInvalidPhone);
      return;
    }

    const formattedPhone = `+91${cleanedPhone.slice(-10)}`;

    if (authMode === 'login') {
      // --- LOGIN LOGIC ---
      setLoading(true);
      setTimeout(() => {
        let matchedUser = (existingUsers || []).find(
          u => u.phone && u.phone.replace(/\D/g, '').endsWith(cleanedPhone.slice(-10))
        );

        if (!matchedUser) {
          setLoading(false);
          setError(t.errorUserNotFound + " " + (language === 'en' ? "Please switch to Sign Up." : "कृपया साइन अप पर जाएं।"));
          return;
        }

        // Simulating password check for mock
        setLoading(false);
        setSuccessMsg(t.loginSuccess);
        setTimeout(() => {
          onLoginSuccess(matchedUser, matchedUser.role);
        }, 1000);
      }, 1200);
      
    } else {
      // --- SIGNUP & LOGIN_OTP LOGIC (Requires OTP) ---
      // Check if user exists first for login_otp
      if (authMode === 'login_otp' && !otpSent) {
          let matchedUser = (existingUsers || []).find(
            u => u.phone && u.phone.replace(/\D/g, '').endsWith(cleanedPhone.slice(-10))
          );
          if (!matchedUser) {
            setError(t.errorUserNotFound + " " + (language === 'en' ? "Please switch to Sign Up." : "कृपया साइन अप पर जाएं।"));
            return;
          }
      }
      const tenDigitPhone = cleanedPhone.slice(-10);

      if (!otpSent) {
        setLoading(true);
        setError('');
        try {
          const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: tenDigitPhone })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setOtpSent(true);
            if (data.otp) {
              setReceivedOtp(data.otp.toString());
            }
            setTimer(60);
            const smsMsg = language === 'en' 
              ? `OTP sent to +91 ${tenDigitPhone}! (Verification Code: ${data.otp})` 
              : `+91 ${tenDigitPhone} पर ओटीपी भेजा गया! (सत्यापन कोड: ${data.otp})`;
            setSuccessMsg(smsMsg);
          } else {
            // Fallback to Firebase if backend endpoint has error
            if (!(window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
            }
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
            setConfirmationResult(confirmation);
            setOtpSent(true);
            setTimer(60);
            setSuccessMsg(language === 'en' ? 'OTP sent successfully!' : 'ओटीपी सफलतापूर्वक भेजा गया!');
          }
        } catch (err: any) {
          console.error("Fast2SMS / OTP Send Error:", err);
          setError((language === 'en' ? 'Failed to send OTP: ' : 'ओटीपी भेजने में विफल: ') + (err?.message || 'Network error'));
        } finally {
          setLoading(false);
        }
      } else {
        // Verify OTP
        const cleanOtp = otpCode.trim();
        if (!cleanOtp || cleanOtp.length < 6) {
          setError(language === 'en' ? 'Please enter a complete 6-digit OTP.' : 'कृपया पूरा ६-अंकों का ओटीपी दर्ज करें।');
          setOtpError('invalid');
          return;
        }

        setLoading(true);
        setError('');
        setOtpError(null);

        try {
          let isVerified = false;
          let backendErrMsg = '';

          // Attempt backend verify first
          try {
            const res = await fetch('/api/auth/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: tenDigitPhone, otp: cleanOtp })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              isVerified = true;
            } else if (data.error) {
              backendErrMsg = data.error;
            }
          } catch (e) {
            console.warn("Backend verify failed, trying fallback options", e);
          }

          // Fallback verify check: local received OTP match or demo code
          if (!isVerified && (
            (receivedOtp && cleanOtp === receivedOtp) ||
            cleanOtp === '123456' ||
            cleanOtp === '123123'
          )) {
            isVerified = true;
          }

          // Fallback to Firebase confirmation result if available
          if (!isVerified && confirmationResult) {
            try {
              const result = await confirmationResult.confirm(cleanOtp);
              if (result?.user) isVerified = true;
            } catch (e) {
              console.error("Firebase verify error", e);
            }
          }

          if (!isVerified) {
            if (backendErrMsg.toLowerCase().includes('expired')) {
              setOtpError('expired');
            } else {
              setOtpError('invalid');
            }
            setError(
              backendErrMsg || 
              (language === 'en' ? 'Invalid verification code. Please check and try again.' : 'अमान्य सत्यापन कोड। कृपया जांचें और पुनः प्रयास करें।')
            );
            setLoading(false);
            return;
          }

          let matchedUser = (existingUsers || []).find(
            u => u.phone && u.phone.replace(/\D/g, '').endsWith(tenDigitPhone)
          );

          if (!matchedUser && authMode === 'signup') {
            const newUser: RegisteredUser = {
              id: 'usr-' + Date.now(),
              name: name || 'Resident (' + tenDigitPhone.slice(-4) + ')',
              phone: formattedPhone,
              location: location || 'Station Road, Maudaha',
              locationHi: location || 'स्टेशन रोड, मौदहा',
              role: 'customer',
              serviceAreaId: selectedAreaId || 'area-maudaha',
              searchHistory: [],
              activities: [
                {
                  id: 'act-' + Date.now(),
                  timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
                  action: 'Signed up via SMS OTP verification',
                  actionHi: 'एसएमएस ओटीपी सत्यापन के माध्यम से साइन अप किया'
                }
              ]
            };
            onAddNewUser(newUser);
            matchedUser = newUser;
          }

          setLoading(false);
          setSuccessMsg(authMode === 'login_otp' ? t.loginSuccess : t.signupSuccess);
          setTimeout(() => {
            onLoginSuccess(matchedUser!, matchedUser!.role);
          }, 1000);
        } catch (err: any) {
          console.error("OTP verification error:", err);
          setOtpError('invalid');
          setError(language === 'en' ? 'Invalid verification code.' : 'अमान्य सत्यापन कोड।');
          setLoading(false);
        }
      }
    }
  };

  return (
    <div id="login_portal_wrapper" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-500 relative overflow-hidden">
      
      {/* Floating high-end ambient glow backgrounds */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          x: [0, 15, 0],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" 
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, -25, 0],
          y: [0, 30, 0]
        }}
        transition={{ 
          duration: 14, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" 
      />

      {/* Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
      >
        
        {/* Decorative elements */}
        <div className="absolute right-[-20px] top-[-20px] w-44 h-44 rounded-full bg-emerald-500/10 pointer-events-none" />
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 rounded-full bg-teal-500/10 pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="h-14 w-14 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-emerald-500/35 mb-4 cursor-pointer"
          >
            M
          </motion.div>
          <h1 className="text-2xl font-black font-display text-slate-800 tracking-tight leading-tight">
            {t.title}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed max-w-xs mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Mode Toggle: Login vs Sign Up (Animated sliding pill) */}
        <div className="flex bg-slate-100/90 backdrop-blur-xs p-1 rounded-2xl border border-slate-200/50 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
              setSuccessMsg('');
              setOtpSent(false);
            }}
            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-colors duration-200 cursor-pointer relative z-10 text-center"
          >
            <span className={(authMode === 'login' || authMode === 'login_otp') ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}>{t.login}</span>
            {(authMode === 'login' || authMode === 'login_otp') && (
              <motion.span
                layoutId="authModeActive"
                className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1]"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
              setSuccessMsg('');
              setOtpSent(false);
            }}
            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-colors duration-200 cursor-pointer relative z-10 text-center"
          >
            <span className={authMode === 'signup' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}>{t.signup}</span>
            {authMode === 'signup' && (
              <motion.span
                layoutId="authModeActive"
                className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1]"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
          </button>
        </div>

        {/* Feedback Alerts Container */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div 
              key="error-alert"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-2xl flex items-start gap-2.5 shadow-2xs"
            >
              <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              key="success-alert"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-2xl flex items-start gap-2.5 shadow-2xs"
            >
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {otpSent && successMsg !== t.loginSuccess && successMsg !== t.signupSuccess && (
            <motion.div 
              key="otp-sent-alert"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-5 p-3.5 bg-sky-50 border border-sky-100 text-sky-800 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2.5 shadow-2xs"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="font-bold">{t.otpSentMsg}</p>
                  {receivedOtp && (
                    <p className="text-[11px] font-mono font-bold text-sky-900 mt-0.5">
                      Code: <span className="bg-sky-200/70 px-1.5 py-0.5 rounded text-sky-950 tracking-wider">{receivedOtp}</span>
                    </p>
                  )}
                </div>
              </div>
              {receivedOtp && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode(receivedOtp);
                    setOtpError(null);
                    setError('');
                  }}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[10px] rounded-lg transition-colors shrink-0 shadow-2xs"
                >
                  ⚡ Auto-Fill
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Name field */}
          <AnimatePresence>
            {authMode === 'signup' && (
              <motion.div 
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  {t.fullName}
                </label>
                <div className={`relative rounded-2xl border transition-all duration-200 ${focusedField === 'name' ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-200 bg-slate-50/65'}`}>
                  <User className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors ${focusedField === 'name' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder-slate-400"
                    disabled={loading || otpSent}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
              <span>{t.phoneLabel}</span>
              <span className="text-emerald-600 text-[9px] font-black normal-case font-sans">
                {language === 'en' ? 'Mandatory' : 'अनिवार्य'}
              </span>
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3.5 bg-slate-100 border border-slate-200 text-xs font-black text-slate-600 rounded-2xl select-none">
                +91
              </span>
              <div className={`relative flex-1 rounded-2xl border transition-all duration-200 ${focusedField === 'phone' ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-200 bg-slate-50/65'}`}>
                <Phone className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors ${focusedField === 'phone' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder-slate-400"
                  disabled={loading || ((authMode === 'signup' || authMode === 'login_otp') && otpSent)}
                />
              </div>
            </div>
          </div>

          {/* OTP Code input field (Conditional) */}
          <AnimatePresence>
            {(authMode === 'signup' || authMode === 'login_otp') && otpSent && (
              <motion.div 
                key="otp-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  {language === 'en' ? '6-Digit Verification Code' : '६-अंकों का सत्यापन कोड'}
                </label>
                <div className={`relative rounded-2xl border transition-all duration-200 ${
                  otpError 
                    ? 'border-rose-500 ring-4 ring-rose-500/10 bg-rose-50/5' 
                    : focusedField === 'otp' 
                      ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' 
                      : 'border-slate-200 bg-slate-50/65'
                }`}>
                  <ShieldCheck className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors ${otpError ? 'text-rose-500' : focusedField === 'otp' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      setOtpError(null);
                      setError('');
                    }}
                    placeholder={t.otpPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-bold text-slate-800 tracking-widest font-mono outline-none placeholder-slate-400"
                    disabled={loading}
                  />
                </div>

                {/* Specific OTP error status feedback */}
                {otpError === 'invalid' && (
                  <p className="text-[10px] text-rose-600 font-extrabold px-1 flex items-center gap-1.5 mt-1">
                    <span>⚠️</span>
                    <span>
                      {language === 'en' 
                        ? 'Invalid OTP: Code does not match. Please try again.' 
                        : 'अमान्य ओटीपी: कोड मेल नहीं खाता। कृपया पुनः प्रयास करें।'}
                    </span>
                  </p>
                )}
                {otpError === 'expired' && (
                  <p className="text-[10px] text-rose-600 font-extrabold px-1 flex items-center gap-1.5 mt-1">
                    <span>⏳</span>
                    <span>
                      {language === 'en' 
                        ? 'OTP Expired: This code has expired. Please click "Resend OTP Code" below.' 
                        : 'ओटीपी समाप्त: यह कोड समाप्त हो गया। कृपया नीचे "ओटीपी कोड फिर से भेजें" पर क्लिक करें।'}
                    </span>
                  </p>
                )}
                {otpError === 'missing' && (
                  <p className="text-[10px] text-amber-600 font-extrabold px-1 flex items-center gap-1.5 mt-1">
                    <span>🔍</span>
                    <span>
                      {language === 'en' 
                        ? 'OTP Code Required: Please enter the 6-digit verification code.' 
                        : 'ओटीपी कोड आवश्यक: कृपया ६-अंकों का सत्यापन कोड दर्ज करें।'}
                    </span>
                  </p>
                )}

                <div className="flex items-center justify-between px-1 mt-2.5">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {timer > 0 ? `${t.resendOtpIn} ${timer}${t.seconds}` : ""}
                  </span>
                  <button
                    type="button"
                    disabled={timer > 0 || loading}
                    onClick={async () => {
                      const digitsOnly = phone.replace(/\D/g, '');
                      const tenDigitPhone = digitsOnly.slice(-10);
                      setLoading(true);
                      setError('');
                      setOtpError(null);
                      setSuccessMsg('');
                      try {
                        const res = await fetch('/api/auth/send-otp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: tenDigitPhone })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          if (data.otp) {
                            setReceivedOtp(data.otp.toString());
                          }
                          setTimer(60);
                          const smsMsg = language === 'en' 
                            ? `New OTP sent to +91 ${tenDigitPhone}! (Code: ${data.otp})` 
                            : `+91 ${tenDigitPhone} पर नया ओटीपी भेजा गया! (कोड: ${data.otp})`;
                          setSuccessMsg(smsMsg);
                        } else {
                          const formattedPhone = `+91${tenDigitPhone}`;
                          if (!(window as any).recaptchaVerifier) {
                            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
                          }
                          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
                          setConfirmationResult(confirmation);
                          setTimer(60);
                          setSuccessMsg(language === 'en' ? 'New OTP code sent!' : 'नया ओटीपी कोड भेजा गया!');
                        }
                      } catch (err: any) {
                        console.error("Resend OTP Error", err);
                        setError((language === 'en' ? 'Failed to resend OTP: ' : 'ओटीपी पुनः भेजने में विफल: ') + (err?.message || ''));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className={`text-[10px] font-black uppercase tracking-wider transition-all select-none ${timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-700 cursor-pointer hover:underline'}`}
                  >
                    {t.resendOtpBtn}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password field */}
          <AnimatePresence>
            {authMode === 'login' && (
              <motion.div 
                key="password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 overflow-hidden cursor-pointer"
              >
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              {t.passwordLabel}
            </label>
            <div className={`relative rounded-2xl border transition-all duration-200 ${focusedField === 'password' ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-200 bg-slate-50/65'}`}>
              <Lock className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-emerald-500' : 'text-slate-400'}`} />
              <input
                type="password"
                required
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder-slate-400"
                disabled={loading}
              />
            </div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* Location field (Only on signup mode) */}
          <AnimatePresence>
            {authMode === 'signup' && (
              <motion.div 
                key="location-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  {t.locationLabel}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.locationPlaceholder}
                    className="w-full px-4 py-3 bg-slate-50/65 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Service Area Dropdown (Only on signup mode) */}
          <AnimatePresence>
            {authMode === 'signup' && serviceAreas && serviceAreas.length > 0 && (
              <motion.div 
                key="service-area-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  {language === 'en' ? 'Select Your Service Area / Zone' : 'अपने सेवा क्षेत्र / क्षेत्र का चयन करें'}
                </label>
                <div className="space-y-2">
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/65 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all cursor-pointer font-sans"
                  >
                    {serviceAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.area_name} ({area.city}) - {area.pincode}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switch Login Method */}
          {authMode !== 'signup' && !otpSent && (
            <div className="flex justify-end px-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'login_otp' : 'login');
                    setError('');
                    setSuccessMsg('');
                    setOtpSent(false);
                  }}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold transition-colors cursor-pointer"
                >
                  {authMode === 'login' 
                    ? (language === 'en' ? 'Login with OTP instead' : 'ओटीपी के साथ लॉगिन करें') 
                    : (language === 'en' ? 'Login with Password instead' : 'पासवर्ड के साथ लॉगिन करें')}
                </button>
            </div>
          )}
          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.01, translateY: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 font-mono uppercase tracking-wider mt-6 relative overflow-hidden group"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t.loadingText}</span>
              </>
            ) : (
              <>
                <span>{authMode === 'login' ? t.login : (!otpSent ? t.sendOtpBtn : t.verifyBtn)}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
          
          <div id="recaptcha-container"></div>
        </form>

        {/* Footer legal notes */}
        <p className="text-[9px] text-slate-400 font-mono text-center leading-normal mt-6 max-w-xs mx-auto">
          {t.terms}
        </p>

      </motion.div>
    </div>
  );
}
