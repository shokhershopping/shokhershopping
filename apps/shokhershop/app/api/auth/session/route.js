import { NextResponse } from "next/server";
import { createSessionCookie } from "firebase-config/auth";

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Create a session cookie that expires in 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await createSessionCookie(idToken, expiresIn);

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}
