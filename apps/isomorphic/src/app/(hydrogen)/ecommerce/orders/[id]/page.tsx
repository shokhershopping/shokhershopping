import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import OrderView from '@/app/shared/ecommerce/order/order-view';
import PrintInvoiceButton from '@/app/shared/ecommerce/order/print-invoice-button';
import PrintStickerButton from '@/app/shared/ecommerce/order/print-sticker-button';
import { getOrderById } from 'firebase-config/services/order.service';
import { getProductById } from 'firebase-config/services/product.service';

export const dynamic = 'force-dynamic';

async function enrichOrderItemsWithSku(orderData: any) {
  if (!orderData?.items) return orderData;
  const enrichedItems = await Promise.all(
    orderData.items.map(async (item: any) => {
      if (!item.productSku && item.productId) {
        try {
          const productResult = await getProductById(item.productId);
          if (productResult.status === 'success' && productResult.data) {
            const product = productResult.data as any;
            let sku = product.sku || null;
            if (item.variantId && product.variableProducts) {
              const variant = product.variableProducts.find((v: any) => v.id === item.variantId);
              if (variant?.sku) sku = variant.sku;
            }
            return { ...item, productSku: sku };
          }
        } catch {
          // ignore enrichment errors
        }
      }
      return item;
    })
  );
  return { ...orderData, items: enrichedItems };
}

export default async function OrderDetailsPage({ params }: any) {
  const id = (await params).id;

  let order = null;

  try {
    const result = await getOrderById(id);
    if (result.status === 'success' && result.data) {
      const enrichedData = await enrichOrderItemsWithSku(result.data);
      order = JSON.parse(JSON.stringify(enrichedData));
    }
  } catch {
    // Continue without order data
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
              <PrintStickerButton order={order} />
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
