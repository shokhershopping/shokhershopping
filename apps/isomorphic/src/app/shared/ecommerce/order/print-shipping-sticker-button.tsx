'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PiPackageBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import ShippingSticker from './shipping-sticker';
import cn from '@core/utils/class-names';

interface PrintShippingStickerButtonProps {
  order: any;
  className?: string;
}

export default function PrintShippingStickerButton({
  order,
  className,
}: PrintShippingStickerButtonProps) {
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
      const timer = setTimeout(() => {
        window.print();
        setReadyToPrint(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [readyToPrint, isOpen]);

  const handlePrint = useCallback(() => {
    setIsOpen(true);
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

  const stickerPortal =
    mounted &&
    isOpen &&
    createPortal(
      <div className="print-shipping-sticker-content">
        <ShippingSticker order={order} />
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
        <PiPackageBold className="me-1.5 h-[17px] w-[17px]" />
        Print Shipping Label
      </Button>
      {stickerPortal}
    </>
  );
}
