'use client';

import { useEffect, useState } from 'react';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import {
  Button,
  Text,
  Switch,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  Radio,
} from 'rizzui';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  notificationMetadataFormatter,
  notificationMetadataParser,
} from '@/utils';

const orderOptions = [
  {
    title: 'Order is placed',
    slug: 'orderPlaced',
  },
  {
    title: 'Order is updated',
    slug: 'orderUpdated',
  },
];

const transactionOptions = [
  {
    title: 'Transaction is made for an order',
    slug: 'transactionCreated',
  },
  {
    title: 'Transaction is updated',
    slug: 'transactionUpdated',
  },
];

const inventoryOptions = [
  {
    title: 'New product is added',
    slug: 'productCreated',
  },
  {
    title: 'Product is updated',
    slug: 'productUpdated',
  },
  {
    title: 'Product is out of stock',
    slug: 'productIsOutOfStock',
  },
];

export default function NotificationSettingsView() {
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user)
      setReminders((user as any).publicMetadata?.preferences?.reminders || {});
  }, [user]);
  return (
    <div className="@container">
      <HorizontalFormBlockWrapper
        childrenWrapperClassName="gap-0 @lg:gap-0"
        title="Notifications"
        titleClassName="text-xl font-semibold"
        description="Select when and how you will be notified."
      />
      <HorizontalFormBlockWrapper
        title="Order notifications"
        description="Select when you’ll be notified when the following changes occur."
        descriptionClassName="max-w-[344px]"
      >
        <div className="col-span-2">
          {orderOptions.map((opt, index) => (
            <div
              key={`generalopt-${index}`}
              className="flex items-center justify-between border-b border-muted py-6 last:border-none last:pb-0"
            >
              <Text className="text-sm font-medium text-gray-900">
                {opt.title}
              </Text>
              <ButtonGroup
                selectedOption={notificationMetadataParser(
                  user as any,
                  'order',
                  opt.slug
                )}
                onChange={async (option) => {
                  const token = await getToken();
                  const res = fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/metadata`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        metadata: notificationMetadataFormatter(
                          'order',
                          opt.slug,
                          option,
                          user as any
                        ),
                      }),
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </HorizontalFormBlockWrapper>
      <HorizontalFormBlockWrapper
        title="Transaction notifications"
        description="Select when you’ll be notified when the following summaries or report are ready."
        descriptionClassName="max-w-[344px]"
      >
        <div className="col-span-2">
          {transactionOptions.map((opt, index) => (
            <div
              key={`summaryopt-${index}`}
              className="flex items-center justify-between border-b border-muted py-6 last:border-none last:pb-0"
            >
              <Text className="text-sm font-medium text-gray-900">
                {opt.title}
              </Text>
              <ButtonGroup
                selectedOption={notificationMetadataParser(
                  user as any,
                  'transaction',
                  opt.slug
                )}
                onChange={async (option) => {
                  const token = await getToken();
                  const res = fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/metadata`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        metadata: notificationMetadataFormatter(
                          'transaction',
                          opt.slug,
                          option,
                          user as any
                        ),
                      }),
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </HorizontalFormBlockWrapper>
      <HorizontalFormBlockWrapper
        title="Inventory notifications"
        description="Select when you’ll be notified when the following summaries or report are ready."
        descriptionClassName="max-w-[344px]"
      >
        <div className="col-span-2">
          {inventoryOptions.map((opt, index) => (
            <div
              key={`summaryopt-${index}`}
              className="flex items-center justify-between border-b border-muted py-6 last:border-none last:pb-0"
            >
              <Text className="text-sm font-medium text-gray-900">
                {opt.title}
              </Text>
              <ButtonGroup
                selectedOption={notificationMetadataParser(
                  user as any,
                  'inventory',
                  opt.slug
                )}
                onChange={async (option) => {
                  const token = await getToken();
                  const res = fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/metadata`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        metadata: notificationMetadataFormatter(
                          'inventory',
                          opt.slug,
                          option,
                          user as any
                        ),
                      }),
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </HorizontalFormBlockWrapper>
      <HorizontalFormBlockWrapper
        title="Reminders"
        description="These are notifications for comments on your posts and replies to your comments."
        descriptionClassName="max-w-[344px]"
      >
        <div className="col-span-2">
          <Switch
            label="Notify Low Stock Items"
            variant="flat"
            labelClassName="font-medium text-sm text-gray-900"
            checked={reminders?.notifyWhenProductIsLowInStock}
            onChange={async (e) => {
              const token = await getToken();
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/metadata`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    metadata: {
                      ...user?.publicMetadata,
                      preferences: {
                        ...(user?.publicMetadata as any)?.preferences,
                        reminders: {
                          ...(user?.publicMetadata as any)?.preferences
                            ?.reminders,
                          notifyWhenProductIsLowInStock:
                            !reminders?.notifyWhenProductIsLowInStock,
                        },
                      },
                    },
                  }),
                }
              );
              setReminders({
                ...reminders,
                notifyWhenProductIsLowInStock:
                  !reminders?.notifyWhenProductIsLowInStock,
              });
            }}
          />
          <Switch
            label="Notify Weekly Summary"
            variant="flat"
            checked={reminders?.notifyWeeklySummary}
            labelClassName="font-medium text-sm text-gray-900"
            onChange={async (e) => {
              const token = await getToken();
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/metadata`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    metadata: {
                      ...user?.publicMetadata,
                      preferences: {
                        ...(user?.publicMetadata as any)?.preferences,
                        reminders: {
                          ...(user?.publicMetadata as any)?.preferences
                            ?.reminders,
                          notifyWeeklySummary: !reminders.notifyWeeklySummary,
                        },
                      },
                    },
                  }),
                }
              );
              setReminders({
                ...reminders,
                notifyWeeklySummary: !reminders.notifyWeeklySummary,
              });
            }}
          />
        </div>
      </HorizontalFormBlockWrapper>
    </div>
  );
}

const options = ['None', 'In-app', 'Email'];

function ButtonGroup({
  onChange,
  selectedOption,
}: {
  onChange: (option: string) => void;
  selectedOption: string;
}) {
  const [selected, setSelected] = useState(selectedOption);
  console.log(selected);
  console.log(selectedOption);
  function handleOnClick(option: string) {
    setSelected(option);
    onChange && onChange(option);
  }

  useEffect(() => {
    setSelected(selectedOption);
  }, [selectedOption]);
  return (
    <div className="inline-flex gap-1">
      {options.map((option) => (
        <Button
          key={option}
          variant={selected === option ? 'solid' : 'outline'}
          onClick={() => handleOnClick(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
