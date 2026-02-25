import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Coming Soon Configuration
// Temporarily disabled to review new landing page design
const COMING_SOON_ENABLED = false; // process.env.COMING_SOON_ENABLED === "true";
const PREVIEW_COOKIE = "dealer_os_preview";

// Paths that should always be accessible (even without preview cookie)
const PUBLIC_PATHS = [
  "/coming-soon",
  "/api/",
  "/_next",
  "/images",
  "/favicon",
  "/auth/",
  "/embed/",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isApiOrStaticPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || 
         pathname.startsWith("/_next") || 
         pathname.startsWith("/auth/") ||
         pathname.startsWith("/embed/");
}

function isComingSoonPath(pathname: string): boolean {
  // Check for both /coming-soon and /de/coming-soon, /en/coming-soon, etc.
  return pathname === "/coming-soon" || /^\/[a-z]{2}\/coming-soon/.test(pathname);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip ALL middleware for API routes and static files - don't add locale prefix
  if (isApiOrStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Skip Coming Soon check for public paths but still apply i18n
  if (isPublicPath(pathname)) {
    return intlMiddleware(request);
  }

  // Coming Soon logic
  if (COMING_SOON_ENABLED) {
    const hasPreviewAccess = request.cookies.get(PREVIEW_COOKIE)?.value === "true";

    // If no preview access and not already on coming-soon page, redirect
    if (!hasPreviewAccess && !isComingSoonPath(pathname)) {
      const locale = pathname.split("/")[1];
      const validLocales = ["de", "en", "fr", "it"];
      const targetLocale = validLocales.includes(locale) ? locale : "de";
      
      const comingSoonUrl = new URL(`/${targetLocale}/coming-soon`, request.url);
      return NextResponse.redirect(comingSoonUrl);
    }

    // If has preview access and trying to access coming-soon, redirect to home
    if (hasPreviewAccess && isComingSoonPath(pathname)) {
      const locale = pathname.split("/")[1];
      const validLocales = ["de", "en", "fr", "it"];
      const targetLocale = validLocales.includes(locale) ? locale : "de";
      
      const homeUrl = new URL(`/${targetLocale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
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
