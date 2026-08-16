const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB, getDbStatus } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB Atlas Connection
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

// API Routes
app.use('/api', apiRoutes);

// Base Health Endpoint featuring MongoDB status
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'ONLINE',
    app: 'KiranaGo Backend API',
    database: {
      type: 'MongoDB Atlas',
      connectionStatus: dbStatus.status,
      connectionCode: dbStatus.stateCode,
      host: dbStatus.host,
      name: dbStatus.dbName
    },
    tagline: 'Your Local Store, Delivered Fast.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root Route Welcome Message
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KiranaGo Hyperlocal Marketplace Express API Server with MongoDB Mongoose Integration',
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
    console.log(`🏥 Health check status at http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
