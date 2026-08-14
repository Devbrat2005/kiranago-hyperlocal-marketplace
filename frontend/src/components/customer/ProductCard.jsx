import React from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, onClick }) {
  const { items, addToCart, updateQuantity } = useCart();
  const prodId = product._id || product.id;

  const cartItem = items.find(i => (i._id || i.id) === prodId);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const {
    name,
    brand = 'Brand',
    image,
    weight = '500 g',
    mrp = 100,
    sellingPrice = 90,
    discount = 10,
    rating = 4.8,
    stock = 50,
    storeName
  } = product;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card shadow-card-hover flex flex-col justify-between p-3.5 relative group hover:border-emerald-200 transition-all">
      
      {/* Discount Badge */}
      {discount > 0 && (
        <span className="absolute top-5 left-5 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg z-10 shadow-md backdrop-blur-md">
          {discount}% OFF
        </span>
      )}

      {/* Large Full-Size Product Image Container */}
      <div onClick={onClick} className="relative h-40 sm:h-48 w-full mb-3 cursor-pointer rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Info Container */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-400">
            <span className="truncate font-bold tracking-wider uppercase">{brand}</span>
            {rating && (
              <span className="flex items-center gap-0.5 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
              </span>
            )}
          </div>

          <h4
            onClick={onClick}
            className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 mt-1 hover:text-emerald-700 transition-colors cursor-pointer leading-tight"
          >
            {name}
          </h4>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] font-bold text-slate-500">
              {weight}
            </span>
            {storeName && (
              <span className="text-[10px] text-emerald-700 font-extrabold truncate">
                {storeName}
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Stepper */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-heading font-extrabold text-slate-900">₹{sellingPrice}</span>
              {mrp > sellingPrice && (
                <span className="text-xs text-slate-400 line-through font-normal">₹{mrp}</span>
              )}
            </div>
          </div>

          {/* Stepper / Add Button */}
          {stock < 1 ? (
            <span className="text-[11px] font-extrabold text-rose-500 bg-rose-50 px-2 py-1 rounded-xl">
              Out of Stock
            </span>
          ) : cartQty > 0 ? (
            <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={(e) => { e.stopPropagation(); updateQuantity(prodId, cartQty - 1); }}
                className="px-2 py-1 hover:bg-emerald-700 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-extrabold">{cartQty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                className="px-2 py-1 hover:bg-emerald-700 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
