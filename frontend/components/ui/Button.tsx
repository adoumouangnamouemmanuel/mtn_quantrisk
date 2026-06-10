import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ 
  children, className = '', variant = 'primary', size = 'md', fullWidth = false, ...props 
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-mono font-bold uppercase tracking-widest rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-mtn-yellow text-black hover:bg-mtn-yellow/90',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-high/80',
    outline: 'bg-transparent border border-outline text-on-surface hover:bg-surface-container',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
    danger: 'bg-error text-black hover:bg-error/90',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
