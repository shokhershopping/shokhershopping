'use client';

import Image from 'next/image';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@core/ui/datepicker';
import PencilIcon from '@core/components/icons/pencil';
import { Text, Title, Select, ActionIcon } from 'rizzui';
import cn from '@core/utils/class-names';

interface CustomerInfoProps {
  className?: string;
  order?: any; // Define the type of order if available
}

export default function CustomerInfo({ className, order }: CustomerInfoProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div
      className={cn(
        'pb-7 pt-10 @container @5xl:col-span-4 @5xl:py-0 @6xl:col-span-3',
        className
      )}
    >
      <div className="rounded-xl border border-gray-300 p-5 @sm:p-6 @md:p-7">
        <div className="relative border-b border-gray-300 pb-7">
          <Title as="h6" className="mb-6">
            Customer Info
          </Title>
          {/* <ActionIcon
            className="absolute -top-1.5 end-0 z-10 text-gray-600 dark:text-gray-800"
            rounded="full"
            variant="flat"
            size="sm"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </ActionIcon> */}
          <div className="flex">
            <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-full @5xl:h-20 @5xl:w-20">
              <Image
                fill
                src={
                  order?.user?.image ||
                  'https://isomorphic-furyroad.s3.amazonaws.com/public/avatar.png'
                }
                alt="avatar"
                sizes="(max-width: 768px) 100vw"
                className="object-cover"
              />
            </div>
            <div className="ps-4 @5xl:ps-6">
              <Title as="h6" className="mb-2.5 font-semibold">
                {order?.billingAddress?.firstName}{' '}
                {order?.billingAddress?.lastName}
              </Title>
              <Text as="p" className="mb-2 break-all last:mb-0">
                {order?.user?.email}
              </Text>
              <Text as="p" className="mb-2 last:mb-0">
                {order?.billingAddress?.phoneNumber}
              </Text>
            </div>
          </div>
        </div>
        <div className="relative mb-7 border-b border-gray-300 py-7">
          <Title as="h6">Order Details</Title>
          {/* <ActionIcon
            className="absolute end-0 top-5 z-10 text-gray-600 dark:text-gray-800"
            rounded="full"
            variant="flat"
            size="sm"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </ActionIcon> */}
          <Text
            as="p"
            className="mt-3 flex flex-col font-semibold text-gray-700"
          >
            <span className="mb-2 font-normal">Order ID</span> {order?.id}
          </Text>
          <hr className="my-6" />
          <div className="mt-3 flex flex-col font-semibold text-gray-700">
            <span className="mb-2 font-normal">Items</span>
            {order?.items?.map((item: any) => (
              <p key={item.id} className="flex justify-between text-gray-600">
                <span>{item.product?.name || item.variableProduct?.name}</span>
                <span> x {item.quantity}</span>
              </p>
            ))}
          </div>
          <hr className="my-6" />

          <Text
            as="p"
            className="mt-2 flex justify-between font-semibold text-gray-700"
          >
            <span className="mb-1 font-normal">Total</span>
            <span>৳{order?.total}</span>
          </Text>
          <Text
            as="p"
            className="mt-2 flex justify-between font-semibold text-gray-700"
          >
            <span className="mb-1 font-normal">Discount</span>
            <span>৳{order?.itemsTotalDiscount}</span>
          </Text>
          <hr className="my-6" />
          <Text
            as="p"
            className="mt-2 flex justify-between font-semibold text-gray-700"
          >
            <span className="mb-1 font-normal">SubTotal</span>
            <span>৳{order?.totalWithDiscount}</span>
          </Text>
          <Text
            as="p"
            className="mt-2 flex justify-between font-semibold text-gray-700"
          >
            <span className="mb-1 font-normal">Delivery Charge</span>
            <span>৳{order?.deliveryCharge}</span>
          </Text>
          <hr className="my-6" />
          <Text
            as="p"
            className="mt-2 flex justify-between font-semibold text-gray-700"
          >
            <span className="mb-1 font-normal">Net Total</span>
            <span>৳{order?.netTotal}</span>
          </Text>
        </div>
        <div className="space-y-4 @lg:space-y-5 @2xl:space-y-6">
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                dropdownClassName="!z-0"
                options={paymentOptions}
                value={value}
                onChange={onChange}
                label="Payment Method"
                error={errors?.paymentMethod?.message as string}
                getOptionValue={(option) => option.label}
              />
            )}
          />
          <Controller
            name="orderStatus"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                dropdownClassName="!z-0"
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'PROCESSING', label: 'Processing' },
                  { value: 'DISPATCHED', label: 'Dispatched' },
                  { value: 'DELIVERED', label: 'Delivered' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={value}
                onChange={onChange}
                label="Order Status"
                error={errors?.orderStatus?.message as string}
                getOptionValue={(option) => option.value}
                displayValue={(selected) =>
                  selected
                    ? [
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'PROCESSING', label: 'Processing' },
                        { value: 'DISPATCHED', label: 'Dispatched' },
                        { value: 'DELIVERED', label: 'Delivered' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                      ].find((opt) => opt.value === selected)?.label || ''
                    : ''
                }
              />
            )}
          />
          {/* <Controller
            name="shippingMethod"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                dropdownClassName="!z-0"
                options={shippingOption}
                value={value}
                onChange={onChange}
                label="Shipping Method"
                error={errors?.shippingMethod?.message as string}
                getOptionValue={(option) => option.label}
              />
            )}
          /> */}
          {/* <Controller
            name="orderDate"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <DatePicker
                inputProps={{ label: 'Order date' }}
                placeholderText="Select Date"
                dateFormat="dd/MM/yyyy"
                onChange={onChange}
                onBlur={onBlur}
                wrapperClassName="w-full"
                //@ts-ignore
                selected={value}
              />
            )}
          /> */}
        </div>
      </div>
    </div>
  );
}

// Payment method option
const paymentOptions = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
  },
  // {
  //   value: 'paypal',
  //   label: 'PayPal',
  // },
  // {
  //   value: 'skrill',
  //   label: 'Skrill',
  // },
  // {
  //   value: 'visa',
  //   label: 'Visa',
  // },
  // {
  //   value: 'mastercard',
  //   label: 'Mastercard',
  // },
];

// shipping option
const shippingOption = [
  {
    value: 'ups',
    label: 'UPS',
  },
  {
    value: 'usps',
    label: 'USPS',
  },
  {
    value: 'fedex',
    label: 'FedEx',
  },
];
