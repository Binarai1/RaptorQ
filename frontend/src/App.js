import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  Zap
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock data for demonstration
const mockAssets = [
  {
    id: '1',
    name: 'Raptoreum NFT #001',
    type: 'image',
    ipfsHash: 'QmExample1',
    fileType: 'png',
    metadata: { description: 'First Raptoreum NFT', rarity: 'Legendary' },
    thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop'
  },
  {
    id: '2', 
    name: 'Digital Art Collection',
    type: 'image',
    ipfsHash: 'QmExample2',
    fileType: 'jpg',
    metadata: { description: 'Abstract digital art', artist: 'CryptoArtist' },
    thumbnail: 'https://images.unsplash.com/photo-1551732998-cdc9021fb1a8?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Music Track NFT',
    type: 'audio',
    ipfsHash: 'QmExample3', 
    fileType: 'mp3',
    metadata: { description: 'Original music composition', duration: '3:45' },
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Document Asset',
    type: 'document',
    ipfsHash: 'QmExample4',
    fileType: 'pdf', 
    metadata: { description: 'Important document', pages: 25 },
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&h=200&fit=crop'
  }
];

const AssetIcon = ({ type, fileType }) => {
  const iconProps = { size: 24, className: "text-red-400" };
  
  if (type === 'image') return <Image {...iconProps} />;
  if (type === 'audio') return <Music {...iconProps} />;
  if (type === 'video') return <Video {...iconProps} />;
  if (type === 'document') return <FileText {...iconProps} />;
  return <FileText {...iconProps} />;
};

const AssetCard = ({ asset, onClick }) => (
  <Card 
    className="group cursor-pointer bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
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
      </div>
      <h4 className="font-semibold text-white text-sm truncate mb-1">{asset.name}</h4>
      <p className="text-gray-400 text-xs truncate">{asset.metadata.description}</p>
      <Badge variant="secondary" className="mt-2 text-xs bg-red-900/30 text-red-300 border-red-700/50">
        {asset.fileType.toUpperCase()}
      </Badge>
    </CardContent>
  </Card>
);

const WalletSetup = ({ onWalletCreated }) => {
  const [walletName, setWalletName] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  const generateSeedPhrase = () => {
    // Mock seed phrase generation
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];
    const phrase = Array.from({length: 12}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
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

    if (!importMode && !seedPhrase) {
      generateSeedPhrase();
    }

    // Mock wallet creation
    const wallet = {
      id: Math.random().toString(36).substr(2, 9),
      name: walletName,
      address: 'RTM1' + Math.random().toString(36).substr(2, 30),
      balance: Math.random() * 1000,
      seedPhrase: seedPhrase || Array.from({length: 12}, () => 'word').join(' ')
    };

    onWalletCreated(wallet);
    toast({ title: "Success", description: `Wallet "${walletName}" ${importMode ? 'imported' : 'created'} successfully!` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-black/70 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-700/30">
            <Wallet className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Talon Wallet</CardTitle>
          <p className="text-gray-400">Secure Raptoreum Asset Management</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={importMode ? "import" : "create"} onValueChange={(v) => setImportMode(v === "import")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="create" className="data-[state=active]:bg-red-600">Create New</TabsTrigger>
              <TabsTrigger value="import" className="data-[state=active]:bg-red-600">Import Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div>
                <Label htmlFor="walletName" className="text-white">Wallet Nickname</Label>
                <Input
                  id="walletName"
                  placeholder="My Raptoreum Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="p-4 bg-gradient-to-r from-red-950/30 to-orange-950/30 rounded-lg border border-red-800/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Quantum-Resistant Security</span>
                </div>
                <p className="text-xs text-gray-300">Your wallet will be secured with post-quantum cryptography ensuring protection against future quantum computing threats.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div>
                <Label htmlFor="walletName" className="text-white">Wallet Nickname</Label>
                <Input
                  id="walletName"
                  placeholder="Imported Wallet"
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
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3"
          >
            <Key className="mr-2 h-4 w-4" />
            {importMode ? 'Import Wallet' : 'Create Wallet'}
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

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
  };

  const handleSendAsset = () => {
    toast({ title: "Coming Soon", description: "Asset transfer functionality will be available soon!" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950/10">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-700/30">
                <Wallet className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Talon Wallet</h1>
                <p className="text-sm text-gray-400">{wallet.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="pro-mode" className="text-sm text-gray-300">Pro Mode</Label>
                <Switch 
                  id="pro-mode"
                  checked={proMode} 
                  onCheckedChange={setProMode}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-red-400" />
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
                    <span className="text-lg font-bold text-white">
                      {showBalance ? `${wallet.balance.toFixed(2)} RTM` : '••••••'}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-white">
                      {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                    <Send className="mr-2 h-4 w-4" />
                    Send RTM
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Download className="mr-2 h-4 w-4" />
                    Receive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {proMode && (
              <Card className="bg-gradient-to-br from-red-950/20 to-orange-950/20 border-red-800/30">
                <CardHeader>
                  <CardTitle className="text-red-300 flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full border-red-700/50 text-red-300 hover:bg-red-900/20">
                    Smart Nodes
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-red-700/50 text-red-300 hover:bg-red-900/20">
                    <Globe className="mr-2 h-3 w-3" />
                    Web Integration
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800/50 mb-6">
                <TabsTrigger value="assets" className="data-[state=active]:bg-red-600">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-red-600">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assets">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">My Assets</h2>
                  <div className="flex space-x-2">
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
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
            </Tabs>
          </div>
        </div>
      </div>

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

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSendAsset}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
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

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              wallet ? (
                <Dashboard wallet={wallet} onLogout={handleLogout} />
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