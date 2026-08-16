import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';
import { MapPin, Clock, Store, Truck, Phone, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';

export default function OrderTrackingPage({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 4000); // Live polling simulation
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/orders/${orderId}`));
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/orders/${orderId}/cancel`), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchOrderDetails();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-bold animate-pulse">
        Fetching Live Order Tracking for #{orderId}...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                LIVE ORDER TRACKING
              </span>
              <span className="text-xs text-slate-400">Order #{order.orderId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
              ETA: {order.estimatedDeliveryTime || '15-20 mins'}
            </h1>
          </div>

          {['Order Placed', 'Store Accepted', 'Preparing'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Live Tracking Map View Simulation */}
        <div className="mt-6 relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center text-white">
          {/* Simulated Map Visual */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="z-10 w-full max-w-xl px-6 flex items-center justify-between relative">
            {/* Store Pin */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
                {order.storeName}
              </span>
            </div>

            {/* Moving Delivery Partner Radar */}
            <div className="flex-1 relative flex items-center justify-center px-4">
              <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute bg-orange-500 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            {/* Customer Pin */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
                {order.address?.area || 'Home'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Milestones */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
          <h3 className="text-base font-heading font-extrabold text-slate-900 mb-6">Order Status Timeline</h3>

          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {order.timeline?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                  step.completed ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.status}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[11px] text-slate-400">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
            <h3 className="text-base font-heading font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Order Receipt
            </h3>

            <div className="space-y-3 mb-4 text-xs">
              {order.items?.map((item, iIdx) => (
                <div key={iIdx} className="flex justify-between text-slate-700">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-bold text-slate-900">₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">₹{order.itemsSubtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee:</span><span className="font-semibold">₹{order.deliveryFee}</span></div>
              <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                <span>Total Amount:</span>
                <span className="text-emerald-700">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
