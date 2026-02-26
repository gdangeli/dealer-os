import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function isApiOrStaticPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || 
         pathname.startsWith("/_next") || 
         pathname.startsWith("/auth/") ||
         pathname.startsWith("/embed/");
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip ALL middleware for API routes and static files - don't add locale prefix
  if (isApiOrStaticPath(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - Static files (/_next, /images, etc.)
  // - Favicon and other root files
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
