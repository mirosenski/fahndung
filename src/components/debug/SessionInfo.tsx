"use client";

import React from "react";
import { useAuth } from "~/hooks/useAuth";

export default function SessionInfo() {
  const { session, isAuthenticated, loading } = useAuth();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        🔍 Session Info (Dev)
      </h3>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div>Loading: {loading ? "✅" : "❌"}</div>
        <div>Authentifiziert: {isAuthenticated ? "✅" : "❌"}</div>
        <div>Session: {session ? "✅" : "❌"}</div>
        {session && (
          <>
            <div>User ID: {session.user?.id ?? "N/A"}</div>
            <div>Email: {session.user?.email ?? "N/A"}</div>
            <div>Rolle: {session.profile?.role ?? "N/A"}</div>
          </>
        )}
      </div>
    </div>
  );
}
