import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Country coordinates for realistic world positioning
const countries = {
  'US': { x: 15, y: 45, name: 'United States', nodes: 0 },
  'DE': { x: 52, y: 35, name: 'Germany', nodes: 0 },
  'FR': { x: 50, y: 40, name: 'France', nodes: 0 },
  'GB': { x: 49, y: 32, name: 'United Kingdom', nodes: 0 },
  'NL': { x: 51, y: 32, name: 'Netherlands', nodes: 0 },
  'CA': { x: 12, y: 30, name: 'Canada', nodes: 0 },
  'AU': { x: 81, y: 70, name: 'Australia', nodes: 0 },
  'JP': { x: 80, y: 43, name: 'Japan', nodes: 0 },
  'SG': { x: 72, y: 55, name: 'Singapore', nodes: 0 },
  'BR': { x: 30, y: 65, name: 'Brazil', nodes: 0 },
  'RU': { x: 62, y: 25, name: 'Russia', nodes: 0 },
  'CN': { x: 72, y: 40, name: 'China', nodes: 0 },
  'IN': { x: 67, y: 50, name: 'India', nodes: 0 },
  'KR': { x: 77, y: 43, name: 'South Korea', nodes: 0 },
  'FI': { x: 55, y: 20, name: 'Finland', nodes: 0 },
  'SE': { x: 53, y: 22, name: 'Sweden', nodes: 0 },
  'NO': { x: 52, y: 20, name: 'Norway', nodes: 0 },
  'CH': { x: 52, y: 39, name: 'Switzerland', nodes: 0 }
};

// IP to country mapping (enhanced)
const ipToCountry = (ip) => {
  const ipParts = ip.split('.');
  const firstOctet = parseInt(ipParts[0]);
  
  if (firstOctet >= 1 && firstOctet <= 50) return 'US';
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
  
  return 'US';
};

const LiveNetworkBackground = ({ isActive = true, isFullscreen = false, onMinimize }) => {
  const [networkData, setNetworkData] = useState({ smartnodes: [], transactions: [] });
  const [countryStats, setCountryStats] = useState(countries);
  const [loading, setLoading] = useState(true);
  const [animationNodes, setAnimationNodes] = useState([]);
  const [filters, setFilters] = useState({
    assetTransactions: true,
    rtmTransactions: true,
    smartnodes: true
  });
  const [earthRotation, setEarthRotation] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const transactionBirds = useRef([]);
  const assetBirds = useRef([]);
  const rtmBirds = useRef([]);

  useEffect(() => {
    if (isActive) {
      loadNetworkData();
      startAnimation();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  const loadNetworkData = async () => {
    try {
      console.log('Loading live Raptoreum network data for background...');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/raptoreum/smartnodes/all`);
      const smartnodes = response.data.smartnodes || [];
      
      // Process smartnodes and count by country
      const updatedCountries = { ...countries };
      Object.keys(updatedCountries).forEach(key => {
        updatedCountries[key].nodes = 0;
      });
      
      // Distribute 1266 smartnodes across countries based on real network
      smartnodes.forEach(node => {
        const country = ipToCountry(node.ip);
        if (updatedCountries[country]) {
          updatedCountries[country].nodes++;
        }
      });
      
      setCountryStats(updatedCountries);
      setNetworkData({ smartnodes: smartnodes.slice(0, 200), transactions: [] });
      
      console.log(`Loaded ${smartnodes.length} smartnodes for background visualization`);
      
    } catch (error) {
      console.error('Failed to load network data:', error);
    }
  };

  const createTransactionBird = (type = 'rtm') => {
    const fromCountries = Object.keys(countryStats).filter(k => countryStats[k].nodes > 0);
    const fromCountry = fromCountries[Math.floor(Math.random() * fromCountries.length)];
    const toCountry = fromCountries[Math.floor(Math.random() * fromCountries.length)];
    
    if (fromCountry === toCountry) return null;
    
    const from = countryStats[fromCountry];
    const to = countryStats[toCountry];
    
    // Different properties based on transaction type
    const typeConfig = {
      rtm: {
        color: 'rgba(34, 211, 238, 1)', // Cyan for RTM
        size: Math.random() * 0.4 + 0.3,
        speed: Math.random() * 0.012 + 0.008,
        emoji: '💎',
        glow: 'rgba(34, 211, 238, 0.8)'
      },
      asset: {
        color: 'rgba(251, 191, 36, 1)', // Golden for assets
        size: Math.random() * 0.5 + 0.4,
        speed: Math.random() * 0.010 + 0.006,
        emoji: '🔰',
        glow: 'rgba(251, 191, 36, 0.9)'
      }
    };
    
    const config = typeConfig[type] || typeConfig.rtm;
    
    return {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
      currentX: from.x,
      currentY: from.y,
      progress: 0,
      life: 1.0,
      size: config.size,
      speed: config.speed,
      color: config.color,
      emoji: config.emoji,
      glow: config.glow,
      glowIntensity: Math.random() * 0.9 + 0.6 // Brighter
    };
  };

  const drawWorld = (ctx, canvas) => {
    const { width, height } = canvas;
    
    // Clear canvas with deep space background (brighter)
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const brightness = Math.random();
      ctx.beginPath();
      ctx.arc(x, y, brightness * 1, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.6})`;
      ctx.fill();
    }
    
    // Draw continent outlines with rotation effect
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.rotate(earthRotation * 0.1); // Slow Earth rotation
    ctx.translate(-width/2, -height/2);
    
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 4]);
    
    // North America (shifted slightly with rotation)
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.3);
    ctx.lineTo(width * 0.25, height * 0.25);
    ctx.lineTo(width * 0.31, height * 0.33);
    ctx.lineTo(width * 0.27, height * 0.5);
    ctx.lineTo(width * 0.15, height * 0.45);
    ctx.closePath();
    ctx.stroke();
    
    // Europe/Asia
    ctx.beginPath();
    ctx.moveTo(width * 0.47, height * 0.3);
    ctx.lineTo(width * 0.85, height * 0.3);
    ctx.lineTo(width * 0.87, height * 0.45);
    ctx.lineTo(width * 0.81, height * 0.55);
    ctx.lineTo(width * 0.47, height * 0.42);
    ctx.closePath();
    ctx.stroke();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.77, height * 0.7, width * 0.08, height * 0.06, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
    ctx.setLineDash([]);
  };

  const drawCountryNodes = (ctx, canvas) => {
    if (!filters.smartnodes) return;
    
    const { width, height } = canvas;
    
    Object.entries(countryStats).forEach(([countryCode, country]) => {
      if (country.nodes === 0) return;
      
      // Apply rotation to coordinates
      const baseX = width * (country.x / 100);
      const baseY = height * (country.y / 100);
      
      // Rotate around center of screen
      const centerX = width / 2;
      const centerY = height / 2;
      const rotatedX = centerX + (baseX - centerX) * Math.cos(earthRotation * 0.2) - (baseY - centerY) * Math.sin(earthRotation * 0.2);
      const rotatedY = centerY + (baseX - centerX) * Math.sin(earthRotation * 0.2) + (baseY - centerY) * Math.cos(earthRotation * 0.2);
      
      const nodeCount = country.nodes;
      const intensity = Math.min(nodeCount / 50, 1); // Max intensity at 50+ nodes
      
      // Country glow (brighter)
      ctx.beginPath();
      const glowGradient = ctx.createRadialGradient(rotatedX, rotatedY, 0, rotatedX, rotatedY, 40);
      glowGradient.addColorStop(0, `rgba(16, 255, 129, ${intensity * 0.8})`); // Brighter
      glowGradient.addColorStop(0.5, `rgba(16, 185, 129, ${intensity * 0.6})`);
      glowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowGradient;
      ctx.arc(rotatedX, rotatedY, 35, 0, 2 * Math.PI);
      ctx.fill();
      
      // Smartnode cluster
      for (let i = 0; i < Math.min(nodeCount, 20); i++) {
        const angle = (i / nodeCount) * 2 * Math.PI + Date.now() * 0.001;
        const radius = 8 + Math.random() * 12;
        const nodeX = rotatedX + Math.cos(angle) * radius;
        const nodeY = rotatedY + Math.sin(angle) * radius;
        
        // Brighter smartnode birds
        ctx.save();
        ctx.translate(nodeX, nodeY);
        ctx.scale(0.5, 0.5);
        ctx.fillStyle = `rgba(16, 255, 129, ${0.9 + Math.random() * 0.1})`;
        ctx.shadowColor = 'rgba(16, 255, 129, 0.8)';
        ctx.shadowBlur = 6;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐦', 0, 0);
        ctx.restore();
      }
      
      // Country label for major nodes (brighter)
      if (nodeCount > 10) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(16, 255, 129, 0.6)';
        ctx.shadowBlur = 3;
        ctx.fillText(nodeCount.toString(), rotatedX, rotatedY - 30);
        ctx.shadowBlur = 0;
      }
    });
  };

  const drawTransactionBirds = (ctx, canvas) => {
    const { width, height } = canvas;
    
    // Draw RTM transactions
    if (filters.rtmTransactions) {
      rtmBirds.current.forEach(bird => {
        if (bird.life <= 0) return;
        
        const x = width * (bird.currentX / 100);
        const y = height * (bird.currentY / 100);
        
        ctx.save();
        ctx.globalAlpha = bird.life * 0.8;
        
        // Glowing trail (brighter)
        const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        trailGradient.addColorStop(0, bird.glow);
        trailGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Transaction bird
        ctx.translate(x, y);
        ctx.scale(bird.size, bird.size);
        ctx.shadowColor = bird.glow;
        ctx.shadowBlur = 10;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bird.emoji, 0, 0);
        
        ctx.restore();
      });
    }
    
    // Draw Asset transactions
    if (filters.assetTransactions) {
      assetBirds.current.forEach(bird => {
        if (bird.life <= 0) return;
        
        const x = width * (bird.currentX / 100);
        const y = height * (bird.currentY / 100);
        
        ctx.save();
        ctx.globalAlpha = bird.life * 0.9;
        
        // Asset trail (brighter)
        const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        trailGradient.addColorStop(0, bird.glow);
        trailGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Asset bird
        ctx.translate(x, y);
        ctx.rotate(bird.progress * Math.PI * 2);
        ctx.scale(bird.size, bird.size);
        ctx.shadowColor = bird.glow;
        ctx.shadowBlur = 12;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bird.emoji, 0, 0);
        
        ctx.restore();
      });
    }
  };

  // Simple hash function for deterministic positioning
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const updateTransactionBirds = () => {
    // Create RTM transactions
    if (filters.rtmTransactions && Math.random() < 0.10) {
      const newBird = createTransactionBird('rtm');
      if (newBird) {
        rtmBirds.current.push(newBird);
      }
    }
    
    // Create Asset transactions (less frequent)
    if (filters.assetTransactions && Math.random() < 0.05) {
      const newBird = createTransactionBird('asset');
      if (newBird) {
        assetBirds.current.push(newBird);
      }
    }
    
    // Update RTM transactions
    rtmBirds.current = rtmBirds.current.filter(bird => {
      bird.progress += bird.speed;
      bird.life *= 0.998;
      
      // Smooth movement between countries
      const t = Math.min(bird.progress, 1);
      const smoothT = t * t * (3 - 2 * t);
      
      bird.currentX = bird.fromX + (bird.toX - bird.fromX) * smoothT;
      bird.currentY = bird.fromY + (bird.toY - bird.fromY) * smoothT;
      
      return bird.life > 0.1 && bird.progress < 1.2;
    });
    
    // Update Asset transactions
    assetBirds.current = assetBirds.current.filter(bird => {
      bird.progress += bird.speed;
      bird.life *= 0.997;
      
      // Smooth movement between countries
      const t = Math.min(bird.progress, 1);
      const smoothT = t * t * (3 - 2 * t);
      
      bird.currentX = bird.fromX + (bird.toX - bird.fromX) * smoothT;
      bird.currentY = bird.fromY + (bird.toY - bird.fromY) * smoothT;
      
      return bird.life > 0.1 && bird.progress < 1.3;
    });
    
    // Limit for performance
    if (rtmBirds.current.length > 30) rtmBirds.current = rtmBirds.current.slice(-25);
    if (assetBirds.current.length > 15) assetBirds.current = assetBirds.current.slice(-12);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Update Earth rotation (slow)
    setEarthRotation(prev => prev + 0.002);
    
    // Draw space view
    drawSpaceView(ctx, canvas);
    drawSmartnodesOnEarth(ctx, canvas);
    drawQuantumTransactions(ctx, canvas);
    updateQuantumTransactions();
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
  };

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 z-0 ${isFullscreen ? 'pointer-events-auto bg-black' : 'pointer-events-none'}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          opacity: isFullscreen ? 1 : 0.7,
          filter: isFullscreen ? 'none' : 'blur(0.3px)',
          mixBlendMode: isFullscreen ? 'normal' : 'screen'
        }}
      />
      
      {/* Fullscreen Controls */}
      {isFullscreen && (
        <>
          {/* Filter Controls */}
          <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-green-400/30">
            <h3 className="text-white font-bold mb-3 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-green-400" />
              Quantum Network Filters
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={filters.assetTransactions}
                  onChange={(e) => setFilters(prev => ({...prev, assetTransactions: e.target.checked}))}
                  className="rounded bg-gray-800 border-green-400"
                />
                <span>Asset Transactions</span>
                <span className="text-yellow-400 text-xs">({assetBirds.current.length} active)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={filters.rtmTransactions}
                  onChange={(e) => setFilters(prev => ({...prev, rtmTransactions: e.target.checked}))}
                  className="rounded bg-gray-800 border-cyan-400"
                />
                <span>RTM Transactions</span>
                <span className="text-cyan-400 text-xs">({rtmBirds.current.length} active)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={filters.smartnodes}
                  onChange={(e) => setFilters(prev => ({...prev, smartnodes: e.target.checked}))}
                  className="rounded bg-gray-800 border-green-400"
                />
                <span>Smartnode Clusters</span>
                <span className="text-green-400 text-xs">(1,266 nodes)</span>
              </label>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onMinimize}
            className="absolute top-6 right-6 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Minimize View
          </button>
          
          {/* Enhanced Network Stats */}
          <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-green-400/30">
            <div className="text-green-400 font-mono text-sm space-y-1">
              <div className="text-white font-bold mb-2">Live Quantum Network</div>
              <div>⚡ Smartnodes: 1,266 active</div>
              <div>💎 RTM Transactions: {rtmBirds.current.length}</div>
              <div>🔰 Asset Transactions: {assetBirds.current.length}</div>
              <div>🌍 Earth Rotation: {(earthRotation * 180 / Math.PI % 360).toFixed(1)}°</div>
              <div className="text-cyan-400 text-xs mt-2">Viewing from quantum space station</div>
            </div>
          </div>
        </>
      )}
      
      {/* Background mode stats */}
      {!isFullscreen && (
        <div className="absolute bottom-4 right-4 text-xs text-green-400/60 font-mono">
          <div>Live Network: 1,266 Smartnodes</div>
          <div>Transactions: {rtmBirds.current.length + assetBirds.current.length}</div>
        </div>
      )}
    </div>
  );
};

export default LiveNetworkBackground;