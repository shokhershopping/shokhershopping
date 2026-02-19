import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/product-detail",
  "/shop",
  "/contact",
  "/about-us",
  "/faq-1",
  "/terms-conditions",
  "/privacy-policy",
  "/shipping-delivery",
  "/delivery-return",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = req.cookies.get("__session");
  if (!session?.value) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
