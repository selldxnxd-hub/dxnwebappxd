import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig } from '../types';
import { subscribeThemeConfig } from '../firebase/firestore';

interface ThemeContextType {
  theme: ThemeConfig | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsub = subscribeThemeConfig((config) => {
      if (config) {
        setTheme(config);
        setIsDarkMode(config.darkMode || false);
      }
    });
    return () => unsub();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (theme) {
      import('../services/theme').then(({ ThemeService }) => {
        ThemeService.update({ darkMode: !isDarkMode });
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? 'dark bg-gray-950 text-white' : 'bg-white text-gray-950'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
