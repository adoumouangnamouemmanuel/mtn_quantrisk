"use client";

import { EyeOff, Lock, Zap, Radio, Target, Key } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black font-sans">
      {/* Left Panel */}
      <div className="w-full md:w-[55%] p-8 lg:p-16 flex flex-col justify-between relative border-r border-[#222]">
        <div className="flex items-center gap-3">
          {/* MTN Logo block */}
          <div className="bg-[#facc15] text-black font-bold text-xs px-2 py-0.5">
            MTN
          </div>
          <div className="text-[9px] font-mono text-[#888] tracking-widest leading-tight">
            QUANTRISK
            <br />
            INTELLIGENCE
          </div>
        </div>

        <div className="max-w-xl mb-10">
          <h1 className="text-[1.5rem] md:text-[3rem] font-bold text-white leading-[1.05] mb-6 tracking-tight">
            From Breaking News<br />to Board Briefing
          </h1>
          <p className="text-sm lg:text-base text-[#888] mb-8">
            AI-powered risk detection... Real-time. Predictive. Precise.
          </p>

          <div className="flex flex-wrap gap-2 lg:gap-3">
            <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-sm border border-[#333]">
              <Zap size={12} className="text-[#facc15] fill-[#facc15]" />
              <span className="text-[10px] font-mono text-[#ccc] tracking-widest uppercase">15 MIN</span>
            </div>
            <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-sm border border-[#333]">
              <Radio size={12} className="text-[#0ea5e9]" />
              <span className="text-[10px] font-mono text-[#ccc] tracking-widest uppercase">500+ Articles/Day</span>
            </div>
            <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-sm border border-[#333]">
              <Target size={12} className="text-[#ef4444]" />
              <span className="text-[10px] font-mono text-[#ccc] tracking-widest uppercase">6 Risk Categories</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] font-mono text-[#666] tracking-[0.2em] uppercase">
          CONFIDENTIAL &middot; MTN GHANA &middot; 2025
        </div>
      </div>

      {/* Right Panel */}
      <div 
        className="w-full md:w-[45%] bg-[#0a0a0a] flex items-center justify-center p-8 lg:p-12 relative h-full"
        style={{
          backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div className="w-full max-w-[320px] relative z-10 flex flex-col justify-center">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-1.5">Welcome Back</h2>
          <p className="text-[#888] mb-8 text-xs">
            Sign in to your risk intelligence workspace
          </p>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-[#666] tracking-[0.2em] uppercase">
                Work Email
              </label>
              <input
                type="email"
                defaultValue="analyst@mtn.com"
                className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2.5 text-[#ccc] text-sm focus:outline-none focus:border-[#facc15] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-[#666] tracking-[0.2em] uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2.5 text-[#ccc] text-sm focus:outline-none focus:border-[#facc15] transition-colors tracking-widest"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#ccc] transition-colors">
                  <EyeOff size={14} />
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-2.5 rounded-sm transition-colors uppercase tracking-[0.2em] text-[10px] mt-2">
              Sign In
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="h-px bg-[#222] flex-1"></div>
              <span className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Or</span>
              <div className="h-px bg-[#222] flex-1"></div>
            </div>

            <button type="button" className="w-full bg-transparent border border-[#333] hover:bg-[#111] text-white font-bold py-2.5 rounded-sm transition-colors flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase">
              <Key size={12} className="text-[#888]" />
              Sign in with MTN SSO
            </button>
          </form>

          <div className="mt-10 flex items-center gap-2 text-[#555] text-[10px]">
            <Lock size={10} />
            <span>Secured by MTN Enterprise Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
