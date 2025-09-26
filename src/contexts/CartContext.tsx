'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Recipe {
  title: string;
  description: string;
  prep_time: string;
  cook_time: string;
  servings: number;
  difficulty: string;
  protein_type: string;
  ingredients: string;
  instructions: string;
  tags: string;
}

interface CartContextType {
  cartItems: Recipe[];
  addToCart: (recipe: Recipe) => void;
  removeFromCart: (recipeTitle: string) => void;
  cartCount: number;
  isItemInCart: (recipeTitle: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Recipe[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('grocero-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('grocero-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (recipe: Recipe) => {
    setCartItems(prev => {
      // Check if item already exists
      if (prev.some(item => item.title === recipe.title)) {
        return prev; // Don't add duplicates
      }
      return [...prev, recipe];
    });
  };

  const removeFromCart = (recipeTitle: string) => {
    setCartItems(prev => prev.filter(item => item.title !== recipeTitle));
  };

  const isItemInCart = (recipeTitle: string) => {
    return cartItems.some(item => item.title === recipeTitle);
  };

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      cartCount,
      isItemInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
