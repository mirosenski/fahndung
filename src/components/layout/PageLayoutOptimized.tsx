"use client";

import React from "react";
import AdaptiveHeaderOptimized from "./archive/AdaptiveHeaderOptimized";
import ModernHeader from "./ModernHeader";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import { type Session } from "~/lib/auth";
import { Breadcrumb } from "~/components/ui/Breadcrumb";
import { layout, colors } from "~/lib/design-tokens";
import { cn } from "~/lib/utils";
import { HeaderPerformanceTest } from "./HeaderPerformanceTest";

interface PageLayoutOptimizedProps {
  children: React.ReactNode;
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session: Session | null | undefined;
  onLogout?: () => void;
  showHeader?: boolean;
  showBreadcrumb?: boolean;
  showHero?: boolean;
  showFooter?: boolean;
  showPerformanceTest?: boolean;
  className?: string;
}

export default function PageLayoutOptimized({
  children,
  variant = "home",
  session,
  onLogout,
  showHeader = true,
  showBreadcrumb = false,
  showHero = false,
  showFooter = true,
  showPerformanceTest = process.env.NODE_ENV === "development",
  className = "",
}: PageLayoutOptimizedProps) {
  const [headerVariant, setHeaderVariant] = useState<"modern" | "classic">(
    "modern",
  );

  useEffect(() => {
    const handleHeaderChange = (e: Event) => {
      const custom = e as CustomEvent<"modern" | "classic">;
      setHeaderVariant(custom.detail);
    };
    window.addEventListener(
      "header-variant-change",
      handleHeaderChange as EventListener,
    );

    const saved =
      (typeof window !== "undefined" &&
        localStorage.getItem("header-variant")) ||
      "modern";
    setHeaderVariant(saved as "modern" | "classic");

    return () =>
      window.removeEventListener(
        "header-variant-change",
        handleHeaderChange as EventListener,
      );
  }, []);

  return (
    <div className={cn("min-h-screen", colors.background.primary, className)}>
      {/* Optimized Header */}
      {showHeader &&
        (headerVariant === "modern" ? (
          <ModernHeader />
        ) : (
          <AdaptiveHeaderOptimized
            variant={variant}
            session={session}
            onLogout={onLogout}
          />
        ))}

      {/* Breadcrumb */}
      {showBreadcrumb && <Breadcrumb />}

      {/* Hero Section (für zukünftige Verwendung) */}
      {showHero && (
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
          <div className={layout.container}>
            <div className="py-12 text-center text-white">
              <h1 className="mb-4 text-4xl font-bold">Hero Section</h1>
              <p className="text-xl opacity-90">Zukünftige Hero-Komponente</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer variant={variant} />}

      {/* Performance Test (nur in Development) */}
      {showPerformanceTest && <HeaderPerformanceTest />}
    </div>
  );
}
