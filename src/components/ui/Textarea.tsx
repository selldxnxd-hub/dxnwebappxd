import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  label,
  error,
  helperText,
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-3xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-lg border bg-white p-2.5 text-xs text-gray-900 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
          error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-3xs text-red-600 font-bold font-mono">{error}</p>}
      {!error && helperText && <p className="text-3xs text-gray-400 font-mono">{helperText}</p>}
    </div>
  );
};
