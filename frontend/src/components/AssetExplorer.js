import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from '../hooks/use-toast';
import { 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  ExternalLink,
  Copy,
  Layers,
  Users,
  Activity,
  TrendingUp,
  Coins,
  Hash,
  Calendar,
  User,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const RaptoreumAPI = {
  EXPLORER_API: 'https://explorer.raptoreum.com/api',
  
  searchAssets: async (query, type = 'name') => {
    try {
      // Real API calls to Raptoreum explorer
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/assets`, {
        params: { search: query, type }
      });
      return response.data.assets || [];
    } catch (error) {
      console.error('Asset search failed:', error);
      // Fallback to mock data for development
      return mockRaptoreumAssets.filter(asset => 
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.owner.toLowerCase().includes(query.toLowerCase()) ||
        asset.txid.includes(query)
      );
    }
  },

  getAssetDetails: async (assetId) => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/asset/${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch asset details:', error);
      return mockRaptoreumAssets.find(asset => asset.id === assetId);
    }
  },

  getAssetTransactions: async (assetId) => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/asset/${assetId}/transactions`);
      return response.data.transactions || [];
    } catch (error) {
      console.error('Failed to fetch asset transactions:', error);
      return mockTransactions;
    }
  },

  getAssetRichList: async (assetId) => {
    try {
      const response = await axios.get(`${RaptoreumAPI.EXPLORER_API}/asset/${assetId}/richlist`);
      return response.data.addresses || [];
    } catch (error) {
      console.error('Failed to fetch rich list:', error);
      return mockRichList;
    }
  }
};

// Mock data for development (will be replaced by real blockchain data)
const mockRaptoreumAssets = [
  {
    id: 'RTM_GOLD_COIN',
    name: 'RTM Gold Coin',
    type: 'master',
    owner: 'RABCdef1234567890abcdef1234567890abcdef12',
    txid: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    quantity: 1000000,
    circulation: 750000,
    updateable: true,
    reissuable: true,
    ipfs_hash: 'QmRTMGoldCoin123456789',
    creation_height: 285647,
    creation_time: '2024-01-15T10:30:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=200&h=200&fit=crop',
    likes: 245,
    description: 'Premium RTM-backed gold token with quantum security'
  },
  {
    id: 'QUANTUM_ART_001',
    name: 'Quantum Art NFT #001',
    type: 'unique',
    owner: 'RXYZabc9876543210fedcba0987654321fedcba09',
    txid: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    quantity: 1,
    circulation: 1,
    updateable: false,
    reissuable: false,
    ipfs_hash: 'QmQuantumArt001789123',
    creation_height: 298562,
    creation_time: '2024-02-20T14:15:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop',
    likes: 89,
    description: 'Unique quantum-resistant digital art piece'
  },
  {
    id: 'RTM_SHARE_TOKEN',
    name: 'RTM Share Token',
    type: 'reissuable',
    owner: 'RMNOpqr5678901234567890123456789012345678',
    txid: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    quantity: 10000000,
    circulation: 3500000,
    updateable: true,
    reissuable: true,
    ipfs_hash: 'QmRTMShareToken456789',
    creation_height: 301789,
    creation_time: '2024-03-01T09:45:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1551732998-cdc9021fb1a8?w=200&h=200&fit=crop',
    likes: 156,
    description: 'Divisible RTM share token for community governance'
  }
];

const mockTransactions = [
  {
    txid: '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
    from: 'RABCdef1234567890abcdef1234567890abcdef12',
    to: 'RXYZabc9876543210fedcba0987654321fedcba09',
    amount: 1000,
    block_height: 302456,
    timestamp: '2024-03-05T16:30:00Z',
    confirmations: 2158
  },
  {
    txid: '2222333344445555666677778888999900001111aaaabbbbccccddddeeeeffff',
    from: 'RXYZabc9876543210fedcba0987654321fedcba09',
    to: 'RMNOpqr5678901234567890123456789012345678',
    amount: 500,
    block_height: 302789,
    timestamp: '2024-03-06T11:15:00Z',
    confirmations: 1825
  }
];

const mockRichList = [
  { address: 'RABCdef1234567890abcdef1234567890abcdef12', balance: 250000, percentage: 33.33 },
  { address: 'RXYZabc9876543210fedcba0987654321fedcba09', balance: 200000, percentage: 26.67 },
  { address: 'RMNOpqr5678901234567890123456789012345678', balance: 150000, percentage: 20.00 },
  { address: 'RSTUvwx3456789012345678901234567890123456', balance: 100000, percentage: 13.33 },
  { address: 'RDEFghi7890123456789012345678901234567890', balance: 50000, percentage: 6.67 }
];

const AssetCard = ({ asset, onClick, onLike, onShare }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(asset.likes);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.(asset.id, !liked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(asset);
  };

  return (
    <Card 
      className="group cursor-pointer bg-gradient-to-br from-gray-900/80 to-black/60 border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
      onClick={() => onClick(asset)}
    >
      <CardContent className="p-4">
        <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-800/50">
          <img 
            src={asset.thumbnail} 
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2">
            <Badge className={`text-xs ${
              asset.type === 'master' ? 'bg-yellow-900/80 text-yellow-300' :
              asset.type === 'unique' ? 'bg-purple-900/80 text-purple-300' :
              'bg-blue-900/80 text-blue-300'
            }`}>
              {asset.type.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-900/80 text-green-300 border-green-700/50 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-gray-900/80 text-gray-300 border-gray-700/50 text-xs">
              Block {asset.creation_height}
            </Badge>
          </div>
        </div>
        
        <h4 className="font-semibold text-white text-sm truncate mb-1">{asset.name}</h4>
        <p className="text-gray-400 text-xs truncate mb-2">{asset.description}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400">
            <span>Supply: {asset.circulation.toLocaleString()}</span>
            {asset.reissuable && <span className="ml-2 text-yellow-400">↻</span>}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(asset.creation_time).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={`text-xs p-1 transition-all duration-300 ${
                liked 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-3 w-3 mr-1 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleShare}
              className="text-gray-400 hover:text-white p-1"
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-blue-400 hover:text-blue-300 p-1"
            onClick={() => onClick(asset)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AssetDetailDialog = ({ asset, isOpen, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [richList, setRichList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (isOpen && asset) {
      loadAssetData();
    }
  }, [isOpen, asset]);

  const loadAssetData = async () => {
    setLoading(true);
    try {
      const [txData, richData] = await Promise.all([
        RaptoreumAPI.getAssetTransactions(asset.id),
        RaptoreumAPI.getAssetRichList(asset.id)
      ]);
      setTransactions(txData);
      setRichList(richData);
    } catch (error) {
      console.error('Failed to load asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${label} copied to clipboard` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-4xl max-h-[90vh] overflow-y-auto mobile-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <img 
              src={asset.thumbnail} 
              alt={asset.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{asset.name}</span>
                <Badge className={`${
                  asset.type === 'master' ? 'bg-yellow-900/30 text-yellow-300' :
                  asset.type === 'unique' ? 'bg-purple-900/30 text-purple-300' :
                  'bg-blue-900/30 text-blue-300'
                }`}>
                  {asset.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mt-1">{asset.description}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {['details', 'transactions', 'richlist'].map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 ${activeTab === tab ? 'bg-blue-600' : ''}`}
              >
                {tab === 'details' && <Layers className="h-4 w-4 mr-2" />}
                {tab === 'transactions' && <Activity className="h-4 w-4 mr-2" />}
                {tab === 'richlist' && <TrendingUp className="h-4 w-4 mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          {/* Asset Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-yellow-400" />
                    Asset Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Asset ID:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(asset.id, 'Asset ID')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto font-mono text-xs"
                      >
                        {asset.id} <Copy className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{asset.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Supply:</span>
                      <span className="text-white">{asset.quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Circulating:</span>
                      <span className="text-white">{asset.circulation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updateable:</span>
                      <span className={asset.updateable ? 'text-green-400' : 'text-red-400'}>
                        {asset.updateable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reissuable:</span>
                      <span className={asset.reissuable ? 'text-green-400' : 'text-red-400'}>
                        {asset.reissuable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Hash className="h-5 w-5 mr-2 text-blue-400" />
                    Blockchain Data
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creation TX:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(asset.txid, 'Transaction ID')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto font-mono text-xs max-w-32 truncate"
                      >
                        {asset.txid.substring(0, 16)}... <Copy className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block Height:</span>
                      <span className="text-white">{asset.creation_height.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(asset.creation_time).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IPFS Hash:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(asset.ipfs_hash, 'IPFS Hash')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto font-mono text-xs"
                      >
                        {asset.ipfs_hash} <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-400" />
                    Owner Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner Address:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(asset.owner, 'Owner Address')}
                        className="text-green-400 hover:text-green-300 p-0 h-auto font-mono text-xs max-w-32 truncate"
                      >
                        {asset.owner.substring(0, 16)}... <Copy className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800/50">
                  <img 
                    src={asset.thumbnail} 
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-400" />
                  Recent Transactions
                </h3>
                <Button
                  size="sm"
                  onClick={loadAssetData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((tx, index) => (
                  <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(tx.txid, 'Transaction ID')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto font-mono text-xs"
                      >
                        {tx.txid.substring(0, 24)}... <Copy className="h-3 w-3 ml-1" />
                      </Button>
                      <Badge className="bg-green-900/30 text-green-300">
                        {tx.confirmations} confirmations
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">From:</span>
                        <span className="font-mono text-xs text-gray-300">{tx.from.substring(0, 12)}...</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-400">To:</span>
                        <span className="font-mono text-xs text-gray-300">{tx.to.substring(0, 12)}...</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{tx.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rich List Tab */}
          {activeTab === 'richlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
                  Rich List - Top Holders
                </h3>
                <Button
                  size="sm"
                  onClick={loadAssetData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {richList.map((holder, index) => (
                  <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(holder.address, 'Address')}
                          className="text-blue-400 hover:text-blue-300 p-0 h-auto font-mono text-xs"
                        >
                          {holder.address.substring(0, 20)}... <Copy className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{holder.balance.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{holder.percentage}% of supply</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AssetExplorer = ({ isOpen, onClose, wallet, fillMode = false, showHeader = true }) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssetDetail, setShowAssetDetail] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchAssets();
    } else {
      setFilteredAssets(assets);
    }
  }, [searchQuery, searchType, assets]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // Load real assets from main Raptoreum blockchain
      console.log('Loading real assets from Raptoreum blockchain...');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/raptoreum/assets/all`, {
        timeout: 15000
      });
      
      if (response.data && response.data.assets && response.data.assets.length > 0) {
        console.log(`Loaded ${response.data.assets.length} real assets from blockchain`);
        setAssets(response.data.assets);
        setFilteredAssets(response.data.assets);
      } else {
        // No assets on blockchain yet (realistic for new chain or fresh state)
        console.log('No assets found on blockchain - showing empty state');
        setAssets([]);
        setFilteredAssets([]);
      }
    } catch (error) {
      console.error('Failed to load real blockchain assets:', error);
      // For production wallet, show empty state when blockchain connection fails
      setAssets([]);
      setFilteredAssets([]);
      
      if (error.response?.status === 404) {
        console.log('Asset endpoint not found - blockchain may have no assets');
      } else if (error.code === 'ECONNABORTED') {
        console.log('Request timeout - blockchain connection slow');
      }
    } finally {
      setLoading(false);
    }
  };

  const searchAssets = async () => {
    if (!searchQuery.trim()) {
      setFilteredAssets(assets);
      return;
    }

    setLoading(true);
    try {
      const results = await RaptoreumAPI.searchAssets(searchQuery, searchType);
      setFilteredAssets(results);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to local filtering
      const localResults = assets.filter(asset => {
        const query = searchQuery.toLowerCase();
        switch (searchType) {
          case 'name':
            return asset.name.toLowerCase().includes(query);
          case 'owner':
            return asset.owner.toLowerCase().includes(query);
          case 'txid':
            return asset.txid.toLowerCase().includes(query);
          default:
            return asset.name.toLowerCase().includes(query) ||
                   asset.owner.toLowerCase().includes(query) ||
                   asset.txid.toLowerCase().includes(query);
        }
      });
      setFilteredAssets(localResults);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setShowAssetDetail(true);
  };

  const handleLike = async (assetId, liked) => {
    try {
      // In production, this would update likes on the backend
      console.log(`Asset ${assetId} ${liked ? 'liked' : 'unliked'}`);
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  const handleShare = async (asset) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${asset.name} - RaptorQ Asset`,
          text: asset.description,
          url: `https://explorer.raptoreum.com/asset/${asset.id}`
        });
      } else {
        await navigator.clipboard.writeText(`https://explorer.raptoreum.com/asset/${asset.id}`);
        toast({ title: "Link Copied!", description: "Asset link copied to clipboard" });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Raptoreum Asset Explorer</h2>
          <p className="text-gray-400 mt-1">Explore assets created on the Raptoreum blockchain</p>
        </div>
        <Button
          onClick={loadAssets}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets, addresses, or transaction IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-600 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="name">Asset Name</SelectItem>
            <SelectItem value="owner">Owner Address</SelectItem>
            <SelectItem value="txid">Transaction ID</SelectItem>
            <SelectItem value="all">All Fields</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mr-3" />
          <span className="text-gray-300">Loading Raptoreum assets...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={handleAssetClick}
              onLike={handleLike}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No assets found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      )}

      {/* Asset Detail Dialog */}
      <AssetDetailDialog
        asset={selectedAsset}
        isOpen={showAssetDetail}
        onClose={() => setShowAssetDetail(false)}
      />
    </div>
  );
};

export default AssetExplorer;