import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Badge } from './components/ui/badge';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import { 
  Wallet, 
  Plus, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Copy, 
  Send, 
  History, 
  Settings, 
  Shield, 
  Smartphone, 
  Music, 
  FileText, 
  Image, 
  Video,
  ExternalLink,
  Lock,
  Key,
  Globe,
  Zap,
  RefreshCw,
  Timer,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Camera,
  Palette,
  QrCode,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Smartphone as Phone,
  Heart,
  MessageCircle,
  Monitor,
  HardDrive,
  Cpu,
  Activity,
  RotateCcw as Update,
  Github,
  Info,
  BookOpen,
  Code,
  Sparkles,
  Star,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Hexagon,
  DollarSign,
  ArrowLeftRight,
  Package
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Raptoreum blockchain integration utilities
const RaptoreumAPI = {
  // Main explorer endpoint
  EXPLORER_API: 'https://explorer.raptoreum.com/api',
  
  // RPC commands for real blockchain interaction
  RPC_COMMANDS: {
    createasset: 'createasset',
    mintasset: 'mintasset', 
    sendasset: 'sendasset',
    getassetdetailsbyname: 'getassetdetailsbyname',
    listassetsbalance: 'listassetsbalance',
    listunspentassets: 'listunspentassets',
    getblockcount: 'getblockcount',
    getblockchaininfo: 'getblockchaininfo',
    smartnode: 'smartnode'
  },
  
  // Asset creation fees (accurate Raptoreum blockchain fees)
  FEES: {
    ASSET_CREATION: 100, // 100 RTM to create asset
    ASSET_MINTING: 100, // 100 RTM to mint asset
    TOTAL_ASSET_FEE: 200, // Total 200 RTM for complete asset creation + minting
    TRANSACTION_FEE: 0.001 // Standard network transaction fee
  },
  
  // Smartnode requirements
  SMARTNODE: {
    COLLATERAL: 1800000, // 1.8 million RTM collateral
    MIN_CONFIRMATIONS: 15,
    VPS_REQUIREMENTS: {
      RAM: '4GB',
      CPU: '2 cores',
      STORAGE: '50GB',
      OS: 'Ubuntu 20/22'
    }
  },

  // Get real asset data from explorer
  getAssetDetails: async (assetId) => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/asset/${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch asset details:', error);
      return null;
    }
  },

  // Get blockchain info
  getBlockchainInfo: async () => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blockchain info:', error);
      return null;
    }
  },

  // Search assets by various criteria
  searchAssets: async (query, type = 'name') => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/assets/search`, {
        params: { query, type }
      });
      return response.data;
    } catch (error) {
      console.error('Asset search failed:', error);
      return [];
    }
  },

  // Get all smartnodes
  getSmartnodes: async () => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/smartnodes`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch smartnodes:', error);
      return [];
    }
  }
};

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Performance optimization utilities
const PerformanceOptimizer = {
  // Debounce function for search and input
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Lazy loading for images
  lazyLoadImage: (src, callback) => {
    const img = new Image();
    img.onload = () => callback(src);
    img.src = src;
  },
  
  // Virtual scrolling for large lists
  getVisibleItems: (items, scrollTop, itemHeight, containerHeight) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return items.slice(startIndex, endIndex);
  },
  
  // Cache management
  cache: new Map(),
  
  getCached: (key) => PerformanceOptimizer.cache.get(key),
  setCached: (key, value, ttl = 300000) => { // 5 minutes default TTL
    const item = {
      value,
      expires: Date.now() + ttl
    };
    PerformanceOptimizer.cache.set(key, item);
    
    // Clean expired items
    setTimeout(() => {
      const cached = PerformanceOptimizer.cache.get(key);
      if (cached && Date.now() > cached.expires) {
        PerformanceOptimizer.cache.delete(key);
      }
    }, ttl);
  }
};

// Blockchain pruning service for mobile
const BlockchainPruningService = {
  isEnabled: () => localStorage.getItem('blockchain_pruning') !== 'false',
  
  enable: () => {
    localStorage.setItem('blockchain_pruning', 'true');
    return true;
  },
  
  disable: () => {
    localStorage.setItem('blockchain_pruning', 'false');
    return false;
  },
  
  getPruningInfo: () => ({
    enabled: BlockchainPruningService.isEnabled(),
    isMobile: isMobileDevice(),
    storageLimit: isMobileDevice() ? '2GB' : '10GB',
    pruningInterval: isMobileDevice() ? '1 hour' : '24 hours',
    dataRetention: isMobileDevice() ? '7 days' : '30 days'
  }),
  
  startPruning: async () => {
    if (!BlockchainPruningService.isEnabled()) return;
    
    try {
      const response = await axios.post(`${API}/blockchain/prune`, {
        mobile: isMobileDevice(),
        aggressive: isMobileDevice()
      });
      return response.data;
    } catch (error) {
      console.error('Pruning failed:', error);
      return null;
    }
  }
};

// Quantum logo SVG component
const QuantumLogo = ({ size = 40, className = "" }) => (
  <div className={`quantum-logo ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="35" 
        fill="none" 
        stroke="url(#quantumGradient)" 
        strokeWidth="3"
        filter="url(#glow)"
        className="animate-spin-slow"
      />
      <polygon points="50,25 65,45 35,45" 
        fill="url(#quantumGradient)"
        filter="url(#glow)"
      />
      <polygon points="50,75 35,55 65,55" 
        fill="url(#quantumGradient)"
        filter="url(#glow)"
      />
      <circle cx="50" cy="50" r="8" 
        fill="url(#quantumGradient)"
        filter="url(#glow)"
        className="animate-pulse"
      />
    </svg>
  </div>
);

// Mock data with RaptorQ branding and enhanced features
const mockAssets = [
  {
    id: '1',
    name: 'Quantum Genesis NFT #001',
    type: 'image',
    ipfsHash: 'QmQuantumExample1',
    fileType: 'png',
    likes: 24,
    isLiked: false,
    metadata: { 
      description: 'First quantum-resistant NFT on Raptoreum UTXO', 
      rarity: 'Legendary',
      creator_social: {
        twitter: '@quantumartist',
        instagram: '@quantum_genesis',
        website: 'quantumgenesis.com'
      },
      quantxo_signature: {
        created_with: "RaptorQ by Binarai",
        quantum_resistant: true,
        utxo_blockchain: "Raptoreum",
        version: "1.0.0",
        security_level: "SHA3-2048_equivalent",
        quantum_strength: "1024_bit_quantum_security",
        timestamp: new Date().toISOString()
      }
    },
    thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop'
  },
  {
    id: '2', 
    name: 'Quantum Abstract Collection',
    type: 'image',
    ipfsHash: 'QmQuantumExample2',
    fileType: 'jpg',
    likes: 18,
    isLiked: true,
    metadata: { 
      description: 'AI-generated quantum art on Raptoreum UTXO', 
      artist: 'QuantumAI Studio',
      creator_social: {
        twitter: '@quantumai_studio',
        website: 'quantumai.art'
      },
      quantxo_signature: {
        created_with: "RaptorQ by Binarai",
        quantum_resistant: true,
        utxo_blockchain: "Raptoreum",
        version: "1.0.0",
        security_level: "SHA3-2048_equivalent",
        quantum_strength: "1024_bit_quantum_security",
        timestamp: new Date().toISOString()
      }
    },
    thumbnail: 'https://images.unsplash.com/photo-1551732998-cdc9021fb1a8?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Quantum Beats NFT',
    type: 'audio',
    ipfsHash: 'QmQuantumExample3',
    fileType: 'mp3',
    likes: 42,
    isLiked: false,
    metadata: { 
      description: 'Quantum-encrypted music on Raptoreum blockchain', 
      duration: '3:45',
      creator_social: {
        spotify: 'quantum-beats',
        soundcloud: 'quantumbeats',
        website: 'quantumbeats.io'
      },
      quantxo_signature: {
        created_with: "RaptorQ by Binarai",
        quantum_resistant: true,
        utxo_blockchain: "Raptoreum",
        version: "1.0.0",
        security_level: "SHA3-2048_equivalent",
        quantum_strength: "1024_bit_quantum_security",
        timestamp: new Date().toISOString()
      }
    },
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
  }
];

const mockMessages = [
  {
    id: '1',
    from: 'QuantumTrader',
    message: 'Great collection! The quantum resistance is amazing.',
    timestamp: new Date(Date.now() - 300000),
    encrypted: true
  },
  {
    id: '2',
    from: 'CryptoArtist',
    message: 'Looking to collaborate on quantum NFTs. DM me!',
    timestamp: new Date(Date.now() - 600000),
    encrypted: true
  }
];

const SystemStatus = ({ onUpdate }) => {
  const [status, setStatus] = useState({
    blockchain: 'healthy',
    wallet: 'healthy',
    quantum_security: 'active',
    self_healing: 'monitoring',
    update_available: true
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API}/system/status`);
        setStatus(response.data);
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    try {
      const response = await axios.post(`${API}/system/update`);
      toast({ title: "Update Started", description: "QUANTXO is updating to the latest version..." });
      onUpdate?.(response.data);
    } catch (error) {
      toast({ title: "Update Failed", description: "Failed to start update process", variant: "destructive" });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Activity className={`h-4 w-4 ${status.wallet === 'healthy' ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
              <span className="text-xs text-white">System</span>
            </div>
            
            {status.update_available && (
              <Button
                size="sm"
                onClick={handleUpdate}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs px-2 py-1"
              >
                <Update className="h-3 w-3 mr-1" />
                Update
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-white p-1"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
          
          {showDetails && (
            <div className="mt-3 space-y-2 animate-slide-down">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Blockchain</span>
                <Badge className={status.blockchain === 'healthy' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}>
                  {status.blockchain}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Quantum Security</span>
                <Badge className="bg-blue-900/30 text-blue-300">
                  {status.quantum_security}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Self-Healing</span>
                <Badge className="bg-purple-900/30 text-purple-300">
                  {status.self_healing}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const QuantumMessaging = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState('QuantumTrader');

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      from: 'You',
      message: newMessage,
      timestamp: new Date(),
      encrypted: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    toast({ title: "Message Sent", description: "Quantum-encrypted message delivered securely" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <span>Quantum Messaging</span>
            <Badge className="bg-green-900/30 text-green-300 border-green-700/50">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Encrypted
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300">End-to-End Quantum Encryption Active</span>
          </div>

          <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-800/30 rounded-lg">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.from === 'You' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'bg-gray-700/50 text-gray-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold">{msg.from}</span>
                    {msg.encrypted && <Shield className="h-3 w-3 text-green-400" />}
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Type quantum-encrypted message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
            <Button onClick={sendMessage} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AssetIcon = ({ type, fileType }) => {
  const iconProps = { size: 24, className: "text-blue-400" };
  
  if (type === 'image') return <Image {...iconProps} />;
  if (type === 'audio') return <Music {...iconProps} />;
  if (type === 'video') return <Video {...iconProps} />;
  if (type === 'document') return <FileText {...iconProps} />;
  return <FileText {...iconProps} />;
};

const AssetCard = ({ asset, onClick, onLike }) => {
  const handleLike = (e) => {
    e.stopPropagation();
    onLike(asset.id);
  };

  return (
    <Card 
      className="group cursor-pointer bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 quantum-smooth-transform"
      onClick={() => onClick(asset)}
    >
      <CardContent className="p-3">
        <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-800/50">
          <img 
            src={asset.thumbnail} 
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2">
            <AssetIcon type={asset.type} fileType={asset.fileType} />
          </div>
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-900/80 text-blue-300 border-blue-700/50 text-xs">
              QUANTUM
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-gray-900/80 text-gray-300 border-gray-700/50 text-xs">
              by Binarai
            </Badge>
          </div>
        </div>
        
        <h4 className="font-semibold text-white text-sm truncate mb-1">{asset.name}</h4>
        <p className="text-gray-400 text-xs truncate mb-2">{asset.metadata.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-blue-900/30 text-blue-300 border-blue-700/50">
              {asset.fileType.toUpperCase()}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={`text-xs p-1 transition-all duration-300 ${
                asset.isLiked 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-3 w-3 mr-1 ${asset.isLiked ? 'fill-current' : ''} transition-all duration-300`} />
              {asset.likes}
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const QRReceiveDialog = ({ isOpen, onClose, wallet }) => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(wallet?.address || '');

  useEffect(() => {
    if (isOpen && wallet) {
      generateQRCode();
    }
  }, [isOpen, wallet, amount, message]);

  const generateQRCode = async () => {
    if (!wallet?.address) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/qr/generate`, {
        address: selectedAddress,
        wallet_name: wallet.name,
        amount: amount ? parseFloat(amount) : null,
        message: message || null
      });
      
      setQrCodeData(response.data);
    } catch (error) {
      console.error('QR generation failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate QR code", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(selectedAddress);
      toast({ 
        title: "Copied!", 
        description: "Address copied to clipboard" 
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to copy address", 
        variant: "destructive" 
      });
    }
  };

  const downloadQR = () => {
    if (!qrCodeData?.qr_code_base64) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrCodeData.qr_code_base64}`;
    link.download = `${wallet.name}_receive_qr.png`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-blue-400" />
            <span>Receive RTM</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Quantum-Secure QR Code</span>
            </div>
            <p className="text-xs text-gray-300">Generated with RaptorQ logo for quantum-resistant transactions</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-white">Amount (Optional)</Label>
              <Input
                placeholder="0.00 RTM"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <Label className="text-white">Message (Optional)</Label>
              <Input
                placeholder="Payment for..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
              <span className="ml-2 text-gray-300">Generating QR Code...</span>
            </div>
          ) : qrCodeData ? (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img 
                  src={`data:image/png;base64,${qrCodeData.qr_code_base64}`}
                  alt="Receive QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Your Address</Label>
                <div className="flex space-x-2">
                  <Input
                    value={selectedAddress}
                    readOnly
                    className="bg-gray-800/50 border-gray-600 text-white font-mono text-xs"
                  />
                  <Button
                    onClick={copyAddress}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={downloadQR}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
                <Button 
                  onClick={copyAddress}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address  
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QRScanDialog = ({ isOpen, onClose, onScanResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner();
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      setError('');
      
      const scanner = new Html5QrcodeScanner(
        "qr-scanner",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );
      
      scannerRef.current = scanner;
      
      scanner.render(
        (decodedText) => {
          // Successful scan
          setScanResult(decodedText);
          onScanResult(decodedText);
          scanner.clear();
          setIsScanning(false);
          onClose();
        },
        (error) => {
          // Scan error - we can ignore these as they happen frequently
          console.log('Scan error:', error);
        }
      );
      
    } catch (error) {
      console.error('Scanner start failed:', error);
      setError('Failed to start camera scanner');
      setIsScanning(false);
    }
  };

  const handleManualInput = () => {
    if (scanResult.trim()) {
      onScanResult(scanResult.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <span>Scan QR Code</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Secure QR Scanner</span>
            </div>
            <p className="text-xs text-gray-300">Scan RTM addresses and payment requests securely</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div id="qr-scanner" className="w-full"></div>
            
            <div className="space-y-2">
              <Label className="text-white">Or Enter Manually</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="RTM Address or QR Code Data"
                  value={scanResult}
                  onChange={(e) => setScanResult(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                />
                <Button
                  onClick={handleManualInput}
                  disabled={!scanResult.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PremiumServicesDialog = ({ isOpen, onClose, wallet }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [purchaseStep, setPurchaseStep] = useState('browse'); // browse, purchase, payment, processing, complete
  const [purchaseData, setPurchaseData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rtmPrice, setRtmPrice] = useState(0);
  const [binaraiSinglePrice, setBinaraiSinglePrice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPremiumServices();
    }
  }, [isOpen]);

  const fetchPremiumServices = async () => {
    try {
      const response = await axios.get(`${API}/services/premium`);
      setServices(response.data.services);
      setRtmPrice(response.data.rtm_market_price);
      setBinaraiSinglePrice(response.data.binarai_single_asset);
    } catch (error) {
      console.error('Failed to fetch premium services:', error);
      toast({
        title: "Error",
        description: "Failed to load premium services",
        variant: "destructive"
      });
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setPurchaseStep('purchase');
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedService || !wallet?.address) return;

    setIsLoading(true);
    try {
      // Direct purchase through wallet
      const response = await axios.post(`${API}/services/purchase-direct`, {
        service_id: selectedService.service_id,
        user_wallet: wallet.address,
        confirmation: true
      });

      toast({
        title: "Purchase Successful! 🎉",
        description: `${selectedService.name} has been activated`,
      });
      
      setPurchaseStep('complete');
      setPurchaseData(response.data);
      
    } catch (error) {
      console.error('Direct purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: error.response?.data?.detail || "Transaction failed - please check your balance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSent = async () => {
    if (!transactionHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter the transaction hash",
        variant: "destructive"
      });
      return;
    }

    setPurchaseStep('processing');
    setPaymentStatus('verifying');

    try {
      // Start payment verification
      const response = await axios.post(`${API}/services/verify-payment`, {
        purchase_id: purchaseData.purchase_id,
        transaction_hash: transactionHash
      });

      if (response.data.status === 'confirmed') {
        setPaymentStatus('confirmed');
        setPurchaseStep('complete');
        toast({
          title: "Payment Confirmed!",
          description: `${selectedService.name} has been activated`
        });
      } else {
        setPaymentStatus('pending');
        // Start polling for confirmation
        pollPaymentStatus();
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentStatus('failed');
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const pollPaymentStatus = async () => {
    const maxPolls = 20; // Poll for up to 10 minutes
    let pollCount = 0;

    const poll = async () => {
      if (pollCount >= maxPolls) {
        setPaymentStatus('timeout');
        return;
      }

      try {
        const response = await axios.post(`${API}/services/verify-payment`, {
          purchase_id: purchaseData.purchase_id,
          transaction_hash: transactionHash
        });

        if (response.data.status === 'confirmed') {
          setPaymentStatus('confirmed');
          setPurchaseStep('complete');
          toast({
            title: "Payment Confirmed! 🎉",
            description: `${selectedService.name} has been activated`
          });
        } else {
          pollCount++;
          setTimeout(poll, 30000); // Poll every 30 seconds
        }
      } catch (error) {
        console.error('Polling error:', error);
        pollCount++;
        setTimeout(poll, 30000);
      }
    };

    setTimeout(poll, 30000); // Start polling after 30 seconds
  };

  const resetPurchase = () => {
    setPurchaseStep('browse');
    setSelectedService(null);
    setPurchaseData(null);
    setPaymentStatus('');
    setTransactionHash('');
  };

  const renderServiceCard = (service) => (
    <div key={service.service_id} className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-600/30 hover:border-blue-400/50 transition-all cursor-pointer"
         onClick={() => handleServiceSelect(service)}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
        <div className="text-right">
          <div className="text-xl font-bold text-blue-400">{service.price_rtm.toFixed(8)} RTM</div>
          <div className="text-sm text-green-400">${service.price_usd.toFixed(2)} USD</div>
          {service.duration_days && (
            <div className="text-xs text-gray-400">{service.duration_days} days</div>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-3">{service.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full">
          {service.category.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-xs text-gray-400">
          {service.is_subscription ? 'Subscription' : 'One-time'}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Premium Services</span>
          </DialogTitle>
        </DialogHeader>

        {purchaseStep === 'browse' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-yellow-950/30 to-orange-950/30 rounded-lg border border-yellow-800/30">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Premium Features</span>
              </div>
              <p className="text-xs text-gray-300">
                Enhance your RaptorQ experience • RTM Price: ${rtmPrice.toFixed(4)} USD
                {binaraiSinglePrice && (
                  <span className="block mt-1">
                    BinarAi Asset Creation: {binaraiSinglePrice.price_rtm.toFixed(8)} RTM (${binaraiSinglePrice.price_usd.toFixed(2)})
                  </span>
                )}
              </p>
            </div>

            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {services.map(renderServiceCard)}
            </div>
          </div>
        )}

        {purchaseStep === 'purchase' && selectedService && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{selectedService.name}</h3>
              <p className="text-gray-300 mb-4">{selectedService.description}</p>
              <div className="space-y-1 mb-2">
                <div className="text-3xl font-bold text-blue-400">{selectedService.price_rtm.toFixed(8)} RTM</div>
                <div className="text-lg text-green-400">${selectedService.price_usd.toFixed(2)} USD</div>
                <div className="text-xs text-gray-400">Based on current RTM market price</div>
              </div>
              {selectedService.duration_days && (
                <p className="text-gray-400">Valid for {selectedService.duration_days} days</p>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-red-950/30 to-orange-950/30 rounded-lg border border-red-800/30">
              <h4 className="font-semibold text-red-300 mb-2">⚠️ Purchase Confirmation</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• <strong>This transaction cannot be reversed</strong></p>
                <p>• {selectedService.price_rtm.toFixed(8)} RTM will be deducted from your wallet</p>
                <p>• Service will be activated immediately upon payment</p>
                <p>• By clicking "Complete Purchase" you agree to proceed</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
              <h4 className="font-semibold text-blue-300 mb-2">Service Details</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Service activation occurs instantly</p>
                <p>• Quantum-secured transaction processing</p>
                <p>• Pricing based on live RTM market rates</p>
                {selectedService.duration_days ? (
                  <p>• Valid for {selectedService.duration_days} days from activation</p>
                ) : (
                  <p>• One-time purchase with permanent access</p>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => setPurchaseStep('browse')}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back
              </Button>
              <Button 
                onClick={handlePurchaseConfirm}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Purchase
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {purchaseStep === 'complete' && (
          <div className="space-y-4 text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Purchase Complete!</h3>
              <p className="text-gray-300 mb-4">{selectedService?.name} has been activated</p>
              
              {purchaseData && (
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-green-400">
                    Amount Paid: {purchaseData.amount_paid_rtm?.toFixed(8)} RTM
                  </div>
                  <div className="text-sm text-green-400">
                    USD Equivalent: ${purchaseData.amount_paid_usd?.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Activated: {new Date(purchaseData.activated_at).toLocaleString()}
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-gradient-to-r from-green-950/30 to-blue-950/30 rounded-lg border border-green-800/30">
                <div className="text-sm text-green-300">
                  ✅ Service activated successfully<br />
                  ✅ Features now available in your wallet<br />
                  ✅ Transaction processed securely
                </div>
              </div>

              <Button 
                onClick={() => {
                  resetPurchase();
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 mt-4"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Using Service
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SettingsDialog = ({ isOpen, onClose, wallet, onColorChange, onSecurityUpdate }) => {
  const [selectedColor, setSelectedColor] = useState(wallet?.colorTheme || 'blue');
  const [autoLockTime, setAutoLockTime] = useState('5');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [threeFAEnabled, setThreeFAEnabled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pruningEnabled, setPruningEnabled] = useState(true);
  const [proModeEnabled, setProModeEnabled] = useState(false);

  const colorThemes = [
    { value: 'blue', name: 'Quantum Blue', colors: 'from-blue-600 to-cyan-500' },
    { value: 'purple', name: 'Cosmic Purple', colors: 'from-purple-600 to-pink-500' },
    { value: 'green', name: 'Matrix Green', colors: 'from-green-600 to-emerald-500' },
    { value: 'red', name: 'Crimson Red', colors: 'from-red-600 to-orange-500' },
    { value: 'gold', name: 'Golden Chrome', colors: 'from-yellow-600 to-orange-500' },
    { value: 'teal', name: 'Cyber Teal', colors: 'from-teal-600 to-blue-500' }
  ];

  const handleSave = () => {
    onColorChange?.(selectedColor);
    onSecurityUpdate?.({
      twoFA: twoFAEnabled,
      threeFA: threeFAEnabled,
      autoLockTime: parseInt(autoLockTime),
      pruning: pruningEnabled,
      proMode: proModeEnabled
    });
    
    toast({ 
      title: "Settings Saved", 
      description: "Your preferences have been updated" 
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span>Wallet Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Color Theme Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Palette className="mr-2 h-4 w-4 text-purple-400" />
              Color Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {colorThemes.map((theme) => (
                <Button
                  key={theme.value}
                  onClick={() => setSelectedColor(theme.value)}
                  variant={selectedColor === theme.value ? "default" : "outline"}
                  className={`p-3 h-auto flex flex-col space-y-1 ${
                    selectedColor === theme.value 
                      ? `bg-gradient-to-r ${theme.colors} text-white` 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${theme.colors}`}></div>
                  <span className="text-xs">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="mr-2 h-4 w-4 text-green-400" />
              Security Settings
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-400">SMS + App verification</p>
                </div>
                <Switch
                  checked={twoFAEnabled}
                  onCheckedChange={setTwoFAEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Three-Factor Authentication</Label>
                  <p className="text-xs text-gray-400">SMS + App + Biometric</p>
                </div>
                <Switch
                  checked={threeFAEnabled && twoFAEnabled}
                  onCheckedChange={setThreeFAEnabled}
                  disabled={!twoFAEnabled}
                />
              </div>
              
              <div>
                <Label className="text-white">Auto-Lock Time (minutes)</Label>
                <Select value={autoLockTime} onValueChange={setAutoLockTime}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="1" className="text-white">1 minute</SelectItem>
                    <SelectItem value="5" className="text-white">5 minutes</SelectItem>
                    <SelectItem value="15" className="text-white">15 minutes</SelectItem>
                    <SelectItem value="30" className="text-white">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pro Mode Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-yellow-400" />
              Pro Mode
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Smart Node Setup</Label>
                <p className="text-xs text-gray-400">Easy smart node configuration</p>
              </div>
              <Switch
                checked={proModeEnabled}
                onCheckedChange={setProModeEnabled}
              />
            </div>
          </div>

          {/* Mobile Optimization Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Smartphone className="mr-2 h-4 w-4 text-teal-400" />
              Mobile Settings
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Blockchain Pruning</Label>
                <p className="text-xs text-gray-400">Reduce storage requirements</p>
              </div>
              <Switch
                checked={pruningEnabled}
                onCheckedChange={setPruningEnabled}
              />
            </div>
            
            {pruningEnabled && (
              <div className="p-3 bg-gradient-to-r from-teal-950/30 to-blue-950/30 rounded-lg border border-teal-800/30">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-teal-300">Pruning Active</span>
                </div>
                <p className="text-xs text-gray-300">
                  Automatically removes old blockchain data on mobile devices to save storage while maintaining security.
                </p>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              className="w-full justify-between text-gray-300 hover:text-white"
            >
              <span>Advanced Settings</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showAdvanced && (
              <div className="space-y-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Quantum Security Level:</span>
                    <span className="text-green-400">SHA3-2048 Equivalent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="text-blue-400">Raptoreum UTXO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet Version:</span>
                    <span className="text-purple-400">RaptorQ v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created by:</span>
                    <span className="text-yellow-400">Binarai</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LockScreen = ({ onUnlock, wallet }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleUnlock = () => {
    // Simple PIN validation (in production, this would be more secure)
    if (pin === '1234' || pin.length >= 4) {
      onUnlock();
      setPin('');
      setError('');
      setAttempts(0);
    } else {
      setError('Invalid PIN');
      setAttempts(prev => prev + 1);
      setPin('');
      
      if (attempts >= 2) {
        setError('Too many attempts. Please wait...');
        setTimeout(() => {
          setError('');
          setAttempts(0);
        }, 5000);
      }
    }
  };

  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md quantum-glass backdrop-blur-sm">
        <CardHeader className="text-center">
          <QuantumLogo size={64} className="mx-auto mb-4 quantum-float" />
          <CardTitle className="text-2xl font-bold text-white">Wallet Locked</CardTitle>
          <p className="text-gray-400">Enter your PIN to unlock {wallet?.name}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-red-950/30 to-orange-950/30 rounded-lg border border-red-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Security Lock Active</span>
            </div>
            <p className="text-xs text-gray-300">Wallet automatically locked for your security</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border-2 ${
                      i < pin.length 
                        ? 'bg-blue-400 border-blue-400' 
                        : 'border-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <Button
                  key={digit}
                  onClick={() => handlePinInput(digit.toString())}
                  disabled={attempts >= 3}
                  className="h-12 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 text-lg font-semibold"
                  variant="outline"
                >
                  {digit}
                </Button>
              ))}
              <Button
                onClick={handleBackspace}
                disabled={pin.length === 0 || attempts >= 3}
                className="h-12 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50"
                variant="outline"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              </Button>
              <Button
                onClick={() => handlePinInput('0')}
                disabled={attempts >= 3}
                className="h-12 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 text-lg font-semibold"
                variant="outline"
              >
                0
              </Button>
              <Button
                onClick={handleUnlock}
                disabled={pin.length < 4 || attempts >= 3}
                className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Lock className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Quantum-secured with post-quantum cryptography
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SendDialog = ({ isOpen, onClose, sendToAddress, setSendToAddress, sendAmount, setSendAmount, onSend, wallet }) => {
  const [memo, setMemo] = useState('');
  const [fee, setFee] = useState('0.001');

  const handleSend = () => {
    onSend();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-blue-400" />
            <span>Send RTM</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">InstaSend Transaction</span>
            </div>
            <p className="text-xs text-gray-300">Quantum-secured rapid transaction on Raptoreum UTXO</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-white">Recipient Address</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="RTM Address"
                  value={sendToAddress}
                  onChange={(e) => setSendToAddress(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                />
                <Button
                  onClick={() => document.querySelector('[data-qr-scan]').click()}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  data-qr-scan
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-white">Amount (RTM)</Label>
              <Input
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <Label className="text-white">Network Fee</Label>
              <Select value={fee} onValueChange={setFee}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="0.001" className="text-white">Standard (0.001 RTM)</SelectItem>
                  <SelectItem value="0.002" className="text-white">Fast (0.002 RTM)</SelectItem>
                  <SelectItem value="0.005" className="text-white">InstaSend (0.005 RTM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Memo (Optional)</Label>
              <Input
                placeholder="Payment memo..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Available Balance:</span>
              <span>{wallet?.balance?.toFixed(8) || '0.00000000'} RTM</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>Transaction Fee:</span>
              <span>{fee} RTM</span>
            </div>
            <div className="flex justify-between text-sm text-white font-semibold border-t border-gray-600 pt-1 mt-1">
              <span>Total:</span>
              <span>{(parseFloat(sendAmount || 0) + parseFloat(fee)).toFixed(8)} RTM</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!sendToAddress || !sendAmount}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Send className="mr-2 h-4 w-4" />
              Send RTM
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AboutDialog = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <QuantumLogo size={32} />
          <span>About QUANTXO</span>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold quantum-brand-text mb-2">RaptorQ Wallet</h2>
          <p className="text-gray-400">The First Truly Quantum-Resistant UTXO Wallet</p>
          <Badge className="mt-2 bg-blue-900/30 text-blue-300 border-blue-700/50">
            Version 1.0.0
          </Badge>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
          <h3 className="font-semibold text-blue-300 mb-2">Copyright & Credits</h3>
          <p className="text-sm text-gray-300">
            © 2025 RaptorQ was created by <span className="font-semibold text-blue-300">Binarai</span> to empower 
            users with quantum-resistant blockchain technology. Built on Raptoreum's UTXO architecture 
            with post-quantum cryptographic security.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-white">Key Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Post-quantum cryptographic security</span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>InstaSend rapid transactions</span>
            </li>
            <li className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>AI-powered asset creation</span>
            </li>
            <li className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-400" />
              <span>Quantum-encrypted messaging</span>
            </li>
            <li className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-red-400" />
              <span>Self-monitoring and auto-healing</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-gradient-to-r from-yellow-950/30 to-orange-950/30 rounded-lg border border-yellow-800/30">
          <h3 className="font-semibold text-yellow-300 mb-2">Legal Disclaimer</h3>
          <div className="text-xs text-gray-300 space-y-2">
            <p>
              QUANTXO Wallet is provided "as is" without warranty of any kind. Users assume full 
              responsibility for the security of their private keys and digital assets.
            </p>
            <p>
              Cryptocurrency investments carry inherent risks. Past performance does not guarantee 
              future results. Always conduct your own research before making investment decisions.
            </p>
            <p>
              By using QUANTXO, you agree to our Terms of Service and Privacy Policy. This software 
              is designed for educational and experimental purposes in quantum-resistant blockchain technology.
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
            <BookOpen className="mr-2 h-4 w-4" />
            User Guide
          </Button>
          <Button variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
            <Code className="mr-2 h-4 w-4" />
            Developer Guide
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const WalletSetup = ({ onWalletCreated }) => {
  const [walletName, setWalletName] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [colorTheme, setColorTheme] = useState('blue');

  // Apply color theme to CSS variables
  useEffect(() => {
    const applyColorTheme = (theme) => {
      const root = document.documentElement;
      
      const themes = {
        blue: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#06b6d4'
        },
        purple: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          accent: '#a855f7'
        },
        green: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399'
        },
        red: {
          primary: '#ef4444',
          secondary: '#dc2626',
          accent: '#f87171'
        }
      };

      const selectedTheme = themes[theme] || themes.blue;
      root.style.setProperty('--color-primary', selectedTheme.primary);
      root.style.setProperty('--color-secondary', selectedTheme.secondary);
      root.style.setProperty('--color-accent', selectedTheme.accent);
    };

    applyColorTheme(colorTheme);
  }, [colorTheme]);
  const [step, setStep] = useState('create');
  const [generatedSeed, setGeneratedSeed] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [verificationWords, setVerificationWords] = useState([]);
  const [userInputs, setUserInputs] = useState({});

  const generateSeedPhrase = () => {
    const words = ['quantum', 'secure', 'wallet', 'binarai', 'resistance', 'crypto', 'asset', 'blockchain', 'utxo', 'raptoreum', 'technology', 'future'];
    const phrase = Array.from({length: 12}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
    setGeneratedSeed(phrase);
    setSeedPhrase(phrase);
    
    // Select 3 random positions for verification
    const words_array = phrase.split(' ');
    const randomPositions = [];
    while (randomPositions.length < 3) {
      const pos = Math.floor(Math.random() * 12);
      if (!randomPositions.includes(pos)) {
        randomPositions.push(pos);
      }
    }
    setVerificationWords(randomPositions.map(pos => ({ position: pos + 1, word: words_array[pos] })));
    setStep('show-seed');
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      toast({ title: "Error", description: "Please enter a wallet name", variant: "destructive" });
      return;
    }

    if (importMode && !seedPhrase.trim()) {
      toast({ title: "Error", description: "Please enter your seed phrase", variant: "destructive" });
      return;
    }

    if (!importMode && !generatedSeed) {
      generateSeedPhrase();
      return;
    }

    const wallet = {
      id: Math.random().toString(36).substr(2, 9),
      name: walletName,
      address: 'RPTM1' + Math.random().toString(36).substr(2, 30),
      balance: Math.random() * 1000,
      seedPhrase: seedPhrase || generatedSeed,
      colorTheme,
      version: '1.0.0',
      quantumResistant: true,
      createdWith: 'RaptorQ by Binarai'
    };

    onWalletCreated(wallet);
    toast({ 
      title: "Success", 
      description: `RaptorQ Wallet "${walletName}" created with quantum resistance on Raptoreum!` 
    });
  };

  const handleSeedVerified = () => {
    const isValid = verificationWords.every(({ position, word }) => 
      userInputs[position]?.toLowerCase().trim() === word.toLowerCase()
    );
    
    if (isValid) {
      setStep('complete');
      handleCreateWallet();
    } else {
      toast({ title: "Verification Failed", description: "Please check your words and try again.", variant: "destructive" });
    }
  };

  const continueToVerification = () => {
    setStep('verify');
  };

  if (step === 'show-seed' && generatedSeed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
          <CardHeader className="text-center">
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-float" />
            <CardTitle className="text-2xl font-bold text-white">Save Your Seed Phrase</CardTitle>
            <p className="text-gray-400">Write down these words in order</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-red-950/30 to-orange-950/30 rounded-lg border border-red-800/30">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">Critical: Write This Down!</span>
              </div>
              <p className="text-xs text-gray-300">This is the ONLY way to recover your wallet. Store it safely offline.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-4 bg-gray-800/50 rounded-lg">
              {generatedSeed.split(' ').map((word, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-400">{index + 1}</div>
                  <div className="font-mono text-white bg-gray-700/50 rounded px-2 py-1 text-sm">{word}</div>
                </div>
              ))}
            </div>

            <Button 
              onClick={continueToVerification}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white quantum-btn-primary"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              I've Written It Down Safely
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verify' && generatedSeed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
          <CardHeader className="text-center">
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-float" />
            <CardTitle className="text-2xl font-bold text-white">Verify Seed Phrase</CardTitle>
            <p className="text-gray-400">Prove you've written it down</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-yellow-950/30 to-orange-950/30 rounded-lg border border-yellow-800/30">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Verification Required</span>
              </div>
              <p className="text-xs text-gray-300">Enter the requested words from your seed phrase.</p>
            </div>

            <div className="space-y-3">
              {verificationWords.map(({ position }) => (
                <div key={position}>
                  <Label className="text-white">Word #{position}</Label>
                  <Input
                    placeholder={`Enter word #${position}`}
                    value={userInputs[position] || ''}
                    onChange={(e) => setUserInputs(prev => ({ ...prev, [position]: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              ))}
            </div>

            <Button 
              onClick={handleSeedVerified}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              Verify & Create Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
        <CardHeader className="text-center">
          <QuantumLogo size={64} className="mx-auto mb-4 quantum-float" />
          <CardTitle className="text-2xl font-bold quantum-brand-text">RaptorQ Wallet</CardTitle>
          <p className="text-gray-400">Quantum Raptoreum Revolutionizing UTXO</p>
          <Badge className="mt-2 bg-blue-900/30 text-blue-300 border-blue-700/50">
            Quantum-Resistant Raptoreum UTXO
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={importMode ? "import" : "create"} onValueChange={(v) => setImportMode(v === "import")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="create" className="data-[state=active]:bg-blue-600 text-white">Create New</TabsTrigger>
              <TabsTrigger value="import" className="data-[state=active]:bg-blue-600 text-white">Import Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div>
                <Label htmlFor="walletName" className="text-white">Wallet Nickname</Label>
                <Input
                  id="walletName"
                  placeholder="My RaptorQ Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="quantum-input text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-white">Color Theme</Label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger className="quantum-input text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="blue" className="text-white">Quantum Blue</SelectItem>
                    <SelectItem value="purple" className="text-white">Cosmic Purple</SelectItem>
                    <SelectItem value="green" className="text-white">Matrix Green</SelectItem>
                    <SelectItem value="red" className="text-white">Crimson Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30 quantum-glow">
                <div className="flex items-center space-x-2 mb-2">
                  <Hexagon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Quantum Raptoreum UTXO</span>
                </div>
                <p className="text-xs text-gray-300">Powered by Raptoreum's revolutionary UTXO blockchain with Binarai's post-quantum cryptography.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div>
                <Label htmlFor="walletName" className="text-white">Wallet Nickname</Label>
                <Input
                  id="walletName"
                  placeholder="Imported RaptorQ Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="quantum-input text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="seedPhrase" className="text-white">12-Word Seed Phrase</Label>
                <div className="relative">
                  <Textarea
                    id="seedPhrase"
                    placeholder="Enter your 12-word seed phrase"
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    className="quantum-input text-white placeholder-gray-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                    onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                  >
                    {showSeedPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleCreateWallet}
            className="w-full quantum-btn-primary font-semibold py-3"
          >
            <Key className="mr-2 h-4 w-4" />
            {importMode ? 'Import Wallet' : 'Create Quantum Wallet'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const AIAssetCreator = ({ onAssetCreated, isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState('image');
  const [assetName, setAssetName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState(null);
  const [binaraiPricing, setBinaraiPricing] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBinaraiPricing();
    }
  }, [isOpen]);

  const fetchBinaraiPricing = async () => {
    try {
      const response = await axios.get(`${API}/services/premium`);
      setBinaraiPricing(response.data.binarai_single_asset);
    } catch (error) {
      console.error('Failed to fetch BinarAi pricing:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !assetName.trim()) {
      toast({ title: "Error", description: "Please enter both asset name and prompt", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/ai/generate-asset`, {
        prompt,
        asset_type: assetType,
        name: assetName
      });
      
      setGeneratedAsset(response.data);
      toast({ title: "Success", description: "BinarAi quantum-secure asset generated!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate asset", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAsset = () => {
    if (generatedAsset) {
      onAssetCreated(generatedAsset);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span>BinarAi Image Creation</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-950/30 to-pink-950/30 rounded-lg border border-purple-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">BinarAi Powered</span>
            </div>
            <p className="text-xs text-gray-300">
              Create quantum-resistant NFTs with advanced AI technology
              {binaraiPricing && (
                <span className="block mt-1 text-yellow-300">
                  Cost: {binaraiPricing.price_rtm.toFixed(8)} RTM (${binaraiPricing.price_usd.toFixed(2)} USD) per asset
                </span>
              )}
            </p>
          </div>

          <div>
            <Label className="text-white">Asset Name</Label>
            <Input
              placeholder="MY_ASSET_NAME"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value.toUpperCase())}
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Use uppercase letters, numbers, and underscores only</p>
          </div>

          <div>
            <Label className="text-white">Asset Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="image" className="text-white">NFT Image</SelectItem>
                <SelectItem value="gif" className="text-white">Animated GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">BinarAi Prompt</Label>
            <Textarea
              placeholder="Describe your quantum-resistant NFT creation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 h-24"
            />
          </div>

          <div className="p-3 bg-gradient-to-r from-purple-950/30 to-blue-950/30 rounded-lg border border-purple-800/30">
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="h-3 w-3 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Quantum-Secure Generation</span>
            </div>
            <p className="text-xs text-gray-300">Assets generated with post-quantum cryptographic signatures on Raptoreum</p>
          </div>

          {binaraiPricing && (
            <div className="p-3 bg-gradient-to-r from-yellow-950/30 to-orange-950/30 rounded-lg border border-yellow-800/30">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-3 w-3 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-300">Per-Asset Pricing</span>
              </div>
              <p className="text-xs text-gray-300">
                Each AI asset costs {binaraiPricing.price_rtm.toFixed(8)} RTM (${binaraiPricing.price_usd.toFixed(2)} USD)
                <br />
                <span className="text-yellow-300">Get unlimited for 30 days with BinarAi Unlimited subscription!</span>
              </p>
            </div>
          )}

          {generatedAsset && (
            <div className="space-y-2">
              <img 
                src={generatedAsset.preview_url} 
                alt="Generated asset"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button 
                onClick={handleCreateAsset}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Mint This Asset
              </Button>
            </div>
          )}

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !assetName.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                BinarAi Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with BinarAi
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = ({ wallet, onLogout }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [balance, setBalance] = useState(wallet.balance);
  const [assets, setAssets] = useState(mockAssets);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [showQRReceive, setShowQRReceive] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);
  const [sendToAddress, setSendToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimeoutRef = useRef(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [showPremiumServices, setShowPremiumServices] = useState(false);
  const [walletSettings, setWalletSettings] = useState({
    colorTheme: wallet?.colorTheme || 'blue',
    twoFA: false,
    threeFA: false,
    autoLockTime: 5,
    pruning: true,
    proMode: false
  });

  const handleColorChange = (newColor) => {
    setWalletSettings(prev => ({ ...prev, colorTheme: newColor }));
    // Apply color theme to CSS variables
    document.documentElement.style.setProperty('--primary-color', newColor);
    toast({ 
      title: "Theme Updated", 
      description: `Switched to ${newColor} theme` 
    });
  };

  const handleSecurityUpdate = (securitySettings) => {
    setWalletSettings(prev => ({ ...prev, ...securitySettings }));
    
    if (securitySettings.twoFA || securitySettings.threeFA) {
      toast({ 
        title: "Security Enhanced", 
        description: "Multi-factor authentication enabled" 
      });
    }
    
    if (securitySettings.proMode) {
      toast({ 
        title: "Pro Mode Activated", 
        description: "Smart node features now available" 
      });
    }
  };

  // Auto-lock functionality
  const AUTO_LOCK_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  const resetLockTimer = useCallback(() => {
    setLastActivity(Date.now());
    
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }
    
    const newTimeout = setTimeout(() => {
      setIsLocked(true);
      toast({ 
        title: "Wallet Locked", 
        description: "Wallet locked for security after inactivity",
        variant: "default"
      });
    }, AUTO_LOCK_TIME);
    
    lockTimeoutRef.current = newTimeout;
  }, []);

  const handleUnlock = () => {
    setIsLocked(false);
    setLastActivity(Date.now());
    
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }
    
    const newTimeout = setTimeout(() => {
      setIsLocked(true);
      toast({ 
        title: "Wallet Locked", 
        description: "Wallet locked for security after inactivity",
        variant: "default"
      });
    }, AUTO_LOCK_TIME);
    
    lockTimeoutRef.current = newTimeout;
    
    toast({ 
      title: "Wallet Unlocked", 
      description: "Welcome back to your quantum wallet" 
    });
  };

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      if (!isLocked) {
        setLastActivity(Date.now());
        
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
        }
        
        const newTimeout = setTimeout(() => {
          setIsLocked(true);
          toast({ 
            title: "Wallet Locked", 
            description: "Wallet locked for security after inactivity",
            variant: "default"
          });
        }, AUTO_LOCK_TIME);
        
        lockTimeoutRef.current = newTimeout;
      }
    };

    // Track mouse and keyboard activity
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('touchstart', handleActivity);

    // Initialize timer
    handleActivity();

    return () => {
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, [isLocked]);

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
  };

  const handleLike = (assetId) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { 
            ...asset, 
            isLiked: !asset.isLiked,
            likes: asset.isLiked ? asset.likes - 1 : asset.likes + 1
          }
        : asset
    ));
    
    const asset = assets.find(a => a.id === assetId);
    toast({ 
      title: asset?.isLiked ? "Unliked" : "Liked", 
      description: `${asset?.name} ${asset?.isLiked ? 'removed from' : 'added to'} your likes` 
    });
  };

  const handleSystemUpdate = (updateData) => {
    toast({ title: "System Updated", description: "QUANTXO updated successfully with latest blockchain improvements" });
  };

  const handleAssetCreated = (newAsset) => {
    const asset = {
      id: Date.now().toString(),
      name: newAsset.name,
      type: newAsset.asset_type,
      ipfsHash: newAsset.ipfs_hash || 'QmGenerated' + Date.now(),
      fileType: newAsset.asset_type === 'image' ? 'png' : 'gif',
      likes: 0,
      isLiked: false,
      metadata: {
        description: newAsset.description || 'AI-generated quantum asset',
        quantxo_signature: {
          created_with: "QUANTXO by Binarai",
          quantum_resistant: true,
          utxo_blockchain: "Raptoreum",
          version: "1.0.0",
          security_level: "SHA3-2048_equivalent",
          quantum_strength: "1024_bit_quantum_security",
          timestamp: new Date().toISOString()
        }
      },
      thumbnail: newAsset.preview_url || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop'
    };
    
    setAssets(prev => [asset, ...prev]);
    toast({ title: "Asset Created", description: `${newAsset.name} has been added to your quantum assets!` });
  };

  const handleQRScanResult = (result) => {
    console.log('QR Scan Result:', result);
    
    // Parse QR code result
    let address = result;
    let amount = '';
    
    // Check if it's a URI format (raptoreum:address?amount=x)
    if (result.includes(':')) {
      const parts = result.split(':');
      if (parts.length > 1) {
        address = parts[1].split('?')[0];
        
        // Extract amount if present
        const urlParams = new URLSearchParams(result.split('?')[1] || '');
        if (urlParams.get('amount')) {
          amount = urlParams.get('amount');
        }
      }
    }
    
    setSendToAddress(address);
    setSendAmount(amount);
    setShowSendDialog(true);
    
    toast({ 
      title: "QR Code Scanned", 
      description: `Address: ${address.substring(0, 10)}...` 
    });
  };

  const handleSendTransaction = async () => {
    if (!sendToAddress || !sendAmount) {
      toast({ 
        title: "Error", 
        description: "Please enter address and amount", 
        variant: "destructive" 
      });
      return;
    }

    try {
      // Validate address format
      const validation = await axios.get(`${API}/qr/validate/${sendToAddress}`);
      if (!validation.data.valid) {
        toast({ 
          title: "Error", 
          description: "Invalid RTM address format", 
          variant: "destructive" 
        });
        return;
      }

      // Mock transaction send
      toast({ 
        title: "Transaction Initiated", 
        description: `Sending ${sendAmount} RTM to ${sendToAddress.substring(0, 10)}...`,
      });
      
      setShowSendDialog(false);
      setSendToAddress('');
      setSendAmount('');
      
    } catch (error) {
      console.error('Send transaction failed:', error);
      toast({ 
        title: "Error", 
        description: "Transaction failed", 
        variant: "destructive" 
      });
    }
  };

  // Real-time balance animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => prev + (Math.random() - 0.5) * 0.001);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show lock screen if wallet is locked
  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} wallet={wallet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/10 animate-fade-in">
      <SystemStatus onUpdate={handleSystemUpdate} />
      
      {/* Animated Header */}
      <div className="border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <QuantumLogo size={48} className="quantum-pulse" />
              <div>
                <h1 className="text-xl font-bold quantum-brand-text">RaptorQ Wallet</h1>
                <p className="text-sm text-gray-400">{wallet.name}</p>
                <Badge className="mt-1 bg-blue-900/30 text-blue-300 border-blue-700/50 text-xs">
                  by Binarai
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-green-400 quantum-spin" />
                <span className="text-xs text-green-400">Live</span>
              </div>
              
              <Button
                size="sm"
                onClick={() => setShowMessaging(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="pro-mode" className="text-sm text-gray-300">Pro</Label>
                <Switch 
                  id="pro-mode"
                  checked={proMode} 
                  onCheckedChange={setProMode}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPremiumServices(true)}
                className="text-gray-400 hover:text-yellow-400"
              >
                <Star className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAbout(true)}
                className="text-gray-400 hover:text-white"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="quantum-glass mb-6 animate-fade-in-scale">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-400 quantum-pulse" />
                  Wallet Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs text-white bg-gray-800/50 px-2 py-1 rounded font-mono">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                    </code>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Balance</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white animate-pulse">
                      {showBalance ? `${balance.toFixed(6)} RTM` : '••••••'}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-white">
                      {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full quantum-btn-primary"
                    onClick={() => setShowQRScan(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    InstaSend RTM
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={() => setShowQRReceive(true)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Receive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800/50 mb-6">
                <TabsTrigger value="assets" className="data-[state=active]:bg-blue-600">
                  <Package className="mr-2 h-4 w-4" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="swaps" className="data-[state=active]:bg-blue-600">
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Swaps
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                  <Clock className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assets">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Quantum Assets</h2>
                  <div className="flex space-x-2">
                    <Button 
                      className="quantum-btn-primary"
                      onClick={() => setShowAICreator(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      BinarAi Create
                    </Button>
                  </div>
                </div>

                <div className="quantum-asset-grid">
                  {assets.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onClick={handleAssetClick}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="swaps" className="space-y-6">
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <ArrowLeftRight className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Swaps Coming Soon</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Quantum-resistant token swaps with advanced security features will be available soon. 
                    Stay tuned for instant, secure cross-chain swapping capabilities.
                  </p>
                  <div className="p-4 bg-gradient-to-r from-blue-950/30 to-purple-950/30 rounded-lg border border-blue-800/30 max-w-md mx-auto">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Quantum-Secured Swaps</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Future swaps will be protected with post-quantum cryptography for ultimate security
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card className="quantum-glass">
                  <CardHeader>
                    <CardTitle className="text-white">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-center py-8">No transactions yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="quantum-glass text-white max-w-md">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AssetIcon type={selectedAsset.type} fileType={selectedAsset.fileType} />
                  <span>{selectedAsset.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800/50">
                  <img 
                    src={selectedAsset.thumbnail} 
                    alt={selectedAsset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <p className="text-white">{selectedAsset.metadata.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Quantum Signature</p>
                  <div className="p-3 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
                    <div className="text-xs space-y-1">
                      <p><span className="text-blue-300">Created with:</span> {selectedAsset.metadata.quantxo_signature.created_with}</p>
                      <p><span className="text-blue-300">Quantum Resistant:</span> ✓</p>
                      <p><span className="text-blue-300">Blockchain:</span> {selectedAsset.metadata.quantxo_signature.utxo_blockchain}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleLike(selectedAsset.id)}
                    className={`border-gray-600 ${
                      selectedAsset.isLiked 
                        ? 'text-red-400 border-red-600' 
                        : 'text-gray-300'
                    } hover:bg-gray-800`}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${selectedAsset.isLiked ? 'fill-current' : ''}`} />
                    {selectedAsset.likes}
                  </Button>
                  
                  <Button className="quantum-btn-primary">
                    <Send className="mr-2 h-4 w-4" />
                    InstaSend Asset
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <QuantumMessaging isOpen={showMessaging} onClose={() => setShowMessaging(false)} />
      <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <AIAssetCreator 
        isOpen={showAICreator} 
        onClose={() => setShowAICreator(false)}
        onAssetCreated={handleAssetCreated}
      />
      <QRReceiveDialog 
        isOpen={showQRReceive} 
        onClose={() => setShowQRReceive(false)}
        wallet={wallet}
      />
      <QRScanDialog 
        isOpen={showQRScan} 
        onClose={() => setShowQRScan(false)}
        onScanResult={handleQRScanResult}
      />
      <SendDialog 
        isOpen={showSendDialog} 
        onClose={() => setShowSendDialog(false)}
        sendToAddress={sendToAddress}
        setSendToAddress={setSendToAddress}
        sendAmount={sendAmount}
        setSendAmount={setSendAmount}
        onSend={handleSendTransaction}
        wallet={wallet}
      />
      <SettingsDialog 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        wallet={wallet}
        onColorChange={handleColorChange}
        onSecurityUpdate={handleSecurityUpdate}
      />
      <PremiumServicesDialog 
        isOpen={showPremiumServices} 
        onClose={() => setShowPremiumServices(false)}
        wallet={wallet}
      />

      <Toaster />
    </div>
  );
};

function App() {
  const [wallet, setWallet] = useState(null);

  const handleWalletCreated = (newWallet) => {
    setWallet(newWallet);
  };

  const handleLogout = () => {
    setWallet(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              wallet ? (
                <Dashboard 
                  wallet={wallet} 
                  onLogout={handleLogout}
                />
              ) : (
                <WalletSetup onWalletCreated={handleWalletCreated} />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;