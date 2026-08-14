import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';

export default function WishlistPage({ onContinueShopping }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> My Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-1">Your favorite products and neighborhood stores</p>
      </div>

      <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Click the heart icon on any product or store to save items for fast reordering!</p>
        <button
          onClick={onContinueShopping}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Explore Products & Stores
        </button>
      </div>
    </div>
  );
}
