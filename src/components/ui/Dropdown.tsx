import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onChange,
  label,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {label && (
        <span className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex w-full justify-between gap-x-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-3xs hover:bg-gray-50 cursor-pointer"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className="-mr-1 h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden border border-gray-100">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 text-xs font-medium ${
                  opt.value === selectedValue
                    ? 'bg-gray-50 text-emerald-600 font-bold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
