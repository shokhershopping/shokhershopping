'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { Button, Text, Title, Loader } from 'rizzui';
import { PiWarningCircleBold } from 'react-icons/pi';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up'];

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isLoaded, user, signOut } = useFirebaseAuth();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    async function checkAdminRole() {
      if (!isLoaded || !user) {
        return;
      }

      try {
        const response = await fetch(`/api/users/${user.uid}`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data?.data?.role === 'ADMIN');
        } else {
          console.error('Failed to fetch user role:', response.status);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminRole();
  }, [isLoaded, user, isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader variant="spinner" size="xl" />
          <Text className="mt-4 text-gray-600">Verifying access...</Text>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-100">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <PiWarningCircleBold className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <Title as="h2" className="mb-3 text-center text-2xl font-bold">
            Access Denied
          </Title>

          <Text className="mb-8 text-center text-gray-600">
            You are not authorized to access the admin panel. Only
            administrators can access this area.
          </Text>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => signOut()}
              color="danger"
            >
              Sign Out
            </Button>

            <Text className="text-center text-sm text-gray-500">
              Please contact an administrator if you believe this is an error.
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
