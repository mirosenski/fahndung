import type { Metadata } from "next";
import "~/styles/globals.css";
import "~/styles/fonts.css";
import "leaflet/dist/leaflet.css";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionManager } from "~/components/SessionManager";
import { Theme } from "@radix-ui/themes";
import { RealtimeSyncWrapper } from "~/components/RealtimeSyncWrapper";
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
          <Theme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SessionManager />
              <RealtimeSyncWrapper>{children}</RealtimeSyncWrapper>
            </ThemeProvider>
          </Theme>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
