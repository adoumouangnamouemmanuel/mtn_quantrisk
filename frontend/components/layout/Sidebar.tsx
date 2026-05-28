"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Newspaper, 
  Radar, 
  LineChart, 
  Bell, 
  FileText, 
  Settings, 
  BarChart2, 
  HelpCircle, 
  User 
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "News Feed", href: "/news", icon: Newspaper },
  { name: "Risk Radar", href: "/radar", icon: Radar },
  { name: "Forecasts", href: "/forecasts", icon: LineChart },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-black border-r border-brand-border/30 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#facc15] text-black font-bold text-sm px-2 py-1">
            MTN
          </div>
          <div className="leading-tight">
            <div className="text-white font-bold tracking-widest text-sm">QUANTRISK</div>
            <div className="text-[#888] font-mono text-[10px] tracking-widest uppercase">PRECISION ANALYSIS</div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <button className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-2.5 px-4 rounded-sm transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
          <BarChart2 size={16} className="text-black" />
          Analyze Risk
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-brand-yellow/10 text-brand-yellow" 
                  : "text-brand-text-muted hover:text-white hover:bg-brand-panel"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-brand-yellow" : "text-brand-text-muted"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-1 border-t border-brand-border/30">
        <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-brand-text-muted hover:text-white hover:bg-brand-panel transition-colors">
          <HelpCircle size={18} />
          Support
        </Link>
        <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-brand-text-muted hover:text-white hover:bg-brand-panel transition-colors">
          <User size={18} />
          Account
        </Link>
        <div className="mt-8 px-3 text-[10px] font-mono text-brand-text-muted tracking-widest uppercase">
          CONFIDENTIAL &middot; MTN GHANA &middot; 2025
        </div>
      </div>
    </div>
  );
}
