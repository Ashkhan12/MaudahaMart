/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, Lock, User, ArrowRight, Sparkles, CheckCircle, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { RegisteredUser, Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  language: Language;
  onLoginSuccess: (user: RegisteredUser, role: 'customer' | 'merchant' | 'admin' | 'rider' | 'manager') => void;
  existingUsers: RegisteredUser[];
  onAddNewUser: (newUser: RegisteredUser) => void;
}

export default function LoginPage({ language, onLoginSuccess, existingUsers = [], onAddNewUser }: LoginPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Station Road, Maudaha');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // OTP simulation states for Phone Login
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [otpError, setOtpError] = useState<'invalid' | 'expired' | 'missing' | null>(null);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      title: 'Maudaha Mart Auth Portal',
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
      errorWrongOtp: 'Incorrect verification code. Try "123456" for demo!',
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
      title: 'मौदहा मार्ट लॉगिन पोर्टल',
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
      errorWrongOtp: 'गलत सत्यापन कोड। डेमो के लिए "123456" आजमाएं!',
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (authMode === 'login') {
      // --- LOGIN LOGIC ---
      if (loginMethod === 'email') {
        if (!email || !password) {
          setError(t.errorEmpty);
          return;
        }
        if (!validateEmail(email)) {
          setError(t.errorInvalidEmail);
          return;
        }

        setLoading(true);
        setTimeout(() => {
          // Check if user exists by email (or fallback to checking name matches)
          const matchedUser = (existingUsers || []).find(
            u => u.email?.toLowerCase() === email.toLowerCase() || 
            ((u.name || '').toLowerCase().replace(/\s/g, '') === email.toLowerCase().split('@')[0])
          );

          if (!matchedUser) {
            // For convenience, if it is a new email, let's auto-create or ask to sign up
            setLoading(false);
            setError(t.errorUserNotFound + " " + (language === 'en' ? "Please switch to Sign Up." : "कृपया साइन अप पर जाएं।"));
            return;
          }

          setLoading(false);
          setSuccessMsg(t.loginSuccess);
          setTimeout(() => {
            onLoginSuccess(matchedUser, matchedUser.role);
          }, 1000);
        }, 1200);

      } else {
        // Phone login logic
        if (!phone) {
          setError(t.errorEmpty);
          return;
        }
        const cleanedPhone = phone.replace(/\D/g, '');
        if (!validatePhone(cleanedPhone)) {
          setError(t.errorInvalidPhone);
          return;
        }

        if (!otpSent) {
          // Send OTP via backend
          setLoading(true);
          fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: cleanedPhone })
          })
          .then(res => res.json())
          .then(data => {
            setLoading(false);
            if (data.error) {
              setError(data.error);
            } else {
              setSimulatedOtp(data.otp);
              setOtpSent(true);
              setTimer(30); // 30s cooldown
              setSuccessMsg(language === 'en' ? 'OTP sent successfully!' : 'ओटीपी सफलतापूर्वक भेजा गया!');
            }
          })
          .catch(err => {
            setLoading(false);
            setError(language === 'en' ? 'Failed to connect to SMS gateway.' : 'एसएमएस गेटवे से कनेक्ट होने में विफल।');
            console.error(err);
          });
        } else {
          // Verify OTP code via backend
          if (!otpCode) {
            setError(t.errorEmpty);
            setOtpError('missing');
            return;
          }
          if (otpCode.length < 6) {
            setError(language === 'en' ? 'Please enter a complete 6-digit OTP.' : 'कृपया पूरा ६-अंकों का ओटीपी दर्ज करें।');
            setOtpError('invalid');
            return;
          }
          setLoading(true);
          setOtpError(null);
          fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: cleanedPhone, otp: otpCode })
          })
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              setLoading(false);
              setError(data.error);
              if (data.error.toLowerCase().includes('expir')) {
                setOtpError('expired');
              } else if (data.error.toLowerCase().includes('incorrect') || data.error.toLowerCase().includes('invalid') || data.error.toLowerCase().includes('wrong')) {
                setOtpError('invalid');
              } else if (data.error.toLowerCase().includes('no otp') || data.error.toLowerCase().includes('request')) {
                setOtpError('missing');
              } else {
                setOtpError('invalid');
              }
            } else {
              setOtpError(null);
              // Proceed with logging in
              // Find user by phone
              let matchedUser = (existingUsers || []).find(
                u => u.phone && u.phone.replace(/\D/g, '').endsWith(cleanedPhone.slice(-10))
              );

              if (!matchedUser) {
                // If phone user is not found, let's auto-register them as a customer
                const newUser: RegisteredUser = {
                  id: 'user-' + Date.now(),
                  name: 'Resident (' + cleanedPhone.slice(-4) + ')',
                  phone: '+91 ' + cleanedPhone.slice(-10),
                  location: 'Station Road, Maudaha',
                  locationHi: 'स्टेशन रोड, मौदहा',
                  role: 'customer',
                  searchHistory: [],
                  activities: [
                    {
                      id: 'act-' + Date.now(),
                      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
                      action: 'Signed up via SMS Phone OTP authentication',
                      actionHi: 'एसएमएस फोन ओटीपी प्रमाणीकरण के माध्यम से साइन अप किया'
                    }
                  ]
                };
                onAddNewUser(newUser);
                matchedUser = newUser;
              }

              setLoading(false);
              setSuccessMsg(t.loginSuccess);
              setTimeout(() => {
                onLoginSuccess(matchedUser!, matchedUser!.role);
              }, 1000);
            }
          })
          .catch(err => {
            setLoading(false);
            setError(language === 'en' ? 'Failed to connect to verification server.' : 'सत्यापन सर्वर से कनेक्ट होने में विफल।');
            console.error(err);
          });
        }
      }

    } else {
      // --- SIGN UP LOGIC ---
      if (!name || !password || (loginMethod === 'email' ? !email : !phone)) {
        setError(t.errorEmpty);
        return;
      }
      if (password.length < 6) {
        setError(t.errorPasswordShort);
        return;
      }
      if (loginMethod === 'email' && !validateEmail(email)) {
        setError(t.errorInvalidEmail);
        return;
      }
      const cleanedPhone = phone.replace(/\D/g, '');
      if (loginMethod === 'phone' && !validatePhone(cleanedPhone)) {
        setError(t.errorInvalidPhone);
        return;
      }

      setLoading(true);
      setTimeout(() => {
        // Create new registered user
        const newUserId = 'user-' + Date.now();
        const newUser: RegisteredUser = {
          id: newUserId,
          name: name,
          phone: loginMethod === 'phone' ? `+91 ${cleanedPhone.slice(-10)}` : '+91 90000 00000',
          email: loginMethod === 'email' ? email : undefined,
          location: location,
          locationHi: location,
          role: 'customer', // Signups defaults to Customer
          searchHistory: [],
          activities: [
            {
              id: 'act-' + Date.now(),
              timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
              action: `Created new Maudaha Mart account`,
              actionHi: `नया मौदहा मार्ट खाता बनाया`
            }
          ]
        };

        onAddNewUser(newUser);
        setLoading(false);
        setSuccessMsg(t.signupSuccess);
        setTimeout(() => {
          onLoginSuccess(newUser, 'customer');
        }, 1200);
      }, 1500);
    }
  };

  // Google Sign-In Simulation
  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      // Pick a random local user profile style or make a fully unique customer account
      const randomGoogleUser: RegisteredUser = {
        id: 'user-google-' + Date.now(),
        name: 'Google User (' + (language === 'en' ? 'Maudaha Resident' : 'मौदहा निवासी') + ')',
        email: 'user.' + Math.floor(Math.random() * 1000) + '@gmail.com',
        phone: '+91 98765 43210',
        location: 'Galla Mandi Ward, Maudaha',
        locationHi: 'गल्ला मंडी वार्ड, मौदहा',
        role: 'customer',
        searchHistory: ['ghee', 'atta', 'fresh apples'],
        activities: [
          {
            id: 'act-' + Date.now(),
            timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
            action: 'Logged in with secure Google Single Sign-On',
            actionHi: 'सुरक्षित Google सिंगल साइन-ऑन के साथ लॉग इन किया'
          }
        ]
      };

      onAddNewUser(randomGoogleUser);
      setLoading(false);
      setSuccessMsg(t.loginSuccess);
      setTimeout(() => {
        onLoginSuccess(randomGoogleUser, 'customer');
      }, 1000);
    }, 1500);
  };

  // Predefined role demo quick login
  const handleDemoLogin = (user: RegisteredUser) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(user, user.role);
    }, 800);
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
            <span className={authMode === 'login' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}>{t.login}</span>
            {authMode === 'login' && (
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

        {/* Method Selector tabs (Animated sliding underline) */}
        <div className="flex border-b border-slate-100/90 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setError('');
              setOtpSent(false);
              setOtpError(null);
            }}
            className="flex-1 pb-3 text-xs font-bold transition-colors cursor-pointer relative text-center"
          >
            <span className={loginMethod === 'email' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}>
              {t.emailTab}
            </span>
            {loginMethod === 'email' && (
              <motion.div
                layoutId="loginMethodActive"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-600 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('phone');
              setError('');
              setOtpSent(false);
              setOtpError(null);
            }}
            className="flex-1 pb-3 text-xs font-bold transition-colors cursor-pointer relative text-center"
          >
            <span className={loginMethod === 'phone' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'}>
              {t.phoneTab}
            </span>
            {loginMethod === 'phone' && (
              <motion.div
                layoutId="loginMethodActive"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-600 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
          </button>
        </div>

        {/* Feedback Alerts Container */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div 
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-2xl flex items-start gap-2.5 shadow-2xs"
            >
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {otpSent && successMsg !== t.loginSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-5 p-3.5 bg-sky-50 border border-sky-100 text-sky-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5 shadow-2xs"
            >
              <Sparkles className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-bold">{t.otpSentMsg}</p>
                <p className="text-sm font-black tracking-widest text-sky-900 mt-1">{simulatedOtp}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Name field */}
          <AnimatePresence>
            {authMode === 'signup' && (
              <motion.div 
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
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email input field */}
          {loginMethod === 'email' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                {t.emailLabel}
              </label>
              <div className={`relative rounded-2xl border transition-all duration-200 ${focusedField === 'email' ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-200 bg-slate-50/65'}`}>
                <Mail className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder-slate-400"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Phone input field */}
          {loginMethod === 'phone' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                {t.phoneLabel}
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
                    disabled={loading || otpSent}
                  />
                </div>
              </div>
            </div>
          )}

          {/* OTP Code input field (Conditional) */}
          <AnimatePresence>
            {loginMethod === 'phone' && otpSent && (
              <motion.div 
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
                        ? 'Invalid OTP: Code does not match. Try again or use demo bypass "123456".' 
                        : 'अमान्य ओटीपी: कोड मेल नहीं खाता। फिर से प्रयास करें या डेमो बाईपास "123456" का उपयोग करें।'}
                    </span>
                  </p>
                )}
                {otpError === 'expired' && (
                  <p className="text-[10px] text-rose-600 font-extrabold px-1 flex items-center gap-1.5 mt-1">
                    <span>⏳</span>
                    <span>
                      {language === 'en' 
                        ? 'OTP Expired: This code has expired. Please click "Resend OTP Code" below.' 
                        : 'ओटीपी समाप्त: यह कोड समाप्त हो गया है। कृपया नीचे "ओटीपी कोड फिर से भेजें" पर क्लिक करें।'}
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
                    onClick={() => {
                      const cleanedPhone = phone.replace(/\D/g, '');
                      setLoading(true);
                      setError('');
                      setOtpError(null);
                      setSuccessMsg('');
                      fetch('/api/auth/send-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: cleanedPhone })
                      })
                      .then(res => res.json())
                      .then(data => {
                        setLoading(false);
                        if (data.error) {
                          setError(data.error);
                        } else {
                          setSimulatedOtp(data.otp);
                          setTimer(30);
                          setSuccessMsg(language === 'en' ? 'New OTP code sent!' : 'नया ओटीपी कोड भेजा गया!');
                        }
                      })
                      .catch(err => {
                        setLoading(false);
                        setError(language === 'en' ? 'Failed to connect to SMS gateway.' : 'एसएमएस गेटवे से कनेक्ट होने में विफल।');
                        console.error(err);
                      });
                    }}
                    className={`text-[10px] font-black uppercase tracking-wider transition-all select-none ${timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-700 cursor-pointer hover:underline'}`}
                  >
                    {t.resendOtpBtn}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password field (Only for Email tab or Sign Up phone tab) */}
          {(loginMethod === 'email' || authMode === 'signup') && (
            <div className="space-y-1.5">
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
            </div>
          )}

          {/* Location field (Only on signup mode) */}
          <AnimatePresence>
            {authMode === 'signup' && (
              <motion.div 
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
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[9px] text-slate-400 font-bold flex items-center pr-1">
                      {language === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocation(language === 'hi' ? 'गल्ला मंडी वार्ड, मौदहा' : 'Galla Mandi Ward, Maudaha')}
                      className="text-[9px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-full font-semibold transition"
                    >
                      📍 {language === 'hi' ? 'गल्ला मंडी' : 'Galla Mandi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation(language === 'hi' ? 'रहमानिया वार्ड, मौदहा' : 'Rahmaniya Ward, Maudaha')}
                      className="text-[9px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-full font-semibold transition"
                    >
                      📍 {language === 'hi' ? 'रहमानिया' : 'Rahmaniya'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation(language === 'hi' ? 'स्टेशन रोड, मौदहा' : 'Station Road, Maudaha')}
                      className="text-[9px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-full font-semibold transition"
                    >
                      📍 {language === 'hi' ? 'स्टेशन रोड' : 'Station Road'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation(language === 'hi' ? 'नया बाजार, मौदहा' : 'Naya Bazar, Maudaha')}
                      className="text-[9px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-full font-semibold transition"
                    >
                      📍 {language === 'hi' ? 'नया बाजार' : 'Naya Bazar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation(language === 'hi' ? 'कनॉट प्लेस, नई दिल्ली' : 'Connaught Place, New Delhi')}
                      className="text-[9px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-0.5 rounded-full font-semibold transition"
                    >
                      📍 {language === 'hi' ? 'नई दिल्ली (All India)' : 'New Delhi (All India)'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                <span>{authMode === 'login' ? (loginMethod === 'phone' && !otpSent ? t.sendOtpBtn : t.verifyBtn) : t.signup}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* OR Spacer */}
        <div className="relative my-6 select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono bg-white/95 px-3 mx-auto max-w-fit">
            {t.or}
          </div>
        </div>

        {/* Google Authentication Button */}
        <motion.button
          whileHover={{ scale: 1.01, translateY: -0.5 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-black text-slate-700 hover:text-slate-900 transition flex items-center justify-center gap-3 cursor-pointer shadow-2xs font-mono"
        >
          {/* Multi-colored Google G Icon */}
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.66 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.18 7.37 8.84 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.78c-.26-.78-.41-1.6-.41-2.46s.15-1.68.41-2.46L1.39 6.84C.5 8.65 0 10.74 0 12.92s.5 4.27 1.39 6.08l3.89-3.22z"
            />
            <path
              fill="#34A853"
              d="M12 22.96c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.03.69-2.35 1.1-4.23 1.1-3.16 0-5.82-2.33-6.77-5.54l-3.89 3.02c1.98 3.89 5.96 6.56 10.66 6.56z"
            />
          </svg>
          <span>{t.googleBtn}</span>
        </motion.button>

        {/* Demo Mode Quick Access Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-3.5">
            <span className="text-xs">⚡</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              {t.demoTitle}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mb-3 leading-normal">
            {t.demoDesc}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {(existingUsers || []).slice(0, 8).map((user, idx) => (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, translateY: -1, borderColor: 'rgba(16, 185, 129, 0.35)' }}
                whileTap={{ scale: 0.98 }}
                key={user.id}
                type="button"
                onClick={() => handleDemoLogin(user)}
                disabled={loading}
                className="p-3 bg-slate-50/75 hover:bg-white border border-slate-100/90 rounded-2xl text-left transition-all text-[10px] font-black flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-xs group/demo"
              >
                <span className="truncate block font-bold text-slate-800 group-hover/demo:text-emerald-700 transition-colors">{user.name}</span>
                <span className="text-[9px] text-emerald-600 font-extrabold uppercase mt-1.5 flex items-center gap-1">
                  {user.role === 'customer' && '🛒 Customer'}
                  {user.role === 'merchant' && '🏪 Merchant'}
                  {user.role === 'admin' && '🛡️ Admin'}
                  {user.role === 'rider' && '🚴 Delivery'}
                  {user.role === 'manager' && '👔 Manager'}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer legal notes */}
        <p className="text-[9px] text-slate-400 font-mono text-center leading-normal mt-6 max-w-xs mx-auto">
          {t.terms}
        </p>

      </motion.div>
    </div>
  );
}
