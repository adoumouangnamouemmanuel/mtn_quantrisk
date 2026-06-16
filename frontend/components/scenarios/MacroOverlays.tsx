import React from 'react';
import { Card } from '@/components/ui/Card';
import { RotateCcw } from 'lucide-react';
import { MacroOverlays } from '@/lib/types';

interface MacroOverlaysPanelProps {
  value: MacroOverlays;
  onChange: (val: MacroOverlays) => void;
}

function OverlaySlider({ 
  label, value, min, max, unit, onChange, onReset 
}: { 
  label: string, value: number, min: number, max: number, unit: string, onChange: (v: number) => void, onReset: () => void 
}) {
  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-white">
            {value > 0 ? '+' : ''}{value}{unit}
          </span>
          <button 
            onClick={onReset}
            className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-white"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step="1" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}

export function MacroOverlaysPanel({ value, onChange }: MacroOverlaysPanelProps) {
  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-sans text-sm font-bold text-white mb-2">Macro Overlays</h3>
      
      <OverlaySlider 
        label="Cedi/USD Shock" 
        min={-50} max={50} unit="%"
        value={value.cediShockPct}
        onChange={(v) => onChange({ ...value, cediShockPct: v })}
        onReset={() => onChange({ ...value, cediShockPct: 0 })}
      />
      
      <div className="h-px w-full bg-outline/10" />
      
      <OverlaySlider 
        label="Inflation Overlay" 
        min={-10} max={30} unit="pp"
        value={value.inflationOverlayPp}
        onChange={(v) => onChange({ ...value, inflationOverlayPp: v })}
        onReset={() => onChange({ ...value, inflationOverlayPp: 0 })}
      />
      
      <div className="h-px w-full bg-outline/10" />
      
      <OverlaySlider 
        label="Policy Rate Overlay" 
        min={-10} max={15} unit="pp"
        value={value.policyRateOverlayPp}
        onChange={(v) => onChange({ ...value, policyRateOverlayPp: v })}
        onReset={() => onChange({ ...value, policyRateOverlayPp: 0 })}
      />
    </Card>
  );
}
