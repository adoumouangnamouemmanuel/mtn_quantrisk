"use client";

import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { Chip } from '../ui/Chip';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-surface-container-low border-b border-outline/20 flex items-center justify-between px-4 lg:px-8 shrink-0">
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

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 mr-2">
          <Chip variant="success" size="sm">Pipeline: Healthy</Chip>
        </div>
        
        <button className="p-2 text-on-surface-variant hover:text-mtn-yellow hover:bg-surface-container rounded-md relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-surface-container-high border border-outline/50 flex items-center justify-center overflow-hidden ml-2 cursor-pointer hover:border-mtn-yellow transition-colors">
          <User className="w-4 h-4 text-on-surface-variant" />
        </div>
      </div>
    </header>
  );
}
