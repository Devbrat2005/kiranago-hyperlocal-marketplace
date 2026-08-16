import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/customer/ProductCard';
import { getApiUrl } from '../../config/api';
import { Star, Clock, MapPin, Search, Tag, ShieldCheck, Phone, Info } from 'lucide-react';

export default function StoreDetailPage({ storeId, onSelectProduct }) {
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // products or reviews

  useEffect(() => {
    fetchStoreDetail();
  }, [storeId]);

  const fetchStoreDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/stores/${storeId}`));
      const data = await res.json();
      if (data.success) {
        setStoreData(data.store);
        setProducts(data.products || []);
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !storeData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bold text-slate-400 animate-pulse">
        Loading Store Details...
      </div>
    );
  }

  // Categories present in this store
  const storeCategories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesQuery = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Store Hero Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100 mb-8">
        <div className="relative h-48 sm:h-64 w-full bg-slate-100">
          <img src={storeData.image} alt={storeData.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${storeData.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {storeData.isOpen ? 'OPEN NOW' : 'CLOSED'}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <div className="flex items-center gap-3">
              <img src={storeData.logo} alt={storeData.name} className="w-16 h-16 rounded-2xl border-2 border-white object-cover shadow-lg bg-white" />
              <div>
                <h1 className="text-xl sm:text-3xl font-heading font-extrabold">{storeData.name}</h1>
                <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {storeData.address}, {storeData.area} ({storeData.pincode})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Quick Stats Bar */}
        <div className="p-4 sm:p-6 bg-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-extrabold text-amber-900">{storeData.rating || 4.8}</span>
              <span className="text-slate-400 text-[10px]">({storeData.reviewsCount || 120}+ reviews)</span>
            </div>

            <div className="flex items-center gap-1 text-slate-700">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>ETA: {storeData.deliveryTime || '15-20 mins'}</span>
            </div>

            <div className="hidden sm:block text-slate-500">
              Timings: {storeData.openingTime || '07:00 AM'} - {storeData.closingTime || '10:00 PM'}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl font-bold border border-emerald-200">
              {storeData.discount || 'Special Discounts Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search inside Store */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === 'reviews' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search inside ${storeData.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* Store Categories Filter Pills */}
      {activeTab === 'products' && storeCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
          {storeCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedCat === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {activeTab === 'products' && (
        filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id || prod._id}
                product={{ ...prod, storeName: storeData.name }}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
            <p className="text-sm font-bold text-slate-600">No products found in this category for {storeData.name}</p>
          </div>
        )
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
          <h3 className="text-base font-heading font-extrabold text-slate-900">Customer Ratings & Reviews</h3>
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800">{rev.userName || 'Verified Buyer'}</span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" /> {rev.rating} ★
                  </div>
                </div>
                <p className="text-xs text-slate-600">{rev.comment || 'Great fresh products and fast delivery!'}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No text reviews submitted yet. Average store rating is {storeData.rating || 4.8} ★ based on past completed orders.</p>
          )}
        </div>
      )}

    </div>
  );
}
