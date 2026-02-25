import { routes } from '@/config/routes';
import {
  PiChartBarDuotone,
  PiChartPieSliceDuotone,
  PiCurrencyDollarDuotone,
  PiShapesDuotone,
  PiShootingStarDuotone,
  PiShoppingCartDuotone,
  PiTagDuotone,
  PiBellDuotone,
  PiCircleHalfTilt,
  PiUserGearDuotone,
  PiImageDuotone,
  PiTextTDuotone,
} from 'react-icons/pi';
import type { UserRole } from '@/lib/firebase-auth-provider';

export interface MenuItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  roles?: UserRole[]; // Which roles can see this item. Undefined = everyone.
  dropdownItems?: {
    name: string;
    href: string;
    badge?: string;
  }[];
}

// Note: do not add href in the label object, it is rendering as label
export const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: routes.eCommerce.dashboard,
    icon: <PiChartBarDuotone />,
    badge: '',
  },
  {
    name: 'Products',
    href: '#',
    icon: <PiCircleHalfTilt />,
    dropdownItems: [
      {
        name: 'All Products',
        href: routes.eCommerce.products,
        badge: '',
      },
      {
        name: 'Create Product',
        href: routes.eCommerce.createProduct,
      },
    ],
  },
  {
    name: 'Categories',
    href: '#',
    icon: <PiShapesDuotone />,
    dropdownItems: [
      {
        name: 'Categories',
        href: routes.eCommerce.categories,
        badge: '',
      },
      {
        name: 'Create Category',
        href: routes.eCommerce.createCategory,
      },
    ],
  },
  {
    name: 'Orders',
    href: routes.eCommerce.orders,
    icon: <PiShoppingCartDuotone />,
  },
  {
    name: 'Transactions',
    href: routes.eCommerce.transactions,
    icon: <PiCurrencyDollarDuotone />,
    roles: ['ADMIN'],
  },
  {
    name: 'Affiliate',
    href: '#',
    icon: <PiChartPieSliceDuotone />,
    roles: ['ADMIN'],
    dropdownItems: [
      {
        name: 'Analytics',
        href: routes.eCommerce.analytics,
        badge: '',
      },
      {
        name: 'Affiliates List',
        href: routes.eCommerce.affiliates,
      },
    ],
  },
  {
    name: 'Notifications',
    href: routes.eCommerce.notifications,
    icon: <PiBellDuotone />,
    roles: ['ADMIN'],
  },
  {
    name: 'Coupons',
    href: routes.eCommerce.coupons,
    icon: <PiTagDuotone />,
    roles: ['ADMIN'],
  },
  {
    name: 'Reviews',
    href: routes.eCommerce.reviews,
    icon: <PiShootingStarDuotone />,
  },
  {
    name: 'Banners',
    href: '#',
    icon: <PiImageDuotone />,
    roles: ['ADMIN'],
    dropdownItems: [
      {
        name: 'Banner List',
        href: routes.eCommerce.banners,
      },
      {
        name: 'Create Banner',
        href: routes.eCommerce.createBanner,
      },
    ],
  },
  {
    name: 'Marquee',
    href: routes.eCommerce.marquee,
    icon: <PiTextTDuotone />,
    roles: ['ADMIN'],
  },
  // Admin management - only visible to admins
  {
    name: 'Admin',
    href: routes.eCommerce.admin,
    icon: <PiUserGearDuotone />,
    roles: ['ADMIN'],
  },
  {
    name: 'Store',
  },
  {
    name: 'Shop',
    href: routes.eCommerce.shop,
    icon: <PiShoppingCartDuotone />,
    roles: ['ADMIN'],
  },
];
