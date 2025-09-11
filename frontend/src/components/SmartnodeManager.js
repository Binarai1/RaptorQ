import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from '../hooks/use-toast';
import { 
  Server, 
  Plus, 
  Play, 
  Pause, 
  Lock, 
  Unlock, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Globe,
  HardDrive,
  Cpu,
  Activity,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';
import axios from 'axios';

// Raptoreum Smartnode Requirements
const SMARTNODE_CONFIG = {
  COLLATERAL: 1800000, // 1.8 million RTM
  MIN_CONFIRMATIONS: 15,
  VPS_REQUIREMENTS: {
    RAM: '4GB minimum',
    CPU: '2 cores minimum', 
    STORAGE: '50GB minimum SSD',
    BANDWIDTH: '1TB/month',
    OS: 'Ubuntu 20.04/22.04 LTS'
  },
  QUANTUM_ENHANCEMENTS: {
    ENCRYPTION: 'Post-quantum cryptographic signatures',
    MONITORING: 'Quantum-resistant node monitoring',
    BACKUP: 'Quantum-safe configuration backup',
    SECURITY: 'Enhanced anti-tampering protection'
  }
};

const SmartnodeManager = ({ isOpen, onClose, wallet }) => {
  const [smartnodes, setSmartnodes] = useState([]);
  const [allSmartnodes, setAllSmartnodes] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('owned'); // owned, all, enabled, disabled
  
  const [newNode, setNewNode] = useState({
    alias: '',
    vpsIP: '',
    vpsPort: 10226,
    vpsUser: '',
    vpsPassword: '',
    enableQuantumSecurity: true,
    autoRestart: true,
    monitoringEnabled: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadSmartnodes();
      loadWalletBalance();
    }
  }, [isOpen, wallet]);

  const loadSmartnodes = async () => {
    setLoading(true);
    try {
      // Load user's smartnodes
      const ownedResponse = await axios.get(`/api/raptoreum/smartnodes/owned/${wallet?.address}`);
      setSmartnodes(ownedResponse.data.smartnodes || []);

      // Load all network smartnodes
      const allResponse = await axios.get('/api/raptoreum/smartnodes/all');
      setAllSmartnodes(allResponse.data.smartnodes || []);

    } catch (error) {
      console.error('Failed to load smartnodes:', error);
      // Mock data for development
      setSmartnodes(mockOwnedSmartnodes);
      setAllSmartnodes(mockAllSmartnodes);
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/${wallet?.address}/balance`);
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      setWalletBalance(0); // Real balance starts at 0 for new wallets
    }
  };

  const createSmartnode = async () => {
    if (!newNode.alias || !newNode.vpsIP || !newNode.vpsUser) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (walletBalance < SMARTNODE_CONFIG.COLLATERAL) {
      toast({
        title: "Insufficient Balance",
        description: `Need ${SMARTNODE_CONFIG.COLLATERAL.toLocaleString()} RTM for smartnode collateral`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create smartnode with quantum enhancements
      const smartnodeData = {
        ...newNode,
        collateral: SMARTNODE_CONFIG.COLLATERAL,
        owner_address: wallet.address,
        quantum_enhanced: newNode.enableQuantumSecurity,
        creation_time: new Date().toISOString()
      };

      const response = await axios.post('/api/raptoreum/smartnodes/create', smartnodeData);

      toast({
        title: "Smartnode Created! 🎉",
        description: `${newNode.alias} has been configured and is starting up`,
      });

      // Reset form
      setNewNode({
        alias: '',
        vpsIP: '',
        vpsPort: 10226,
        vpsUser: '',
        vpsPassword: '',
        enableQuantumSecurity: true,
        autoRestart: true,
        monitoringEnabled: true
      });

      setShowCreateDialog(false);
      loadSmartnodes();

    } catch (error) {
      console.error('Smartnode creation failed:', error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.detail || "Failed to create smartnode",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const controlSmartnode = async (nodeId, action) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/raptoreum/smartnodes/${nodeId}/${action}`, {
        wallet_address: wallet.address
      });

      toast({
        title: "Command Sent",
        description: `Smartnode ${action} command executed successfully`,
      });

      loadSmartnodes();
    } catch (error) {
      console.error(`Smartnode ${action} failed:`, error);
      toast({
        title: "Command Failed",
        description: error.response?.data?.detail || `Failed to ${action} smartnode`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const lockCollateral = async (nodeId) => {
    try {
      await axios.post(`/api/raptoreum/smartnodes/${nodeId}/lock-collateral`, {
        wallet_address: wallet.address
      });

      toast({
        title: "Collateral Locked",
        description: "Smartnode collateral has been locked and secured",
      });

      loadSmartnodes();
    } catch (error) {
      console.error('Collateral lock failed:', error);
      toast({
        title: "Lock Failed",
        description: "Failed to lock smartnode collateral",
        variant: "destructive"
      });
    }
  };

  const unlockCollateral = async (nodeId) => {
    try {
      await axios.post(`/api/raptoreum/smartnodes/${nodeId}/unlock-collateral`, {
        wallet_address: wallet.address
      });

      toast({
        title: "Collateral Unlocked",
        description: "Smartnode collateral has been unlocked and is spendable",
      });

      loadSmartnodes();
    } catch (error) {
      console.error('Collateral unlock failed:', error);
      toast({
        title: "Unlock Failed", 
        description: "Failed to unlock smartnode collateral",
        variant: "destructive"
      });
    }
  };

  const getFilteredNodes = () => {
    switch (filter) {
      case 'owned':
        return smartnodes;
      case 'all':
        return allSmartnodes;
      case 'enabled':
        return smartnodes.filter(node => node.status === 'ENABLED');
      case 'disabled':
        return smartnodes.filter(node => node.status !== 'ENABLED');
      default:
        return smartnodes;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ENABLED':
        return 'bg-green-900/30 text-green-300';
      case 'PRE_ENABLED':
        return 'bg-yellow-900/30 text-yellow-300';
      case 'NEW_START_REQUIRED':
        return 'bg-orange-900/30 text-orange-300';
      case 'EXPIRED':
        return 'bg-red-900/30 text-red-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ENABLED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'PRE_ENABLED':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'NEW_START_REQUIRED':
        return <RefreshCw className="h-4 w-4 text-orange-400" />;
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Server className="h-4 w-4 text-gray-400" />;
    }
  };

  // Mock data for development
  const mockOwnedSmartnodes = [
    {
      id: 'mn1',
      alias: 'RaptorQ-Node-01',
      ip: '45.32.123.45',
      port: 10226,
      status: 'ENABLED',
      protocol: 70208,
      last_seen: new Date(Date.now() - 300000).toISOString(),
      active_time: '2d 14h 23m',
      collateral_locked: true,
      quantum_enhanced: true,
      owner: wallet?.address || 'RABCdef1234567890abcdef1234567890abcdef12',
      earnings: 245.67,
      blocks_won: 12
    },
    {
      id: 'mn2', 
      alias: 'RaptorQ-Node-02',
      ip: '158.69.45.123',
      port: 10226,
      status: 'PRE_ENABLED',
      protocol: 70208,
      last_seen: new Date(Date.now() - 120000).toISOString(),
      active_time: '1h 45m',
      collateral_locked: true,
      quantum_enhanced: true,
      owner: wallet?.address || 'RABCdef1234567890abcdef1234567890abcdef12',
      earnings: 0,
      blocks_won: 0
    }
  ];

  const mockAllSmartnodes = [
    ...mockOwnedSmartnodes,
    {
      id: 'mn3',
      alias: 'Community-Node-A',
      ip: '185.45.67.89',
      port: 10226,
      status: 'ENABLED',
      protocol: 70208,
      last_seen: new Date(Date.now() - 180000).toISOString(),
      active_time: '5d 8h 12m',
      collateral_locked: true,
      quantum_enhanced: false,
      owner: 'RXYZabc9876543210fedcba0987654321fedcba09',
      earnings: 1250.45,
      blocks_won: 67
    }
  ];

  const CreateSmartnodeDialog = () => (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-2xl mobile-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-400" />
            <span>Deploy Quantum Smartnode</span>
            <Badge className="bg-purple-900/30 text-purple-300">
              Quantum Enhanced
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requirements Info */}
          <div className="p-4 bg-gradient-to-r from-purple-950/30 to-blue-950/30 rounded-lg border border-purple-800/30">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Smartnode Requirements</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Collateral:</span>
                <span className="text-white ml-2">{SMARTNODE_CONFIG.COLLATERAL.toLocaleString()} RTM</span>
              </div>
              <div>
                <span className="text-gray-400">Balance:</span>
                <span className={`ml-2 ${walletBalance >= SMARTNODE_CONFIG.COLLATERAL ? 'text-green-400' : 'text-red-400'}`}>
                  {walletBalance.toLocaleString()} RTM
                </span>
              </div>
              <div>
                <span className="text-gray-400">VPS RAM:</span>
                <span className="text-white ml-2">{SMARTNODE_CONFIG.VPS_REQUIREMENTS.RAM}</span>
              </div>
              <div>
                <span className="text-gray-400">VPS CPU:</span>
                <span className="text-white ml-2">{SMARTNODE_CONFIG.VPS_REQUIREMENTS.CPU}</span>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-white font-medium">Smartnode Alias *</Label>
              <Input
                placeholder="RaptorQ-Node-01"
                value={newNode.alias}
                onChange={(e) => setNewNode(prev => ({...prev, alias: e.target.value.trim()}))}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength={50}
              />
              <p className="text-xs text-gray-300 mt-1">Unique identifier for your smartnode</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-medium">VPS IP Address *</Label>
                <Input
                  placeholder="45.32.123.45"
                  value={newNode.vpsIP}
                  onChange={(e) => setNewNode(prev => ({...prev, vpsIP: e.target.value.trim()}))}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  pattern="[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+"
                />
              </div>
              <div>
                <Label className="text-white font-medium">Port</Label>
                <Input
                  type="number"
                  min="1"
                  max="65535"
                  value={newNode.vpsPort}
                  onChange={(e) => {
                    const port = parseInt(e.target.value);
                    if (port >= 1 && port <= 65535) {
                      setNewNode(prev => ({...prev, vpsPort: port}));
                    }
                  }}
                  className="bg-gray-800/50 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <Label className="text-white font-medium">VPS Username *</Label>
              <Input
                placeholder="root"
                value={newNode.vpsUser}
                onChange={(e) => setNewNode(prev => ({...prev, vpsUser: e.target.value.trim()}))}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength={50}
              />
            </div>

            <div>
              <Label className="text-white font-medium">VPS Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter VPS password"
                  value={newNode.vpsPassword}
                  onChange={(e) => setNewNode(prev => ({...prev, vpsPassword: e.target.value}))}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  maxLength={128}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Quantum Enhancement Options */}
            <div className="space-y-3 p-4 bg-gradient-to-r from-purple-950/20 to-blue-950/20 rounded-lg border border-purple-800/20">
              <h3 className="text-sm font-medium text-purple-300 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Quantum Enhancements
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white text-sm">Post-Quantum Security</Label>
                    <p className="text-xs text-gray-400">Enhanced cryptographic protection</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newNode.enableQuantumSecurity}
                    onChange={(e) => setNewNode(prev => ({...prev, enableQuantumSecurity: e.target.checked}))}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white text-sm">Auto-Restart</Label>
                    <p className="text-xs text-gray-400">Automatically restart on failure</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newNode.autoRestart}
                    onChange={(e) => setNewNode(prev => ({...prev, autoRestart: e.target.checked}))}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white text-sm">Quantum Monitoring</Label>
                    <p className="text-xs text-gray-400">Enhanced monitoring and alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newNode.monitoringEnabled}
                    onChange={(e) => setNewNode(prev => ({...prev, monitoringEnabled: e.target.checked}))}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={createSmartnode}
              disabled={loading || walletBalance < SMARTNODE_CONFIG.COLLATERAL}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Deploy Smartnode
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>

          {walletBalance < SMARTNODE_CONFIG.COLLATERAL && (
            <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Insufficient balance for smartnode collateral ({SMARTNODE_CONFIG.COLLATERAL.toLocaleString()} RTM required)
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-6xl max-h-[90vh] overflow-y-auto mobile-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-purple-400" />
              <span>Smartnode Manager</span>
              <Badge className="bg-purple-900/30 text-purple-300">
                {smartnodes.length} Active
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="owned">My Nodes</SelectItem>
                  <SelectItem value="all">All Nodes</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Deploy Node
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Network Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/30 border-gray-600/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-lg font-semibold text-white">{allSmartnodes.length}</div>
                    <div className="text-xs text-gray-400">Total Network</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-600/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {allSmartnodes.filter(n => n.status === 'ENABLED').length}
                    </div>
                    <div className="text-xs text-gray-400">Enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-600/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {smartnodes.filter(n => n.quantum_enhanced).length}
                    </div>
                    <div className="text-xs text-gray-400">Quantum Enhanced</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-600/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {smartnodes.reduce((sum, n) => sum + (n.earnings || 0), 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Total Earnings RTM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smartnodes List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 text-blue-400 animate-spin mr-3" />
                <span className="text-gray-300">Loading smartnodes...</span>
              </div>
            ) : (
              getFilteredNodes().map((node) => (
                <Card key={node.id} className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-600/30 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(node.status)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-white">{node.alias}</h3>
                            <Badge className={getStatusColor(node.status)}>
                              {node.status}
                            </Badge>
                            {node.quantum_enhanced && (
                              <Badge className="bg-purple-900/30 text-purple-300">
                                <Zap className="h-3 w-3 mr-1" />
                                Quantum
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {node.ip}:{node.port}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {node.active_time}
                            </span>
                            <span className="flex items-center">
                              <Activity className="h-3 w-3 mr-1" />
                              Protocol {node.protocol}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Earnings */}
                        <div className="text-right">
                          <div className="text-lg font-semibold text-yellow-400">
                            {node.earnings?.toFixed(2) || '0.00'} RTM
                          </div>
                          <div className="text-xs text-gray-400">
                            {node.blocks_won || 0} blocks won
                          </div>
                        </div>

                        {/* Controls (only for owned nodes) */}
                        {filter === 'owned' && (
                          <div className="flex items-center space-x-2">
                            {node.status === 'ENABLED' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => controlSmartnode(node.id, 'stop')}
                                className="border-orange-600 text-orange-300 hover:bg-orange-800"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => controlSmartnode(node.id, 'start')}
                                className="border-green-600 text-green-300 hover:bg-green-800"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}

                            {node.collateral_locked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unlockCollateral(node.id)}
                                className="border-red-600 text-red-300 hover:bg-red-800"
                                title="Unlock Collateral"
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => lockCollateral(node.id)}
                                className="border-green-600 text-green-300 hover:bg-green-800"
                                title="Lock Collateral"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                              title="Settings"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!loading && getFilteredNodes().length === 0 && (
              <div className="text-center py-12">
                <Server className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-lg text-gray-400">No smartnodes found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {filter === 'owned' 
                    ? 'Deploy your first quantum-enhanced smartnode to start earning RTM'
                    : 'No smartnodes match the current filter'
                  }
                </p>
                {filter === 'owned' && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy Your First Smartnode
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <CreateSmartnodeDialog />
      </DialogContent>
    </Dialog>
  );
};

export default SmartnodeManager;