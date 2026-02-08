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
  PiPercentDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
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
  },
  {
    name: 'Affiliate',
    href: '#',
    icon: <PiChartPieSliceDuotone />,
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
  },
  {
    name: 'Coupons',
    href: routes.eCommerce.coupons,
    icon: <PiTagDuotone />,
  },

  {
    name: 'Reviews',
    href: routes.eCommerce.reviews,
    icon: <PiShootingStarDuotone />,
  },
  {
    name: 'Store',
  },
  {
    name: 'Shop',
    href: routes.eCommerce.shop,
    icon: <PiShoppingCartDuotone />,
  },
];
