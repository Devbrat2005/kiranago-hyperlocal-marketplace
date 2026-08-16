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

// Serve frontend static assets if dist exists
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Fallback Route
app.get('*', (req, res, next) => {
  // Pass API calls to 404 handler
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Serve index.html if dist exists
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.resolve(distPath, 'index.html'));
  }

  // Final fallback info
  res.send(`
    <!語html>
    <html>
      <head>
        <title>KiranaGo Hyperlocal Marketplace</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; text-align: center; border: 1px solid #e2e8f0; }
          .btn { display: inline-block; background: #059669; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.75rem; font-weight: bold; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color: #059669; margin-top: 0;">🛒 KiranaGo API Server</h2>
          <p>Express Backend is running and connected to MongoDB Atlas.</p>
          <a href="/api/health" class="btn">View API Health Status</a>
        </div>
      </body>
    </html>
  `);
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
