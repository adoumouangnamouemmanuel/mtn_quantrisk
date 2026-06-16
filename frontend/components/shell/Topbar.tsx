"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { Chip } from '../ui/Chip';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfilePanel } from './ProfilePanel';

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
            placeholder="Search KPIs, Scenarios (e.g. FIN01, Macro)" 
            className="bg-surface-container border border-outline/30 rounded-md py-1.5 pl-9 pr-4 text-sm text-on-surface focus:outline-none focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow w-80 font-sans"
          />
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
