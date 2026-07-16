import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  children,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-gray-100 text-left text-xs text-gray-500">
        <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-6 py-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-900">
          {children}
        </tbody>
      </table>
    </div>
  );
};
