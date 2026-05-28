"use client";

import { Search, Filter, Download, Activity, BarChart3, TrendingUp, AlertTriangle, Briefcase, Globe } from "lucide-react";

export default function NewsFeedPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header & Search */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">AI-Scored News Intelligence Feed</h1>
        <div className="flex gap-4">
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent border border-[#333] hover:bg-[#111] text-white transition-colors uppercase font-bold tracking-widest text-xs">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#facc15] hover:bg-[#eab308] text-black font-bold uppercase tracking-widest text-xs transition-colors">
            <Download size={14} />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input 
            type="text" 
            placeholder="Search global risk events, entities, or impact metrics..." 
            className="w-full bg-[#111] border border-[#333] rounded-sm pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#facc15] transition-colors tracking-wide"
          />
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div className="flex gap-2">
          <button className="px-5 py-1.5 rounded-sm bg-[#333] text-white text-[10px] font-mono font-bold tracking-[0.2em] uppercase">ALL</button>
          <button className="px-5 py-1.5 rounded-sm border border-[#333] text-[#888] hover:text-white hover:bg-[#111] transition-colors text-[10px] font-mono tracking-[0.2em] uppercase">REGULATORY</button>
          <button className="px-5 py-1.5 rounded-sm border border-[#333] text-[#888] hover:text-white hover:bg-[#111] transition-colors text-[10px] font-mono tracking-[0.2em] uppercase">FINANCIAL</button>
          <button className="px-5 py-1.5 rounded-sm border border-[#333] text-[#888] hover:text-white hover:bg-[#111] transition-colors text-[10px] font-mono tracking-[0.2em] uppercase">GEOPOLITICAL</button>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-[#888] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <Filter size={12} /> All Sources <span className="text-[8px]">▼</span>
          </div>
          <div className="h-4 w-px bg-[#333]"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <div className="w-3 h-3 border border-[#666] flex items-center justify-center"></div>
            Critical Only
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <BarChart3 size={12} /> Score: High &rarr; Low
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main News Feed Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="bg-[#111] border border-[#333] p-6 relative flex flex-col group cursor-pointer hover:border-[#555] transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444]"></div>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2 text-[#ef4444]">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Regulatory Action</span>
              </div>
              <div className="w-8 h-8 border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center font-bold text-xs">
                94
              </div>
            </div>
            <div className="text-[10px] text-[#888] mb-3 font-mono tracking-widest uppercase">Reuters &middot; 12 mins ago</div>
            <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#facc15] transition-colors">Ghana NCA Imposes Sweeping Sanctions on Major Telecom Operator Following Data Breach</h3>
            <p className="text-sm text-[#888] mb-6 flex-1 leading-relaxed">AI Summary: Regulatory body has issued immediate operational restrictions and a potential $50M fine pending...</p>
            <div className="flex justify-between items-end mt-auto">
              <div className="flex gap-2">
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#NCA</span>
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#MTNGhana</span>
              </div>
              <div className="text-[#ef4444] font-bold text-[10px] font-mono tracking-[0.2em] uppercase">Est. Impact: High</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111] border border-[#333] p-6 relative flex flex-col group cursor-pointer hover:border-[#555] transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#facc15]"></div>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2 text-[#facc15]">
                <TrendingUp size={14} />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Market Shift</span>
              </div>
              <div className="w-8 h-8 border border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15] flex items-center justify-center font-bold text-xs">
                68
              </div>
            </div>
            <div className="text-[10px] text-[#888] mb-3 font-mono tracking-widest uppercase">Bloomberg &middot; 45 mins ago</div>
            <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#facc15] transition-colors">Supply Chain Disruptions in SE Asia Hint at Q3 Hardware Delays</h3>
            <p className="text-sm text-[#888] mb-6 flex-1 leading-relaxed">AI Summary: Logistics hubs reporting 14% decrease in throughput capacity due to localized power grid failures....</p>
            <div className="flex justify-between items-end mt-auto">
              <div className="flex gap-2">
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#Logistics</span>
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#Tech</span>
              </div>
              <div className="text-[#facc15] font-bold text-[10px] font-mono tracking-[0.2em] uppercase">Est. Impact: Med</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111] border border-[#333] p-6 relative flex flex-col group cursor-pointer hover:border-[#555] transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#facc15]"></div>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2 text-[#facc15]">
                <Globe size={14} />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Geopolitical</span>
              </div>
              <div className="w-8 h-8 border border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15] flex items-center justify-center font-bold text-xs">
                72
              </div>
            </div>
            <div className="text-[10px] text-[#888] mb-3 font-mono tracking-widest uppercase">WSJ &middot; 1 hr ago</div>
            <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#facc15] transition-colors">New Export Tariffs Proposed on Rare Earth Minerals by Key Suppliers</h3>
            <p className="text-sm text-[#888] mb-6 flex-1 leading-relaxed">AI Summary: Draft legislation suggests a 15% tariff hike on unrefined materials. Sector analysis indicates potential cost...</p>
            <div className="flex justify-between items-end mt-auto">
              <div className="flex gap-2">
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#Commodities</span>
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#Tariffs</span>
              </div>
              <div className="text-[#facc15] font-bold text-[10px] font-mono tracking-[0.2em] uppercase">Est. Impact: Med</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111] border border-[#333] p-6 relative flex flex-col group cursor-pointer hover:border-[#555] transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#666]"></div>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2 text-[#888]">
                <Briefcase size={14} />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Corporate Update</span>
              </div>
              <div className="w-8 h-8 border border-[#333] bg-[#222] text-[#888] flex items-center justify-center font-bold text-xs">
                18
              </div>
            </div>
            <div className="text-[10px] text-[#888] mb-3 font-mono tracking-widest uppercase">PR Newswire &middot; 2 hrs ago</div>
            <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#facc15] transition-colors">TechCorp Announces Q2 Earnings Date and Upcoming Strategic Overview Presentation</h3>
            <p className="text-sm text-[#888] mb-6 flex-1 leading-relaxed">AI Summary: Routine scheduling announcement for quarterly fiscal results. No preliminary guidance...</p>
            <div className="flex justify-between items-end mt-auto">
              <div className="flex gap-2">
                <span className="bg-[#222] text-[#aaa] text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm">#TechCorp</span>
              </div>
              <div className="text-[#888] font-bold text-[10px] font-mono tracking-[0.2em] uppercase">Est. Impact: Low</div>
            </div>
          </div>

        </div>

        {/* Right Sidebar Stats */}
        <div className="w-full xl:w-96 flex flex-col gap-4">
          
          {/* Source Health Monitor */}
          <div className="bg-[#111] border border-[#222] p-5">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={14} className="text-[#888]" />
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-white">Source Health Monitor</h2>
            </div>
            <table className="w-full text-[10px] font-mono tracking-widest uppercase">
              <thead>
                <tr className="text-[#666] border-b border-[#222]">
                  <th className="text-left font-normal pb-3">SOURCE</th>
                  <th className="text-right font-normal pb-3">LATENCY</th>
                  <th className="text-right font-normal pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 text-white">Reuters API</td>
                  <td className="py-4 text-right text-[#888]">42ms</td>
                  <td className="py-4 text-right text-[#facc15]">Online</td>
                </tr>
                <tr className="border-t border-[#222]">
                  <td className="py-4 text-white">Bloomberg Term</td>
                  <td className="py-4 text-right text-[#888]">18ms</td>
                  <td className="py-4 text-right text-[#facc15]">Online</td>
                </tr>
                <tr className="border-t border-[#222]">
                  <td className="py-4 text-white">Local Gov Net</td>
                  <td className="py-4 text-right text-[#ef4444]">Timeout</td>
                  <td className="py-4 text-right text-[#ef4444]">Degraded</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Volume By Risk Type */}
          <div className="bg-[#111] border border-[#222] p-5">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={14} className="text-[#888]" />
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-white">Volume by Risk Type</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-4xl font-bold text-white">1.2k</div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#ef4444]"></div> Regulatory</div>
                  <span className="text-white">25%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#facc15]"></div> Financial</div>
                  <span className="text-white">40%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#888]">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#444]"></div> Other</div>
                  <span className="text-[#888]">35%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Entities */}
          <div className="bg-[#111] border border-[#222] p-5">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={14} className="text-[#888]" />
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-white">Trending Entities</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">MTN Ghana</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#ef4444] font-mono text-sm">94</span>
                  <TrendingUp size={14} className="text-[#ef4444]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Fed Reserve</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#facc15] font-mono text-sm">68</span>
                  <TrendingUp size={14} className="text-[#facc15] rotate-45" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">TSMC</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#facc15] font-mono text-sm">62</span>
                  <TrendingUp size={14} className="text-[#facc15]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#888]">OPEC+</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#666] font-mono text-sm">45</span>
                  <TrendingUp size={14} className="text-[#666] -rotate-45" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
