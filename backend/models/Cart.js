const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  storeId: { type: String, required: true },
  storeName: { type: String, default: 'Kirana Partner' },
  image: { type: String },
  unit: { type: String }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [cartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
