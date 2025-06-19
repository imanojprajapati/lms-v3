'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'sub-admin' | 'manager' | 'staff' | 'customer-support';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  hasPermission: (requiredPermissions: string[]) => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Define role permissions
const ROLE_PERMISSIONS = {
  admin: ['dashboard', 'leads', 'add-leads', 'pipeline', 'followup', 'search', 'settings', 'user-management'],
  'sub-admin': ['dashboard', 'leads', 'add-leads', 'pipeline', 'followup', 'search', 'settings', 'user-management'],
  manager: ['dashboard', 'leads', 'add-leads', 'pipeline', 'followup', 'search'],
  staff: ['leads', 'add-leads', 'pipeline', 'followup', 'search'],
  'customer-support': ['pipeline', 'followup', 'search']
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If unauthorized and not on public routes, redirect to login
          const currentPath = window.location.pathname;
          const publicRoutes = ['/login', '/setup'];
          
          if (!publicRoutes.includes(currentPath)) {
            window.location.href = '/login';
            return;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On auth error, redirect to login if not on public routes
        const currentPath = window.location.pathname;
        const publicRoutes = ['/login', '/setup'];
        
        if (!publicRoutes.includes(currentPath)) {
          window.location.href = '/login';
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const hasPermission = (requiredPermissions: string[]): boolean => {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isLoading,
      hasPermission,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { ROLE_PERMISSIONS }; 