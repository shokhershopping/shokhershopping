import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from 'firebase-config/services/order.service';

/**
 * GET /api/transactions - Get orders as transactions
 * Pulls from the orders collection and maps to transaction format
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '50', 10) || 50;
    const status = searchParams.get('status') || undefined;

    const result = await getOrders(limit, page, {
      status: status as any,
    });

    if (result.status === 'success' && Array.isArray(result.data)) {
      // Map orders to transaction format
      const transactions = result.data.map((order: any) => ({
        id: order.id,
        orderId: order.id,
        customer: {
          name: order.userName || 'Unknown',
          email: order.userEmail || '',
        },
        date: order.createdAt?._seconds
          ? new Date(order.createdAt._seconds * 1000).toISOString()
          : order.createdAt,
        amount: order.netTotal || order.total || 0,
        currency: 'BDT',
        paymentMethod: order.transaction?.paymentMethod || 'COD',
        transactionStatus: order.transaction?.status || 'Pending',
        orderStatus: order.status || 'PENDING',
      }));

      return NextResponse.json(
        {
          status: 'success',
          data: transactions,
          total: (result as any).total,
          page: (result as any).page,
          limit: (result as any).limit,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch transactions', data: null },
      { status: 500 }
    );
  }
}
