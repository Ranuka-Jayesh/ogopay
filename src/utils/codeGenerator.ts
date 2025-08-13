/**
 * Generates a random 4-digit code for tracking access
 * @returns A 4-digit string code
 */
export const generateTrackingCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Validates if a code is a valid 4-digit number
 * @param code The code to validate
 * @returns True if valid, false otherwise
 */
export const isValidTrackingCode = (code: string): boolean => {
  return /^\d{4}$/.test(code);
}; 