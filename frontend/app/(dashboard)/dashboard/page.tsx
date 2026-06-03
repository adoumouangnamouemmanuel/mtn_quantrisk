"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, FileText, Target, TrendingUp, Bot, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // We assume Chart is available globally via CDN
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Chart = (window as any).Chart;
    if (!Chart) return;

    let lineChart: { destroy: () => void } | null = null;
    let barChart: { destroy: () => void } | null = null;

    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext("2d");
      lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['-30D', '-25D', '-20D', '-15D', '-10D', '-5D', 'TODAY', '+3D', '+7D'],
          datasets: [
            {
              label: 'Historical',
              data: [5.8, 6.2, 5.0, 5.9, 5.3, 6.0, 5.9, null, null],
              borderColor: '#facc15', // yellow
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: 'AI Forecast',
              data: [null, null, null, null, null, null, 5.9, 7.2, 6.5],
              borderColor: '#ffffff',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#111',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              min: 2.5,
              max: 10.0,
              grid: { color: '#222', drawBorder: false },
              ticks: { color: '#666', font: { family: 'monospace', size: 10 } }
            },
            x: {
              grid: { color: '#222', drawBorder: false },
              ticks: { color: '#666', font: { family: 'monospace', size: 10 } }
            }
          }
        }
      });
    }

    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d");
      barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['REGULATORY', 'GEOPOLITICAL', 'MARKET VOLATILITY', 'SUPPLY CHAIN', 'CYBERSECURITY'],
          datasets: [{
            data: [8.4, 7.1, 6.5, 5.2, 4.0],
            backgroundColor: ['#ef4444', '#facc15', '#facc15', '#6366f1', '#0ea5e9'],
            barThickness: 12,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { 
              display: false, 
              max: 10 
            },
            y: {
              grid: { display: false, drawBorder: false },
              ticks: { color: '#888', font: { family: 'monospace', size: 10 } }
            }
          }
        }
      });
    }

    return () => {
      if (lineChart) lineChart.destroy();
      if (barChart) barChart.destroy();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Risk Intelligence Overview</h1>
          <p className="text-[#888] text-sm">Global command center. Live data streams operating at peak efficiency.</p>
        </div>
        <div className="text-right">
          <div className="text-[#facc15] text-xs font-mono font-bold tracking-[0.2em] uppercase mb-1">SYS.TIME: 14:02:45 UTC</div>
          <div className="text-[#888] text-[10px] font-mono tracking-[0.2em] uppercase">ENV: PRODUCTION</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-[#111] border border-[#222] p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] text-[#888] tracking-[0.1em] uppercase font-mono">Active Risk Alerts</h3>
            <AlertTriangle size={16} className="text-[#ef4444] fill-[#ef4444]/20" />
          </div>
          <div className="text-5xl font-bold text-[#ef4444] mb-4">23</div>
          <div className="inline-block bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[10px] font-mono px-2 py-1 rounded-sm uppercase tracking-wider">Live Alerts</div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111] border border-[#222] p-5 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] text-[#888] tracking-[0.1em] uppercase font-mono">Articles Processed</h3>
            <FileText size={16} className="text-[#facc15] fill-[#facc15]/20" />
          </div>
          <div className="text-5xl font-bold text-[#facc15] mb-4">487</div>
          <div className="inline-block bg-[#facc15]/10 border border-[#facc15]/30 text-[#facc15] text-[10px] font-mono px-2 py-1 rounded-sm uppercase tracking-wider">Pipeline Health: 97%</div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111] border border-[#222] p-5 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] text-[#888] tracking-[0.1em] uppercase font-mono">Highest Risk Category</h3>
            <Target size={16} className="text-[#0ea5e9] fill-[#0ea5e9]/20" />
          </div>
          <div className="text-5xl font-bold text-white mb-4">8.4<span className="text-xl text-[#666]">/10</span></div>
          <div className="inline-block bg-[#ef4444] text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider">REGULATORY</div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#111] border border-[#222] p-5 relative flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] text-[#888] tracking-[0.1em] uppercase font-mono">7-Day Forecast</h3>
            <TrendingUp size={16} className="text-[#facc15]" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight size={28} className="text-[#facc15]" />
            <span className="text-5xl font-bold text-[#facc15]">12%</span>
          </div>
          <div className="flex items-end gap-1.5 h-8">
            <div className="flex-1 bg-[#333] h-[20%]"></div>
            <div className="flex-1 bg-[#333] h-[30%]"></div>
            <div className="flex-1 bg-[#333] h-[50%]"></div>
            <div className="flex-1 bg-[#333] h-[70%]"></div>
            <div className="flex-1 bg-[#facc15] h-full"></div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-[#111] border border-[#222] p-5 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] text-[#888] tracking-[0.1em] uppercase font-mono">AI Briefings</h3>
            <Bot size={16} className="text-[#0ea5e9] fill-[#0ea5e9]/20" />
          </div>
          <div className="text-5xl font-bold text-[#0ea5e9] mb-4">7</div>
          <div className="inline-block bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[10px] font-mono px-2 py-1 rounded-sm flex items-center gap-1.5 w-max tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></div> READY
          </div>
        </div>
      </div>

      {/* Middle Row (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div 
          className="lg:col-span-2 bg-[#111] border border-[#222] p-5 relative"
          style={{ backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Risk Trend (30-Day) & Forecast</h2>
            <div className="flex items-center gap-6 text-[10px] text-[#888] font-mono uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-[#facc15]"></div> Historical</div>
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-white border-t border-dashed border-white"></div> AI Forecast</div>
            </div>
          </div>
          <div className="h-64 relative z-10">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Category Breakdown</h2>
          </div>
          <div className="h-64 relative">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Intel Feed */}
        <div className="bg-[#111] border border-[#222] flex flex-col">
          <div className="p-4 border-b border-[#222] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#facc15]" />
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-white">Live Intel Feed</h2>
            </div>
            <span className="text-[10px] border border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15] px-2 py-0.5 rounded-sm font-mono tracking-widest">AI SCORED</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="border border-[#333] p-4 bg-[#0a0a0a] relative group hover:border-[#555] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-[#666] font-mono tracking-widest">14:00 UTC &middot; REUTERS</span>
                <span className="text-[10px] text-[#ef4444] font-mono bg-[#ef4444]/10 border border-[#ef4444]/20 px-2 py-0.5 rounded-sm tracking-wider">IMPACT: HIGH</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#facc15] transition-colors leading-snug">EU drafts new directive targeting critical tech infrastructure</h3>
              <p className="text-xs text-[#888] leading-relaxed">AI Summary: Proposed regulations indicate a 45% increase in compliance costs for tier-1 providers. Immediate review recommended for EU-based...</p>
            </div>
            
            <div className="border border-[#facc15]/30 p-4 bg-[#0a0a0a] relative group hover:border-[#facc15] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-[#666] font-mono tracking-widest">13:45 UTC &middot; BLOOMBERG</span>
                <span className="text-[10px] text-[#facc15] font-mono bg-[#facc15]/10 border border-[#facc15]/20 px-2 py-0.5 rounded-sm tracking-wider">IMPACT: MED</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#facc15] transition-colors leading-snug">Asian markets experience localized volatility amid trade talks</h3>
            </div>
          </div>
        </div>

        {/* Actionable Alerts */}
        <div className="bg-[#111] border border-[#222] flex flex-col">
          <div className="p-4 border-b border-[#222] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#ef4444]" />
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-white">Actionable Alerts</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* Critical Alert */}
            <div className="border border-[#ef4444]/50 bg-[#ef4444]/5 p-5 relative">
              <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></div>
              <div className="text-[10px] text-[#ef4444] font-mono tracking-widest uppercase mb-2">Critical Breach</div>
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">Threshold Exceeded: Asset Class Beta</h3>
              <p className="text-xs text-[#888] font-mono mb-5">DEV_092 {'>'} 1.5 var. Immediate rebalancing required.</p>
              <div className="flex gap-3">
                <button className="flex-1 bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444] hover:text-white transition-colors py-2 text-xs font-bold uppercase tracking-wider rounded-sm">Acknowledge</button>
                <button className="flex-1 bg-transparent border border-[#333] hover:bg-[#222] text-white transition-colors py-2 text-xs font-bold uppercase tracking-wider rounded-sm">View Report</button>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="border border-[#facc15]/30 bg-[#facc15]/5 p-5 relative">
              <div className="text-[10px] text-[#facc15] font-mono tracking-widest uppercase mb-2">Warning</div>
              <h3 className="text-base font-bold text-white mb-2 leading-tight">Data Feed Latency Detected</h3>
              <p className="text-xs text-[#888] font-mono mb-5">Source: APAC_NODE_4. Latency {'>'} 500ms.</p>
              <button className="w-full bg-[#facc15] hover:bg-[#eab308] text-black transition-colors py-2 text-xs font-bold uppercase tracking-wider rounded-sm">Investigate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
