'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PiPrinterBold } from 'react-icons/pi';
import { Button, ActionIcon } from 'rizzui';
import OrderInvoice from './order-invoice';
import toast from 'react-hot-toast';
import cn from '@core/utils/class-names';

interface PrintInvoiceButtonProps {
  order: any;
  variant: 'admin' | 'customer';
  className?: string;
  buttonText?: string;
  iconOnly?: boolean;
}

export default function PrintInvoiceButton({
  order,
  variant,
  className,
  buttonText,
  iconOnly = false,
}: PrintInvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handlePrint = async () => {
    try {
      setIsCreatingInvoice(true);

      // Create invoice record in backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            type: variant.toUpperCase(),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setInvoiceNumber(result.data.invoiceNumber);
      }

      // Show invoice for printing
      setIsOpen(true);

      // Wait for React to render, then trigger print
      // Use requestAnimationFrame to ensure DOM updates are flushed
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 500);
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Printing anyway...');

      // Still allow printing even if backend fails
      setIsOpen(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 500);
      });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // Add event listener for after print
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsOpen(false);
      setInvoiceNumber(undefined);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const buttonLabel = buttonText || (variant === 'admin' ? 'Print Admin Copy' : 'Print Customer Copy');

  // Render invoice via portal to document.body for reliable printing
  const invoicePortal = mounted && isOpen && createPortal(
    <div className="print-invoice-content">
      <OrderInvoice
        order={order}
        variant={variant}
        invoiceNumber={invoiceNumber}
      />
    </div>,
    document.body
  );

  if (iconOnly) {
    return (
      <>
        <ActionIcon
          variant="outline"
          onClick={handlePrint}
          isLoading={isCreatingInvoice}
          className={cn('h-9 w-9', className)}
          title={buttonLabel}
        >
          <PiPrinterBold className="h-4 w-4" />
        </ActionIcon>
        {invoicePortal}
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn('w-full @lg:w-auto', className)}
        onClick={handlePrint}
        isLoading={isCreatingInvoice}
      >
        <PiPrinterBold className="me-1.5 h-[17px] w-[17px]" />
        {buttonLabel}
      </Button>
      {invoicePortal}
    </>
  );
}
