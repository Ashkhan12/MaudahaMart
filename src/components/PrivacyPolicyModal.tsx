/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

export default function PrivacyPolicyModal({ isOpen, onClose, language }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {language === 'en' ? 'Maudaha Mart Privacy Policy' : 'मौदहा मार्ट प्राइवेसी पॉलिसी'}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                {language === 'en' ? 'Last Updated: July 2026' : 'अंतिम अपडेट: जुलाई २०२६'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-600 text-xs leading-relaxed font-medium">
          
          {language === 'en' ? (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">1. Commitment to Privacy</h3>
                <p>
                  Maudaha Mart ("we", "us", or "our") is dedicated to protecting your privacy. This Privacy Policy details how we collect, use, and safe-keep your information when you access our hyper-local, instant-delivery grocery platform in Maudaha.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">2. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Data:</strong> Name, phone number, and selected store preferences to customize your order flow.</li>
                  <li><strong>Geographic Location:</strong> Live location coordinates (latitude and longitude) to simulate and track active delivery agents as they traverse Galla Mandi, Station Road, and surrounding Maudaha areas or partner cities in India.</li>
                  <li><strong>Order & Transaction Records:</strong> Purchased items, final totals, discount codes, coin balances, and digital UPI verification screenshots/payment methods.</li>
                  <li><strong>Delivery Proof:</strong> Photos uploaded by delivery boys to verify order quality and correctness.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">3. How We Use Your Data</h3>
                <p>
                  Your data is used strictly to fulfill orders, process UPI or COD payments, credit loyalty points, route delivery boys to your exact location, and enable administrators to respond to customer helpdesk support tickets. We do not sell or trade your personal information with third-party brokers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">4. Device Permissions</h3>
                <p>
                  To provide a seamless experience, our applet requests permission to access your device's geographical location for real-time tracking, and camera/files for uploading product verification photos (applicable to delivery boys).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">5. Secure Transactions</h3>
                <p>
                  All UPI QR payments generated in this application conform to National Payments Corporation of India (NPCI) guidelines. Transaction reference screenshots remain locked securely inside our administrators' portal for dispute resolution.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">6. Contact & Support</h3>
                <p>
                  For physical inquiries or data deletion requests, you may contact our operations team at the physical helpdesk counter: <strong>Galla Mandi Chauraha, Maudaha, Uttar Pradesh, India</strong>.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">१. गोपनीयता के प्रति प्रतिबद्धता</h3>
                <p>
                  मौदहा मार्ट ("हम", "हमारी", या "हमारा") आपकी गोपनीयता की रक्षा करने के लिए पूरी तरह से समर्पित है। यह प्राइवेसी पॉलिसी विस्तार से बताती है कि जब आप मौदहा में हमारे हाइपर-लोकल, त्वरित-डिलिवरी किराना प्लेटफॉर्म का उपयोग करते हैं तो हम आपकी जानकारी का संग्रह, उपयोग और सुरक्षा कैसे करते हैं।
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">२. जानकारी जो हम एकत्र करते हैं</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>खाता डेटा:</strong> आपके ऑर्डर प्रवाह को अनुकूलित करने के लिए आपका नाम, फ़ोन नंबर और चुनी गई स्टोर प्राथमिकताएं।</li>
                  <li><strong>भौगोलिक स्थान (लोकेशन):</strong> गल्ला मंडी, भटीपुरा स्टेशन रोड और आसपास के मौदहा क्षेत्रों में सक्रिय डिलीवरी बॉय की स्थिति को ट्रैक करने के लिए आपका वास्तविक लाइव लोकेशन।</li>
                  <li><strong>ऑर्डर और लेनदेन रिकॉर्ड:</strong> खरीदे गए सामान, अंतिम कुल राशि, छूट कूपन कोड, कॉइन्स बैलेंस और डिजिटल यूपीआई सत्यापन स्क्रीनशॉट।</li>
                  <li><strong>डिलिवरी प्रमाण:</strong> ऑर्डर की शुद्धता और गुणवत्ता को सत्यापित करने के लिए डिलीवरी बॉय द्वारा अपलोड की गई तस्वीरें।</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">३. हम आपके डेटा का उपयोग कैसे करते हैं</h3>
                <p>
                  आपके डेटा का उपयोग विशेष रूप से ऑर्डर्स को पूरा करने, यूपीआई या कैश ऑन डिलीवरी भुगतानों को संसाधित करने, वफादारी सिक्कों (Loyalty Coins) को क्रेडिट करने, डिलीवरी बॉय को आपके सटीक पते पर निर्देशित करने और प्रशासकों को आपकी सहायता क्वेरी का जवाब देने के लिए किया जाता है। हम आपका व्यक्तिगत डेटा किसी को बेचते या साझा नहीं करते हैं।
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">४. डिवाइस अनुमतियां</h3>
                <p>
                  एक बेहतर अनुभव प्रदान करने के लिए, हमारा ऐप रियल-टाइम ट्रैकिंग के लिए आपके डिवाइस के भौगोलिक स्थान तक पहुंच और उत्पाद सत्यापन तस्वीरें अपलोड करने के लिए कैमरा/फ़ाइल अनुमतियों का अनुरोध करता है।
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">५. सुरक्षित लेनदेन</h3>
                <p>
                  इस एप्लिकेशन में उत्पन्न सभी यूपीआई क्यूआर भुगतान भारतीय राष्ट्रीय भुगतान निगम (NPCI) के दिशानिर्देशों के अनुरूप हैं। विवाद समाधान के लिए लेनदेन के स्क्रीनशॉट हमारे व्यवस्थापक पोर्टल के भीतर सुरक्षित रहते हैं।
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">६. संपर्क और सहायता</h3>
                <p>
                  भौतिक पूछताछ या डेटा हटाने के अनुरोधों के लिए, आप हमारे भौतिक सहायता डेस्क काउंटर पर हमारी परिचालन टीम से संपर्क कर सकते हैं: <strong>गल्ला मंडी चौराहा, मौदहा, उत्तर प्रदेश, भारत</strong>।
                </p>
              </section>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-2xl transition"
          >
            {language === 'en' ? 'Close' : 'बंद करें'}
          </button>
        </div>

      </div>
    </div>
  );
}
