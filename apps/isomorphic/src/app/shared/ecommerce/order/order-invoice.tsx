'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Badge, Title, Text } from 'rizzui';
import Table from '@core/components/legacy-table';
import { siteConfig } from '@/config/site.config';
import { formatDate } from '@core/utils/format-date';
import cn from '@core/utils/class-names';
import './order-invoice.css';

type InvoiceVariant = 'admin' | 'customer';

interface OrderInvoiceProps {
  order: any;
  variant?: InvoiceVariant;
  invoiceNumber?: string;
  className?: string;
}

const getOrderStatusColor = (status: string) => {
  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    DELIVERED: 'success',
    PROCESSING: 'warning',
    PENDING: 'info',
    DISPATCHED: 'info',
    CANCELLED: 'danger',
  };
  return statusColors[status] || 'info';
};

export default function OrderInvoice({
  order,
  variant = 'admin',
  invoiceNumber,
  className,
}: OrderInvoiceProps) {
  if (!order) return null;

  // Generate invoice number if not provided
  const invNumber = invoiceNumber || `INV-${order.id.slice(0, 8).toUpperCase()}`;

  // Prepare items for table
  const invoiceItems = order.items?.map((item: any, index: number) => {
    const product = item.product || item.variableProduct;
    const price = product?.salePrice || product?.price || 0;
    const total = price * item.quantity;

    return {
      id: String(index + 1),
      product: {
        name: product?.name || 'Unknown Product',
        variant: item.variableProduct ? item.variableProduct.name : null,
      },
      sku: item.variableProduct?.sku || item.product?.sku || 'N/A',
      quantity: item.quantity,
      unitPrice: price,
      total,
    };
  });

  // Table columns
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 40,
    },
    {
      title: 'Item',
      dataIndex: 'product',
      key: 'product',
      render: (product: any) => (
        <>
          <Title as="h6" className="mb-0.5 text-xs font-medium">
            {product.name}
          </Title>
          {product.variant && (
            <Text as="p" className="text-xs text-gray-500">
              {product.variant}
            </Text>
          )}
        </>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100,
      render: (value: string) => <Text className="text-xs text-gray-600">{value}</Text>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      render: (value: number) => <Text className="text-center text-xs">{value}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 90,
      render: (value: number) => <Text className="text-xs font-medium">৳{value.toFixed(2)}</Text>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (value: number) => <Text className="text-xs font-medium">৳{value.toFixed(2)}</Text>,
    },
  ];

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/orders/${order.id}`;

  return (
    <div className={cn('invoice-container w-full rounded-xl border border-muted p-5 sm:p-6 lg:p-8 2xl:p-10', className)}>
      {/* Header */}
      <div className="mb-6 flex flex-col-reverse items-start justify-between gap-4 md:flex-row print:mb-4">
        <div className="flex items-center gap-3">
          <Image
            src={siteConfig.logo}
            alt="Shokher Shopping"
            className="dark:invert"
            width={120}
            height={40}
            priority
          />
        </div>
        <div className="text-right">
          <Badge
            variant="flat"
            color={getOrderStatusColor(order.status)}
            rounded="md"
            className="mb-2 print:mb-1"
          >
            {order.status}
          </Badge>
          <Title as="h6" className="mb-1 text-base">{invNumber}</Title>
          <Text className="text-xs text-gray-500">Invoice Number</Text>
        </div>
      </div>

      {/* Company & Customer Info */}
      <div className="mb-6 grid gap-8 xs:grid-cols-2 sm:grid-cols-3 sm:gap-10 print:mb-4 print:gap-12">
        {/* From (Company Info) */}
        <div>
          <Title as="h6" className="mb-2 text-xs font-semibold uppercase">
            From
          </Title>
          <Text className="mb-1 text-sm font-semibold">
            SHOKHER SHOPPING
          </Text>
          <Text className="mb-1 text-xs">Dhaka, Bangladesh</Text>
          <Text className="mb-3 text-xs">support@shokhershopping.com</Text>
          <div>
            <Text className="mb-1 text-xs font-semibold text-gray-600">Invoice Date</Text>
            <Text className="text-xs">{formatDate(order.createdAt, 'MMM DD, YYYY')}</Text>
          </div>
        </div>

        {/* Bill To (Customer Info) */}
        <div>
          <Title as="h6" className="mb-2 text-xs font-semibold uppercase">
            Bill To
          </Title>
          <Text className="mb-1 text-sm font-semibold">
            {order.billingAddress?.name || order.user?.name || 'Customer'}
          </Text>
          {variant === 'admin' && order.user?.email && (
            <Text className="mb-1 text-xs">{order.user.email}</Text>
          )}
          <Text className="mb-1 text-xs">
            {order.billingAddress?.address || order.shippingAddress?.address}
          </Text>
          <Text className="mb-1 text-xs">
            {order.billingAddress?.city || order.shippingAddress?.city},{' '}
            {order.billingAddress?.state || order.shippingAddress?.state}
          </Text>
          <Text className="mb-3 text-xs">
            {order.billingAddress?.zip || order.shippingAddress?.zip}
          </Text>
          {(variant === 'admin' || order.billingAddress?.phone) && (
            <Text className="text-xs">{order.billingAddress?.phone || order.shippingAddress?.phone}</Text>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center sm:justify-end print:hidden">
          <QRCodeSVG
            value={trackingUrl}
            size={90}
            className="h-20 w-20 lg:h-24 lg:w-24"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4 print:mb-3">
        <Table
          data={invoiceItems}
          columns={columns}
          variant="minimal"
          rowKey={(record: any) => record.id}
          scroll={{ x: 600 }}
          className="invoice-table"
        />
      </div>

      {/* Summary and Notes */}
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-muted pb-2 pt-4 xs:flex-row print:gap-6 print:pt-3">
        {/* Notes */}
        {variant === 'customer' && (
          <div className="max-w-md">
            <Title as="h6" className="mb-1 text-xs font-semibold uppercase text-gray-700">
              Notes
            </Title>
            <Text className="text-xs leading-relaxed text-gray-600">
              Thank you for your order! For questions, contact our customer service.
            </Text>
          </div>
        )}

        {variant === 'admin' && order.note && (
          <div className="max-w-md">
            <Title as="h6" className="mb-1 text-xs font-semibold uppercase text-gray-700">
              Internal Notes
            </Title>
            <Text className="text-xs leading-relaxed text-gray-600">
              {order.note}
            </Text>
          </div>
        )}

        {/* Financial Summary */}
        <div className="w-full max-w-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-muted pb-2">
              <Text className="text-xs">Subtotal:</Text>
              <Text className="text-sm font-semibold">৳{order.total?.toFixed(2)}</Text>
            </div>

            {order.itemsTotalDiscount > 0 && (
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <Text className="text-xs">Discount:</Text>
                <Text className="text-sm font-semibold text-red-500">
                  -৳{order.itemsTotalDiscount?.toFixed(2)}
                </Text>
              </div>
            )}

            {order.couponAppliedDiscount > 0 && (
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <Text className="text-xs">Coupon Discount:</Text>
                <Text className="text-sm font-semibold text-red-500">
                  -৳{order.couponAppliedDiscount?.toFixed(2)}
                </Text>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-muted pb-2">
              <Text className="text-xs">Delivery Charge:</Text>
              <Text className="text-sm font-semibold">৳{order.deliveryCharge?.toFixed(2)}</Text>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Text className="text-sm font-bold">Total:</Text>
              <Text className="text-base font-bold">৳{order.netTotal?.toFixed(2)}</Text>
            </div>

            {variant === 'admin' && (
              <div className="mt-2 rounded-lg bg-gray-50 p-2">
                <Text className="text-xs font-semibold text-gray-600">Payment Method</Text>
                <Text className="text-xs font-medium">
                  {order.transaction?.paymentMethod || order.paymentMethod || 'COD'}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-muted pt-3 text-center print:mt-2 print:pt-2">
        <Text className="text-xs text-gray-500">
          {variant === 'admin' ? 'ADMIN COPY - FOR INTERNAL USE ONLY' : 'CUSTOMER COPY'}
        </Text>
        <Text className="mt-1 text-xs text-gray-400">
          Generated on {formatDate(new Date(), 'MMM DD, YYYY hh:mm A')}
        </Text>
      </div>
    </div>
  );
}
