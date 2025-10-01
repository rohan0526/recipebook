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
      setFavorites(favorites.filter(recipe => (recipe.id || recipe._id) !== recipeId));
      toast.success('Recipe removed from favorites');
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to update favorite status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <span className="text-indigo-700 text-lg font-semibold">Loading favorites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-12">
      {/* Hero/Heading Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl mb-12 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
          <img
            src="/images/hero-pattern.jpg"
            alt="Food pattern"
            className="w-full h-full object-cover"
            onError={e => e.target.style.display = 'none'}
          />
        </div>
        <div className="relative px-6 py-10 sm:px-12 sm:py-16 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
            Your Favorite Recipes
          </h1>
          <p className="text-xl text-indigo-100 mb-2">
            All your saved recipes in one place.
          </p>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-white rounded-lg shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-gray-300 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">No favorites yet</h3>
          <p className="text-gray-500 mb-2">
            You haven't added any favorites yet.
          </p>
          <p className="text-gray-500 mb-6">
            Browse recipes and click the heart icon to add them to your favorites.
          </p>
          <a
            href="/"
            className="bg-indigo-600 text-white px-5 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
          >
            Discover Recipes
          </a>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 ml-1">
            Saved Recipes
            <span className="text-gray-500 font-normal text-lg ml-2">
              ({favorites.length} {favorites.length === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {favorites.map(recipe => (
              <div
                key={recipe.id || recipe._id}
                className="recipe-card group hover:shadow-2xl bg-white rounded-lg overflow-hidden transition-all duration-300"
              >
                <RecipeCard
                  recipe={recipe}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
