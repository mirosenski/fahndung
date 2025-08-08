"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            color: "#000000",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "2rem" }}>⚠️</div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              Ein Fehler ist aufgetreten
            </h1>
            <p style={{ marginBottom: "2rem", color: "#666666" }}>
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es
              erneut.
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  try {
                    reset();
                  } catch (resetError) {
                    console.error("Reset failed:", resetError);
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Erneut versuchen
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6b7280",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
