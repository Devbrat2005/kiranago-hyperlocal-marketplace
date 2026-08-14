import React, { useState, useEffect } from 'react';
import { Store, ShoppingBag, DollarSign, AlertTriangle, Plus, CheckCircle2, Clock, Package, Edit2, Trash2 } from 'lucide-react';

export default function StoreDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Add Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: 'Aashirvaad',
    category: 'Grocery',
    mrp: '',
    sellingPrice: '',
    stock: '50',
    weight: '500 g'
  });

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch('/api/orders?role=STORE_OWNER'),
        fetch('/api/products?limit=50')
      ]);
      const ordData = await ordRes.json();
      const prodData = await prodRes.json();

      if (ordData.success) setOrders(ordData.orders);
      if (prodData.success) setProducts(prodData.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchStoreData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProduct(false);
        fetchStoreData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => ['Order Placed', 'Store Accepted', 'Preparing'].includes(o.status));
  const lowStockProducts = products.filter(p => p.stock < 15);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
              STORE OWNER DASHBOARD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
            Sharma General Store Manager
          </h1>
        </div>

        <button
          onClick={() => setShowAddProduct(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Today's Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 mt-2">{orders.length}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-emerald-700 mt-2">₹{todayRevenue}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-amber-600 mt-2">{pendingOrders.length}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Low Stock Alert</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-rose-600 mt-2">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Incoming Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Product Catalog & Inventory ({products.length})
        </button>
      </div>

      {/* Orders Pipeline Board */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id || order.id || order.orderId} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-extrabold text-slate-900">#{order.orderId}</span>
                  <span className="text-xs text-slate-500 ml-2">• Customer: {order.customerName} ({order.customerPhone})</span>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  {order.status}
                </span>
              </div>

              <div className="text-xs text-slate-700">
                <strong>Items: </strong> {order.items?.map(i => `${i.name} x ${i.quantity}`).join(', ')}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-extrabold text-emerald-700">Total: ₹{order.totalAmount}</span>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2">
                  {order.status === 'Order Placed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.orderId, 'Store Accepted')}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                    >
                      Accept Order
                    </button>
                  )}
                  {order.status === 'Store Accepted' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.orderId, 'Preparing')}
                      className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700"
                    >
                      Mark Preparing
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.orderId, 'Ready for Pickup')}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                    >
                      Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Management Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div key={prod.id || prod._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                  <p className="text-[11px] text-slate-500">{prod.weight} • Stock: <strong className={prod.stock < 15 ? 'text-rose-600' : 'text-slate-900'}>{prod.stock}</strong></p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700">₹{prod.sellingPrice}</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md font-mono">{prod.sku}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative">
            <button onClick={() => setShowAddProduct(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-4">Add Product to Inventory</h3>
            
            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                <input type="text" required value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP (₹) *</label>
                  <input type="number" required value={newProd.mrp} onChange={e => setNewProd({ ...newProd, mrp: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹) *</label>
                  <input type="number" required value={newProd.sellingPrice} onChange={e => setNewProd({ ...newProd, sellingPrice: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Quantity *</label>
                  <input type="number" required value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight / Qty *</label>
                  <input type="text" required value={newProd.weight} onChange={e => setNewProd({ ...newProd, weight: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-extrabold rounded-xl shadow-md mt-2">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
