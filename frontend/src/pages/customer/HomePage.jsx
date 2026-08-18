import React, { useState, useEffect } from 'react';
import HeroBanner from '../../components/customer/HeroBanner';
import CategoryGrid from '../../components/customer/CategoryGrid';
import StoreCard from '../../components/customer/StoreCard';
import ProductCard from '../../components/customer/ProductCard';
import AISupportWidget from '../../components/ai/AISupportWidget';
import Footer from '../../components/common/Footer';
import { useLocation } from '../../context/LocationContext';
import { getApiUrl } from '../../config/api';
import { Store, ShoppingBag, Sparkles, ChevronRight, Zap, Star, ShieldCheck, RefreshCw } from 'lucide-react';

export default function HomePage({ onSelectStore, onSelectProduct, onOpenSearch, setActiveTab }) {
  const { currentLocation } = useLocation();
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, [currentLocation]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const lat = currentLocation ? currentLocation.lat : 12.9784;
      const lng = currentLocation ? currentLocation.lng : 77.6408;

      const [catRes, storeRes, prodRes] = await Promise.all([
        fetch(getApiUrl('/api/categories')),
        fetch(getApiUrl(`/api/stores?lat=${lat}&lng=${lng}`)),
        fetch(getApiUrl('/api/products?limit=60'))
      ]);

      const catData = await catRes.json();
      const storeData = await storeRes.json();
      const prodData = await prodRes.json();

      if (catData.success) setCategories(catData.categories);
      if (storeData.success) setStores(storeData.stores);
      if (prodData.success) setProducts(prodData.products);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const nearbyStores = stores.slice(0, 6);
  const popStores = stores.filter(s => s.isPopular);
  const popularStores = (popStores.length > 0 ? popStores : stores).slice(0, 6);
  const fastStores = stores.filter(s => s.isFastDelivery);
  const fastDeliveryStores = (fastStores.length > 0 ? fastStores : stores).slice(0, 6);
  const topStores = stores.filter(s => s.rating >= 4.5);
  const topRatedStores = (topStores.length > 0 ? topStores : stores).slice(0, 6);

  const popProds = products.filter(p => p.isPopular);
  const popularProducts = (popProds.length > 0 ? popProds : products).slice(0, 8);
  
  const offerProds = products.filter(p => (parseFloat(p.discount) || 0) >= 10 || (typeof p.discount === 'string' && p.discount.includes('%')) || p.isOffer);
  const bestOffers = (offerProds.length > 0 ? offerProds : (products.length > 8 ? products.slice(8) : products)).slice(0, 8);
  
  const sellerProds = products.filter(p => p.isBestSeller);
  const bestSellers = (sellerProds.length > 0 ? sellerProds : (products.length > 16 ? products.slice(16) : products)).slice(0, 8);
  
  const recProds = products.filter(p => p.isRecommended);
  const recommendedProducts = (recProds.length > 0 ? recProds : (products.length > 24 ? products.slice(24) : products)).slice(0, 8);
  
  const recentlyAdded = products.slice(-8);

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero Promotional Banner */}
        <HeroBanner
          onSelectCategory={(catName) => onOpenSearch && onOpenSearch(catName)}
        />

        {/* 26 Categories Section */}
        <CategoryGrid
          categories={categories}
          onSelectCategory={(catName) => onOpenSearch && onOpenSearch(catName)}
        />

        {/* SECTION: NEARBY STORES */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-emerald-600" />
                Nearby Stores Delivering to {currentLocation?.area || 'You'}
              </h2>
              <p className="text-xs text-slate-500">Local Kirana & General Stores matched by GPS distance & radius</p>
            </div>
            <button
              onClick={() => setActiveTab('stores')}
              className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View All Stores <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {nearbyStores.map((store) => (
              <StoreCard
                key={store.id || store._id}
                store={store}
                onClick={() => onSelectStore && onSelectStore(store.id || store._id)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: POPULAR PRODUCTS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-orange-500" />
                Popular Products in Demand
              </h2>
              <p className="text-xs text-slate-500">Most requested groceries, snacks, dairy, and household essentials</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {popularProducts.map((prod) => (
              <ProductCard
                key={prod.id || prod._id}
                product={prod}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: BEST OFFERS */}
        <div className="mb-12 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 p-6 rounded-3xl border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                Super Savers
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
                Best Offers & Heavy Discounts
              </h2>
              <p className="text-xs text-slate-500">Up to 30% OFF on branded staples, oils, and snacks</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bestOffers.map((prod) => (
              <ProductCard
                key={prod.id || prod._id}
                product={prod}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: FAST DELIVERY STORES */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-600" />
                Fast 15-Minute Delivery Stores
              </h2>
              <p className="text-xs text-slate-500">Express delivery merchants ready for instant dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {fastDeliveryStores.map((store) => (
              <StoreCard
                key={store.id || store._id}
                store={store}
                onClick={() => onSelectStore && onSelectStore(store.id || store._id)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: BEST SELLERS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                Best Seller Products
              </h2>
              <p className="text-xs text-slate-500">Daily staples ordered by hundreds of households</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bestSellers.map((prod) => (
              <ProductCard
                key={prod.id || prod._id}
                product={prod}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: TOP RATED STORES */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                Top Rated Kirana Partners (4.7+ ★)
              </h2>
              <p className="text-xs text-slate-500">Highest rated local stores based on customer reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topRatedStores.map((store) => (
              <StoreCard
                key={store.id || store._id}
                store={store}
                onClick={() => onSelectStore && onSelectStore(store.id || store._id)}
              />
            ))}
          </div>
        </div>

        {/* SECTION: RECOMMENDED PRODUCTS & RECENTLY ADDED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-3">Recommended for You</h3>
            <div className="grid grid-cols-2 gap-3">
              {recommendedProducts.slice(0, 4).map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} onClick={() => onSelectProduct && onSelectProduct(prod)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-3">Recently Added Inventory</h3>
            <div className="grid grid-cols-2 gap-3">
              {recentlyAdded.slice(0, 4).map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} onClick={() => onSelectProduct && onSelectProduct(prod)} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Floating AI Customer Support Widget */}
      <AISupportWidget />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
