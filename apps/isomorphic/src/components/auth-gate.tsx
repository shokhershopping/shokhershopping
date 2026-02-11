'use client';

import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { Loader } from 'rizzui';

/**
 * Replaces Clerk's SignedIn/SignedOut components.
 * Shows children (with layout) when authenticated, redirects to sign-in when not.
 * The middleware handles the actual redirect — this handles the loading state.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useFirebaseAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  // If not signed in, the middleware will redirect to /sign-in.
  // This just shows the children (which on the sign-in page will be the form).
  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
