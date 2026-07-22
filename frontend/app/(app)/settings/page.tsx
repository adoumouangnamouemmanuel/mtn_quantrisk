"use client";

import { useEffect, useState } from 'react';
import { fetchPipelineHealth, retrainModels } from '@/lib/api';
import type { PipelineHealth } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { UploadZone } from '@/components/data/UploadZone';
import { BaseCaseLogs } from '@/components/data/BaseCaseLogs';
import { RefreshCw, Database, Upload, History } from 'lucide-react';

export default function SettingsPage() {
  const [health, setHealth] = useState<PipelineHealth | null>(null);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState('');
  const [logsKey, setLogsKey] = useState(0);

  useEffect(() => { fetchPipelineHealth().then(setHealth).catch(console.error); }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg('');
    try {
      const res = await retrainModels();
      setRetrainMsg(res.success ? 'Models retrained successfully.' : `Retrain failed: ${res.stderr.slice(0, 120)}`);
    } catch (e: unknown) {
      setRetrainMsg(e instanceof Error ? e.message : 'Retrain error');
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Settings & Integrations</h1>
        <p className="text-on-surface-variant mt-1">Manage data pipelines, uploads, and system configuration</p>
      </div>

      {/* ── Row 1: Pipeline health + Account ─────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-outline/20 pb-3">
            <Database className="w-4 h-4 text-mtn-yellow" />
            <h2 className="font-sans font-medium text-on-surface">Data Pipeline Health</h2>
          </div>
          {!health ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBlock key={i} className="h-10" />)}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface-container-high p-3 rounded-lg">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Global Status</span>
                <Chip variant={health.status === 'Healthy' ? 'success' : 'warning'}>{health.status}</Chip>
              </div>
              {health.automaticScraper && (
                <div className="rounded-lg border border-outline/20 bg-surface-container-low p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-sans text-sm text-on-surface">Automatic News Scraper</span>
                    <Chip variant={health.automaticScraper.status === 'Scheduled' ? 'success' : 'warning'}>
                      {health.automaticScraper.status}
                    </Chip>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Next run: {health.automaticScraper.nextRunAt
                      ? new Date(health.automaticScraper.nextRunAt).toLocaleString()
                      : 'Not scheduled'}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {health.sources.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-2.5 border border-outline/10 rounded-lg hover:bg-surface-container transition-colors">
                    <div>
                      <p className="font-sans text-sm text-on-surface">{s.name}</p>
                      <p className="font-mono text-[9px] text-on-surface-variant mt-0.5 uppercase tracking-widest">Latency: {s.latencyMs}ms</p>
                    </div>
                    <Chip size="sm" variant={s.status === 'Healthy' ? 'success' : 'error'}>{s.status}</Chip>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="font-sans font-medium text-on-surface border-b border-outline/20 pb-3">Account Details</h2>
          <div className="space-y-3">
            {[
              { label: 'User Role',        value: 'Executive Risk Analyst' },
              { label: 'Session Timeout',  value: '30 minutes' },
              { label: 'Theme',            value: 'Precision Dark' },
            ].map(f => (
              <div key={f.label}>
                <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{f.label}</p>
                <p className="font-sans text-sm text-on-surface bg-surface-container p-2.5 rounded-lg border border-outline/10">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-outline/20 pt-3">
            <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">XGBoost Models</p>
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline/20 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant hover:border-mtn-yellow/40 hover:text-mtn-yellow disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              {retraining ? 'Retraining…' : 'Retrain Models'}
            </button>
            {retrainMsg && (
              <p className={`mt-2 font-mono text-[9px] ${retrainMsg.startsWith('Models') ? 'text-green-400' : 'text-error'}`}>
                {retrainMsg}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Row 2: Upload ─────────────────────────────────────────────────── */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-outline/20 pb-3">
          <Upload className="w-4 h-4 text-mtn-yellow" />
          <div>
            <h2 className="font-sans font-medium text-on-surface">Upload Data</h2>
            <p className="font-mono text-[9px] text-on-surface-variant mt-0.5">
              Upload a CSV to directly update base case values, or a PDF to extract KPIs via LLM
            </p>
          </div>
        </div>
        <UploadZone onSuccess={() => setLogsKey(k => k + 1)} />
      </Card>

      {/* ── Row 3: Base case logs ─────────────────────────────────────────── */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-outline/20 pb-3">
          <History className="w-4 h-4 text-mtn-yellow" />
          <h2 className="font-sans font-medium text-on-surface">Base Case Change History</h2>
        </div>
        <BaseCaseLogs key={logsKey} />
      </Card>
    </div>
  );
}
