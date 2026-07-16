import { getCategories, saveCategory, deleteCategory } from './db';
import { Category } from '../types';

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    return getCategories();
  },

  getBySlug: async (slug: string): Promise<Category | null> => {
    const list = await getCategories();
    return list.find(c => c.slug === slug) || null;
  },

  save: async (category: Category): Promise<void> => {
    return saveCategory(category);
  },

  delete: async (id: string): Promise<void> => {
    return deleteCategory(id);
  }
};
