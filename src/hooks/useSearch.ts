import { useState, useMemo } from 'react';
import { Product } from '../types';

export const useSearch = (products: Product[]) => {
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return products;

    return products.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(cleanQuery);
      const matchDesc = p.description.toLowerCase().includes(cleanQuery);
      const matchSku = p.sku.toLowerCase().includes(cleanQuery);
      return matchTitle || matchDesc || matchSku;
    });
  }, [query, products]);

  return {
    query,
    setQuery,
    filteredProducts,
  };
};
