'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import CartModal from './CartModal';

const CartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7h9m-9-7h10" />
  </svg>
);

export default function CartButton() {
  const { cartCount } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Animate when cart count changes
  useEffect(() => {
    if (cartCount > prevCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  return (
    <>
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
      >
        <div className="flex items-center space-x-3">
          {/* Cart Icon */}
          <div className={`relative transition-transform duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <CartIcon />
            
            {/* Animated Badge */}
            {cartCount > 0 && (
              <div className={`absolute -top-2 -right-2 bg-white text-emerald-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                isAnimating ? 'scale-125 bg-emerald-100' : 'scale-100'
              }`}>
                {cartCount}
              </div>
            )}
          </div>

          {/* Cart Text */}
          <div className="hidden md:block">
            <span className={`font-semibold transition-all duration-300 ${
              isAnimating ? 'scale-105' : 'scale-100'
            }`}>
              {cartCount === 0 ? 'Cart' : `${cartCount} Recipe${cartCount !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Mobile-only count */}
          <div className="md:hidden">
            {cartCount > 0 && (
              <span className={`font-semibold transition-all duration-300 ${
                isAnimating ? 'scale-105' : 'scale-100'
              }`}>
                {cartCount}
              </span>
            )}
          </div>
        </div>

        {/* Pulse animation ring when item added */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25"></div>
        )}
      </button>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
