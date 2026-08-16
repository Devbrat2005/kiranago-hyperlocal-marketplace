import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';
import { Store, ShieldCheck, CheckCircle2, Building, MapPin, FileText, Clock } from 'lucide-react';

export default function StoreRegisterPage({ onRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    city: 'Bengaluru',
    pincode: '',
    gst: '',
    pan: '',
    category: 'Kirana Store',
    openingTime: '07:00 AM',
    closingTime: '10:00 PM',
    deliveryRadius: '7.0',
    deliveryFee: '15'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/stores/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-slate-900">Application Submitted!</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Thank you for registering <strong>{formData.name}</strong> with KiranaGo. Our onboarding admin team will review your GST/PAN details and verify your store location shortly.
        </p>
        <button
          onClick={onRegistered}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md"
        >
          Go to Store Owner Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold mb-2">
          <Store className="w-4 h-4 text-orange-600" /> Sell with KiranaGo
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-900">Partner Store Registration</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
          Expand your local customer reach and double your daily grocery orders with KiranaGo Hyperlocal Delivery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Store Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sharma General Store"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Owner Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Sharma"
              value={formData.ownerName}
              onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone *</label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="store@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Area / Locality *</label>
            <input
              type="text"
              required
              placeholder="e.g. Indiranagar"
              value={formData.area}
              onChange={e => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">PIN Code *</label>
            <input
              type="text"
              required
              placeholder="560038"
              value={formData.pincode}
              onChange={e => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Full Shop Address *</label>
          <textarea
            required
            rows="2"
            placeholder="Shop No., Street Name, Landmark"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">GST Number (Optional)</label>
            <input
              type="text"
              placeholder="29AAAAA0000A1Z5"
              value={formData.gst}
              onChange={e => setFormData({ ...formData, gst: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">PAN Number *</label>
            <input
              type="text"
              required
              placeholder="ABCDE1234F"
              value={formData.pan}
              onChange={e => setFormData({ ...formData, pan: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium uppercase"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-2xl shadow-lg text-sm transition-all"
        >
          Submit Store Application
        </button>
      </form>
    </div>
  );
}
