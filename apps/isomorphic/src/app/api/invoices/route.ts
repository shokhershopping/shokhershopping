import { NextRequest, NextResponse } from 'next/server';
import {
  getInvoicesByOrderId,
  createInvoice,
} from 'firebase-config/services/invoice.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { status: 'error', message: 'orderId is required', data: null },
        { status: 400 }
      );
    }

    const result = await getInvoicesByOrderId(orderId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/invoices error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch invoices', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, type, printedBy } = body;

    if (!orderId || !type) {
      return NextResponse.json(
        { status: 'error', message: 'orderId and type are required', data: null },
        { status: 400 }
      );
    }

    const result = await createInvoice(orderId, type, printedBy);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/invoices error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create invoice', data: null },
      { status: 500 }
    );
  }
}
