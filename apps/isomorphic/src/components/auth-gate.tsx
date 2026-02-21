'use client';

import { useEffect } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Loader } from 'rizzui';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up'];

/**
 * Replaces Clerk's SignedIn/SignedOut components.
 * Shows children when authenticated or on public routes.
 * Redirects to sign-in if not authenticated on protected routes.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useFirebaseAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn, isPublicRoute, router]);

  // Always show public routes (sign-in, sign-up) regardless of auth state
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  return <>{children}</>;
}
