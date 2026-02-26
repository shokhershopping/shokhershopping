import { NextRequest, NextResponse } from 'next/server';
import {
  getDashboardStats,
  getSalesReport,
  getTopProducts,
  getStockReport,
  getUserLocation,
  getCustomerAnalytics,
} from 'firebase-config/services/dashboard.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    switch (type) {
      case 'stats': {
        const period = parseInt(searchParams.get('period') || '30', 10) || 30;
        const result = await getDashboardStats(period);
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }

      case 'sales-report': {
        const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
        const result = await getSalesReport(year);
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }

      case 'top-products': {
        const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        const result = await getTopProducts(limit, startDate, endDate);
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }

      case 'stock-report': {
        const threshold = parseInt(searchParams.get('threshold') || '10', 10) || 10;
        const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
        const page = parseInt(searchParams.get('page') || '1', 10) || 1;
        const result = await getStockReport(threshold, limit, page);
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }

      case 'user-location': {
        const result = await getUserLocation();
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }

      case 'customer-analytics': {
        const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
        const result = await getCustomerAnalytics(year);
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }

      default: {
        const result = await getDashboardStats();
        const statusCode = result.status === 'success' ? 200 : (result.code || 500);
        return NextResponse.json(result, { status: statusCode });
      }
    }
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch dashboard data', data: null },
      { status: 500 }
    );
  }
}
