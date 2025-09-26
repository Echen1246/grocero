'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartButton from '@/components/CartButton';
import type { Recipe } from '@/contexts/CartContext';

// Recipe type is imported from CartContext

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtein, setSelectedProtein] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const { addToCart, isItemInCart } = useCart();

  const proteinTypes = ['All', 'Chicken', 'Beef', 'Pork', 'Fish', 'Vegetarian', 'Vegan'];

  // Proper CSV parser that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result;
  };

  useEffect(() => {
    // Load recipes from CSV
    const loadRecipes = async () => {
      try {
        const response = await fetch('/recipes.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        const parsedRecipes: Recipe[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim()) {
            const values = parseCSVLine(line);
            if (values.length >= 10) {
              parsedRecipes.push({
                title: values[0] || '',
                description: values[1] || '',
                prep_time: values[2] || '',
                cook_time: values[3] || '',
                servings: parseInt(values[4]) || 4,
                difficulty: values[5] || 'Medium',
                protein_type: values[6] || '',
                ingredients: values[7] || '',
                instructions: values[8] || '',
                tags: values[9] || '',
              });
            }
          }
        }
        console.log('Parsed recipes sample:', parsedRecipes.slice(0, 3));
        setRecipes(parsedRecipes);
        setFilteredRecipes(parsedRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  useEffect(() => {
    // Filter recipes based on search and protein type
    let filtered = recipes;

    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProtein !== 'All') {
      filtered = filtered.filter(recipe => recipe.protein_type === selectedProtein);
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, selectedProtein, recipes]);

  const getTotalTime = (prep: string, cook: string) => {
    const prepNum = parseInt(prep.replace(/\D/g, '')) || 0;
    const cookNum = parseInt(cook.replace(/\D/g, '')) || 0;
    return prepNum + cookNum;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold text-sm">G</span>
          </div>
          <p className="text-slate-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-75 transition-opacity">
                <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm tracking-tight">G</span>
                </div>
                <span className="text-xl font-semibold text-slate-900 tracking-tight">Grocero</span>
              </Link>
            </div>
            <Link 
              href="/"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeftIcon />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-12 pb-8 px-6 lg:px-8 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Recipe Collection</h1>
          <p className="text-slate-600 text-lg">Discover your next favorite meal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200/60 py-4 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent outline-none transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>

            {/* Protein Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {proteinTypes.map((protein) => (
                <button
                  key={protein}
                  onClick={() => setSelectedProtein(protein)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedProtein === protein
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {protein}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="py-4 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-600 text-sm">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group border border-slate-200/60"
              >
                <div className="h-40 bg-slate-100 rounded-lg mb-4 group-hover:bg-slate-200 transition-colors duration-200"></div>
                
                <h3 className="font-semibold text-slate-900 mb-2 leading-snug group-hover:text-emerald-800 transition-colors">
                  {recipe.title}
                </h3>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>

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

          {filteredRecipes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <SearchIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No recipes found</h3>
              <p className="text-slate-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">{selectedRecipe.title}</h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 hover:text-slate-900"
              >
                <XMarkIcon />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Recipe Image & Info */}
                <div>
                  <div className="h-64 bg-slate-100 rounded-xl mb-6"></div>
                  
                  <div className="space-y-4">
                    <p className="text-slate-600 leading-relaxed">{selectedRecipe.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-slate-600 mb-1">
                          <ClockIcon />
                          <span className="text-sm font-medium">Total Time</span>
                        </div>
                        <span className="text-lg font-semibold text-slate-900">
                          {getTotalTime(selectedRecipe.prep_time, selectedRecipe.cook_time)} min
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-slate-600 mb-1">
                          <UsersIcon />
                          <span className="text-sm font-medium">Servings</span>
                        </div>
                        <span className="text-lg font-semibold text-slate-900">{selectedRecipe.servings}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full text-sm font-medium">
                        {selectedRecipe.protein_type}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-full text-sm font-medium">
                        {selectedRecipe.difficulty}
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        addToCart(selectedRecipe);
                        setSelectedRecipe(null); // Close modal after adding
                      }}
                      disabled={isItemInCart(selectedRecipe.title)}
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                        isItemInCart(selectedRecipe.title)
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                      }`}
                    >
                      {isItemInCart(selectedRecipe.title) ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added to Week</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon />
                          <span>Add to My Week</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ingredients & Instructions */}
                <div className="space-y-6">
                  {/* Ingredients */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Ingredients</h3>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.split('|').map((ingredient, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-emerald-800 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700 leading-relaxed">{ingredient.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Instructions</h3>
                    <div className="space-y-4">
                      {selectedRecipe.instructions.split('|').map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-6 h-6 bg-emerald-800 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-slate-700 leading-relaxed">{instruction.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      <CartButton />
    </div>
  );
}
