'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from './types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getRoleDashboardPath: (role?: Role) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getRoleDashboardPath(role?: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'RECEPTIONIST':
      return '/receptionist/dashboard';
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'DOCTOR_ASSISTANT':
      return '/doctor-assistant/dashboard';
    default:
      return '/login';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('hms_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const currentUser = await api.get<User>('/auth/me');
      setUser(currentUser);
      localStorage.setItem('hms_user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to load user session:', error);
      api.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to load cached user instantly to avoid UI flicker
    const cachedUser = localStorage.getItem('hms_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        // ignore
      }
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (emailOrUsername: string, password: string): Promise<User> => {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
      emailOrUsername,
      password,
    });

    api.setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('hms_user', JSON.stringify(res.user));

    const destination = getRoleDashboardPath(res.user.role);
    router.push(destination);
    return res.user;
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshUser,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

