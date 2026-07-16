import { getThemeConfig, updateThemeConfig } from './db';
import { ThemeConfig } from '../types';

export const ThemeService = {
  get: async (): Promise<ThemeConfig> => {
    return getThemeConfig();
  },

  update: async (theme: Partial<ThemeConfig>): Promise<void> => {
    return updateThemeConfig(theme);
  }
};
