import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3 sm:px-6 mt-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono">
            Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-900">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-3xs" aria-label="Pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-xs font-bold font-mono border cursor-pointer ${
                    isCurrent
                      ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
