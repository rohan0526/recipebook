import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipesAPI } from '../services/api';
import { getImage } from '../services/imageStorage';
import { toast } from 'react-toastify';

const RecipeCard = ({ recipe, onToggleFavorite, isFavorite }) => {
  const { isAuthenticated } = useAuth();
  const [imageSrc, setImageSrc] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Check both possible image property names
        const imageIdentifier = recipe.image_key || recipe.image;
        console.log('RecipeCard loading image with identifier:', imageIdentifier);
        
        if (!imageIdentifier) {
          console.log('No image identifier found for recipe:', recipe.title);
          setImageSrc('/images/default-recipe.jpg');
          return;
        }
        
        const src = await getImage(imageIdentifier);
        console.log('Image result:', Boolean(src));
        
        if (src) {
          setImageSrc(src);
        } else {
          setImageSrc('/images/default-recipe.jpg');
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageSrc('/images/default-recipe.jpg');
      }
    };

    loadImage();
  }, [recipe]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      await onToggleFavorite(recipe.id || recipe._id);
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Truncate long descriptions
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/recipe/${recipe.id || recipe._id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageSrc || '/images/default-recipe.jpg'} 
            alt={recipe.title} 
            className={`w-full h-full object-cover transform transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
            onError={(e) => {
              e.target.src = '/images/default-recipe.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{recipe.title}</h3>
            
            {isAuthenticated && (
              <button 
                onClick={handleFavoriteToggle} 
                disabled={isLoading}
                className={`flex-shrink-0 text-2xl focus:outline-none transform transition-transform ${isLoading ? 'opacity-50' : 'hover:scale-110'}`}
              >
                {isFavorite ? (
                  <span className="text-red-500" role="img" aria-label="favorited">❤️</span>
                ) : (
                  <span className="text-gray-400 hover:text-red-500" role="img" aria-label="not favorited">♡</span>
                )}
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {truncateDescription(recipe.description)}
          </p>
          
          <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {recipe.ingredients?.length || 0} ingredients
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recipe.cookTime || 'N/A'}</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4 pt-0">
        <Link 
          to={`/recipe/${recipe.id || recipe._id}`} 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center transition-colors"
        >
          View Recipe
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
