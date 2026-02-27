import { NextResponse } from 'next/server';
import { getSettings } from 'firebase-config/services/settings.service';

export async function GET() {
  try {
    const result = await getSettings();
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch settings', data: null },
      { status: 500 }
    );
  }
}
