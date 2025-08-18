/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get the full image URL from a relative path
 * @param {string} imagePath - Relative image path from the backend
 * @returns {string} - Full image URL or default placeholder
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://placehold.co/120x120/e2e8f0/718096?text=No+Image';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /media/, construct the full URL
  if (imagePath.startsWith('/media/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If it doesn't start with /, add it
  if (!imagePath.startsWith('/')) {
    return `${API_BASE_URL}/media/${imagePath}`;
  }
  
  // Default case
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Get user avatar URL with fallback
 * @param {object} user - User object with image data
 * @param {string} userType - Type of user (customer, contractor, supervisor)
 * @returns {string} - Avatar URL or default placeholder
 */
export const getUserAvatarUrl = (user, userType) => {
  if (!user) {
    return 'https://placehold.co/120x120/e2e8f0/718096?text=User';
  }
  
  let imagePath = null;
  
  switch (userType) {
    case 'customer':
      imagePath = user.customer_image;
      break;
    case 'contractor':
      imagePath = user.contractor_image;
      break;
    case 'supervisor':
      imagePath = user.supervisor_image;
      break;
    default:
      // Try to auto-detect from available fields
      imagePath = user.customer_image || user.contractor_image || user.supervisor_image;
  }
  
  return getImageUrl(imagePath);
};

/**
 * Get service image URL
 * @param {object} service - Service object with image data
 * @returns {string} - Service image URL or default placeholder
 */
export const getServiceImageUrl = (service) => {
  if (!service || !service.image) {
    return 'https://placehold.co/300x200/e2e8f0/718096?text=Service';
  }
  
  return getImageUrl(service.image);
};
