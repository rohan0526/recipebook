import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { recipesAPI, favoritesAPI } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await recipesAPI.getAllRecipes();
        setRecipes(response.data);

        if (isAuthenticated) {
          const favoritesResponse = await favoritesAPI.getFavorites();
          setFavorites(favoritesResponse.data.map(fav => fav.id || fav._id));
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast.error('Failed to load recipes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [isAuthenticated]);

  const handleToggleFavorite = async (recipeId) => {
    try {
      await favoritesAPI.toggleFavorite(recipeId);
      if (favorites.includes(recipeId)) {
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        setFavorites([...favorites, recipeId]);
      }
      toast.success('Favorites updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const isFavorite = (recipeId) => {
    return favorites.includes(recipeId);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl mb-12 shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img
              src="/images/hero-pattern.jpg"
              alt="Food pattern"
              className="w-full h-full object-cover"
              onError={e => e.target.style.display = 'none'}
            />
          </div>
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20 text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Discover Delicious Recipes
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              Browse our collection of tasty recipes and save your favorites.
            </p>

            {/* CTA Button */}
            {isAuthenticated &&
              <button
                className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-100 mb-4 transition"
                onClick={() => window.location.href = '/add-recipe'}
              >
                + Add Recipe
              </button>
            }

            {/* Search bar */}
            <div className="max-w-xl w-full mx-auto relative">
              <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden p-1 ring-2 ring-white focus-within:ring-indigo-500 transition">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full py-3 px-5 focus:outline-none text-gray-800 placeholder:text-gray-400 text-lg"
                />
                <button
                  className="bg-indigo-600 text-white rounded-full p-3 m-1 flex-shrink-0 hover:bg-indigo-700 transition"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content and Cards */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
            <span className="text-indigo-700 text-lg font-semibold">Loading recipes...</span>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {searchTerm ? 'Search Results' : 'All Recipes'}
              <span className="text-gray-500 font-normal text-lg ml-2">
                ({filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'})
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {filteredRecipes.map(recipe => (
                <div
                  key={recipe.id || recipe._id}
                  className="recipe-card group hover:shadow-2xl bg-white rounded-lg overflow-hidden transition-all duration-300"
                >
                  <RecipeCard
                    recipe={recipe}
                    isFavorite={isFavorite(recipe.id || recipe._id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No recipes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No results found for "${searchTerm}"` : "There are no recipes available yet."}
            </p>
            {isAuthenticated && (
              <button
                className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition"
                onClick={() => window.location.href = '/add-recipe'}
              >
                Add the first recipe
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
