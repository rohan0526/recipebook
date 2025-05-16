import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../../services/api';
import RecipeCard from '../../components/RecipeCard';
import { toast } from 'react-toastify';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getFavorites();
      setFavorites(response.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load your favorite recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (recipeId) => {
    try {
      await favoritesAPI.toggleFavorite(recipeId);
      // Remove the recipe from the favorites list
      setFavorites(favorites.filter(recipe => (recipe.id || recipe._id) !== recipeId));
      toast.success('Recipe removed from favorites');
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to update favorite status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Favorite Recipes</h1>
        <p className="text-gray-600 mt-2">All your saved recipes in one place</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-gray-400 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <p className="text-gray-500 text-lg">You haven't added any favorites yet.</p>
          <p className="text-gray-500 mt-2">
            Browse recipes and click the heart icon to add them to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(recipe => (
            <RecipeCard 
              key={recipe.id || recipe._id} 
              recipe={recipe} 
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
