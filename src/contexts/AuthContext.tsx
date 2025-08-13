import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, type RegisterData, type LoginData } from '../services/authService';
import type { User } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user, error } = await AuthService.getCurrentUser();
        if (user && !error) {
          setAuthState({ user, isAuthenticated: true, isLoading: false });
        } else {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { user, error } = await AuthService.login(data);
      
      if (user && !error) {
        setAuthState({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem('currentUserId', user.id.toString());
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return { success: false, error: error || 'Login failed' };
      }
    } catch (error) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    AuthService.logout();
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { user, error } = await AuthService.register(data);
      
      if (user && !error) {
        setAuthState({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem('currentUserId', user.id.toString());
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return { success: false, error: error || 'Registration failed' };
      }
    } catch (error) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: 'Registration failed' };
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setAuthState(prev => {
      if (prev.user) {
        const updatedUser = { ...prev.user, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return { ...prev, user: updatedUser };
      }
      return prev;
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};