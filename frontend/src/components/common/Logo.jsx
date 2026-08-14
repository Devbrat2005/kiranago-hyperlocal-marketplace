import React from 'react';

export default function Logo({ size = 'medium', showTagline = false, className = '' }) {
  const sizeMap = {
    small: { icon: 'w-7 h-7', text: 'text-xl', tagline: 'text-[9px]' },
    medium: { icon: 'w-9 h-9', text: 'text-2xl', tagline: 'text-[10px]' },
    large: { icon: 'w-12 h-12', text: 'text-3xl', tagline: 'text-xs' }
  };

  const { icon, text, tagline } = sizeMap[size] || sizeMap.medium;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2 select-none group cursor-pointer">
        <div className={`relative ${icon} bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-1.5 shadow-md flex items-center justify-center text-white transform group-hover:scale-105 transition-transform`}>
          {/* Kirana Shopping Basket & Fast Delivery Flash Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {/* Lightning Fast Delivery Badge */}
          <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5 border-2 border-white shadow">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <span className={`font-heading font-extrabold tracking-tight ${text} leading-none`}>
            <span className="text-emerald-700">Kirana</span>
            <span className="text-orange-500">Go</span>
          </span>
        </div>
      </div>

      {showTagline && (
        <span className={`text-slate-500 font-medium tracking-wide mt-1 ${tagline}`}>
          Your Local Store, Delivered Fast.
        </span>
      )}
    </div>
  );
}
