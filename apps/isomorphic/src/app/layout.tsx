import { Toaster } from 'react-hot-toast';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import { JotaiProvider, ThemeProvider } from '@/app/shared/theme-provider';
import { siteConfig } from '@/config/site.config';
import { inter, lexendDeca } from '@/app/fonts';
import cn from '@core/utils/class-names';
import NextProgress from '@core/components/next-progress';

// styles
import 'swiper/css';
import 'swiper/css/navigation';
import '@/app/globals.css';
import DefaultLayout from '@/components/Layout';
import { CartProvider } from '@/store/quick-cart/cart.context';
import { FirebaseAuthProvider } from '@/lib/firebase-auth-provider';
import { AuthGate } from '@/components/auth-gate';

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      // required this one for next-themes, remove it if you are not using next-theme
      suppressHydrationWarning
    >
      <body
        // to prevent any warning that is caused by third party extensions like Grammarly
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
      >
        <FirebaseAuthProvider>
          <ThemeProvider>
            <NextProgress />
            <JotaiProvider>
              <CartProvider>
                <AuthGate>
                  <DefaultLayout>{children}</DefaultLayout>
                </AuthGate>
              </CartProvider>
              <Toaster />
              <GlobalDrawer />
              <GlobalModal />
            </JotaiProvider>
          </ThemeProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
