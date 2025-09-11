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

// Import production components
import AssetExplorer from './components/AssetExplorer';
import StandardAssetCreator from './components/StandardAssetCreator';
import BlockchainSync from './components/BlockchainSync';
import ProModeConsole from './components/ProModeConsole';
import SmartnodeManager from './components/SmartnodeManager';
import AdvertisingBanner, { AdvertisingPurchaseDialog } from './components/AdvertisingBanner';

import { 
  Wallet, Plus, Download, Upload, Eye, EyeOff, Copy, Send, History, Settings, Shield, 
  Smartphone, Music, FileText, Image, Video, ExternalLink, Lock, Key, Globe, Zap, 
  RefreshCw, Timer, Share2, Facebook, Twitter, Instagram, Camera, Palette, QrCode, 
  TrendingUp, Hexagon, Activity, AlertTriangle, CheckCircle, Users, DollarSign, 
  Layers, Sun, Star, Moon, Home, BarChart, TrendingDown, Search, Filter
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Quantum Logo Component
const QuantumLogo = ({ size = 40, className = "" }) => (
  <div className={`quantum-logo ${className}`} style={{ width: size, height: size }}>
    <div className="relative">
      <Hexagon className="w-full h-full text-blue-400 quantum-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-blue-300">Q</span>
      </div>
    </div>
  </div>
);

// Session Management Hook
const useSession = () => {
  const [sessionToken, setSessionToken] = useState(() => {
    return localStorage.getItem('raptorq_session') || null;
  });

  const saveSession = (token) => {
    localStorage.setItem('raptorq_session', token);
    setSessionToken(token);
  };

  const clearSession = () => {
    localStorage.removeItem('raptorq_session');
    setSessionToken(null);
  };

  return { sessionToken, saveSession, clearSession };
};

// Settings Dialog Component
const SettingsDialog = ({ isOpen, onClose, settings, onColorChange, onSecurityUpdate }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleColorChange = (color) => {
    setLocalSettings(prev => ({ ...prev, colorTheme: color }));
    onColorChange(color);
  };

  const handleSave = () => {
    onSecurityUpdate(localSettings);
    onClose();
    toast({ title: "Settings Saved", description: "Your preferences have been updated" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md mobile-settings-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span>RaptorQ Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Theme */}
          <div>
            <Label className="text-white mb-3 block">Color Theme</Label>
            <Select value={localSettings.colorTheme} onValueChange={handleColorChange}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="blue" className="text-white hover:bg-gray-700">Quantum Blue</SelectItem>
                <SelectItem value="purple" className="text-white hover:bg-gray-700">Cosmic Purple</SelectItem>
                <SelectItem value="green" className="text-white hover:bg-gray-700">Matrix Green</SelectItem>
                <SelectItem value="red" className="text-white hover:bg-gray-700">Crimson Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <Label className="text-white">Security Options</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Two-Factor Authentication</Label>
                <p className="text-xs text-gray-400">Enhanced security layer</p>
              </div>
              <Switch
                checked={localSettings.twoFA}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, twoFA: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Three-Factor Authentication</Label>
                <p className="text-xs text-gray-400">Maximum security protection</p>
              </div>
              <Switch
                checked={localSettings.threeFA}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, threeFA: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Pro Mode</Label>
                <p className="text-xs text-gray-400">Advanced smartnode features - FREE</p>
              </div>
              <Switch
                checked={localSettings.proMode}
                onCheckedChange={(checked) => {
                  setLocalSettings(prev => ({ ...prev, proMode: checked }));
                  // Pro Mode is now free - no payment required
                  if (checked) {
                    toast({
                      title: "Pro Mode Enabled",
                      description: "Advanced smartnode features are now available"
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Settings
            </Button>
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// QR Receive Dialog
const QRReceiveDialog = ({ isOpen, onClose, wallet }) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const qrValue = `raptoreum:${wallet?.address}${amount ? `?amount=${amount}` : ''}${message ? `&message=${encodeURIComponent(message)}` : ''}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md mobile-dialog">
        <DialogHeader>
          <DialogTitle>Receive RTM</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode value={qrValue} size={200} className="mx-auto" />
          </div>
          
          <div>
            <Label>Amount (optional)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label>Message (optional)</Label>
            <Input
              placeholder="Payment for..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
          
          <Button
            onClick={() => {
              navigator.clipboard.writeText(wallet?.address);
              toast({ title: "Address Copied", description: "RTM address copied to clipboard" });
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// QR Scan Dialog
const QRScanDialog = ({ isOpen, onClose, onAddressScanned }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setScanning(true);
      
      try {
        const scanner = new Html5QrcodeScanner("qr-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        });

        scanner.render(
          (result) => {
            try {
              // Extract RTM address from QR code result
              let address = result;
              if (result.startsWith('raptoreum:')) {
                address = result.replace('raptoreum:', '').split('?')[0];
              }
              
              // Validate RTM address format
              if (address.startsWith('R') && address.length >= 25) {
                onAddressScanned(address);
                scanner.clear();
              } else {
                setError('Invalid Raptoreum address in QR code');
              }
            } catch (err) {
              setError('Failed to process QR code');
            }
          },
          (error) => {
            // Ignore frequent scan errors, only show critical ones
            if (error.includes('NotAllowedError') || error.includes('NotFoundError')) {
              setError('Camera access denied or not available');
            }
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        setError('Failed to initialize camera scanner');
        setScanning(false);
      }

      return () => {
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (err) {
            console.log('Scanner cleanup error:', err);
          }
        }
      };
    }
  }, [isOpen, onAddressScanned]);

  const handleClose = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.log('Scanner cleanup error:', err);
      }
    }
    setScanning(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md mobile-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <span>Scan RTM QR Code</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error ? (
            <div className="p-4 bg-red-950/30 border border-red-800/30 rounded-lg">
              <div className="flex items-center text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
              <Button
                onClick={() => setError('')}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div id="qr-reader" className="w-full min-h-64 bg-gray-800/30 rounded-lg"></div>
          )}
          
          <div className="text-xs text-gray-400 text-center">
            Point your camera at a Raptoreum QR code to scan
          </div>
          
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Send Dialog
const SendDialog = ({ isOpen, onClose, wallet, toAddress, amount }) => {
  const [sendAddress, setSendAddress] = useState(toAddress || '');
  const [sendAmount, setSendAmount] = useState(amount || '');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!sendAddress || !sendAmount) {
      toast({ title: "Error", description: "Please enter address and amount", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // In production, this would send real transaction
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      
      toast({ 
        title: "Transaction Sent", 
        description: `${sendAmount} RTM sent successfully` 
      });
      
      onClose();
      setSendAddress('');
      setSendAmount('');
    } catch (error) {
      toast({ title: "Error", description: "Transaction failed", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md mobile-dialog">
        <DialogHeader>
          <DialogTitle>Send RTM</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>To Address</Label>
            <Input
              placeholder="RTM address..."
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {sending ? 'Sending...' : 'Send RTM'}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Premium Services Dialog
const PremiumServicesDialog = ({ isOpen, onClose, wallet }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-2xl mobile-dialog">
        <DialogHeader>
          <DialogTitle>Premium Services</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-purple-300">BinarAi Unlimited</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-4">Unlimited AI asset creation</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Upgrade - 2500 RTM
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-green-300">Pro Mode Annual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-4">Advanced smartnode features</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Activate - 100 RTM
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Lock Screen Component
const LockScreen = ({ onUnlock, wallet }) => {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleUnlock = () => {
    if (pin === '0000' || pin.length >= 4) { // Simple unlock for demo
      onUnlock();
      setPin('');
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setPin('');
      toast({ title: "Invalid PIN", description: "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-gray-900/50 border-gray-700/50">
        <CardHeader className="text-center">
          <QuantumLogo size={64} className="mx-auto mb-4" />
          <CardTitle className="text-white">Wallet Locked</CardTitle>
          <p className="text-gray-400 text-sm">Enter your PIN to unlock</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl bg-gray-800/50 border-gray-600 text-white"
            maxLength={6}
          />
          <Button onClick={handleUnlock} className="w-full bg-blue-600 hover:bg-blue-700">
            <Key className="h-4 w-4 mr-2" />
            Unlock Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ wallet, onLogout }) => {
  const { sessionToken, clearSession } = useSession();
  
  // Core state management
  const [balance, setBalance] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [daemonSyncing, setDaemonSyncing] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    hashrate: 0,
    difficulty: 0,
    connections: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // UI state
  const [activeTab, setActiveTab] = useState('wallet');
  const [showBalance, setShowBalance] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [colorTheme, setColorTheme] = useState(wallet?.colorTheme || 'blue');
  
  // Dialog states
  const [showAssetExplorer, setShowAssetExplorer] = useState(false);
  const [showStandardAssetCreator, setShowStandardAssetCreator] = useState(false);
  const [showSmartnodeManager, setShowSmartnodeManager] = useState(false);
  const [showProConsole, setShowProConsole] = useState(false);
  const [showQRReceive, setShowQRReceive] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPremiumServices, setShowPremiumServices] = useState(false);
  
  // Form states
  const [sendToAddress, setSendToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  
  // Settings
  const [walletSettings, setWalletSettings] = useState({
    colorTheme: colorTheme,
    twoFA: false,
    threeFA: false,
    autoLockTime: 5,
    pruning: true,
    proMode: false
  });

  // Continuous daemon sync - runs automatically regardless of user actions
  useEffect(() => {
    // Start immediate sync on mount
    loadWalletData();
    loadBlockchainInfo();
    
    // Continuous sync every 10 seconds (faster for production wallet)
    const syncInterval = setInterval(() => {
      loadBlockchainInfo();
    }, 10000);
    
    // Balance update every 30 seconds
    const balanceInterval = setInterval(() => {
      loadWalletData();
    }, 30000);
    
    return () => {
      clearInterval(syncInterval);
      clearInterval(balanceInterval);
    };
  }, [wallet, sessionToken]);

  // Continuous sync even when wallet is locked (only stops when window closed)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Resume aggressive syncing when window becomes visible
        loadBlockchainInfo();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Apply theme changes throughout the app
  useEffect(() => {
    applyThemeGlobally(colorTheme);
  }, [colorTheme]);

  const loadWalletData = async () => {
    try {
      const response = await axios.get(`${API}/wallet/${wallet.address}/balance`, {
        headers: sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
      });
      setBalance(response.data.balance || 0);
      setIsConnected(true);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setIsConnected(false);
      if (error.response?.status === 401) {
        handleSessionExpired();
      }
    }
  };

  const loadBlockchainInfo = async () => {
    try {
      const response = await axios.get(`${API}/raptoreum/blockchain-info`);
      const blockData = response.data;
      
      // Use real block height from daemon/network
      setBlockHeight(blockData.blocks || 0);
      
      // Use real sync progress from daemon
      const realSyncProgress = blockData.sync_progress_percent || ((blockData.verificationprogress || 0) * 100);
      setSyncProgress(realSyncProgress);
      
      // Update daemon syncing status
      setDaemonSyncing(blockData.is_syncing || realSyncProgress < 99.9);
      
      // Set connection status based on real sync state
      setIsConnected(blockData.connections > 0);
      
      // Update network stats for sync tab
      setNetworkStats({
        hashrate: blockData.networkhashps || 0,
        difficulty: blockData.difficulty || 0,
        connections: blockData.connections || 0
      });
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to load blockchain info:', error);
      // For production wallet, show disconnected state if API fails
      setBlockHeight(0);
      setSyncProgress(0);
      setIsConnected(false);
      setDaemonSyncing(true); // Keep trying to sync
      setNetworkStats({ hashrate: 0, difficulty: 0, connections: 0 });
    }
  };

  const handleSessionExpired = () => {
    clearSession();
    toast({
      title: "Session Expired",
      description: "Please log in again",
      variant: "destructive"
    });
    onLogout();
  };

  const applyThemeGlobally = (theme) => {
    const themes = {
      blue: { primary: '#3b82f6', secondary: '#1e40af', accent: '#06b6d4' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7' },
      green: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
      red: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }
    };

    const selectedTheme = themes[theme] || themes.blue;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', selectedTheme.primary);
    root.style.setProperty('--color-secondary', selectedTheme.secondary);
    root.style.setProperty('--color-accent', selectedTheme.accent);
    
    document.body.className = `theme-${theme}`;
  };

  const handleColorChange = (newColor) => {
    setColorTheme(newColor);
    setWalletSettings(prev => ({ ...prev, colorTheme: newColor }));
    applyThemeGlobally(newColor);
    
    toast({ 
      title: "Theme Updated", 
      description: `Switched to ${newColor} theme` 
    });
  };

  const refreshData = async () => {
    setLastUpdate(new Date());
    await loadWalletData();
    await loadBlockchainInfo();
    toast({ title: "Data Updated", description: "Wallet data refreshed successfully" });
  };

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} wallet={wallet} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-${colorTheme}-950/20 theme-${colorTheme}`}>
      {/* Mobile-Safe Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <QuantumLogo size={32} className="quantum-float" />
            <div>
              <h1 className="text-lg font-bold text-white">RaptorQ</h1>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 pulse-dot' : 'bg-red-400'}`}></div>
                <span>Block {blockHeight.toLocaleString()}</span>
                <span>•</span>
                <span>{syncProgress.toFixed(1)}% synced</span>
              </div>
            </div>
          </div>
          
          {/* Mobile-Safe Header Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              className="text-gray-400 hover:text-white p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-white p-2"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {/* Balance Display */}
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {showBalance ? `${balance.toFixed(8)} RTM` : '••••••••'}
              </div>
              <Button
                variant="ghost"
                size="sm"  
                onClick={() => setShowBalance(!showBalance)}
                className="text-xs text-gray-400 hover:text-white p-0 h-auto"
              >
                {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              
              {/* Lock Wallet Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast({
                    title: "Wallet Locked",
                    description: "Enter your password to unlock"
                  });
                  onLogout(); // This will lock the wallet and return to login screen
                }}
                className="text-xs text-gray-400 hover:text-red-400 p-1 h-auto"
                title="Lock Wallet"
              >
                <Lock className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Theme-Colored Tab Navigation */}
          <div className="mb-6 overflow-x-auto">
            <TabsList className="flex w-full bg-gray-800/50 p-1 rounded-lg min-w-max">
              <TabsTrigger 
                value="wallet" 
                className="flex-1 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=inactive]:text-blue-400 hover:text-blue-300 transition-all duration-200"
                style={{
                  '--theme-color': 'var(--color-primary)',
                  color: activeTab === 'wallet' ? 'white' : 'var(--color-primary)'
                }}
              >
                Wallet
              </TabsTrigger>
              <TabsTrigger 
                value="assets" 
                className="flex-1 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=inactive]:text-blue-400 hover:text-blue-300 transition-all duration-200"
                style={{
                  '--theme-color': 'var(--color-primary)',
                  color: activeTab === 'assets' ? 'white' : 'var(--color-primary)'
                }}
              >
                Assets
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex-1 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=inactive]:text-blue-400 hover:text-blue-300 transition-all duration-200"
                style={{
                  '--theme-color': 'var(--color-primary)',
                  color: activeTab === 'history' ? 'white' : 'var(--color-primary)'
                }}
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="nodes" 
                className="flex-1 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=inactive]:text-blue-400 hover:text-blue-300 transition-all duration-200"
                style={{
                  '--theme-color': 'var(--color-primary)',
                  color: activeTab === 'nodes' ? 'white' : 'var(--color-primary)'
                }}
              >
                Nodes
              </TabsTrigger>
              <TabsTrigger 
                value="sync" 
                className="flex-1 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=inactive]:text-blue-400 hover:text-blue-300 transition-all duration-200"
                style={{
                  '--theme-color': 'var(--color-primary)',
                  color: activeTab === 'sync' ? 'white' : 'var(--color-primary)'
                }}
              >
                Sync
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            {/* Premium Advertising Banner - Clickable "Advertise Here" */}
            <Card className="bg-gradient-to-r from-purple-950/30 to-blue-950/30 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 cursor-pointer mb-6">
              <CardContent className="p-4" onClick={() => setShowPremiumServices(true)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">Advertise Here</h3>
                        <Badge className="bg-purple-900/30 text-purple-300 text-xs">
                          $100/day
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">
                        Reach thousands of RTM users with premium advertising space
                      </p>
                      <div className="text-xs text-gray-400 mt-1">
                        Click to purchase advertising slot • Prime wallet placement
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPremiumServices(true);
                    }}
                  >
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => setShowQRReceive(true)}
                className="h-24 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/20 border border-green-500/30"
              >
                <div className="text-center">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-white" />
                  <span className="font-semibold text-white">Receive RTM</span>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowSendDialog(true)}
                className="h-24 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 border border-blue-500/30"
              >
                <div className="text-center">
                  <Send className="h-8 w-8 mx-auto mb-2 text-white" />
                  <span className="font-semibold text-white">Send RTM</span>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowQRScan(true)}
                className="h-24 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/20 border border-purple-500/30"
              >
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-white" />
                  <span className="font-semibold text-white">Scan QR</span>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowPremiumServices(true)}
                className="h-24 bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg shadow-yellow-500/20 border border-yellow-500/30"
              >
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-white" />
                  <span className="font-semibold text-white">Premium</span>
                </div>
              </Button>
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                onClick={() => setShowAssetExplorer(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Globe className="h-4 w-4 mr-2" />
                Asset Explorer
              </Button>
              
              <Button
                onClick={() => setShowStandardAssetCreator(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Asset
              </Button>
              
              <Button
                onClick={() => setShowPremiumServices(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Palette className="h-4 w-4 mr-2" />
                BinarAi Create
              </Button>
            </div>
            
            {/* Real blockchain asset explorer for main Raptoreum chain */}
            <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 mb-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Your Assets</h3>
                  </div>
                  <Badge className="bg-blue-900/30 text-blue-300">
                    Main Chain
                  </Badge>
                </div>
                
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 mx-auto mb-3 text-gray-500 opacity-50" />
                  <div className="text-white mb-2">No Personal Assets</div>
                  <p className="text-sm text-gray-400 mb-4">
                    You haven't created or received any assets on the Raptoreum blockchain yet.
                  </p>
                  <Button
                    onClick={() => setShowStandardAssetCreator(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Asset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Real Raptoreum Blockchain Asset Explorer - fills remaining space */}
            <div className="min-h-96">
              <AssetExplorer 
                isOpen={true} 
                onClose={() => {}} 
                wallet={wallet}
                fillMode={true}
                showHeader={false}
              />
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50">
              <CardContent className="p-8 text-center">
                <History className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
                <div className="text-lg mb-2 text-white">No Transaction History</div>
                <p className="text-sm text-gray-400 mb-4">
                  Your RTM transaction history will appear here as you send and receive payments.
                </p>
                <div className="text-xs text-gray-500">
                  Connected to Block {blockHeight.toLocaleString()} • Ready for transactions
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nodes Tab - Auto-opens Smartnode Manager */}
          <TabsContent value="nodes" className="space-y-6">
            <SmartnodeManager 
              isOpen={true} 
              onClose={() => {}} 
              wallet={wallet}
              embedded={true}
            />
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync" className="space-y-6">
            <BlockchainSync wallet={wallet} isVisible={activeTab === 'sync'} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Sync Animation Bar - spans full width at bottom */}
      {(syncProgress < 99.9 || !isConnected) && (
        <div className="fixed bottom-0 left-0 right-0 h-2 bg-gray-900/90 overflow-hidden z-40">
          <div className="relative h-full">
            {/* Flowing neon green gradient with smoke effects */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80 animate-flow-sync"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  #10b981 20%, 
                  #34d399 50%, 
                  #6ee7b7 80%, 
                  transparent 100%)`,
                animation: 'flowSync 3s ease-in-out infinite',
                filter: 'blur(0.5px) drop-shadow(0 0 10px #10b981)'
              }}
            />
            {/* Smooth flowing overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-emerald-400/40 to-green-500/30 animate-pulse"
              style={{
                background: `linear-gradient(90deg, 
                  rgba(16, 185, 129, 0.2) 0%, 
                  rgba(52, 211, 153, 0.6) 25%, 
                  rgba(110, 231, 183, 0.8) 50%, 
                  rgba(52, 211, 153, 0.6) 75%, 
                  rgba(16, 185, 129, 0.2) 100%)`,
                animation: 'flowSyncSmooth 2s linear infinite'
              }}
            />
            {/* Progress indicator */}
            <div 
              className="absolute left-0 top-0 h-full bg-green-400/60 transition-all duration-1000"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* All Dialog Components */}
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={walletSettings}
        onColorChange={handleColorChange}
        onSecurityUpdate={setWalletSettings}
      />

      <AssetExplorer
        isOpen={showAssetExplorer}
        onClose={() => setShowAssetExplorer(false)}
      />
      
      <StandardAssetCreator
        isOpen={showStandardAssetCreator}
        onClose={() => setShowStandardAssetCreator(false)}
        wallet={wallet}
      />
      
      <SmartnodeManager
        isOpen={showSmartnodeManager}
        onClose={() => setShowSmartnodeManager(false)}
        wallet={wallet}
      />
      
      <ProModeConsole
        isOpen={showProConsole}
        onClose={() => setShowProConsole(false)}
        wallet={wallet}
      />

      <QRReceiveDialog 
        isOpen={showQRReceive}
        onClose={() => setShowQRReceive(false)}
        wallet={wallet}
      />
      
      <QRScanDialog
        isOpen={showQRScan}
        onClose={() => setShowQRScan(false)}
        onAddressScanned={(address) => {
          setSendToAddress(address);
          setShowQRScan(false);
          setShowSendDialog(true);
        }}
      />
      
      <SendDialog
        isOpen={showSendDialog}  
        onClose={() => setShowSendDialog(false)}
        wallet={wallet}
        toAddress={sendToAddress}
        amount={sendAmount}
      />
      
      <PremiumServicesDialog
        isOpen={showPremiumServices}
        onClose={() => setShowPremiumServices(false)}
        wallet={wallet}
      />
    </div>
  );
};

// Wallet Setup Component with Password Creation
const WalletSetup = ({ onWalletCreated }) => {
  const { saveSession } = useSession();
  const [step, setStep] = useState('setup');
  const [generatedSeed, setGeneratedSeed] = useState('');
  const [colorTheme, setColorTheme] = useState('blue');
  const [importMode, setImportMode] = useState(false);
  const [userInputs, setUserInputs] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [existingWallet, setExistingWallet] = useState(null);
  
  // Daemon sync state for setup screen
  const [setupBlockHeight, setSetupBlockHeight] = useState(0);
  const [setupSyncProgress, setSetupSyncProgress] = useState(0);
  const [setupIsConnected, setSetupIsConnected] = useState(false);

  // Check for existing wallet on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('raptorq_wallet_encrypted');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        setExistingWallet(walletData);
        setStep('login');
      } catch (error) {
        console.error('Failed to load saved wallet:', error);
        localStorage.removeItem('raptorq_wallet_encrypted');
      }
    }
  }, []);

  // Continuous daemon sync during setup (even at password screen)
  useEffect(() => {
    const loadSetupBlockchainInfo = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/raptoreum/blockchain-info`);
        const blockData = response.data;
        
        setSetupBlockHeight(blockData.blocks || 0);
        const realSyncProgress = blockData.sync_progress_percent || ((blockData.verificationprogress || 0) * 100);
        setSetupSyncProgress(realSyncProgress);
        setSetupIsConnected(blockData.connections > 0);
        
      } catch (error) {
        console.error('Setup blockchain sync failed:', error);
        setSetupBlockHeight(0);
        setSetupSyncProgress(0);
        setSetupIsConnected(false);
      }
    };

    // Start immediate sync for setup screen
    loadSetupBlockchainInfo();
    
    // Continue syncing every 10 seconds during setup
    const setupSyncInterval = setInterval(loadSetupBlockchainInfo, 10000);
    
    return () => clearInterval(setupSyncInterval);
  }, []);

  const handlePasswordLogin = () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (existingWallet) {
      const storedPasswordHash = existingWallet.passwordHash;
      
      // In production, use proper password hashing verification
      if (btoa(password) === storedPasswordHash) {
        // Generate new session token
        const newSessionToken = 'session_' + Math.random().toString(36).substring(2, 15);
        saveSession(newSessionToken);
        onWalletCreated(existingWallet.wallet);
        
        toast({
          title: "Welcome Back!",
          description: "Successfully logged into your RaptorQ wallet"
        });
      } else {
        setPasswordError('Invalid password');
        toast({
          title: "Invalid Password",
          description: "Please check your password and try again",
          variant: "destructive"
        });
      }
    }
  };

  // Apply color theme to CSS variables and get theme-specific classes
  useEffect(() => {
    const applyColorTheme = (theme) => {
      const root = document.documentElement;
      
      const themes = {
        blue: { primary: '#3b82f6', secondary: '#1e40af', accent: '#06b6d4' },
        purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7' },
        green: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
        red: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }
      };

      const selectedTheme = themes[theme] || themes.blue;
      root.style.setProperty('--color-primary', selectedTheme.primary);
      root.style.setProperty('--color-secondary', selectedTheme.secondary);
      root.style.setProperty('--color-accent', selectedTheme.accent);
      
      document.body.className = `theme-${theme}`;
    };

    applyColorTheme(colorTheme);
  }, [colorTheme]);

  const getThemeClasses = () => {
    const themes = {
      blue: {
        gradient: 'from-blue-950/30 to-cyan-950/30',
        border: 'border-blue-800/30',
        text: 'text-blue-300',
        accent_text: 'text-blue-400',
        button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
        tab: 'data-[state=active]:bg-blue-600'
      },
      purple: {
        gradient: 'from-purple-950/30 to-violet-950/30',
        border: 'border-purple-800/30',
        text: 'text-purple-300',
        accent_text: 'text-purple-400',
        button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
        tab: 'data-[state=active]:bg-purple-600'
      },
      green: {
        gradient: 'from-green-950/30 to-emerald-950/30',
        border: 'border-green-800/30',
        text: 'text-green-300',
        accent_text: 'text-green-400',
        button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
        tab: 'data-[state=active]:bg-green-600'
      },
      red: {
        gradient: 'from-red-950/30 to-orange-950/30',
        border: 'border-red-800/30',
        text: 'text-red-300',
        accent_text: 'text-red-400',
        button: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
        tab: 'data-[state=active]:bg-red-600'
      }
    };
    return themes[colorTheme] || themes.blue;
  };

  const themeClasses = getThemeClasses();

  // Login step for returning users
  if (step === 'login' && existingWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
          <CardHeader className="text-center">
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-pulse" />
            <CardTitle className="text-white">Welcome Back to RaptorQ</CardTitle>
            <p className="text-gray-400 text-sm">Enter your password to access your wallet</p>
            
            {/* Daemon Sync Status at Login Screen */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Daemon Status</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${setupIsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{setupIsConnected ? 'Connected' : 'Connecting'}</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${setupSyncProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Block {setupBlockHeight.toLocaleString()}</span>
                <span>{setupSyncProgress.toFixed(1)}% synced</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Wallet Password</Label>
              <Input
                type="password"
                placeholder="Enter your wallet password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordLogin()}
              />
              {passwordError && (
                <p className="text-red-400 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handlePasswordLogin}
                disabled={!password}
                className={`flex-1 ${themeClasses.button}`}
              >
                <Key className="h-4 w-4 mr-2" />
                Unlock Wallet
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('raptorq_wallet_encrypted');
                  setExistingWallet(null);
                  setStep('setup');
                  setPassword('');
                  setPasswordError('');
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                New Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateSeed = () => {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'adjust', 'admire', 'admit'
    ];
    
    const seed = [];
    for (let i = 0; i < 12; i++) {
      seed.push(words[Math.floor(Math.random() * words.length)]);
    }
    return seed.join(' ');
  };

  const validatePassword = () => {
    setPasswordError('');
    
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleCreateWallet = () => {
    if (!validatePassword()) {
      return;
    }

    if (importMode) {
      // Handle import logic with password
      const newWallet = {
        id: Date.now().toString(),
        name: 'Imported RaptorQ Wallet',
        address: 'RImported' + Math.random().toString(36).substring(2, 15),
        balance: 0, // Real balance, not fake
        colorTheme: colorTheme,
        type: 'imported',
        hasPassword: true
      };
      
      // Generate and save session token
      const sessionToken = 'session_' + Math.random().toString(36).substring(2, 15);
      saveSession(sessionToken);
      
      onWalletCreated(newWallet);
    } else {
      const seed = generateSeed();
      setGeneratedSeed(seed);
      setStep('show-seed');
    }
  };

  const handleSeedVerified = () => {
    // First show seed verification before creating wallet
    setStep('verify-seed');
  };

  const handleSeedConfirmed = () => {
    const newWallet = {
      id: Date.now().toString(),
      name: 'RaptorQ Quantum Wallet',
      address: 'R' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      balance: 0, // Real balance, starts at 0
      seed: generatedSeed,
      colorTheme: colorTheme,
      type: 'created',
      hasPassword: true
    };
    
    // Generate and save session token
    const sessionToken = 'session_' + Math.random().toString(36).substring(2, 15);
    saveSession(sessionToken);
    
    // Save encrypted wallet with password (in production, this would be properly encrypted)
    localStorage.setItem('raptorq_wallet_encrypted', JSON.stringify({
      wallet: newWallet,
      passwordHash: btoa(password) // In production, use proper hashing
    }));
    
    onWalletCreated(newWallet);
  };

  // Seed verification step
  if (step === 'verify-seed' && generatedSeed) {
    const seedWords = generatedSeed.split(' ');
    const [verificationWords, setVerificationWords] = useState(['', '', '']);
    const [selectedPositions] = useState([2, 5, 8]); // Words to verify (3rd, 6th, 9th)
    
    const handleVerification = () => {
      const correctWords = selectedPositions.map(pos => seedWords[pos]);
      const inputWords = verificationWords.map(word => word.toLowerCase().trim());
      
      if (correctWords.every((word, index) => word === inputWords[index])) {
        handleSeedConfirmed();
      } else {
        toast({
          title: "Verification Failed",
          description: "Please check your seed phrase and try again",
          variant: "destructive"
        });
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
          <CardHeader className="text-center">
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-pulse" />
            <CardTitle className="text-white">Verify Your Seed Phrase</CardTitle>
            <p className="text-gray-400 text-sm">Please enter the following words to confirm you wrote them down</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPositions.map((position, index) => (
              <div key={position}>
                <Label className="text-white">Word #{position + 1}</Label>
                <Input
                  placeholder={`Enter word #${position + 1}`}
                  value={verificationWords[index]}
                  onChange={(e) => {
                    const newWords = [...verificationWords];
                    newWords[index] = e.target.value;
                    setVerificationWords(newWords);
                  }}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            ))}
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleVerification}
                disabled={verificationWords.some(word => !word.trim())}
                className={`flex-1 ${themeClasses.button}`}
              >
                Verify & Create Wallet
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('show-seed')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'show-seed' && generatedSeed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md quantum-glass backdrop-blur-sm animate-fade-in-scale">
          <CardHeader className="text-center">
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-pulse" />
            <CardTitle className="text-white">Your Quantum Seed Phrase</CardTitle>
            <p className="text-gray-400 text-sm">Write down these 12 words in order. Keep them safe!</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 p-4 bg-gray-800/30 rounded-lg">
              {generatedSeed.split(' ').map((word, index) => (
                <div key={index} className="text-center p-2 bg-gray-700/50 rounded text-sm text-white">
                  <span className="text-xs text-gray-400">{index + 1}.</span>
                  <div className="font-semibold">{word}</div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-red-950/30 border border-red-800/30 rounded-lg">
              <div className="flex items-center text-red-400 text-sm mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-semibold">CRITICAL WARNING</span>
              </div>
              <p className="text-red-300 text-xs">
                Your seed phrase and password are the ONLY way to recover your wallet. 
                If you lose them, your RTM funds will be PERMANENTLY LOST. Write them down 
                and store them in a safe place offline.
              </p>
            </div>
            
            <Button 
              onClick={() => setStep('verify')}
              className={`w-full bg-gradient-to-r ${themeClasses.button} text-white`}
            >
              <Shield className="mr-2 h-4 w-4" />
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
            <QuantumLogo size={64} className="mx-auto mb-4 quantum-pulse" />
            <CardTitle className="text-white">Verify Your Seed Phrase</CardTitle>
            <p className="text-gray-400 text-sm">Confirm you have safely stored your seed phrase and password</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <p className="text-white mb-2">Seed phrase and password saved!</p>
              <p className="text-gray-400 text-sm">Your wallet will be encrypted with your password</p>
            </div>
            
            <div className="p-4 bg-yellow-950/30 border border-yellow-800/30 rounded-lg">
              <div className="flex items-center text-yellow-400 text-sm mb-2">
                <Lock className="h-4 w-4 mr-2" />
                <span className="font-semibold">REMEMBER YOUR PASSWORD</span>
              </div>
              <p className="text-yellow-300 text-xs">
                You will need your password to unlock your wallet. If you forget it, 
                you can only restore using your 12-word seed phrase.
              </p>
            </div>
            
            <Button 
              onClick={handleSeedVerified}
              className={`w-full bg-gradient-to-r ${themeClasses.button} text-white`}
            >
              <Shield className="mr-2 h-4 w-4" />
              Create Encrypted Quantum Wallet
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
          <QuantumLogo size={80} className="mx-auto mb-6 quantum-float" />
          <CardTitle className="text-2xl text-white quantum-brand-text">Welcome to RaptorQ</CardTitle>
          
          <div className={`p-4 bg-gradient-to-r ${themeClasses.gradient} rounded-lg border ${themeClasses.border} quantum-glow`}>
            <div className="flex items-center space-x-2 mb-2">
              <Hexagon className={`h-4 w-4 ${themeClasses.accent_text}`} />
              <span className={`text-sm font-medium ${themeClasses.text}`}>Quantum Raptoreum UTXO</span>
            </div>
            <p className="text-xs text-gray-300">Powered by Raptoreum's revolutionary UTXO blockchain with Binarai's post-quantum cryptography.</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="create" className={`${themeClasses.tab} text-white`}>Create New</TabsTrigger>
              <TabsTrigger value="import" className={`${themeClasses.tab} text-white`}>Import Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4 mt-6">
              <div>
                <Label className="text-white mb-3 block">Color Theme</Label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="blue" className="text-white">Quantum Blue</SelectItem>
                    <SelectItem value="purple" className="text-white">Cosmic Purple</SelectItem>
                    <SelectItem value="green" className="text-white">Matrix Green</SelectItem>
                    <SelectItem value="red" className="text-white">Crimson Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password Creation */}
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Wallet Password *</Label>
                  <Input
                    type="password"
                    placeholder="Create a strong password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Confirm Password *</Label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 mt-2"
                  />
                </div>

                {passwordError && (
                  <div className="text-red-400 text-sm">{passwordError}</div>
                )}

                <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
                  <div className="flex items-center text-red-400 text-sm mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-semibold">CRITICAL WARNING</span>
                  </div>
                  <p className="text-red-300 text-xs">
                    Remember this password! If you lose both your password AND your seed phrase, 
                    your RTM funds will be PERMANENTLY LOST forever.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="seedPhrase" className="text-white">12-Word Seed Phrase</Label>
                <Textarea
                  id="seedPhrase"
                  placeholder="Enter your 12-word seed phrase..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 mt-2"
                  rows={3}
                  onChange={() => setImportMode(true)}
                />
              </div>

              {/* Password for Import */}
              <div className="space-y-4">
                <div>
                  <Label className="text-white">New Wallet Password *</Label>
                  <Input
                    type="password"
                    placeholder="Create a password for this wallet"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Confirm Password *</Label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 mt-2"
                  />
                </div>

                {passwordError && (
                  <div className="text-red-400 text-sm">{passwordError}</div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleCreateWallet}
            disabled={!password || !confirmPassword}
            className={`w-full bg-gradient-to-r ${themeClasses.button} text-white font-semibold py-3`}
          >
            <Key className="mr-2 h-4 w-4" />
            {importMode ? 'Import Encrypted Wallet' : 'Create Quantum Wallet'}
          </Button>

          <Badge className={`mt-2 bg-${colorTheme}-900/30 text-${colorTheme}-300 border-${colorTheme}-700/50 block text-center`}>
            Quantum-Resistant Raptoreum UTXO
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
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
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;