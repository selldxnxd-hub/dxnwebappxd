import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-100 ${className}`}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                isActive
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
