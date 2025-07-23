"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { session, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔐 ProtectedRoute: Prüfe Authentifizierung...", {
      loading,
      initialized,
      hasSession: !!session,
    });

    if (initialized && !loading && !session) {
      console.log("❌ ProtectedRoute: Keine Session - Weiterleitung zu Login");
      router.push("/login");
    }
  }, [session, loading, initialized, router]);

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

  // Session vorhanden - Rendere Children
  return <>{children}</>;
}
