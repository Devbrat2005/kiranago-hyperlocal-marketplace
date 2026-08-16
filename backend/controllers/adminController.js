const { db } = require('../config/db');

const usersCol = db.collection('users');
const storesCol = db.collection('stores');
const ordersCol = db.collection('orders');
const deliveryPartnersCol = db.collection('deliveryPartners');
const ticketsCol = db.collection('support_tickets');
const productsCol = db.collection('products');

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await usersCol.countDocuments({});
    const stores = await storesCol.find({});
    const totalStores = stores.length;
    const pendingStoresCount = stores.filter(s => !s.isApproved).length;

    const orders = await ordersCol.find({});
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const deliveryPartners = await deliveryPartnersCol.find({});
    const pendingPartnersCount = deliveryPartners.filter(d => !d.isApproved).length;

    const openTicketsCount = await ticketsCol.countDocuments({ status: 'OPEN' });
    const totalProductsCount = await productsCol.countDocuments({});

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        pendingStoresCount,
        totalOrders,
        totalRevenue,
        activeDeliveryPartners: deliveryPartners.length,
        pendingPartnersCount,
        openTicketsCount,
        totalProductsCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingStores = async (req, res) => {
  try {
    const stores = await storesCol.find({});
    res.json({ success: true, stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await storesCol.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const updated = await storesCol.updateOne({ _id: store._id || store.id }, { isApproved: true });
    res.json({ success: true, message: `Store "${store.name}" approved successfully!`, store: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectStore = async (req, res) => {
  try {
    const { id } = req.params;
    await storesCol.updateOne({ _id: id }, { isApproved: false, status: 'REJECTED' });
    res.json({ success: true, message: 'Store application rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    await deliveryPartnersCol.updateOne({ _id: id }, { isApproved: true });
    res.json({ success: true, message: 'Delivery partner approved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await usersCol.find({});
    res.json({ success: true, users: users.map(u => ({ id: u._id || u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
