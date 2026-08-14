import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, CreditCard, QrCode, Wallet, Banknote, ShieldCheck, Tag, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';

export default function CheckoutPage({ onOrderPlaced, onBackToCart }) {
  const { storeGroups, grandMrpTotal, grandSubtotal, totalDeliveryFee, platformFee, taxes, grandTotal, clearCart } = useCart();
  const { currentLocation, savedAddresses } = useLocation();
  const { user } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState(currentLocation);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponCode, setCouponCode] = useState('WELCOME50');
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'WELCOME50', discountAmount: 50 });
  const [couponError, setCouponError] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Mock Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const finalTotal = Math.max(0, grandTotal - (appliedCoupon ? appliedCoupon.discountAmount : 0));

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartSubtotal: grandSubtotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
      } else {
        setCouponError(data.message);
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Invalid coupon');
    }
  };

  const handlePlaceOrderClick = () => {
    if (paymentMethod === 'COD') {
      executeOrderPlacement('COD');
    } else {
      setShowPaymentModal(true);
    }
  };

  const executeOrderPlacement = async (pm = paymentMethod) => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest_user',
          address: selectedAddress,
          paymentMethod: pm,
          couponCode: appliedCoupon ? appliedCoupon.code : '',
          discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
          deliveryInstructions
        })
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        setShowPaymentModal(false);
        if (onOrderPlaced) onOrderPlaced(data.orders[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      <button onClick={onBackToCart} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mb-6">
        Checkout & Payment
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Delivery Address Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
            <h3 className="text-base font-heading font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddress.area === addr.area
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{addr.type} ({addr.area})</span>
                    {selectedAddress.area === addr.area && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{addr.addressLine}, {addr.city}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Order Items Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
            <h3 className="text-base font-heading font-extrabold text-slate-900">Order Items</h3>
            {storeGroups.map((grp, gIdx) => (
              <div key={gIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-xs font-extrabold text-slate-800">{grp.storeName}</span>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  {grp.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-semibold text-slate-900">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 3. Delivery Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
            <h3 className="text-base font-heading font-extrabold text-slate-900 mb-2">Delivery Instructions</h3>
            <input
              type="text"
              placeholder="e.g. Leave package at security, don't ring bell, call upon arrival..."
              value={deliveryInstructions}
              onChange={e => setDeliveryInstructions(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 4. Payment Method Options */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
            <h3 className="text-base font-heading font-extrabold text-slate-900 mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'UPI' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <p className="text-xs font-bold">UPI / GPay / PhonePe</p>
                  <span className="text-[10px] text-slate-400">Instant QR & VPA</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'CARD' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <p className="text-xs font-bold">Credit / Debit Card</p>
                  <span className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <p className="text-xs font-bold">Cash on Delivery</p>
                  <span className="text-[10px] text-slate-400">Pay cash upon delivery</span>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Coupon & Final Price Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card sticky top-20">
            
            {/* Coupon Code Section */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Apply Promo Coupon</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. WELCOME50)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Code '{appliedCoupon.code}' applied! (-₹{appliedCoupon.discountAmount})
                </div>
              )}
              {couponError && (
                <p className="mt-2 text-xs font-bold text-rose-600">{couponError}</p>
              )}
            </div>

            {/* Price Summary */}
            <h3 className="text-base font-heading font-extrabold text-slate-900 mb-4">Payment Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold">₹{grandSubtotal}</span></div>
              <div className="flex justify-between text-slate-600"><span>Delivery Fee</span><span className="font-semibold">₹{totalDeliveryFee}</span></div>
              <div className="flex justify-between text-slate-600"><span>Platform Fee</span><span className="font-semibold">₹{platformFee}</span></div>
              <div className="flex justify-between text-slate-600"><span>Taxes</span><span className="font-semibold">₹{taxes}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold"><span>Coupon Discount</span><span>-₹{appliedCoupon.discountAmount}</span></div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
                <span className="text-xl font-heading font-extrabold text-emerald-700">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrderClick}
              disabled={isProcessingPayment}
              className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold rounded-2xl shadow-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? 'Processing Order...' : `Place Order (₹${finalTotal})`}
            </button>
          </div>
        </div>

      </div>

      {/* Safe Razorpay Mock Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-extrabold text-slate-900">Razorpay Secure Checkout</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Simulating online gateway processing for ₹{finalTotal}</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left mb-6 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Order ID:</span><span className="font-mono font-bold">KG_RZP_{Date.now().toString().slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Payment Mode:</span><span className="font-bold text-slate-800">{paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Amount:</span><span className="font-extrabold text-emerald-700">₹{finalTotal}</span></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => executeOrderPlacement(paymentMethod)}
                disabled={isProcessingPayment}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                {isProcessingPayment ? 'Authorizing...' : 'Simulate Success Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
