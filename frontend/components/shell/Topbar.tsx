"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, Shield } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfilePanel } from './ProfilePanel';
import { useRouter } from 'next/navigation';
import { MOCK_KPIS, MOCK_SCENARIOS } from '@/lib/mockData';
import { useAppState } from '@/stores/useAppState';
import { KpiId } from '@/lib/types';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [activePanel, setActivePanel] = useState<'notifications' | 'profile' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const { dispatch } = useAppState();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const kpiSuggestions = MOCK_KPIS.filter(k =>
    k.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const scenarioSuggestions = MOCK_SCENARIOS.filter(s =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const handleSuggestionClick = (type: 'kpi' | 'scenario', id: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    if (type === 'scenario') {
      router.push(`/scenarios?id=${id}`);
    } else {
      dispatch({ type: 'SET_ACTIVE_FORECAST_KPI', payload: id as KpiId });
      router.push('/forecasts');
    }
  };

  return (
    <header className="shrink-0 relative z-40" style={{ background: '#0A0A12', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Yellow accent line at very top */}
      <div className="topbar-accent h-[2px] w-full" />

      <div className="h-14 flex items-center justify-between px-4 lg:px-6">

        {/* Left: mobile menu + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 lg:hidden rounded-lg transition-colors"
            style={{ color: 'rgba(240,237,232,0.5)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F0EDE8'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,232,0.5)'}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 z-10" style={{ color: 'rgba(160,155,176,0.6)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={e => {
                setShowSuggestions(true);
                (e.target as HTMLInputElement).style.borderColor = 'rgba(255,208,0,0.4)';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(255,208,0,0.08)';
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Search KPIs, scenarios…"
              className="w-72 py-2 pl-9 pr-4 rounded-xl text-sm font-sans transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F0EDE8',
                outline: 'none',
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl overflow-hidden z-50"
                style={{ background: '#161622', border: '1px solid rgba(255,255,255,0.08)', minWidth: '320px' }}>
                {kpiSuggestions.length > 0 && (
                  <div className="py-2">
                    <div className="px-3 py-1.5 font-mono uppercase tracking-widest"
                      style={{ fontSize: '10px', color: 'rgba(255,208,0,0.5)' }}>
                      KPIs
                    </div>
                    {kpiSuggestions.map(k => (
                      <div
                        key={k.id}
                        onMouseDown={e => { e.preventDefault(); handleSuggestionClick('kpi', k.id); }}
                        className="px-3 py-2 flex justify-between items-center cursor-pointer transition-colors"
                        style={{ color: '#F0EDE8' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,208,0,0.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                      >
                        <span className="text-sm truncate mr-3">{k.name}</span>
                        <span className="font-mono text-xs shrink-0" style={{ color: 'rgba(255,208,0,0.7)' }}>{k.id}</span>
                      </div>
                    ))}
                  </div>
                )}
                {scenarioSuggestions.length > 0 && (
                  <div className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="px-3 py-1.5 font-mono uppercase tracking-widest"
                      style={{ fontSize: '10px', color: 'rgba(255,208,0,0.5)' }}>
                      Scenarios
                    </div>
                    {scenarioSuggestions.map(s => (
                      <div
                        key={s.id}
                        onMouseDown={e => { e.preventDefault(); handleSuggestionClick('scenario', s.id); }}
                        className="px-3 py-2 flex justify-between items-center cursor-pointer transition-colors"
                        style={{ color: '#F0EDE8' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,208,0,0.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                      >
                        <span className="text-sm truncate mr-3">{s.name}</span>
                        <span className="font-mono text-xs shrink-0" style={{ color: 'rgba(160,155,176,0.7)' }}>{s.id}</span>
                      </div>
                    ))}
                  </div>
                )}
                {kpiSuggestions.length === 0 && scenarioSuggestions.length === 0 && (
                  <div className="px-3 py-5 text-center font-mono text-sm" style={{ color: 'rgba(160,155,176,0.5)' }}>
                    No results for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-2" ref={containerRef}>

          {/* Pipeline status chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg mr-1"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs font-medium" style={{ color: 'rgba(74,222,128,0.9)', fontSize: '11px' }}>
              Pipeline Healthy
            </span>
          </div>

          {/* Live data badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,208,0,0.06)', border: '1px solid rgba(255,208,0,0.15)' }}>
            <Shield className="w-3 h-3" style={{ color: '#FFD000' }} />
            <span className="font-mono font-bold" style={{ fontSize: '10px', color: '#FFD000' }}>FY25</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setActivePanel(activePanel === 'notifications' ? null : 'notifications')}
              className="relative p-2 rounded-lg transition-all"
              style={{
                color: activePanel === 'notifications' ? '#FFD000' : 'rgba(160,155,176,0.7)',
                background: activePanel === 'notifications' ? 'rgba(255,208,0,0.08)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (activePanel !== 'notifications') (e.currentTarget as HTMLElement).style.color = '#F0EDE8';
              }}
              onMouseLeave={e => {
                if (activePanel !== 'notifications') (e.currentTarget as HTMLElement).style.color = 'rgba(160,155,176,0.7)';
              }}
            >
              <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-current"
                style={{ background: '#FF8A80', borderColor: '#0A0A12' }} />
            </button>
            {activePanel === 'notifications' && (
              <NotificationsPanel onClose={() => setActivePanel(null)} />
            )}
          </div>

          {/* Avatar */}
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
              onMouseEnter={e => {
                if (activePanel !== 'profile') {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,208,0,0.4)';
                  (e.currentTarget as HTMLElement).style.color = '#FFD000';
                }
              }}
              onMouseLeave={e => {
                if (activePanel !== 'profile') {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(160,155,176,0.8)';
                }
              }}
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
