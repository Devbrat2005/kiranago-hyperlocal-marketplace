const mongoose = require('mongoose');

const deliveryJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'JOB_' + Math.random().toString(36).substring(2, 9).toUpperCase()
  },
  orderId: { type: String, required: true },
  storeName: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  earning: { type: Number, default: 45 },
  distance: { type: String, default: '2.4 km' },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
    default: 'AVAILABLE'
  },
  assignedPartnerId: { type: String, default: null },
  assignedPartnerName: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryJob', deliveryJobSchema);
