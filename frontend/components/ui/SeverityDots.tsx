import React from 'react';

interface SeverityDotsProps {
  severity: number;
  max?: number;
  colorClass?: string;
  className?: string;
}

export function SeverityDots({ severity, max = 5, colorClass = "bg-mtn-yellow", className = "" }: SeverityDotsProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {Array.from({ length: max }).map((_, i) => (
        <div 
          key={i} 
          className={`w-2 h-2 rounded-full ${i < severity ? colorClass : 'bg-surface-container-high'}`}
        />
      ))}
    </div>
  );
}

export function PlausibilityDots({ plausibility, max = 5, className = "" }: { plausibility: number, max?: number, className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {Array.from({ length: max }).map((_, i) => (
        <div 
          key={i} 
          className={`w-2 h-2 rounded-full border border-mtn-yellow ${i < plausibility ? 'bg-mtn-yellow' : 'bg-transparent'}`}
        />
      ))}
    </div>
  );
}
