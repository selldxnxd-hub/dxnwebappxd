import { getSystemSettings, updateSystemSettings } from './db';
import { SystemSettings } from '../types';

export const SettingsService = {
  get: async (): Promise<SystemSettings> => {
    return getSystemSettings();
  },

  update: async (settings: Partial<SystemSettings>): Promise<void> => {
    return updateSystemSettings(settings);
  }
};
