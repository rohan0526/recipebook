/**
 * Service for managing image uploads in the frontend
 * Uses localStorage to store image data
 */

// Configuration
const IMAGE_FOLDER_PATH = '/images/';
const DEFAULT_IMAGE = '/images/default-recipe.jpg';

// Function to generate a unique ID for image storage
const generateImageId = () => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Converts an uploaded file to a base64 string for storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Store an image file and return an image key
 * @param {File} file - The image file to store
 * @returns {Promise<string>} - The image key for retrieving the image
 */
export const storeImage = async (file) => {
  try {
    // Validate file is an image
    if (!file.type.match('image.*')) {
      throw new Error('Only image files are allowed');
    }
    
    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image size should not exceed 2MB');
    }
    
    // Generate a unique ID for the image
    const imageId = generateImageId();
    
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Store image in localStorage
    localStorage.setItem(imageId, base64Data);
    
    return imageId;
  } catch (error) {
    console.error('Error storing image:', error);
    throw error;
  }
};

/**
 * Get an image by its key
 * @param {string} imageId - The image key
 * @returns {string|null} - The image data URL or null if not found
 */
export const getImage = (imageId) => {
  if (!imageId) return null;
  
  // If it's already a URL (for backward compatibility), return as is
  if (imageId.startsWith('http')) {
    return imageId;
  }
  
  // If it's a reference to a public image, add the public path
  if (imageId.startsWith('/images/')) {
    return imageId;
  }
  
  // Otherwise, retrieve from localStorage
  return localStorage.getItem(imageId) || null;
};

/**
 * Delete an image by its key
 * @param {string} imageId - The image key to delete
 */
export const deleteImage = (imageId) => {
  if (!imageId) return;
  
  // Don't try to delete URLs or public images
  if (imageId.startsWith('http') || imageId.startsWith('/images/')) {
    return;
  }
  
  localStorage.removeItem(imageId);
};

/**
 * Get a default image for recipes without images
 * @returns {string} - The default image path
 */
export const getDefaultImage = () => {
  return DEFAULT_IMAGE;
};

export default {
  storeImage,
  getImage,
  deleteImage,
  getDefaultImage,
  IMAGE_FOLDER_PATH
};
