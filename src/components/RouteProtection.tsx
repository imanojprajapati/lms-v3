'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

// Define which routes require which permissions
const ROUTE_PERMISSIONS = {
  '/dashboard': ['dashboard'],
  '/leads': ['leads'],
  '/add': ['add-leads'],
  '/pipeline': ['pipeline'],
  '/followup': ['followup'],
  '/search': ['search'],
  '/settings': ['settings'],
};

interface RouteProtectionProps {
  children: React.ReactNode;
}

export default function RouteProtection({ children }: RouteProtectionProps) {
  const { user, isLoading, hasPermission } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    // If user is not logged in, redirect to login
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Check if current route has permission requirements
    const requiredPermissions = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS];
    
    if (requiredPermissions && !hasPermission(requiredPermissions)) {
      // User doesn't have permission, redirect to dashboard or show error
      router.push('/dashboard');
      return;
    }

    setIsChecking(false);
  }, [user, isLoading, pathname, router, hasPermission]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 