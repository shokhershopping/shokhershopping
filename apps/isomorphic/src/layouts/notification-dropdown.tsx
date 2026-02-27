'use client';

import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { useMedia } from '@core/hooks/use-media';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactElement, RefObject, useCallback, useEffect, useState } from 'react';
import { PiCheck, PiBell, PiTrash } from 'react-icons/pi';
import { Badge, Popover, Text, Title, ActionIcon, Loader } from 'rizzui';

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  title: string;
  message: string;
  actionLink: string;
  isRead: boolean;
  createdAt: { _seconds?: number } | string;
}

function parseTime(createdAt: Notification['createdAt']): string {
  if (!createdAt) return '';
  if (typeof createdAt === 'object' && createdAt._seconds) {
    return dayjs(createdAt._seconds * 1000).fromNow(true);
  }
  return dayjs(createdAt as string).fromNow(true);
}

function NotificationsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useFirebaseAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.uid}&limit=15`);
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (!user?.uid) return;
    setMarkingAll(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Silent fail
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = async (notification: Notification) => {
    if (!user?.uid || notification.isRead) {
      if (notification.actionLink) {
        router.push(notification.actionLink);
      }
      setIsOpen(false);
      return;
    }

    // Mark as read
    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silent fail
    }

    if (notification.actionLink) {
      router.push(notification.actionLink);
    }
    setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!user?.uid) return;
    try {
      await fetch(`/api/notifications/${notificationId}?userId=${user.uid}`, {
        method: 'DELETE',
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch {
      // Silent fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          Notifications {unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({unreadCount})</span>}
        </Title>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>
      <div className="custom-scrollbar max-h-[420px] overflow-y-auto scroll-smooth">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <PiBell className="mb-2 h-8 w-8" />
            <Text>No notifications yet</Text>
          </div>
        ) : (
          <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className="group grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md px-2 py-2.5 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
              >
                <div className="w-full">
                  <Text
                    className={`mb-0.5 truncate text-sm ${
                      !item.isRead
                        ? 'font-semibold text-gray-900 dark:text-gray-700'
                        : 'font-medium text-gray-600'
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="mb-1 line-clamp-2 text-xs text-gray-500">
                    {item.message}
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    {parseTime(item.createdAt)} ago
                  </Text>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {!item.isRead ? (
                    <Badge
                      renderAsDot
                      size="lg"
                      color="primary"
                      className="mt-1.5 scale-90"
                    />
                  ) : (
                    <span className="mt-1.5 inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
                      <PiCheck className="h-auto w-[9px]" />
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="mt-auto hidden text-gray-400 hover:text-red-500 group-hover:block"
                  >
                    <PiTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Link
        href="/notifications"
        onClick={() => setIsOpen(false)}
        className="-me-6 block px-6 pb-0.5 pt-3 text-center text-sm text-primary hover:underline"
      >
        View All Notifications
      </Link>
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: ReactElement & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useFirebaseAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and poll every 30s
  useEffect(() => {
    if (!user?.uid) return;

    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.uid}&countOnly=true`);
        const data = await res.json();
        if (data.status === 'success') {
          setUnreadCount(data.data?.unreadCount || 0);
        }
      } catch {
        // Silent fail
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  // When dropdown opens, reset count (will be refreshed from list)
  useEffect(() => {
    if (!isOpen && user?.uid) {
      // Re-fetch count when dropdown closes
      const fetchCount = async () => {
        try {
          const res = await fetch(`/api/notifications?userId=${user.uid}&countOnly=true`);
          const data = await res.json();
          if (data.status === 'success') {
            setUnreadCount(data.data?.unreadCount || 0);
          }
        } catch {
          // Silent fail
        }
      };
      fetchCount();
    }
  }, [isOpen, user?.uid]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
    >
      <Popover.Trigger>
        <ActionIcon
          aria-label="Notification"
          variant="text"
          className="relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
        >
          {typeof children.type === 'function' ? children : children.props.children}
          {unreadCount > 0 && (
            <Badge
              renderAsDot
              color="warning"
              enableOutlineRing
              className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
            />
          )}
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <NotificationsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
