import React, { useState, useEffect } from 'react';
import StoreCard from '../../components/customer/StoreCard';
import { useLocation } from '../../context/LocationContext';
import { getApiUrl } from '../../config/api';
import { Store, Filter, Zap, Star, Tag, Clock } from 'lucide-react';

export default function StoresPage({ onSelectStore }) {
  const { currentLocation } = useLocation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchStores();
  }, [currentLocation, filterType]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const lat = currentLocation ? currentLocation.lat : 12.9784;
      const lng = currentLocation ? currentLocation.lng : 77.6408;

      let url = `/api/stores?lat=${lat}&lng=${lng}`;
      if (filterType === 'topRated') url += '&topRated=true';
      if (filterType === 'fastDelivery') url += '&fastDelivery=true';
      if (filterType === 'popular') url += '&popular=true';
      if (filterType === 'openNow') url += '&openNow=true';

      const res = await fetch(getApiUrl(url));
      const data = await res.json();
      if (data.success) {
        setStores(data.stores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
          <Store className="w-8 h-8 text-emerald-600" /> Nearby Stores & Supermarkets
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Showing verified stores delivering to {currentLocation?.area || 'your area'} ({currentLocation?.pincode})
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap ${filterType === 'all' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
        >
          All Stores ({stores.length})
        </button>
        <button
          onClick={() => setFilterType('topRated')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap ${filterType === 'topRated' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Top Rated (4.7+ ★)
        </button>
        <button
          onClick={() => setFilterType('fastDelivery')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap ${filterType === 'fastDelivery' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" /> Fast 15-Min Delivery
        </button>
        <button
          onClick={() => setFilterType('popular')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap ${filterType === 'popular' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
        >
          Popular Merchants
        </button>
        <button
          onClick={() => setFilterType('openNow')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap ${filterType === 'openNow' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
        >
          Open Now
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">
          Loading stores near your location...
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard
              key={store.id || store._id}
              store={store}
              onClick={() => onSelectStore && onSelectStore(store.id || store._id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No stores found for this filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try switching to 'All Stores' to view all available Kirana partners.</p>
        </div>
      )}
    </div>
  );
}
