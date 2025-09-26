'use client';

import { useState } from 'react';
import Link from 'next/link';

// Heroicons - premium minimalist icons
const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sampleRecipes = [
    { title: "Honey Garlic Chicken", time: "25", protein: "Chicken", difficulty: "Medium" },
    { title: "Black Bean Tacos", time: "35", protein: "Vegetarian", difficulty: "Easy" },
    { title: "Lemon Herb Salmon", time: "20", protein: "Fish", difficulty: "Easy" },
    { title: "Classic Beef Lasagna", time: "90", protein: "Beef", difficulty: "Medium" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm tracking-tight">G</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 tracking-tight">Grocero</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/recipes" className="text-sm font-medium text-slate-700 hover:text-emerald-800 transition-colors duration-200">
                Recipes
              </Link>
              <Link href="/my-list" className="text-sm font-medium text-slate-700 hover:text-emerald-800 transition-colors duration-200">
                My List
              </Link>
              <Link href="/grocery-list" className="text-sm font-medium text-slate-700 hover:text-emerald-800 transition-colors duration-200">
                Grocery List
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200/60">
              <div className="flex flex-col space-y-3">
                <Link href="/recipes" className="text-sm font-medium text-slate-700 hover:text-emerald-800 transition-colors py-2">
                  Recipes
                </Link>
                <Link href="/my-list" className="text-sm font-medium text-slate-700 hover:text-emerald-800 transition-colors py-2">
                  My List
                </Link>
                <Link href="/grocery-list" className="text-sm font-medium text-slate-700 hover:text-emerald-800 transition-colors py-2">
                  Grocery List
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Thoughtful meal
            <br />
            <span className="text-emerald-800">planning</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Select recipes. Generate lists. Shop with purpose.
            <br />
            The elegant solution to meal planning.
          </p>
          <Link 
            href="/recipes"
            className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200 group"
          >
            <span>Explore Recipes</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BookOpenIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Curated Recipes</h3>
              <p className="text-slate-600 leading-relaxed">
                Browse thoughtfully selected recipes organized by protein, cuisine, and cooking time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <CheckIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Weekly Selection</h3>
              <p className="text-slate-600 leading-relaxed">
                Choose recipes for your week. Simple selections that respect your time and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ListIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Smart Lists</h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically consolidated grocery lists. No duplicates, no waste, no forgotten items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Preview */}
      <section className="py-20 bg-white px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Recipes</h2>
            <p className="text-slate-600 text-lg">A selection from our curated collection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleRecipes.map((recipe, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors duration-200 cursor-pointer group">
                <div className="h-40 bg-slate-200 rounded-lg mb-4 group-hover:bg-slate-300 transition-colors duration-200"></div>
                <h4 className="font-semibold text-slate-900 mb-3 leading-snug">{recipe.title}</h4>
                
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <ClockIcon />
                    <span>{recipe.time} min</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                    {recipe.protein}
                  </span>
                </div>
                
                <div className="mt-3 text-xs text-slate-500">
                  {recipe.difficulty}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/recipes"
              className="inline-flex items-center space-x-2 text-emerald-800 hover:text-emerald-900 font-medium transition-colors duration-200"
            >
              <span>View all recipes</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-emerald-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-xs">G</span>
            </div>
            <span className="text-lg font-semibold text-slate-900">Grocero</span>
          </div>
          <p className="text-slate-600 text-sm">
            Thoughtful meal planning for modern life
          </p>
        </div>
      </footer>
    </div>
  );
}