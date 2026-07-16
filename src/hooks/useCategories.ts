import { useRealtimeData } from '../providers/RealtimeDataProvider';
import { CategoryService } from '../services/category';
import { Category } from '../types';

export const useCategories = () => {
  const { categories } = useRealtimeData();

  const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
    return CategoryService.getBySlug(slug);
  };

  const saveCategory = async (cat: Category): Promise<void> => {
    return CategoryService.save(cat);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    return CategoryService.delete(id);
  };

  return {
    categories,
    getCategoryBySlug,
    saveCategory,
    deleteCategory
  };
};
