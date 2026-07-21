import React, { useRef } from 'react';
import { 
  Store, ShoppingBag, Utensils, Shirt, Train, Shield, 
  Bike, TrendingUp, Users, Heart, Coins, Phone, MapPin, 
  Download, FileText, Smartphone, Laptop
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface BusinessPitchDeckProps {
  onClose: () => void;
}

export default function BusinessPitchDeck({ onClose }: BusinessPitchDeckProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const element = contentRef.current;
    if (!element) return;

    const opt = {
      margin:       [10, 10, 10, 10] as [number, number, number, number],
      filename:     'Maudaha_Mart_Business_Plan.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-y-auto">
      {/* Top Header Controls */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 p-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl flex items-center gap-2">
          <FileText className="text-emerald-400" />
          Business Pitch Deck & Workflow
        </h1>
        <div className="flex items-center gap-3">
          <button type="button" 
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="max-w-4xl mx-auto my-8 bg-white" ref={contentRef}>
        <div className="p-10 space-y-12 text-slate-800 font-sans">
          
          {/* Cover Page */}
          <div className="text-center space-y-6 py-16 border-b border-slate-200">
            <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6">
              <Store className="h-12 w-12 text-emerald-600" />
            </div>
            <h1 className="text-5xl font-black text-slate-900">Maudaha Mart</h1>
            <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto">
              The All-in-One Hyperlocal E-commerce & Service Platform
            </p>
            <p className="text-lg text-slate-400">Business Workflow & Feature Documentation</p>
          </div>

          {/* Intro & Vision */}
          <section className="space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              Vision & Concept
            </h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Maudaha Mart is designed to digitize local businesses, bringing groceries, restaurants, fashion boutiques, and travel services under one unified roof. It empowers local merchants, provides flexible earning opportunities for delivery agents, and offers unprecedented convenience to customers.
            </p>
          </section>

          {/* Roles & Portals */}
          <section className="space-y-8 bg-slate-50 p-8 rounded-3xl">
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              5-Tier User Ecosystem
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="h-6 w-6 text-emerald-500" />
                  <h3 className="font-bold text-xl">1. Customer App</h3>
                </div>
                <p className="text-sm text-slate-600">Users browse shops, add to cart, earn loyalty coins, and track orders live. Includes multilingual support (Hindi/English).</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <Store className="h-6 w-6 text-amber-500" />
                  <h3 className="font-bold text-xl">2. Merchant Dashboard</h3>
                </div>
                <p className="text-sm text-slate-600">Shop owners manage inventory, update pricing, process incoming orders, and request payouts from admin.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <Bike className="h-6 w-6 text-rose-500" />
                  <h3 className="font-bold text-xl">3. Delivery Agent Portal</h3>
                </div>
                <p className="text-sm text-slate-600">Riders accept nearby orders, use GPS to navigate to stores and customers, and track their delivery earnings.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-purple-500" />
                  <h3 className="font-bold text-xl">4. Super Admin Panel</h3>
                </div>
                <p className="text-sm text-slate-600">Complete platform control. Can lock/unlock portals, manage users, approve payouts, and view AI trend reports.</p>
              </div>
            </div>
          </section>

          {/* Key Features & Modules */}
          <section className="space-y-8">
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Laptop className="h-8 w-8 text-indigo-500" />
              Core Modules & Workflows
            </h2>

            {/* Grocery */}
            <div className="border-l-4 border-emerald-500 pl-6 space-y-3">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="text-emerald-500" /> 
                Grocery & Essentials
              </h3>
              <p className="text-slate-600">A multi-vendor marketplace. Customers can filter by category, see instant AI search results, apply promo codes, and checkout via COD or UPI.</p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li><strong>Add to Cart Button:</strong> Accumulates items with a floating bag icon.</li>
                <li><strong>Checkout Button:</strong> Calculates delivery fees based on distance and applies loyalty coins.</li>
              </ul>
            </div>

            {/* Restaurant */}
            <div className="border-l-4 border-rose-500 pl-6 space-y-3">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Utensils className="text-rose-500" /> 
                Restaurant Corner
              </h3>
              <p className="text-slate-600">Dedicated food delivery UI. Handles minimum order values, custom restaurant delivery times, and direct UPI integration.</p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li><strong>Reorder Button:</strong> Instantly adds a previous meal back to the cart.</li>
                <li><strong>Live Status:</strong> "Cooking" ➔ "Ready" ➔ "Out for Delivery".</li>
              </ul>
            </div>

            {/* Fashion */}
            <div className="border-l-4 border-purple-500 pl-6 space-y-3">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Shirt className="text-purple-500" /> 
                Fashion & Boutiques
              </h3>
              <p className="text-slate-600">Supports size selection (S, M, L, XL) and optional "Custom Stitching" toggles.</p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li><strong>Size Selector:</strong> Enforces size choice before adding to cart.</li>
                <li><strong>Stitching Toggle:</strong> Dynamically adds tailoring fees to the grand total.</li>
              </ul>
            </div>
            
            {/* Travel */}
            <div className="border-l-4 border-blue-500 pl-6 space-y-3">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Train className="text-blue-500" /> 
                Travel Integrations
              </h3>
              <p className="text-slate-600">Real-time PNR status, live train tracking, and flight search capabilities within the same ecosystem.</p>
            </div>
          </section>

          {/* Revenue & Logistics */}
          <section className="space-y-6 bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100">
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Coins className="h-8 w-8 text-emerald-600" />
              Business Revenue & Workflows
            </h2>
            
            <div className="space-y-4 text-slate-700">
              <p><strong>1. Commission Model:</strong> The platform takes a percentage cut from Merchant sales. When an order is completed, the remaining amount is added to the Merchant's digital wallet.</p>
              <p><strong>2. Payout Requests:</strong> Merchants click the <strong>"Request Payout"</strong> button. Admin reviews it in the Admin Panel and clicks <strong>"Mark Paid"</strong> after transferring funds.</p>
              <p><strong>3. Delivery Fees:</strong> Customers pay a base fee + distance fee. The delivery agent earns a majority cut of this fee upon clicking <strong>"Delivered"</strong>.</p>
              <p><strong>4. Loyalty System:</strong> Customers earn "Maudaha Coins" on every purchase. They can check a box at checkout to redeem coins for discounts (100 coins = ₹10).</p>
            </div>
          </section>

          <div className="text-center pt-10 text-slate-400 text-sm">
            <p>Generated by Maudaha Mart System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
