import React from 'react';
import { Home, Store, Grid, ShoppingBag, Clock, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { totalItemCount } = useCart();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: totalItemCount },
    { id: 'orders', label: 'Orders', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-600' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
