import { ThemeService } from './theme';
import { ThemeConfig } from '../types';

export const BannerService = {
  getBanner: async (): Promise<string> => {
    const config = await ThemeService.get();
    return config.heroBannerUrl;
  },

  updateBanner: async (url: string): Promise<void> => {
    await ThemeService.update({ heroBannerUrl: url });
  }
};
