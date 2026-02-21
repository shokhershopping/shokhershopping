'use client';

import { useIsMounted } from '@core/hooks/use-is-mounted';
import { usePathname } from 'next/navigation';
import HydrogenLayout from '@/layouts/hydrogen/layout';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

type LayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
  return <LayoutProvider>{children}</LayoutProvider>;
}

function LayoutProvider({ children }: LayoutProps) {
  const isMounted = useIsMounted();
  const pathname = usePathname();

  if (!isMounted) {
    return null;
  }

  // Auth pages render without the admin layout or guard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <HydrogenLayout>{children}</HydrogenLayout>
    </AdminAuthGuard>
  );
}
