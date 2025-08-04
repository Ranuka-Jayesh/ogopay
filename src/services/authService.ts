import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  whatsapp_number: string;
  profile_photo?: File;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  // Register new user
  static async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    try {
      // 1. Upload profile photo if provided
      let profile_photo_url: string | null = null;
      if (data.profile_photo) {
        const fileExt = data.profile_photo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, data.profile_photo);

        if (uploadError) {
          return { user: null, error: `Failed to upload photo: ${uploadError.message}` };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        profile_photo_url = urlData.publicUrl;
      }

      // 2. Hash password (in production, use bcrypt or similar)
      const password_hash = btoa(data.password); // Simple encoding for demo

      // 3. Insert user into database
      const { data: userData, error } = await supabase
        .from('users')
        .insert({
          email: data.email,
          password_hash,
          full_name: data.full_name,
          whatsapp_number: data.whatsapp_number,
          profile_photo_url,
          role: 'admin'
        })
        .select()
        .single();

      if (error) {
        return { user: null, error: `Registration failed: ${error.message}` };
      }

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: `Registration failed: ${error}` };
    }
  }

  // Login user
  static async login(data: LoginData): Promise<{ user: User | null; error: string | null }> {
    try {
      const password_hash = btoa(data.password); // Simple encoding for demo

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .eq('password_hash', password_hash)
        .single();

      if (error) {
        return { user: null, error: 'Invalid email or password' };
      }

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: `Login failed: ${error}` };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const userId = localStorage.getItem('currentUserId');
      if (!userId) {
        return { user: null, error: 'No user logged in' };
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { user: null, error: 'User not found' };
      }

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: `Failed to get user: ${error}` };
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
  }
} 