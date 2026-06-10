"use client";

import React, { useEffect, useState } from 'react';
import { fetchPipelineHealth } from '@/lib/api';
import { PipelineHealth } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export default function SettingsPage() {
  const [health, setHealth] = useState<PipelineHealth | null>(null);

  useEffect(() => {
    fetchPipelineHealth().then(setHealth);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Settings & Integrations</h1>
        <p className="text-on-surface-variant mt-1">Manage data pipelines and system configuration</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h2 className="text-lg font-sans font-medium text-on-surface border-b border-outline/20 pb-2">Data Pipeline Health</h2>
          
          {!health ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-10" />
              <SkeletonBlock className="h-10" />
              <SkeletonBlock className="h-10" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface-container-high p-3 rounded-md">
                <span className="font-mono text-sm text-on-surface-variant uppercase tracking-widest">Global Status</span>
                <Chip variant={health.status === 'Healthy' ? 'success' : 'warning'}>{health.status}</Chip>
              </div>
              
              <div className="space-y-2">
                {health.sources.map(source => (
                  <div key={source.name} className="flex items-center justify-between p-2 border border-outline/10 rounded-md hover:bg-surface-container transition-colors">
                    <div>
                      <div className="text-sm font-sans font-medium text-on-surface">{source.name}</div>
                      <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-0.5">
                        Latency: {source.latencyMs}ms
                      </div>
                    </div>
                    <Chip size="sm" variant={source.status === 'Healthy' ? 'success' : 'error'}>
                      {source.status}
                    </Chip>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-sans font-medium text-on-surface border-b border-outline/20 pb-2">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">User Role</label>
              <div className="text-sm font-sans text-on-surface bg-surface-container p-2 rounded border border-outline/20">Executive Risk Analyst</div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Session Timeout</label>
              <div className="text-sm font-sans text-on-surface bg-surface-container p-2 rounded border border-outline/20">30 minutes</div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Theme</label>
              <div className="flex items-center space-x-2">
                <Chip variant="default" className="border-mtn-yellow text-mtn-yellow">Precision Dark</Chip>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
