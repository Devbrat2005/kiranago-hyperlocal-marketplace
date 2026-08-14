import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Store, MapPin, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OrdersPage({ onTrackOrder }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user?.id || 'guest_user'}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'Order Placed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Store Accepted': 'bg-purple-50 text-purple-700 border-purple-200',
    'Preparing': 'bg-amber-50 text-amber-700 border-amber-200',
    'Ready for Pickup': 'bg-teal-50 text-teal-700 border-teal-200',
    'Delivery Partner Assigned': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Out for Delivery': 'bg-orange-50 text-orange-700 border-orange-200',
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-7 h-7 text-emerald-600" /> My Orders & History
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track live orders and view past receipts</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading orders...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id || order.id || order.orderId}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-extrabold text-slate-900">#{order.orderId}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {order.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm text-slate-900">{order.storeName}</span>
                </div>

                <div className="text-xs text-slate-500 line-clamp-1">
                  {order.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400">Total Paid</span>
                  <p className="text-sm font-heading font-extrabold text-slate-900">₹{order.totalAmount}</p>
                </div>

                <button
                  onClick={() => onTrackOrder && onTrackOrder(order.orderId)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1 shadow-sm"
                >
                  Track Order <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-400 mt-1">Start shopping from nearby Kirana stores to see your orders here!</p>
        </div>
      )}
    </div>
  );
}
