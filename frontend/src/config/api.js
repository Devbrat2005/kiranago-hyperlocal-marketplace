// KiranaGo Centralized API Configuration
// Resolves backend API URL dynamically via VITE_API_URL environment variable

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim();

// Strip trailing slash if present to avoid double slashes
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

/**
 * Helper function to construct full API endpoint URL
 * @param {string} endpoint - e.g. '/api/products', '/api/cart', '/api/orders'
 * @returns {string} Fully qualified or relative API endpoint URL
 */
export function getApiUrl(endpoint = '') {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanPath}`;
}
