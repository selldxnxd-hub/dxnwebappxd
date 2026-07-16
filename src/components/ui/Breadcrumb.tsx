import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2 text-3xs sm:text-xs font-mono font-bold text-gray-500">
        <li className="inline-flex items-center">
          <button className="inline-flex items-center text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer">
            <Home className="mr-1.5 h-3.5 w-3.5" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center">
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 mx-1" />
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
