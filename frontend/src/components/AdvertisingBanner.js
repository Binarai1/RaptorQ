import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, X, Zap, Eye } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdvertisingBanner = ({ position = 'header', className = '' }) => {
  const [adData, setAdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadAdvertisements();
    
    // Refresh ads every 5 minutes to get updated content
    const interval = setInterval(loadAdvertisements, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadAdvertisements = async () => {
    try {
      const response = await axios.get(`${API}/advertising/slots`);
      const slots = response.data.slots;
      
      // Get the appropriate ad slot for this position
      const slotName = position === 'header' ? 'header_banner' : 'sidebar_banner';
      const slot = slots[slotName];
      
      if (slot && slot.active && slot.banner_url) {
        setAdData({
          ...slot,
          slotName,
          dailyPriceRTM: response.data.daily_price_rtm,
          dailyPriceUSD: response.data.daily_price_usd
        });
      } else {
        setAdData(null);
      }
    } catch (error) {
      console.error('Failed to load advertisements:', error);
      setAdData(null);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async () => {
    if (!adData) return;
    
    try {
      await axios.post(`${API}/advertising/track-click`, {
        slot_name: adData.slotName,
        url: adData.url
      });
      
      // Open the advertiser's link
      if (adData.url) {
        window.open(adData.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to track ad click:', error);
      // Still open the link even if tracking fails
      if (adData.url) {
        window.open(adData.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const trackImpression = async () => {
    if (!adData) return;
    
    try {
      await axios.post(`${API}/advertising/track-impression`, {
        slot_name: adData.slotName
      });
    } catch (error) {
      console.error('Failed to track ad impression:', error);
    }
  };

  // Track impression when ad becomes visible
  useEffect(() => {
    if (adData && visible) {
      trackImpression();
    }
  }, [adData, visible]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-800/30 rounded-lg h-20"></div>
      </div>
    );
  }

  if (!adData || !visible) {
    return null;
  }

  const AdContent = () => (
    <Card className={`bg-gradient-to-r from-purple-950/30 to-blue-950/30 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 cursor-pointer ${className}`}>
      <CardContent className="p-4" onClick={trackClick}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Ad Image/Banner */}
            {adData.banner_url && (
              <div className="flex-shrink-0">
                <img 
                  src={adData.banner_url} 
                  alt={adData.title || 'Advertisement'}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Ad Content */}
            <div className="flex-grow">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-semibold text-sm">
                  {adData.title || 'Premium Advertisement'}
                </h3>
                <Badge className="bg-purple-900/30 text-purple-300 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                {adData.description || 'Discover quantum-powered services for your RTM experience'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-gray-800/50 text-gray-400 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  {adData.impressions || 0} views
                </Badge>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-gray-500 text-xs">
                  Expires: {new Date(adData.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                trackClick();
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
              className="text-gray-400 hover:text-white p-1"
              title="Hide Ad"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return <AdContent />;
};

// Premium advertising purchase component
export const AdvertisingPurchaseDialog = ({ isOpen, onClose, wallet }) => {
  const [adSlots, setAdSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAdSlots();
    }
  }, [isOpen]);

  const loadAdSlots = async () => {
    try {
      const response = await axios.get(`${API}/advertising/slots`);
      setAdSlots(response.data);
    } catch (error) {
      console.error('Failed to load ad slots:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Premium Advertising Slots</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(adSlots?.slots || {}).map(([slotName, slotData]) => (
          <Card key={slotName} className="bg-gray-800/30 border-gray-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium capitalize">
                  {slotName.replace('_', ' ')}
                </h4>
                <Badge className={slotData.active ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}>
                  {slotData.active ? 'Occupied' : 'Available'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Rate:</span>
                  <span className="text-white">{adSlots.daily_price_rtm?.toFixed(0)} RTM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">USD Value:</span>
                  <span className="text-white">${adSlots.daily_price_usd}</span>
                </div>
                {slotData.active && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expires:</span>
                    <span className="text-white">{new Date(slotData.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <Button
                disabled={slotData.active || loading}
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                onClick={() => setSelectedSlot(slotName)}
              >
                {slotData.active ? 'Slot Occupied' : 'Purchase Slot'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-blue-950/30 border border-blue-800/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="h-4 w-4 text-blue-400" />
          <span className="text-blue-300 font-medium">Premium Advertising Features</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Prime placement in RaptorQ wallet interface</li>
          <li>• Quantum-secured ad delivery and tracking</li>
          <li>• Real-time analytics and click tracking</li>
          <li>• Targeted exposure to RTM holders and traders</li>
          <li>• Professional ad management and optimization</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvertisingBanner;