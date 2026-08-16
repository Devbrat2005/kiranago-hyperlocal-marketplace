const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number, default: 100 },
  minimumOrderAmount: { type: Number, default: 199 },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
