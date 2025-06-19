'use client';

import { useUser } from '@/contexts/UserContext';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();

  // Define public routes that don't need authentication
  const publicRoutes = ['/login', '/setup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and not on public route, redirect to login
  if (!user && !isPublicRoute) {
    // Force a page redirect to login
    window.location.href = '/login';
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // For public routes, render without sidebar
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  // For authenticated users, render with sidebar
  return (
    <div className="flex min-h-screen relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-slate-100/50 dark:bg-slate-800/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      </div>
    
      <Sidebar />
      <main className="flex-1 overflow-auto transition-all duration-300 relative z-10 md:ml-64">
        <div className="container-responsive py-4 sm:py-6 md:py-8 pt-20 md:pt-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 