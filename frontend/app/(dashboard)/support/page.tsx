"use client";

import { Headphones, BookOpen, MessageCircle, LifeBuoy } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Hub</h1>
          <p className="text-[#888] text-sm">Access the help desk, documentation, and support request workflow.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#facc15] hover:bg-[#eab308] text-black font-bold uppercase tracking-widest text-xs transition-colors">
            <LifeBuoy size={14} /> Contact Support
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-[#333] hover:bg-[#111] text-white uppercase tracking-widest text-xs font-bold transition-colors">
            <BookOpen size={14} /> Docs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
            <div className="flex items-center gap-3 mb-4">
              <Headphones size={18} className="text-[#888]" />
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-white">Open Support Requests</h2>
            </div>
            <div className="space-y-4">
              {["Ticket #4051", "Ticket #4046", "Ticket #4039"].map((ticket) => (
                <div key={ticket} className="bg-[#0a0a0a] border border-[#222] p-4 rounded-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-white">{ticket}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#888]">Pending</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#facc15]">2h ago</span>
                  </div>
                  <p className="text-sm text-[#888]">Unable to access the compliance report export feature for the risk analytics dashboard.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle size={18} className="text-[#888]" />
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-white">Knowledge Base</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Report Export Troubleshooting", label: "GUIDE" },
                { title: "Configuring Notifications", label: "FAQ" },
                { title: "Access Management", label: "DOC" },
                { title: "System Status & Alerts", label: "STATUS" },
              ].map((item) => (
                <div key={item.title} className="bg-[#0a0a0a] border border-[#222] p-4 rounded-sm">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-2">{item.label}</div>
                  <p className="text-sm text-white font-bold">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-[#111] border border-[#222] p-5 rounded-sm">
            <div className="flex items-center gap-2 mb-4">
              <LifeBuoy size={16} className="text-[#888]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white">Support Access</h3>
            </div>
            <div className="text-sm text-[#888] space-y-3">
              <div>
                <div className="text-[#fff] font-semibold">Help Desk</div>
                <div>support@mtnghana.com</div>
              </div>
              <div>
                <div className="text-[#fff] font-semibold">Phone</div>
                <div>+233 30 123 4567</div>
              </div>
              <div>
                <div className="text-[#fff] font-semibold">Hours</div>
                <div>24/7 Global Operations</div>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] p-5 rounded-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-[#888]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white">Quick Actions</h3>
            </div>
            <div className="space-y-2 text-sm text-[#888]">
              <button className="w-full text-left px-3 py-2 border border-[#333] rounded-sm hover:bg-[#111] transition-colors">Submit a New Ticket</button>
              <button className="w-full text-left px-3 py-2 border border-[#333] rounded-sm hover:bg-[#111] transition-colors">Download User Guide</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
