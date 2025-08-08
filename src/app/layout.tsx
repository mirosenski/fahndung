import type { Metadata } from "next";
import "~/styles/globals.css";
import "~/styles/fonts.css";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionManager } from "~/components/SessionManager";
import { RealtimeSyncWrapper } from "~/components/RealtimeSyncWrapper";
import { OptimizedLayout } from "~/components/layout/OptimizedLayout";
import { PerformanceMonitor } from "~/components/PerformanceMonitor";
import { DevToolsSuppressor } from "~/components/debug/DevToolsSuppressor";
// Der Import von GlobalErrorHandler wurde entfernt, da das Modul nicht gefunden werden kann.

export const metadata: Metadata = {
  title: "Fahndung - PTLS",
  description: "Polizei-Technisches Logistik-System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {/* Skip-Link for better accessibility. When focused (via Tab key), this becomes visible
         and allows users using screen readers or keyboard navigation to jump directly
         to the main content area. */}
        <a
          href="#mainContent"
          className="sr-only focus:not-sr-only absolute top-0 left-0 z-50 m-2 rounded bg-primary px-4 py-2 text-sm font-medium text-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
        >
          Zum Hauptinhalt springen
        </a>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionManager />
            <RealtimeSyncWrapper>
              <OptimizedLayout>
                {/* Performance and DevTools components remain outside main region */}
                <PerformanceMonitor />
                <DevToolsSuppressor />
                {/* Main content of every page; the skip link targets this element */}
                <main id="mainContent" className="min-h-screen">
                  {children}
                </main>
              </OptimizedLayout>
            </RealtimeSyncWrapper>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
