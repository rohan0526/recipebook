import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesAPI } from '../../services/api';
import { storeImage } from '../../services/imageStorage';
import { toast } from 'react-toastify';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    image: null,
    cookTime: '',
    servings: '1-2',
    difficulty: 'easy'
  });

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
    setLoading(true);

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

      // Store the image and get its ID
      let image_key = null;
      if (formData.image) {
        try {
          image_key = await storeImage(formData.image);
        } catch (imageError) {
          toast.error(`Image error: ${imageError.message}`);
          // Continue with submission even if image fails
        }
      }

      // Format cooking time to include "mins" if only a number is provided
      let cookTime = formData.cookTime;
      if (cookTime && !isNaN(cookTime)) {
        cookTime = `${cookTime} mins`;
      }

      // Create the recipe data object
      const recipeData = {
        title: formData.title,
        description: formData.description,
        ingredients: ingredientsArray,
        steps: stepsArray,
        image_key: image_key,
        cookTime: cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty
      };

      const response = await recipesAPI.createRecipe(recipeData);
      
      toast.success('Recipe added successfully!');
      navigate(`/recipe/${response.data.id || response.data._id}`);
    } catch (err) {
      console.error('Error creating recipe:', err);
      toast.error(err.response?.data?.message || 'Failed to add recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Recipe</h1>
        
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
              <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-1">
                Cooking Time (minutes)*
              </label>
              <input
                type="number"
                id="cookTime"
                name="cookTime"
                min="1"
                value={formData.cookTime}
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
          
          {/* Image upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended: square images less than 2MB in size
            </p>
            
            {/* Image preview */}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Recipe preview" 
                  className="w-40 h-40 object-cover rounded-md" 
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({...formData, image: null});
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Adding Recipe...' : 'Add Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipePage;
