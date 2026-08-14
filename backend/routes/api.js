const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');
const productController = require('../controllers/productController');
const searchController = require('../controllers/searchController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const deliveryController = require('../controllers/deliveryController');
const aiController = require('../controllers/aiController');
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
const couponController = require('../controllers/couponController');

const { protect, authorize } = require('../middleware/authMiddleware');
const categories = require('../data/seedCategories');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Categories
router.get('/categories', (req, res) => res.json({ success: true, count: categories.length, categories }));

// Store Routes
router.get('/stores', storeController.getStores);
router.get('/stores/:id', storeController.getStoreById);
router.post('/stores/register', storeController.registerStore);
router.put('/stores/:id/status', protect, storeController.updateStoreStatus);

// Product Routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', protect, productController.createProduct);
router.put('/products/:id', protect, productController.updateProduct);
router.delete('/products/:id', protect, productController.deleteProduct);

// Search Route
router.get('/search', searchController.globalSearch);

// Cart Routes
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.put('/cart/update', cartController.updateQuantity);
router.delete('/cart/item/:productId', cartController.removeItem);
router.delete('/cart/clear', cartController.clearCart);

// Order Routes
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.post('/orders/:id/cancel', orderController.cancelOrder);

// Payment Routes
router.post('/payments/create-intent', paymentController.createPaymentIntent);
router.post('/payments/verify', paymentController.verifyPayment);

// Delivery Partner Routes
router.post('/delivery/register', deliveryController.registerDeliveryPartner);
router.get('/delivery/jobs', deliveryController.getAvailableJobs);
router.post('/delivery/accept', deliveryController.acceptDeliveryJob);
router.put('/delivery/online', deliveryController.toggleOnlineStatus);
router.get('/delivery/earnings', deliveryController.getEarnings);

// AI Customer Support Routes
router.post('/ai/chat', aiController.chatWithAI);
router.get('/ai/conversations', aiController.getAIConversations);
router.post('/ai/takeover', aiController.takeoverAIConversation);

// Support Ticket Routes
router.post('/support/tickets', supportController.createTicket);
router.get('/support/tickets', supportController.getTickets);
router.put('/support/tickets/:id', supportController.updateTicketStatus);

// Coupon Routes
router.get('/coupons', couponController.getCoupons);
router.post('/coupons/validate', couponController.validateCoupon);

// Admin Routes
router.get('/admin/stats', adminController.getAdminStats);
router.get('/admin/stores', adminController.getPendingStores);
router.put('/admin/stores/:id/approve', adminController.approveStore);
router.put('/admin/stores/:id/reject', adminController.rejectStore);
router.put('/admin/delivery/:id/approve', adminController.approveDeliveryPartner);
router.get('/admin/users', adminController.getUsers);

module.exports = router;
