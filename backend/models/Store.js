const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  id: { type: String, index: true },
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  ownerName: { type: String, default: '' },
  ownerId: { type: String, default: null },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, required: [true, 'Address is required'] },
  area: { type: String, required: [true, 'Area is required'] },
  city: { type: String, required: [true, 'City is required'] },
  pincode: { type: String, default: '560001' },
  latitude: { type: Number, default: 12.9716 },
  longitude: { type: Number, default: 77.5946 },
  gst: { type: String, default: '' },
  pan: { type: String, default: '' },
  bankDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=60'
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60'
  },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  openingTime: { type: String, default: '07:00 AM' },
  closingTime: { type: String, default: '10:00 PM' },
  category: { type: String, default: 'General Store' },
  deliveryRadius: { type: Number, default: 7.0 },
  deliveryFee: { type: Number, default: 15 },
  minimumOrder: { type: Number, default: 99 },
  deliveryTime: { type: String, default: '15-25 mins' },
  isOpen: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isTopRated: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);
