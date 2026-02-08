import prisma from '../../prismaClient';
import { IResponse } from '../../types';

interface WeeklyDataPoint {
    day: string;
    value: number;
}

interface MetricData {
    current: number;
    previous: number;
    percentageChange: number;
    weeklyData: WeeklyDataPoint[];
}

interface DashboardStats {
    orders: MetricData;
    sales: MetricData;
    products: MetricData;
}

interface SalesReportData {
    month: string;
    sales: number;
}

interface TopProduct {
    id: string;
    name: string;
    thumbnail: string;
    price: number;
    salePrice: number | null;
    rating: number;
    totalSold: number;
}

interface CustomerAnalyticsData {
    month: string;
    newCustomer: number;
    oldCustomer: number;
}

interface UserLocationData {
    country: string;
    name: string;
    value: number;
}

interface StockReportProduct {
    id: string;
    name: string;
    thumbnail: string;
    stock: number;
    status: string;
    price: number;
    salePrice: number | null;
}

const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

/**
 * Get dashboard statistics for orders, sales, and products
 * @param period - Number of days to calculate stats for (default 30)
 * @returns Dashboard stats with current, previous, percentage change, and weekly data
 */
export const getDashboardStats = async (
    period = 30
): Promise<IResponse<DashboardStats>> => {
    try {
        const now = new Date();
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - period);

        const previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(currentPeriodStart.getDate() - period);

        // Get last 7 days for weekly chart
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6); // Last 7 days including today

        // Query for orders
        const [
            currentOrders,
            previousOrders,
            currentSales,
            previousSales,
            currentProducts,
            previousProducts,
            weeklyOrders,
            weeklySales,
            weeklyProducts,
        ] = await prisma.$transaction([
            // Current period orders
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: currentPeriodStart,
                        lte: now,
                    },
                },
            }),
            // Previous period orders
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: previousPeriodStart,
                        lt: currentPeriodStart,
                    },
                },
            }),
            // Current period sales
            prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: currentPeriodStart,
                        lte: now,
                    },
                },
                _sum: {
                    netTotal: true,
                },
            }),
            // Previous period sales
            prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: previousPeriodStart,
                        lt: currentPeriodStart,
                    },
                },
                _sum: {
                    netTotal: true,
                },
            }),
            // Current period products (published)
            prisma.product.count({
                where: {
                    status: 'PUBLISHED',
                    createdAt: {
                        gte: currentPeriodStart,
                        lte: now,
                    },
                },
            }),
            // Previous period products
            prisma.product.count({
                where: {
                    status: 'PUBLISHED',
                    createdAt: {
                        gte: previousPeriodStart,
                        lt: currentPeriodStart,
                    },
                },
            }),
            // Weekly orders data (last 7 days)
            prisma.order.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: {
                        gte: weekStart,
                        lte: now,
                    },
                },
                _count: {
                    id: true,
                },
            }),
            // Weekly sales data
            prisma.order.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: {
                        gte: weekStart,
                        lte: now,
                    },
                },
                _sum: {
                    netTotal: true,
                },
            }),
            // Weekly products data (count by day)
            prisma.product.groupBy({
                by: ['createdAt'],
                where: {
                    status: 'PUBLISHED',
                    createdAt: {
                        gte: weekStart,
                        lte: now,
                    },
                },
                _count: {
                    id: true,
                },
            }),
        ]);

        // Calculate percentage changes
        const ordersChange =
            previousOrders === 0
                ? 100
                : ((currentOrders - previousOrders) / previousOrders) * 100;
        const salesChange =
            (previousSales._sum.netTotal || 0) === 0
                ? 100
                : (((currentSales._sum.netTotal || 0) -
                      (previousSales._sum.netTotal || 0)) /
                      (previousSales._sum.netTotal || 0)) *
                  100;
        const productsChange =
            previousProducts === 0
                ? 100
                : ((currentProducts - previousProducts) / previousProducts) *
                  100;

        // Prepare weekly data for charts
        const prepareWeeklyData = (
            data: any[],
            valueKey: string
        ): WeeklyDataPoint[] => {
            const weeklyMap = new Map<string, number>();

            // Initialize all 7 days with 0
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                const dayName = DAYS_OF_WEEK[date.getDay()];
                weeklyMap.set(dayName, 0);
            }

            // Populate with actual data
            data.forEach((item) => {
                const date = new Date(item.createdAt);
                const dayName = DAYS_OF_WEEK[date.getDay()];
                const currentValue = weeklyMap.get(dayName) || 0;
                const itemValue = item[valueKey] || 0;
                weeklyMap.set(dayName, currentValue + itemValue);
            });

            return Array.from(weeklyMap.entries()).map(([day, value]) => ({
                day,
                value,
            }));
        };

        const ordersWeeklyData = prepareWeeklyData(weeklyOrders, '_count');
        const salesWeeklyData = prepareWeeklyData(weeklySales, '_sum');
        const productsWeeklyData = prepareWeeklyData(weeklyProducts, '_count');

        const stats: DashboardStats = {
            orders: {
                current: currentOrders,
                previous: previousOrders,
                percentageChange: Math.round(ordersChange * 100) / 100,
                weeklyData: ordersWeeklyData,
            },
            sales: {
                current: Math.round((currentSales._sum.netTotal || 0) * 100) / 100,
                previous: Math.round((previousSales._sum.netTotal || 0) * 100) / 100,
                percentageChange: Math.round(salesChange * 100) / 100,
                weeklyData: salesWeeklyData,
            },
            products: {
                current: currentProducts,
                previous: previousProducts,
                percentageChange: Math.round(productsChange * 100) / 100,
                weeklyData: productsWeeklyData,
            },
        };

        return {
            status: 'success',
            code: 200,
            message: 'Dashboard stats retrieved successfully',
            data: stats,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

/**
 * Get sales report grouped by month for a specific year
 * @param year - The year to get sales report for
 * @returns Monthly sales data
 */
export const getSalesReport = async (
    year: number
): Promise<IResponse<SalesReportData[]>> => {
    try {
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
                netTotal: true,
            },
        });

        // Initialize all months with 0
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const monthlySales = monthNames.map((month) => ({
            month,
            sales: 0,
        }));

        // Aggregate sales by month
        orders.forEach((order) => {
            const monthIndex = new Date(order.createdAt).getMonth();
            monthlySales[monthIndex].sales += order.netTotal;
        });

        // Round sales to 2 decimal places
        monthlySales.forEach((item) => {
            item.sales = Math.round(item.sales * 100) / 100;
        });

        return {
            status: 'success',
            code: 200,
            message: 'Sales report retrieved successfully',
            data: monthlySales,
        };
    } catch (error) {
        console.error('Error fetching sales report:', error);
        throw error;
    }
};

/**
 * Get top selling products with ratings
 * @param limit - Number of products to return
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Top selling products
 */
export const getTopProducts = async (
    limit = 10,
    startDate?: Date,
    endDate?: Date
): Promise<IResponse<TopProduct[]>> => {
    try {
        // Build where clause for date filtering
        const whereClause: any = {};
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt.gte = startDate;
            if (endDate) whereClause.createdAt.lte = endDate;
        }

        // Get products with order count
        const products = await prisma.product.findMany({
            where: {
                status: 'PUBLISHED',
            },
            include: {
                images: {
                    take: 1,
                },
                orderItem: {
                    where: whereClause,
                    select: {
                        quantity: true,
                    },
                },
                reviews: {
                    where: {
                        status: 'APPROVED',
                    },
                    select: {
                        rating: true,
                    },
                },
            },
            take: limit * 3, // Get more to ensure we have enough after filtering
        });

        // Calculate total sold and average rating for each product
        const productsWithStats = products
            .map((product) => {
                const totalSold = product.orderItem.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                const ratings = product.reviews.map((r) => r.rating);
                const avgRating =
                    ratings.length > 0
                        ? ratings.reduce((sum, r) => sum + r, 0) /
                          ratings.length
                        : 0;

                return {
                    id: product.id,
                    name: product.name,
                    thumbnail:
                        product.images.length > 0
                            ? product.images[0].path
                            : '',
                    price: product.price,
                    salePrice: product.salePrice,
                    rating: Math.round(avgRating * 10) / 10,
                    totalSold,
                };
            })
            .filter((p) => p.totalSold > 0) // Only include products that have been sold
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, limit);

        return {
            status: 'success',
            code: 200,
            message: 'Top products retrieved successfully',
            data: productsWithStats,
        };
    } catch (error) {
        console.error('Error fetching top products:', error);
        throw error;
    }
};

/**
 * Get customer analytics showing new vs repeat customers by month
 * @param year - The year to get analytics for
 * @returns Monthly customer analytics data
 */
export const getCustomerAnalytics = async (
    year: number
): Promise<IResponse<CustomerAnalyticsData[]>> => {
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        // Get all orders for the year with user info
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                userId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Track first order date for each user
        const userFirstOrderMap = new Map<string, Date>();

        orders.forEach((order) => {
            const existingDate = userFirstOrderMap.get(order.userId);
            if (!existingDate || order.createdAt < existingDate) {
                userFirstOrderMap.set(order.userId, order.createdAt);
            }
        });

        // Initialize monthly data
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const monthlyData = monthNames.map((month) => ({
            month,
            newCustomer: 0,
            oldCustomer: 0,
        }));

        // Count new vs repeat customers per month
        orders.forEach((order) => {
            const monthIndex = new Date(order.createdAt).getMonth();
            const firstOrderDate = userFirstOrderMap.get(order.userId);

            if (
                firstOrderDate &&
                new Date(firstOrderDate).getMonth() === monthIndex &&
                new Date(firstOrderDate).getFullYear() === year
            ) {
                monthlyData[monthIndex].newCustomer++;
            } else {
                monthlyData[monthIndex].oldCustomer++;
            }
        });

        return {
            status: 'success',
            code: 200,
            message: 'Customer analytics retrieved successfully',
            data: monthlyData,
        };
    } catch (error) {
        console.error('Error fetching customer analytics:', error);
        throw error;
    }
};

/**
 * Get user geographic distribution by country
 * @returns User location data grouped by country
 */
export const getUserLocation = async (): Promise<
    IResponse<UserLocationData[]>
> => {
    try {
        // Get all addresses and group by country
        const addresses: any = await prisma.address.groupBy({
            by: ['country'],
            _count: {
                userId: true,
            },
        });

        // Calculate total users for percentage
        const totalUsers: number = addresses.reduce(
            (sum: number, addr: any) => sum + (addr._count?.userId || 0),
            0
        );

        // Map country codes to names (basic mapping - can be extended)
        const countryNameMap: Record<string, string> = {
            US: 'United States',
            CA: 'Canada',
            IN: 'India',
            CN: 'China',
            GB: 'United Kingdom',
            FR: 'France',
            DE: 'Germany',
            JP: 'Japan',
            AU: 'Australia',
            BR: 'Brazil',
            BD: 'Bangladesh',
            PK: 'Pakistan',
        };

        const locationData: UserLocationData[] = addresses
            .map((addr: any) => {
                const count = addr._count.userId as number;
                const percentage =
                    totalUsers > 0
                        ? Math.round((count / totalUsers) * 100 * 10) / 10
                        : 0;

                return {
                    country: addr.country.toUpperCase(),
                    name:
                        countryNameMap[addr.country.toUpperCase()] ||
                        addr.country,
                    value: percentage,
                };
            })
            .filter((loc: UserLocationData) => loc.value > 0)
            .sort((a: UserLocationData, b: UserLocationData) => b.value - a.value)
            .slice(0, 10); // Top 10 countries

        return {
            status: 'success',
            code: 200,
            message: 'User location data retrieved successfully',
            data: locationData,
        };
    } catch (error) {
        console.error('Error fetching user location:', error);
        throw error;
    }
};

/**
 * Get stock report showing products with low stock
 * @param page - Page number
 * @param limit - Items per page
 * @param threshold - Stock threshold (default 10)
 * @returns Low stock products with pagination
 */
export const getStockReport = async (
    page = 1,
    limit = 5,
    threshold = 10
): Promise<IResponse<StockReportProduct[]>> => {
    try {
        const skip = (page - 1) * limit;

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where: {
                    stock: {
                        lte: threshold,
                    },
                },
                include: {
                    images: {
                        take: 1,
                    },
                },
                orderBy: {
                    stock: 'asc',
                },
                skip,
                take: limit,
            }),
            prisma.product.count({
                where: {
                    stock: {
                        lte: threshold,
                    },
                },
            }),
        ]);

        const stockReport: StockReportProduct[] = products.map((product) => ({
            id: product.id,
            name: product.name,
            thumbnail:
                product.images.length > 0 ? product.images[0].path : '',
            stock: product.stock,
            status: product.status,
            price: product.price,
            salePrice: product.salePrice,
        }));

        return {
            status: 'success',
            code: 200,
            message: 'Stock report retrieved successfully',
            data: stockReport,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        };
    } catch (error) {
        console.error('Error fetching stock report:', error);
        throw error;
    }
};
