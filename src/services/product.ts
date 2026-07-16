import { getProducts, saveProduct, deleteProduct } from './db';
import { Product } from '../types';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    return getProducts();
  },
  
  getById: async (id: string): Promise<Product | null> => {
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
  },

  getBySlug: async (slug: string): Promise<Product | null> => {
    const products = await getProducts();
    return products.find(p => p.slug === slug) || null;
  },

  save: async (product: Product): Promise<void> => {
    return saveProduct(product);
  },

  delete: async (id: string): Promise<void> => {
    return deleteProduct(id);
  }
};
