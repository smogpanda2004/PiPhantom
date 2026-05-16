import React, { useState, useEffect, useRef } from 'react';

// --- PiPhantom FLUID NEON THEME ---
const THEME = {
  purple: '#A855F7', 
  purpleGlow: 'rgba(168, 85, 247, 0.4)',
  pink: '#FF2A5F',   
  pinkGlow: 'rgba(255, 42, 95, 0.4)',
  grid: 'rgba(255, 255, 255, 0.05)', 
};

export default function App() {
  const [running, setRunning] = useState(false);
  const [sensitivity, setSensitivity] = useState(2.5);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Standby');
  const [dataSource, setDataSource] = useState('AWAITING UPLINK...');
  
  // Dynamic Hardware States
  const [nodesMeta, setNodesMeta] = useState({});
  const [nodeHealth, setNodeHealth] = useState({});
  const [nodeVars, setNodeVars] = useState({});
  const [isTracking, setIsTracking] = useState(false);
  
  // Live Telemetry States for the UI Display
  const [displayX, setDisplayX] = useState(0);
  const [displayY, setDisplayY] = useState(0);
  const [peakVar, setPeakVar] = useState(0);

  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  const stateRef = useRef({
    running: false,
    targets: [],
    variances: {},
    statuses: {},
    nodes_meta: {}
  });

  // --- FLAWLESS WEBSOCKET BRIDGE ---
  useEffect(() => {
    let ws;
    const connectWS = () => {
      ws = new WebSocket('ws://localhost:8765');
      ws.onopen = () => setDataSource('LIVE SPATIAL UPLINK');
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        stateRef.current = { ...stateRef.current, ...data };
      };
      ws.onclose = () => {
        setDataSource('UPLINK SEVERED. RECONNECTING...');
        const offlineStatuses = {};
        Object.keys(stateRef.current.statuses).forEach(k => offlineStatuses[k] = false);
        stateRef.current.statuses = offlineStatuses;
        setTimeout(connectWS, 2000);
      };
    };
    connectWS();
    return () => ws?.close();
  }, []);

  useEffect(() => {
    stateRef.current.running = running;
  }, [running]);

  const addLog = (msg, isAlert = false) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, msg, isAlert, id: Date.now() + Math.random() }, ...prev].slice(0, 15));
  };

  const togglePower = () => {
    setRunning(!running);
    setStatus(!running ? 'Scanning Spatial Grid' : 'System Offline');
    addLog(!running ? "4-Node Array Engaged" : "Array Offline");
    if (running) {
      setIsTracking(false);
      setDisplayX(0);
      setDisplayY(0);
      setPeakVar(0);
    }
  };

  // --- HIGH-DPI NEON CANVAS RENDERER ---
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        // High-DPI Scaling for Flawless Glassmorphism rendering
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = parent.clientWidth * dpr;
        canvasRef.current.height = parent.clientHeight * dpr;
        const ctx = canvasRef.current.getContext('2d');
        ctx.scale(dpr, dpr);
        canvasRef.current.style.width = `${parent.clientWidth}px`;
        canvasRef.current.style.height = `${parent.clientHeight}px`;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = parseInt(canvas.style.width, 10);
      const h = parseInt(canvas.style.height, 10);
      const state = stateRef.current;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Radar Grid
      ctx.strokeStyle = THEME.grid; 
      ctx.lineWidth = 1; 
      for(let i = 0; i <= w; i += (w/4)) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
      for(let i = 0; i <= h; i += (h/4)) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

      // 2. Draw Dynamic Hardware Nodes
      Object.values(state.nodes_meta).forEach(node => {
        // Map hardcoded physical X/Y to canvas
        const nodePx = Math.min(Math.max((node.x / 4.0) * w, 25), w - 25);
        const nodePy = Math.min(Math.max((node.y / 4.0) * h, 25), h - 25);
        const isOnline = state.statuses[node.name];

        ctx.beginPath();
        ctx.arc(nodePx, nodePy, 6, 0, Math.PI * 2);
        ctx.fillStyle = isOnline ? THEME.purple : '#4B5563';
        ctx.shadowBlur = isOnline ? 15 : 0;
        ctx.shadowColor = THEME.purple;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(node.name, nodePx - 14, nodePy + 20);
      });

      // 3. Draw Multiple X-Ray Thermal Tracking Blobs (The Multi-Target Update)
      if (state.running && state.targets && state.targets.length > 0) {
        state.targets.forEach(target => {
          // Mapping the 4x4 grid to canvas width/height
          const targetPx = (target.x / 4.0) * w;
          const targetPy = (target.y / 4.0) * h;

          // Fluid neon glow for each target (using the pink theme)
          const gradient = ctx.createRadialGradient(targetPx, targetPy, 0, targetPx, targetPy, 120);
          gradient.addColorStop(0, THEME.pink);
          gradient.addColorStop(0.3, THEME.pinkGlow);
          gradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(targetPx, targetPy, 120, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Target Crosshair & ID Label (TGT-01, TGT-02, etc.)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(targetPx - 15, targetPy); ctx.lineTo(targetPx + 15, targetPy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(targetPx, targetPy - 15); ctx.lineTo(targetPx, targetPy + 15); ctx.stroke();
    
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`[ ${target.id} ]`, targetPx + 18, targetPy - 5);
        });
      }

      // Throttled UI State Updates (Fixing the status bug!)
     
          setNodeHealth({...state.statuses});
          setNodeVars({...state.variances});
          setNodesMeta({...state.nodes_meta});
          
          if (state.running) {
              // Check if the array has any targets
              const hasTargets = state.targets && state.targets.length > 0;
              
              if (isTracking !== hasTargets) {
                  setIsTracking(hasTargets);
                  setStatus(hasTargets ? 'Target Acquired' : 'Grid Secure'); // Fixes "Grid Secure" bug!
                  if (hasTargets) {
                      addLog(`${state.targets.length} Target(s) Tracked`, true);
                  }
              }

              // Update the display variables using the first target for the header info
              if (hasTargets) {
                  setDisplayX(state.targets[0].x);
                  setDisplayY(state.targets[0].y);
              }
              
              const vars = Object.values(state.variances);
              setPeakVar(vars.length > 0 ? Math.max(...vars) : 0);
          }
     

      requestRef.current = requestAnimationFrame(drawCanvas);
    };

    requestRef.current = requestAnimationFrame(drawCanvas);
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTracking]);

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans p-6 md:p-10 flex flex-col relative overflow-hidden">
      
      {/* MASSIVE AMBIENT BACKGROUND GLOWS */}
      <div className={`absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[160px] mix-blend-screen pointer-events-none transition-all duration-1000 opacity-25
        ${isTracking && running ? 'bg-[#FF2A5F]' : running ? 'bg-[#A855F7]' : 'bg-transparent'}`} 
      />
      <div className={`absolute top-[60%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[160px] mix-blend-screen pointer-events-none transition-all duration-1000 opacity-15
        ${isTracking && running ? 'bg-[#FF2A5F]' : running ? 'bg-[#A855F7]' : 'bg-transparent'}`} 
      />

      {/* DYNAMIC ISLAND HEADER */}
      <div className="w-full flex justify-center mb-8 z-10 pt-2">
        <div className="bg-black/40 backdrop-blur-[40px] border border-white/10 rounded-full px-8 py-3.5 flex items-center gap-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isTracking && running ? THEME.pink : THEME.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <h1 className="text-[22px] font-bold tracking-tight text-white/95">PiPhantom</h1>
          </div>
          <div className="w-px h-6 bg-white/15"></div>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${running ? (isTracking ? 'bg-[#FF2A5F] animate-pulse shadow-[0_0_15px_rgba(255,42,95,1)]' : 'bg-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.8)]') : 'bg-gray-600'}`}></div>
            <span className={`text-[15px] font-medium tracking-wide ${isTracking && running ? 'text-[#FF2A5F]' : 'text-white/80'}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CINEMATIC RADAR DISPLAY */}
      <div className="flex-1 w-full bg-black/30 backdrop-blur-[50px] rounded-[40px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
        <div className="absolute top-8 left-10 flex flex-col z-20">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Network Layer</span>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${dataSource.includes('LIVE') ? 'bg-[#A855F7]' : 'bg-gray-600'}`}></div>
            <span className={`text-[12px] font-mono tracking-wider ${dataSource.includes('LIVE') ? 'text-white/90' : 'text-gray-500'}`}>
              {dataSource}
            </span>
          </div>
        </div>
        
        {/* The X-Ray Radar Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen" />
      </div>

      {/* FLOATING GLASS ISLANDS */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 z-10 shrink-0">
        
        {/* Island 1: Command Center */}
        <div className="bg-black/40 backdrop-blur-[50px] border border-white/10 rounded-[36px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col justify-between h-[250px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"></div>
          
          <div className="z-10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="text-[14px] font-semibold text-white/80 tracking-wide">Command Center</h3>
                {Object.keys(nodesMeta).length === 0 && !running && (
                    <span className="text-[10px] text-[#FF2A5F] font-bold tracking-widest animate-pulse">AWAITING NODES...</span>
                )}
            </div>
            <button 
              onClick={togglePower} 
              className={`w-full py-4 rounded-[22px] font-bold text-[16px] tracking-wide transition-all duration-300 active:scale-[0.97] border
                ${running ? 'bg-[#FF2A5F]/10 border-[#FF2A5F]/40 text-[#FF2A5F] hover:bg-[#FF2A5F]/20' 
                          : 'bg-[#A855F7] border-[#A855F7] text-white hover:shadow-[0_8px_30px_-5px_rgba(168,85,247,0.7)] hover:-translate-y-0.5'}`}
            >
              {running ? 'Halt Surveillance' : 'Activate Array'}
            </button>
          </div>
          
          <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Global Threshold</span>
              <div className="bg-white/10 px-2.5 py-1 rounded-lg">
                 <span className="text-[12px] font-mono font-bold text-white/90">{sensitivity.toFixed(1)}</span>
              </div>
            </div>
            <input type="range" min="1" max="10" step="0.1" value={sensitivity} onChange={e => setSensitivity(parseFloat(e.target.value))} 
              className="w-full h-1.5 bg-black/50 rounded-full appearance-none outline-none accent-[#A855F7] cursor-pointer shadow-inner"/>
          </div>
        </div>

        {/* Island 2: Live Hardware Nodes */}
        <div className="bg-black/40 backdrop-blur-[50px] border border-white/10 rounded-[36px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col h-[250px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"></div>
          
          <h3 className="text-[14px] font-semibold text-white/80 tracking-wide mb-4 z-10 border-b border-white/10 pb-3">
            Hardware Nodes ({Object.keys(nodesMeta).length})
          </h3>
          
          <div className="flex flex-col gap-3 z-10 w-full overflow-y-auto pr-2 scrollbar-hide">
            {Object.keys(nodesMeta).length === 0 && (
                <div className="text-xs text-gray-500 font-mono text-center mt-8">NO NODES DISCOVERED</div>
            )}
            {Object.values(nodesMeta).map((node) => {
                const isOnline = nodeHealth[node.name];
                const variance = nodeVars[node.name];
                
                return (
                    <div key={node.name} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-bold tracking-widest text-white/90">{node.name}</span>
                            <span className="text-[9px] font-mono text-gray-500 uppercase">{node.loc} | {node.x}x, {node.y}y</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Variance</span>
                                <span className={`text-[13px] font-mono font-bold ${isOnline ? 'text-blue-300' : 'text-gray-600'}`}>
                                    {isOnline && variance ? variance.toFixed(2) : '--.--'}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="flex items-center gap-2 w-[65px] justify-end">
                                <span className={`text-[10px] font-bold tracking-wider ${isOnline ? 'text-[#A855F7]' : 'text-gray-500'}`}>
                                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#A855F7] shadow-[0_0_8px_#A855F7]' : 'bg-gray-600'}`}></div>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>

        {/* Island 3: Live Logs */}
        <div className="bg-black/40 backdrop-blur-[50px] border border-white/10 rounded-[36px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col h-[250px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"></div>
          
          <h3 className="text-[14px] font-semibold text-white/80 tracking-wide mb-5 z-10 border-b border-white/10 pb-4">System Log</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide z-10">
             {logs.map((l) => (
               <div key={l.id} className="flex flex-col gap-1.5 animate-fade-in border-l-2 border-white/10 pl-4">
                 <span className="text-[10px] text-gray-500 font-mono tracking-widest">{l.time}</span>
                 <span className={`text-[14px] font-medium tracking-wide ${l.isAlert ? 'text-[#FF2A5F]' : 'text-gray-300'}`}>
                   {l.msg}
                 </span>
               </div>
             ))}
             {logs.length === 0 && (
               <div className="flex h-full items-center justify-center text-gray-600 text-[13px] font-medium tracking-wide">
                 Awaiting initialization...
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
