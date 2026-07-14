"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, List, Calendar, CalendarDays, LineChart,
  FileText, FlaskConical, GitCompare, ActivitySquare,
  Settings, HelpCircle, Dices, Zap, Newspaper, Bell
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: import('lucide-react').LucideIcon;
  disabled?: boolean;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  {
    group: 'Core',
    items: [
      { href: '/dashboard',    label: 'Core Anchors',    icon: LayoutDashboard },
      { href: '/kri-register', label: 'Full KRI Book',   icon: List },
      { href: '/quarterly',    label: 'Quarterly Trends',icon: CalendarDays },
      { href: '/monthly',      label: 'Monthly Trends',  icon: Calendar },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { href: '/forecasts', label: 'Predictive (90d)', icon: LineChart },
      { href: '/briefs',    label: 'Board Briefs',     icon: FileText },
    ],
  },
  {
    group: 'Advanced Modeling',
    items: [
      { href: '/scenarios',    label: 'Stress Tester',    icon: FlaskConical },
      { href: '/compare',      label: 'Scenario Compare', icon: GitCompare },
      { href: '/reverse',      label: 'Reverse Stress',   icon: ActivitySquare },
      { href: '/monte-carlo',  label: 'Monte Carlo',      icon: Dices, badge: 'AI' },
    ],
  },
  {
    group: 'Live Intelligence',
    items: [
      { href: '/news',    label: 'News Feed',  icon: Newspaper, badge: 'NEW' },
      { href: '/alerts',  label: 'Risk Alerts', icon: Bell,      badge: 'NEW' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-white/5"
      style={{ background: 'linear-gradient(180deg, #0E0E1A 0%, #0A0A12 100%)' }}
    >
      {/* ── Brand header ── */}
      <div className="relative overflow-hidden px-5 py-5 border-b border-white/5 sidebar-header-bg">
        {/* Decorative yellow circle glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FFD000, transparent 70%)' }} />

        {/* MTN dot + wordmark */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg gradient-mtn flex items-center justify-center shrink-0 glow-yellow-sm">
            <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-hero font-black text-lg tracking-tight" style={{ color: '#F0EDE8' }}>
              Quant<span className="gradient-mtn-text">Risk</span>
            </span>
          </div>
        </div>

        <p className="font-mono text-xs tracking-widest uppercase mt-1.5 pl-0.5"
          style={{ color: 'rgba(255, 208, 0, 0.5)', fontSize: '11px' }}>
          MTN Ghana · AI Risk Intelligence
        </p>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {NAV_ITEMS.map((group, idx) => (
          <div key={idx} className="mb-1">
            {/* Group label */}
            <div className="px-5 pt-4 pb-1.5">
              <span className="font-mono font-bold uppercase tracking-widest"
                style={{ fontSize: '10px', color: 'rgba(160, 155, 176, 0.5)' }}>
                {group.group}
              </span>
            </div>

            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <div className="flex items-center px-3 py-2 rounded-lg text-sm font-sans font-medium cursor-not-allowed"
                        style={{ color: 'rgba(160, 155, 176, 0.3)' }}>
                        <Icon className="w-4 h-4 mr-3 opacity-30" />
                        {item.label}
                        <span className="ml-auto font-mono rounded px-1.5 py-0.5 border"
                          style={{ fontSize: '9px', color: 'rgba(160,155,176,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          SOON
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-150 group relative ${
                        isActive ? 'nav-active-glow' : ''
                      }`}
                      style={isActive ? {
                        color: '#FFD000',
                        background: 'rgba(255, 208, 0, 0.08)',
                      } : {
                        color: 'rgba(240, 237, 232, 0.65)',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.color = '#F0EDE8';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.color = 'rgba(240, 237, 232, 0.65)';
                          (e.currentTarget as HTMLElement).style.background = '';
                        }
                      }}
                    >
                      <Icon
                        className="w-4 h-4 mr-3 shrink-0 transition-colors"
                        style={{ color: isActive ? '#FFD000' : 'inherit', opacity: isActive ? 1 : 0.7 }}
                      />
                      <span className="flex-1 leading-none">{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 font-mono rounded px-1.5 py-0.5 text-black font-bold shrink-0 gradient-mtn"
                          style={{ fontSize: '9px' }}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Bottom utilities ── */}
      <div className="px-2 py-3 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {[
          { href: '/help',     label: 'Help & Support', icon: HelpCircle },
          { href: '/settings', label: 'Settings',       icon: Settings },
        ].map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-150"
              style={isActive ? {
                color: '#FFD000',
                background: 'rgba(255, 208, 0, 0.08)',
              } : {
                color: 'rgba(240, 237, 232, 0.5)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#F0EDE8';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(240, 237, 232, 0.5)';
                  (e.currentTarget as HTMLElement).style.background = '';
                }
              }}
            >
              <Icon className="w-4 h-4 mr-3" style={{ opacity: 0.6 }} />
              {label}
            </Link>
          );
        })}

        {/* Version tag */}
        <div className="px-3 pt-2 flex items-center justify-between">
          <span className="font-mono" style={{ fontSize: '10px', color: 'rgba(160,155,176,0.35)' }}>
            v1.0 · FY25
          </span>
          <span className="font-mono px-1.5 py-0.5 rounded"
            style={{ fontSize: '9px', color: 'rgba(255,208,0,0.5)', background: 'rgba(255,208,0,0.06)', border: '1px solid rgba(255,208,0,0.15)' }}>
            LIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
