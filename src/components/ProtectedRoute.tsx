"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: ("user" | "editor" | "admin" | "super_admin")[];
}

export default function ProtectedRoute({
  children,
  fallback,
  requiredRoles,
}: ProtectedRouteProps) {
  const { session, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔐 ProtectedRoute: Prüfe Authentifizierung...", {
      loading,
      initialized,
      hasSession: !!session,
      requiredRoles,
      userRole: session?.profile?.role,
    });

    if (initialized && !loading && !session) {
      console.log("❌ ProtectedRoute: Keine Session - Weiterleitung zu Login");
      router.push("/login");
      return;
    }

    // Rollenprüfung nur wenn Session vorhanden und Rollen erforderlich
    if (session && requiredRoles && requiredRoles.length > 0) {
      const userRole = session.profile?.role as string;
      const hasRequiredRole = requiredRoles.includes(
        userRole as "user" | "admin" | "editor" | "super_admin",
      );

      console.log("🔐 ProtectedRoute: Rollenprüfung", {
        userRole,
        requiredRoles,
        hasRequiredRole,
      });

      if (!hasRequiredRole) {
        console.log(
          "❌ ProtectedRoute: Unzureichende Berechtigung - Weiterleitung zu Dashboard",
        );
        router.push("/dashboard");
        return;
      }
    }
  }, [session, loading, initialized, router, requiredRoles]);

  // Loading state für Hydration
  if (!initialized || loading) {
    return (
      fallback ?? (
        <div className="min-h-screen bg-gray-900 text-white">
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-4xl">🔄</div>
              <div className="text-xl font-semibold">Lade...</div>
              <div className="mt-2 text-gray-400">
                {!initialized
                  ? "Initialisiere..."
                  : "Prüfe Authentifizierung..."}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  // Wenn keine Session nach Initialisierung
  if (!session) {
    return (
      fallback ?? (
        <div className="min-h-screen bg-gray-900 text-white">
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-4xl">🔐</div>
              <div className="text-xl font-semibold">Nicht authentifiziert</div>
              <div className="mt-2 text-gray-400">
                Weiterleitung zu Login...
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  // Rollenprüfung für Fallback-UI
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = session.profile?.role as string;
    const hasRequiredRole = requiredRoles.includes(
      userRole as "user" | "admin" | "editor" | "super_admin",
    );

    if (!hasRequiredRole) {
      return (
        fallback ?? (
          <div className="min-h-screen bg-gray-900 text-white">
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-4xl">🚫</div>
                <div className="text-xl font-semibold">
                  Unzureichende Berechtigung
                </div>
                <div className="mt-2 text-gray-400">
                  Sie haben nicht die erforderlichen Rechte für diese Seite.
                </div>
              </div>
            </div>
          </div>
        )
      );
    }
  }

  // Session vorhanden und Berechtigung ok - Rendere Children
  return <>{children}</>;
}
