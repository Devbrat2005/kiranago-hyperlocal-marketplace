const { db } = require('../config/db');

const ordersCol = db.collection('orders');
const cartsCol = db.collection('carts');
const storesCol = db.collection('stores');
const productsCol = db.collection('products');

const ORDER_TIMELINE_STEPS = [
  'Order Placed',
  'Store Accepted',
  'Preparing',
  'Ready for Pickup',
  'Delivery Partner Assigned',
  'Picked Up',
  'Out for Delivery',
  'Delivered'
];

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');
    const {
      address,
      paymentMethod = 'COD',
      couponCode = '',
      discountAmount = 0,
      deliveryInstructions = ''
    } = req.body;

    const userCart = await cartsCol.findOne({ userId });
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Group items by store
    const storeMap = {};
    for (const item of userCart.items) {
      const prod = await productsCol.findById(item.productId);
      if (!prod) continue;

      const storeId = prod.storeId || 'store_1';
      if (!storeMap[storeId]) {
        storeMap[storeId] = [];
      }
      storeMap[storeId].push({
        productId: prod._id || prod.id,
        name: prod.name,
        image: prod.image,
        weight: prod.unit || prod.weight || '1 unit',
        price: prod.sellingPrice,
        mrp: prod.price || prod.mrp || prod.sellingPrice,
        quantity: item.quantity,
        total: prod.sellingPrice * item.quantity
      });
    }

    const createdOrders = [];

    // Create separate order for each store
    for (const storeId in storeMap) {
      const items = storeMap[storeId];
      const store = (await storesCol.findById(storeId)) || { name: 'Kirana Partner', deliveryFee: 15, latitude: 12.9716, longitude: 77.5946 };

      const itemsSubtotal = items.reduce((acc, i) => acc + i.total, 0);
      const deliveryFee = itemsSubtotal >= 500 ? 0 : (store.deliveryFee !== undefined ? store.deliveryFee : 15);
      const platformFee = 5;
      const taxes = Math.round(itemsSubtotal * 0.05);
      const totalAmount = Math.max(1, itemsSubtotal + deliveryFee + platformFee + taxes - (discountAmount || 0));

      const orderId = 'KG' + Math.floor(100000 + Math.random() * 900000);

      const newOrder = await ordersCol.insertOne({
        orderId,
        userId,
        customerName: req.user ? req.user.name : 'Customer',
        customerPhone: req.user ? req.user.phone : '9876543210',
        storeId,
        storeName: store.name,
        storeAddress: store.address || 'Local Market',
        storeLat: store.latitude || 12.9716,
        storeLng: store.longitude || 77.5946,
        items,
        itemsSubtotal,
        deliveryFee,
        platformFee,
        taxes,
        discountAmount,
        totalAmount,
        address: address || { area: 'MG Road', city: 'Bengaluru', lat: 12.9750, lng: 77.6050 },
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        status: 'Order Placed',
        deliveryInstructions,
        estimatedDeliveryTime: '15-25 mins',
        deliveryPartner: null,
        timeline: [
          { status: 'Order Placed', timestamp: new Date().toISOString(), completed: true },
          { status: 'Store Accepted', timestamp: null, completed: false },
          { status: 'Preparing', timestamp: null, completed: false },
          { status: 'Ready for Pickup', timestamp: null, completed: false },
          { status: 'Delivery Partner Assigned', timestamp: null, completed: false },
          { status: 'Picked Up', timestamp: null, completed: false },
          { status: 'Out for Delivery', timestamp: null, completed: false },
          { status: 'Delivered', timestamp: null, completed: false }
        ]
      });

      createdOrders.push(newOrder);

      // Deduct stock for ordered products
      for (const i of items) {
        const p = await productsCol.findById(i.productId);
        if (p) {
          await productsCol.updateOne({ _id: p._id || p.id }, { stock: Math.max(0, (p.stock || 50) - i.quantity) });
        }
      }
    }

    // Clear cart after placing order
    await cartsCol.updateOne({ userId }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order(s) placed successfully!',
      orders: createdOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { role, id } = req.user || { role: 'CUSTOMER', id: req.query.userId || 'guest_user' };
    let orders = await ordersCol.find({});

    if (role === 'CUSTOMER') {
      orders = orders.filter(o => o.userId === id);
    } else if (role === 'STORE_OWNER') {
      orders = orders.filter(o => o.storeId === (req.user ? req.user.storeId : null) || o.storeId === id || o.storeOwnerId === id);
    } else if (role === 'DELIVERY_PARTNER') {
      orders = orders.filter(o => o.deliveryPartnerId === id || o.status === 'Ready for Pickup');
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = (await ordersCol.findOne({ orderId: id })) || (await ordersCol.findById(id));

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const store = await storesCol.findById(order.storeId);

    res.json({
      success: true,
      order: {
        ...order,
        store: store || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryPartner } = req.body;

    const order = (await ordersCol.findOne({ orderId: id })) || (await ordersCol.findById(id));
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update timeline
    const updatedTimeline = (order.timeline || []).map(t => {
      if (t.status === status) {
        return { ...t, timestamp: new Date().toISOString(), completed: true };
      }
      // If moving forward, mark preceding steps completed
      const targetIdx = ORDER_TIMELINE_STEPS.indexOf(status);
      const stepIdx = ORDER_TIMELINE_STEPS.indexOf(t.status);
      if (stepIdx <= targetIdx) {
        return { ...t, timestamp: t.timestamp || new Date().toISOString(), completed: true };
      }
      return t;
    });

    const updates = {
      status,
      timeline: updatedTimeline
    };

    if (deliveryPartner) {
      updates.deliveryPartner = deliveryPartner;
      updates.deliveryPartnerId = deliveryPartner.id || deliveryPartner._id;
    }

    if (status === 'Delivered') {
      updates.paymentStatus = 'PAID';
    }

    const updatedOrder = await ordersCol.updateOne({ _id: order._id || order.id }, updates);

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = (await ordersCol.findOne({ orderId: id })) || (await ordersCol.findById(id));

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['Picked Up', 'Out for Delivery', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order once it is out for delivery' });
    }

    const updatedOrder = await ordersCol.updateOne({ _id: order._id || order.id }, {
      status: 'Cancelled',
      cancelledAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Order cancelled successfully', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
