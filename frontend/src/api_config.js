const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove trailing slash if present to avoid double slashes in paths
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

console.log('Using API URL:', API_URL);

