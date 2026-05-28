"use client";

import { Search, Filter, Download, FileText, Calendar } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Risk Reports</h1>
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

      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input
            type="text"
            placeholder="Search reports, dates, or tags..."
            className="w-full bg-[#111] border border-[#333] rounded-sm pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#facc15] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Report card list */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#111] border border-[#333] p-6 relative group cursor-pointer hover:border-[#555] transition-colors">
              <div className="absolute right-6 top-6 text-[#888] text-[10px] font-mono">2025-05-2{i}</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#facc15] w-8 h-8 flex items-center justify-center rounded-sm text-black font-bold">R</div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-snug">Quarterly Risk Assessment Q{i}</h3>
                  <div className="text-[10px] text-[#888] font-mono tracking-widest uppercase">Analyst: Team Alpha &middot; {i * 12} pages</div>
                </div>
              </div>
              <p className="text-sm text-[#888] mb-4">Executive summary: Highlights key regulatory, market and operational risks relevant to MTN operations in the period. Includes AI scoring and recommended mitigations.</p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest bg-transparent border border-[#333] hover:bg-[#111] text-white font-bold rounded-sm">
                  <FileText size={14} /> View
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest bg-[#facc15] hover:bg-[#eab308] text-black font-bold rounded-sm">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="w-full xl:w-96">
          <div className="bg-[#111] border border-[#222] p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-[#888]" />
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-white">Recent Exports</h2>
            </div>
            <div className="space-y-3 text-sm text-[#888]">
              <div className="flex justify-between"><span>Q1_2025_Report.pdf</span><span className="text-[#facc15]">12 May</span></div>
              <div className="flex justify-between"><span>Operational_Alerts_May.xlsx</span><span className="text-[#facc15]">05 May</span></div>
              <div className="flex justify-between"><span>AI_Briefing_2025-04.pdf</span><span className="text-[#facc15]">28 Apr</span></div>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] p-5">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-white mb-3">Report Types</h3>
            <div className="space-y-2 text-sm text-[#888]">
              <div className="flex items-center justify-between"><span>Quarterly Assessment</span><span className="text-[#888]">#</span></div>
              <div className="flex items-center justify-between"><span>Incident Review</span><span className="text-[#888]">#</span></div>
              <div className="flex items-center justify-between"><span>Regulatory Analysis</span><span className="text-[#888]">#</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
