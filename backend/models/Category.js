const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🛒' },
  image: { type: String, default: '' },
  itemCount: { type: String, default: '50+ Items' },
  bgGradient: { type: String, default: 'from-amber-50 to-orange-100' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
