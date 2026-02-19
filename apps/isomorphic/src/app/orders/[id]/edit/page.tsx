import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import CreateOrder from '@/app/shared/ecommerce/order/create-order';
import { orderData } from '@/app/shared/ecommerce/order/order-form/form-utils';
import toast from 'react-hot-toast';
import { getBaseUrl } from '@/lib/get-base-url';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = (await params).id;

  return metaObject(`Edit ${id}`);
}

// TODO: Need added Order date default value

const pageHeader = {
  title: 'Edit Order',
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
      name: 'Edit',
    },
  ],
};

export default async function EditOrderPage({ params }: any) {
  const id = (await params).id;

  const orderResponse = await fetch(
    `${getBaseUrl()}/api/orders/${id}`,
    {
      cache: 'no-store',
    }
  );
  if (!orderResponse.ok) {
    toast.error('Failed to fetch order data');
    throw new Error('Failed to fetch order data');
  }
  const data: any = await orderResponse.json();
  let orderData = data.data;

  console.log('Raw order data from backend:', JSON.stringify(orderData, null, 2));

  // CRITICAL FIX: Handle legacy orders without billingAddress
  // If billingAddress is missing but shippingAddress exists, use shipping as billing
  if (!orderData?.billingAddress && orderData?.shippingAddress) {
    console.log('⚠️  Legacy order detected: No billingAddress, using shippingAddress');
    orderData = {
      ...orderData,
      billingAddress: orderData.shippingAddress,
    };
  }

  // Ensure we have at least a shipping address
  if (!orderData?.shippingAddress && !orderData?.billingAddress) {
    throw new Error('Order has no address information');
  }

  // Check if billing and shipping addresses are the same
  const hasSeparateBillingAddress =
    orderData?.billingAddress &&
    orderData?.shippingAddress &&
    orderData?.billingAddress?.id !== orderData?.shippingAddress?.id;

  // Extract address data with comprehensive fallbacks
  const billingAddressSource = orderData?.billingAddress || orderData?.shippingAddress;
  const shippingAddressSource = orderData?.shippingAddress || orderData?.billingAddress;

  // CRITICAL: Keep the original orderData intact while adding form fields
  // The CreateOrder component needs the full order object with address IDs
  const transformedOrderData = {
    ...orderData, // Keep ALL original order data including address objects with IDs

    // Add form-specific transformed fields
    formBillingAddress: {
      firstName:
        billingAddressSource?.name?.split(' ')[0] ||
        orderData?.user?.name?.split(' ')[0] ||
        '',
      lastName:
        billingAddressSource?.name?.split(' ')[1] ||
        orderData?.user?.name?.split(' ')[1] ||
        '',
      phoneNumber: billingAddressSource?.phone || '',
      country: billingAddressSource?.country || 'Bangladesh',
      state: billingAddressSource?.state || '',
      city: billingAddressSource?.city || '',
      zip: billingAddressSource?.zip || '',
      street: billingAddressSource?.address || '',
    },
    formShippingAddress: {
      firstName:
        shippingAddressSource?.name?.split(' ')[0] ||
        orderData?.user?.name?.split(' ')[0] ||
        '',
      lastName:
        shippingAddressSource?.name?.split(' ')[1] ||
        orderData?.user?.name?.split(' ')[1] ||
        '',
      phoneNumber: shippingAddressSource?.phone || '',
      country: shippingAddressSource?.country || 'Bangladesh',
      state: shippingAddressSource?.state || '',
      city: shippingAddressSource?.city || '',
      zip: shippingAddressSource?.zip || '',
      street: shippingAddressSource?.address || '',
    },
    sameShippingAddress: !hasSeparateBillingAddress,
    note: orderData?.note || '',
    paymentMethod: orderData?.paymentMethod || 'Cash on Delivery',
    orderStatus: orderData?.status || 'PENDING',
  };

  console.log('Transformed Order Data:', transformedOrderData);
  console.log('✅ Address Check:', {
    hasBillingAddress: !!transformedOrderData?.billingAddress,
    hasShippingAddress: !!transformedOrderData?.shippingAddress,
    billingAddressId: transformedOrderData?.billingAddress?.id,
    shippingAddressId: transformedOrderData?.shippingAddress?.id,
  });

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.orders}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <CreateOrder id={id} order={transformedOrderData} />
    </>
  );
}
