"use client";

import { useState } from "react";
import { Search, Target, Activity, FileText, TrendingUp } from "lucide-react";

export default function RadarPage() {
  const [threshold, setThreshold] = useState(7.5);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)] gap-6 max-w-[1600px]">
      {/* Left Panel: Controls & Active Hotspots */}
      <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Controls</h1>
          <p className="text-xs text-[#888] font-mono tracking-widest uppercase mb-6">Configure radar parameters & layers.</p>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Map Base</label>
              <div className="flex border border-[#333] rounded-sm overflow-hidden p-1 bg-[#111]">
                <button className="flex-1 py-1.5 text-[10px] font-mono tracking-widest uppercase text-white bg-[#333] rounded-sm">Satellite</button>
                <button className="flex-1 py-1.5 text-[10px] font-mono tracking-widest uppercase text-[#888] hover:text-white transition-colors">Terrain</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Risk Overlays</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-[#facc15] bg-[#facc15]/20 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#facc15] rounded-sm"></div>
                  </div>
                  <span className="text-sm text-white group-hover:text-[#facc15] transition-colors">Fiber Cuts (Historical)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-[#666] rounded-sm flex items-center justify-center"></div>
                  <span className="text-sm text-[#888] group-hover:text-white transition-colors">Power Grid Stability</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-[#facc15] bg-[#facc15]/20 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#facc15] rounded-sm"></div>
                  </div>
                  <span className="text-sm text-white group-hover:text-[#facc15] transition-colors">Social Unrest Heatmap</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-[#666] rounded-sm flex items-center justify-center"></div>
                  <span className="text-sm text-[#888] group-hover:text-white transition-colors">Weather Anomalies</span>
                </label>
              </div>
            </div>

            <div className="space-y-5 border-t border-[#333] pt-6">
              <label className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Parameters</label>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                  <span className="text-[#888]">Severity Threshold</span>
                  <span className="text-[#facc15] font-bold">{threshold.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="10" step="0.1" 
                  value={threshold} 
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#facc15]" 
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-[#666]">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                  <span className="text-[#888]">Time Horizon</span>
                  <span className="text-white">Last 7 Days</span>
                </div>
                <div className="h-8 bg-[#111] border border-[#333] rounded-sm flex">
                  <div className="w-1/4 bg-[#333] border-r border-[#444]"></div>
                  <div className="flex-1 bg-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="text-[10px] font-mono tracking-widest uppercase text-[#888] mb-3 block">Active Hotspots</label>
          <div className="space-y-2">
            <div className="bg-[#111] border border-[#ef4444] p-4 flex justify-between items-center cursor-pointer">
              <span className="text-white text-sm font-bold">Ashanti</span>
              <span className="text-[#ef4444] font-mono font-bold">9.2</span>
            </div>
            <div className="bg-[#111] border border-[#facc15] p-4 flex justify-between items-center cursor-pointer hover:bg-[#222] transition-colors">
              <span className="text-white text-sm">Greater Accra</span>
              <span className="text-[#facc15] font-mono font-bold">6.8</span>
            </div>
            <div className="bg-[#111] border border-[#333] p-4 flex justify-between items-center cursor-pointer hover:border-[#666] transition-colors">
              <span className="text-[#888] text-sm">Western</span>
              <span className="text-[#888] font-mono font-bold">4.1</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-8">
          <button className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-3.5 transition-colors flex items-center justify-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase">
            <Activity size={16} />
            ANALYZE RISK
          </button>
        </div>
      </div>

      {/* Center: Map Area */}
      <div className="flex-1 relative border border-[#333] overflow-hidden bg-black">
        {/* Top bar on map */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input 
              type="text" 
              placeholder="Search coordinates..." 
              className="bg-black/80 backdrop-blur-md border border-[#333] pl-9 pr-4 py-2.5 text-[10px] font-mono tracking-widest uppercase text-white focus:outline-none focus:border-[#facc15] w-64"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button className="w-8 h-8 bg-black/80 backdrop-blur-md border border-[#333] text-white flex items-center justify-center hover:bg-[#111] transition-colors">+</button>
            <button className="w-8 h-8 bg-black/80 backdrop-blur-md border border-[#333] text-white flex items-center justify-center hover:bg-[#111] transition-colors">-</button>
            <button className="w-8 h-8 bg-black/80 backdrop-blur-md border border-[#333] mt-2 text-white flex items-center justify-center hover:bg-[#111] transition-colors"><Target size={16} /></button>
          </div>
        </div>

        {/* Abstract Map Graphic Representation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          {/* Mock path representing the country border */}
          <svg viewBox="0 0 400 500" className="w-full h-full max-w-[80%] max-h-[80%] drop-shadow-2xl">
             <path d="M 150 20 L 250 50 L 300 150 L 320 250 L 300 350 L 250 450 L 150 480 L 80 350 L 100 200 Z" 
                   fill="none" 
                   stroke="#333" 
                   strokeWidth="2" 
                   strokeDasharray="4 4"
             />
             <path d="M 160 30 L 240 60 L 290 150 L 310 250 L 290 340 L 240 440 L 160 470 L 90 350 L 110 200 Z" 
                   fill="#111" 
                   stroke="#444" 
                   strokeWidth="1" 
             />
          </svg>
        </div>

        {/* Hotspots */}
        {/* Ashanti (Critical) */}
        <div className="absolute top-[40%] left-[35%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-24 bg-[#ef4444]/20 rounded-full blur-xl absolute -top-10 -left-10 animate-pulse"></div>
          <div className="w-4 h-4 bg-[#ef4444] rounded-full border border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10 relative"></div>
        </div>

        {/* Greater Accra (Warning) */}
        <div className="absolute top-[65%] left-[55%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 bg-[#facc15]/20 rounded-full blur-lg absolute -top-6 -left-6 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="w-3 h-3 bg-[#facc15] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] z-10 relative"></div>
        </div>

        {/* Western (Monitor) */}
        <div className="absolute top-[75%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-[#666] rounded-full shadow-[0_0_5px_rgba(102,102,102,0.5)] z-10 relative"></div>
        </div>

      </div>

      {/* Right Detail Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        
        {/* Header Region Info */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-6 bg-[#22c55e] relative overflow-hidden flex flex-col border border-[#333]">
                <div className="flex-1 bg-[#ef4444]"></div>
                <div className="flex-1 bg-[#facc15]"></div>
                <div className="flex-1 bg-[#22c55e]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white">Ashanti Region</h2>
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#888] mt-2">GEO-SECTOR 4A &middot; CENTRAL HUB</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#888] mb-1">Composite Risk</p>
            <p className="text-4xl font-bold text-[#ef4444]">9.2</p>
          </div>
        </div>

        <div className="h-px bg-[#333] my-3"></div>

        {/* Mini Stats */}
        <div className="bg-[#111] border border-[#222] p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Infrastructure Health</span>
            <div className="flex items-end gap-1 h-6">
              <div className="w-2 bg-[#333] h-full"></div>
              <div className="w-2 bg-[#333] h-[80%]"></div>
              <div className="w-2 bg-[#333] h-[90%]"></div>
              <div className="w-2 bg-[#333] h-[60%]"></div>
              <div className="w-2 bg-[#ef4444] h-[40%]"></div>
              <div className="w-2 bg-[#ef4444] h-[30%]"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">-14%</span>
            <TrendingUp size={16} className="text-[#ef4444] rotate-180" />
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] p-5">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Social Sentiment</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-white">Volatile</span>
            <div className="w-32 h-px bg-[#333] relative">
              <div className="absolute top-1/2 left-[70%] -translate-y-1/2 w-3 h-3 bg-[#facc15] border border-black"></div>
            </div>
          </div>
        </div>

        {/* Live Intelligence Feed inside Detail Panel */}
        <div className="bg-[#111] border border-[#222] p-5 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#888] mb-6">Live Intelligence Feed</h3>
          
          <div className="space-y-6">
            <div className="border-l border-[#ef4444] pl-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 font-mono px-1.5 py-0.5 tracking-widest uppercase">Critical</span>
                <span className="text-[10px] text-[#666] font-mono tracking-widest uppercase">14:02 GMT</span>
              </div>
              <p className="text-sm text-[#ccc] leading-relaxed">Protests reported near main switching station in central district.</p>
            </div>

            <div className="border-l border-[#facc15] pl-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/30 font-mono px-1.5 py-0.5 tracking-widest uppercase">Warning</span>
                <span className="text-[10px] text-[#666] font-mono tracking-widest uppercase">11:45 GMT</span>
              </div>
              <p className="text-sm text-[#888] hover:text-[#ccc] transition-colors cursor-pointer leading-relaxed">Fiber optic line #44 experiencing intermittent packet loss due to civil works.</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button className="w-full bg-[#111] border border-[#333] hover:border-[#555] text-white transition-colors p-6 flex flex-col items-center justify-center gap-3 mt-auto group">
          <FileText size={24} className="text-[#888] group-hover:text-white transition-colors" />
          <span className="font-bold text-sm tracking-wide uppercase">Deep Dive Analysis</span>
          <span className="text-[10px] font-mono text-[#888] text-center max-w-[80%] uppercase tracking-widest">Generate comprehensive 48-hour forecast and mitigation plan.</span>
        </button>

      </div>
    </div>
  );
}
