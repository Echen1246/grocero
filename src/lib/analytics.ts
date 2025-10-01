import { track } from '@vercel/analytics';

/**
 * Custom event tracking for Grocero
 * Track user interactions for analytics
 */

// Shopping List Events
export const trackCopyIngredients = () => {
  track('copy_ingredients', {
    location: 'shopping_list_modal'
  });
};

export const trackEmailIngredients = () => {
  track('email_ingredients', {
    location: 'shopping_list_modal'
  });
};

export const trackTextIngredients = () => {
  track('text_ingredients', {
    location: 'shopping_list_modal'
  });
};

// Recipe Instructions Events
export const trackCopyInstructions = () => {
  track('copy_instructions', {
    location: 'cart_modal'
  });
};

export const trackEmailInstructions = () => {
  track('email_instructions', {
    location: 'cart_modal'
  });
};

export const trackTextInstructions = () => {
  track('text_instructions', {
    location: 'cart_modal'
  });
};

// Cart Events
export const trackAddToCart = (recipeTitle: string, proteinType: string) => {
  track('add_to_cart', {
    recipe: recipeTitle,
    protein: proteinType
  });
};

export const trackRemoveFromCart = (recipeTitle: string) => {
  track('remove_from_cart', {
    recipe: recipeTitle
  });
};

export const trackGenerateShoppingList = (recipeCount: number, ingredientCount: number) => {
  track('generate_shopping_list', {
    recipes: recipeCount,
    ingredients: ingredientCount
  });
};

// Recipe Interaction Events
export const trackRecipeView = (recipeTitle: string, proteinType: string) => {
  track('recipe_view', {
    recipe: recipeTitle,
    protein: proteinType
  });
};

export const trackRecipeSearch = (searchTerm: string) => {
  track('recipe_search', {
    query: searchTerm
  });
};

export const trackProteinFilter = (proteinType: string) => {
  track('protein_filter', {
    protein: proteinType
  });
};

// Navigation Events
export const trackSubmitRecipeClick = () => {
  track('submit_recipe_click', {
    destination: 'google_form'
  });
};

export const trackCartOpen = (itemCount: number) => {
  track('cart_open', {
    items: itemCount
  });
};

