import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Results Found',
  description = 'Try adjusting your search filters or browse our other categories.',
  icon: Icon = HelpCircle,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 max-w-md mx-auto my-12 space-y-4">
      <div className="rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-gray-950 font-sans tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed font-sans max-w-xs">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
