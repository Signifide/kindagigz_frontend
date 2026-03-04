'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';
import type { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check if localStorage thinks we are logged in
    const storedUser = authService.getUser();
    
    if (storedUser) {
      try {
        // Verify session with the Backend
        const freshUser = await authService.getCurrentUser(); 
        setUser(freshUser);
        // Update localStorage with freshest data
        authService.setUser(freshUser); 
      } catch (error) {
        // If fails (401 Unauthorized), the cookie is gone/invalid
        console.error('Session invalid, logging out');
        authService.clearUser();
        setUser(null);
      }
    }
    setIsLoading(false);
  };

    initAuth();
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && authService.isAuthenticated(),
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}