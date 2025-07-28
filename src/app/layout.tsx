import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionManager } from "~/components/SessionManager";
import { Theme } from "@radix-ui/themes";
// Der Import von GlobalErrorHandler wurde entfernt, da das Modul nicht gefunden werden kann.

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <TRPCReactProvider>
          <Theme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SessionManager />
              {children}
            </ThemeProvider>
          </Theme>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
