import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/product-detail",
  "/shop",
  "/shop-default",
  "/checkout",
  "/contact",
  "/about-us",
  "/faq-1",
  "/faq-2",
  "/terms-conditions",
  "/privacy-policy",
  "/shipping-delivery",
  "/delivery-return",
  "/compare",
  "/brands",
  "/brands-v2",
  "/blog-grid",
  "/blog-list",
  "/blog-sidebar-left",
  "/blog-sidebar-right",
  "/blog-detail",
  "/home-02",
  "/home-03",
  "/home-04",
  "/home-05",
  "/home-06",
  "/home-07",
  "/home-08",
  "/home-accessories",
  "/home-activewear",
  "/home-baby",
  "/home-bookstore",
  "/home-camp-and-hike",
  "/home-ceramic",
  "/home-cosmetic",
  "/home-decor",
  "/home-dog-accessories",
  "/home-electric-bike",
  "/home-electronic",
  "/home-food",
  "/home-footwear",
  "/home-furniture",
  "/home-furniture-02",
  "/home-gaming-accessories",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

export default function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Allow API routes to handle their own auth
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Allow static assets and Next.js internals
    if (pathname.startsWith("/_next/") || pathname.includes(".")) {
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
  } catch {
    // If middleware fails, allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Only match page routes, skip all static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
