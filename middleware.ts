import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/setup'];

// Define routes that should redirect to setup if no users exist
const protectedRoutes = ['/dashboard', '/leads', '/add', '/pipeline', '/followup', '/search', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/api/setup') ||
      pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/auth/logout')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user has auth token
  const token = request.cookies.get('auth-token')?.value;

  // If no token and accessing protected route, redirect
  if (!token && (protectedRoutes.includes(pathname) || pathname.startsWith('/api/'))) {
    // For API routes (except auth), return 401
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For pages, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token if present
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return NextResponse.next();
    } catch (error) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('auth-token', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 