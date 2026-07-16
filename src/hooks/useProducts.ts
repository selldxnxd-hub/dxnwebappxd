import { useRealtimeData } from '../providers/RealtimeDataProvider';
import { ProductService } from '../services/product';
import { Product } from '../types';

export const useProducts = () => {
  const { products, loading } = useRealtimeData();

  const getProductBySlug = async (slug: string): Promise<Product | null> => {
    return ProductService.getBySlug(slug);
  };

  const getProductById = async (id: string): Promise<Product | null> => {
    return ProductService.getById(id);
  };

  const saveProduct = async (prod: Product): Promise<void> => {
    return ProductService.save(prod);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    return ProductService.delete(id);
  };

  return {
    products,
    loading,
    getProductBySlug,
    getProductById,
    saveProduct,
    deleteProduct
  };
};
