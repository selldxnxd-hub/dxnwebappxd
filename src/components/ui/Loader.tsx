import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface LoaderProps {
  message?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Processing...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 py-12 ${className}`}>
      <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest animate-pulse">
        {message}
      </span>
    </div>
  );
};
