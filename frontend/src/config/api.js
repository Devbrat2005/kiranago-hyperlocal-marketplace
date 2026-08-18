// KiranaGo Centralized API Configuration
// Resolves backend API URL dynamically via VITE_API_URL environment variable or falls back to deployed production backend URL

const DEPLOYED_BACKEND_URL = 'https://kiranago-hyperlocal-marketplace.vercel.app/api';


const rawBaseUrl = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || DEPLOYED_BACKEND_URL).trim();

// Strip trailing slash if present to avoid double slashes
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

/**
 * Robust helper function to construct full API endpoint URL
 * Normalizes base URLs and endpoints (handling /api prefixes cleanly)
 * @param {string} endpoint - e.g. '/api/products', '/products', 'health'
 * @returns {string} Fully qualified or relative API endpoint URL
 */
export function getApiUrl(endpoint = '') {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  let base = API_BASE_URL;
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Handle /api prefix normalization
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    path = path.substring(4);
  } else if (!base.endsWith('/api') && !path.startsWith('/api/') && path !== '/api') {
    path = `/api${path}`;
  }

  if (!base) return path;
  return `${base}${path}`;
}



