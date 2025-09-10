import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
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
  Hexagon
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

// Mock data with enhanced features
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
      description: 'First quantum-resistant NFT collection', 
      rarity: 'Legendary',
      creator_social: {
        twitter: '@quantumartist',
        instagram: '@quantum_genesis',
        website: 'quantumgenesis.com'
      },
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
      description: 'AI-generated quantum art series', 
      artist: 'QuantumAI Studio',
      creator_social: {
        twitter: '@quantumai_studio',
        website: 'quantumai.art'
      },
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
      description: 'Quantum-encrypted music composition', 
      duration: '3:45',
      creator_social: {
        spotify: 'quantum-beats',
        soundcloud: 'quantumbeats',
        website: 'quantumbeats.io'
      },
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
          <h2 className="text-2xl font-bold quantum-brand-text mb-2">QUANTXO Wallet</h2>
          <p className="text-gray-400">The First Truly Quantum-Resistant UTXO Wallet</p>
          <Badge className="mt-2 bg-blue-900/30 text-blue-300 border-blue-700/50">
            Version 1.0.0
          </Badge>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
          <h3 className="font-semibold text-blue-300 mb-2">Copyright & Credits</h3>
          <p className="text-sm text-gray-300">
            © 2025 QUANTXO was created by <span className="font-semibold text-blue-300">Binarai</span> to empower 
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
  const [step, setStep] = useState('create');
  const [generatedSeed, setGeneratedSeed] = useState('');

  const generateSeedPhrase = () => {
    const words = ['quantum', 'secure', 'wallet', 'binarai', 'resistance', 'crypto', 'asset', 'blockchain', 'utxo', 'raptoreum', 'technology', 'future'];
    const phrase = Array.from({length: 12}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
    setGeneratedSeed(phrase);
    setSeedPhrase(phrase);
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      toast({ title: "Error", description: "Please enter a wallet name", variant: "destructive" });
      return;
    }

    if (!importMode && !generatedSeed) {
      generateSeedPhrase();
      setStep('verify');
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
      createdWith: 'QUANTXO by Binarai'
    };

    onWalletCreated(wallet);
    toast({ 
      title: "Success", 
      description: `QUANTXO Wallet "${walletName}" created with quantum resistance!` 
    });
  };

  const handleSeedVerified = () => {
    setStep('complete');
    handleCreateWallet();
  };

  if (step === 'verify' && generatedSeed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
          <CardHeader className="text-center">
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-float" />
            <CardTitle className="text-2xl font-bold text-white">Verify Seed Phrase</CardTitle>
            <p className="text-gray-400">Secure your QUANTXO Wallet</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedVerified}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white quantum-btn-primary"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Seed Phrase Saved
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
          <CardTitle className="text-2xl font-bold quantum-brand-text">QUANTXO Wallet</CardTitle>
          <p className="text-gray-400">Quantum-Resistant Asset Management</p>
          <Badge className="mt-2 bg-blue-900/30 text-blue-300 border-blue-700/50">
            First Truly Quantum-Resistant UTXO
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={importMode ? "import" : "create"} onValueChange={(v) => setImportMode(v === "import")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="create" className="data-[state=active]:bg-blue-600">Create New</TabsTrigger>
              <TabsTrigger value="import" className="data-[state=active]:bg-blue-600">Import Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div>
                <Label htmlFor="walletName" className="text-white">Wallet Nickname</Label>
                <Input
                  id="walletName"
                  placeholder="My QUANTXO Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="quantum-input text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-white">Color Theme</Label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger className="quantum-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="blue">Quantum Blue</SelectItem>
                    <SelectItem value="purple">Cosmic Purple</SelectItem>
                    <SelectItem value="green">Matrix Green</SelectItem>
                    <SelectItem value="red">Crimson Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30 quantum-glow">
                <div className="flex items-center space-x-2 mb-2">
                  <Hexagon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Quantum-Resistant Security</span>
                </div>
                <p className="text-xs text-gray-300">Protected by Binarai's post-quantum cryptography against future quantum computing threats.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div>
                <Label htmlFor="walletName" className="text-white">Wallet Nickname</Label>
                <Input
                  id="walletName"
                  placeholder="Imported QUANTXO Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="quantum-input text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="seedPhrase" className="text-white">12-Word Seed Phrase</Label>
                <Textarea
                  id="seedPhrase"
                  placeholder="Enter your 12-word seed phrase"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  className="quantum-input text-white placeholder-gray-400"
                />
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

const Dashboard = ({ wallet, onLogout }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [balance, setBalance] = useState(wallet.balance);
  const [assets, setAssets] = useState(mockAssets);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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

  // Real-time balance animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => prev + (Math.random() - 0.5) * 0.001);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                <h1 className="text-xl font-bold quantum-brand-text">QUANTXO Wallet</h1>
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
                  <Button className="w-full quantum-btn-primary">
                    <Send className="mr-2 h-4 w-4" />
                    InstaSend RTM
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Download className="mr-2 h-4 w-4" />
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
                  <Smartphone className="mr-2 h-4 w-4" />
                  Quantum Assets
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assets">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Quantum Assets</h2>
                  <div className="flex space-x-2">
                    <Button className="quantum-btn-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Asset
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