import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from '../hooks/use-toast';
import { 
  Coins, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  DollarSign,
  Layers,
  Settings,
  FileText,
  Hash,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

// Raptoreum Asset Creation Fees (accurate blockchain fees)
const RAPTOREUM_FEES = {
  ASSET_CREATION: 100, // 100 RTM to create asset
  ASSET_MINTING: 100, // 100 RTM to mint asset (combined in one process)
  TOTAL_ASSET_FEE: 200, // Total 200 RTM for complete asset creation + minting
  TRANSACTION_FEE: 0.001, // Standard network transaction fee
  IPFS_UPLOAD: 1 // 1 RTM for IPFS storage
};

const StandardAssetCreator = ({ isOpen, onClose, wallet }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    circulation: 1, // Changed from quantity to circulation
    decimals: 0,
    reissuable: false,
    hasIPFS: false,
    ipfsData: '',
    isUnique: false,
    parentAsset: '',
    updateable: true
  });

  const [fees, setFees] = useState({
    creationFee: RAPTOREUM_FEES.ASSET_CREATION,
    mintingFee: RAPTOREUM_FEES.ASSET_MINTING,
    transactionFee: RAPTOREUM_FEES.TRANSACTION_FEE,
    ipfsFee: 0,
    totalFee: RAPTOREUM_FEES.TOTAL_ASSET_FEE + RAPTOREUM_FEES.TRANSACTION_FEE
  });

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (isOpen && wallet) {
      loadWalletBalance();
      calculateFees();
    }
  }, [isOpen, wallet, formData]);

  useEffect(() => {
    calculateFees();
  }, [formData]);

  const loadWalletBalance = async () => {
    try {
      // In production, this would fetch real wallet balance from RPC
      const response = await axios.get(`/api/wallet/${wallet.address}/balance`);
      setWalletBalance(response.data.balance || 5000); // Mock balance
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      setWalletBalance(5000); // Mock balance for development
    }
  };

  const calculateFees = () => {
    let creationFee = RAPTOREUM_FEES.ASSET_CREATION; // 100 RTM
    let mintingFee = RAPTOREUM_FEES.ASSET_MINTING; // 100 RTM
    let ipfsFee = 0;

    // Add IPFS fee if applicable
    if (formData.hasIPFS && formData.ipfsData) {
      ipfsFee = RAPTOREUM_FEES.IPFS_UPLOAD;
    }

    const totalFee = creationFee + mintingFee + RAPTOREUM_FEES.TRANSACTION_FEE + ipfsFee;

    setFees({
      creationFee,
      mintingFee,
      transactionFee: RAPTOREUM_FEES.TRANSACTION_FEE,
      ipfsFee,
      totalFee
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Asset name must be at least 3 characters';
    }

    if (!formData.description) {
      newErrors.description = 'Description is required';
    }

    if (formData.circulation <= 0) {
      newErrors.circulation = 'Circulation must be greater than 0';
    }

    if (formData.decimals < 0 || formData.decimals > 8) {
      newErrors.decimals = 'Decimals must be between 0 and 8';
    }

    if (walletBalance < fees.totalFee) {
      newErrors.balance = `Insufficient balance. Need ${fees.totalFee} RTM, have ${walletBalance} RTM`;
    }

    // Validate asset name format (Raptoreum specific rules)
    const assetNameRegex = /^[A-Z][A-Z0-9_]{2,29}$/;
    if (formData.name && !assetNameRegex.test(formData.name)) {
      newErrors.name = 'Asset name must start with A-Z, contain only A-Z, 0-9, _, and be 3-30 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // In production, this would upload to IPFS
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await axios.post('/api/ipfs/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      handleInputChange('ipfsData', response.data.hash);
      handleInputChange('hasIPFS', true);
      
      toast({
        title: "File Uploaded",
        description: `File uploaded to IPFS: ${response.data.hash}`
      });
    } catch (error) {
      console.error('IPFS upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to IPFS",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const createAsset = async () => {
    if (!validateForm()) return;

    setCreating(true);
    try {
      // Prepare asset creation data for Raptoreum RPC (combines creation + minting)
      const assetData = {
        name: formData.name,
        qty: formData.circulation, // Circulation amount to mint immediately
        units: formData.decimals,
        reissuable: formData.reissuable ? 1 : 0,
        has_ipfs: formData.hasIPFS ? 1 : 0,
        ipfs_hash: formData.ipfsData || '',
        description: formData.description,
        create_and_mint: true // Combined process flag
      };

      // In production, this would call the actual Raptoreum RPC createasset command
      const response = await axios.post('/api/raptoreum/createasset', {
        wallet_address: wallet.address,
        asset_data: assetData,
        fees: fees
      });

      toast({
        title: "Asset Created Successfully! 🎉",
        description: `${formData.name} has been created on the Raptoreum blockchain`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        circulation: 1,
        decimals: 0,
        reissuable: false,
        hasIPFS: false,
        ipfsData: '',
        isUnique: false,
        parentAsset: '',
        updateable: true
      });

      onClose();
    } catch (error) {
      console.error('Asset creation failed:', error);
      toast({
        title: "Asset Creation Failed",
        description: error.response?.data?.detail || "Failed to create asset on Raptoreum blockchain",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const AssetPreview = () => (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Coins className="h-4 w-4 text-white" />
          </div>
          <span>{formData.name || 'Asset Name'}</span>
          <Badge className={`${
            formData.isUnique ? 'bg-purple-900/30 text-purple-300' :
            formData.reissuable ? 'bg-green-900/30 text-green-300' :
            'bg-blue-900/30 text-blue-300'
          }`}>
            {formData.isUnique ? 'UNIQUE' : formData.reissuable ? 'REISSUABLE' : 'STANDARD'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-300 text-sm">{formData.description || 'Asset description'}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Circulation:</span>
            <span className="text-white ml-2">{formData.circulation.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Decimals:</span>
            <span className="text-white ml-2">{formData.decimals}</span>
          </div>
          <div>
            <span className="text-gray-400">Reissuable:</span>
            <span className={`ml-2 ${formData.reissuable ? 'text-green-400' : 'text-red-400'}`}>
              {formData.reissuable ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">IPFS:</span>
            <span className={`ml-2 ${formData.hasIPFS ? 'text-green-400' : 'text-gray-400'}`}>
              {formData.hasIPFS ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        {formData.hasIPFS && formData.ipfsData && (
          <div className="mt-3 p-2 bg-gray-700/50 rounded text-xs">
            <span className="text-gray-400">IPFS Hash:</span>
            <span className="text-blue-400 ml-2 font-mono">{formData.ipfsData}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const FeeBreakdown = () => (
    <Card className="bg-gradient-to-br from-yellow-950/30 to-orange-950/30 border-yellow-800/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-300">
          <DollarSign className="h-5 w-5" />
          Fee Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Asset Creation:</span>
            <span className="text-white">{fees.creationFee} RTM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Asset Minting:</span>
            <span className="text-white">{fees.mintingFee} RTM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Transaction Fee:</span>
            <span className="text-white">{fees.transactionFee} RTM</span>
          </div>
          {fees.ipfsFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">IPFS Storage:</span>
              <span className="text-white">{fees.ipfsFee} RTM</span>
            </div>
          )}
          <hr className="border-gray-600" />
          <div className="flex justify-between font-semibold">
            <span className="text-yellow-300">Total Fee:</span>
            <span className="text-yellow-300">{fees.totalFee} RTM</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Includes creation (100 RTM) + minting (100 RTM) in one process
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Wallet Balance:</span>
            <span className={`${walletBalance >= fees.totalFee ? 'text-green-400' : 'text-red-400'}`}>
              {walletBalance} RTM
            </span>
          </div>
          {walletBalance < fees.totalFee && (
            <div className="mt-2 flex items-center text-red-400 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Insufficient balance for asset creation
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-4xl max-h-[90vh] overflow-y-auto mobile-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <span>Create Raptoreum Asset</span>
            <Badge className="bg-blue-900/30 text-blue-300 border-blue-700/50">
              Standard Creation
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 rounded-lg border border-blue-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Raptoreum Asset Creation</span>
            </div>
            <p className="text-xs text-gray-300">
              Create assets directly on the Raptoreum blockchain. All fees are paid in RTM and burned by the network.
              Assets are immediately available and searchable on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-gray-800/30 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-400" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Asset Name *</Label>
                    <Input
                      placeholder="MYASSET (3-30 chars, A-Z, 0-9, _)"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                      className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label className="text-white">Description *</Label>
                    <Textarea
                      placeholder="Describe your asset..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 ${
                        errors.description ? 'border-red-500' : ''
                      }`}
                      rows={3}
                    />
                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Properties */}
              <Card className="bg-gray-800/30 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-400" />
                    Asset Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Circulation *</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        min="1"
                        value={formData.circulation}
                        onChange={(e) => handleInputChange('circulation', parseInt(e.target.value) || 1)}
                        className={`bg-gray-800/50 border-gray-600 text-white ${
                          errors.circulation ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.circulation && <p className="text-red-400 text-xs mt-1">{errors.circulation}</p>}
                      <p className="text-xs text-gray-400 mt-1">Initial circulation to mint</p>
                    </div>

                    <div>
                      <Label className="text-white">Decimals</Label>
                      <Select 
                        value={formData.decimals.toString()} 
                        onValueChange={(value) => handleInputChange('decimals', parseInt(value))}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue className="text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-white">
                          {[0,1,2,3,4,5,6,7,8].map(d => (
                            <SelectItem key={d} value={d.toString()} className="text-white hover:bg-gray-700">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Reissuable</Label>
                        <p className="text-xs text-gray-400">Allow creating more units later</p>
                      </div>
                      <Switch
                        checked={formData.reissuable}
                        onCheckedChange={(checked) => handleInputChange('reissuable', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Unique Asset</Label>
                        <p className="text-xs text-gray-400">Create a one-of-a-kind NFT</p>
                      </div>
                      <Switch
                        checked={formData.isUnique}
                        onCheckedChange={(checked) => {
                          handleInputChange('isUnique', checked);
                          if (checked) {
                            handleInputChange('quantity', 1);
                            handleInputChange('reissuable', false);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">IPFS Data</Label>
                        <p className="text-xs text-gray-400">Attach metadata or files</p>
                      </div>
                      <Switch
                        checked={formData.hasIPFS}
                        onCheckedChange={(checked) => handleInputChange('hasIPFS', checked)}
                      />
                    </div>
                  </div>

                  {formData.hasIPFS && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white">Upload File</Label>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('file-upload').click()}
                            disabled={uploading}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            {uploading ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            {uploading ? 'Uploading...' : 'Upload to IPFS'}
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                            accept="image/*,video/*,audio/*,.pdf,.json"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">IPFS Hash (Optional)</Label>
                        <Input
                          placeholder="QmYourIPFSHashHere..."
                          value={formData.ipfsData}
                          onChange={(e) => handleInputChange('ipfsData', e.target.value)}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview and Fee Column */}
            <div className="space-y-6">
              {/* Preview Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={previewMode}
                  onCheckedChange={setPreviewMode}
                />
                <Label className="text-white">Show Preview</Label>
              </div>

              {previewMode && <AssetPreview />}
              <FeeBreakdown />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={createAsset}
                  disabled={creating || walletBalance < fees.totalFee || Object.keys(errors).length > 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating Asset...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Create Asset ({fees.totalFee} RTM)
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>

              {errors.balance && (
                <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
                  <div className="flex items-center text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {errors.balance}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StandardAssetCreator;