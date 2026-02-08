'use client';

import Image from 'next/image';
import { useAtomValue } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import { PiCheckBold } from 'react-icons/pi';
import {
  billingAddressAtom,
  orderNoteAtom,
  shippingAddressAtom,
} from '@/store/checkout';
import OrderViewProducts from '@/app/shared/ecommerce/order/order-products/order-view-products';
import { useCart } from '@/store/quick-cart/cart.context';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { toCurrency } from '@core/utils/to-currency';
import { formatDate } from '@core/utils/format-date';
import usePrice from '@core/hooks/use-price';
import { useMemo } from 'react';

const orderStatusSteps = [
  { id: 1, label: 'Order Pending', status: 'PENDING' },
  { id: 2, label: 'Order Processing', status: 'PROCESSING' },
  { id: 3, label: 'Order Dispatched', status: 'DISPATCHED' },
  { id: 4, label: 'Order Delivered', status: 'DELIVERED' },
];

// Map status to step number
const getOrderStatusStep = (status: string): number => {
  const statusMap: Record<string, number> = {
    PENDING: 1,
    PROCESSING: 2,
    DISPATCHED: 3,
    DELIVERED: 4,
    CANCELLED: 0,
  };
  return statusMap[status] || 1;
};

interface OrderViewProps {
  order?: any; // Order data from API (optional for backward compatibility)
}

function WidgetCard({
  title,
  className,
  children,
  childrenWrapperClass,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
  childrenWrapperClass?: string;
}) {
  return (
    <div className={className}>
      <Title
        as="h3"
        className="mb-3.5 text-base font-semibold @5xl:mb-5 4xl:text-lg"
      >
        {title}
      </Title>
      <div
        className={cn(
          'rounded-lg border border-muted px-5 @sm:px-7 @5xl:rounded-xl',
          childrenWrapperClass
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function OrderView({ order }: OrderViewProps) {
  // Get data from cart/atoms (for create order flow)
  const {
    items: cartItems,
    total: cartTotal,
    totalItems: cartTotalItems,
  } = useCart();
  const atomOrderNote = useAtomValue(orderNoteAtom);
  const atomBillingAddress = useAtomValue(billingAddressAtom);
  const atomShippingAddress = useAtomValue(shippingAddressAtom);

  // Transform order data if provided (for view order flow)
  const orderItems = useMemo(() => {
    if (!order?.items) return cartItems;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    return order.items.map((item: any) => {
      const product = item.product || item.variableProduct;
      const image = product?.images?.[0];

      // Construct image URL properly
      let imageUrl =
        'https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp'; // Default placeholder
      if (image?.path) {
        // Remove leading slash if present to avoid double slashes
        const imagePath = image.path.startsWith('/')
          ? image.path.slice(1)
          : image.path;
        imageUrl = `${apiUrl}/${imagePath}`;
      }

      return {
        id: item.id,
        name: product?.name || 'Unknown Product',
        image: imageUrl,
        price: product?.price || 0,
        quantity: item.quantity,
      };
    });
  }, [order, cartItems]);

  // Calculate totals
  const total = order ? order.total : cartTotal;
  const totalItems = order ? order.items?.length || 0 : cartTotalItems;
  const deliveryCharge = order?.deliveryCharge || 0;
  const itemsTotalDiscount = order?.itemsTotalDiscount || 0;
  const couponDiscount = order?.couponAppliedDiscount || 0;
  const netTotal = order?.netTotal || total;
  const subtotal = total; // Subtotal is the sum of all items (order.total)

  const { price: subtotalPrice } = usePrice({ amount: subtotal });
  const { price: totalPrice } = usePrice({ amount: netTotal });

  // Get note and addresses based on mode
  const orderNote = order?.note || atomOrderNote;
  const billingAddress = order?.billingAddress
    ? {
        customerName: order.billingAddress.name,
        street: order.billingAddress.address,
        city: order.billingAddress.city,
        state: order.billingAddress.state,
        zip: order.billingAddress.zip,
        country: order.billingAddress.country,
        phone: order.billingAddress.phone,
      }
    : atomBillingAddress;

  const shippingAddress =
    order?.shippingAddress &&
    order.shippingAddress.id !== order?.billingAddress?.id
      ? {
          customerName: order.shippingAddress.name,
          street: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zip: order.shippingAddress.zip,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone,
        }
      : atomShippingAddress;

  // Get current order status
  const currentOrderStatus = order ? getOrderStatusStep(order.status) : 3;

  // Get customer data
  const customer = order?.user || {
    name: 'Customer',
    email: '',
    image: 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatar.png',
  };

  // Get order date
  const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
  return (
    <div className="@container">
      <div className="flex flex-wrap justify-center border-b border-t border-gray-300 py-4 font-medium text-gray-700 @5xl:justify-start">
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          {formatDate(orderDate, 'MMMM D, YYYY')} at{' '}
          {formatDate(orderDate, 'h:mm A')}
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          {totalItems} Items
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          Total {totalPrice}
        </span>
        <span className="my-2 ms-5 rounded-3xl border-r border-muted bg-green-lighter px-2.5 py-1 text-xs text-green-dark first:ps-0 last:border-r-0">
          Cash on Delivery
        </span>
      </div>
      <div className="items-start pt-10 @5xl:grid @5xl:grid-cols-12 @5xl:gap-7 @6xl:grid-cols-10 @7xl:gap-10">
        <div className="space-y-7 @5xl:col-span-8 @5xl:space-y-10 @6xl:col-span-7">
          {orderNote && (
            <div className="">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes About Order
              </span>
              <div className="rounded-xl border border-muted px-5 py-3 text-sm leading-[1.85]">
                {orderNote}
              </div>
            </div>
          )}

          <div className="pb-5">
            <OrderViewProducts items={orderItems} />
            {/* <div className="border-t border-muted pt-7 @5xl:mt-3">
              <div className="ms-auto max-w-lg space-y-6">
                <div className="flex justify-between font-medium">
                  Subtotal <span>{subtotalPrice}</span>
                </div>
                {itemsTotalDiscount > 0 && (
                  <div className="flex justify-between font-medium">
                    Items Discount{' '}
                    <span>-{toCurrency(itemsTotalDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-medium">
                    Coupon Discount <span>-{toCurrency(couponDiscount)}</span>
                  </div>
                )}
                {deliveryCharge > 0 && (
                  <div className="flex justify-between font-medium">
                    Delivery Charge <span>{toCurrency(deliveryCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-muted pt-5 text-base font-semibold">
                  Total <span>{totalPrice}</span>
                </div>
              </div>
            </div> */}
          </div>

          {order?.transaction && (
            <div className="">
              <Title
                as="h3"
                className="mb-3.5 text-base font-semibold @5xl:mb-5 @7xl:text-lg"
              >
                Transaction
              </Title>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-100 px-5 py-5 font-medium shadow-sm transition-shadow @5xl:px-7">
                  <div className="flex w-1/3 items-center">
                    <div className="flex flex-col ps-4">
                      <Text as="span" className="font-lexend text-gray-700">
                        Payment
                      </Text>
                      <span className="pt-1 text-[13px] font-normal text-gray-500">
                        Via {order.transaction.paymentMethod || 'Cash'}
                      </span>
                    </div>
                  </div>

                  <div className="w-1/3 text-end">{totalPrice}</div>
                </div>
              </div>
            </div>
          )}

          {order && (
            <div className="">
              <div className="mb-3.5 @5xl:mb-5">
                <Title as="h3" className="text-base font-semibold @7xl:text-lg">
                  Order Summary
                </Title>
              </div>
              <div className="space-y-6 rounded-xl border border-muted px-5 py-6 @5xl:space-y-7 @5xl:p-7">
                <div className="flex justify-between font-medium">
                  Total <span>{toCurrency(order.total)}</span>
                </div>
                {itemsTotalDiscount > 0 && (
                  <div className="flex justify-between font-medium">
                    Discount <span>-{toCurrency(itemsTotalDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-medium">
                    Coupon <span>-{toCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  Delivery <span>{toCurrency(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between border-t border-muted pt-5 font-semibold">
                  Net Total <span>{toCurrency(order.netTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-7 pt-8 @container @5xl:col-span-4 @5xl:space-y-10 @5xl:pt-0 @6xl:col-span-3">
          <WidgetCard
            title="Order Status"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            <div className="ms-2 w-full space-y-7 border-s-2 border-gray-100">
              {orderStatusSteps.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative ps-6 text-sm font-medium before:absolute before:-start-[9px] before:top-px before:h-5 before:w-5 before:-translate-x-px before:rounded-full before:bg-gray-100 before:content-[''] after:absolute after:-start-px after:top-5 after:h-10 after:w-0.5 after:content-[''] last:after:hidden",
                    currentOrderStatus > item.id
                      ? 'before:bg-primary after:bg-primary'
                      : 'after:hidden',
                    currentOrderStatus === item.id && 'before:bg-primary'
                  )}
                >
                  {currentOrderStatus >= item.id ? (
                    <span className="absolute -start-1.5 top-1 text-white">
                      <PiCheckBold className="h-auto w-3" />
                    </span>
                  ) : null}

                  {item.label}
                </div>
              ))}
            </div>
          </WidgetCard>

          <WidgetCard
            title="Customer Details"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            <div className="relative aspect-square h-16 w-16 shrink-0 @5xl:h-20 @5xl:w-20">
              <Image
                fill
                alt="avatar"
                className="rounded-full object-cover"
                sizes="(max-width: 768px) 100vw"
                src={
                  customer.image ||
                  'https://isomorphic-furyroad.s3.amazonaws.com/public/avatar.png'
                }
              />
            </div>
            <div className="ps-4 @5xl:ps-6">
              <Title
                as="h3"
                className="mb-2.5 text-base font-semibold @7xl:text-lg"
              >
                {customer.name || 'Customer'}
              </Title>
              {customer.email && (
                <Text as="p" className="mb-2 break-all last:mb-0">
                  {customer.email}
                </Text>
              )}
              {billingAddress?.phone && (
                <Text as="p" className="mb-2 last:mb-0">
                  {billingAddress.phone}
                </Text>
              )}
            </div>
          </WidgetCard>

          <WidgetCard
            title="Shipping Address"
            childrenWrapperClass="@5xl:py-6 py-5"
          >
            <Title
              as="h3"
              className="mb-2.5 text-base font-semibold @7xl:text-lg"
            >
              {billingAddress?.customerName}
            </Title>
            <Text as="p" className="mb-2 leading-loose last:mb-0">
              {billingAddress?.street}, {billingAddress?.city},{' '}
              {billingAddress?.state}, {billingAddress?.zip},{' '}
              {billingAddress?.country}
            </Text>
          </WidgetCard>
          {!isEmpty(shippingAddress) && (
            <WidgetCard
              title="Billing Address"
              childrenWrapperClass="@5xl:py-6 py-5"
            >
              <Title
                as="h3"
                className="mb-2.5 text-base font-semibold @7xl:text-lg"
              >
                {shippingAddress?.customerName}
              </Title>
              <Text as="p" className="mb-2 leading-loose last:mb-0">
                {shippingAddress?.street}, {shippingAddress?.city},{' '}
                {shippingAddress?.state}, {shippingAddress?.zip},{' '}
                {shippingAddress?.country}
              </Text>
            </WidgetCard>
          )}
        </div>
      </div>
    </div>
  );
}
