# 📊 RaptorQ Analytics Dashboard

**Private monitoring and analytics dashboard for RaptorQ Wallet performance tracking.**

> ⚠️ **PRIVATE USE ONLY** - This dashboard is for internal monitoring and should not be publicly accessible.

## 🎯 Overview

The RaptorQ Analytics Dashboard provides comprehensive monitoring and analytics for your RaptorQ Wallet deployment. Track user activity, transaction volumes, performance metrics, and system health in real-time.

## ✨ Features

### 📈 **Real-Time Metrics**
- **Live User Activity**: Active wallets, new registrations, user engagement
- **Transaction Analytics**: Volume, success rates, fee analysis, RTM flows  
- **Asset Management**: Creation rates, asset types, popularity trends
- **Geographic Distribution**: Global usage patterns and regional statistics

### 🔍 **Performance Monitoring**
- **System Health**: CPU, memory, disk usage, uptime tracking
- **Response Times**: API performance, database query optimization
- **Error Tracking**: Error rates, failure analysis, system alerts
- **Network Health**: Connection monitoring, throughput analysis

### 🎨 **Professional Interface**
- **Real-Time Updates**: WebSocket-powered live data streaming
- **Interactive Charts**: Chart.js powered visualizations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional dark interface with glass effects

### 🛡️ **Security Features**
- **Private Access**: No external access, internal use only
- **Rate Limiting**: Protection against abuse and overload
- **Secure Headers**: Security headers and CORS protection
- **Data Privacy**: No user PII tracked or stored

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Access to RaptorQ Wallet backend (optional)

### Installation

```bash
# Clone or extract the analytics dashboard
cd raptorq-analytics

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the analytics server
npm start
```

The dashboard will be available at `http://localhost:3001`

### Development Mode

```bash
# Start in development mode with auto-reload
npm run dev
```

## 📊 Dashboard Sections

### **Main Dashboard**
- Key performance indicators (KPIs)
- Active wallet count with growth trends
- Transaction volume and RTM flow analysis
- Asset creation statistics with monthly breakdown

### **User Analytics**  
- Geographic distribution with country breakdown
- User activity patterns and engagement metrics
- Wallet type distribution and usage patterns
- Growth trends and user acquisition analysis

### **Performance Metrics**
- System performance indicators (CPU, memory, uptime)
- API response times and throughput analysis
- Error rates and failure point identification  
- Network health and connection monitoring

### **Feature Usage**
- Feature adoption rates and usage trends
- Popular features and user preferences
- Premium service conversion and usage
- A/B testing results and user behavior

### **Real-Time Activity**
- Live activity feed with wallet operations
- Transaction monitoring and asset creation
- Smartnode deployments and management
- Premium service purchases and activations

## 🔧 Configuration

### Environment Variables

```bash
# Core Configuration
PORT=3001                                    # Server port
NODE_ENV=production                          # Environment mode
MONGO_URL=mongodb://localhost:27017/analytics # Database connection

# Security  
ALLOWED_ORIGINS=http://localhost:3000        # CORS origins
RATE_LIMIT_MAX_REQUESTS=100                  # Rate limiting

# Analytics
CACHE_TIMEOUT=300000                         # 5 minutes cache
METRICS_RETENTION_DAYS=30                    # Data retention
```

### Database Collections

The analytics dashboard uses the following MongoDB collections:
- `wallet_activity` - User activity tracking
- `transactions` - Transaction history and volumes
- `assets` - Asset creation and management data
- `feature_usage` - Feature adoption and usage metrics
- `error_logs` - System errors and failure tracking
- `metrics_history` - Historical performance data

## 📱 API Endpoints

### Analytics Data
```
GET /api/dashboard          - Main dashboard statistics
GET /api/wallets/stats      - Wallet analytics and metrics
GET /api/transactions/stats - Transaction volume and analysis
GET /api/geography          - Geographic user distribution
GET /api/assets/stats       - Asset creation and trends
GET /api/features/usage     - Feature adoption metrics
```

### Performance Monitoring
```
GET /api/performance        - System performance metrics
GET /api/network/health     - Network connectivity status
GET /api/errors             - Error rates and analysis
```

### Historical Data
```
GET /api/history/:metric    - Historical data for specific metrics
  ?timeframe=7d&granularity=1h
```

## 🔄 Real-Time Updates

The dashboard uses WebSocket connections for real-time data streaming:

```javascript
// WebSocket connection for live updates
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time metrics updates
};
```

## 📊 Data Collection

### Automatic Metrics Collection
- **Every 5 minutes**: Core metrics collection and caching
- **Every hour**: Data cleanup and optimization
- **Real-time**: User activity and transaction tracking

### Manual Data Refresh
- Click the refresh button in the dashboard header
- All data refreshes automatically with loading indicators
- WebSocket reconnection on connection loss

## 🛡️ Security Considerations

### Access Control
- **No public access** - Dashboard is for internal use only
- **Rate limiting** - Prevents abuse and overload
- **Secure headers** - CORS, CSP, and security headers enabled
- **Data privacy** - No personally identifiable information stored

### Network Security
```bash
# Recommended firewall rules
sudo ufw allow 3001/tcp    # Analytics dashboard
sudo ufw deny 3001/tcp     # Block external access (if needed)
```

## 🔧 Customization

### Adding Custom Metrics
```javascript
// Add custom metric collection
class CustomAnalytics extends AnalyticsService {
  async getCustomMetric() {
    // Your custom metric logic
    return await this.db.collection('custom_data').find({}).toArray();
  }
}
```

### Custom Dashboard Components
```html
<!-- Add custom dashboard section -->
<div class="glass-effect rounded-xl p-6">
  <h3 class="text-lg font-semibold mb-6">Custom Metrics</h3>
  <div id="customMetrics">
    <!-- Your custom content -->
  </div>
</div>
```

## 📈 Performance Optimization

### Caching Strategy
- **In-memory caching** for frequently accessed data
- **5-minute cache timeout** for real-time balance
- **Automatic cache invalidation** on data updates

### Database Optimization
- **Indexed collections** for fast queries
- **Aggregation pipelines** for complex analytics
- **Automatic cleanup** of old data (30-day retention)

## 🐛 Troubleshooting

### Common Issues

**Dashboard not loading:**
```bash
# Check if server is running
npm start
# Check logs for errors
tail -f logs/analytics.log
```

**Database connection issues:**
```bash
# Verify MongoDB is running
sudo systemctl status mongod
# Check connection string in .env
```

**WebSocket connection failures:**
```bash
# Check firewall settings
sudo ufw status
# Verify port 3001 is accessible
```

## 📋 Maintenance

### Daily Tasks
- Monitor dashboard for alerts and anomalies
- Check system performance metrics
- Review error logs for issues

### Weekly Tasks  
- Analyze user growth and engagement trends
- Review feature usage and adoption rates
- Monitor system resource usage

### Monthly Tasks
- Export analytics reports for stakeholders
- Review and optimize database performance
- Update security configurations as needed

## 🔗 Integration

### RaptorQ Wallet Integration
```javascript
// Optional: Connect to main RaptorQ wallet backend
const RAPTORQ_API = process.env.RAPTORQ_WALLET_API;
const response = await fetch(`${RAPTORQ_API}/analytics`);
```

### External Services
- **CoinGecko API**: RTM price data and market metrics
- **Webhook Notifications**: Alerts and critical event notifications
- **Log Aggregation**: Integration with logging services

## 📄 License

This analytics dashboard is proprietary software for internal use only. 
Not for public distribution or commercial use.

---

**🔒 CONFIDENTIAL - For Internal Use Only**

*Built with ❤️ for RaptorQ Wallet monitoring and analytics*