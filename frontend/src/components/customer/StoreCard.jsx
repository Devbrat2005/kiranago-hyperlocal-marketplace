import React from 'react';
import { Star, Clock, MapPin, Tag } from 'lucide-react';

export default function StoreCard({ store, onClick }) {
  const {
    name,
    image,
    logo,
    rating = 4.8,
    reviewsCount = 200,
    distance = 2.5,
    deliveryTime = '12-20 mins',
    deliveryFee = 15,
    minimumOrder = 99,
    isOpen = true,
    category = 'Kirana Store',
    discount,
    area
  } = store;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card shadow-card-hover cursor-pointer group flex flex-col justify-between"
    >
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Store Logo Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <img
            src={logo}
            alt={name}
            className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md bg-white"
          />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
              {category}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
            isOpen ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
          }`}>
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </span>
        </div>

        {/* Discount Overlay */}
        {discount && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow">
            <Tag className="w-3 h-3" /> {discount}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-900">{rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {area || 'Local Market'} ({distance} km)
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{deliveryTime}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Fee: {deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
            <span>•</span>
            <span className="text-slate-400">Min: ₹{minimumOrder}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
