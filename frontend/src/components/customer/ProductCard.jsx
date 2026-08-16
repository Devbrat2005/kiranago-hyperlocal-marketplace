import React from 'react';
import { Star, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, onClick }) {
  const { items, addToCart, updateQuantity } = useCart();

  if (!product) return null;

  const prodId = product._id || product.id;

  // Match cart item by productId, _id, or id safely
  const cartItem = items.find(i => String(i.productId || i._id || i.id) === String(prodId));
  const cartQty = cartItem ? cartItem.quantity : 0;

  const {
    name,
    brand = 'Brand',
    image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    weight = product.unit || '500 g',
    mrp = product.price || 100,
    sellingPrice = 90,
    discount,
    rating = 4.8,
    stock = 50,
    inStock = true,
    storeName
  } = product;

  const displayMrp = product.price || mrp || sellingPrice;
  const displaySelling = sellingPrice || displayMrp;
  const isOutOfStock = stock === 0 || inStock === false;

  // Safe discount text
  let discountBadge = null;
  if (discount) {
    discountBadge = typeof discount === 'number' ? `${discount}% OFF` : String(discount).includes('%') ? discount : `${discount}% OFF`;
  } else if (displayMrp > displaySelling) {
    const pct = Math.round(((displayMrp - displaySelling) / displayMrp) * 100);
    if (pct > 0) discountBadge = `${pct}% OFF`;
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card hover:shadow-lg flex flex-col justify-between p-3.5 relative group hover:border-emerald-200 transition-all">
      
      {/* Discount Badge */}
      {discountBadge && (
        <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg z-10 shadow-md">
          {discountBadge}
        </span>
      )}

      {/* Large Full-Size Product Image Container */}
      <div
        onClick={onClick}
        className="relative h-40 sm:h-48 w-full mb-3 cursor-pointer rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center p-2"
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
              <span className="text-[10px] text-emerald-700 font-extrabold truncate max-w-[100px]">
                {storeName}
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Stepper */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-heading font-extrabold text-slate-900">₹{displaySelling}</span>
              {displayMrp > displaySelling && (
                <span className="text-xs text-slate-400 line-through font-normal">₹{displayMrp}</span>
              )}
            </div>
          </div>

          {/* High-Visibility Add to Cart Button / Stepper */}
          {isOutOfStock ? (
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-1 rounded-xl">
              Out of Stock
            </span>
          ) : cartQty > 0 ? (
            <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={(e) => { e.stopPropagation(); updateQuantity(prodId, cartQty - 1); }}
                className="px-2 py-1.5 hover:bg-emerald-700 transition-colors active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="px-2 text-xs font-extrabold min-w-[20px] text-center">{cartQty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                className="px-2 py-1.5 hover:bg-emerald-700 transition-colors active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
              className="flex items-center justify-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer min-w-[70px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
