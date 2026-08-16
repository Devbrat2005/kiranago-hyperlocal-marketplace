const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String },
  storeId: { type: String, default: 'store_1' },
  storeName: { type: String, default: 'Kirana Partner' },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: { type: String, default: 'Grocery' },
  categoryId: { type: String, default: 'cat_grocery' },
  brand: { type: String, default: 'Generic' },
  mrp: { type: Number },
  price: { type: Number },
  sellingPrice: { type: Number, required: [true, 'Selling price is required'] },
  discount: { type: mongoose.Schema.Types.Mixed, default: '0%' },
  unit: { type: String, default: '500 g' },
  weight: { type: String, default: '500 g' },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'
  },
  description: { type: String, default: '' },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 12 },
  isPopular: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  stock: { type: Number, default: 50 },
  inStock: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
