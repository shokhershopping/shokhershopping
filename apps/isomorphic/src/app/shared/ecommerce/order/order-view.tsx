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
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Button, Badge } from 'rizzui';
import toast from 'react-hot-toast';
import { PiCopySimple, PiArrowsClockwise, PiPackage, PiTruck, PiMapPin, PiHouse, PiCheckCircle, PiXCircle, PiPause } from 'react-icons/pi';

const STEADFAST_STATUS_MAP: Record<string, { label: string; color: string }> = {
  in_review: { label: 'Placed with Courier', color: 'text-blue-600 bg-blue-50' },
  pending: { label: 'Pending Pickup', color: 'text-yellow-600 bg-yellow-50' },
  hold: { label: 'On Hold', color: 'text-orange-600 bg-orange-50' },
  delivered_approval_pending: { label: 'Delivered (Confirming)', color: 'text-green-600 bg-green-50' },
  partial_delivered_approval_pending: { label: 'Partially Delivered', color: 'text-yellow-600 bg-yellow-50' },
  cancelled_approval_pending: { label: 'Cancellation Pending', color: 'text-red-600 bg-red-50' },
  unknown_approval_pending: { label: 'Unknown (Pending)', color: 'text-gray-600 bg-gray-50' },
  delivered: { label: 'Delivered', color: 'text-green-700 bg-green-100' },
  partial_delivered: { label: 'Partially Delivered', color: 'text-yellow-700 bg-yellow-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700 bg-red-100' },
  unknown: { label: 'Unknown', color: 'text-gray-600 bg-gray-100' },
};

// Courier delivery journey steps
const courierJourneySteps = [
  { id: 1, label: 'Placed with Courier', icon: PiPackage, statuses: ['in_review'] },
  { id: 2, label: 'Picked Up', icon: PiTruck, statuses: ['pending'] },
  { id: 3, label: 'In Transit', icon: PiMapPin, statuses: ['hold'] },
  { id: 4, label: 'Out for Delivery', icon: PiTruck, statuses: ['delivered_approval_pending', 'partial_delivered_approval_pending'] },
  { id: 5, label: 'Delivered', icon: PiHouse, statuses: ['delivered', 'partial_delivered'] },
];

const getCourierStep = (status: string): number => {
  if (!status) return 0;
  if (['cancelled', 'cancelled_approval_pending'].includes(status)) return -1; // cancelled
  if (['unknown', 'unknown_approval_pending'].includes(status)) return 0;
  for (const step of courierJourneySteps) {
    if (step.statuses.includes(status)) return step.id;
  }
  return 1; // default to first step
};

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
  const [trackingStatus, setTrackingStatus] = useState(order?.steadfastStatus || '');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Silent fetch (no toast) for auto-refresh
  const silentRefresh = useCallback(async () => {
    if (!order?.id || !order?.steadfastConsignmentId) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`/api/orders/${order.id}/track`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'success' && data.data?.steadfastStatus) {
        setTrackingStatus(data.data.steadfastStatus);
      }
    } catch {
      // Silent fail for auto-refresh
    }
  }, [order?.id, order?.steadfastConsignmentId]);

  // Auto-refresh on page load + poll every 60s for active shipments
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!order?.steadfastConsignmentId) return;

    // Fetch latest status on mount
    silentRefresh();

    // Only poll if not in a final state
    const finalStatuses = ['delivered', 'cancelled', 'partial_delivered'];
    const currentSfStatus = order.steadfastStatus || '';
    if (!finalStatuses.includes(currentSfStatus)) {
      intervalRef.current = setInterval(silentRefresh, 60000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [order?.steadfastConsignmentId, order?.steadfastStatus, silentRefresh]);

  // Manual refresh with toast feedback
  const refreshTracking = useCallback(async () => {
    if (!order?.id) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/track`);
      const data = await res.json();
      if (data.status === 'success' && data.data?.steadfastStatus) {
        setTrackingStatus(data.data.steadfastStatus);
        toast.success('Tracking status updated');
      } else {
        toast.error(data.message || 'Failed to refresh tracking');
      }
    } catch {
      toast.error('Failed to refresh tracking');
    } finally {
      setIsRefreshing(false);
    }
  }, [order?.id]);

  const [isSendingToCourier, setIsSendingToCourier] = useState(false);
  const [courierTrackingCode, setCourierTrackingCode] = useState(order?.steadfastTrackingCode || '');
  const [courierConsignmentId, setCourierConsignmentId] = useState(order?.steadfastConsignmentId || '');

  const sendToCourier = useCallback(async () => {
    if (!order?.id) return;
    setIsSendingToCourier(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCourierTrackingCode(data.data?.trackingCode || '');
        setCourierConsignmentId(data.data?.consignmentId || '');
        setTrackingStatus(data.data?.steadfastStatus || 'in_review');
        toast.success(`Shipment created! Tracking: ${data.data?.trackingCode || ''}`);
      } else {
        toast.error(data.message || 'Failed to send to courier');
      }
    } catch {
      toast.error('Failed to send to courier');
    } finally {
      setIsSendingToCourier(false);
    }
  }, [order?.id]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

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

    return order.items.map((item: any) => {
      // Order items store denormalized product data directly
      const name = item.productName || 'Unknown Product';
      const price = item.productPrice || 0;
      const imageUrl =
        item.productImageUrl ||
        'https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp';

      return {
        id: item.id,
        name,
        image: imageUrl,
        price,
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

  // Get customer data from order fields
  const customer = {
    name: order?.userName || order?.billingAddress?.name || 'Customer',
    email: order?.userEmail || '',
    phone: order?.billingAddress?.phone || '',
  };

  // Get order date - handle Firestore Timestamp ({_seconds, _nanoseconds}) and string/number
  const orderDate = useMemo(() => {
    if (!order?.createdAt) return new Date();
    const ts = order.createdAt;
    if (ts._seconds) return new Date(ts._seconds * 1000);
    if (ts.seconds) return new Date(ts.seconds * 1000);
    const d = new Date(ts);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [order?.createdAt]);
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

          {order && (() => {
            const hasTracking = !!(courierTrackingCode || order.steadfastTrackingCode);
            const isDispatchedOrDelivered = ['DISPATCHED', 'DELIVERED'].includes(order.status);

            // Show "Send to Courier" button if dispatched but no tracking
            if (!hasTracking && isDispatchedOrDelivered) {
              return (
                <div className="">
                  <Title as="h3" className="mb-3.5 text-base font-semibold @5xl:mb-5 4xl:text-lg">
                    Courier Tracking
                  </Title>
                  <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50/50 px-5 py-6 text-center @5xl:rounded-xl">
                    <PiTruck className="mx-auto mb-3 h-10 w-10 text-orange-400" />
                    <Text className="mb-1 font-medium text-gray-700">No courier shipment yet</Text>
                    <Text className="mb-4 text-sm text-gray-500">
                      This order was dispatched without a Steadfast shipment.
                    </Text>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={sendToCourier}
                      disabled={isSendingToCourier}
                    >
                      <PiTruck className={cn('me-1.5 h-4 w-4', isSendingToCourier && 'animate-bounce')} />
                      {isSendingToCourier ? 'Creating Shipment...' : 'Send to Steadfast Courier'}
                    </Button>
                  </div>
                </div>
              );
            }

            if (!hasTracking) return null;

            const currentCourierStatus = trackingStatus || order.steadfastStatus || 'unknown';
            const courierStep = getCourierStep(currentCourierStatus);
            const isCancelled = courierStep === -1;
            const statusInfo = STEADFAST_STATUS_MAP[currentCourierStatus] || STEADFAST_STATUS_MAP.unknown;

            return (
              <div className="">
                <Title as="h3" className="mb-3.5 text-base font-semibold @5xl:mb-5 4xl:text-lg">
                  Courier Tracking
                </Title>
                <div className="rounded-lg border border-muted @5xl:rounded-xl">
                  {/* Status Badge Header */}
                  <div className="flex items-center justify-between border-b border-muted px-5 py-4">
                    <div className="flex items-center gap-2">
                      {isCancelled ? (
                        <PiXCircle className="h-5 w-5 text-red-500" />
                      ) : courierStep >= 5 ? (
                        <PiCheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <PiTruck className="h-5 w-5 text-primary" />
                      )}
                      <Text className="font-semibold">{statusInfo.label}</Text>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusInfo.color)}>
                      {isCancelled ? 'Cancelled' : courierStep >= 5 ? 'Complete' : 'In Progress'}
                    </span>
                  </div>

                  {/* Visual Journey Tracker */}
                  {!isCancelled ? (
                    <div className="px-5 py-6">
                      {/* Progress Bar */}
                      <div className="relative mb-2 flex items-center justify-between">
                        {/* Background line */}
                        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-100" />
                        {/* Active line */}
                        <div
                          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-700 ease-out"
                          style={{ width: `${Math.max(0, ((Math.min(courierStep, 5) - 1) / 4) * 100)}%` }}
                        />

                        {/* Step Icons */}
                        {courierJourneySteps.map((step) => {
                          const StepIcon = step.icon;
                          const isActive = courierStep >= step.id;
                          const isCurrent = courierStep === step.id;
                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                              <div
                                className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500',
                                  isActive
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-gray-200 bg-white text-gray-300',
                                  isCurrent && 'ring-4 ring-primary/20'
                                )}
                              >
                                {isCurrent && step.id !== 5 ? (
                                  <StepIcon className="h-5 w-5 animate-bounce" />
                                ) : (
                                  <StepIcon className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Step Labels */}
                      <div className="flex justify-between">
                        {courierJourneySteps.map((step) => {
                          const isActive = courierStep >= step.id;
                          return (
                            <Text
                              key={step.id}
                              className={cn(
                                'w-14 text-center text-[10px] leading-tight',
                                isActive ? 'font-medium text-gray-700' : 'text-gray-400'
                              )}
                            >
                              {step.label}
                            </Text>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-5 py-6 text-red-500">
                      <PiXCircle className="h-8 w-8" />
                      <Text className="font-medium text-red-500">Shipment Cancelled</Text>
                    </div>
                  )}

                  {/* Tracking Details */}
                  <div className="space-y-3 border-t border-muted px-5 py-4">
                    <div className="flex items-center justify-between">
                      <Text className="text-xs text-gray-500">Consignment ID</Text>
                      <Text className="text-sm font-medium">{courierConsignmentId || order.steadfastConsignmentId}</Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text className="text-xs text-gray-500">Tracking Code</Text>
                      <div className="flex items-center gap-1.5">
                        <Text className="text-sm font-medium">{courierTrackingCode || order.steadfastTrackingCode}</Text>
                        <button
                          onClick={() => copyToClipboard(courierTrackingCode || order.steadfastTrackingCode)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy tracking code"
                        >
                          <PiCopySimple className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text className="text-xs text-gray-500">Courier</Text>
                      <Text className="text-sm font-medium">Steadfast</Text>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="border-t border-muted px-5 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={refreshTracking}
                      disabled={isRefreshing}
                    >
                      <PiArrowsClockwise className={cn('me-1.5 h-4 w-4', isRefreshing && 'animate-spin')} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}

          <WidgetCard
            title="Customer Details"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white @5xl:h-20 @5xl:w-20 @5xl:text-2xl">
              {(customer.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="ps-4 @5xl:ps-6">
              <Title
                as="h3"
                className="mb-2.5 text-base font-semibold @7xl:text-lg"
              >
                {customer.name}
              </Title>
              {customer.email && (
                <Text as="p" className="mb-2 break-all last:mb-0">
                  {customer.email}
                </Text>
              )}
              {(customer.phone || billingAddress?.phone) && (
                <Text as="p" className="mb-2 last:mb-0">
                  {customer.phone || billingAddress?.phone}
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
