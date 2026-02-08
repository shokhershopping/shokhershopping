export type NotificationChannel = 'email' | 'in-app' | 'none';
export type ThemeType = 'light' | 'dark';
export interface Notifications {
    order: {
        orderPlaced: NotificationChannel;
        orderUpdated: NotificationChannel;
    };
    transaction: {
        transactionCreated: NotificationChannel;
        transactionUpdated: NotificationChannel;
    };
    inventory: {
        productCreated: NotificationChannel;
        productUpdated: NotificationChannel;
        productIsOutOfStock: NotificationChannel;
    };
}

export interface Permissions {
    products: number;
    orders: number;
    transactions: number;
    users: number;
    uploads: number;
    categories: number;
}

export type Role = 'admin' | 'manager' | 'user';

export interface Reminders {
    notifyWhenProductIsLowInStock: boolean;
    notifyWeeklySummary: boolean;
}

export interface Preferences {
    theme: ThemeType;
    notifications: Notifications;
    reminders: Reminders;
}
export interface Metadata {
    preferences: Preferences;
    role: Role;
    permissions: Permissions;
}
