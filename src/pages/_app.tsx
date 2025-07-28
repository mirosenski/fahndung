import { type AppType } from "next/app";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Theme } from "@radix-ui/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "~/styles/globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const MyApp: AppType = ({
  Component,
  pageProps,
}) => {
  return (
    <TRPCReactProvider>
      <Theme>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
            <Component {...pageProps} />
          </div>
        </ThemeProvider>
      </Theme>
    </TRPCReactProvider>
  );
};

export default MyApp; 