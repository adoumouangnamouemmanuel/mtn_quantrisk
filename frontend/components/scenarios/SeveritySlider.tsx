import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SeveritySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  // Determine color based on value
  const colorClass = useMemo(() => {
    if (value < 1.0) return 'text-success';
    if (value <= 1.5) return 'text-mtn-yellow';
    if (value <= 1.8) return 'text-warning';
    return 'text-error';
  }, [value]);

  return (
    <div className="bg-surface-container-low border border-outline/20 p-4 rounded-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant flex items-center space-x-2">
            <span>Severity Multiplier</span>
          </span>
          <span className={`font-mono text-2xl font-bold transition-colors duration-300 ${colorClass}`}>
            {value.toFixed(1)}×
          </span>
        </div>
        
        <div className="relative pt-2 pb-6">
          {/* Custom gradient track behind the slider */}
          <div className="absolute top-4 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-success via-mtn-yellow to-error opacity-40 pointer-events-none" />
          
          <input 
            type="range" 
            min="0.5" 
            max="2.5" 
            step="0.1" 
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer accent-mtn-yellow relative z-10"
            aria-label="Severity Multiplier"
          />
          
          {/* Tick marks */}
          <div className="absolute w-full flex justify-between mt-2 text-[10px] font-mono text-on-surface-variant px-1 select-none">
            <span className="flex flex-col items-center"><span className="h-1 w-[1px] bg-outline/40 mb-1" />0.5</span>
            <span className="flex flex-col items-center"><span className="h-1 w-[1px] bg-outline/40 mb-1" />1.0</span>
            <span className="flex flex-col items-center"><span className="h-1 w-[1px] bg-outline/40 mb-1" />1.5</span>
            <span className="flex flex-col items-center"><span className="h-1 w-[1px] bg-outline/40 mb-1" />2.0</span>
            <span className="flex flex-col items-center"><span className="h-1 w-[1px] bg-outline/40 mb-1" />2.5</span>
          </div>
        </div>
      </div>

      {/* Warning message if > 1.8x */}
      <div className={`mt-2 transition-all duration-300 overflow-hidden ${value > 1.8 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-error/10 border border-error/20 p-2 rounded flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          <p className="text-xs text-on-surface/90 font-sans leading-tight">
            Multiplier exceeds 1.8x. This models tail-risk compound events outside historical FY22 calibration boundaries.
          </p>
        </div>
      </div>
    </div>
  );
}
