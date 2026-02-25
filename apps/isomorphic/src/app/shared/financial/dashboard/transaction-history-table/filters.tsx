'use client';

import { Badge, Button, Flex, Input, Text } from 'rizzui';
import { type Table as ReactTableType } from '@tanstack/react-table';
import StatusField from '@core/components/controlled-table/status-field';
import { PiMagnifyingGlassBold, PiTrashDuotone } from 'react-icons/pi';

const paymentMethodOptions = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'SSLCOMMERZ', label: 'SSLCommerz' },
];

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
}

export default function Filters<TData extends Record<string, any>>({
  table,
}: TableToolbarProps<TData>) {
  const isFiltered =
    table.getState().globalFilter || table.getState().columnFilters.length > 0;

  return (
    <Flex
      align="center"
      direction="col"
      className="mt-6 @3xl:flex-row @[62rem]:mt-0"
    >
      <Flex align="center" className="order-2 @3xl:order-1 @3xl:max-w-[360px]">
        <StatusField
          className="w-full"
          placeholder="Payment method"
          options={paymentMethodOptions}
          dropdownClassName="!z-10 h-auto"
          getOptionValue={(option) => option.value}
          value={table.getColumn('paymentMethod')?.getFilterValue() ?? ''}
          onChange={(e) => table.getColumn('paymentMethod')?.setFilterValue(e)}
        />
        <StatusField
          className="w-full"
          placeholder="Select status"
          options={statusOptions}
          dropdownClassName="!z-10 h-auto"
          getOptionValue={(option) => option.value}
          value={table.getColumn('orderStatus')?.getFilterValue() ?? ''}
          onChange={(e) => table.getColumn('orderStatus')?.setFilterValue(e)}
          getOptionDisplayValue={(option: { value: any }) =>
            renderOptionDisplayValue(option.value as string)
          }
          displayValue={(selected: string) =>
            renderOptionDisplayValue(selected)
          }
        />
      </Flex>

      {isFiltered ? (
        <Button
          variant="flat"
          onClick={() => {
            table.resetGlobalFilter();
            table.resetColumnFilters();
          }}
          className="order-3 h-9 w-full bg-gray-200/70 @3xl:order-2 @3xl:w-24"
        >
          <PiTrashDuotone className="me-1.5 size-4" /> Clear
        </Button>
      ) : null}

      <Input
        type="search"
        clearable={true}
        inputClassName="h-[36px]"
        placeholder="Search by customer name..."
        onClear={() => table.setGlobalFilter('')}
        value={table.getState().globalFilter ?? ''}
        prefix={<PiMagnifyingGlassBold className="size-4" />}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        className="w-full @3xl:order-3 @3xl:ms-auto @3xl:max-w-72"
      />
    </Flex>
  );
}

function renderOptionDisplayValue(value: string) {
  switch (value) {
    case 'PENDING':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-orange-dark">Pending</Text>
        </div>
      );
    case 'PROCESSING':
      return (
        <div className="flex items-center">
          <Badge color="info" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-blue-dark">Processing</Text>
        </div>
      );
    case 'DISPATCHED':
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-indigo-500" />
          <Text className="ms-2 font-medium capitalize text-indigo-dark">Dispatched</Text>
        </div>
      );
    case 'DELIVERED':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">Delivered</Text>
        </div>
      );
    case 'CANCELLED':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">Cancelled</Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium capitalize text-gray-600">{value}</Text>
        </div>
      );
  }
}
