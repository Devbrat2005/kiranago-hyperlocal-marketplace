import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, DollarSign, Navigation, Phone, ShieldCheck, Power } from 'lucide-react';

export default function DeliveryDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [earnings, setEarnings] = useState({ todayEarnings: 315, completedDeliveriesCount: 7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryJobs();
  }, [isOnline]);

  const fetchDeliveryJobs = async () => {
    setLoading(true);
    try {
      const [jobRes, earnRes] = await Promise.all([
        fetch('/api/delivery/jobs'),
        fetch('/api/delivery/earnings')
      ]);
      const jobData = await jobRes.json();
      const earnData = await earnRes.json();

      if (jobData.success) setJobs(jobData.jobs);
      if (earnData.success) setEarnings(earnData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await fetch('/api/delivery/online', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextStatus })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptJob = async (orderId) => {
    try {
      const res = await fetch('/api/delivery/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success) {
        fetchDeliveryJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDeliveryStep = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchDeliveryJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Header & Online Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-200">
            KIRANAGO DELIVERY AGENT APP
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
            Ramesh Kumar Fleet Agent
          </h1>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs shadow-lg transition-all ${
            isOnline ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-slate-700 text-slate-200 shadow-slate-700/30'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isOnline ? 'ONLINE (RECEIVING ORDERS)' : 'OFFLINE'}</span>
        </button>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Today's Payout Earnings</span>
            <p className="text-3xl font-heading font-extrabold text-emerald-700 mt-1">₹{earnings.todayEarnings}</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Completed Deliveries</span>
            <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1">{earnings.completedDeliveriesCount}</p>
          </div>
          <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Available Delivery Requests */}
      <h2 className="text-xl font-heading font-extrabold text-slate-900 mb-4 flex items-center gap-2">
        <Truck className="w-6 h-6 text-orange-600" /> Active Delivery Jobs ({jobs.length})
      </h2>

      {!isOnline ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <p className="text-sm font-bold text-slate-600">You are currently OFFLINE</p>
          <p className="text-xs text-slate-400 mt-1">Toggle your status to ONLINE to start receiving nearby store pickup requests.</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id || job.id || job.orderId} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-mono font-extrabold text-slate-900">Order #{job.orderId}</span>
                <span className="text-xs font-extrabold bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-200">
                  {job.status}
                </span>
              </div>

              {/* Pickup Store & Dropoff Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700">1. STORE PICKUP</span>
                  <p className="font-bold text-slate-900 mt-0.5">{job.storeName}</p>
                  <p className="text-slate-500">{job.storeAddress || 'Local Kirana Market'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-orange-700">2. CUSTOMER DROPOFF</span>
                  <p className="font-bold text-slate-900 mt-0.5">{job.customerName || 'Customer'} ({job.customerPhone})</p>
                  <p className="text-slate-500">{job.address?.area}, {job.address?.city}</p>
                </div>
              </div>

              {/* Action Stepper */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-emerald-700">Payout: ₹45 • {job.paymentMethod === 'COD' ? 'Collect Cash ₹' + job.totalAmount : 'Prepaid Online'}</span>

                <div className="flex items-center gap-2">
                  {job.status === 'Ready for Pickup' && (
                    <button
                      onClick={() => handleAcceptJob(job.orderId)}
                      className="px-4 py-2 bg-orange-600 text-white font-extrabold text-xs rounded-xl hover:bg-orange-700 shadow-sm"
                    >
                      Accept Delivery
                    </button>
                  )}
                  {job.status === 'Delivery Partner Assigned' && (
                    <button
                      onClick={() => handleUpdateDeliveryStep(job.orderId, 'Picked Up')}
                      className="px-4 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 shadow-sm"
                    >
                      Mark Picked Up from Store
                    </button>
                  )}
                  {job.status === 'Picked Up' && (
                    <button
                      onClick={() => handleUpdateDeliveryStep(job.orderId, 'Out for Delivery')}
                      className="px-4 py-2 bg-purple-600 text-white font-extrabold text-xs rounded-xl hover:bg-purple-700 shadow-sm"
                    >
                      Start Out for Delivery
                    </button>
                  )}
                  {job.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateDeliveryStep(job.orderId, 'Delivered')}
                      className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                    >
                      Mark Order Delivered
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active delivery requests right now</h3>
          <p className="text-xs text-slate-400 mt-1">New store pickup requests will populate here automatically.</p>
        </div>
      )}

    </div>
  );
}
