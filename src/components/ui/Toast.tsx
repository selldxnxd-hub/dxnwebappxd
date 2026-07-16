import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border border-green-100',
    error: 'bg-red-50 border border-red-100',
    info: 'bg-blue-50 border border-blue-100',
    warning: 'bg-amber-50 border border-amber-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            className={`flex items-center justify-between p-4 rounded-xl shadow-xl ${bgColors[toast.type || 'success']}`}
          >
            <div className="flex items-center space-x-3">
              {icons[toast.type || 'success']}
              <span className="text-xs font-semibold text-gray-950 font-sans">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
