import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Chip({ children, className = '', variant = 'default', size = 'md', ...props }: ChipProps) {
  const baseStyle = 'inline-flex items-center font-mono font-bold tracking-widest uppercase rounded-full';
  
  const variantStyles = {
    default: 'bg-surface-container-high text-on-surface-variant',
    success: 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-mtn-yellow/20 text-mtn-yellow border border-mtn-yellow/30',
    error: 'bg-error/20 text-error border border-error/30',
    info: 'bg-secondary/20 text-secondary border border-secondary/30',
    outline: 'bg-transparent text-on-surface-variant border border-outline/40',
  };
  
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };
  
  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
