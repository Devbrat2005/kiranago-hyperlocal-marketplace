const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { db, connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');

const seedCategories = require('./data/seedCategories');
const seedStores = require('./data/seedStores');
const { baseProducts, storeProducts } = require('./data/seedProducts');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Storage
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Automatic Database Seeder Function
function seedDatabaseIfEmpty() {
  const categoriesCol = db.collection('categories');
  const storesCol = db.collection('stores');
  const productsCol = db.collection('products');

  if (categoriesCol.countDocuments() === 0) {
    console.log('🌱 Seeding 26 Predefined Categories...');
    categoriesCol.insertMany(seedCategories);
  }

  if (storesCol.countDocuments() === 0) {
    console.log('🌱 Seeding 30 Realistic Kirana & Grocery Stores...');
    storesCol.insertMany(seedStores);
  }

  if (productsCol.countDocuments() === 0) {
    console.log('🌱 Seeding 300+ Realistic Grocery & Daily Needs Products...');
    productsCol.insertMany(storeProducts);
  }
}

seedDatabaseIfEmpty();

// API Routes
app.use('/api', apiRoutes);

// Base Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'KiranaGo Backend API',
    tagline: 'Your Local Store, Delivered Fast.',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets if built in production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 KiranaGo Server running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints mounted on http://localhost:${PORT}/api`);
});
