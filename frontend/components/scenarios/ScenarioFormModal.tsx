'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Scenario, ScenarioFormData, PillarId, ScenarioType } from '@/lib/types';

const PILLAR_OPTIONS: { id: PillarId; name: string }[] = [
  { id: 'A', name: 'Macro & FX' },
  { id: 'B', name: 'Regulatory' },
  { id: 'C', name: 'Tech & Cyber' },
  { id: 'D', name: 'Competitive' },
  { id: 'E', name: 'Operational & Climate' },
  { id: 'F', name: 'Upside' },
  { id: 'G', name: 'Tail Risk' },
];

const KPI_OPTIONS = [
  { id: 'FIN01', label: 'FIN01 — Service Revenue' },
  { id: 'FIN02', label: 'FIN02 — EBITDA' },
  { id: 'FIN03', label: 'FIN03 — EBITDA Margin' },
  { id: 'FIN04', label: 'FIN04 — PAT' },
  { id: 'FIN05', label: 'FIN05 — PAT Margin' },
  { id: 'FIN06', label: 'FIN06 — Revenue Growth' },
  { id: 'SEG01', label: 'SEG01 — Data Revenue' },
  { id: 'SEG03', label: 'SEG03 — MoMo Revenue' },
  { id: 'OPS01', label: 'OPS01 — Total Subscribers' },
  { id: 'OPS04', label: 'OPS04 — ARPU' },
  { id: 'OPS07', label: 'OPS07 — 4G Coverage' },
  { id: 'EXT01', label: 'EXT01 — Inflation' },
  { id: 'EXT02', label: 'EXT02 — BoG Policy Rate' },
  { id: 'EXT03', label: 'EXT03 — Cedi/USD' },
];

const BLANK: ScenarioFormData = {
  name: '',
  pillar: 'A',
  type: 'Stress',
  severity: 3,
  plausibility: 3,
  description: '',
  kpiImpacts: [],
  calibrationAnchor: '',
};

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Scenario;
  onClose: () => void;
  onSaved: (scenario: Scenario) => void;
}

export function ScenarioFormModal({ open, mode, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<ScenarioFormData>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (mode === 'edit' && initial) {
        setForm({
          name: initial.name,
          pillar: initial.pillar,
          type: initial.type,
          severity: initial.severity,
          plausibility: initial.plausibility,
          description: initial.description,
          kpiImpacts: initial.kpiImpacts.map(i => ({ kpiId: i.kpiId, type: i.type, value: i.value })),
          calibrationAnchor: initial.calibrationAnchor ?? '',
        });
      } else {
        setForm(BLANK);
      }
      setError(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [open, mode, initial]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Scenario name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const { createScenario, updateScenario } = await import('@/lib/api');
      const result = (mode === 'edit' && initial)
        ? await updateScenario(initial.id, form)
        : await createScenario(form);
      onSaved(result);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save scenario');
    } finally {
      setSaving(false);
    }
  };

  const addImpact = () =>
    setForm(f => ({ ...f, kpiImpacts: [...f.kpiImpacts, { kpiId: 'FIN01', type: 'pct', value: 0 }] }));

  const removeImpact = (i: number) =>
    setForm(f => ({ ...f, kpiImpacts: f.kpiImpacts.filter((_, j) => j !== i) }));

  const updateImpact = (i: number, key: string, val: string | number) =>
    setForm(f => ({ ...f, kpiImpacts: f.kpiImpacts.map((imp, j) => j === i ? { ...imp, [key]: val } : imp) }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#1A1A1A] border border-outline/30 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-mtn-yellow uppercase tracking-widest">
              {mode === 'create' ? 'NEW SCENARIO' : 'EDIT SCENARIO'}
            </span>
            {initial && mode === 'edit' && (
              <span className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                {initial.id}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

          {/* Name */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              Scenario Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Cedi devalues 30% against USD"
              className="w-full bg-surface border border-outline/20 rounded-lg px-4 py-2.5 text-sm text-on-surface font-sans placeholder:text-on-surface-variant/50 focus:outline-none focus:border-mtn-yellow transition-colors"
            />
          </div>

          {/* Pillar + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Pillar</label>
              <div className="flex flex-wrap gap-1.5">
                {PILLAR_OPTIONS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, pillar: p.id }))}
                    title={p.name}
                    className={`w-8 h-8 rounded font-mono text-xs font-bold transition-all ${
                      form.pillar === p.id
                        ? 'bg-mtn-yellow text-black ring-2 ring-mtn-yellow/50'
                        : 'bg-surface border border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40'
                    }`}
                  >
                    {p.id}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-mtn-yellow">
                {PILLAR_OPTIONS.find(p => p.id === form.pillar)?.name}
              </p>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {(['Stress', 'Shock', 'Combined', 'Upside'] as ScenarioType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wide transition-all ${
                      form.type === t
                        ? 'bg-mtn-yellow text-black font-bold'
                        : 'bg-surface border border-outline/20 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Severity + Plausibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Severity <span className="text-error">{'●'.repeat(form.severity)}{'○'.repeat(5 - form.severity)}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, severity: n }))}
                    className={`w-9 h-9 rounded-full font-mono text-xs font-bold transition-all ${
                      n <= form.severity
                        ? 'bg-error text-white shadow-[0_0_8px_rgba(255,80,80,0.4)]'
                        : 'bg-surface border border-outline/20 text-on-surface-variant hover:border-error/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Plausibility <span className="text-mtn-yellow">{'●'.repeat(form.plausibility)}{'○'.repeat(5 - form.plausibility)}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, plausibility: n }))}
                    className={`w-9 h-9 rounded-full font-mono text-xs font-bold transition-all ${
                      n <= form.plausibility
                        ? 'bg-mtn-yellow text-black shadow-[0_0_8px_rgba(255,203,0,0.3)]'
                        : 'bg-surface border border-outline/20 text-on-surface-variant hover:border-mtn-yellow/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              Description / Trigger Phrase
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Describe the trigger event or condition..."
              className="w-full bg-surface border border-outline/20 rounded-lg px-4 py-2.5 text-sm text-on-surface font-sans placeholder:text-on-surface-variant/50 focus:outline-none focus:border-mtn-yellow transition-colors resize-none"
            />
          </div>

          {/* Calibration Anchor */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              Calibration Anchor
            </label>
            <input
              type="text"
              value={form.calibrationAnchor ?? ''}
              onChange={e => setForm(f => ({ ...f, calibrationAnchor: e.target.value }))}
              placeholder="e.g. FY22 Cedi crisis (0.32 elasticity)"
              className="w-full bg-surface border border-outline/20 rounded-lg px-4 py-2.5 text-sm text-on-surface font-sans placeholder:text-on-surface-variant/50 focus:outline-none focus:border-mtn-yellow transition-colors"
            />
          </div>

          {/* KPI Impacts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                KPI Impacts
                <span className="ml-2 bg-surface-container px-1.5 py-0.5 rounded text-on-surface font-mono text-[9px]">
                  {form.kpiImpacts.length}
                </span>
              </label>
              <button
                type="button"
                onClick={addImpact}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-mtn-yellow/10 border border-mtn-yellow/30 text-mtn-yellow font-mono text-[10px] uppercase tracking-widest hover:bg-mtn-yellow/20 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Impact
              </button>
            </div>

            {form.kpiImpacts.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-outline/20 rounded-lg text-on-surface-variant font-mono text-xs">
                No KPI impacts defined — click &quot;Add Impact&quot; to add one
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_110px_110px_40px] gap-2 px-1">
                  {['KPI', 'Impact Type', 'Value', ''].map(h => (
                    <span key={h} className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">{h}</span>
                  ))}
                </div>
                {form.kpiImpacts.map((imp, i) => (
                  <div key={i} className="grid grid-cols-[1fr_110px_110px_40px] gap-2 items-center">
                    <select
                      value={imp.kpiId}
                      onChange={e => updateImpact(i, 'kpiId', e.target.value)}
                      className="bg-surface border border-outline/20 rounded px-2 py-2 text-xs text-on-surface font-mono focus:outline-none focus:border-mtn-yellow appearance-none"
                    >
                      {KPI_OPTIONS.map(k => (
                        <option key={k.id} value={k.id}>{k.label}</option>
                      ))}
                    </select>
                    <select
                      value={imp.type}
                      onChange={e => updateImpact(i, 'type', e.target.value)}
                      className="bg-surface border border-outline/20 rounded px-2 py-2 text-xs text-on-surface font-mono focus:outline-none focus:border-mtn-yellow appearance-none"
                    >
                      <option value="pct">% Change</option>
                      <option value="delta">± Delta</option>
                      <option value="abs">Absolute</option>
                    </select>
                    <input
                      type="number"
                      value={imp.value}
                      onChange={e => updateImpact(i, 'value', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      className="bg-surface border border-outline/20 rounded px-2 py-2 text-xs text-on-surface font-mono text-right focus:outline-none focus:border-mtn-yellow"
                    />
                    <button
                      type="button"
                      onClick={() => removeImpact(i)}
                      className="w-9 h-9 flex items-center justify-center rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm font-sans px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-mono text-on-surface-variant border border-outline/20 hover:text-on-surface hover:border-outline/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-mono font-bold bg-mtn-yellow text-black hover:bg-mtn-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Scenario' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
