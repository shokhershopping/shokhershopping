import prisma from '../../prismaClient';
import { IResponse } from '../../types';
import { Notification, NotificationRecipient } from '@prisma/client';

export const createNotification = async (
    notification: Omit<Notification, 'id'>,
    recipients: NotificationRecipient[]
): Promise<IResponse<Notification>> => {
    const createdNotification = await prisma.notification.create({
        data: {
            ...notification,
            recipients: {
                createMany: {
                    data: recipients,
                },
            },
        },
    });
    const response: IResponse<Notification> = {
        status: 'success',
        code: 201,
        error: '',
        message: 'Notification created successfully',
        data: createdNotification,
    };
    return response;
};

export const markAsReadForUser = async (
    id: string
): Promise<IResponse<NotificationRecipient>> => {
    const updatedNotification = await prisma.notificationRecipient.update({
        where: {
            id,
        },
        data: {
            isRead: true,
            readAt: new Date().toISOString(),
        },
        include: {
            notification: true,
        },
    });
    const response: IResponse<NotificationRecipient> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Notification marked as read successfully',
        data: updatedNotification,
    };
    return response;
};

export const deleteNotificationForUser = async (
    id: string
): Promise<IResponse<NotificationRecipient>> => {
    const deletedNotification = await prisma.notificationRecipient.delete({
        where: {
            id,
        },
    });

    const response: IResponse<NotificationRecipient> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Notification deleted successfully',
        data: deletedNotification,
    };
    return response;
};
