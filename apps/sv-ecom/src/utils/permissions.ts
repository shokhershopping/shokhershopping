import { Permissions } from '../types';

export const defaultManagerPermissions: Permissions = {
    products: 7,
    users: 7,
    orders: 7,
    transactions: 7,
    uploads: 7,
    categories: 7,
};

export const defaultAdminPermissions: Permissions = {
    products: 15,
    users: 15,
    orders: 15,
    transactions: 15,
    uploads: 15,
    categories: 15,
};
