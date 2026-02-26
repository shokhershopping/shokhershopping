'use client';

import Image from 'next/image';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { siteConfig } from '@/config/site.config';
import './product-sticker.css';

interface ProductStickerProps {
  order: any;
  className?: string;
}

const SHOP_URL = 'shokhershopping.com';
const SHOP_PHONE = '+880-1841-917370';

export default function ProductSticker({ order, className }: ProductStickerProps) {
  if (!order?.items) return null;

  const items = order.items.map((item: any, index: number) => ({
    id: item.id || String(index),
    name: item.productName || 'Unknown Product',
    price: item.productPrice || 0,
    sku: item.sku || item.productId?.slice(0, 12) || `ITEM-${index + 1}`,
    quantity: item.quantity || 1,
  }));

  // One sticker per product (shows quantity, unit price, and total)
  const stickers = items.map((item: any) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
    sku: item.sku,
  }));

  return (
    <div className={`sticker-page ${className || ''}`}>
      <div className="sticker-grid">
        {stickers.map((sticker, index) => (
          <div key={index} className="sticker-card">
            {/* Logo */}
            <div className="sticker-logo">
              <Image
                src={siteConfig.logo}
                alt="Shokher Shopping"
                width={80}
                height={80}
                priority
              />
            </div>

            {/* Shop Name */}
            <div className="sticker-shop-name">
              Shokher Shopping
            </div>

            {/* Bengali Tagline */}
            <div className="sticker-tagline">
              শখের কেনাকাটার নতুন পরিচয়
            </div>

            {/* Product Name */}
            <div className="sticker-product-name">
              {sticker.name}
            </div>

            {/* SKU */}
            <div className="sticker-sku">
              SKU: {sticker.sku}
            </div>

            {/* Price & Total */}
            <div className="sticker-pricing">
              <div className="sticker-unit-price">
                Price: ৳{sticker.price.toFixed(2)} x {sticker.quantity}
              </div>
              <div className="sticker-total-price">
                Total: ৳{sticker.total.toFixed(2)}
              </div>
            </div>

            {/* Barcode */}
            <div className="sticker-barcode">
              <Barcode
                value={sticker.sku}
                width={2}
                height={50}
                fontSize={0}
                margin={0}
                displayValue={false}
              />
            </div>

            {/* Bottom: QR Code + Contact */}
            <div className="sticker-bottom">
              <div className="sticker-qr">
                <QRCodeSVG
                  value={`https://${SHOP_URL}`}
                  size={60}
                />
              </div>
              <div className="sticker-contact">
                <span className="sticker-contact-url">{SHOP_URL}</span>
                <span className="sticker-contact-phone">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sticker-phone-icon">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {SHOP_PHONE}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
