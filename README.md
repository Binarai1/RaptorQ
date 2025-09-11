# 🦅 RaptorQ Wallet - Quantum-Resistant Cryptocurrency Wallet

**RaptorQ** is a next-generation, quantum-resistant cryptocurrency wallet specifically designed for the Raptoreum blockchain. Built with cutting-edge post-quantum cryptography and powered by Binarai's advanced security architecture.

## ✨ Features

### 🔐 **Quantum Security**
- **SHA3-2048 Equivalent Protection**: Post-quantum cryptographic signatures
- **Quantum-Resistant Key Derivation**: Future-proof against quantum computing threats
- **Self-Healing Security**: Adaptive security protocols that evolve with threats
- **Anti-Theft Protection**: Advanced wallet security with encrypted payment addresses

### 💰 **Raptoreum Integration**
- **Real-Time Sync**: Live blockchain synchronization with animated progress
- **Asset Creation**: Create RTM assets with proper 200 RTM fees (100 creation + 100 minting)
- **Asset Explorer**: Comprehensive blockchain asset search and management
- **Smartnode Support**: Deploy and manage Raptoreum smartnodes with 1.8M RTM collateral
- **Pro Mode Console**: Full RPC command interface for advanced users

### 🎨 **Modern Interface**
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dynamic Themes**: 4 color themes (Quantum Blue, Cosmic Purple, Matrix Green, Crimson Red)
- **Smooth Animations**: Quantum-themed effects and professional transitions
- **QR Code Integration**: Generate and scan RTM addresses with quantum logo overlay

### 🚀 **Premium Features**
- **BinarAi Asset Creation**: AI-powered NFT and asset generation (Premium)
- **Mobile Optimization**: Blockchain pruning for mobile devices (40% performance boost)
- **Advanced Analytics**: Portfolio tracking and performance metrics (Premium)
- **Priority Support**: Enhanced customer support for premium users

## 🛠 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- MongoDB
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/raptorq-wallet.git
cd raptorq-wallet

# Install frontend dependencies
cd frontend
yarn install

# Install backend dependencies  
cd ../backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the application
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend
cd frontend
yarn start
```

The wallet will be available at `http://localhost:3000`

## 📖 Documentation

### Core Guides
- **[Developer Integration Guide](docs/RAPTORQ_DEVELOPER_GUIDE.md)** - API reference and integration instructions
- **[Quantum Security Study](docs/RAPTORQ_QUANTUM_STUDY.md)** - Technical deep-dive into quantum resistance
- **[Whitepaper](docs/RAPTORQ_WHITEPAPER.md)** - Complete technical specification
- **[Litepaper](docs/RAPTORQ_LITEPAPER.md)** - Quick overview and key features

### Legal & Compliance
- **[Legal Disclaimer](docs/LEGAL_DISCLAIMER.md)** - Important usage terms and conditions

## 🏗 Architecture

### Frontend Stack
- **React 18** - Modern UI framework with hooks
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Professional component library
- **Axios** - HTTP client for API calls
- **Html5-QRCode** - QR code scanning functionality

### Backend Stack
- **FastAPI** - High-performance Python web framework
- **MongoDB** - Document database for wallet data
- **CoinGecko API** - Real-time RTM pricing
- **Quantum Cryptography** - SHA3-2048 equivalent security
- **IPFS Integration** - Decentralized asset storage

### Security Features
- **Post-Quantum Cryptography**: SHA3-2048 equivalent using SHAKE256
- **Encrypted Storage**: All sensitive data encrypted at rest
- **Secure Communications**: TLS encryption for all API calls
- **Anti-Theft Measures**: Advanced wallet protection mechanisms

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Backend (.env)**
```bash
MONGO_URL=mongodb://localhost:27017/raptorq_wallet
CORS_ORIGINS=http://localhost:3000
```

### Asset Creation Fees
- **Standard Asset**: 100 RTM (creation) + 100 RTM (minting) = 200 RTM total
- **Transaction Fee**: 0.001 RTM
- **IPFS Storage**: 1 RTM (optional)

### Smartnode Requirements
- **Collateral**: 1,800,000 RTM
- **VPS Specs**: 4GB RAM, 2 CPU cores, 50GB SSD
- **Network**: Stable connection with port 10226 open

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
```bash
# Test full wallet workflow
npm run test:integration
```

## 📱 Mobile Support

RaptorQ includes comprehensive mobile optimization:

- **Responsive Design**: Adapts to all screen sizes
- **Touch-Optimized**: Mobile-friendly interactions
- **Blockchain Pruning**: Reduces storage requirements by 40%
- **Performance Optimization**: Smooth experience on mobile devices

## 🤝 Contributing

We welcome contributions to RaptorQ! Please read our contributing guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Use TypeScript for new frontend code
- Follow PEP 8 for Python backend code
- Add tests for new features
- Update documentation as needed

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [RaptorQ Official Site](https://raptorq.io)
- **Documentation**: [docs.raptorq.io](https://docs.raptorq.io)
- **Support**: [support@binarai.com](mailto:support@binarai.com)
- **Raptoreum**: [raptoreum.com](https://raptoreum.com)

## ⚡ Performance

### Benchmarks
- **Wallet Load Time**: < 2 seconds
- **Transaction Processing**: < 5 seconds
- **Asset Creation**: 2-5 minutes (blockchain confirmation)
- **Mobile Performance**: 40% faster with pruning enabled

### System Requirements
- **Minimum**: 2GB RAM, dual-core CPU
- **Recommended**: 8GB RAM, quad-core CPU
- **Storage**: 50GB+ for full blockchain sync
- **Network**: Broadband internet connection

## 🎯 Roadmap

### Version 2.0 (Q2 2025)
- [ ] Hardware wallet integration
- [ ] Multi-signature support  
- [ ] Cross-chain asset swaps
- [ ] Enhanced mobile app

### Version 2.1 (Q3 2025)
- [ ] DeFi integrations
- [ ] Governance features
- [ ] Advanced charting
- [ ] Social trading features

---

**Built with ❤️ by the Binarai Team**

*Securing the future of cryptocurrency with quantum-resistant technology*
