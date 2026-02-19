import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById } from 'firebase-config/services/invoice.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getInvoiceById(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch invoice', data: null },
      { status: 500 }
    );
  }
}
