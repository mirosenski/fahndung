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
                <PerformanceMonitor />
                <DevToolsSuppressor />
                {children}
              </OptimizedLayout>
            </RealtimeSyncWrapper>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
