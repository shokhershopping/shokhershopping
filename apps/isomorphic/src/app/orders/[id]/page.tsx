import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import OrderView from '@/app/shared/ecommerce/order/order-view';
import PrintInvoiceButton from '@/app/shared/ecommerce/order/print-invoice-button';

export default async function OrderDetailsPage({ params }: any) {
  const id = (await params).id;

  // Get API URL with fallback
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  let order = null;

  try {
    // Fetch order data from API
    const orderResponse = await fetch(`${apiUrl}/orders/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (orderResponse.ok) {
      const orderData: any = await orderResponse.json();
      order = orderData.data;
    } else {
      console.error('Failed to fetch order:', orderResponse.status);
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    // Continue without order data - will fall back to cart state
  }

  const pageHeader = {
    title: `Order #${id.slice(0, 8)}`,
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.orders,
        name: 'Orders',
      },
      {
        name: id.slice(0, 8),
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {order && (
            <>
              <PrintInvoiceButton order={order} variant="admin" />
              <PrintInvoiceButton order={order} variant="customer" />
            </>
          )}
          <Link href={routes.eCommerce.editOrder(id)}>
            <Button as="span" className="w-full @lg:w-auto">
              Edit Order
            </Button>
          </Link>
        </div>
      </PageHeader>
      <OrderView order={order} />
    </>
  );
}
