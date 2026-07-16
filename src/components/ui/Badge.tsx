import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase';
  
  const variants = {
    default: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    success: 'bg-green-50 text-green-700 border border-green-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    danger: 'bg-red-50 text-red-700 border border-red-100',
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
