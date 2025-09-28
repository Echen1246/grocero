import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  protein_type: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  image_url: string | null;
  created_at: Date;
}

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if Firebase is initialized
        if (!db) {
          setError('Firebase not initialized');
          return;
        }

        // Query curated recipes
        const recipesQuery = query(
          collection(db, 'curated_recipes'),
          orderBy('created_at', 'desc')
        );

        const querySnapshot = await getDocs(recipesQuery);
        
        const fetchedRecipes: Recipe[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedRecipes.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            prep_time: data.prep_time || 0,
            cook_time: data.cook_time || 0,
            servings: data.servings || 4,
            difficulty: data.difficulty || 'Medium',
            protein_type: data.protein_type || '',
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            tags: data.tags || [],
            image_url: data.image_url || null,
            created_at: data.created_at?.toDate() || new Date(),
          });
        });

        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter recipes by search term and protein type
  const filterRecipes = (searchTerm: string, proteinType: string) => {
    let filtered = recipes;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(search) ||
        recipe.description.toLowerCase().includes(search) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (proteinType && proteinType !== 'All') {
      filtered = filtered.filter(recipe => recipe.protein_type === proteinType);
    }

    return filtered;
  };

  return {
    recipes,
    loading,
    error,
    filterRecipes,
  };
};
