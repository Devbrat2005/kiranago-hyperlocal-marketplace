import React, { useState } from 'react';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { MapPin, Search, ShoppingBag, Bell, User, ChevronDown, Sparkles, Store, Truck, ShieldCheck, Heart } from 'lucide-react';

export default function Navbar({ onOpenAddressModal, onOpenSearch, activeTab, setActiveTab }) {
  const { user, logout, switchRole } = useAuth();
  const { currentLocation } = useLocation();
  const { totalItemCount } = useCart();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onOpenSearch) {
      onOpenSearch(searchQuery.trim());
    }
  };

  const roleColors = {
    CUSTOMER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    STORE_OWNER: 'bg-blue-100 text-blue-800 border-blue-300',
    DELIVERY_PARTNER: 'bg-orange-100 text-orange-800 border-orange-300',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <div onClick={() => setActiveTab('home')} className="cursor-pointer">
              <Logo size="medium" />
            </div>

            {/* Location Selector Pill */}
            <button
              onClick={onOpenAddressModal}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors text-left max-w-xs group"
            >
              <div className="bg-emerald-500 text-white p-1 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 leading-none">Delivering To</span>
                <span className="text-xs font-bold text-slate-700 truncate leading-tight mt-0.5">
                  {currentLocation ? `${currentLocation.area}, ${currentLocation.city}` : 'Select Location'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search 'Aashirvaad Atta', 'Amul Milk', 'Sharma Store'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => onOpenSearch && onOpenSearch(searchQuery)}
                className="w-full pl-10 pr-10 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Multi-Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${roleColors[user?.role || 'CUSTOMER']}`}
              >
                <span>{user?.role?.replace('_', ' ') || 'CUSTOMER'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Active Platform Role
                  </div>
                  <button
                    onClick={() => { switchRole('CUSTOMER'); setActiveTab('home'); setShowRoleMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-emerald-50 text-left ${user?.role === 'CUSTOMER' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
                  >
                    <User className="w-4 h-4 text-emerald-600" /> Customer App
                  </button>
                  <button
                    onClick={() => { switchRole('STORE_OWNER'); setActiveTab('store_dashboard'); setShowRoleMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-left ${user?.role === 'STORE_OWNER' ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    <Store className="w-4 h-4 text-blue-600" /> Store Owner Portal
                  </button>
                  <button
                    onClick={() => { switchRole('DELIVERY_PARTNER'); setActiveTab('delivery_dashboard'); setShowRoleMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-orange-50 text-left ${user?.role === 'DELIVERY_PARTNER' ? 'text-orange-700 font-bold bg-orange-50/50' : 'text-slate-700'}`}
                  >
                    <Truck className="w-4 h-4 text-orange-600" /> Delivery Partner App
                  </button>
                  <button
                    onClick={() => { switchRole('ADMIN'); setActiveTab('admin_dashboard'); setShowRoleMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-purple-50 text-left ${user?.role === 'ADMIN' ? 'text-purple-700 font-bold bg-purple-50/50' : 'text-slate-700'}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin Platform
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className="p-2 text-slate-600 hover:text-red-500 hover:bg-slate-100 rounded-xl transition-colors hidden md:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Orders */}
            <button
              onClick={() => setActiveTab('orders')}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold hidden sm:flex items-center gap-1"
            >
              Orders
            </button>

            {/* Cart Badge */}
            <button
              onClick={() => setActiveTab('cart')}
              className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Actions */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl object-cover border border-emerald-200 shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-heading font-extrabold shadow-sm">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 hidden md:inline-block max-w-[100px] truncate">
                    {user.name ? user.name.split(' ')[0] : 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                      {user.avatar && (
                        <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border" />
                      )}
                      <div className="flex-1 truncate">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{user.name || 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-emerald-600" /> My Profile & Addresses
                    </button>
                    <button
                      onClick={() => { setActiveTab('orders'); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-600" /> Order History
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  Register
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
