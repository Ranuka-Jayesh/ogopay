// Environment configuration for different deployment scenarios
export const getBaseUrl = (): string => {
  // Check for environment variables first (for production)
  const envBaseUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_BASE_URL;
  
  if (envBaseUrl) {
    return envBaseUrl.endsWith('/') ? envBaseUrl.slice(0, -1) : envBaseUrl;
  }
  
  // Fallback to window.location.origin (for development)
  return window.location.origin;
};

// Check if we're in production
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

// Get the current environment
export const getEnvironment = (): string => {
  return import.meta.env.MODE || 'development';
}; 