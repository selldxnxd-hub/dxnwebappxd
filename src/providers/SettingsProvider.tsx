import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { subscribeSystemSettings } from '../firebase/firestore';

interface SettingsContextType {
  settings: SystemSettings | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const unsub = subscribeSystemSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsub();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
