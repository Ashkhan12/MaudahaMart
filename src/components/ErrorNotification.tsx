/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, WifiOff, RefreshCw, X, RotateCcw } from 'lucide-react';
import { Language } from '../types';

export type OtpErrorType = 'invalid' | 'expired' | 'missing' | 'gateway_offline' | 'network' | null;

interface ErrorNotificationProps {
  error: string;
  errorType?: OtpErrorType;
  language?: Language;
  onDismiss: () => void;
  onRetry?: () => void;
  onResend?: () => void;
}

export function ErrorNotification({
  error,
  errorType = null,
  language = 'en',
  onDismiss,
  onRetry,
  onResend
}: ErrorNotificationProps) {
  if (!error) return null;

  const isHindi = language === 'hi';

  const isGatewayOffline = errorType === 'gateway_offline' || 
                           errorType === 'network' || 
                           error.toLowerCase().includes('gateway') || 
                           error.toLowerCase().includes('offline') || 
                           error.toLowerCase().includes('network') ||
                           error.toLowerCase().includes('fetch');

  const isExpired = errorType === 'expired' || error.toLowerCase().includes('expired');
  const isInvalid = errorType === 'invalid' || error.toLowerCase().includes('invalid') || error.toLowerCase().includes('incorrect');

  // Title / Badge Text
  const getBadgeTitle = () => {
    if (isGatewayOffline) {
      return isHindi ? 'एपीआई गेटवे ऑफलाइन' : 'API Gateway Offline';
    }
    if (isExpired) {
      return isHindi ? 'ओटीपी एक्सपायर हो गया' : 'OTP Code Expired';
    }
    if (isInvalid) {
      return isHindi ? 'अमान्य ओटीपी कोड' : 'Invalid OTP Code';
    }
    return isHindi ? 'प्रमाणीकरण विफल' : 'Verification Error';
  };

  // Descriptive Tip
  const getHelpTip = () => {
    if (isGatewayOffline) {
      return isHindi
        ? 'सर्वर से संपर्क करने में असमर्थ। कृपया अपना इंटरनेट कनेक्शन जांचें या ऑटो-फिल/रीसेंड का उपयोग करें।'
        : 'Unable to reach SMS auth server. Check network connection or try local auto-fill code.';
    }
    if (isExpired) {
      return isHindi
        ? 'यह सुरक्षा कोड पुराना हो चुका है। नया कोड प्राप्त करने के लिए "रीसेंड ओटीपी" पर क्लिक करें।'
        : 'This verification code has expired. Request a new 6-digit SMS code below.';
    }
    if (isInvalid) {
      return isHindi
        ? 'कृपया अपने मोबाइल पर प्राप्त ६-अंकों का ओटीपी सही से दर्ज करें।'
        : 'Ensure you typed the exact 6-digit verification code received on your phone.';
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`mb-5 p-4 rounded-2xl border text-xs shadow-md backdrop-blur-md relative transition-all ${
        isGatewayOffline
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${
          isGatewayOffline ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {isGatewayOffline ? (
            <WifiOff className="h-5 w-5 animate-pulse" />
          ) : isExpired ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        {/* Text Body */}
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isGatewayOffline 
                ? 'bg-amber-200/80 text-amber-900 border border-amber-300' 
                : 'bg-rose-200/80 text-rose-900 border border-rose-300'
            }`}>
              {getBadgeTitle()}
            </span>
          </div>

          <p className="font-bold text-xs leading-relaxed text-slate-800 dark:text-slate-100">
            {error}
          </p>

          {getHelpTip() && (
            <p className="mt-1 text-[11px] font-medium opacity-85 text-slate-600 dark:text-slate-300">
              💡 {getHelpTip()}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-xs cursor-pointer ${
                  isGatewayOffline
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isHindi ? 'पुनः प्रयास करें' : 'Retry Verification'}</span>
              </button>
            )}

            {onResend && (
              <button
                type="button"
                onClick={onResend}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isHindi ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Close / Dismiss button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
          title={isHindi ? 'बंद करें' : 'Dismiss notification'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default ErrorNotification;
