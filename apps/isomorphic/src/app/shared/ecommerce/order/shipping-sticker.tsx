'use client';

import Image from 'next/image';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { siteConfig } from '@/config/site.config';
import './shipping-sticker.css';

interface ShippingStickerProps {
  order: any;
  className?: string;
}

export default function ShippingSticker({ order, className }: ShippingStickerProps) {
  if (!order) return null;

  const orderId = order.id || '';
  const shortId = orderId.slice(0, 8).toUpperCase();
  const consignmentId = order.steadfastConsignmentId || order.steadfastTrackingCode || orderId;
  const trackingCode = order.steadfastTrackingCode || '';

  // Customer info
  const customerName =
    order.billingAddress?.name || order.userName || order.guestName || 'Customer';
  const customerPhone =
    order.billingAddress?.phone || order.shippingAddress?.phone || order.guestPhone || '';
  const customerAddress = [
    order.shippingAddress?.address || order.billingAddress?.address,
    order.shippingAddress?.city || order.billingAddress?.city,
    order.shippingAddress?.state || order.billingAddress?.state,
    order.shippingAddress?.zip || order.billingAddress?.zip,
  ]
    .filter(Boolean)
    .join(', ');

  // Order details
  const deliveryType = order.shippingAddress?.city?.toLowerCase().includes('dhaka')
    ? 'Home'
    : 'Home';
  const totalItems = order.items?.length || 0;
  const codAmount = order.netTotal || order.total || 0;
  const paymentMethod = order.transaction?.paymentMethod || order.paymentMethod || 'COD';

  // QR code content: Order ID + Customer info
  const qrContent = [
    `Order: INV-${shortId}`,
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Address: ${customerAddress}`,
    `Amount: ৳${codAmount}`,
  ].join('\n');

  return (
    <div className={`shipping-sticker-page ${className || ''}`}>
      <div className="shipping-sticker-card">
        {/* Header: Logo + Shop Name + ID */}
        <div className="shipping-header">
          <div className="shipping-logo">
            <Image
              src={siteConfig.logo}
              alt="Shokher Shopping"
              width={60}
              height={60}
              priority
            />
          </div>
          <div className="shipping-header-text">
            <div className="shipping-shop-name">Shokher Shopping</div>
            <div className="shipping-order-id">ID:{consignmentId}</div>
          </div>
        </div>

        {/* Barcode for Consignment ID */}
        <div className="shipping-barcode">
          <Barcode
            value={String(consignmentId)}
            width={2}
            height={45}
            fontSize={12}
            margin={0}
            displayValue={true}
            format="CODE128"
          />
        </div>

        {/* Invoice Details Row */}
        <div className="shipping-details-row">
          <div className="shipping-detail-col">
            <span className="shipping-detail-label">Invoice :</span>
          </div>
          <div className="shipping-detail-col">
            <span className="shipping-detail-label">SF-ID : </span>
            <span className="shipping-detail-value">{consignmentId}</span>
          </div>
        </div>
        <div className="shipping-details-row">
          <div className="shipping-detail-col">
            <span className="shipping-detail-label">D. Type : </span>
            <span className="shipping-detail-value">{deliveryType}</span>
          </div>
          <div className="shipping-detail-col">
            <span className="shipping-detail-label">Items : </span>
            <span className="shipping-detail-value">{totalItems}</span>
          </div>
        </div>

        {/* QR Code + Customer Info */}
        <div className="shipping-customer-section">
          <div className="shipping-qr">
            <QRCodeSVG value={qrContent} size={80} />
          </div>
          <div className="shipping-customer-info">
            <div className="shipping-customer-row">
              <span className="shipping-customer-label">Name : </span>
              <span className="shipping-customer-value">{customerName}</span>
            </div>
            <div className="shipping-customer-row">
              <span className="shipping-customer-label">Phone : </span>
              <span className="shipping-customer-value">{customerPhone}</span>
            </div>
            <div className="shipping-customer-row">
              <span className="shipping-customer-label">Address: </span>
              <span className="shipping-customer-value">{customerAddress}</span>
            </div>
          </div>
        </div>

        {/* COD Amount Footer */}
        <div className="shipping-cod-footer">
          <div className="shipping-cod-label">{paymentMethod}</div>
          <div className="shipping-cod-amount">৳{codAmount}</div>
        </div>
      </div>
    </div>
  );
}
