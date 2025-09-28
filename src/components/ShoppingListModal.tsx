'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProcessedIngredient {
  ingredient: string;
  quantity: string;
  unit: string;
  baseIngredient: string;
  recipes: string[];
  category: string;
}

const XMarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const PrinterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096c1.071-.136 2.16-.216 3.28-.216 1.12 0 2.209.08 3.28.216m-6.56 0a9.06 9.06 0 00-.67 1.514c-.57 1.757-.456 3.858.67 5.056A3.015 3.015 0 008.84 21h6.32c1.045 0 1.987-.55 2.56-1.414 1.126-1.698 1.24-3.799.67-5.056a9.06 9.06 0 00-.67-1.514m-6.56 0V12a3 3 0 116 0v1.829" />
  </svg>
);

export default function ShoppingListModal({ isOpen, onClose }: ShoppingListModalProps) {
  const { cartItems } = useCart();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  // Categorize ingredients by grocery store section
  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || 
        lower.includes('fish') || lower.includes('salmon') || lower.includes('ground') ||
        lower.includes('steak') || lower.includes('bacon') || lower.includes('sausage')) {
      return 'Meat & Seafood';
    }
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') || 
        lower.includes('cream') || lower.includes('yogurt') || lower.includes('eggs')) {
      return 'Dairy & Eggs';
    }
    if (lower.includes('onion') || lower.includes('garlic') || lower.includes('carrot') || 
        lower.includes('celery') || lower.includes('tomato') || lower.includes('pepper') ||
        lower.includes('lettuce') || lower.includes('spinach') || lower.includes('broccoli') ||
        lower.includes('mushroom') || lower.includes('avocado') || lower.includes('cucumber') ||
        lower.includes('herbs') || lower.includes('parsley') || lower.includes('cilantro') ||
        lower.includes('basil') || lower.includes('dill') || lower.includes('lemon') || 
        lower.includes('lime') || lower.includes('apple') || lower.includes('orange')) {
      return 'Produce';
    }
    if (lower.includes('pasta') || lower.includes('rice') || lower.includes('bread') || 
        lower.includes('flour') || lower.includes('noodles') || lower.includes('tortilla') ||
        lower.includes('buns') || lower.includes('oats') || lower.includes('quinoa')) {
      return 'Grains & Bread';
    }
    if (lower.includes('beans') || lower.includes('lentils') || lower.includes('broth') || 
        lower.includes('sauce') || lower.includes('paste') || lower.includes('oil') ||
        lower.includes('vinegar') || lower.includes('salt') || lower.includes('pepper') ||
        lower.includes('sugar') || lower.includes('honey') || lower.includes('spices') ||
        lower.includes('cumin') || lower.includes('paprika') || lower.includes('oregano') ||
        lower.includes('thyme') || lower.includes('bay') || lower.includes('canned') ||
        lower.includes('can ') || lower.includes('soy sauce') || lower.includes('ketchup') ||
        lower.includes('mustard') || lower.includes('worcestershire')) {
      return 'Pantry & Condiments';
    }
    if (lower.includes('frozen') || lower.includes('peas') || lower.includes('corn')) {
      return 'Frozen';
    }
    
    return 'Other';
  };

  // Parse ingredient to extract quantity, unit, and base ingredient
  const parseIngredient = (ingredient: string): { quantity: string; unit: string; baseIngredient: string } => {
    const trimmed = ingredient.trim();
    
    // Try to extract quantity (first part if it's a number or fraction)
    const quantityPattern = /^(\d+(?:\/\d+)?|\d*\.?\d+)/;
    const match = trimmed.match(quantityPattern);
    
    if (match) {
      const quantity = match[1];
      const remaining = trimmed.substring(match[0].length).trim();
      
      // Common units
      const unitPattern = /^(tsp|tbsp|cup|cups|oz|lb|lbs|cloves?|inch|inches|large|medium|small|can|cans|pkg|package)/i;
      const unitMatch = remaining.match(unitPattern);
      
      if (unitMatch) {
        const unit = unitMatch[1];
        const baseIngredient = remaining.substring(unitMatch[0].length).trim().replace(/^,\s*/, '');
        return { quantity, unit, baseIngredient };
      } else {
        return { quantity, unit: '', baseIngredient: remaining };
      }
    }
    
    return { quantity: '', unit: '', baseIngredient: trimmed };
  };

  // Aggregate ingredients intelligently
  const aggregateIngredients = (): ProcessedIngredient[] => {
    const ingredientMap = new Map<string, ProcessedIngredient>();
    
    cartItems.forEach(recipe => {
      const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : (recipe.ingredients as string).split('|'); // Handle both array and string formats
      
      ingredients.forEach(ingredient => {
        const parsed = parseIngredient(ingredient);
        const category = categorizeIngredient(parsed.baseIngredient);
        
        // Use base ingredient as key for aggregation
        const key = parsed.baseIngredient.toLowerCase();
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.recipes.push(recipe.title);
          
          // Try to combine quantities if same unit
          if (parsed.unit === existing.unit && parsed.quantity && existing.quantity) {
            const existingQty = parseFloat(existing.quantity) || 0;
            const newQty = parseFloat(parsed.quantity) || 0;
            existing.quantity = (existingQty + newQty).toString();
          } else if (parsed.quantity) {
            existing.ingredient = `${ingredient.trim()}`; // Keep original if can't combine
          }
        } else {
          ingredientMap.set(key, {
            ingredient: ingredient.trim(),
            quantity: parsed.quantity,
            unit: parsed.unit,
            baseIngredient: parsed.baseIngredient,
            recipes: [recipe.title],
            category
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  };

  const processedIngredients = aggregateIngredients();
  
  // Group by category
  const groupedIngredients = processedIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, ProcessedIngredient[]>);

  const toggleItem = (ingredient: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(ingredient)) {
      newChecked.delete(ingredient);
    } else {
      newChecked.add(ingredient);
    }
    setCheckedItems(newChecked);
  };

  const generateTextList = () => {
    let text = "🛒 GROCERY LIST\n\n";
    
    Object.entries(groupedIngredients).forEach(([category, ingredients]) => {
      text += `📍 ${category.toUpperCase()}\n`;
      ingredients.forEach(ingredient => {
        const checkbox = checkedItems.has(ingredient.ingredient) ? "✅" : "☐";
        text += `${checkbox} ${ingredient.ingredient}\n`;
      });
      text += "\n";
    });
    
    text += `Generated from ${cartItems.length} recipes:\n`;
    cartItems.forEach(recipe => {
      text += `• ${recipe.title}\n`;
    });
    
    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateTextList());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generateTextList();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('🛒 My Grocery List from Grocero');
    const body = encodeURIComponent(generateTextList());
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(generateTextList());
    // iOS and Android support different SMS URL formats
    const smsUrl = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
      ? `sms:?&body=${text}`
      : `sms:?body=${text}`;
    window.open(smsUrl, '_blank');
  };

  const handlePrint = () => {
    const printContent = generatePrintableList();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintableList = () => {
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grocery List - Grocero</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #065f46; border-bottom: 2px solid #065f46; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 25px; margin-bottom: 10px; }
            .ingredient { margin: 5px 0; }
            .checkbox { margin-right: 10px; }
            .recipes { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; }
            @media print { body { font-size: 12px; } }
          </style>
        </head>
        <body>
          <h1>🛒 Grocery List</h1>
    `;
    
    Object.entries(groupedIngredients).forEach(([category, ingredients]) => {
      html += `<h2>📍 ${category}</h2>`;
      ingredients.forEach(ingredient => {
        const checked = checkedItems.has(ingredient.ingredient) ? 'checked' : '';
        html += `<div class="ingredient">
          <input type="checkbox" class="checkbox" ${checked}> ${ingredient.ingredient}
        </div>`;
      });
    });
    
    html += `
          <div class="recipes">
            <h2>🍳 Recipes (${cartItems.length})</h2>
            ${cartItems.map(recipe => `<div>• ${recipe.title}</div>`).join('')}
          </div>
          <p style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            Generated by Grocero - Smart Meal Planning
          </p>
        </body>
      </html>
    `;
    
    return html;
  };

  const categoryOrder = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Grains & Bread', 'Pantry & Condiments', 'Frozen', 'Other'];

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
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Shopping List</h2>
            <p className="text-slate-600 text-sm">
              {processedIngredients.length} ingredients from {cartItems.length} recipes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 hover:text-slate-900"
          >
            <XMarkIcon />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6">
            {categoryOrder.filter(category => groupedIngredients[category]).map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  {category}
                </h3>
                <div className="space-y-3">
                  {groupedIngredients[category].map((ingredient, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => toggleItem(ingredient.ingredient)}
                    >
                      <button className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        checkedItems.has(ingredient.ingredient)
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-400'
                      }`}>
                        {checkedItems.has(ingredient.ingredient) && <CheckIcon />}
                      </button>
                      
                      <div className="flex-1">
                        <span className={`font-medium ${
                          checkedItems.has(ingredient.ingredient) 
                            ? 'text-slate-500 line-through' 
                            : 'text-slate-900'
                        }`}>
                          {ingredient.ingredient}
                        </span>
                        {ingredient.recipes.length > 1 && (
                          <div className="text-xs text-slate-500 mt-1">
                            Used in: {ingredient.recipes.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              onClick={handleCopyToClipboard}
              className={`flex items-center justify-center space-x-2 font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                copySuccess 
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {copySuccess ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  <span>Copy Ingredients</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleEmailShare}
              className="flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <EmailIcon />
              <span>Email Ingredients</span>
            </button>
            
            <button 
              onClick={handleSMSShare}
              className="flex items-center justify-center space-x-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <PhoneIcon />
              <span>Text Ingredients</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
