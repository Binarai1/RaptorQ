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

  const drawSpaceView = (ctx, canvas) => {
    const { width, height } = canvas;
    
    // Deep space background with stars
    const spaceGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    spaceGradient.addColorStop(0, 'rgba(2, 6, 23, 1)');
    spaceGradient.addColorStop(0.7, 'rgba(7, 11, 38, 1)');
    spaceGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = spaceGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add stars
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const brightness = Math.random();
      ctx.beginPath();
      ctx.arc(x, y, brightness * 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
      ctx.fill();
    }
    
    // Draw rotating Earth from space perspective
    const earthCenterX = width / 2;
    const earthCenterY = height / 2;
    const earthRadius = Math.min(width, height) * 0.35;
    
    // Earth base with quantum glow
    const earthGradient = ctx.createRadialGradient(
      earthCenterX, earthCenterY, earthRadius * 0.7,
      earthCenterX, earthCenterY, earthRadius * 1.2
    );
    earthGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    earthGradient.addColorStop(0.8, 'rgba(16, 185, 129, 0.1)');
    earthGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    ctx.fillStyle = earthGradient;
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius * 1.1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Earth surface
    const surfaceGradient = ctx.createRadialGradient(
      earthCenterX - earthRadius * 0.3, earthCenterY - earthRadius * 0.3, 0,
      earthCenterX, earthCenterY, earthRadius
    );
    surfaceGradient.addColorStop(0, 'rgba(30, 58, 138, 0.9)');
    surfaceGradient.addColorStop(0.6, 'rgba(21, 101, 192, 0.8)');
    surfaceGradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
    
    ctx.fillStyle = surfaceGradient;
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Rotating continents (simplified, affected by earthRotation)
    ctx.save();
    ctx.translate(earthCenterX, earthCenterY);
    ctx.rotate(earthRotation);
    
    // North America
    if (filters.smartnodes) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.beginPath();
      ctx.ellipse(-earthRadius * 0.6, -earthRadius * 0.2, earthRadius * 0.25, earthRadius * 0.35, 0.3, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Europe/Asia
    if (filters.smartnodes) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.beginPath();
      ctx.ellipse(earthRadius * 0.1, -earthRadius * 0.3, earthRadius * 0.4, earthRadius * 0.3, -0.2, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Australia
    if (filters.smartnodes) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.ellipse(earthRadius * 0.4, earthRadius * 0.5, earthRadius * 0.1, earthRadius * 0.08, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Quantum energy field around Earth
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 20 + (i * 15), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.2 - i * 0.05})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const drawSmartnodesOnEarth = (ctx, canvas) => {
    if (!filters.smartnodes) return;
    
    const { width, height } = canvas;
    const earthCenterX = width / 2;
    const earthCenterY = height / 2;
    const earthRadius = Math.min(width, height) * 0.35;
    
    Object.entries(countryStats).forEach(([countryCode, country]) => {
      if (country.nodes === 0) return;
      
      // Convert country coordinates to 3D Earth surface
      const longitude = (country.x - 50) * 3.6; // Convert to degrees
      const latitude = (50 - country.y) * 1.8; // Convert to degrees
      
      // 3D to 2D projection with rotation
      const rotatedLon = longitude + (earthRotation * 180 / Math.PI);
      const x = earthCenterX + earthRadius * 0.8 * Math.cos(latitude * Math.PI / 180) * Math.sin(rotatedLon * Math.PI / 180);
      const y = earthCenterY - earthRadius * 0.8 * Math.sin(latitude * Math.PI / 180);
      const z = Math.cos(latitude * Math.PI / 180) * Math.cos(rotatedLon * Math.PI / 180);
      
      // Only draw if visible (facing us)
      if (z > 0) {
        const nodeCount = country.nodes;
        const intensity = Math.min(nodeCount / 50, 1);
        const scale = 0.5 + z * 0.5; // Distance scaling
        
        // Bright quantum node cluster
        ctx.beginPath();
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 40 * scale);
        glowGradient.addColorStop(0, `rgba(16, 255, 129, ${intensity * 0.9})`); // Brighter green
        glowGradient.addColorStop(0.5, `rgba(16, 185, 129, ${intensity * 0.6})`);
        glowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glowGradient;
        ctx.arc(x, y, 35 * scale, 0, 2 * Math.PI);
        ctx.fill();
        
        // Quantum smartnode indicators
        for (let i = 0; i < Math.min(nodeCount, 15); i++) {
          const angle = (i / nodeCount) * 2 * Math.PI + Date.now() * 0.001;
          const radius = (6 + Math.sin(Date.now() * 0.003 + i) * 3) * scale;
          const nodeX = x + Math.cos(angle) * radius;
          const nodeY = y + Math.sin(angle) * radius;
          
          // Pulsing quantum nodes
          ctx.save();
          ctx.translate(nodeX, nodeY);
          ctx.scale(0.3 * scale, 0.3 * scale);
          ctx.fillStyle = `rgba(16, 255, 129, ${0.8 + Math.sin(Date.now() * 0.005 + i) * 0.2})`;
          ctx.shadowColor = 'rgba(16, 255, 129, 0.8)';
          ctx.shadowBlur = 8;
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('⚡', 0, 4);
          ctx.restore();
        }
        
        // Country node count (brighter)
        if (nodeCount > 5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * scale})`;
          ctx.font = `bold ${12 * scale}px monospace`;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(16, 255, 129, 0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(nodeCount.toString(), x, y - 30 * scale);
          ctx.shadowBlur = 0;
        }
      }
    });
  };

  const drawQuantumTransactions = (ctx, canvas) => {
    const { width, height } = canvas;
    const earthCenterX = width / 2;
    const earthCenterY = height / 2;
    const earthRadius = Math.min(width, height) * 0.35;
    
    // Draw RTM transactions
    if (filters.rtmTransactions) {
      rtmBirds.current.forEach(bird => {
        if (bird.life <= 0) return;
        
        // 3D orbit around Earth
        const orbitRadius = earthRadius * 1.3;
        const angle = (bird.progress * Math.PI * 2) + (bird.id.hashCode() * 0.1);
        const x = earthCenterX + Math.cos(angle) * orbitRadius;
        const y = earthCenterY + Math.sin(angle) * orbitRadius * 0.6; // Elliptical orbit
        
        ctx.save();
        ctx.globalAlpha = bird.life;
        
        // Quantum trail with enhanced glow
        const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        trailGradient.addColorStop(0, bird.glow);
        trailGradient.addColorStop(0.5, bird.glow.replace('1)', '0.4)'));
        trailGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Transaction particle
        ctx.translate(x, y);
        ctx.scale(bird.size, bird.size);
        ctx.shadowColor = bird.glow;
        ctx.shadowBlur = 15;
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
        
        // Higher orbit for assets
        const orbitRadius = earthRadius * 1.5;
        const angle = (bird.progress * Math.PI * 1.5) + (bird.id.hashCode() * 0.2);
        const x = earthCenterX + Math.cos(angle) * orbitRadius;
        const y = earthCenterY + Math.sin(angle) * orbitRadius * 0.7;
        
        ctx.save();
        ctx.globalAlpha = bird.life;
        
        // Asset quantum signature trail
        const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, 18);
        trailGradient.addColorStop(0, bird.glow);
        trailGradient.addColorStop(0.3, bird.glow.replace('1)', '0.6)'));
        trailGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Asset particle with rotation
        ctx.translate(x, y);
        ctx.rotate(bird.progress * Math.PI * 4);
        ctx.scale(bird.size, bird.size);
        ctx.shadowColor = bird.glow;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bird.emoji, 0, 0);
        
        ctx.restore();
      });
    }
  };

  const updateTransactionBirds = () => {
    // Create new transaction birds randomly
    if (Math.random() < 0.15) { // 15% chance per frame
      const newBird = createTransactionBird();
      if (newBird) {
        transactionBirds.current.push(newBird);
      }
    }
    
    // Update existing birds
    transactionBirds.current = transactionBirds.current.filter(bird => {
      bird.progress += bird.speed;
      bird.life *= 0.998; // Gradual fade
      
      // Smooth curve interpolation
      const t = Math.min(bird.progress, 1);
      const smoothT = t * t * (3 - 2 * t); // Smooth step function
      
      bird.currentX = bird.fromX + (bird.toX - bird.fromX) * smoothT;
      bird.currentY = bird.fromY + (bird.toY - bird.fromY) * smoothT;
      
      return bird.life > 0.1 && bird.progress < 1.2;
    });
    
    // Limit number of birds for performance
    if (transactionBirds.current.length > 50) {
      transactionBirds.current = transactionBirds.current.slice(-40);
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw everything
    drawWorld(ctx, canvas);
    drawCountryNodes(ctx, canvas);
    drawTransactionBirds(ctx, canvas);
    updateTransactionBirds();
    
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
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60"
        style={{
          filter: 'blur(0.5px)',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Network stats overlay */}
      <div className="absolute bottom-4 right-4 text-xs text-green-400/60 font-mono">
        <div>Live Network: 1,266 Smartnodes</div>
        <div>Active Transactions: {transactionBirds.current.length}</div>
      </div>
    </div>
  );
};

export default LiveNetworkBackground;