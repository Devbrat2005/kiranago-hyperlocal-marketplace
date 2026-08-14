import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { User, MapPin, Phone, Mail, ShieldCheck, Plus } from 'lucide-react';

export default function ProfilePage({ onOpenAddressModal }) {
  const { user } = useAuth();
  const { savedAddresses } = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
          <User className="w-7 h-7 text-emerald-600" /> Account Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal details, active role, and saved delivery addresses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-2xl mx-auto flex items-center justify-center font-heading font-extrabold text-3xl shadow-lg">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-heading font-extrabold text-slate-900">{user?.name || 'Rahul Sharma'}</h2>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mt-1">
              ROLE: {user?.role || 'CUSTOMER'}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email || 'rahul@example.com'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user?.phone || '+91 9876543210'}</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Saved Addresses ({savedAddresses.length})
            </h3>
            <button
              onClick={onOpenAddressModal}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Manage Addresses
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedAddresses.map((addr, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900">{addr.type} ({addr.area})</span>
                <p className="text-xs text-slate-600 mt-1">{addr.addressLine}, {addr.city}</p>
                <span className="text-[10px] text-slate-400 block mt-2">PIN: {addr.pincode} | State: {addr.state}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
