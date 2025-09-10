const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const AnalyticsService = require('./services/analyticsService');
const MonitoringService = require('./services/monitoringService');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Analytics service instance
const analytics = new AnalyticsService();
const monitoring = new MonitoringService();

// WebSocket server for real-time updates
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New analytics client connected');
  
  // Send initial data
  analytics.getRealTimeStats().then(stats => {
    ws.send(JSON.stringify({ type: 'initial', data: stats }));
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Analytics client disconnected');
  });
});

// Broadcast updates to all connected clients
const broadcast = (data) => {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// API Routes

// Dashboard overview
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await analytics.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Wallet statistics
app.get('/api/wallets/stats', async (req, res) => {
  try {
    const stats = await analytics.getWalletStats();
    res.json(stats);
  } catch (error) {
    console.error('Wallet stats error:', error);
    res.status(500).json({ error: 'Failed to get wallet stats' });
  }
});

// Transaction analytics
app.get('/api/transactions/stats', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    const stats = await analytics.getTransactionStats(timeframe);
    res.json(stats);
  } catch (error) {
    console.error('Transaction stats error:', error);
    res.status(500).json({ error: 'Failed to get transaction stats' });
  }
});

// Geographic distribution
app.get('/api/geography', async (req, res) => {
  try {
    const data = await analytics.getGeographicData();
    res.json(data);
  } catch (error) {
    console.error('Geography data error:', error);
    res.status(500).json({ error: 'Failed to get geographic data' });
  }
});

// Asset creation analytics
app.get('/api/assets/stats', async (req, res) => {
  try {
    const stats = await analytics.getAssetStats();
    res.json(stats);
  } catch (error) {
    console.error('Asset stats error:', error);
    res.status(500).json({ error: 'Failed to get asset stats' });
  }
});

// Performance metrics
app.get('/api/performance', async (req, res) => {
  try {
    const metrics = await monitoring.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Network health
app.get('/api/network/health', async (req, res) => {
  try {
    const health = await monitoring.getNetworkHealth();
    res.json(health);
  } catch (error) {
    console.error('Network health error:', error);
    res.status(500).json({ error: 'Failed to get network health' });
  }
});

// Error analytics
app.get('/api/errors', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    const errors = await analytics.getErrorStats(timeframe);
    res.json(errors);
  } catch (error) {
    console.error('Error stats error:', error);
    res.status(500).json({ error: 'Failed to get error stats' });
  }
});

// Feature usage analytics
app.get('/api/features/usage', async (req, res) => {
  try {
    const usage = await analytics.getFeatureUsage();
    res.json(usage);
  } catch (error) {
    console.error('Feature usage error:', error);
    res.status(500).json({ error: 'Failed to get feature usage' });
  }
});

// Historical data endpoint
app.get('/api/history/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { timeframe = '7d', granularity = '1h' } = req.query;
    const data = await analytics.getHistoricalData(metric, timeframe, granularity);
    res.json(data);
  } catch (error) {
    console.error('Historical data error:', error);
    res.status(500).json({ error: 'Failed to get historical data' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Scheduled tasks for data collection
cron.schedule('*/5 * * * *', async () => {
  // Collect metrics every 5 minutes
  try {
    const stats = await analytics.collectMetrics();
    broadcast({ type: 'metrics_update', data: stats });
  } catch (error) {
    console.error('Metrics collection error:', error);
  }
});

cron.schedule('0 * * * *', async () => {
  // Cleanup old data every hour
  try {
    await analytics.cleanupOldData();
  } catch (error) {
    console.error('Data cleanup error:', error);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 RaptorQ Analytics Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

module.exports = app;