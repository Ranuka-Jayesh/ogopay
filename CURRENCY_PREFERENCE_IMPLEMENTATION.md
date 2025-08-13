# Currency Preference Implementation

## Overview
This implementation adds a currency preference feature to the admin profile, allowing users to select their preferred currency for transactions. The default currency is set to LKR (Sri Lankan Rupee).

## Changes Made

### 1. Database Schema Updates
- **File**: `DB/db.sql`
- **Change**: Added `preferred_currency VARCHAR(3) DEFAULT 'LKR'` column to the `users` table

### 2. Migration Script
- **File**: `DB/migration_add_currency.sql`
- **Purpose**: For existing databases, run this script to add the currency column
- **Features**:
  - Adds the column with default value 'LKR'
  - Updates existing users to have LKR as default
  - Adds constraint to ensure valid currency codes

### 3. Type Definitions
- **File**: `src/lib/supabase.ts`
- **Change**: Updated `User` interface to include `preferred_currency: string`

### 4. AuthContext Enhancement
- **File**: `src/contexts/AuthContext.tsx`
- **Change**: Added `updateUser` method to allow updating user preferences
- **Usage**: Enables real-time updates of user currency preference

### 5. ProfilePage Currency Section
- **File**: `src/components/Admin/ProfilePage.tsx`
- **Features**:
  - Currency selection dropdown with 8 major currencies
  - Automatic database update on currency change
  - Success/error message display
  - Automatic page refresh after update

## Supported Currencies
- **LKR** - Sri Lankan Rupee (Default)
- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **INR** - Indian Rupee
- **AUD** - Australian Dollar
- **CAD** - Canadian Dollar
- **JPY** - Japanese Yen

## User Experience
1. Users can access currency preferences in the Profile → Preferences section
2. Currency selection automatically saves to database when changed
3. Success message confirms the update
4. Page automatically refreshes to reflect the new currency preference
5. Error handling reverts to previous currency if update fails

## Technical Implementation
- Uses Supabase for database operations
- Implements proper error handling
- Maintains user state consistency across the application
- Follows existing design patterns and styling
- Responsive design for mobile and desktop

## Database Migration
For existing installations, run the migration script:
```sql
-- Run DB/migration_add_currency.sql
```

## Future Enhancements
- Currency symbol display
- Currency conversion rates
- Transaction amount formatting based on selected currency
- Multi-currency transaction support
