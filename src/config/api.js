// frontend/src/config/api.js
// Automatic API URL detection for local and production environments

/**
 * Determines if we're running in production or development
 * Vite automatically sets import.meta.env.PROD based on build mode
 */
const isProduction = import.meta.env.PROD;

/**
 * Base URL for API calls
 * - Development: http://localhost:3000
 * - Production: https://mediplus-backend-qvde.onrender.com
 */
export const API_URL = isProduction 
  ? import.meta.env.VITE_API_URL || 'https://mediplus-backend-qvde.onrender.com'
  : import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Alternative export name for backwards compatibility
 */
export const BACKEND_URL = API_URL; // ✅ FIXED: Use API_URL

/**
 * Environment information for debugging
 */
export const ENV_INFO = {
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  apiUrl: API_URL // ✅ FIXED: Use API_URL
};

// Log environment info in development
if (!isProduction) {
  console.log('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('🔗 API URL:', API_URL); // ✅ FIXED: Use API_URL
  console.log('📦 Full ENV Info:', ENV_INFO);
}

export default API_URL; // ✅ FIXED: Export API_URL