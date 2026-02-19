'use client';

import {
  useForm,
  useWatch,
  FormProvider,
  type SubmitHandler,
} from 'react-hook-form';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import toast from 'react-hot-toast';
import isEmpty from 'lodash/isEmpty';
import { zodResolver } from '@hookform/resolvers/zod';
import DifferentBillingAddress from '@/app/shared/ecommerce/order/order-form/different-billing-address';
import { defaultValues } from '@/app/shared/ecommerce/order/order-form/form-utils';
import CustomerInfo from '@/app/shared/ecommerce/order/order-form/customer-info';
import AddressInfo from '@/app/shared/ecommerce/order/order-form/address-info';
import { Button, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import OrderSummery from '@/app/shared/ecommerce/checkout/order-summery';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
import OrderNote from '@/app/shared/ecommerce/checkout/order-note';
import {
  billingAddressAtom,
  orderNoteAtom,
  shippingAddressAtom,
} from '@/store/checkout';
import {
  CreateOrderInput,
  orderFormSchema,
} from '@/validators/create-order.schema';

// main order form component for create and update order
export default function CreateOrder({
  id,
  order,
  className,
}: {
  id?: string;
  className?: string;
  order?: any;
}) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const setOrderNote = useSetAtom(orderNoteAtom);
  const setBillingAddress = useSetAtom(billingAddressAtom);
  const setShippingAddress = useSetAtom(shippingAddressAtom);

  const methods = useForm({
    defaultValues: defaultValues(order),
    resolver: zodResolver(orderFormSchema),
  });

  const onSubmit: SubmitHandler<CreateOrderInput> = async (data) => {
    // console.log('data', data);

    if (!id) {
      // For creating new orders, use the existing atom-based flow
      if (sameShippingAddress) {
        setBillingAddress(data.billingAddress);
        setShippingAddress(data.billingAddress);
      } else {
        if (!isEmpty(data.shippingAddress)) {
          setShippingAddress(data.shippingAddress);
        }
      }
      setOrderNote(data?.note as string);

      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        console.log('createOrder data ->', data);
        router.push(routes.eCommerce.orderDetails(DUMMY_ID));
        toast.success(<Text as="b">Order placed successfully!</Text>);
      }, 600);
      return;
    }

    // For updating orders, make API call
    setLoading(true);

    try {
      console.log('Order object received:', {
        billingAddress: order?.billingAddress,
        shippingAddress: order?.shippingAddress,
        fullOrder: order,
      });

      // CRITICAL: Validate that we have address IDs
      // For legacy orders, we should have at least one address (they're populated in the edit page)
      const billingAddressId = order?.billingAddress?.id || order?.shippingAddress?.id;
      const shippingAddressId = order?.shippingAddress?.id || order?.billingAddress?.id;

      if (!billingAddressId || !shippingAddressId) {
        console.error('❌ Missing address IDs - Full Debug Info:', {
          billingAddressId,
          shippingAddressId,
          orderBillingAddress: order?.billingAddress,
          orderShippingAddress: order?.shippingAddress,
          orderKeys: Object.keys(order || {}),
          formData: data,
        });

        // This should never happen if the edit page transformation worked
        throw new Error(
          'Critical Error: Address IDs are missing from the order object. ' +
          'Please refresh the page and try again. If the problem persists, contact support.'
        );
      }

      console.log('✅ Address IDs validated:', {
        billingAddressId,
        shippingAddressId,
      });

      // Prepare billing address data
      const billingAddressData = {
        id: billingAddressId,
        userId: order?.userId,
        name: `${data.billingAddress.firstName} ${data.billingAddress.lastName}`,
        address: data.billingAddress.street,
        city: data.billingAddress.city,
        state: data.billingAddress.state,
        country: data.billingAddress.country,
        zip: data.billingAddress.zip,
        phone: data.billingAddress.phoneNumber,
        isPrimary: false,
      };

      // Prepare shipping address data
      let shippingAddressData;
      if (sameShippingAddress) {
        // When same as billing, use the same address ID and data
        shippingAddressData = {
          id: shippingAddressId,
          userId: order?.userId,
          name: `${data.billingAddress.firstName} ${data.billingAddress.lastName}`,
          address: data.billingAddress.street,
          city: data.billingAddress.city,
          state: data.billingAddress.state,
          country: data.billingAddress.country,
          zip: data.billingAddress.zip,
          phone: data.billingAddress.phoneNumber,
          isPrimary: false,
        };
      } else {
        shippingAddressData = {
          id: shippingAddressId,
          userId: order?.userId,
          name: `${data.shippingAddress?.firstName} ${data.shippingAddress?.lastName}`,
          address: data.shippingAddress?.street,
          city: data.shippingAddress?.city,
          state: data.shippingAddress?.state,
          country: data.shippingAddress?.country,
          zip: data.shippingAddress?.zip,
          phone: data.shippingAddress?.phoneNumber,
          isPrimary: false,
        };
      }

      // Prepare order data
      const orderUpdateData = {
        order: {
          userId: order?.userId,
          status: data.orderStatus,
          deliveryCharge: order?.deliveryCharge,
          deliveryOption: order?.deliveryOption,
          couponId: order?.couponId || undefined,
        },
        billingAddress: billingAddressData,
        shippingAddress: shippingAddressData,
      };

      console.log('Sending order update:', orderUpdateData);

      const response = await fetch(
        `/api/orders/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderUpdateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);

        // Show validation errors if available
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(', ');
          throw new Error(errorMessages);
        }

        throw new Error(errorData.message || 'Failed to update order');
      }

      const result = await response.json();
      console.log('Order updated:', result);

      toast.success(<Text as="b">Order updated successfully!</Text>);
      router.push(routes.eCommerce.orderDetails(id));
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(
        <Text as="b">{error.message || 'Failed to update order. Please try again.'}</Text>
      );
    } finally {
      setLoading(false);
    }
  };

  const sameShippingAddress = useWatch({
    control: methods.control,
    name: 'sameShippingAddress',
  });

  return (
    <FormProvider {...methods}>
      <form
        // @ts-ignore
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn(
          'isomorphic-form flex flex-grow flex-col @container [&_label.block>span]:font-medium',
          className
        )}
      >
        <div className="items-start @5xl:grid @5xl:grid-cols-12 @5xl:gap-7 @6xl:grid-cols-10 @7xl:gap-10">
          <div className="flex-grow @5xl:col-span-8 @5xl:pb-10 @6xl:col-span-7">
            <div className="flex flex-col gap-4 @xs:gap-7 @5xl:gap-9">
              <AddressInfo type="billingAddress" title="Billing Information" />

              <DifferentBillingAddress />

              {!sameShippingAddress && <AddressInfo type="shippingAddress" />}

              <OrderNote />
            </div>
          </div>

          <div className="pb-7 pt-10 @container @5xl:col-span-4 @5xl:py-0 @6xl:col-span-3">
            <CustomerInfo order={order} />
            {/* <OrderSummery isLoading={isLoading} className="static" /> */}
          </div>
        </div>
        <Button type="submit" isLoading={isLoading}>
          {id ? 'Update Order' : 'Create Order'}
        </Button>
      </form>
    </FormProvider>
  );
}
