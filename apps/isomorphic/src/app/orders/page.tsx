import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
import OrdersTable from '@/app/shared/ecommerce/order/order-list/table';
import { PiPlusBold } from 'react-icons/pi';
import { orderData } from '@/data/order-data';
import { metaObject } from '@/config/site.config';
import ExportButton from '@/app/shared/export-button';
import toast from 'react-hot-toast';
import { getBaseUrl } from '@/lib/get-base-url';

export const metadata = {
  ...metaObject('Orders'),
};

const pageHeader = {
  title: 'Orders',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Dashboard',
    },
    {
      href: routes.eCommerce.orders,
      name: 'Orders',
    },
    {
      name: 'List',
    },
  ],
};

export default async function OrdersPage() {
  const orders = await fetch(
    `${getBaseUrl()}/api/orders?limit=1000000`,
    {
      cache: 'no-store',
    }
  );
  if (!orders.ok) {
    toast.error('Failed to fetch orders');
    throw new Error('Failed to fetch orders');
  }
  const data: any = await orders.json();
  console.log('Orders Data:', data);

  const rawOrders = Array.isArray(data?.data) ? data.data : [];
  const ordersData = rawOrders.map((order: any) => ({
    id: order.id,
    name: order.user?.name,
    email: order.user?.email,
    avatar: order.user?.image || 'https://placehold.co/600x400.png',
    items: order.items?.length ?? 0,
    price: order.netTotal,
    status: order.status,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '',
    products: (order.items || []).map((item: any) => {
      const product = item.product || item.variableProduct;
      return {
        id: product?.id,
        name: product?.name,
        image: product?.image || 'https://placehold.co/600x400.png',
        price: product?.salePrice,
        quantity: item.quantity,
      };
    }),
  }));
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportButton
            data={orderData}
            fileName="order_data"
            header="Order ID,Name,Email,Avatar,Items,Price,Status,Created At,Updated At"
          />
          {/* <Link
            href={routes.eCommerce.createOrder}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Add Order
            </Button>
          </Link> */}
        </div>
      </PageHeader>

      <OrdersTable data={ordersData} />
    </>
  );
}
