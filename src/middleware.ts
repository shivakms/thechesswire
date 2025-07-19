import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/dashboard/admin/users',
  '/dashboard/admin/monitoring',
  '/dashboard/admin/database',
  '/dashboard/admin/security',
  '/dashboard/admin/moderation',
  '/dashboard/admin/revenue',
  '/dashboard/admin/api',
  '/dashboard/admin/deployment',
  '/dashboard/admin/backup',
  '/dashboard/admin/logs',
  '/dashboard/admin/performance',
  '/dashboard/admin/crisis'
];

// Protected routes that require any authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/memory-archive',
  '/dashboard/personalization',
  '/dashboard/social-media',
  '/dashboard/soulcinema',
  '/dashboard/earnings'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if it's an admin route
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // If no token and trying to access protected route, redirect to login
  if (!token && (isAdminRoute || isProtectedRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it (basic check)
  if (token) {
    try {
      // Basic JWT structure check (without verification for performance)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // Check if token is expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          // Token expired, redirect to login
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          loginUrl.searchParams.set('expired', 'true');
          return NextResponse.redirect(loginUrl);
        }

        // For admin routes, check if user has admin role
        if (isAdminRoute) {
          const userRole = payload.role;
          const isAdmin = userRole === 'admin' || userRole === 'super_admin';
          
          if (!isAdmin) {
            // User doesn't have admin access, redirect to access denied
            return NextResponse.redirect(new URL('/access-denied', request.url));
          }
        }
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('invalid', 'true');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 