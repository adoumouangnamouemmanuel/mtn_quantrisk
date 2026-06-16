"use client";

import React from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { AppStateProvider } from '@/stores/useAppState';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <AppStateProvider>
      <div className="flex h-screen overflow-hidden bg-surface">
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppStateProvider>
  );
}
