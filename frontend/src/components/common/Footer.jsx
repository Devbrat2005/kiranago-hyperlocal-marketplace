import React from 'react';
import Logo from './Logo';
import { Store, Truck, ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          
          {/* Col 1: Logo & Tagline */}
          <div className="space-y-3">
            <Logo size="medium" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              KiranaGo empowers Indian Kirana stores and local merchants by connecting them with nearby customers for lightning-fast grocery delivery.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-white mb-3 uppercase tracking-wider">Shopping App</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 transition-colors">Home Page</button></li>
              <li><button onClick={() => setActiveTab('stores')} className="hover:text-emerald-400 transition-colors">Discover Nearby Stores</button></li>
              <li><button onClick={() => setActiveTab('categories')} className="hover:text-emerald-400 transition-colors">All 26 Categories</button></li>
              <li><button onClick={() => setActiveTab('cart')} className="hover:text-emerald-400 transition-colors">Multi-Store Cart</button></li>
              <li><button onClick={() => setActiveTab('orders')} className="hover:text-emerald-400 transition-colors">Live Order Tracking</button></li>
            </ul>
          </div>

          {/* Col 3: Partner Portals */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-white mb-3 uppercase tracking-wider">Partner Platforms</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('store_register')} className="hover:text-orange-400 transition-colors font-bold text-orange-400 flex items-center gap-1"><Store className="w-3.5 h-3.5" /> Sell with KiranaGo (Store Register)</button></li>
              <li><button onClick={() => setActiveTab('delivery_register')} className="hover:text-orange-400 transition-colors font-bold text-emerald-400 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Deliver with KiranaGo (Agent Register)</button></li>
              <li><button onClick={() => setActiveTab('store_dashboard')} className="hover:text-slate-200 transition-colors">Store Owner Dashboard</button></li>
              <li><button onClick={() => setActiveTab('delivery_dashboard')} className="hover:text-slate-200 transition-colors">Delivery Agent Dashboard</button></li>
              <li><button onClick={() => setActiveTab('admin_dashboard')} className="hover:text-slate-200 transition-colors">KiranaGo Admin Control Panel</button></li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-white mb-3 uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-500" /> 1800-KIRANAGO (Toll Free)</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-500" /> support@kiranago.in</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Bengaluru, Karnataka, India</li>
              <li className="pt-2 text-emerald-400 font-bold">24x7 AI Support Assistant active in app</li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 KiranaGo Marketplace Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">FSSAI License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
