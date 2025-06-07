import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipesAPI, favoritesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getImage } from '../../services/imageStorage';
import { toast } from 'react-toastify';

const RecipeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setIsLoading(true);
      try {
        const response = await recipesAPI.getRecipeById(id);
        const recipeData = response.data;
        setRecipe(recipeData);
        
        // Check if user is the owner of the recipe
        if (isAuthenticated && currentUser && recipeData) {
          // Get user ID (handle both id and _id properties)
          const userId = currentUser.id || currentUser._id;
          const recipeUserId = recipeData.user_id || recipeData.userId || recipeData.created_by;
          
          // Convert both to strings for comparison to handle different formats
          setIsOwner(
            recipeUserId && userId && 
            String(userId) === String(recipeUserId)
          );
          
          console.log('User check:', { 
            userId, 
            recipeUserId, 
            isOwner: recipeUserId && userId && String(userId) === String(recipeUserId) 
          });
        }
        
        // Check if recipe is in user's favorites
        if (isAuthenticated) {
          const favoritesResponse = await favoritesAPI.getFavorites();
          const favoriteIds = favoritesResponse.data.map(fav => fav.id || fav._id);
          setIsFavorite(favoriteIds.includes(id));
        }
        
        // Load image
        if (recipeData.image || recipeData.image_key) {
          try {
            // Try both possible image property names
            const imageIdentifier = recipeData.image_key || recipeData.image;
            console.log('Loading image with identifier:', imageIdentifier);
            
            const src = await getImage(imageIdentifier);
            console.log('Image src result:', src);
            
            if (src) {
              setImageSrc(src);
            } else {
              console.warn('Image not found in storage, using default');
              setImageSrc('/images/default-recipe.jpg');
            }
          } catch (error) {
            console.error('Error loading image:', error);
            setImageSrc('/images/default-recipe.jpg');
          }
        } else {
          console.log('No image property found on recipe:', recipeData);
          setImageSrc('/images/default-recipe.jpg');
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        toast.error('Failed to load recipe details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id, isAuthenticated, currentUser]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await recipesAPI.deleteRecipe(id);
      toast.success('Recipe deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save favorites');
      return;
    }

    setIsSubmitting(true);
    try {
      await favoritesAPI.toggleFavorite(id);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Recipe Not Found</h3>
        <p className="text-gray-500 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl overflow-hidden shadow-md">
      {/* Hero section */}
      <div className="relative h-80 sm:h-96 bg-gray-100">
        <img 
          src={imageSrc} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/default-recipe.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Back button */}
        <Link 
          to="/" 
          className="absolute top-4 left-4 z-10 flex items-center text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {isAuthenticated && (
            <button
              onClick={handleToggleFavorite}
              disabled={isSubmitting}
              className={`p-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
          
          {isOwner && (
            <>
              <Link
                to={`/edit-recipe/${id}`}
                className="p-2.5 bg-white text-gray-700 hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-2.5 bg-white text-red-500 hover:bg-red-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Recipe title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{recipe.title}</h1>
          <div className="flex flex-wrap items-center text-white opacity-90 gap-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recipe.cooking_time || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>{recipe.servings || 'N/A'} servings</span>
            </div>
            {recipe.difficulty && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{recipe.difficulty}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 md:p-8">
        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">About this Recipe</h2>
          <p className="text-gray-700 whitespace-pre-line">{recipe.description}</p>
        </div>
        
        {/* Content - Display both ingredients and instructions together */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Ingredients Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Ingredients</h2>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No ingredients listed</p>
            )}
          </div>
          
          {/* Instructions Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Instructions</h2>
            {recipe.instructions || recipe.steps ? (
              <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-line">
                {Array.isArray(recipe.instructions || recipe.steps) ? (
                  <ol className="space-y-3">
                    {(recipe.instructions || recipe.steps).map((step, index) => (
                      <li key={index} className="pl-2">
                        <div className="flex">
                          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded-full">
                            Step {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  recipe.instructions || recipe.steps
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No instructions provided</p>
            )}
          </div>
        </div>
        
        {/* Notes section */}
        {recipe.notes && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <h3 className="flex items-center text-lg font-medium text-yellow-800 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
              </svg>
              Chef's Notes
            </h3>
            <p className="text-yellow-700 whitespace-pre-line">{recipe.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
