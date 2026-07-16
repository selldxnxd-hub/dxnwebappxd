import { getBrands, saveBrand, deleteBrand } from './db';
import { Brand } from '../types';

export const BrandService = {
  getAll: async (): Promise<Brand[]> => {
    return getBrands();
  },

  getBySlug: async (slug: string): Promise<Brand | null> => {
    const list = await getBrands();
    return list.find(b => b.slug === slug) || null;
  },

  save: async (brand: Brand): Promise<void> => {
    return saveBrand(brand);
  },

  delete: async (id: string): Promise<void> => {
    return deleteBrand(id);
  }
};
