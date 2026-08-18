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
    success: true,
    message: 'KiranaGo API is working',
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

// Root Server Status Endpoint
app.get('/', (req, res, next) => {
  const distPath = path.join(__dirname, '../frontend/dist');
  if (fs.existsSync(distPath)) {
    return res.sendFile(path.resolve(distPath, 'index.html'));
  }
  if (req.accepts('html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KiranaGo Backend API Server</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 40px; max-width: 560px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 16px; rounded-full; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
          .pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981; }
          h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
          p { color: #94a3b8; font-size: 14px; margin-bottom: 28px; }
          .links { display: flex; flex-direction: column; gap: 12px; }
          a { display: flex; align-items: center; justify-content: space-between; background: #334155; color: #38bdf8; text-decoration: none; padding: 14px 20px; border-radius: 14px; font-weight: 600; font-size: 14px; transition: all 0.2s ease; }
          a:hover { background: #475569; color: #7dd3fc; transform: translateY(-2px); }
          .method { background: #0284c7; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge"><span class="pulse"></span> Express Backend API Online</div>
          <h1>KiranaGo Hyperlocal API</h1>
          <p>Your Local Store, Delivered Fast. Express REST API Server</p>
          <div class="links">
            <a href="/api/health" target="_blank"><span><span class="method">GET</span> Health Check Status</span> <span>/api/health &rarr;</span></a>
            <a href="/api/products" target="_blank"><span><span class="method">GET</span> Products Catalog API</span> <span>/api/products &rarr;</span></a>
            <a href="/api/stores" target="_blank"><span><span class="method">GET</span> Kirana Stores API</span> <span>/api/stores &rarr;</span></a>
            <a href="/api/categories" target="_blank"><span><span class="method">GET</span> Product Categories API</span> <span>/api/categories &rarr;</span></a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
  res.json({
    status: 'ONLINE',
    app: 'KiranaGo Backend API',
    message: 'Welcome to KiranaGo Hyperlocal Marketplace Express API Server',
    health: '/api/health',
    api: '/api',
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
