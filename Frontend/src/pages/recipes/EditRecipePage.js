import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipesAPI } from '../../services/api';
import { storeImage, getImage, deleteImage } from '../../services/imageStorage';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImageKey, setOriginalImageKey] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    image: null,
    cooking_time: '',
    servings: '1-2',
    difficulty: 'easy'
  });

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeResponse = await recipesAPI.getRecipeById(id);
        const recipe = recipeResponse.data;
        
        console.log("Recipe data from API:", recipe);
        
        // Check if user is the owner of the recipe
        const recipeUserId = recipe.created_by || recipe.user_id;
        const currentUserId = currentUser?.id || currentUser?._id;
        
        if (recipeUserId !== currentUserId) {
          toast.error("You don't have permission to edit this recipe");
          navigate(`/recipe/${id}`);
          return;
        }
        
        // Set original image key for later use
        setOriginalImageKey(recipe.image_key);
        
        // Set image preview if there's an existing image
        if (recipe.image_key) {
          setImagePreview(getImage(recipe.image_key));
        }
        
        // Parse cookTime if it exists (e.g. "30 mins" → "30")
        let cooking_time = '';
        if (recipe.cooking_time) {
          const timeMatch = recipe.cooking_time.match(/(\d+)/);
          if (timeMatch) {
            cooking_time = timeMatch[1];
          } else {
            cooking_time = recipe.cooking_time;
          }
        }
        
        // Convert arrays back to multi-line text
        setFormData({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients.join('\n'),
          steps: recipe.steps.join('\n'),
          image: null,
          cooking_time: cooking_time,
          servings: recipe.servings || '1-2',
          difficulty: recipe.difficulty || 'easy'
        });
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Store the file in state
    setFormData({
      ...formData,
      image: file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert ingredients and steps from multi-line text to arrays
      const ingredientsArray = formData.ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      const stepsArray = formData.steps
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

      // Handle image
      let image_key = originalImageKey;
      
      // If a new image was selected, store it
      if (formData.image) {
        try {
          // Store new image
          const newImageKey = await storeImage(formData.image);
          
          // Delete old image if it exists and is not a URL
          if (originalImageKey && !originalImageKey.startsWith('http')) {
            deleteImage(originalImageKey);
          }
          
          image_key = newImageKey;
        } catch (imageError) {
          toast.error(`Image error: ${imageError.message}`);
          // Continue with submission even if image fails
        }
      }

      // Format cooking time to include "mins" if only a number is provided
      let cooking_time = formData.cooking_time;
      if (cooking_time && !isNaN(cooking_time)) {
        cooking_time = `${cooking_time} mins`;
      }

      // Create the recipe data object
      const recipeData = {
        title: formData.title,
        description: formData.description,
        ingredients: ingredientsArray,
        steps: stepsArray,
        image_key: image_key,
        cooking_time: cooking_time,
        servings: formData.servings,
        difficulty: formData.difficulty
      };

      console.log("Submitting updated recipe data:", recipeData);

      await recipesAPI.updateRecipe(id, recipeData);
      
      toast.success('Recipe updated successfully!');
      navigate(`/recipe/${id}`);
    } catch (err) {
      console.error('Error updating recipe:', err);
      toast.error(err.response?.data?.message || 'Failed to update recipe. Please try again.');
    } finally {
      setSubmitting(false);
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
        <button 
          onClick={() => navigate('/')}
          className="mt-2 text-indigo-600 hover:text-indigo-800"
        >
          Go back to recipes
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Recipe</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          {/* Recipe Metadata - Cooking Time, Servings, Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cooking Time */}
            <div>
              <label htmlFor="cooking_time" className="block text-sm font-medium text-gray-700 mb-1">
                Cooking Time (minutes)*
              </label>
              <input
                type="number"
                id="cooking_time"
                name="cooking_time"
                min="1"
                value={formData.cooking_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="e.g. 30"
              />
            </div>
            
            {/* Servings */}
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                Servings*
              </label>
              <select
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="1-2">1-2 servings</option>
                <option value="2-4">2-4 servings</option>
                <option value="4-6">4-6 servings</option>
                <option value="6-8">6-8 servings</option>
                <option value="8+">8+ servings</option>
              </select>
            </div>
            
            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Describe your recipe in a few sentences"
            ></textarea>
          </div>

          {/* Ingredients */}
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients* (one per line)
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              rows="5"
              value={formData.ingredients}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="e.g.&#10;2 eggs&#10;1 cup flour&#10;2 tbsp butter"
            ></textarea>
          </div>

          {/* Steps */}
          <div>
            <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions* (one step per line)
            </label>
            <textarea
              id="steps"
              name="steps"
              rows="5"
              value={formData.steps}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="e.g.&#10;Preheat oven to 350°F.&#10;Mix all ingredients in a bowl.&#10;Bake for 20 minutes."
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Image
            </label>
            
            {/* Current Image Preview */}
            {imagePreview && (
              <div className="mt-2 mb-3">
                <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                <img
                  src={imagePreview}
                  alt="Current"
                  className="h-40 w-auto object-cover rounded-md"
                />
              </div>
            )}
            
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended: square images less than 2MB in size
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/recipe/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Updating Recipe...' : 'Update Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipePage;
