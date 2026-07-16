/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Globe } from 'lucide-react';
import { ThemeConfig, SystemSettings } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  theme: ThemeConfig;
  settings: SystemSettings;
  cartCount: number;
  onCartClick: () => void;
  onShopClick: (catId?: string) => void;
  onHomeClick: () => void;
  onTriggerAdmin: () => void;
  activeCategory: string | null;
  lang: 'bn' | 'en';
  onLangChange: (lang: 'bn' | 'en') => void;
}

export default function Navbar({
  theme,
  settings,
  cartCount,
  onCartClick,
  onShopClick,
  onHomeClick,
  onTriggerAdmin,
  activeCategory,
  lang,
  onLangChange
}: NavbarProps) {
  const [logoClicks, setLogoClicks] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  // Logo 5-clicks in 3 seconds detection to open the Admin panel
  const handleLogoClick = () => {
    const now = Date.now();
    const newClicks = [...logoClicks.filter(time => now - time < 3000), now];
    setLogoClicks(newClicks);

    if (newClicks.length >= 5) {
      setLogoClicks([]); // reset
      onTriggerAdmin(); // Fire Pin Modal
    }
  };

  return (
    <header 
      id="store-header" 
      className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md transition-colors duration-200"
      style={{ borderBottomColor: `${theme.primaryColor}15` }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO - Gesture trigger for Admin */}
        <div className="flex flex-1 items-center justify-start">
          <div 
            id="store-logo-trigger"
            onClick={handleLogoClick}
            className="group flex cursor-pointer select-none items-center space-x-2"
          >
            {theme.logoUrl ? (
              <img 
                src={theme.logoUrl} 
                alt={settings.shopName || 'AETHER'} 
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span 
                className="font-sans text-xl font-black tracking-tight transition-opacity group-hover:opacity-80"
                style={{ color: theme.primaryColor }}
              >
                {settings.shopName || theme.logoText || 'AETHER'}
              </span>
            )}
            <span className="hidden text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-40 transition-opacity">
              CMS
            </span>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <button
            onClick={onHomeClick}
            className={`transition-colors duration-150 cursor-pointer ${
              !activeCategory ? 'text-gray-950 font-semibold border-b-2' : 'text-gray-500 hover:text-gray-950'
            }`}
            style={{ borderBottomColor: !activeCategory ? theme.accentColor : 'transparent' }}
          >
            {t.home}
          </button>
          
          <button
            onClick={() => onShopClick()}
            className={`transition-colors duration-150 cursor-pointer ${
              activeCategory === 'all' ? 'text-gray-950 font-semibold border-b-2' : 'text-gray-500 hover:text-gray-950'
            }`}
            style={{ borderBottomColor: activeCategory === 'all' ? theme.accentColor : 'transparent' }}
          >
            {t.shopAll}
          </button>
        </nav>

        {/* RIGHT OPERATIONS */}
        <div className="flex flex-1 items-center justify-end space-x-3 sm:space-x-4">
          {/* LANGUAGE SWITCHER */}
          <button
            id="lang-switch-btn"
            onClick={() => onLangChange(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-gray-500" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* CART TRIGGER */}
          <button 
            id="cart-trigger-btn"
            onClick={onCartClick} 
            className="relative p-2 text-gray-700 hover:text-gray-950 transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="h-6 w-6 stroke-[1.8]" />
            {cartCount > 0 && (
              <span 
                className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white transition-all scale-100 animate-in fade-in animate-bounce"
                style={{ backgroundColor: theme.accentColor }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-950 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => {
              onHomeClick();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded px-3"
          >
            {t.home}
          </button>
          <button
            onClick={() => {
              onShopClick();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded px-3"
          >
            {t.shopAll}
          </button>
        </div>
      )}
    </header>
  );
}
