"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Calendar, Bell, User } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="h-16 border-b border-brand-border/30 bg-black flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium uppercase tracking-wider ${pathname === '/dashboard' ? 'text-white border-b-2 border-brand-yellow py-5' : 'text-brand-text-muted hover:text-white'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/news" 
            className={`text-sm font-medium uppercase tracking-wider ${pathname === '/news' ? 'text-white border-b-2 border-brand-yellow py-5' : 'text-brand-text-muted hover:text-white'}`}
          >
            News
          </Link>
          <Link 
            href="/radar" 
            className={`text-sm font-medium uppercase tracking-wider ${pathname === '/radar' ? 'text-white border-b-2 border-brand-yellow py-5' : 'text-brand-text-muted hover:text-white'}`}
          >
            Radar
          </Link>
          <Link 
            href="/reports" 
            className={`text-sm font-medium uppercase tracking-wider ${pathname === '/reports' ? 'text-white border-b-2 border-brand-yellow py-5' : 'text-brand-text-muted hover:text-white'}`}
          >
            Reports
          </Link>
          <Link 
            href="/settings" 
            className={`text-sm font-medium uppercase tracking-wider ${pathname === '/settings' ? 'text-white border-b-2 border-brand-yellow py-5' : 'text-brand-text-muted hover:text-white'}`}
          >
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
          <input 
            type="text" 
            placeholder="Search risk events..." 
            className="bg-brand-panel border border-brand-border/50 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-brand-yellow w-64"
          />
        </div>

        <div className="flex items-center gap-4 text-brand-text-muted">
          <button className="hover:text-white transition-colors"><Calendar size={18} /></button>
          <button className="hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-brand-border/50"></div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-brand-border/50 px-3 py-1 rounded-full bg-brand-panel/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-white">Live Status</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-brand-panel border border-brand-border/50 flex items-center justify-center text-brand-text-muted hover:text-white transition-colors">
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
