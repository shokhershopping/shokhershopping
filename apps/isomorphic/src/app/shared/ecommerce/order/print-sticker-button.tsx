'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PiBarcodeBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import ProductSticker from './product-sticker';
import cn from '@core/utils/class-names';

interface PrintStickerButtonProps {
  order: any;
  className?: string;
}

export default function PrintStickerButton({
  order,
  className,
}: PrintStickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [readyToPrint, setReadyToPrint] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Trigger print when content is ready
  useEffect(() => {
    if (readyToPrint && isOpen) {
      // Give extra time for barcode/QR SVGs to render
      const timer = setTimeout(() => {
        window.print();
        setReadyToPrint(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [readyToPrint, isOpen]);

  const handlePrint = useCallback(() => {
    setIsOpen(true);
    // Set ready after a frame so React renders the portal first
    requestAnimationFrame(() => {
      setReadyToPrint(true);
    });
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsOpen(false);
      setReadyToPrint(false);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Always render the portal when open (so content exists in DOM before print)
  const stickerPortal =
    mounted &&
    isOpen &&
    createPortal(
      <div className="print-sticker-content">
        <ProductSticker order={order} />
      </div>,
      document.body
    );

  return (
    <>
      <Button
        variant="outline"
        className={cn('w-full @lg:w-auto', className)}
        onClick={handlePrint}
      >
        <PiBarcodeBold className="me-1.5 h-[17px] w-[17px]" />
        Print Product Sticker
      </Button>
      {stickerPortal}
    </>
  );
}
