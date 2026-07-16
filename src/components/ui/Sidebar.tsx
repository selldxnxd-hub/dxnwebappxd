import React from 'react';

export interface SidebarLink {
  label: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SidebarProps {
  links: SidebarLink[];
  activeId: string;
  onLinkSelect: (id: string) => void;
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  links,
  activeId,
  onLinkSelect,
  title = 'Navigation',
}) => {
  return (
    <aside className="w-64 bg-gray-950 text-white min-h-screen border-r border-gray-900 p-6 flex flex-col space-y-6 text-left">
      <div>
        <h2 className="text-3xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
          {title}
        </h2>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const IconComp = link.icon;
          const isActive = link.id === activeId;
          return (
            <button
              key={link.id}
              onClick={() => onLinkSelect(link.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <IconComp className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
