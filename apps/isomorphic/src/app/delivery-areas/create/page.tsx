import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import CreateDeliveryArea from '@/app/shared/ecommerce/delivery-area/create-delivery-area';

export const metadata = {
  ...metaObject('Create Delivery Area'),
};

const pageHeader = {
  title: 'Create Delivery Area',
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
      name: 'Create',
    },
  ],
};

export default function CreateDeliveryAreaPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateDeliveryArea />
    </>
  );
}
