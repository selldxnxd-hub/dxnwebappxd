import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aether_cart_registry');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const save = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('aether_cart_registry', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      const newQty = Math.min(product.inventory, existing.quantity + quantity);
      save(cart.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item));
    } else {
      save([...cart, { product, quantity: Math.min(product.inventory, quantity) }]);
    }
  };

  const removeFromCart = (productId: string) => {
    save(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    save(cart.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    save([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
