import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import AddressModal from './components/common/AddressModal';
import BackButton from './components/common/BackButton';

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
import LoginPage from './pages/auth/LoginPage';

export default function App() {
  const [activeTab, setActiveTabState] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  const [selectedStoreId, setSelectedStoreId] = useState('store_1');
  const [selectedOrderId, setSelectedOrderId] = useState('KG893121');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Navigate to a new tab while saving the current tab to history stack
  const changeTab = (newTab) => {
    if (newTab !== activeTab) {
      setNavigationHistory(prev => [...prev, activeTab]);
      setActiveTabState(newTab);
    }
  };

  // Back button handler: Pops previous page from history stack while preserving all state
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

  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
              
              {/* Global Navbar */}
              <Navbar
                onOpenAddressModal={() => setShowAddressModal(true)}
                onOpenSearch={handleOpenSearch}
                activeTab={activeTab}
                setActiveTab={changeTab}
              />

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
                    onOpenSearch={handleOpenSearch}
                    setActiveTab={changeTab}
                  />
                )}

                {activeTab === 'search' && (
                  <SearchPage
                    initialQuery={searchQuery}
                    onSelectStore={handleSelectStore}
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
                  />
                )}

                {activeTab === 'categories' && (
                  <SearchPage
                    initialQuery=""
                    onSelectStore={handleSelectStore}
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
                    onLoginSuccess={() => changeTab('home')}
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

            </div>
          </NotificationProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
