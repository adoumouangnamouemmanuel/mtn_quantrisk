import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'error' | 'warning';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', variant = 'default', padding = 'md', ...props }: CardProps) {
  const baseStyle = 'rounded-xl overflow-hidden';
  
  const variantStyles = {
    default: 'bg-surface-container border border-outline/20',
    elevated: 'bg-surface-container-high border border-outline/30 shadow-lg shadow-black/50',
    outlined: 'bg-transparent border border-outline/50',
    error: 'bg-errorContainer border border-error/50',
    warning: 'bg-surface-container border border-mtn-yellow/50',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };
  
  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
