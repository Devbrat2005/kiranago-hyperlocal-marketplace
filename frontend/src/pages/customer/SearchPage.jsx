import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/customer/ProductCard';
import StoreCard from '../../components/customer/StoreCard';
import { useLocation } from '../../context/LocationContext';
import { getApiUrl } from '../../config/api';
import { Search, Filter, SlidersHorizontal, Store, ShoppingBag, X } from 'lucide-react';

export default function SearchPage({ initialQuery = '', onSelectStore, onSelectProduct }) {
  const { currentLocation } = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState({ products: [], stores: [], categories: [], suggestions: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortOption, setSortOption] = useState('relevance');

  useEffect(() => {
    fetchSearchResults();
  }, [query, selectedCategory, selectedBrand, maxPrice, minRating, sortOption, currentLocation]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const lat = currentLocation ? currentLocation.lat : 12.9784;
      const lng = currentLocation ? currentLocation.lng : 77.6408;

      let url = `/api/search?q=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}&sort=${sortOption}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedBrand) url += `&brand=${encodeURIComponent(selectedBrand)}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (minRating) url += `&minRating=${minRating}`;

      const response = await fetch(getApiUrl(url));
      const data = await response.json();
      if (data.success) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice('');
    setMinRating('');
    setSortOption('relevance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Search Header Input */}
      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-100 mb-6">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            placeholder="Search products ('Aashirvaad', 'Milk', 'Fortune'), stores ('Sharma Store'), brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 text-slate-400 hover:text-slate-600 font-bold text-sm">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Auto Suggestions */}
        {searchResults.suggestions && searchResults.suggestions.length > 0 && query && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-extrabold uppercase text-slate-400">Suggestions:</span>
            {searchResults.suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(sug)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter & Sort Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeTab === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All Results ({searchResults.counts ? searchResults.counts.products + searchResults.counts.stores : 0})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeTab === 'products' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Products ({searchResults.counts?.products || 0})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeTab === 'stores' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Stores ({searchResults.counts?.stores || 0})
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Sort By:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="relevance">Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="distance">Nearest Distance</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">
          Searching KiranaGo database for "{query}"...
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Stores Results Section */}
          {(activeTab === 'all' || activeTab === 'stores') && searchResults.stores && searchResults.stores.length > 0 && (
            <div>
              <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" /> Stores Found
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.stores.map((store) => (
                  <StoreCard key={store.id || store._id} store={store} onClick={() => onSelectStore && onSelectStore(store.id || store._id)} />
                ))}
              </div>
            </div>
          )}

          {/* Products Results Section */}
          {(activeTab === 'all' || activeTab === 'products') && searchResults.products && searchResults.products.length > 0 && (
            <div>
              <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" /> Products Found
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.products.map((prod) => (
                  <ProductCard key={prod.id || prod._id} product={prod} onClick={() => onSelectProduct && onSelectProduct(prod)} />
                ))}
              </div>
            </div>
          )}

          {searchResults.products?.length === 0 && searchResults.stores?.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching products or stores found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try checking for typos or searching general terms like "Milk", "Atta", "Rice", or "Sharma Store".
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
