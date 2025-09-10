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
  Smartphone as Phone
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data for demonstration with enhanced social features
const mockAssets = [
  {
    id: '1',
    name: 'Quantum Genesis NFT #001',
    type: 'image',
    ipfsHash: 'QmQuantumExample1',
    fileType: 'png',
    metadata: { 
      description: 'First quantum-resistant NFT collection', 
      rarity: 'Legendary',
      creator_social: {
        twitter: '@quantumartist',
        instagram: '@quantum_genesis',
        website: 'quantumgenesis.com'
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
    metadata: { 
      description: 'AI-generated quantum art series', 
      artist: 'QuantumAI Studio',
      creator_social: {
        twitter: '@quantumai_studio',
        website: 'quantumai.art'
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
    metadata: { 
      description: 'Quantum-encrypted music composition', 
      duration: '3:45',
      creator_social: {
        spotify: 'quantum-beats',
        soundcloud: 'quantumbeats',
        website: 'quantumbeats.io'
      }
    },
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Quantum Whitepaper',
    type: 'document',
    ipfsHash: 'QmQuantumExample4',
    fileType: 'pdf', 
    metadata: { 
      description: 'Quantum resistance technical paper', 
      pages: 25,
      creator_social: {
        linkedin: 'quantum-research-lab',
        website: 'quantumresearch.org'
      }
    },
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&h=200&fit=crop'
  }
];

const mockAds = [
  {
    id: 'ad1',
    title: 'Quantum DeFi Protocol',
    description: 'Experience the future of quantum-resistant DeFi',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=150&fit=crop',
    advertiser: 'QuantumDeFi',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    rtm_paid: 1500
  }
];

const AssetIcon = ({ type, fileType }) => {
  const iconProps = { size: 24, className: "text-blue-400" };
  
  if (type === 'image') return <Image {...iconProps} />;
  if (type === 'audio') return <Music {...iconProps} />;
  if (type === 'video') return <Video {...iconProps} />;
  if (type === 'document') return <FileText {...iconProps} />;
  return <FileText {...iconProps} />;
};

const SocialShareButton = ({ platform, asset, className = "" }) => {
  const handleShare = () => {
    const assetUrl = `${window.location.origin}/assets/${asset.id}`;
    const text = `Check out my quantum-resistant NFT: ${asset.name}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(assetUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(assetUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, copy to clipboard instead
        navigator.clipboard.writeText(`${text} ${assetUrl}`);
        toast({ title: "Copied to clipboard", description: "Share this on Instagram!" });
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const icons = {
    twitter: <Twitter className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleShare}
      className={`border-gray-600 text-gray-300 hover:bg-gray-800 ${className}`}
    >
      {icons[platform]}
    </Button>
  );
};

const AssetCard = ({ asset, onClick }) => (
  <Card 
    className="group cursor-pointer bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
    onClick={() => onClick(asset)}
  >
    <CardContent className="p-3">
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-800/50">
        <img 
          src={asset.thumbnail} 
          alt={asset.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <AssetIcon type={asset.type} fileType={asset.fileType} />
        </div>
        <div className="absolute top-2 left-2">
          <Badge className="bg-blue-900/80 text-blue-300 border-blue-700/50 text-xs">
            QUANTUM
          </Badge>
        </div>
      </div>
      <h4 className="font-semibold text-white text-sm truncate mb-1">{asset.name}</h4>
      <p className="text-gray-400 text-xs truncate">{asset.metadata.description}</p>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="secondary" className="text-xs bg-blue-900/30 text-blue-300 border-blue-700/50">
          {asset.fileType.toUpperCase()}
        </Badge>
        <div className="flex space-x-1">
          <SocialShareButton platform="twitter" asset={asset} />
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SeedPhraseVerification = ({ seedPhrase, onVerified }) => {
  const [verificationWords, setVerificationWords] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const words = seedPhrase.split(' ');
    // Select 3 random word positions to verify
    const randomPositions = Array.from({length: 3}, () => Math.floor(Math.random() * words.length));
    setVerificationWords(randomPositions.map(pos => ({ position: pos + 1, word: words[pos] })));
  }, [seedPhrase]);

  const handleVerification = () => {
    const isValid = verificationWords.every(({ position, word }) => 
      userInputs[position]?.toLowerCase().trim() === word.toLowerCase()
    );
    
    if (isValid) {
      setIsVerified(true);
      onVerified();
      toast({ title: "Verification Successful", description: "Seed phrase verified! Your wallet is secure." });
    } else {
      toast({ title: "Verification Failed", description: "Please check your words and try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-yellow-950/30 to-orange-950/30 rounded-lg border border-yellow-800/30">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-300">Seed Phrase Verification Required</span>
        </div>
        <p className="text-xs text-gray-300">To ensure you've safely stored your seed phrase, please enter the requested words below.</p>
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
        onClick={handleVerification}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        disabled={isVerified}
      >
        {isVerified ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Verified
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Verify Seed Phrase
          </>
        )}
      </Button>
    </div>
  );
};

const AIAssetCreator = ({ onAssetCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/ai/generate-asset`, {
        prompt,
        asset_type: assetType
      });
      
      setGeneratedAsset(response.data);
      toast({ title: "Success", description: "Quantum-secure asset generated!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate asset", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
          <Camera className="mr-2 h-4 w-4" />
          AI Create
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-400" />
            <span>Quantum AI Asset Creator</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white">Asset Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="image">NFT Image</SelectItem>
                <SelectItem value="gif">Animated GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">AI Prompt</Label>
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
            <p className="text-xs text-gray-300">Assets generated with post-quantum cryptographic signatures</p>
          </div>

          {generatedAsset && (
            <div className="space-y-2">
              <img 
                src={generatedAsset.preview_url} 
                alt="Generated asset"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button 
                onClick={() => onAssetCreated(generatedAsset)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Mint This Asset
              </Button>
            </div>
          )}

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Asset
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WalletSetup = ({ onWalletCreated }) => {
  const [walletName, setWalletName] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [step, setStep] = useState('create'); // create, verify, complete
  const [generatedSeed, setGeneratedSeed] = useState('');
  const [colorTheme, setColorTheme] = useState('blue');

  const generateSeedPhrase = () => {
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];
    const phrase = Array.from({length: 12}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
    setGeneratedSeed(phrase);
    setSeedPhrase(phrase);
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

    if (!importMode) {
      if (!generatedSeed) {
        generateSeedPhrase();
        setStep('verify');
        return;
      }
    }

    // Create wallet
    const wallet = {
      id: Math.random().toString(36).substr(2, 9),
      name: walletName,
      address: 'RPTM1' + Math.random().toString(36).substr(2, 30),
      balance: Math.random() * 1000,
      seedPhrase: seedPhrase || generatedSeed,
      colorTheme,
      twoFactorEnabled: false,
      autoLockTime: 15
    };

    onWalletCreated(wallet);
    toast({ title: "Success", description: `QUANTXO Wallet "${walletName}" ${importMode ? 'imported' : 'created'} successfully!` });
  };

  const handleSeedVerified = () => {
    setStep('complete');
    handleCreateWallet();
  };

  if (step === 'verify' && generatedSeed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-black/70 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-700/30">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verify Seed Phrase</CardTitle>
            <p className="text-gray-400">Secure your QUANTXO Wallet</p>
          </CardHeader>
          <CardContent>
            <SeedPhraseVerification seedPhrase={generatedSeed} onVerified={handleSeedVerified} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-black/70 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-700/30">
            <Wallet className="h-8 w-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">QUANTXO Wallet</CardTitle>
          <p className="text-gray-400">Quantum-Resistant Asset Management</p>
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
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-white">Color Theme</Label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600">
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
              
              <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Quantum-Resistant Security</span>
                </div>
                <p className="text-xs text-gray-300">Your wallet will be secured with post-quantum cryptography ensuring protection against future quantum computing threats.</p>
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
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="seedPhrase" className="text-white">12-Word Seed Phrase</Label>
                <div className="relative">
                  <Textarea
                    id="seedPhrase"
                    placeholder="Enter your 12-word seed phrase separated by spaces"
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pr-10"
                    type={showSeedPhrase ? "text" : "password"}
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3"
          >
            <Key className="mr-2 h-4 w-4" />
            {importMode ? 'Import Wallet' : (generatedSeed ? 'Verify & Create' : 'Create Wallet')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = ({ wallet, onLogout, onUpdateWallet }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [balance, setBalance] = useState(wallet.balance);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-lock functionality
  useEffect(() => {
    const checkAutoLock = () => {
      if (wallet.autoLockTime && Date.now() - lastActivity > wallet.autoLockTime * 60 * 1000) {
        setIsLocked(true);
      }
    };

    const interval = setInterval(checkAutoLock, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [lastActivity, wallet.autoLockTime]);

  // Real-time balance updates
  useEffect(() => {
    const updateBalance = () => {
      // Simulate small balance changes
      setBalance(prev => prev + (Math.random() - 0.5) * 0.01);
    };

    const interval = setInterval(updateBalance, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Activity tracker
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    updateActivity();
  };

  const handleSendAsset = async () => {
    setTransactionStatus({
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      type: 'send',
      status: 'pending',
      asset: selectedAsset.name,
      destination: 'RPTM1abc123...'
    });

    // Simulate transaction processing
    setTimeout(() => {
      setTransactionStatus(prev => ({ ...prev, status: 'confirmed' }));
      setTimeout(() => setTransactionStatus(null), 5000);
    }, 3000);

    toast({ title: "Transaction Initiated", description: "Quantum-secure InstaSend transaction started!" });
  };

  const unlockWallet = () => {
    // In a real app, this would require authentication
    setIsLocked(false);
    updateActivity();
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/10 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-black/70 border-gray-700/50">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-white">Wallet Locked</CardTitle>
            <p className="text-gray-400">Your QUANTXO wallet is secured</p>
          </CardHeader>
          <CardContent>
            <Button onClick={unlockWallet} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Key className="mr-2 h-4 w-4" />
              Unlock Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/10">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-700/30">
                <Wallet className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">QUANTXO Wallet</h1>
                <p className="text-sm text-gray-400">{wallet.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-green-400 animate-spin" />
                <span className="text-xs text-green-400">Live</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="pro-mode" className="text-sm text-gray-300">Pro Mode</Label>
                <Switch 
                  id="pro-mode"
                  checked={proMode} 
                  onCheckedChange={setProMode}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Advertisement Banner */}
        {mockAds.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={mockAds[0].image} alt={mockAds[0].title} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-white font-semibold">{mockAds[0].title}</h3>
                    <p className="text-gray-400 text-sm">{mockAds[0].description}</p>
                    <Badge className="mt-1 bg-purple-900/50 text-purple-300">
                      Sponsored • {mockAds[0].rtm_paid} RTM
                    </Badge>
                  </div>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-400" />
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
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <QrCode className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Balance</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white">
                      {showBalance ? `${balance.toFixed(6)} RTM` : '••••••'}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-white">
                      {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">+0.001%</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    <Send className="mr-2 h-4 w-4" />
                    Send RTM
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Download className="mr-2 h-4 w-4" />
                    Receive
                  </Button>
                </div>

                {wallet.twoFactorEnabled && (
                  <div className="pt-2">
                    <Badge className="bg-green-900/30 text-green-300 border-green-700/50">
                      <Shield className="mr-1 h-3 w-3" />
                      2FA Active
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {proMode && (
              <Card className="bg-gradient-to-br from-blue-950/20 to-cyan-950/20 border-blue-800/30">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full border-blue-700/50 text-blue-300 hover:bg-blue-900/20">
                    Smart Nodes
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-blue-700/50 text-blue-300 hover:bg-blue-900/20">
                    <Globe className="mr-2 h-3 w-3" />
                    Web Integration
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-blue-700/50 text-blue-300 hover:bg-blue-900/20">
                    <TrendingUp className="mr-2 h-3 w-3" />
                    Analytics
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800/50 mb-6">
                <TabsTrigger value="assets" className="data-[state=active]:bg-blue-600">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="advertise" className="data-[state=active]:bg-blue-600">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Advertise
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assets">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Quantum Assets</h2>
                  <div className="flex space-x-2">
                    <AIAssetCreator onAssetCreated={(asset) => toast({ title: "Asset Created", description: "Quantum-secure asset minted!" })} />
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Asset
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mockAssets.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} onClick={handleAssetClick} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-center py-8">No transactions yet</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advertise">
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Advertisement Space</CardTitle>
                    <p className="text-gray-400">Advertise your project to QUANTXO users</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                          <h3 className="text-white font-semibold mb-2">1 Day</h3>
                          <p className="text-2xl font-bold text-blue-400">50 RTM</p>
                          <p className="text-gray-400 text-sm">Header banner placement</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                          <h3 className="text-white font-semibold mb-2">1 Week</h3>
                          <p className="text-2xl font-bold text-blue-400">300 RTM</p>
                          <p className="text-gray-400 text-sm">Prime positioning</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                          <h3 className="text-white font-semibold mb-2">1 Month</h3>
                          <p className="text-2xl font-bold text-blue-400">1000 RTM</p>
                          <p className="text-gray-400 text-sm">Featured placement</p>
                        </CardContent>
                      </Card>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                      Purchase Ad Space
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Transaction Status Popup */}
      {transactionStatus && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 min-w-[300px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {transactionStatus.status === 'pending' ? (
                  <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
                <div>
                  <p className="text-white font-semibold">
                    {transactionStatus.status === 'pending' ? 'Processing...' : 'Confirmed'}
                  </p>
                  <p className="text-gray-400 text-sm">TX: {transactionStatus.id}</p>
                  <p className="text-gray-400 text-sm">{transactionStatus.asset} → {transactionStatus.destination}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Asset Detail Modal */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
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

                {selectedAsset.metadata.creator_social && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Creator Links</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedAsset.metadata.creator_social).map(([platform, handle]) => (
                        <Badge key={platform} variant="outline" className="border-blue-700/50 text-blue-300">
                          {platform}: {handle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">IPFS Hash</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs text-white bg-gray-800/50 px-2 py-1 rounded font-mono flex-1">
                      {selectedAsset.ipfsHash}
                    </code>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Share Asset</p>
                  <div className="flex space-x-2">
                    <SocialShareButton platform="twitter" asset={selectedAsset} className="flex-1" />
                    <SocialShareButton platform="facebook" asset={selectedAsset} className="flex-1" />
                    <SocialShareButton platform="instagram" asset={selectedAsset} className="flex-1" />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSendAsset}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Asset
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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

  const handleUpdateWallet = (updatedWallet) => {
    setWallet(updatedWallet);
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
                  onUpdateWallet={handleUpdateWallet}
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