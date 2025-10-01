'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartButton from '@/components/CartButton';
import { useRecipes, type Recipe } from '@/hooks/useRecipes';
import { trackRecipeView, trackRecipeSearch, trackProteinFilter } from '@/lib/analytics';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtein, setSelectedProtein] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  
  const { addToCart, isItemInCart } = useCart();
  const { loading, error, filterRecipes } = useRecipes();

  // Handle search with debounce and tracking
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    // Set new timeout for tracking (only track after user stops typing for 500ms)
    if (value.length >= 2) {
      const timeout = setTimeout(() => {
        trackRecipeSearch(value);
      }, 500);
      setSearchDebounce(timeout);
    }
  };

  // Handle protein filter with tracking
  const handleProteinFilter = (protein: string) => {
    setSelectedProtein(protein);
    if (protein !== 'All') {
      trackProteinFilter(protein);
    }
  };

  // Handle recipe view with tracking
  const handleRecipeView = (recipe: Recipe) => {
    trackRecipeView(recipe.title, recipe.protein_type);
    setSelectedRecipe(recipe);
  };

  useEffect(() => {
    setMounted(true);
    
    // Check if there's a selected recipe from homepage
    const selectedRecipeData = sessionStorage.getItem('selectedRecipe');
    if (selectedRecipeData) {
      try {
        const recipe = JSON.parse(selectedRecipeData);
        setSelectedRecipe(recipe);
        sessionStorage.removeItem('selectedRecipe'); // Clean up
      } catch (error) {
        console.error('Error parsing selected recipe:', error);
      }
    }
  }, []);
  
  // Get filtered recipes
  const filteredRecipes = filterRecipes(searchTerm, selectedProtein);

  const proteinTypes = ['All', 'Chicken', 'Beef', 'Pork', 'Fish', 'Vegetarian', 'Vegan'];

  const getTotalTime = (prep: number, cook: number) => {
    return (prep || 0) + (cook || 0);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-600">Loading...</div>
    </div>;
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Recipes</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
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
                  <span className="text-white text-lg">🍱</span>
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
                  onClick={() => handleProteinFilter(protein)}
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
                onClick={() => handleRecipeView(recipe)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group border border-slate-200/60"
              >
                <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                  {recipe.image_url ? (
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 group-hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center">
                      <div className="text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
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
                  <div className="h-64 bg-slate-100 rounded-xl mb-6 overflow-hidden">
                    {selectedRecipe.image_url ? (
                      <img 
                        src={selectedRecipe.image_url} 
                        alt={selectedRecipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <div className="text-slate-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
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
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-emerald-800 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700 leading-relaxed">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Instructions</h3>
                    <div className="space-y-4">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-6 h-6 bg-emerald-800 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-slate-700 leading-relaxed">{instruction}</p>
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
