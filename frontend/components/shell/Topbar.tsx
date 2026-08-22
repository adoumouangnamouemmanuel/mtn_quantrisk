"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfilePanel } from './ProfilePanel';
import { Tooltip } from '@/components/ui/Tooltip';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [activePanel, setActivePanel] = useState<'notifications' | 'profile' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="shrink-0 relative z-40"
      style={{ background: '#0A0A12', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="topbar-accent h-[2px] w-full" />

      <div className="h-14 flex items-center justify-between px-4 lg:px-6">
        {/* Left: mobile menu + global risk status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 lg:hidden rounded-lg transition-colors"
            style={{ color: 'rgba(240,237,232,0.5)' }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global risk status — fetched live, replaces the hardcoded chip */}
          <Tooltip
            content="Active alerts across all risk categories. Click Alerts in the sidebar to triage."
            side="bottom"
          >
            <a href="/alerts" className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="font-mono font-medium" style={{ fontSize: '11px', color: 'rgba(74,222,128,0.9)' }}>
                Live
              </span>
            </a>
          </Tooltip>
        </div>

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-2" ref={containerRef}>
          <div className="relative">
            <button
              onClick={() => setActivePanel(activePanel === 'notifications' ? null : 'notifications')}
              className="relative p-2 rounded-lg transition-all"
              style={{
                color: activePanel === 'notifications' ? '#FFD000' : 'rgba(160,155,176,0.7)',
                background: activePanel === 'notifications' ? 'rgba(255,208,0,0.08)' : 'transparent',
              }}
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-current"
                style={{ background: '#FF8A80', borderColor: '#0A0A12' }}
              />
            </button>
            {activePanel === 'notifications' && (
              <NotificationsPanel onClose={() => setActivePanel(null)} />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActivePanel(activePanel === 'profile' ? null : 'profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: activePanel === 'profile'
                  ? 'linear-gradient(135deg, #FFD000, #F5A623)'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${activePanel === 'profile' ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                color: activePanel === 'profile' ? '#000' : 'rgba(160,155,176,0.8)',
              }}
              aria-label="Account"
            >
              <User className="w-4 h-4" />
            </button>
            {activePanel === 'profile' && (
              <ProfilePanel onClose={() => setActivePanel(null)} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
