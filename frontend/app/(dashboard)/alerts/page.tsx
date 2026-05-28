"use client";

import { Search, Bell, ShieldAlert, AlertTriangle, Clock3 } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Alerts Center</h1>
          <p className="text-[#888] text-sm">Monitor active risk alerts and take action with prioritized intelligence.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-[#333] hover:bg-[#111] text-white transition-colors uppercase font-bold tracking-widest text-xs">
            <ShieldAlert size={14} /> Acknowledge All
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#facc15] hover:bg-[#eab308] text-black font-bold uppercase tracking-widest text-xs transition-colors">
            <Bell size={14} /> New Alert
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
          <input
            type="text"
            placeholder="Search active alerts, incidents, or asset groups..."
            className="w-full bg-[#111] border border-[#333] rounded-sm pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#facc15] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-[#111] border border-[#333] p-6 rounded-sm hover:border-[#555] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#888] mb-2">Alert #{item}</div>
                  <h2 className="text-xl font-bold text-white">Critical latency breach in APAC node</h2>
                  <p className="text-sm text-[#888] mt-2">Data ingestion latency has exceeded 500ms for over 12 minutes on APAC_NODE_04.</p>
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#facc15] font-bold">Impact: High</div>
                  <div className="text-[10px] text-[#888]">13:42 UTC</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] uppercase tracking-[0.2em] text-[#888]">
                <div className="bg-[#0a0a0a] border border-[#222] rounded-sm p-3">Category: Operational</div>
                <div className="bg-[#0a0a0a] border border-[#222] rounded-sm p-3">Source: APAC_NODE_04</div>
                <div className="bg-[#0a0a0a] border border-[#222] rounded-sm p-3">Status: Open</div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="bg-[#111] border border-[#222] p-5 rounded-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-[#888]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white">Alert Summary</h3>
            </div>
            <div className="space-y-3 text-sm text-[#888]">
              <div className="flex items-center justify-between"><span>Critical</span><span className="text-[#ef4444]">3</span></div>
              <div className="flex items-center justify-between"><span>Warning</span><span className="text-[#facc15]">11</span></div>
              <div className="flex items-center justify-between"><span>Resolved</span><span className="text-[#22c55e]">24</span></div>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock3 size={16} className="text-[#888]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white">Response SLA</h3>
            </div>
            <div className="text-sm text-[#888] space-y-3">
              <p>Priority alerts must be reviewed within <span className="text-[#facc15] font-bold">15 minutes</span>.</p>
              <p>Authorizations and escalation decisions should complete within <span className="text-[#facc15] font-bold">45 minutes</span>.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
