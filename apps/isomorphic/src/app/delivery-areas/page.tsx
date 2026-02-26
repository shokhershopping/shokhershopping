import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold } from 'react-icons/pi';
import { metaObject } from '@/config/site.config';
import WidgetCard from '@core/components/cards/widget-card';
import DeliveryAreaTable from '@/app/shared/ecommerce/delivery-area/delivery-area-list/table';

export const metadata = {
  ...metaObject('Delivery Areas'),
};

const pageHeader = {
  title: 'Delivery Areas',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      name: 'Delivery Areas',
    },
  ],
};

export default function DeliveryAreasPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <Link href={routes.eCommerce.createDeliveryArea} className="w-full @lg:w-auto">
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Add Delivery Area
            </Button>
          </Link>
        </div>
      </PageHeader>

      <WidgetCard
        title="Delivery Areas"
        className="p-0 lg:p-0"
        headerClassName="mb-4 px-5 pt-5 lg:px-7 lg:pt-7"
      >
        <DeliveryAreaTable />
      </WidgetCard>
    </>
  );
}
