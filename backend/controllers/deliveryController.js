const { db } = require('../config/db');

const deliveryPartnersCol = db.collection('deliveryPartners');
const ordersCol = db.collection('orders');

exports.registerDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, email, drivingLicense, vehicleType, vehicleNumber, bankDetails, profilePhoto } = req.body;

    const newPartner = await deliveryPartnersCol.insertOne({
      name,
      phone,
      email,
      drivingLicense,
      vehicleType: vehicleType || 'Two Wheeler',
      vehicleNumber,
      bankDetails,
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
      isApproved: true, // Default true for instant testing
      isOnline: true,
      totalEarnings: 0,
      completedOrdersCount: 0
    });

    res.status(201).json({
      success: true,
      message: 'Delivery Partner registered successfully!',
      partner: newPartner
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAvailableJobs = async (req, res) => {
  try {
    // Return orders ready for pickup or assigned to current delivery partner
    const readyOrders = await ordersCol.find({ status: 'Ready for Pickup' });
    const assignedOrders = req.user ? await ordersCol.find({ deliveryPartnerId: req.user.id }) : [];

    const combined = [...readyOrders, ...assignedOrders.filter(a => a.status !== 'Delivered' && a.status !== 'Cancelled')];

    res.json({ success: true, count: combined.length, jobs: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptDeliveryJob = async (req, res) => {
  try {
    const { orderId } = req.body;
    const partnerId = req.user ? req.user.id : 'dp_1';
    const partnerName = req.user ? req.user.name : 'Ramesh Kumar (Delivery Agent)';
    const partnerPhone = req.user ? req.user.phone : '9876500000';

    const order = (await ordersCol.findOne({ orderId })) || (await ordersCol.findById(orderId));
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedTimeline = (order.timeline || []).map(t => {
      if (t.status === 'Delivery Partner Assigned') {
        return { ...t, timestamp: new Date().toISOString(), completed: true };
      }
      return t;
    });

    const updatedOrder = await ordersCol.updateOne({ _id: order._id || order.id }, {
      status: 'Delivery Partner Assigned',
      deliveryPartnerId: partnerId,
      deliveryPartner: {
        id: partnerId,
        name: partnerName,
        phone: partnerPhone,
        vehicleNumber: 'KA-01-EQ-9876'
      },
      timeline: updatedTimeline
    });

    res.json({ success: true, message: 'Delivery job accepted!', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const partnerId = req.user ? req.user.id : 'dp_1';

    await deliveryPartnersCol.updateOne({ _id: partnerId }, { isOnline });
    res.json({ success: true, message: `Delivery status updated to ${isOnline ? 'ONLINE' : 'OFFLINE'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const partnerId = req.user ? req.user.id : 'dp_1';
    const completedOrders = await ordersCol.find({ deliveryPartnerId: partnerId, status: 'Delivered' });

    const todayEarnings = completedOrders.length * 45; // ₹45 per delivery payout
    const totalEarnings = completedOrders.length * 45;

    res.json({
      success: true,
      todayEarnings,
      totalEarnings,
      completedDeliveriesCount: completedOrders.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
