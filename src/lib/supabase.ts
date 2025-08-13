import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.error('❌ VITE_SUPABASE_URL is not set. Please add your Supabase project URL to .env file');
  console.error('Example: VITE_SUPABASE_URL=https://your-project-id.supabase.co');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set. Please add your Supabase anon key to .env file');
  console.error('Example: VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
}

// Create a mock client if environment variables are not set
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project-id.supabase.co' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  
  console.warn('⚠️ Using mock Supabase client. Please configure your environment variables.');
  
  // Mock client for development
  supabase = {
    from: () => ({
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      select: () => ({
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: null } })
      })
    }
  };
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw error;
  }
}

export { supabase };

// Database types based on your schema
export interface User {
  id: number;
  email: string;
  full_name: string;
  whatsapp_number: string;
  profile_photo_url?: string;
  role: string;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  id: number;
  full_name: string;
  whatsapp_number: string;
  admin_id: number;
  is_registered: boolean;
  user_id?: number;
  tracking_url?: string;
  tracking_code: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  admin_id: number;
  friend_id: number;
  type: 'loan' | 'repayment';
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
} 