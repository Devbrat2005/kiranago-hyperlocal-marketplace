import React, { useState, useEffect } from 'react';
import { Zap, Tag, ChevronRight } from 'lucide-react';

export default function HeroBanner({ onSelectCategory, onApplyCoupon }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: 'Fresh Groceries Delivered in 15 Minutes',
      subtitle: 'From your favorite neighborhood Kirana store right to your doorstep',
      code: 'WELCOME50',
      badge: 'FLAT ₹50 OFF',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: '100% Pure Atta, Ghee & Spices Wholesale Rates',
      subtitle: 'Support local merchants & save big on daily household essentials',
      code: 'FREEDELIVERY',
      badge: 'FREE DELIVERY',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Fresh Farm Fruits & Organic Veggies Daily',
      subtitle: 'Handpicked early morning from trusted local mandi suppliers',
      code: 'KIRANA15',
      badge: '15% EXTRA DISCOUNT',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1600&auto=format&fit=crop&q=80'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = banners[currentSlide];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl text-white mb-8 border border-slate-200/20 min-h-[260px] sm:min-h-[320px] flex items-center">
      {/* Full-width background image covering section edge-to-edge */}
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out scale-105"
      />

      {/* Dark green gradient overlay on the left for text contrast across all devices */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 md:via-emerald-900/80 to-transparent"></div>
      <div className="absolute inset-0 bg-black/25"></div>

      {/* Banner Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl space-y-3.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 text-xs font-extrabold text-amber-300 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>{slide.badge}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold leading-tight text-white drop-shadow-md">
          {slide.title}
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-slate-200 font-medium max-w-xl leading-relaxed drop-shadow">
          {slide.subtitle}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSelectCategory && onSelectCategory('Grocery')}
            className="px-6 py-3 bg-white text-emerald-950 font-extrabold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg text-xs sm:text-sm flex items-center gap-2 active:scale-95 hover:scale-105"
          >
            Order Now <ChevronRight className="w-4 h-4 text-emerald-700" />
          </button>

          <div className="flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/40 text-amber-300 shadow-md">
            <Tag className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-mono font-extrabold tracking-wider">{slide.code}</span>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === i ? 'w-8 bg-white shadow' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

