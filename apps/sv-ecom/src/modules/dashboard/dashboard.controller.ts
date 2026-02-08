import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';
import { CustomError } from '../../utils/CustomError';

/**
 * Get dashboard statistics
 * @route GET /dashboard/stats?period=30
 */
export const getDashboardStatsController = async (
    req: Request,
    res: Response
) => {
    try {
        const period = parseInt(req.query.period as string) || 30;

        const stats = await dashboardService.getDashboardStats(period);

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error in getDashboardStatsController:', error);
        throw new CustomError('Failed to fetch dashboard stats', 500);
    }
};

/**
 * Get sales report by year
 * @route GET /dashboard/sales-report?year=2025
 */
export const getSalesReportController = async (
    req: Request,
    res: Response
) => {
    try {
        const year = parseInt(req.query.year as string) || new Date().getFullYear();

        const salesReport = await dashboardService.getSalesReport(year);

        res.status(200).json(salesReport);
    } catch (error) {
        console.error('Error in getSalesReportController:', error);
        throw new CustomError('Failed to fetch sales report', 500);
    }
};

/**
 * Get top selling products
 * @route GET /dashboard/top-products?limit=10&startDate=...&endDate=...
 */
export const getTopProductsController = async (
    req: Request,
    res: Response
) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;

        const topProducts = await dashboardService.getTopProducts(
            limit,
            startDate,
            endDate
        );

        res.status(200).json(topProducts);
    } catch (error) {
        console.error('Error in getTopProductsController:', error);
        throw new CustomError('Failed to fetch top products', 500);
    }
};

/**
 * Get customer analytics (new vs repeat customers)
 * @route GET /dashboard/customer-analytics?year=2025
 */
export const getCustomerAnalyticsController = async (
    req: Request,
    res: Response
) => {
    try {
        const year = parseInt(req.query.year as string) || new Date().getFullYear();

        const analytics = await dashboardService.getCustomerAnalytics(year);

        res.status(200).json(analytics);
    } catch (error) {
        console.error('Error in getCustomerAnalyticsController:', error);
        throw new CustomError('Failed to fetch customer analytics', 500);
    }
};

/**
 * Get user geographic distribution
 * @route GET /dashboard/user-location
 */
export const getUserLocationController = async (
    req: Request,
    res: Response
) => {
    try {
        const locationData = await dashboardService.getUserLocation();

        res.status(200).json(locationData);
    } catch (error) {
        console.error('Error in getUserLocationController:', error);
        throw new CustomError('Failed to fetch user location data', 500);
    }
};

/**
 * Get stock report (low stock products)
 * @route GET /dashboard/stock-report?page=1&limit=5&threshold=10
 */
export const getStockReportController = async (
    req: Request,
    res: Response
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const threshold = parseInt(req.query.threshold as string) || 10;

        const stockReport = await dashboardService.getStockReport(
            page,
            limit,
            threshold
        );

        res.status(200).json(stockReport);
    } catch (error) {
        console.error('Error in getStockReportController:', error);
        throw new CustomError('Failed to fetch stock report', 500);
    }
};
