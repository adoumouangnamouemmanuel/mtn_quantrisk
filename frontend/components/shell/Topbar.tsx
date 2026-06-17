"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { Chip } from '../ui/Chip';
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
      router.push(`/forecasts`);
    }
  };

  return (
    <header className="h-16 bg-surface-container-low border-b border-outline/20 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-40">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 mr-2 lg:hidden text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-on-surface-variant" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search KPIs, Scenarios (e.g. FIN01, Macro)" 
            className="bg-surface-container border border-outline/30 rounded-md py-1.5 pl-9 pr-4 text-sm text-on-surface focus:outline-none focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow w-80 font-sans"
          />
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-surface-container-high border border-outline/20 rounded-md shadow-2xl overflow-hidden z-50">
              {kpiSuggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-mono text-outline uppercase tracking-widest">KPIs</div>
                  {kpiSuggestions.map(k => (
                    <div 
                      key={k.id} 
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        handleSuggestionClick('kpi', k.id);
                      }}
                      className="px-3 py-1.5 hover:bg-surface-container cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-sans text-sm text-white truncate mr-2">{k.name}</span>
                      <span className="font-mono text-xs text-on-surface-variant shrink-0">{k.id}</span>
                    </div>
                  ))}
                </div>
              )}
              {scenarioSuggestions.length > 0 && (
                <div className="py-2 border-t border-outline/10">
                  <div className="px-3 pb-1 text-[10px] font-mono text-outline uppercase tracking-widest">Scenarios</div>
                  {scenarioSuggestions.map(s => (
                    <div 
                      key={s.id} 
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        handleSuggestionClick('scenario', s.id);
                      }}
                      className="px-3 py-1.5 hover:bg-surface-container cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-sans text-sm text-white truncate mr-2">{s.name}</span>
                      <span className="font-mono text-xs text-on-surface-variant shrink-0">{s.id}</span>
                    </div>
                  ))}
                </div>
              )}
              {kpiSuggestions.length === 0 && scenarioSuggestions.length === 0 && (
                <div className="px-3 py-4 text-sm text-on-surface-variant text-center font-mono">
                  No matches found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4" ref={containerRef}>
        <div className="hidden sm:flex items-center space-x-2 mr-2">
          <Chip variant="success" size="sm">Pipeline: Healthy</Chip>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setActivePanel(activePanel === 'notifications' ? null : 'notifications')}
            className={`p-2 rounded-md relative transition-colors ${activePanel === 'notifications' ? 'bg-surface-container text-mtn-yellow' : 'text-on-surface-variant hover:text-mtn-yellow hover:bg-surface-container'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>
          {activePanel === 'notifications' && (
            <NotificationsPanel onClose={() => setActivePanel(null)} />
          )}
        </div>
        
        <div className="relative">
          <div 
            onClick={() => setActivePanel(activePanel === 'profile' ? null : 'profile')}
            className={`h-8 w-8 rounded-full bg-surface-container-high border flex items-center justify-center overflow-hidden ml-2 cursor-pointer transition-colors ${activePanel === 'profile' ? 'border-mtn-yellow text-mtn-yellow' : 'border-outline/50 hover:border-mtn-yellow text-on-surface-variant hover:text-mtn-yellow'}`}
          >
            <User className="w-4 h-4" />
          </div>
          {activePanel === 'profile' && (
            <ProfilePanel onClose={() => setActivePanel(null)} />
          )}
        </div>
      </div>
    </header>
  );
}
