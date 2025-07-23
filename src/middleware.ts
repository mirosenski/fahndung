import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // CORS-Headers für alle API-Routen
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // CORS-Headers hinzufügen
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-trpc-source",
    );
    response.headers.set("Access-Control-Max-Age", "86400");

    // OPTIONS-Requests für CORS-Preflight behandeln
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200 });
    }

    // tRPC-spezifische Behandlung
    if (request.nextUrl.pathname.startsWith("/api/trpc/")) {
      // Verbesserte Authentifizierungsbehandlung für tRPC
      const authHeader = request.headers.get("Authorization");

      if (authHeader?.startsWith("Bearer ")) {
        // Token ist vorhanden - lass die tRPC-Route es verarbeiten
        response.headers.set("X-Auth-Status", "token-present");
      } else {
        // Kein Token - tRPC wird UNAUTHORIZED zurückgeben
        response.headers.set("X-Auth-Status", "no-token");
      }
    }

    return response;
  }

  // Auth-spezifische Routen behandeln
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const response = NextResponse.next();

    // CORS-Headers für Auth-Routen
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    // Verbesserte 403-Fehler-Behandlung für Auth-Endpoints
    if (request.nextUrl.pathname.includes("/logout")) {
      // Für Logout-Endpoints spezielle Behandlung
      response.headers.set("X-Auth-Status", "logout");
    }

    return response;
  }

  // Supabase Auth-Endpoints behandeln
  if (request.nextUrl.pathname.includes("/auth/v1/")) {
    const response = NextResponse.next();

    // Spezielle Headers für Supabase Auth
    response.headers.set("X-Supabase-Auth", "true");

    // 403-Fehler für Auth-Endpoints als normal behandeln
    if (request.nextUrl.pathname.includes("/logout")) {
      response.headers.set("X-Logout-Status", "processing");
    }

    return response;
  }

  // Standard-Behandlung für andere Routen
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
