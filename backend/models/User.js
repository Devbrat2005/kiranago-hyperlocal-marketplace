const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: { type: String, default: () => 'addr_' + Math.random().toString(36).substring(2, 9) },
  type: { type: String, default: 'Home' },
  house: { type: String, default: '' },
  area: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  lat: { type: Number },
  lng: { type: Number },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'LOCAL'; }
  },
  googleId: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['LOCAL', 'GOOGLE'],
    default: 'LOCAL'
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'STORE_OWNER', 'DELIVERY_PARTNER', 'ADMIN'],
    default: 'CUSTOMER'
  },
  addresses: [addressSchema],
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
