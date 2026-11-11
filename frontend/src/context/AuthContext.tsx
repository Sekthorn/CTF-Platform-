import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export type AdminUser = User;

interface AuthContextType {
  user: User | null;
  admin: User | null; // Backward-compatibility alias
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const payload = response.data?.data || response.data;
      if (payload && payload.id) {
        setUser(payload);
      } else {
        setUser(null);
        localStorage.removeItem('websec_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('websec_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (identifier: string, password: string, rememberMe: boolean = false): Promise<User> => {
    const response = await apiClient.post('/auth/login', {
      identifier,
      password,
      rememberMe,
    });

    const payload = response.data?.data || response.data;
    const userData = payload?.user || payload;
    const accessToken = payload?.accessToken;

    if (accessToken) {
      localStorage.setItem('websec_token', accessToken);
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API call failed:', e);
    } finally {
      localStorage.removeItem('websec_token');
      setUser(null);
    }
  };

  const updateUserProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin: user, // Backward-compatibility alias
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        logout,
        checkAuth,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
