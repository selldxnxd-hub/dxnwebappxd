import { useRealtimeData } from '../providers/RealtimeDataProvider';
import { BrandService } from '../services/brand';
import { Brand } from '../types';

export const useBrands = () => {
  const { brands } = useRealtimeData();

  const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
    return BrandService.getBySlug(slug);
  };

  const saveBrand = async (brand: Brand): Promise<void> => {
    return BrandService.save(brand);
  };

  const deleteBrand = async (id: string): Promise<void> => {
    return BrandService.delete(id);
  };

  return {
    brands,
    getBrandBySlug,
    saveBrand,
    deleteBrand
  };
};
