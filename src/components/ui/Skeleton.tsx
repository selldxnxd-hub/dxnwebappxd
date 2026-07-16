import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4 shadow-3xs text-left">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-8 w-1/3 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
