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
          // Get array of favorite recipe IDs
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
      // Update favorites state
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

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto">
      <div className="max-w-6xl mx-auto">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden mb-12">
          <div className="absolute inset-0 opacity-30">
            <img 
              src="/images/hero-pattern.jpg" 
              alt="Food pattern" 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Discover Delicious Recipes
            </h1>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
              Browse our collection of tasty recipes and save your favorites
            </p>
            
            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden p-1">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 px-5 focus:outline-none text-gray-700"
                />
                <button className="bg-indigo-600 text-white rounded-full p-3 m-1 flex-shrink-0 hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {searchTerm ? 'Search Results' : 'All Recipes'}
              <span className="text-gray-500 font-normal text-lg ml-2">
                ({filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'})
              </span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id || recipe._id}
                  recipe={recipe}
                  isFavorite={isFavorite(recipe.id || recipe._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No results found for "${searchTerm}"` : "There are no recipes available yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
