import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store, ShieldCheck, Tag } from 'lucide-react';

export default function CartPage({ onProceedToCheckout, onContinueShopping }) {
  const {
    items,
    storeGroups,
    updateQuantity,
    removeFromCart,
    clearCart,
    grandMrpTotal,
    grandSubtotal,
    totalDeliveryFee,
    platformFee,
    taxes,
    totalSavings,
    grandTotal
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          Explore nearby Kirana stores and add fresh grocery products to your cart!
        </p>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
        >
          Explore Local Stores
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-emerald-600" /> Shopping Cart ({items.reduce((a, b) => a + b.quantity, 0)} Items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Multi-Store Cart grouped automatically by neighborhood merchant</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Grouped Store Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {storeGroups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
              
              {/* Store Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-slate-900">{group.storeName}</h3>
                    <span className="text-[10px] text-slate-400">Order from this store</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">₹{group.storeSubtotal}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {group.items.map((item) => {
                  const pId = item._id || item.id;
                  return (
                    <div key={pId} className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-slate-100 p-1 border border-slate-100 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">{item.weight}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-extrabold text-slate-900">₹{item.sellingPrice}</span>
                            {item.mrp > item.sellingPrice && (
                              <span className="text-[10px] text-slate-400 line-through">₹{item.mrp}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 text-slate-800 rounded-xl overflow-hidden border border-slate-200">
                          <button onClick={() => updateQuantity(pId, item.quantity - 1)} className="px-2 py-1 hover:bg-slate-200">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(pId, item.quantity + 1)} className="px-2 py-1 hover:bg-slate-200">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(pId)} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Price Summary & Checkout Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card sticky top-20">
            <h3 className="text-base font-heading font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Bill Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Item Total (MRP)</span>
                <span className="font-semibold">₹{grandMrpTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Product Discount Savings</span>
                <span>-₹{totalSavings}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold">₹{totalDeliveryFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Fee</span>
                <span className="font-semibold">₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & GST (5%)</span>
                <span className="font-semibold">₹{taxes}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">To Pay</span>
                <span className="text-lg font-heading font-extrabold text-emerald-700">₹{grandTotal}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You save ₹{totalSavings} on this order! Guaranteed 15-min delivery.</span>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 text-sm transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
