import { NextResponse } from "next/server";
import { getActiveBanners } from "firebase-config/services/banner.service";

export async function GET() {
  try {
    const result = await getActiveBanners();
    const statusCode = result.status === "success" ? 200 : result.code || 500;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch banners", data: null },
      { status: 500 }
    );
  }
}
