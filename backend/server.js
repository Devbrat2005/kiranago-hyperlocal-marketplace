const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB, getDbStatus } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB Atlas Connection
connectDB();

// CORS Configuration supporting Vercel deployment & local dev
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
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

// Root API Welcome Message
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to KiranaGo Hyperlocal Marketplace Express API Server with MongoDB Mongoose Integration',
    health: '/api/health',
    tagline: 'Your Local Store, Delivered Fast.'
  });
});

// Serve frontend static assets if dist exists locally
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// 404 Fallback for unhandled API requests ONLY
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Start Server locally if not running on Vercel Serverless environment
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 KiranaGo Server running on http://localhost:${PORT}`);
    console.log(`📍 API endpoints mounted on http://localhost:${PORT}/api`);
    console.log(`🏥 Health check status at http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
