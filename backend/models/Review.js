const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  storeId: { type: String, required: true },
  productId: { type: String, default: null },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
