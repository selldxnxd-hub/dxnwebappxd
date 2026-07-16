import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ImageViewerProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [index, setIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-4xl max-h-[80vh] px-4"
        >
          <img
            src={images[index]}
            alt=""
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </motion.div>

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div className="absolute bottom-6 text-white font-mono text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
          {index + 1} / {images.length}
        </div>
      </div>
    </AnimatePresence>
  );
};
