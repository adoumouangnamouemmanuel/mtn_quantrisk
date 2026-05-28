"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Globe, FileText, DollarSign, TrendingUp, TrendingDown, Layers } from "lucide-react";

export default function ForecastsPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart) return;

    let myChart: any = null;

    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['-15d', '-10d', '-7d', '-3d', 'TODAY', '+5d', '+10d', '+15d', '+20d', '+25d', '+30d'],
          datasets: [
            {
              label: 'Historical',
              data: [3.5, 4.2, 5.8, 5.0, 6.0, null, null, null, null, null, null],
              borderColor: '#facc15',
              borderWidth: 4,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: 'Median Forecast',
              data: [null, null, null, null, 6.0, 6.2, 5.9, 6.5, 7.2, 7.5, 8.2],
              borderColor: '#ffffff',
              borderWidth: 4,
              borderDash: [5, 5],
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: '95% Upper',
              data: [null, null, null, null, 6.0, 6.9, 7.0, 7.8, 8.8, 9.5, 10.0],
              borderColor: 'transparent',
              backgroundColor: 'rgba(250, 204, 21, 0.05)',
              fill: '+1',
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: '50% Upper',
              data: [null, null, null, null, 6.0, 6.5, 6.4, 7.0, 8.0, 8.5, 9.2],
              borderColor: 'transparent',
              backgroundColor: 'rgba(250, 204, 21, 0.1)',
              fill: '+1',
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: 'Median',
              data: [null, null, null, null, 6.0, 6.2, 5.9, 6.5, 7.2, 7.5, 8.2],
              borderColor: 'transparent',
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: '50% Lower',
              data: [null, null, null, null, 6.0, 5.8, 5.4, 5.8, 6.5, 6.8, 7.0],
              borderColor: 'transparent',
              backgroundColor: 'rgba(250, 204, 21, 0.1)',
              fill: '-1',
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: '95% Lower',
              data: [null, null, null, null, 6.0, 5.2, 4.8, 5.0, 5.5, 5.8, 6.0],
              borderColor: 'transparent',
              backgroundColor: 'rgba(250, 204, 21, 0.05)',
              fill: '-1',
              tension: 0.4,
              pointRadius: 0,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          scales: {
            y: {
              min: 2.0,
              max: 10.0,
              grid: { color: '#222' },
              ticks: { color: '#888' }
            },
            x: {
              grid: { color: '#222' },
              ticks: { color: '#888' }
            }
          }
        }
      });
    }

    return () => {
      if (myChart) myChart.destroy();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Risk Forecasting & Monte Carlo Projections</h1>
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#888]">Predictive analytics driven by LSTM models and continuous Monte Carlo simulations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Chart Area */}
        <div className="flex-1 space-y-4">
          <div className="bg-[#111] border border-[#333] p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers size={20} className="text-[#888]" />
                30-Day Risk Score Forecast — All Categories
              </h2>
              <div className="flex border border-[#333] rounded-sm overflow-hidden bg-black text-[10px] font-mono tracking-[0.2em] uppercase">
                <button className="px-4 py-2 text-[#888] hover:text-white transition-colors">7-Day</button>
                <button className="px-4 py-2 bg-[#facc15] text-black font-bold">30-Day</button>
                <div className="w-px bg-[#333]"></div>
                <button className="px-4 py-2 text-white">Global Aggregated</button>
              </div>
            </div>

            <div className="h-[450px] relative w-full">
              {/* Vertical Annotations overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex">
                <div className="w-[40%] h-full"></div>
                <div className="w-[1px] h-full border-r border-dashed border-[#facc15] relative">
                  <div className="absolute top-10 -translate-x-1/2 bg-[#facc15]/10 border border-[#facc15]/50 text-[#facc15] text-[10px] px-2 py-1 font-mono tracking-[0.2em] uppercase whitespace-nowrap">
                    TODAY
                  </div>
                </div>
                <div className="w-[20%] h-full border-r border-dashed border-white/30 relative">
                  <div className="absolute top-20 -translate-x-1/2 bg-white/10 border border-white/30 text-white text-[10px] px-2 py-1 font-mono tracking-[0.2em] uppercase whitespace-nowrap">
                    Election Cycle Begins
                  </div>
                </div>
                <div className="w-[20%] h-full border-r border-dashed border-[#0ea5e9]/50 relative">
                  <div className="absolute top-40 -translate-x-1/2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/50 text-[#0ea5e9] text-[10px] px-2 py-1 font-mono tracking-[0.2em] uppercase whitespace-nowrap">
                    NCA Review Window
                  </div>
                </div>
              </div>
              <canvas ref={chartRef}></canvas>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center justify-center gap-8 mt-6 text-[10px] text-[#888] font-mono uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#facc15]"></div> Historical</div>
              <div className="flex items-center gap-2"><div className="w-4 h-1 border-t-2 border-dashed border-white"></div> Median Forecast</div>
              <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[#facc15]/30 border border-[#facc15]/50"></div> 50% Confidence</div>
              <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[#facc15]/10 border border-[#facc15]/20"></div> 95% Confidence</div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111] border border-[#333] p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[#888]">
                  <Globe size={16} />
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white">Geopolitical</span>
                </div>
                <div className="text-[10px] font-mono text-[#888] bg-black border border-[#333] px-2 py-1 rounded-sm text-right tracking-[0.2em] uppercase">
                  <span className="text-white block">82%</span> CONF
                </div>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-white">6.1</span>
                <TrendingUp size={24} className="text-[#facc15] mb-1" />
              </div>
              <div className="h-8 flex items-end gap-1 opacity-50">
                <div className="w-full bg-[#444] h-[40%]"></div>
                <div className="w-full bg-[#444] h-[30%]"></div>
                <div className="w-full bg-[#444] h-[50%]"></div>
                <div className="w-full bg-[#444] h-[60%]"></div>
                <div className="w-full bg-[#facc15] h-[80%]"></div>
                <div className="w-full bg-[#facc15] h-[100%]"></div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#333] p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[#888]">
                  <FileText size={16} />
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white">Regulatory</span>
                </div>
                <div className="text-[10px] font-mono text-[#888] bg-black border border-[#333] px-2 py-1 rounded-sm text-right tracking-[0.2em] uppercase">
                  <span className="text-white block">91%</span> CONF
                </div>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-white">8.5</span>
                <TrendingUp size={24} className="text-[#ef4444] mb-1" />
              </div>
              <div className="h-8 flex items-end gap-1 opacity-50">
                <div className="w-full bg-[#444] h-[60%]"></div>
                <div className="w-full bg-[#444] h-[70%]"></div>
                <div className="w-full bg-[#444] h-[75%]"></div>
                <div className="w-full bg-[#444] h-[80%]"></div>
                <div className="w-full bg-[#ef4444] h-[90%]"></div>
                <div className="w-full bg-[#ef4444] h-[100%]"></div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#333] p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[#888]">
                  <DollarSign size={16} />
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white">Financial</span>
                </div>
                <div className="text-[10px] font-mono text-[#888] bg-black border border-[#333] px-2 py-1 rounded-sm text-right tracking-[0.2em] uppercase">
                  <span className="text-white block">75%</span> CONF
                </div>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-white">4.2</span>
                <TrendingDown size={24} className="text-[#22c55e] mb-1" />
              </div>
              <div className="h-8 flex items-end gap-1 opacity-50">
                <div className="w-full bg-[#444] h-[80%]"></div>
                <div className="w-full bg-[#444] h-[70%]"></div>
                <div className="w-full bg-[#444] h-[60%]"></div>
                <div className="w-full bg-[#444] h-[50%]"></div>
                <div className="w-full bg-[#22c55e] h-[40%]"></div>
                <div className="w-full bg-[#22c55e] h-[30%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          
          {/* Financial Impact */}
          <div className="bg-[#111] border border-[#333] p-6">
            <h2 className="text-lg font-bold text-white mb-6">Estimated Financial Impact Range</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono mb-2 tracking-[0.2em] uppercase">
                  <span className="text-[#0ea5e9]">MINIMUM IMPACT</span>
                  <span className="text-white font-bold">$1.2M</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-sm overflow-hidden border border-[#222]">
                  <div className="h-full bg-[#0ea5e9] w-[15%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono mb-2 tracking-[0.2em] uppercase">
                  <span className="text-[#facc15]">MEDIAN IMPACT <span className="text-[#666] opacity-50">(MOST LIKELY)</span></span>
                  <span className="text-white font-bold">$4.5M</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-sm overflow-hidden border border-[#222]">
                  <div className="h-full bg-[#facc15] w-[35%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono mb-2 tracking-[0.2em] uppercase">
                  <span className="text-[#ef4444]">MAXIMUM IMPACT</span>
                  <span className="text-white font-bold">$12.8M</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-sm overflow-hidden border border-[#222]">
                  <div className="h-full bg-[#ef4444] w-[85%]"></div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#888] font-mono tracking-widest uppercase mt-8 leading-relaxed">
              Projections derived via LSTM time-series forecasting combined with 10,000-iteration Monte Carlo simulation based on historical volatility.
            </p>
          </div>

          {/* Model Metrics */}
          <div className="bg-[#111] border border-[#333] p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6">Model Metrics</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-[#222] p-4 bg-black group hover:border-[#444] transition-colors">
                <div className="text-[10px] font-mono text-[#888] mb-1 tracking-[0.2em] uppercase group-hover:text-[#aaa] transition-colors">BERT F1</div>
                <div className="text-3xl font-bold text-white">0.87</div>
              </div>
              <div className="border border-[#222] p-4 bg-black group hover:border-[#444] transition-colors">
                <div className="text-[10px] font-mono text-[#888] mb-1 tracking-[0.2em] uppercase group-hover:text-[#aaa] transition-colors">LSTM MAPE</div>
                <div className="text-3xl font-bold text-white">4.3%</div>
              </div>
              <div className="border border-[#222] p-4 bg-black group hover:border-[#444] transition-colors">
                <div className="text-[10px] font-mono text-[#888] mb-1 tracking-[0.2em] uppercase group-hover:text-[#aaa] transition-colors">Data</div>
                <div className="text-lg font-bold text-white mt-1 uppercase tracking-widest">12 Months</div>
              </div>
              <div className="border border-[#222] p-4 bg-black group hover:border-[#444] transition-colors">
                <div className="text-[10px] font-mono text-[#888] mb-1 tracking-[0.2em] uppercase group-hover:text-[#aaa] transition-colors">Retrained</div>
                <div className="text-lg font-bold text-white mt-1 uppercase tracking-widest">06:00 GMT</div>
              </div>
            </div>

            <div className="mt-auto bg-[#facc15]/5 border border-[#facc15]/30 p-4 flex gap-3">
              <CheckCircle2 className="text-[#facc15] shrink-0" size={18} />
              <span className="text-[10px] font-mono text-[#888] tracking-widest uppercase">Models performing above required confidence thresholds.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
