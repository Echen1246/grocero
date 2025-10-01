'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import ShoppingListModal from './ShoppingListModal';
import { trackCopyInstructions, trackEmailInstructions, trackTextInstructions, trackGenerateShoppingList } from '@/lib/analytics';

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
  const [copyInstructionsSuccess, setCopyInstructionsSuccess] = useState(false);

  if (!isOpen) return null;

  const getTotalTime = (prep: number | string, cook: number | string) => {
    const prepNum = typeof prep === 'number' ? prep : parseInt(prep.replace(/\D/g, '')) || 0;
    const cookNum = typeof cook === 'number' ? cook : parseInt(cook.replace(/\D/g, '')) || 0;
    return prepNum + cookNum;
  };

  const generateShoppingList = () => {
    const ingredientMap = new Map<string, { count: number; recipes: string[] }>();
    
    cartItems.forEach(recipe => {
      const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : (recipe.ingredients as string).split('|'); // Handle both array and string formats
        
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

  const generateInstructionsText = () => {
    let text = "🍳 RECIPE INSTRUCTIONS\n\n";
    
    cartItems.forEach((recipe, index) => {
      text += `${index + 1}. ${recipe.title.toUpperCase()}\n`;
      text += `⏱️ Prep: ${recipe.prep_time} min | Cook: ${recipe.cook_time} min | Serves: ${recipe.servings}\n\n`;
      
      const instructions = Array.isArray(recipe.instructions) 
        ? recipe.instructions 
        : (recipe.instructions as string).split('|');
        
      instructions.forEach((instruction, stepIndex) => {
        text += `   Step ${stepIndex + 1}: ${instruction.trim()}\n`;
      });
      text += "\n";
    });
    
    return text + "👨‍🍳 Happy cooking from Grocero!";
  };

  const handleCopyInstructions = async () => {
    trackCopyInstructions(); // Track the event
    try {
      await navigator.clipboard.writeText(generateInstructionsText());
      setCopyInstructionsSuccess(true);
      setTimeout(() => setCopyInstructionsSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy instructions:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generateInstructionsText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyInstructionsSuccess(true);
      setTimeout(() => setCopyInstructionsSuccess(false), 2000);
    }
  };

  const handleEmailInstructions = () => {
    trackEmailInstructions(); // Track the event
    const subject = encodeURIComponent('🍳 My Recipe Instructions from Grocero');
    const body = encodeURIComponent(generateInstructionsText());
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleSMSInstructions = () => {
    trackTextInstructions(); // Track the event
    const text = encodeURIComponent(generateInstructionsText());
    const smsUrl = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
      ? `sms:?&body=${text}`
      : `sms:?body=${text}`;
    window.open(smsUrl, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
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

        <div className="flex-1 overflow-y-auto">
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
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        {recipe.image_url ? (
                          <img 
                            src={recipe.image_url} 
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <div className="text-slate-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-slate-900 leading-snug">{recipe.title}</h3>
                          <button
                            onClick={() => removeFromCart(recipe.title)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-red-600 ml-2"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
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
          <div className="border-t border-slate-200 p-6 space-y-4 bg-white">
            <button 
              onClick={() => {
                const shoppingList = generateShoppingList();
                trackGenerateShoppingList(cartItems.length, shoppingList.length);
                setIsShoppingListOpen(true);
              }}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBagIcon />
              <span>Generate Shopping List ({generateShoppingList().length} ingredients)</span>
            </button>

            {/* Instructions Sharing */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Share Recipe Instructions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                  onClick={handleCopyInstructions}
                  className={`flex items-center justify-center space-x-2 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                    copyInstructionsSuccess 
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {copyInstructionsSuccess ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      <span>Copy Instructions</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleEmailInstructions}
                  className="flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>Email Instructions</span>
                </button>
                
                <button 
                  onClick={handleSMSInstructions}
                  className="flex items-center justify-center space-x-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span>Text Instructions</span>
                </button>
              </div>
            </div>
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
