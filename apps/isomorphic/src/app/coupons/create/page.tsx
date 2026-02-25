import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import CreateCoupon from '@/app/shared/ecommerce/coupon/create-coupon';

export const metadata = {
  ...metaObject('Create Coupon'),
};

const pageHeader = {
  title: 'Create Coupon',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      href: routes.eCommerce.coupons,
      name: 'Coupons',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateCouponPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateCoupon />
    </>
  );
}
