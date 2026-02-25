import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import CreateCoupon from '@/app/shared/ecommerce/coupon/create-coupon';

export const metadata = {
  ...metaObject('Edit Coupon'),
};

const pageHeader = {
  title: 'Edit Coupon',
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
      name: 'Edit',
    },
  ],
};

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateCoupon couponId={id} />
    </>
  );
}
