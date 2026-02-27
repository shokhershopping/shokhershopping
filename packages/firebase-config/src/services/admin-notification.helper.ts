import { getAdminUserIds } from './user.service';
import { createNotification } from './notification.service';

/**
 * Send a notification to all admin users.
 * Fire-and-forget — errors are logged but don't throw.
 */
export async function notifyAdmins(
  title: string,
  message: string,
  actionLink?: string
): Promise<void> {
  try {
    const adminIds = await getAdminUserIds();
    if (adminIds.length === 0) return;

    await createNotification(
      { title, message, actionLink: actionLink || '' },
      adminIds
    );
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}
