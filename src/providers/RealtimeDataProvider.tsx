import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Brand, StaticPage } from '../types';
import { subscribeProducts, subscribeCategories, subscribeBrands, subscribePages } from '../firebase/firestore';

interface RealtimeDataContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  staticPages: StaticPage[];
  loading: boolean;
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined);

export const RealtimeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = subscribeProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    const unsubCategories = subscribeCategories((data) => {
      setCategories(data);
    });

    const unsubBrands = subscribeBrands((data) => {
      setBrands(data);
    });

    const unsubPages = subscribePages((data) => {
      setStaticPages(data);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBrands();
      unsubPages();
    };
  }, []);

  return (
    <RealtimeDataContext.Provider value={{ products, categories, brands, staticPages, loading }}>
      {children}
    </RealtimeDataContext.Provider>
  );
};

export const useRealtimeData = () => {
  const context = useContext(RealtimeDataContext);
  if (!context) throw new Error('useRealtimeData must be used within RealtimeDataProvider');
  return context;
};
