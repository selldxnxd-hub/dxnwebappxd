/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  theme: ThemeConfig;
  onExploreClick: () => void;
}

export default function Hero({ theme, onExploreClick }: HeroProps) {
  const slides = theme.bannerSlides && theme.bannerSlides.length > 0
    ? theme.bannerSlides
    : [theme.heroBannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200'];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // transitions every 5s
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
      {/* Full width premium sliding banner card */}
      <div 
        className="relative h-[200px] sm:h-[320px] md:h-[420px] w-full overflow-hidden rounded-2xl shadow-lg border border-gray-100 group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img 
              src={slides[currentSlide]} 
              alt={`Banner slide ${currentSlide + 1}`} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay for superior text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10 pointer-events-none" />

        {/* Floating Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 z-20 text-left max-w-xl text-white pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-2 sm:space-y-4"
          >
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>{theme.logoText || 'PREMIUM HARDWARE'}</span>
            </div>

            <h1 
              className="font-sans text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ fontFamily: theme.fontFamily }}
            >
              {theme.heroTitle || 'Curated Premium Essentials'}
            </h1>

            <p className="text-3xs sm:text-xs md:text-sm text-gray-200 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
              {theme.heroSubtitle || 'Elevate your daily environment with structurally refined accessories engineered for elite performance.'}
            </p>

            <div className="pt-2 pointer-events-auto">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 sm:px-5 sm:py-2.5 text-3xs sm:text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <span>Browse Products</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Manual Navigation Controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-30">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
