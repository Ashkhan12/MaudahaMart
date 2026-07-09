head -n 827 src/components/RestaurantCorner.tsx > temp.tsx
cat << 'INNEREOF' >> temp.tsx
                {/* Coupons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'en' ? 'Apply Food Coupon' : 'कूपन कोड लागू करें'}
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. FOOD30"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono uppercase font-bold focus:outline-none focus:border-rose-300"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'en' ? 'Apply' : 'लागू'}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 pl-1 leading-normal">
                    💡 {language === 'en' ? 'Apply FOOD30 (30% off on orders > ₹150) or DESITASTE for instant ₹40 off.' : 'FOOD30 (न्यूनतम ₹150 पर 30% छूट) या DESITASTE लागू करें।'}
                  </p>
                </div>

                {/* Subtotal breakdowns */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Items Subtotal' : 'सामग्री का मूल्य'}</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Maudaha Delivery Boy fee' : 'मौदहा डिलीवरी बॉय शुल्क'}</span>
                    <span className="font-mono">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{language === 'en' ? 'Coupon Discount' : 'कूपन छूट'}</span>
                      <span className="font-mono">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-50 text-slate-800 font-black text-sm">
                    <span>{language === 'en' ? 'Total Bill' : 'कुल बिल'}</span>
                    <span className="font-mono text-rose-600 text-base">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Payment selectors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'en' ? 'Payment Method' : 'भुगतान का प्रकार'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('COD')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                        paymentMethod === 'COD'
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      💵 {language === 'en' ? 'Cash on Delivery' : 'कैश ऑन डिलीवरी'}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('UPI')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                        paymentMethod === 'UPI'
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📱 {language === 'en' ? 'Instant UPI' : 'त्वरित UPI'}
                    </button>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleCheckoutBtn}
                  disabled={subtotal < currentRestaurant.minOrder}
                  className={`w-full max-w-[200px] mx-auto py-2 text-center text-white text-[10px] font-extrabold rounded-lg transition cursor-pointer shadow-sm ${
                    subtotal >= currentRestaurant.minOrder
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-600/20'
                      : 'bg-slate-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  {language === 'en' 
                    ? `ORDER • ₹${grandTotal}` 
                    : `ऑर्डर • ₹${grandTotal}`}
                </button>

                {subtotal < currentRestaurant.minOrder && (
                  <p className="text-[10px] text-amber-600 text-center font-bold">
                    ⚠️ {language === 'en' ? `Add ₹${currentRestaurant.minOrder - subtotal} more for minimum order!` : `न्यूनतम ऑर्डर के लिए ₹${currentRestaurant.minOrder - subtotal} और सामग्री जोड़ें!`}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Razorpay UPI Checkout Modal */}
      {showUpiCheckout && currentRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUpiCheckout(false)} />
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100 z-50">
            <button
              onClick={() => setShowUpiCheckout(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-extrabold font-mono text-base transition-colors duration-150 z-50"
            >
              ✕
            </button>
            <div className="p-1">
              <div className="bg-[#3395ff] text-white p-5 text-center rounded-t-2xl">
                <span className="text-[10px] font-black tracking-widest font-mono uppercase opacity-85">Maudaha Mart UPI Gateway</span>
                <p className="text-2xl font-black mt-1">₹{grandTotal}</p>
              </div>
              <div className="p-5">
                <UPIPayment
                  amount={grandTotal}
                  sellerAmount={Math.round(activeRestaurantCart.reduce((sum, item) => sum + (item.item.price * 0.9) * item.quantity, 0))}
                  adminAmount={Math.max(0, grandTotal - Math.round(activeRestaurantCart.reduce((sum, item) => sum + (item.item.price * 0.9) * item.quantity, 0)))}
                  sellerUpiId={currentRestaurant.upiId || 'merchant@ybl'}
                  adminUpiId="dingdang7081@okhdfcbank"
                  onPaymentSuccess={(confirmedUpiId) => {
                    executePlaceOrder(confirmedUpiId);
                  }}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
INNEREOF
mv temp.tsx src/components/RestaurantCorner.tsx
