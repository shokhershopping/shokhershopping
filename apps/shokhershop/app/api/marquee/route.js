import { NextResponse } from "next/server";
import { getActiveMarquees } from "firebase-config/services/marquee.service";

export async function GET() {
  try {
    const result = await getActiveMarquees();
    const statusCode = result.status === "success" ? 200 : result.code || 500;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("GET /api/marquee error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch marquees", data: null },
      { status: 500 }
    );
  }
}
