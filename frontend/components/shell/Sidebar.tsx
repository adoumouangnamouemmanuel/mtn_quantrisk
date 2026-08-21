"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, GitCompare, ActivitySquare, Dices,
  Settings, HelpCircle, LineChart, Newspaper, Bell, TrendingUp, Brain,
  FileText, CalendarDays, Calendar,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  tip: string;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard',  label: 'Dashboard',      icon: LayoutDashboard, tip: 'Core KPI anchors and live status across all six risk categories.' },
      { href: '/quarterly',  label: 'Quarterly',      icon: CalendarDays,   tip: 'Quarterly trend with provenance and drill-down per point.' },
      { href: '/monthly',    label: 'Monthly',         icon: Calendar,       tip: 'Monthly trend with provenance and drill-down per point.' },
    ],
  },
  {
    group: 'Predict & Stress',
    items: [
      { href: '/forecasts',   label: 'Forecasts',     icon: LineChart,       tip: 'Real-time, event-aware forecasts with per-point drill-down.', badge: 'AI' },
      { href: '/scenarios',   label: 'Scenarios',     icon: FlaskConical,    tip: 'Apply stress scenarios to the base case.' },
      { href: '/compare',     label: 'Compare',       icon: GitCompare,      tip: 'Compare two scenarios side by side.' },
      { href: '/reverse',     label: 'Reverse',       icon: ActivitySquare,  tip: 'Find the severity that breaches a target.' },
      { href: '/monte-carlo', label: 'Monte Carlo',   icon: Dices,           tip: 'Stochastic distribution across N simulations.', badge: 'AI' },
      { href: '/briefs',      label: 'Briefs',        icon: FileText,        tip: 'Board-ready scenario briefs.' },
    ],
  },
  {
    group: 'Live Risk',
    items: [
      { href: '/news',         label: 'News',         icon: Newspaper,   tip: 'Scraped articles with relevance & severity reasoning.', badge: 'LIVE' },
      { href: '/alerts',       label: 'Alerts',       icon: Bell,        tip: 'Active risk alerts by tier.', badge: 'LIVE' },
      { href: '/economics',   label: 'Macro',         icon: TrendingUp,  tip: 'Ghana macro indicators from the World Bank.' },
      { href: '/intelligence', label: 'Briefing',     icon: Brain,       tip: 'Daily LLM risk digest.', badge: 'LLM' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 h-full flex flex-col border-r border-white/5"
      style={{ background: 'linear-gradient(180deg, #0E0E1A 0%, #0A0A12 100%)' }}
    >
      {/* Brand */}
      <Link href="/dashboard" className="block px-5 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-mtn flex items-center justify-center shrink-0 glow-yellow-sm">
            <span className="font-black text-black text-sm">Q</span>
          </div>
          <div className="leading-none">
            <div className="font-hero font-black text-base tracking-tight" style={{ color: '#F0EDE8' }}>
              Quant<span className="gradient-mtn-text">Risk</span>
            </div>
            <div className="font-mono mt-1" style={{ fontSize: '9px', color: 'rgba(255,208,0,0.45)', letterSpacing: '0.12em' }}>
              MTN GHANA · AI RISK
            </div>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {NAV_ITEMS.map((group, gi) => (
          <div key={gi} className="mb-1">
            <div className="px-5 pt-3 pb-1.5">
              <span className="font-mono font-bold uppercase tracking-widest" style={{ fontSize: '9px', color: 'rgba(160,155,176,0.45)' }}>
                {group.group}
              </span>
            </div>
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const link = (
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2 rounded-lg text-[13px] font-sans font-medium transition-all duration-150 ${
                      isActive ? 'nav-active-glow' : ''
                    }`}
                    style={isActive ? { color: '#FFD000', background: 'rgba(255,208,0,0.08)' } : { color: 'rgba(240,237,232,0.6)' }}
                  >
                    <Icon className="w-4 h-4 mr-2.5 shrink-0" style={{ color: isActive ? '#FFD000' : 'inherit', opacity: isActive ? 1 : 0.6 }} />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto font-mono rounded px-1.5 py-0.5 text-black font-bold shrink-0 gradient-mtn" style={{ fontSize: '8px' }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    <Tooltip content={item.tip} side="right" maxWidth={260}>
                      {link}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {[
          { href: '/help', label: 'Help', icon: HelpCircle, tip: 'Guides, glossary and how to use the platform.' },
          { href: '/settings', label: 'Settings', icon: Settings, tip: 'Data uploads, retrain and preferences.' },
        ].map(({ href, label, icon: Icon, tip }) => (
          <Tooltip key={href} content={tip} side="right">
            <Link
              href={href}
              className="flex items-center px-3 py-2 rounded-lg text-[13px] font-sans font-medium transition-colors"
              style={
                pathname === href
                  ? { color: '#FFD000', background: 'rgba(255,208,0,0.08)' }
                  : { color: 'rgba(240,237,232,0.5)' }
              }
            >
              <Icon className="w-4 h-4 mr-2.5" style={{ opacity: 0.6 }} />
              {label}
            </Link>
          </Tooltip>
        ))}
        <div className="px-3 pt-1.5 flex items-center justify-between">
          <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(160,155,176,0.35)' }}>
            v2.2 · FY25
          </span>
          <span
            className="font-mono px-1.5 py-0.5 rounded"
            style={{ fontSize: '8px', color: 'rgba(255,208,0,0.5)', background: 'rgba(255,208,0,0.06)', border: '1px solid rgba(255,208,0,0.15)' }}
          >
            LIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
