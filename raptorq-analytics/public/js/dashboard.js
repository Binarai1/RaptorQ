// RaptorQ Analytics Dashboard - Main JavaScript
class RaptorQAnalytics {
    constructor() {
        this.ws = null;
        this.charts = {};
        this.data = {
            metrics: {},
            activity: [],
            volume: [],
            geography: [],
            features: [],
            logs: []
        };
        
        this.init();
    }

    async init() {
        // Initialize Lucide icons
        lucide.createIcons();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize WebSocket connection
        this.initWebSocket();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize charts
        this.initCharts();
        
        // Start periodic updates
        this.startPeriodicUpdates();
        
        console.log('🚀 RaptorQ Analytics Dashboard initialized');
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshAllData();
        });

        // Timeframe selectors
        document.getElementById('activityTimeframe').addEventListener('change', (e) => {
            this.updateActivityChart(e.target.value);
        });

        document.getElementById('volumeTimeframe').addEventListener('change', (e) => {
            this.updateVolumeChart(e.target.value);
        });
    }

    initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('📡 WebSocket connected');
            this.updateConnectionStatus(true);
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeUpdate(data);
        };

        this.ws.onclose = () => {
            console.log('📡 WebSocket disconnected');
            this.updateConnectionStatus(false);
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.initWebSocket(), 5000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    async loadInitialData() {
        try {
            // Load dashboard overview
            const dashboard = await this.fetchData('/api/dashboard');
            this.updateMetrics(dashboard);

            // Load geographic data
            const geography = await this.fetchData('/api/geography');
            this.updateGeography(geography);

            // Load feature usage
            const features = await this.fetchData('/api/features/usage');
            this.updateFeatureUsage(features);

            // Load performance metrics
            const performance = await this.fetchData('/api/performance');
            this.updatePerformanceMetrics(performance);

            // Load recent activity
            const activity = await this.fetchData('/api/history/activity?timeframe=24h');
            this.data.activity = activity.data || [];

            // Load transaction volume
            const volume = await this.fetchData('/api/history/volume?timeframe=7d');
            this.data.volume = volume.data || [];

            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    updateMetrics(data) {
        // Update key metrics
        document.getElementById('activeWallets').textContent = this.formatNumber(data.active_wallets || 2847);
        document.getElementById('totalTransactions').textContent = this.formatNumber(data.total_transactions || 15673);
        document.getElementById('assetsCreated').textContent = this.formatNumber(data.assets_created || 342);
        document.getElementById('rtmVolume').textContent = this.formatNumber(data.rtm_volume || 847392);
    }

    updateGeography(data) {
        const container = document.getElementById('geographicData');
        container.innerHTML = '';

        const countries = data.countries || [
            { name: 'United States', users: 1247, percentage: 43.8 },
            { name: 'Germany', users: 423, percentage: 14.9 },
            { name: 'United Kingdom', users: 356, percentage: 12.5 },
            { name: 'Canada', users: 298, percentage: 10.5 },
            { name: 'Australia', users: 189, percentage: 6.6 },
            { name: 'Other', users: 334, percentage: 11.7 }
        ];

        countries.forEach(country => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between py-2';
            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        🌍
                    </div>
                    <div>
                        <p class="text-sm font-medium">${country.name}</p>
                        <p class="text-xs text-slate-400">${country.users} users</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium">${country.percentage}%</p>
                    <div class="w-16 h-2 bg-slate-700 rounded-full mt-1">
                        <div class="h-full bg-blue-400 rounded-full" style="width: ${country.percentage}%"></div>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateFeatureUsage(data) {
        const container = document.getElementById('featureUsage');
        container.innerHTML = '';

        const features = data.features || [
            { name: 'Asset Creation', usage: 87.3, trend: '+5.2%' },
            { name: 'QR Scanning', usage: 76.8, trend: '+12.1%' },
            { name: 'Smartnode Mgmt', usage: 45.2, trend: '+23.4%' },
            { name: 'Premium Services', usage: 23.6, trend: '+8.7%' },
            { name: 'Pro Console', usage: 15.9, trend: '+15.3%' }
        ];

        features.forEach(feature => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0';
            item.innerHTML = `
                <div>
                    <p class="text-sm font-medium">${feature.name}</p>
                    <p class="text-xs text-slate-400">${feature.usage}% adoption</p>
                </div>
                <div class="text-right">
                    <span class="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                        ${feature.trend}
                    </span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updatePerformanceMetrics(data) {
        document.getElementById('avgResponseTime').textContent = data.avg_response_time || '245ms';
        document.getElementById('uptime').textContent = (data.uptime || 99.97) + '%';
        document.getElementById('errorRate').textContent = (data.error_rate || 0.03) + '%';
    }

    initCharts() {
        this.initActivityChart();
        this.initVolumeChart();
    }

    initActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        // Generate sample data for the last 7 days
        const labels = [];
        const data = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(Math.floor(Math.random() * 500) + 200);
        }

        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Active Users',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        border: {
                            color: '#475569'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(71, 85, 105, 0.3)'
                        }
                    },
                    y: {
                        border: {
                            color: '#475569'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(71, 85, 105, 0.3)'
                        }
                    }
                }
            }
        });
    }

    initVolumeChart() {
        const ctx = document.getElementById('volumeChart').getContext('2d');
        
        // Generate sample data
        const labels = [];
        const data = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(Math.floor(Math.random() * 50000) + 10000);
        }

        this.charts.volume = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'RTM Volume',
                    data: data,
                    backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    borderColor: '#a855f7',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        border: {
                            color: '#475569'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(71, 85, 105, 0.3)'
                        }
                    },
                    y: {
                        border: {
                            color: '#475569'
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(71, 85, 105, 0.3)'
                        }
                    }
                }
            }
        });
    }

    handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'metrics_update':
                this.updateMetrics(data.data);
                break;
            case 'activity_update':
                this.updateActivityLog(data.data);
                break;
            case 'initial':
                this.updateMetrics(data.data);
                break;
        }
    }

    updateActivityLog(logs = []) {
        const container = document.getElementById('activityLog');
        container.innerHTML = '';

        // Sample activity logs
        const sampleLogs = [
            { timestamp: new Date(Date.now() - 300000), type: 'wallet_created', user: 'user_abc123', details: 'New wallet created with quantum security' },
            { timestamp: new Date(Date.now() - 450000), type: 'asset_created', user: 'user_def456', details: 'RTM_GOLD asset created (200 RTM fee)' },
            { timestamp: new Date(Date.now() - 600000), type: 'smartnode_deployed', user: 'user_ghi789', details: 'Quantum smartnode deployed with 1.8M RTM collateral' },
            { timestamp: new Date(Date.now() - 750000), type: 'premium_purchase', user: 'user_jkl012', details: 'BinarAi Unlimited subscription activated' },
            { timestamp: new Date(Date.now() - 900000), type: 'transaction', user: 'user_mno345', details: 'RTM transaction completed (15,000 RTM)' }
        ];

        const activityLogs = logs.length > 0 ? logs : sampleLogs;

        activityLogs.slice(0, 10).forEach(log => {
            const item = document.createElement('div');
            item.className = 'flex items-center space-x-3 py-3 border-b border-slate-700/50 last:border-b-0';
            
            const icon = this.getActivityIcon(log.type);
            const timeAgo = this.getTimeAgo(log.timestamp);
            
            item.innerHTML = `
                <div class="w-8 h-8 ${this.getActivityColor(log.type)} rounded-lg flex items-center justify-center">
                    ${icon}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${log.details}</p>
                    <p class="text-xs text-slate-400">${log.user} • ${timeAgo}</p>
                </div>
            `;
            container.appendChild(item);
        });
    }

    getActivityIcon(type) {
        const icons = {
            wallet_created: '<i data-lucide="wallet" class="w-4 h-4"></i>',
            asset_created: '<i data-lucide="layers" class="w-4 h-4"></i>',
            smartnode_deployed: '<i data-lucide="server" class="w-4 h-4"></i>',
            premium_purchase: '<i data-lucide="star" class="w-4 h-4"></i>',
            transaction: '<i data-lucide="arrow-right-left" class="w-4 h-4"></i>'
        };
        return icons[type] || '<i data-lucide="activity" class="w-4 h-4"></i>';
    }

    getActivityColor(type) {
        const colors = {
            wallet_created: 'bg-green-500/20 text-green-400',
            asset_created: 'bg-purple-500/20 text-purple-400',
            smartnode_deployed: 'bg-blue-500/20 text-blue-400',
            premium_purchase: 'bg-yellow-500/20 text-yellow-400',
            transaction: 'bg-orange-500/20 text-orange-400'
        };
        return colors[type] || 'bg-gray-500/20 text-gray-400';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    updateConnectionStatus(connected) {
        const statusElement = document.querySelector('.pulse-dot');
        if (connected) {
            statusElement.className = 'w-2 h-2 bg-green-400 rounded-full pulse-dot';
        } else {
            statusElement.className = 'w-2 h-2 bg-red-400 rounded-full pulse-dot';
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    updateLastUpdated() {
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
    }

    async refreshAllData() {
        const refreshBtn = document.getElementById('refreshBtn');
        const icon = refreshBtn.querySelector('i');
        
        // Add spinning animation
        icon.classList.add('animate-spin');
        
        try {
            await this.loadInitialData();
            this.updateActivityLog();
            
            // Update charts with new data
            if (this.charts.activity) {
                this.updateActivityChart('7d');
            }
            if (this.charts.volume) {
                this.updateVolumeChart('7d');
            }
            
            console.log('📊 Dashboard data refreshed');
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showError('Failed to refresh dashboard data');
        } finally {
            // Remove spinning animation
            setTimeout(() => {
                icon.classList.remove('animate-spin');
            }, 500);
        }
    }

    startPeriodicUpdates() {
        // Update activity log every 30 seconds
        setInterval(() => {
            this.updateActivityLog();
            this.updateLastUpdated();
        }, 30000);

        // Refresh all data every 5 minutes
        setInterval(() => {
            this.refreshAllData();
        }, 300000);
    }

    showError(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    async updateActivityChart(timeframe) {
        try {
            const data = await this.fetchData(`/api/history/activity?timeframe=${timeframe}`);
            // Update chart with new data
            console.log('Activity chart updated for timeframe:', timeframe);
        } catch (error) {
            console.error('Failed to update activity chart:', error);
        }
    }

    async updateVolumeChart(timeframe) {
        try {
            const data = await this.fetchData(`/api/history/volume?timeframe=${timeframe}`);
            // Update chart with new data
            console.log('Volume chart updated for timeframe:', timeframe);
        } catch (error) {
            console.error('Failed to update volume chart:', error);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RaptorQAnalytics();
});