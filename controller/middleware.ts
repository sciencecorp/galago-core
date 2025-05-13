import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip authentication for public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  try {
    // Try NextAuth JWT token first
    const token = await getToken({ req: request });
    
    console.log("NextAuth token check:", token ? "Found" : "Not found");
    
    if (token) {
      // NextAuth token exists - check admin status for protected routes
      const isAdminRoute = pathname.startsWith("/settings");
      const isAdmin = token?.isAdmin === true;

      if (isAdminRoute && !isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      return NextResponse.next();
    }
    
    // No NextAuth token, check for custom JWT in cookies
    const customToken = request.cookies.get("token")?.value;
    
    if (customToken) {
      console.log("Custom token found in cookies");
      // We have a custom token, allow the request to continue
      // The client-side useAuth hook will verify its validity
      return NextResponse.next();
    }
    
    // No authentication found - redirect to login
    console.log("No authentication found, redirecting to login");
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Auth middleware error:", error);
    // In case of any errors, redirect to login
    const url = new URL("/auth/signin", request.url);
    return NextResponse.redirect(url);
  }
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Skip all internal paths (_next, API routes)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 