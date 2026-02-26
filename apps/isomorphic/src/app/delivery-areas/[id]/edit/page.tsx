import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import CreateDeliveryArea from '@/app/shared/ecommerce/delivery-area/create-delivery-area';

export const metadata = {
  ...metaObject('Edit Delivery Area'),
};

const pageHeader = {
  title: 'Edit Delivery Area',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      href: routes.eCommerce.deliveryAreas,
      name: 'Delivery Areas',
    },
    {
      name: 'Edit',
    },
  ],
};

export default async function EditDeliveryAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateDeliveryArea deliveryAreaId={id} />
    </>
  );
}
