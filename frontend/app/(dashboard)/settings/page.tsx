"use client";

import { User, Bell, Settings, Zap, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Account */}
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={18} className="text-[#888]" />
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-white">Account</h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <label className="w-32 text-sm text-[#888]">Display name</label>
                <input className="flex-1 bg-[#0a0a0a] border border-[#333] px-3 py-2 text-white rounded-sm" defaultValue="MTN Ops" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <label className="w-32 text-sm text-[#888]">Email</label>
                <input className="flex-1 bg-[#0a0a0a] border border-[#333] px-3 py-2 text-white rounded-sm" defaultValue="ops@mtn.com" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-[#facc15] hover:bg-[#eab308] text-black font-bold uppercase tracking-widest rounded-sm">Save</button>
              <button className="px-4 py-2 border border-[#333] text-white hover:bg-[#111] rounded-sm">Cancel</button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={18} className="text-[#888]" />
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-white">Alerts & Notifications</h2>
            </div>
            <div className="space-y-4 text-sm text-[#888]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Critical Alerts</div>
                  <div className="text-[12px]">Receive immediate push notifications for critical events</div>
                </div>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Daily Summary</div>
                  <div className="text-[12px]">Email digest of top risks and reports</div>
                </div>
                <input type="checkbox" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-[#111] border border-[#222] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={18} className="text-[#888]" />
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-white">Integrations</h2>
            </div>
            <div className="space-y-3 text-sm text-[#888]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Slack Alerts</div>
                  <div className="text-[12px]">Post high-impact alerts to channel</div>
                </div>
                <button className="px-3 py-1 bg-[#facc15] text-black rounded-sm">Configure</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">SIEM Forwarding</div>
                  <div className="text-[12px]">Forward selected events to SIEM</div>
                </div>
                <button className="px-3 py-1 border border-[#333] text-white rounded-sm">Configure</button>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-96">
          <div className="bg-[#111] border border-[#222] p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={16} className="text-[#888]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white">Security</h3>
            </div>
            <div className="text-sm text-[#888]">
              <div className="mb-2">Two-factor authentication: <span className="text-[#facc15] font-bold">Enabled</span></div>
              <div>Password last changed: <span className="text-[#888]">2025-03-10</span></div>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] p-5">
            <div className="flex items-center gap-3 mb-3">
              <Settings size={16} className="text-[#888]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white">System</h3>
            </div>
            <div className="text-sm text-[#888]">
              <div className="mb-2">Timezone: <span className="text-white">UTC</span></div>
              <div>Data retention: <span className="text-white">90 days</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
