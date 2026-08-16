import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';
import { ShieldCheck, Store, Users, ShoppingBag, DollarSign, Check, X, Bot, TicketCheck } from 'lucide-react';

export default function AdminDashboardPage({ onOpenAIChats }) {
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statRes, storeRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/stats')),
        fetch(getApiUrl('/api/admin/stores'))
      ]);
      const statData = await statRes.json();
      const storeData = await storeRes.json();

      if (statData.success) setStats(statData.stats);
      if (storeData.success) setStores(storeData.stores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStore = async (storeId) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/stores/${storeId}/approve`), { method: 'PUT' });
      const data = await res.json();
      if (data.success) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectStore = async (storeId) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/stores/${storeId}/reject`), { method: 'PUT' });
      const data = await res.json();
      if (data.success) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return <div className="py-20 text-center font-bold text-slate-400 animate-pulse">Loading Admin Control Panel...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
            KIRANAGO ADMIN SUPERVISOR
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
            Platform Master Control
          </h1>
        </div>

        <button
          onClick={onOpenAIChats}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5"
        >
          <Bot className="w-4 h-4" /> AI Support Logs Oversight & Takeover
        </button>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-xs font-bold text-slate-400">Total Registered Stores</span>
          <p className="text-2xl font-heading font-extrabold text-slate-900 mt-1">{stats.totalStores}</p>
          <span className="text-[10px] text-amber-600 font-bold">{stats.pendingStoresCount} pending approval</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-xs font-bold text-slate-400">Total Orders Processed</span>
          <p className="text-2xl font-heading font-extrabold text-slate-900 mt-1">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-xs font-bold text-slate-400">Gross Platform GMV</span>
          <p className="text-2xl font-heading font-extrabold text-emerald-700 mt-1">₹{stats.totalRevenue}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-xs font-bold text-slate-400">Total Products Listed</span>
          <p className="text-2xl font-heading font-extrabold text-purple-700 mt-1">{stats.totalProductsCount}</p>
        </div>
      </div>

      {/* Store Approvals Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card mb-8">
        <h3 className="text-base font-heading font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Store className="w-5 h-5 text-emerald-600" /> Store Owner Onboarding Applications
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5">Store & Owner</th>
                <th className="py-2.5">Area & Address</th>
                <th className="py-2.5">GST / PAN</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {stores.map((store) => (
                <tr key={store._id || store.id}>
                  <td className="py-3">
                    <p className="font-bold text-slate-900">{store.name}</p>
                    <span className="text-[11px] text-slate-400">{store.ownerName} ({store.phone})</span>
                  </td>
                  <td className="py-3">
                    <p>{store.area}, {store.city}</p>
                    <span className="text-[10px] text-slate-400">{store.address}</span>
                  </td>
                  <td className="py-3 font-mono text-[11px]">
                    <p>PAN: {store.pan || 'N/A'}</p>
                    <span>GST: {store.gst || 'N/A'}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${store.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {store.isApproved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {!store.isApproved ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleApproveStore(store._id || store.id)} className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700" title="Approve Store">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleRejectStore(store._id || store.id)} className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700" title="Reject Store">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold">Active Store</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
