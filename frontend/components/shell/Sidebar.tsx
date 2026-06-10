"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, List, Calendar, CalendarDays, LineChart, 
  FileText, FlaskConical, GitCompare, ActivitySquare, Settings
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  disabled?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  { group: 'Core', items: [
    { href: '/dashboard', label: 'Core Anchors', icon: LayoutDashboard },
    { href: '/kri-register', label: 'Full KRI Book', icon: List },
    { href: '/quarterly', label: 'Quarterly Trends', icon: CalendarDays },
    { href: '/monthly', label: 'Monthly Trends', icon: Calendar },
  ]},
  { group: 'Intelligence', items: [
    { href: '/forecasts', label: 'Predictive (90d)', icon: LineChart },
    { href: '/briefs', label: 'Board Briefs', icon: FileText },
  ]},
  { group: 'Advanced Modeling', items: [
    { href: '/scenarios', label: 'Stress Tester', icon: FlaskConical, disabled: true },
    { href: '/compare', label: 'Scenario Compare', icon: GitCompare, disabled: true },
    { href: '/reverse', label: 'Reverse Stress', icon: ActivitySquare, disabled: true },
  ]}
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline/20 h-full flex flex-col">
      <div className="p-6 border-b border-outline/20">
        <h1 className="font-hero font-bold text-xl text-on-surface">
          QuantRisk <span className="text-mtn-yellow">AI</span>
        </h1>
        <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">
          Precision Intelligence
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {NAV_ITEMS.map((group, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-6 mb-2 text-[10px] font-mono font-bold text-outline uppercase tracking-widest">
              {group.group}
            </div>
            <ul>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <div className="flex items-center px-6 py-2.5 text-sm font-sans font-medium text-outline cursor-not-allowed">
                        <Icon className="w-4 h-4 mr-3 opacity-50" />
                        {item.label}
                        <span className="ml-auto text-[8px] uppercase tracking-widest bg-surface-container border border-outline/20 px-1.5 py-0.5 rounded">Soon</span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={`flex items-center px-6 py-2.5 text-sm font-sans font-medium transition-colors ${
                        isActive 
                          ? 'text-mtn-yellow bg-mtn-yellow/10 border-r-2 border-mtn-yellow' 
                          : 'text-on-surface hover:bg-surface-container hover:text-mtn-yellow'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-outline/20">
        <Link 
          href="/settings"
          className={`flex items-center px-4 py-2 text-sm font-sans font-medium rounded-md transition-colors ${
            pathname === '/settings' 
              ? 'text-mtn-yellow bg-mtn-yellow/10' 
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
