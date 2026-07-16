import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold transition-all focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-lg';
  
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98]',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-950',
    danger: 'bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]',
    success: 'bg-green-600 text-white hover:bg-green-500 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs md:text-sm',
    lg: 'px-6 py-3.5 text-sm md:text-base',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
