'use client';

import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { useCallback, useEffect, useState } from 'react';
import { Text, Title, Badge, Button, Loader, ActionIcon } from 'rizzui';
import { PiCheck, PiTrash, PiBell, PiCheckCircle } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  title: string;
  message: string;
  actionLink: string;
  isRead: boolean;
  createdAt: { _seconds?: number } | string;
}

const pageHeader = {
  title: 'Notifications',
  breadcrumb: [
    { href: routes.eCommerce.dashboard, name: 'Dashboard' },
    { name: 'Notifications' },
  ],
};

function parseTime(createdAt: Notification['createdAt']): string {
  if (!createdAt) return '';
  if (typeof createdAt === 'object' && createdAt._seconds) {
    return dayjs(createdAt._seconds * 1000).fromNow();
  }
  return dayjs(createdAt as string).fromNow();
}

export default function NotificationsPage() {
  const { user } = useFirebaseAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const limit = 20;

  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user.uid}&limit=${limit}&page=${page}`);
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setNotifications(data.data);
        setTotal(data.total || data.data.length);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [user?.uid, page]);

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

  const handleMarkRead = async (id: string) => {
    if (!user?.uid) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silent fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    try {
      await fetch(`/api/notifications/${id}?userId=${user.uid}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Silent fail
    }
  };

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification.id);
    }
    if (notification.actionLink) {
      router.push(notification.actionLink);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="mt-4 @lg:mt-0"
          >
            <PiCheckCircle className="me-1.5 h-4 w-4" />
            {markingAll ? 'Marking...' : 'Mark All as Read'}
          </Button>
        )}
      </PageHeader>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-muted py-20 text-gray-400">
            <PiBell className="mb-3 h-12 w-12" />
            <Title as="h5" className="mb-1 text-gray-500">
              No notifications
            </Title>
            <Text>You&apos;re all caught up!</Text>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-5 py-4 transition-colors hover:bg-gray-50 ${
                  !item.isRead
                    ? 'border-primary/20 bg-primary/[0.02]'
                    : 'border-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!item.isRead ? (
                    <Badge
                      renderAsDot
                      size="lg"
                      color="primary"
                      className="mt-1.5 shrink-0"
                    />
                  ) : (
                    <span className="mt-1 shrink-0 rounded-full bg-gray-100 p-0.5">
                      <PiCheck className="h-3 w-3 text-gray-400" />
                    </span>
                  )}
                  <div>
                    <Text
                      className={`text-sm ${
                        !item.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-sm text-gray-500">{item.message}</Text>
                    <Text className="mt-1 text-xs text-gray-400">{parseTime(item.createdAt)}</Text>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!item.isRead && (
                    <ActionIcon
                      size="sm"
                      variant="outline"
                      title="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(item.id);
                      }}
                    >
                      <PiCheck className="h-4 w-4" />
                    </ActionIcon>
                  )}
                  <ActionIcon
                    size="sm"
                    variant="outline"
                    title="Delete"
                    className="text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <PiTrash className="h-4 w-4" />
                  </ActionIcon>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Text className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
