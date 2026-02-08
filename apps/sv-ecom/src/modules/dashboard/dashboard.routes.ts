import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import * as dashboardController from './dashboard.controller';
import { validate } from '../../middlewares/validate';
import {
    dashboardStatsQuerySchema,
    salesReportQuerySchema,
    topProductsQuerySchema,
    customerAnalyticsQuerySchema,
    userLocationQuerySchema,
    stockReportQuerySchema,
} from './req.types';

const router = Router();

/**
 * @route   GET /dashboard/stats
 * @desc    Get dashboard statistics (orders, sales, products)
 * @access  Private (requires authentication)
 */
router.get(
    '/stats',
    requireAuth(),
    validate(dashboardStatsQuerySchema),
    dashboardController.getDashboardStatsController
);

/**
 * @route   GET /dashboard/sales-report
 * @desc    Get sales report grouped by month for a year
 * @access  Private (requires authentication)
 */
router.get(
    '/sales-report',
    requireAuth(),
    validate(salesReportQuerySchema),
    dashboardController.getSalesReportController
);

/**
 * @route   GET /dashboard/top-products
 * @desc    Get top selling products
 * @access  Private (requires authentication)
 */
router.get(
    '/top-products',
    requireAuth(),
    validate(topProductsQuerySchema),
    dashboardController.getTopProductsController
);

/**
 * @route   GET /dashboard/customer-analytics
 * @desc    Get customer analytics (new vs repeat customers)
 * @access  Private (requires authentication)
 */
router.get(
    '/customer-analytics',
    requireAuth(),
    validate(customerAnalyticsQuerySchema),
    dashboardController.getCustomerAnalyticsController
);

/**
 * @route   GET /dashboard/user-location
 * @desc    Get user geographic distribution by country
 * @access  Private (requires authentication)
 */
router.get(
    '/user-location',
    requireAuth(),
    validate(userLocationQuerySchema),
    dashboardController.getUserLocationController
);

/**
 * @route   GET /dashboard/stock-report
 * @desc    Get stock report (low stock products)
 * @access  Private (requires authentication)
 */
router.get(
    '/stock-report',
    requireAuth(),
    validate(stockReportQuerySchema),
    dashboardController.getStockReportController
);

export default router;
