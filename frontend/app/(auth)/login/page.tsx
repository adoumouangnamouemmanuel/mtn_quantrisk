"use client";

import React, { useActionState, useState } from 'react';
import { EyeOff, Eye, Key, Lock, Loader2 } from 'lucide-react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden font-sans bg-surface">

      {/* Left Pane - Branding & Value Proposition */}
      <div className="flex flex-col justify-between w-full md:w-1/2 p-8 md:p-12 lg:p-16 relative">
        {/* Top Header */}
        <div className="flex items-center space-x-3">
          <div className="bg-mtn-yellow text-black font-bold px-2 py-1 text-sm tracking-wider">
            MTN
          </div>
          <div className="text-on-surface-variant font-mono text-xs tracking-widest uppercase">
            QuantRisk Intelligence
          </div>
        </div>

        {/* Center Content */}
        <div className="my-16 md:my-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white">
            From Breaking News<br />to Board Briefing
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl mb-8">
            AI-powered risk detection... Real-time. Predictive. Precise.
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center px-3 py-1.5 bg-surface-container rounded border border-outline/50">
              <span className="text-xs font-mono text-white">15 MIN</span>
            </div>
            <div className="flex items-center px-3 py-1.5 bg-surface-container rounded border border-outline/50">
              <span className="text-xs font-mono text-white">500+ Articles/Day</span>
            </div>
            <div className="flex items-center px-3 py-1.5 bg-surface-container rounded border border-outline/50">
              <span className="text-xs font-mono text-white">6 Risk Categories</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs font-mono text-on-surface-variant tracking-widest uppercase">
          CONFIDENTIAL . MTN GHANA . 2026
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full md:w-1/2 bg-surface-container-low flex items-center justify-center p-8 relative overflow-hidden">
        {/* Dotted Background Pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

        <div className="w-full max-w-md relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-on-surface-variant text-sm mb-10">
            Sign in to your risk intelligence workspace
          </p>

          <form
            className="space-y-6"
            action={formAction}
          >
            {state.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded">
                {state.error}
              </div>
            )}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="analyst@mtn.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline/50 rounded p-3 text-white focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow focus:outline-none transition-all placeholder:text-outline"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/50 rounded p-3 text-white focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow focus:outline-none transition-all pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-on-surface-variant hover:text-white transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={pending}
              className="w-full flex items-center justify-center bg-mtn-yellow text-black font-bold uppercase tracking-widest py-3.5 rounded mt-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>

            <div className="flex items-center my-6">
              <hr className="flex-1 border-outline/50" />
              <span className="px-4 text-xs font-mono text-on-surface-variant">OR</span>
              <hr className="flex-1 border-outline/50" />
            </div>

            <button type="button" disabled className="w-full bg-surface-container-low border border-outline/50 text-on-surface-variant font-bold py-3.5 rounded flex items-center justify-center space-x-3 cursor-not-allowed opacity-60">
              <Key className="w-4 h-4" />
              <span>MTN SSO — Coming Soon</span>
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center text-xs text-on-surface-variant">
            <Lock className="w-3 h-3 mr-2" />
            Secured by MTN Enterprise Security
          </div>
        </div>
      </div>
    </div>
  );
}
