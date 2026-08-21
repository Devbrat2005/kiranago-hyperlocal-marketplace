import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import AddressModal from './components/common/AddressModal';
import BackButton from './components/common/BackButton';
import ProductDetailModal from './components/customer/ProductDetailModal';

import HomePage from './pages/customer/HomePage';
import SearchPage from './pages/customer/SearchPage';
import StoresPage from './pages/customer/StoresPage';
import StoreDetailPage from './pages/customer/StoreDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import WishlistPage from './pages/customer/WishlistPage';
import ProfilePage from './pages/customer/ProfilePage';

import StoreRegisterPage from './pages/store/StoreRegisterPage';
import StoreDashboardPage from './pages/store/StoreDashboardPage';
import DeliveryRegisterPage from './pages/delivery/DeliveryRegisterPage';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAIChatsPage from './pages/admin/AdminAIChatsPage';
import RegisterPage from './pages/auth/RegisterPage';
import { useAuth } from './context/AuthContext';
import { ShieldAlert } from 'lucide-react';

function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTabState] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState(['home']);
  const [authAlert, setAuthAlert] = useState('');

  const [selectedStoreId, setSelectedStoreId] = useState('store_1');
  const [selectedOrderId, setSelectedOrderId] = useState('KG893121');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // List of protected tabs requiring authentication
  const protectedTabs = ['checkout', 'orders', 'order_tracking', 'profile'];

  // Navigate to a new tab with protected route check
  const changeTab = (newTab) => {
    if (protectedTabs.includes(newTab) && !isAuthenticated) {
      setAuthAlert('Please login to continue.');
      setNavigationHistory(prev => [...prev, activeTab]);
      setActiveTabState('login');
      setTimeout(() => setAuthAlert(''), 4000);
      return;
    }

    if (newTab !== activeTab) {
      setAuthAlert('');
      setNavigationHistory(prev => [...prev, activeTab]);
      setActiveTabState(newTab);
    }
  };

  // Back button handler
  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const historyCopy = [...navigationHistory];
      const prevTab = historyCopy.pop();
      setNavigationHistory(historyCopy);
      setActiveTabState(prevTab || 'home');
    } else {
      setActiveTabState('home');
    }
  };

  const handleOpenSearch = (query = '') => {
    setSearchQuery(query);
    changeTab('search');
  };

  const handleSelectStore = (storeId) => {
    setSelectedStoreId(storeId);
    changeTab('store_detail');
  };

  const handleTrackOrder = (orderId) => {
    setSelectedOrderId(orderId);
    changeTab('order_tracking');
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Global Navbar */}
      <Navbar
        onOpenAddressModal={() => setShowAddressModal(true)}
        onOpenSearch={handleOpenSearch}
        activeTab={activeTab}
        setActiveTab={changeTab}
      />

      {/* Auth Alert Banner */}
      {authAlert && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-center text-xs font-extrabold text-amber-800 flex items-center justify-center gap-2 animate-fadeIn z-30">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{authAlert}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Prominent Top-Left Back Button Bar on all detail & non-home pages */}
        {activeTab !== 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1">
            <BackButton onClick={handleGoBack} />
          </div>
        )}

        {activeTab === 'home' && (
          <HomePage
            onSelectStore={handleSelectStore}
            onSelectProduct={handleSelectProduct}
            onOpenSearch={handleOpenSearch}
            setActiveTab={changeTab}
          />
        )}

        {activeTab === 'search' && (
          <SearchPage
            initialQuery={searchQuery}
            onSelectStore={handleSelectStore}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === 'stores' && (
          <StoresPage
            onSelectStore={handleSelectStore}
          />
        )}

        {activeTab === 'store_detail' && (
          <StoreDetailPage
            storeId={selectedStoreId}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === 'categories' && (
          <SearchPage
            initialQuery=""
            onSelectStore={handleSelectStore}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage
            onProceedToCheckout={() => changeTab('checkout')}
            onContinueShopping={() => changeTab('home')}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={(newOrder) => {
              if (newOrder) handleTrackOrder(newOrder.orderId);
              else changeTab('orders');
            }}
            onBackToCart={() => handleGoBack()}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPage
            onTrackOrder={handleTrackOrder}
          />
        )}

        {activeTab === 'order_tracking' && (
          <OrderTrackingPage
            orderId={selectedOrderId}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistPage
            onContinueShopping={() => changeTab('home')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            onOpenAddressModal={() => setShowAddressModal(true)}
          />
        )}

        {/* Partner Portals */}
        {activeTab === 'store_register' && (
          <StoreRegisterPage
            onRegistered={() => changeTab('store_dashboard')}
          />
        )}

        {activeTab === 'store_dashboard' && (
          <StoreDashboardPage />
        )}

        {activeTab === 'delivery_register' && (
          <DeliveryRegisterPage
            onRegistered={() => changeTab('delivery_dashboard')}
          />
        )}

        {activeTab === 'delivery_dashboard' && (
          <DeliveryDashboardPage />
        )}

        {/* Admin Platform */}
        {activeTab === 'admin_dashboard' && (
          <AdminDashboardPage
            onOpenAIChats={() => changeTab('admin_ai_chats')}
          />
        )}

        {activeTab === 'admin_ai_chats' && (
          <AdminAIChatsPage />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onSwitchToSignup={() => changeTab('register')}
            onLoginSuccess={() => changeTab('home')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onSwitchToLogin={() => changeTab('login')}
            onRegisterSuccess={() => changeTab('home')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={changeTab}
      />

      {/* Address Selection Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <NotificationProvider>
            <MainLayout />
          </NotificationProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
