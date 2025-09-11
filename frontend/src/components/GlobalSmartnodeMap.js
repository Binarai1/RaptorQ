import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Globe, Server, Zap, MapPin, Clock, Coins } from 'lucide-react';
import axios from 'axios';

// Country coordinates for major regions
const countryCoordinates = {
  'US': { x: 150, y: 180, name: 'United States' },
  'DE': { x: 420, y: 140, name: 'Germany' },
  'FR': { x: 400, y: 160, name: 'France' },
  'GB': { x: 390, y: 130, name: 'United Kingdom' },
  'NL': { x: 410, y: 130, name: 'Netherlands' },
  'CA': { x: 120, y: 120, name: 'Canada' },
  'AU': { x: 650, y: 280, name: 'Australia' },
  'JP': { x: 640, y: 170, name: 'Japan' },
  'SG': { x: 580, y: 220, name: 'Singapore' },
  'BR': { x: 240, y: 260, name: 'Brazil' },
  'RU': { x: 500, y: 100, name: 'Russia' },
  'CN': { x: 580, y: 160, name: 'China' },
  'IN': { x: 540, y: 200, name: 'India' },
  'KR': { x: 620, y: 170, name: 'South Korea' },
  'FI': { x: 440, y: 80, name: 'Finland' },
  'SE': { x: 430, y: 90, name: 'Sweden' },
  'NO': { x: 420, y: 80, name: 'Norway' },
  'CH': { x: 415, y: 155, name: 'Switzerland' },
  'AT': { x: 425, y: 155, name: 'Austria' }
};

// IP to country mapping (simplified)
const ipToCountry = (ip) => {
  const ipParts = ip.split('.');
  const firstOctet = parseInt(ipParts[0]);
  
  // Simplified mapping based on IP ranges (in production, use proper geolocation)
  if (firstOctet >= 1 && firstOctet <= 36) return 'US';
  if (firstOctet >= 37 && firstOctet <= 46) return 'US';
  if (firstOctet >= 85 && firstOctet <= 95) return 'DE';
  if (firstOctet >= 78 && firstOctet <= 81) return 'GB';
  if (firstOctet >= 144 && firstOctet <= 149) return 'US';
  if (firstOctet >= 167 && firstOctet <= 172) return 'US';
  if (firstOctet >= 185 && firstOctet <= 188) return 'NL';
  if (firstOctet >= 194 && firstOctet <= 195) return 'FR';
  if (firstOctet >= 207 && firstOctet <= 209) return 'CA';
  if (firstOctet >= 103 && firstOctet <= 104) return 'SG';
  if (firstOctet >= 202 && firstOctet <= 203) return 'AU';
  if (firstOctet >= 61 && firstOctet <= 62) return 'AU';
  if (firstOctet >= 125 && firstOctet <= 126) return 'JP';
  if (firstOctet >= 210 && firstOctet <= 211) return 'KR';
  if (firstOctet >= 200 && firstOctet <= 201) return 'BR';
  if (firstOctet >= 5 && firstOctet <= 10) return 'RU';
  if (firstOctet >= 219 && firstOctet <= 222) return 'CN';
  if (firstOctet >= 117 && firstOctet <= 119) return 'IN';
  if (firstOctet >= 130 && firstOctet <= 135) return 'FI';
  
  // Default fallback
  return 'US';
};

const GlobalSmartnodeMap = ({ onClose, isOpen = false }) => {
  const [smartnodes, setSmartnodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [countryStats, setCountryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [animationNodes, setAnimationNodes] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadSmartnodesData();
    }
  }, [isOpen]);

  const loadSmartnodesData = async () => {
    try {
      console.log('Loading live Raptoreum network smartnodes...');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/raptoreum/smartnodes/all`);
      const nodes = response.data.smartnodes || [];
      
      // Process nodes and add country/animation data
      const processedNodes = nodes.slice(0, 100).map((node, index) => { // Limit for performance
        const country = ipToCountry(node.ip);
        const coords = countryCoordinates[country] || countryCoordinates['US'];
        
        return {
          ...node,
          country,
          countryName: coords.name,
          x: coords.x + (Math.random() - 0.5) * 60, // Add some spread around country
          y: coords.y + (Math.random() - 0.5) * 40,
          animationDelay: index * 0.1,
          id: `node_${index}`
        };
      });
      
      setSmartnodes(processedNodes);
      setAnimationNodes(processedNodes);
      
      // Calculate country statistics
      const stats = {};
      processedNodes.forEach(node => {
        const country = node.country;
        if (!stats[country]) {
          stats[country] = {
            count: 0,
            earnings: 0,
            name: node.countryName
          };
        }
        stats[country].count++;
        stats[country].earnings += node.earnings_24h || 0;
      });
      
      setCountryStats(stats);
      console.log(`Loaded ${processedNodes.length} smartnodes across ${Object.keys(stats).length} countries`);
      
    } catch (error) {
      console.error('Failed to load smartnodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const WorldMapSVG = () => (
    <svg viewBox="0 0 800 400" className="w-full h-full">
      {/* Simple world map outline */}
      <defs>
        <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      
      {/* Ocean background */}
      <rect width="800" height="400" fill="url(#oceanGradient)" />
      
      {/* Continents (simplified) */}
      <g fill="#374151" stroke="#6b7280" strokeWidth="1">
        {/* North America */}
        <path d="M50,120 L200,100 L250,130 L220,200 L180,220 L120,200 L80,180 Z" />
        
        {/* South America */}
        <path d="M200,240 L280,220 L300,280 L270,320 L240,340 L220,320 L200,280 Z" />
        
        {/* Europe */}
        <path d="M380,120 L460,110 L480,140 L460,160 L420,170 L380,150 Z" />
        
        {/* Asia */}
        <path d="M480,100 L680,120 L700,180 L650,220 L600,200 L500,180 L480,140 Z" />
        
        {/* Africa */}
        <path d="M380,180 L480,170 L500,220 L480,280 L440,300 L400,280 L380,220 Z" />
        
        {/* Australia */}
        <path d="M620,280 L680,270 L700,290 L680,310 L640,320 L620,300 Z" />
      </g>
      
      {/* Animated smartnode birds */}
      {animationNodes.map((node, index) => (
        <g key={node.id}>
          {/* Node glow effect */}
          <circle
            cx={node.x}
            cy={node.y}
            r="8"
            fill="rgba(16, 185, 129, 0.3)"
            className="animate-pulse"
          />
          
          {/* Flying bird emoji as smartnode */}
          <text
            x={node.x}
            y={node.y + 2}
            fontSize="12"
            textAnchor="middle"
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={() => handleNodeClick(node)}
            style={{
              animation: `float 3s ease-in-out infinite`,
              animationDelay: `${node.animationDelay}s`,
              filter: 'drop-shadow(0 0 4px #10b981)'
            }}
          >
            🐦
          </text>
          
          {/* Connection lines between nearby nodes */}
          {index < animationNodes.length - 1 && Math.random() > 0.7 && (
            <line
              x1={node.x}
              y1={node.y}
              x2={animationNodes[index + 1].x}
              y2={animationNodes[index + 1].y}
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="1"
              className="animate-pulse"
            />
          )}
        </g>
      ))}
      
      {/* Country labels with node counts */}
      {Object.entries(countryStats).map(([countryCode, stats]) => {
        const coords = countryCoordinates[countryCode];
        if (!coords || stats.count < 3) return null; // Only show countries with 3+ nodes
        
        return (
          <g key={countryCode}>
            <rect
              x={coords.x - 15}
              y={coords.y - 25}
              width="30"
              height="15"
              fill="rgba(0, 0, 0, 0.8)"
              rx="3"
            />
            <text
              x={coords.x}
              y={coords.y - 15}
              fontSize="8"
              fill="#10b981"
              textAnchor="middle"
              className="font-bold"
            >
              {stats.count}
            </text>
          </g>
        );
      })}
    </svg>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-400" />
            <span>Live Raptoreum Smartnode Network</span>
            <Badge className="bg-green-900/30 text-green-300">
              {smartnodes.length} Active Nodes
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-green-400 animate-spin" />
                <p className="text-gray-400">Loading live smartnode network...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Global Map */}
              <Card className="bg-gray-800/30">
                <CardContent className="p-4">
                  <div className="h-96 relative" ref={mapRef}>
                    <WorldMapSVG />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                      🐦 Flying birds represent live smartnodes • Click birds to view node details
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Country Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(countryStats)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .slice(0, 8)
                  .map(([countryCode, stats]) => (
                    <Card key={countryCode} className="bg-gray-800/30">
                      <CardContent className="p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {stats.count}
                          </div>
                          <div className="text-xs text-gray-400">{stats.name}</div>
                          <div className="text-xs text-yellow-400 mt-1">
                            {stats.earnings.toFixed(1)} RTM/24h
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Node Detail Dialog */}
        {selectedNode && (
          <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
            <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-green-400" />
                  <span>Smartnode Details</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <div className="text-white font-medium">{selectedNode.countryName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <Badge className={selectedNode.status === 'ENABLED' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}>
                      {selectedNode.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">IP Address:</span>
                    <div className="text-white font-mono text-xs">{selectedNode.ip}:{selectedNode.port}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Rank:</span>
                    <div className="text-white font-medium">#{selectedNode.rank}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">24h Earnings:</span>
                    <div className="text-yellow-400 font-medium">{selectedNode.earnings_24h?.toFixed(2)} RTM</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Earnings:</span>
                    <div className="text-yellow-400 font-medium">{selectedNode.total_earnings?.toFixed(2)} RTM</div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-950/20 rounded-lg border border-green-800/30">
                  <div className="flex items-center space-x-2 text-xs text-green-300">
                    <Zap className="h-3 w-3" />
                    <span>Quantum Enhanced • Protocol {selectedNode.protocol}</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSmartnodeMap;