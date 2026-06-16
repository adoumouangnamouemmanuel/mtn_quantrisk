import React from 'react';

export function SkeletonBlock({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`animate-pulse bg-surface-container-high rounded-md ${className}`} 
      {...props}
    />
  );
}
