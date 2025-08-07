"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import { Eye, EyeOff, Menu, Plus, X } from "lucide-react";
import { Logo } from "../ui/Logo";
import { FontSizeToggle } from "../ui/FontSizeToggle";
import { SystemThemeToggle } from "../ui/SystemThemeToggle";
import { DesktopMegaMenu } from "../ui/megamenu/DesktopMegaMenu";
import { MobileDrawerMenu } from "../ui/megamenu/MobileDrawerMenu";
import { DesktopOffcanvasMenu } from "../ui/megamenu/DesktopOffcanvasMenu";

import { useRouter, usePathname } from "next/navigation";
import { type Session } from "~/lib/auth";

import { useStableSession } from "~/hooks/useStableSession";

interface AdaptiveHeaderProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
  onLogout?: () => void;
}

// OPTIMIERTER Scroll Hook - Eliminiert Zittern mit RequestAnimationFrame
const useOptimizedScroll = (threshold = 50) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Hydration-Sicherheit: Erst nach Client-Side Mount aktivieren
  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateScrollState = useCallback(() => {
    if (!isClient) return;

    const currentScrollY = window.scrollY;
    const shouldBeScrolled = currentScrollY > threshold;

    // Nur aktualisieren wenn sich der Zustand wirklich ändert
    if (isScrolled !== shouldBeScrolled) {
      setIsScrolled(shouldBeScrolled);
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [isScrolled, threshold, isClient]);

  const handleScroll = useCallback(() => {
    if (!ticking.current && isClient) {
      window.requestAnimationFrame(updateScrollState);
      ticking.current = true;
    }
  }, [updateScrollState, isClient]);

  useEffect(() => {
    if (!isClient) return;

    // Passive Listener für bessere Performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    updateScrollState();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, updateScrollState, isClient]);

  // Beim SSR immer false zurückgeben, um Hydration-Fehler zu vermeiden
  return isClient ? isScrolled : false;
};

// Throttle-Funktion für Performance (entfernt - ungenutzt)

// Meta-Bar Component (immer sichtbar)
const MetaAccessibilityBar = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={`
      w-full overflow-hidden bg-[#EEEEEE] text-gray-700 transition-all duration-500
      ease-out dark:bg-gray-900 dark:text-gray-200
      ${isVisible ? "h-8 opacity-100" : "h-0 opacity-0"}
    `}
    >
      <div className="container mx-auto flex h-8 items-center justify-between px-4">
        {/* Links: Gebärdensprache, Leichte Sprache & Textvergrößerung */}
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/gebaerdensprache"
            className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:ring-offset-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:ring-offset-gray-900"
            tabIndex={1}
          >
            <svg className="h-3 w-3" viewBox="0 0 7.15 7.7" fill="currentColor">
              <path d="M5.13.07c.08-.06.18-.09.27-.05.05.02.09.07.1.12.01.06,0,.13-.03.19-.1.16-.21.3-.32.45-.16.21-.32.42-.46.64-.09.14-.19.28-.27.43-.02.04-.04.1-.02.14.01.03.04.03.07.03.02-.02.04-.03.06-.05.47-.46.94-.9,1.43-1.34.09-.08.18-.16.28-.23.06-.04.13-.05.2-.04.06.02.1.06.13.11.02.04.03.08.02.13-.01.07-.06.13-.11.19-.08.08-.15.16-.23.24-.13.13-.24.26-.37.38-.16.16-.31.31-.46.47-.15.15-.3.3-.44.45-.04.05-.08.09-.11.15-.01.03.02.06.04.07.04,0,.07-.02.11-.03.18-.1.35-.22.53-.34.36-.24.72-.49,1.09-.72.07-.04.14-.08.23-.08.08,0,.16.05.18.13.03.07.01.14-.03.2-.04.06-.09.1-.14.14-.28.24-.57.46-.86.68-.24.18-.48.35-.72.54-.03.03-.08.07-.08.12,0,.05.05.07.09.07.07,0,.14-.03.21-.05.43-.15.86-.3,1.3-.45.08-.03.17-.04.25,0,.04.02.07.06.08.1.02.05,0,.1-.03.14-.08.12-.21.17-.33.24-.15.08-.31.16-.47.23-.06.03-.12.06-.19.09-.15.07-.31.15-.46.22-.12.06-.24.11-.36.17-.01,0-.02.01-.02.02,0,0,0,0-.01,0-.04.02-.09.05-.13.07-.19.1-.37.21-.54.33-.09.06-.18.12-.27.17-.04.02-.08.04-.12.07-.01,0-.02.01-.03.02-.07.04-.15.06-.23.06-.22-.02-.43-.06-.64-.11-.2-.05-.4-.1-.6-.16,0,0-.01,0-.01-.01.01,0,.03,0,.04-.01.03-.01.05-.02.08-.03.06-.02.11-.05.16-.08.25-.12.49-.28.65-.51.06-.1.11-.21.1-.32,0-.09-.04-.18-.12-.23-.07-.05-.15-.05-.23-.04-.07.02-.12.06-.18.09-.07.04-.14.07-.22.11-.19.09-.39.17-.59.24-.24.08-.49.16-.75.19-.02,0-.04,0-.05,0,.06-.07.13-.14.17-.22.11-.18.16-.38.19-.59.03-.16.05-.32.1-.48.05-.16.11-.32.17-.48.09-.27.16-.55.22-.83.03-.12.05-.24.07-.36.01-.07.02-.14.04-.21.01-.04.04-.08.08-.09.05-.02.11,0,.16.04.1.08.15.21.17.33.01.11.02.21,0,.32-.01.2-.05.39-.1.58-.02.12-.05.24-.01.36,0,0,0,.02.01.02.02.05.07.08.12.09.05,0,.11,0,.16-.02.14-.07.25-.19.36-.3.07-.08.14-.17.21-.26.21-.27.42-.54.64-.8.17-.21.34-.41.53-.6.08-.09.16-.18.26-.26Z" />
              <path d="M3.35,3.36s.09-.02.12.02c.03.04.03.1.02.15-.02.1-.08.18-.15.25-.1.11-.22.19-.35.27-.16.09-.33.16-.5.23-.05.02-.09.06-.09.11,0,.05.04.1.09.12.24.1.5.15.76.22.48.11.96.22,1.43.36.16.05.32.09.47.16.04.02.08.06.1.11.02.08-.02.18-.1.21-.06.02-.12,0-.18,0-.13-.02-.26-.05-.39-.08-.23-.05-.46-.09-.69-.14-.2-.04-.41-.09-.61-.12-.04,0-.09-.01-.12.02-.03.02-.03.06-.01.08.04.05.1.07.15.09.38.16.76.3,1.14.47.09.04.18.08.27.12.05.02.09.04.14.07.08.04.18.08.22.16.03.07.01.16-.04.21-.04.05-.11.07-.17.07-.12-.01-.23-.06-.34-.1-.52-.18-1.03-.37-1.54-.57-.05-.02-.12-.04-.17,0-.02.03-.01.08.02.1.08.08.18.14.27.2.26.16.52.31.78.46.13.07.26.15.38.22.06.04.12.07.17.11.03.03.05.06.05.1,0,.07-.04.14-.1.18-.05.04-.12.03-.18.01-.09-.03-.18-.08-.27-.12-.02,0-.04-.02-.05-.03-.07-.03-.13-.07-.2-.1-.02-.01-.04-.02-.07-.03-.12-.06-.23-.12-.35-.18-.05-.03-.11-.06-.16-.09-.08-.05-.17-.09-.25-.14-.08-.05-.17-.09-.25-.14-.05-.03-.1-.06-.16-.08-.04,0-.09.03-.07.07.03.07.09.12.14.17.19.18.38.36.57.54.1.1.2.19.29.29.03.04.07.08.08.13.02.07-.03.14-.09.16-.08.03-.16,0-.23-.04-.14-.08-.26-.19-.39-.29-.16-.13-.31-.26-.47-.39,0,0-.01,0-.02,0h.01c-.15-.12-.29-.25-.45-.35-.03-.02-.07-.04-.1-.06-.17-.1-.35-.19-.54-.27-.22-.1-.43-.21-.62-.37-.17-.14-.33-.31-.44-.5-.01-.03-.03-.05-.04-.08-.01-.02-.02-.05-.04-.07,0-.03.02-.04.04-.06.17-.19.33-.39.45-.62,0,0,0-.02.01-.02.04-.08.09-.17.1-.26.13.03.27,0,.39-.04.11-.04.22-.08.33-.13.09-.05.18-.11.28-.14.03-.01.07-.02.1-.02.21-.04.43-.09.63-.17.27-.1.54-.21.79-.34.08-.04.15-.08.22-.11Z" />
            </svg>
            <span className="hidden sm:inline">Gebärdensprache</span>
          </Link>
          <Link
            href="/leichte-sprache"
            className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:ring-offset-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:ring-offset-gray-900"
            tabIndex={2}
          >
            <svg className="h-3 w-3" viewBox="0 0 7.24 7.7" fill="currentColor">
              <circle cx="3.62" cy="1.22" r="1.22" />
              <path d="M0,2.32v4.13c.54,0,1.49.06,2.46.61.36.2.65.43.88.64V3.51c-.22-.19-.48-.39-.81-.57-.95-.53-1.98-.61-2.53-.61Z" />
              <path d="M3.9,3.51v4.19c.23-.21.52-.44.88-.64.98-.55,1.93-.62,2.46-.61V2.32c-.55,0-1.59.08-2.53.61-.32.18-.59.38-.81.57Z" />
            </svg>
            <span className="hidden sm:inline">Leichte Sprache</span>
          </Link>
          <FontSizeToggle />
        </div>

        {/* Rechts: System Theme Toggle */}
        <div className="flex items-center gap-4 text-xs">
          <SystemThemeToggle />
        </div>
      </div>
    </div>
  );
};

// Adaptive Desktop Header (freistehend → sticky full-width)
const AdaptiveDesktopHeader = ({
  isScrolled,
  session: externalSession,
  showMetaBar,
  setShowMetaBar,
  isMenuOpen,
  setIsMenuOpen,
}: {
  isScrolled: boolean;
  session?: Session | null;
  showMetaBar: boolean;
  setShowMetaBar: (show: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // RADIKALE LÖSUNG: Verwende useStableSession für stabile Session-Behandlung
  const {
    session: currentSession,
    isAuthenticated,
    loading,
  } = useStableSession(externalSession);

  // OPTIMIERTE LÖSUNG: Memoized Avatar-Bereich mit stabiler Höhe
  const renderUserActions = useMemo(() => {
    if (loading) {
      // Loading state - zeige nichts um Flackern zu vermeiden
      return (
        <div className="flex h-9 items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      );
    }

    if (isAuthenticated && currentSession) {
      return (
        <div className="flex h-9 items-center gap-3">
          {/* Fahndung Button - für Editor, Admin und Super Admin */}
          {(currentSession?.profile?.role === "editor" ||
            currentSession?.profile?.role === "admin" ||
            currentSession?.profile?.role === "super_admin") &&
            !pathname?.startsWith("/fahndungen/neu") && (
              <button
                onClick={() => {
                  // 🚀 PREFETCH FÜR SCHNELLERE NAVIGATION
                  router.prefetch("/fahndungen/neu/enhanced");
                  
                  // 🚀 SOFORTIGE NAVIGATION
                  router.push("/fahndungen/neu/enhanced");
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                <span>Fahndung</span>
              </button>
            )}

          {/* Hamburger Menu Button - auch für angemeldete Benutzer */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            aria-controls="desktop-offcanvas-menu"
          >
            <Menu className="h-4 w-4" />
            <span>Menü</span>
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex h-9 items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            aria-controls="desktop-offcanvas-menu"
          >
            <Menu className="h-4 w-4" />
            <span>Menü</span>
          </button>
        </div>
      );
    }
  }, [
    loading,
    isAuthenticated,
    currentSession,
    pathname,
    router,
    isMenuOpen,
    setIsMenuOpen,
  ]);

  return (
    <div
      className={`
      hidden w-full lg:block
      ${isScrolled ? "sticky top-0 z-50" : "relative"}
    `}
    >
      {/* Meta Accessibility Bar - im normalen Zustand immer sichtbar, im Sticky-Zustand nur wenn eingeblendet */}
      {(!isScrolled || showMetaBar) && (
        <div
          className={`
            ${isScrolled ? "w-full" : "w-full"}
          `}
        >
          <MetaAccessibilityBar isVisible={!isScrolled || showMetaBar} />
        </div>
      )}

      {/* Abstand zwischen Meta-Navigation und Header - nur im nicht-sticky Zustand */}
      {!isScrolled && (
        <div className="container mx-auto px-4">
          <div className="h-6 bg-transparent dark:bg-transparent"></div>
        </div>
      )}

      {/* Header Container - im freistehenden Zustand direkt an Meta-Navigation */}
      <div
        className={`
            ${isScrolled ? "w-full" : "container mx-auto rounded-b-2xl px-4"}
          `}
      >
        <div
          className={`
            border border-gray-100 bg-gray-50 shadow-sm
            transition-all duration-500 ease-out hover:shadow-md
            dark:border-gray-700 dark:bg-gray-900
            ${isScrolled ? "w-full rounded-none border-0" : "rounded-b-2xl rounded-t-2xl"}
          `}
          style={{
            // Hardware-Acceleration für smoothe Performance
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            perspective: 1000,
          }}
        >
          <div
            className={`flex w-full items-center justify-between ${isScrolled ? "px-6 py-0" : "px-6 py-1"}`}
          >
            {/* Logo - adaptiert Größe */}
            <div className="flex-shrink-0">
              <Logo className="text-foreground" showLink={true} />
            </div>

            {/* Navigation */}
            <nav
              className="flex items-center gap-4"
              role="navigation"
              aria-label="Hauptnavigation"
            >
              {/* Desktop Mega Menu */}
              <DesktopMegaMenu />

              {/* Right Actions */}
              <div className="ml-6 flex items-center gap-3">
                {renderUserActions}

                {/* A11y Button - nur im Sticky-Zustand sichtbar */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    isScrolled ? "h-8 w-8 opacity-100" : "h-8 w-0 opacity-0"
                  }`}
                >
                  {isScrolled && (
                    <button
                      onClick={() => setShowMetaBar(!showMetaBar)}
                      className="relative h-full w-full touch-manipulation select-none rounded-xl border border-gray-200 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                      title={
                        showMetaBar
                          ? "Barrierefreiheit ausblenden"
                          : "Barrierefreiheit anzeigen"
                      }
                      aria-label={
                        showMetaBar
                          ? "Barrierefreiheit ausblenden"
                          : "Barrierefreiheit anzeigen"
                      }
                    >
                      <div className="duration-400 transition-all ease-out">
                        {showMetaBar ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Header mit integrierten Meta-Controls
const ResponsiveMobileHeader = ({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) => {
  const [showMetaControls, setShowMetaControls] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full rounded-xl border-b border-gray-100 bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 lg:hidden">
      {/* Meta Controls Bar (mobile) - Gleiche Elemente wie Desktop */}
      {showMetaControls && (
        <div className="bg-gray-200 px-4 py-2 text-gray-800 dark:bg-[#020618] dark:text-slate-200">
          <div className="flex items-center justify-between text-xs">
            {/* Links: Gebärdensprache, Leichte Sprache & Textvergrößerung */}
            <div className="flex items-center gap-3">
              <Link
                href="/gebaerdensprache"
                className="rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:ring-offset-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:ring-offset-slate-900"
                title="Gebärdensprache"
                aria-label="Gebärdensprache"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 7.15 7.7"
                  fill="currentColor"
                >
                  <path d="M5.13.07c.08-.06.18-.09.27-.05.05.02.09.07.1.12.01.06,0,.13-.03.19-.1.16-.21.3-.32.45-.16.21-.32.42-.46.64-.09.14-.19.28-.27.43-.02.04-.04.1-.02.14.01.03.04.03.07.03.02-.02.04-.03.06-.05.47-.46.94-.9,1.43-1.34.09-.08.18-.16.28-.23.06-.04.13-.05.2-.04.06.02.1.06.13.11.02.04.03.08.02.13-.01.07-.06.13-.11.19-.08.08-.15.16-.23.24-.13.13-.24.26-.37.38-.16.16-.31.31-.46.47-.15.15-.3.3-.44.45-.04.05-.08.09-.11.15-.01.03.02.06.04.07.04,0,.07-.02.11-.03.18-.1.35-.22.53-.34.36-.24.72-.49,1.09-.72.07-.04.14-.08.23-.08.08,0,.16.05.18.13.03.07.01.14-.03.2-.04.06-.09.1-.14.14-.28.24-.57.46-.86.68-.24.18-.48.35-.72.54-.03.03-.08.07-.08.12,0,.05.05.07.09.07.07,0,.14-.03.21-.05.43-.15.86-.3,1.3-.45.08-.03.17-.04.25,0,.04.02.07.06.08.1.02.05,0,.1-.03.14-.08.12-.21.17-.33.24-.15.08-.31.16-.47.23-.06.03-.12.06-.19.09-.15.07-.31.15-.46.22-.12.06-.24.11-.36.17-.01,0-.02.01-.02.02,0,0,0,0-.01,0-.04.02-.09.05-.13.07-.19.1-.37.21-.54.33-.09.06-.18.12-.27.17-.04.02-.08.04-.12.07-.01,0-.02.01-.03.02-.07.04-.15.06-.23.06-.22-.02-.43-.06-.64-.11-.2-.05-.4-.1-.6-.16,0,0-.01,0-.01-.01.01,0,.03,0,.04-.01.03-.01.05-.02.08-.03.06-.02.11-.05.16-.08.25-.12.49-.28.65-.51.06-.1.11-.21.1-.32,0-.09-.04-.18-.12-.23-.07-.05-.15-.05-.23-.04-.07.02-.12.06-.18.09-.07.04-.14.07-.22.11-.19.09-.39.17-.59.24-.24.08-.49.16-.75.19-.02,0-.04,0-.05,0,.06-.07.13-.14.17-.22.11-.18.16-.38.19-.59.03-.16.05-.32.1-.48.05-.16.11-.32.17-.48.09-.27.16-.55.22-.83.03-.12.05-.24.07-.36.01-.07.02-.14.04-.21.01-.04.04-.08.08-.09.05-.02.11,0,.16.04.1.08.15.21.17.33.01.11.02.21,0,.32-.01.2-.05.39-.1.58-.02.12-.05.24-.01.36,0,0,0,.02.01.02.02.05.07.08.12.09.05,0,.11,0,.16-.02.14-.07.25-.19.36-.3.07-.08.14-.17.21-.26.21-.27.42-.54.64-.8.17-.21.34-.41.53-.6.08-.09.16-.18.26-.26Z" />
                  <path d="M3.35,3.36s.09-.02.12.02c.03.04.03.1.02.15-.02.1-.08.18-.15.25-.1.11-.22.19-.35.27-.16.09-.33.16-.5.23-.05.02-.09.06-.09.11,0,.05.04.1.09.12.24.1.5.15.76.22.48.11.96.22,1.43.36.16.05.32.09.47.16.04.02.08.06.1.11.02.08-.02.18-.1.21-.06.02-.12,0-.18,0-.13-.02-.26-.05-.39-.08-.23-.05-.46-.09-.69-.14-.2-.04-.41-.09-.61-.12-.04,0-.09-.01-.12.02-.03.02-.03.06-.01.08.04.05.1.07.15.09.38.16.76.3,1.14.47.09.04.18.08.27.12.05.02.09.04.14.07.08.04.18.08.22.16.03.07.01.16-.04.21-.04.05-.11.07-.17.07-.12-.01-.23-.06-.34-.1-.52-.18-1.03-.37-1.54-.57-.05-.02-.12-.04-.17,0-.02.03-.01.08.02.1.08.08.18.14.27.2.26.16.52.31.78.46.13.07.26.15.38.22.06.04.12.07.17.11.03.03.05.06.05.1,0,.07-.04.14-.1.18-.05.04-.12.03-.18.01-.09-.03-.18-.08-.27-.12-.02,0-.04-.02-.05-.03-.07-.03-.13-.07-.2-.1-.02-.01-.04-.02-.07-.03-.12-.06-.23-.12-.35-.18-.05-.03-.11-.06-.16-.09-.08-.05-.17-.09-.25-.14-.08-.05-.17-.09-.25-.14-.05-.03-.1-.06-.16-.08-.04,0-.09.03-.07.07.03.07.09.12.14.17.19.18.38.36.57.54.1.1.2.19.29.29.03.04.07.08.08.13.02.07-.03.14-.09.16-.08.03-.16,0-.23-.04-.14-.08-.26-.19-.39-.29-.16-.13-.31-.26-.47-.39,0,0-.01,0-.02,0h.01c-.15-.12-.29-.25-.45-.35-.03-.02-.07-.04-.1-.06-.17-.1-.35-.19-.54-.27-.22-.1-.43-.21-.62-.37-.17-.14-.33-.31-.44-.5-.01-.03-.03-.05-.04-.08-.01-.02-.02-.05-.04-.07,0-.03.02-.04.04-.06.17-.19.33-.39.45-.62,0,0,0-.02.01-.02.04-.08.09-.17.1-.26.13.03.27,0,.39-.04.11-.04.22-.08.33-.13.09-.05.18-.11.28-.14.03-.01.07-.02.1-.02.21-.04.43-.09.63-.17.27-.1.54-.21.79-.34.08-.04.15-.08.22-.11Z" />
                </svg>
              </Link>
              <Link
                href="/leichte-sprache"
                className="rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:ring-offset-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:ring-offset-slate-900"
                title="Leichte Sprache"
                aria-label="Leichte Sprache"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 7.24 7.7"
                  fill="currentColor"
                >
                  <circle cx="3.62" cy="1.22" r="1.22" />
                  <path d="M0,2.32v4.13c.54,0,1.49.06,2.46.61.36.2.65.43.88.64V3.51c-.22-.19-.48-.39-.81-.57-.95-.53-1.98-.61-2.53-.61Z" />
                  <path d="M3.9,3.51v4.19c.23-.21.52-.44.88-.64.98-.55,1.93-.62,2.46-.61V2.32c-.55,0-1.59.08-2.53.61-.32.18-.59.38-.81.57Z" />
                </svg>
              </Link>
              <FontSizeToggle />
            </div>

            {/* Rechts: System Theme Toggle & Close Button */}
            <div className="flex items-center gap-3">
              <SystemThemeToggle />
              <button
                onClick={() => setShowMetaControls(false)}
                className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Logo className="text-foreground" showLink={true} />

        <div className="flex items-center gap-2">
          {/* Meta Controls Toggle */}
          <button
            onClick={() => setShowMetaControls(!showMetaControls)}
            className="relative touch-manipulation select-none overflow-hidden rounded-xl border border-gray-100 bg-gray-50/90 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            aria-label="Barrierefreiheit"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={onMenuToggle}
            className="relative touch-manipulation select-none rounded-xl border border-gray-100 bg-gray-50/90 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Header Component
const AdaptiveHeaderOptimized = ({
  session: externalSession,
}: AdaptiveHeaderProps) => {
  const isScrolled = useOptimizedScroll(50);
  const [showMetaBar, setShowMetaBar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // RADIKALE LÖSUNG: Verwende useStableSession für stabile Session-Behandlung
  const { session } = useStableSession(externalSession);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Placeholder für Header-Höhe um Layout-Shift zu vermeiden - nur wenn Header sticky ist */}
      {isScrolled && (
        <div className="header-placeholder h-16 sm:h-20 lg:h-24" />
      )}

      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:ring-4 focus:ring-primary/30"
        tabIndex={1}
      >
        Zum Hauptinhalt springen
      </a>

      {/* Adaptive Desktop Header */}
      <AdaptiveDesktopHeader
        isScrolled={isScrolled}
        session={session}
        showMetaBar={showMetaBar}
        setShowMetaBar={setShowMetaBar}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* Mobile Header */}
      <ResponsiveMobileHeader onMenuToggle={() => setMobileMenuOpen(true)} />

      {/* Mobile Drawer Menu */}
      <MobileDrawerMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Desktop Offcanvas Menu */}
      <DesktopOffcanvasMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default AdaptiveHeaderOptimized;
