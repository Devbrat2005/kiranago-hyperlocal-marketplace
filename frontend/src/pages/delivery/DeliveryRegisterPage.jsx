import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';
import { Truck, CheckCircle2, ShieldCheck, FileText, Phone } from 'lucide-react';

export default function DeliveryRegisterPage({ onRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    drivingLicense: '',
    vehicleType: 'Two Wheeler (Bike/Scooter)',
    vehicleNumber: '',
    bankDetails: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/delivery/register'), {
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
        <h2 className="text-2xl font-heading font-extrabold text-slate-900">Partner Verification Pending!</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Thank you for registering <strong>{formData.name}</strong> as a KiranaGo Delivery Partner. Our admin verification team will verify your Driving License and Vehicle details shortly.
        </p>
        <button
          onClick={onRegistered}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md"
        >
          Go to Delivery Partner App
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
          <Truck className="w-4 h-4 text-emerald-600" /> KiranaGo Delivery Fleet
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-900">Delivery Partner Registration</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
          Earn competitive daily payouts delivering quick groceries from local Kirana stores. Flexible hours & instant payouts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Driving License No. *</label>
            <input
              type="text"
              required
              placeholder="KA01 20220001234"
              value={formData.drivingLicense}
              onChange={e => setFormData({ ...formData, drivingLicense: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Registration No. *</label>
            <input
              type="text"
              required
              placeholder="KA 01 EQ 9876"
              value={formData.vehicleNumber}
              onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium uppercase"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold rounded-2xl shadow-lg text-sm transition-all"
        >
          Submit Delivery Application
        </button>
      </form>
    </div>
  );
}
