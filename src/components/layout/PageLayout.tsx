"use client";

import React, { memo, useMemo } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useStableSession } from "~/hooks/useStableSession";
import AdaptiveHeaderOptimized from "./AdaptiveHeaderOptimized";
import Footer from "./Footer";
import { type Session } from "~/lib/auth";
import { layout, colors } from "~/lib/design-tokens";
import { cn } from "~/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null | undefined;
  onLogout?: () => void;
  showHeader?: boolean;
  showBreadcrumb?: boolean;
  showHero?: boolean;
  showFooter?: boolean;
  className?: string;
}

// Memoized PageLayout für bessere Performance
const PageLayout = memo(function PageLayout({
  children,
  variant = "home",
  session: externalSession,
  onLogout,
  showHeader = true,
  showBreadcrumb = false,
  showHero = false,
  showFooter = true,
  className = "",
}: PageLayoutProps) {
  const { logout } = useAuth();
  
  // Verwende stabile Session für bessere Performance
  const { session } = useStableSession(externalSession);

  // Memoized Header für bessere Performance
  const headerComponent = useMemo(() => {
    if (!showHeader) return null;
    
    return (
      <AdaptiveHeaderOptimized 
        variant={variant} 
        session={session} 
        onLogout={onLogout ?? logout} 
      />
    );
  }, [showHeader, variant, session, onLogout, logout]);

  // Memoized Footer für bessere Performance
  const footerComponent = useMemo(() => {
    if (!showFooter) return null;
    
    return <Footer variant={variant} />;
  }, [showFooter, variant]);

  // Memoized Hero Section für bessere Performance
  const heroComponent = useMemo(() => {
    if (!showHero) return null;
    
    return (
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
        <div className={layout.container}>
          <div className="py-12 text-center text-white">
            <h1 className="mb-4 text-4xl font-bold">Hero Section</h1>
            <p className="text-xl opacity-90">Zukünftige Hero-Komponente</p>
          </div>
        </div>
      </div>
    );
  }, [showHero]);

  return (
    <div className={cn("min-h-screen", colors.background.primary, className)}>
      {/* Optimized Header */}
      {headerComponent}

      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="border-b border-border bg-white px-4 py-2 dark:border-border dark:bg-muted">
          {/* Breadcrumb Component würde hier eingefügt */}
        </div>
      )}

      {/* Hero Section */}
      {heroComponent}

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {footerComponent}
    </div>
  );
});

export default PageLayout;
