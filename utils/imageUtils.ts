/**
 * Image URL utility - Lightweight safety net for edge cases
 * Note: Backend now handles URL generation properly, this is just for safety
 */
const PRODUCTION_BASE_URL = 'https://updates-backend-api-beebc8cc747c.herokuapp.com';

/**
 * Ensures image URLs are production-ready (safety net)
 * @param imageUrl - The image URL from the API
 * @returns The image URL (fixed if needed)
 */
export const getImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  
  // Backend should now provide correct URLs, but check for localhost as safety net
  if (imageUrl.includes('localhost')) {
    console.warn('⚠️ Localhost URL detected (should not happen):', imageUrl);
    return imageUrl.replace(/http:\/\/localhost:(\d+)/, PRODUCTION_BASE_URL);
  }
  
  // Return URL as-is (backend handles this now)
  return imageUrl;
};


