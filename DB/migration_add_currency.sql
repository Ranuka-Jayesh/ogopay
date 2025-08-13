-- Migration: Add preferred_currency column to users table
-- Run this script if you have an existing database without the preferred_currency column

-- Add the preferred_currency column with default value 'LKR'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'LKR';

-- Update existing users to have LKR as default if they don't have a value
UPDATE users 
SET preferred_currency = 'LKR' 
WHERE preferred_currency IS NULL;

-- Make sure the column is not null for future inserts
ALTER TABLE users 
ALTER COLUMN preferred_currency SET NOT NULL;

-- Add a check constraint to ensure valid currency codes
ALTER TABLE users 
ADD CONSTRAINT check_valid_currency 
CHECK (preferred_currency IN ('LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'));
