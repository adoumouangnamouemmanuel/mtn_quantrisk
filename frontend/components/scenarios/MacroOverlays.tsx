import React from 'react';
import { Card } from '@/components/ui/Card';
import { RotateCcw, Info } from 'lucide-react';
import { MacroOverlays } from '@/lib/types';

interface MacroOverlaysPanelProps {
  value: MacroOverlays;
  onChange: (val: MacroOverlays) => void;
}

function OverlaySlider({ 
  label, value, min, max, unit, tooltip, onChange 
}: { 
  label: string, value: number, min: number, max: number, unit: string, tooltip: string, onChange: (v: number) => void 
}) {
  return (
    <div className="py-2 group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
            {label}
          </span>
          <div className="relative flex items-center">
            <Info className="w-3 h-3 text-on-surface-variant/50 hover:text-white transition-colors cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-surface-container-highest text-on-surface text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-container-highest" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`font-mono text-xs font-bold transition-colors ${value !== 0 ? 'text-mtn-yellow' : 'text-white'}`}>
            {value > 0 ? '+' : ''}{value}{unit}
          </span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step="1" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-mtn-yellow"
        aria-label={label}
      />
      <div className="flex justify-between mt-1 px-1">
        <span className="font-mono text-[9px] text-on-surface-variant/60">{min}{unit}</span>
        <span className="font-mono text-[9px] text-on-surface-variant/60">{max}{unit}</span>
      </div>
    </div>
  );
}

export function MacroOverlaysPanel({ value, onChange }: MacroOverlaysPanelProps) {
  const isDirty = value.cediShockPct !== 0 || value.inflationOverlayPp !== 0 || value.policyRateOverlayPp !== 0;

  const handleGlobalReset = () => {
    onChange({ cediShockPct: 0, inflationOverlayPp: 0, policyRateOverlayPp: 0 });
  };

  return (
    <Card className="p-4 flex flex-col space-y-2 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-sans text-sm font-bold text-white">Macro Overlays</h3>
        <button 
          onClick={handleGlobalReset}
          disabled={!isDirty}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono transition-all
            ${isDirty ? 'bg-surface-container-high text-white hover:bg-surface-container-highest cursor-pointer' : 'bg-transparent text-on-surface-variant/30 cursor-not-allowed'}
          `}
          title="Reset all overlays"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET</span>
        </button>
      </div>
      
      <OverlaySlider 
        label="Cedi/USD Shock" 
        min={-50} max={50} unit="%"
        tooltip="Simulates additional depreciation (-) or appreciation (+) of the Cedi against the USD. Impacts USD-denominated OpEx and CapEx."
        value={value.cediShockPct}
        onChange={(v) => onChange({ ...value, cediShockPct: v })}
      />
      
      <div className="h-px w-full bg-outline/10 my-1" />
      
      <OverlaySlider 
        label="Inflation Overlay" 
        min={-10} max={30} unit="pp"
        tooltip="Absolute percentage point shift to baseline inflation. Drives pricing power assumptions and general OpEx scaling."
        value={value.inflationOverlayPp}
        onChange={(v) => onChange({ ...value, inflationOverlayPp: v })}
      />
      
      <div className="h-px w-full bg-outline/10 my-1" />
      
      <OverlaySlider 
        label="Policy Rate Overlay" 
        min={-10} max={15} unit="pp"
        tooltip="Absolute shift to the central bank policy rate. Influences debt servicing costs and discount rates."
        value={value.policyRateOverlayPp}
        onChange={(v) => onChange({ ...value, policyRateOverlayPp: v })}
      />
    </Card>
  );
}
