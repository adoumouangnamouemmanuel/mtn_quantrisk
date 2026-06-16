import React from 'react';
import Link from 'next/link';
import { User, Settings, Shield, HelpCircle, LogOut, X } from 'lucide-react';

export function ProfilePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-12 right-0 w-64 bg-surface border border-outline/20 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-outline/10 bg-surface-container-low flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-mtn-yellow flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-mtn-yellow" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white leading-tight">Risk Analyst</h3>
            <span className="font-mono text-[10px] text-on-surface-variant tracking-widest uppercase block mt-1">
              analyst@mtn.com
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-on-surface-variant hover:text-white transition-colors p-1 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex flex-col py-2">
        <Link 
          href="/settings" 
          onClick={onClose}
          className="flex items-center px-4 py-2.5 text-sm font-sans text-on-surface hover:text-mtn-yellow hover:bg-surface-container transition-colors"
        >
          <Settings className="w-4 h-4 mr-3 text-on-surface-variant" />
          Account Settings
        </Link>
        <button className="flex items-center w-full px-4 py-2.5 text-sm font-sans text-on-surface hover:text-mtn-yellow hover:bg-surface-container transition-colors text-left">
          <Shield className="w-4 h-4 mr-3 text-on-surface-variant" />
          Access Credentials
        </button>
        <button className="flex items-center w-full px-4 py-2.5 text-sm font-sans text-on-surface hover:text-mtn-yellow hover:bg-surface-container transition-colors text-left">
          <HelpCircle className="w-4 h-4 mr-3 text-on-surface-variant" />
          Help & Support
        </button>
      </div>

      <div className="p-2 border-t border-outline/10 bg-surface-container-low">
        <Link 
          href="/login" 
          onClick={onClose}
          className="flex items-center px-2 py-2 text-sm font-sans text-error hover:bg-error/10 hover:text-red-400 rounded transition-colors w-full"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
