'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import ShoppingListModal from './ShoppingListModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const XMarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cartItems, removeFromCart } = useCart();
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  if (!isOpen) return null;

  const getTotalTime = (prep: string, cook: string) => {
    const prepNum = parseInt(prep.replace(/\D/g, '')) || 0;
    const cookNum = parseInt(cook.replace(/\D/g, '')) || 0;
    return prepNum + cookNum;
  };

  const generateShoppingList = () => {
    const ingredientMap = new Map<string, { count: number; recipes: string[] }>();
    
    cartItems.forEach(recipe => {
      const ingredients = recipe.ingredients.split('|');
      ingredients.forEach(ingredient => {
        const trimmed = ingredient.trim();
        if (ingredientMap.has(trimmed)) {
          const existing = ingredientMap.get(trimmed)!;
          existing.count += 1;
          existing.recipes.push(recipe.title);
        } else {
          ingredientMap.set(trimmed, { count: 1, recipes: [recipe.title] });
        }
      });
    });

    return Array.from(ingredientMap.entries()).map(([ingredient, data]) => ({
      ingredient,
      count: data.count,
      recipes: data.recipes
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">My Weekly Recipes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 hover:text-slate-900"
          >
            <XMarkIcon />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No recipes selected</h3>
              <p className="text-slate-600">Add some recipes to start planning your week</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cartItems.map((recipe, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 leading-snug">{recipe.title}</h3>
                      <button
                        onClick={() => removeFromCart(recipe.title)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <ClockIcon />
                        <span>{getTotalTime(recipe.prep_time, recipe.cook_time)} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UsersIcon />
                        <span>{recipe.servings}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                        {recipe.protein_type}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-slate-200 p-6">
            <button 
              onClick={() => setIsShoppingListOpen(true)}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBagIcon />
              <span>Generate Shopping List ({generateShoppingList().length} ingredients)</span>
            </button>
          </div>
        )}
      </div>

      {/* Shopping List Modal */}
      <ShoppingListModal 
        isOpen={isShoppingListOpen} 
        onClose={() => setIsShoppingListOpen(false)} 
      />
    </div>
  );
}
