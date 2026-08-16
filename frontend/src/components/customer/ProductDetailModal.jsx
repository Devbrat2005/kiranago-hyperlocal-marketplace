import React from 'react';
import { X, Star, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { items, addToCart, updateQuantity } = useCart();

  if (!product) return null;

  const prodId = product._id || product.id;
  const cartItem = items.find(i => String(i.productId || i._id || i.id) === String(prodId));
  const cartQty = cartItem ? cartItem.quantity : 0;

  const {
    name,
    brand = 'Brand',
    image,
    weight = '500 g',
    price,
    mrp = 100,
    sellingPrice = 90,
    discount,
    rating = 4.8,
    reviewsCount = 24,
    description = 'High quality fresh grocery item sourced from trusted local Kirana merchants.',
    stock = 50,
    inStock = true,
    storeName = 'Kirana Partner'
  } = product;

  const displayMrp = price || mrp || sellingPrice;
  const displaySelling = sellingPrice || displayMrp;
  const isOutOfStock = stock === 0 || inStock === false;

  // Format discount string/number
  let discountText = '';
  if (discount) {
    discountText = typeof discount === 'number' ? `${discount}% OFF` : String(discount).includes('%') ? discount : `${discount}% OFF`;
  } else if (displayMrp > displaySelling) {
    const pct = Math.round(((displayMrp - displaySelling) / displayMrp) * 100);
    if (pct > 0) discountText = `${pct}% OFF`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative animate-scaleUp flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Area */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100">
          <img
            src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}
            alt={name}
            className="h-full w-full object-contain drop-shadow-md"
          />

          {discountText && (
            <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-md">
              {discountText}
            </span>
          )}
        </div>

        {/* Product Info Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {brand}
            </span>
            
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-slate-400 text-[10px]">({reviewsCount} reviews)</span>
            </div>
          </div>

          <h2 className="text-xl font-heading font-extrabold text-slate-900 leading-snug">
            {name}
          </h2>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100">
            <span>Net Quantity: <strong className="text-slate-800">{weight}</strong></span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <Store className="w-3.5 h-3.5" /> Sold by {storeName}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] font-bold text-emerald-800">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>15-Minute Express Delivery</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>100% Fresh & Authentic</span>
            </div>
          </div>

        </div>

        {/* Bottom Add to Cart CTA Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-extrabold text-slate-900">₹{displaySelling}</span>
              {displayMrp > displaySelling && (
                <span className="text-xs text-slate-400 line-through font-medium">₹{displayMrp}</span>
              )}
            </div>
          </div>

          {/* Stepper / ADD CTA Button */}
          {isOutOfStock ? (
            <span className="px-5 py-3 bg-rose-50 text-rose-600 font-extrabold text-xs rounded-2xl border border-rose-200">
              Currently Out of Stock
            </span>
          ) : cartQty > 0 ? (
            <div className="flex items-center bg-emerald-600 text-white rounded-2xl overflow-hidden shadow-lg shadow-emerald-600/20 p-1">
              <button
                onClick={() => updateQuantity(prodId, cartQty - 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-emerald-700 rounded-xl transition-colors active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>
              <span className="px-4 font-heading font-extrabold text-base">{cartQty}</span>
              <button
                onClick={() => addToCart(product, 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-emerald-700 rounded-xl transition-colors active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> ADD TO CART
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
