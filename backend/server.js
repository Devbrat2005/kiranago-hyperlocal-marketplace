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

// CORS Configuration supporting Vercel deployment & local dev
const allowedOrigins = [
  'https://kiranago-hyperlocal-marketplace.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow requests gracefully across environments
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Automatic Database Seeder Function
function seedDatabaseIfEmpty() {
  try {
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
  } catch (err) {
    console.error('Seeder notice:', err.message);
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
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Root Route Welcome Message
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KiranaGo Hyperlocal Marketplace Express API Server',
    health: '/api/health',
    tagline: 'Your Local Store, Delivered Fast.'
  });
});

// Serve frontend static assets if built in production mode locally
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.join(__dirname, '../frontend/dist');
  if (require('fs').existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}

// Start Server locally if not running on Vercel Serverless environment
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 KiranaGo Server running on http://localhost:${PORT}`);
    console.log(`📍 API endpoints mounted on http://localhost:${PORT}/api`);
  });
}

module.exports = app;
