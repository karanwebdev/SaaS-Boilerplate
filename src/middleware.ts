import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
]);

export default clerkMiddleware(
  (auth, req: NextRequest) => {
    if (isProtectedRoute(req)) auth().protect();
    if (
      auth().userId &&
      !auth().orgId &&
      !req.nextUrl.pathname.endsWith('/onboarding/organization-selection')
    ) {
      const organizationSelection = new URL(
        '/onboarding/organization-selection',
        req.url,
      );

      return NextResponse.redirect(organizationSelection);
    }
    return intlMiddleware(req);
  },
  {
    debug: process.env.NODE_ENV === 'development',
  },
);

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
