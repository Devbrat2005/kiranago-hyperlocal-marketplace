import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { MapPin, Navigation, Home, Briefcase, Plus, Check, AlertCircle } from 'lucide-react';

export default function AddressModal({ isOpen, onClose }) {
  const { currentLocation, savedAddresses, isLocating, locationError, useCurrentLocation, selectAddress, addSavedAddress } = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Home',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    addressLine: ''
  });

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.area || !formData.addressLine) return;

    addSavedAddress({
      ...formData,
      lat: currentLocation.lat || 12.9784,
      lng: currentLocation.lng || 77.6408
    });
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-slate-900">Select Delivery Location</h2>
            <p className="text-xs text-slate-500">Discover stores that deliver directly to your area</p>
          </div>
        </div>

        {/* GPS Button */}
        <button
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all mb-4 text-sm disabled:opacity-75"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Locating your GPS coordinates...' : 'Use Current Location'}
        </button>

        {/* Error message */}
        {locationError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Current Selected Address Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">Currently Selected</span>
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="text-sm font-bold text-emerald-950">{currentLocation.area}, {currentLocation.city}</p>
              <p className="text-xs text-emerald-800/80 truncate mt-0.5">{currentLocation.addressLine}</p>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                PIN: {currentLocation.pincode} | State: {currentLocation.state}
              </p>
            </div>
            <div className="bg-emerald-600 text-white p-1 rounded-full">
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Saved Addresses List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Saved Addresses</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          {savedAddresses.map((addr, idx) => (
            <div
              key={idx}
              onClick={() => { selectAddress(addr); onClose(); }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                currentLocation.area === addr.area
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                  {addr.type === 'Work' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">{addr.type} ({addr.area})</span>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{addr.addressLine}, {addr.city}</p>
                </div>
              </div>
              {currentLocation.area === addr.area && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
          ))}
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Add New Address</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Area / Locality"
                required
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="PIN Code"
                required
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <textarea
              placeholder="Full Address / House No / Landmark"
              required
              rows="2"
              value={formData.addressLine}
              onChange={e => setFormData({ ...formData, addressLine: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Save & Select
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
