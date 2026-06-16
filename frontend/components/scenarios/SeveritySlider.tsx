import React from 'react';

interface SeveritySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  return (
    <div className="bg-surface-container-low border border-outline/20 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
          Severity Multiplier
        </span>
        <span className="font-mono text-base font-bold text-mtn-yellow">
          {value.toFixed(1)}×
        </span>
      </div>
      
      <div className="relative pt-1 pb-4">
        <input 
          type="range" 
          min="0.5" 
          max="2.0" 
          step="0.1" 
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-mtn-yellow"
        />
        
        <div className="absolute w-full flex justify-between mt-2 text-[10px] font-mono text-on-surface-variant px-1">
          <span>0.5</span>
          <span>1.0</span>
          <span>1.5</span>
          <span>2.0</span>
        </div>
      </div>
    </div>
  );
}
