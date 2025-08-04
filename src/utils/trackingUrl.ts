import { getBaseUrl } from '../config/environment';

// Generate a unique tracking URL for friends
export const generateTrackingUrl = (): string => {
  // Generate a random string of 12 characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  return `${result}-${timestamp}`;
};

// Validate tracking URL format
export const isValidTrackingUrl = (url: string): boolean => {
  // Check if URL matches the expected format (12 chars + timestamp)
  const pattern = /^[A-Za-z0-9]{12}-[a-z0-9]+$/;
  return pattern.test(url);
};

// Get the full tracking URL for a friend
export const getFullTrackingUrl = (trackingUrl: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/track/${trackingUrl}`;
};

// Debug function to help troubleshoot tracking URL issues
export const debugTrackingUrl = (trackingUrl: string): void => {
  console.log('Tracking URL Debug Info:');
  console.log('Tracking URL:', trackingUrl);
  console.log('Base URL:', getBaseUrl());
  console.log('Full URL:', getFullTrackingUrl(trackingUrl));
  console.log('Environment:', import.meta.env.MODE);
  console.log('VITE_PUBLIC_URL:', import.meta.env.VITE_PUBLIC_URL);
}; 