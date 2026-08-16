const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  sellingPrice: { type: Number, required: true },
  price: { type: Number },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String },
  image: { type: String },
  storeId: { type: String },
  storeName: { type: String }
}, { _id: false });

const trackingStatusSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'ORD_' + Math.random().toString(36).substring(2, 9).toUpperCase()
  },
  customerId: { type: String, default: null },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  storeId: { type: String, default: null },
  storeName: { type: String, default: 'Kirana Partner' },
  items: [orderItemSchema],
  deliveryAddress: { type: mongoose.Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED'
  },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 15 },
  platformFee: { type: Number, default: 5 },
  taxes: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  deliveryPartnerId: { type: String, default: null },
  deliveryPartnerName: { type: String, default: null },
  deliveryPartnerPhone: { type: String, default: null },
  trackingHistory: [trackingStatusSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
