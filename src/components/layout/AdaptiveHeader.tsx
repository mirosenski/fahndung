"use client";

import React, { useState, useEffect } from "react";
import {
  Type,
  Eye,
  EyeOff,
  Palette,
  Volume2,
  Menu,
  User,
  LogIn,
  Plus,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";
import { HoverMegaMenu } from "../ui/HoverMegaMenu";
import { SearchBar } from "../ui/SearchBar";
import { useRouter, usePathname } from "next/navigation";
import { type Session } from "~/lib/auth";
import { useAuth } from "~/hooks/useAuth";

interface AdaptiveHeaderProps {
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  session?: Session | null;
  onLogout?: () => void;
}

// Performance-optimized scroll hook
const useAdaptiveScroll = (threshold = 50) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};

// Meta-Bar Component (verschwindet beim Scrollen)
const MetaAccessibilityBar = ({ isVisible }: { isVisible: boolean }) => {
  const [settings, setSettings] = useState({
    fontSize: "normal" as "small" | "normal" | "large",
    contrast: false,
    language: "de",
  });

  const toggleFontSize = () => {
    const sizes: Array<"small" | "normal" | "large"> = [
      "small",
      "normal",
      "large",
    ];
    const current = sizes.indexOf(settings.fontSize);
    const nextIndex = (current + 1) % sizes.length;
    const next = sizes[nextIndex]!;
    setSettings((prev) => ({ ...prev, fontSize: next }));

    document.documentElement.className =
      document.documentElement.className.replace(
        /text-(small|normal|large)/g,
        "",
      );
    document.documentElement.classList.add(`text-${next}`);
  };

  const toggleContrast = () => {
    const newContrast = !settings.contrast;
    setSettings((prev) => ({ ...prev, contrast: newContrast }));
    document.documentElement.classList.toggle("high-contrast", newContrast);
  };

  return (
    <div
      className={`
      w-full overflow-hidden bg-slate-900 text-white
      transition-all duration-300 ease-out dark:bg-slate-950
      ${isVisible ? "h-8 opacity-100" : "h-0 opacity-0"}
    `}
    >
      <div className="container mx-auto flex h-8 items-center justify-between px-4">
        {/* Links: Accessibility Controls */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={toggleFontSize}
            className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
            aria-label="Schriftgröße ändern"
          >
            <Type className="h-3 w-3" />
            <span className="hidden sm:inline">
              {settings.fontSize === "small"
                ? "A-"
                : settings.fontSize === "large"
                  ? "A+"
                  : "A"}
            </span>
          </button>

          <button
            onClick={toggleContrast}
            className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
            aria-label={
              settings.contrast ? "Normaler Kontrast" : "Hoher Kontrast"
            }
          >
            {settings.contrast ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">Kontrast</span>
          </button>

          <button className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900">
            <Volume2 className="h-3 w-3" />
            <span className="hidden sm:inline">Vorlesen</span>
          </button>

          <a
            href="/leichte-sprache"
            className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
          >
            <span className="text-xs">Leichte Sprache</span>
          </a>
        </div>

        {/* Rechts: Sprache & Settings */}
        <div className="flex items-center gap-4 text-xs">
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, language: e.target.value }))
            }
            className="rounded bg-transparent px-1 text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
            aria-label="Sprache wählen"
          >
            <option value="de" className="bg-slate-900">
              DE
            </option>
            <option value="en" className="bg-slate-900">
              EN
            </option>
            <option value="fr" className="bg-slate-900">
              FR
            </option>
            <option value="tr" className="bg-slate-900">
              TR
            </option>
          </select>

          <button className="rounded p-1 text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900">
            <Palette className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Adaptive Desktop Header (freistehend → sticky full-width)
const AdaptiveDesktopHeader = ({
  isScrolled,
  session,
}: {
  isScrolled: boolean;
  session?: Session | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { session: authSession } = useAuth();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  // Verwende externe Session oder Session aus useAuth
  const currentSession = session ?? authSession;

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", pathname ?? "/");
    }
    router.push("/login");
  };

  const renderUserActions = () => {
    if (currentSession) {
      return (
        <div className="flex items-center gap-3">
          {/* +Fahndung Link - nur anzeigen wenn nicht auf Wizard-Seiten und User ist Admin/Super_Admin */}
          {(currentSession?.profile?.role === "admin" ||
            currentSession?.profile?.role === "super_admin") &&
            !pathname?.startsWith("/fahndungen/neu") && (
              <button
                onClick={() => router.push("/fahndungen/neu/enhanced")}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                <span>Fahndung</span>
              </button>
            )}

          {/* User Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="flex items-center gap-2 rounded-full bg-accent p-2 transition-colors hover:bg-accent/80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {isAvatarMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-background py-2 shadow-lg">
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {currentSession.user?.email}
                </div>
                <div className="border-t border-border">
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      router.push("/dashboard");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      router.push("/logout");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Abmelden</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <button
          onClick={handleLogin}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </button>
      );
    }
  };

  return (
    <div
      className={`
      hidden w-full transition-all duration-300 ease-out lg:block
      ${isScrolled ? "sticky top-0 z-50" : "relative"}
    `}
    >
      <div
        className={`
        backdrop-blur-xl transition-all duration-300 ease-out
        ${
          isScrolled
            ? "w-full border-b border-border bg-background/95 px-6 py-3 shadow-lg dark:bg-background/90"
            : "container mx-auto mt-4 max-w-[1273px] rounded-[10px] border border-border/70 bg-background/60 px-6 py-4 shadow-lg dark:bg-background/40"
        }
      `}
      >
        <div className="flex w-full items-center justify-between">
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
            {/* Mega Menu Items */}
            <HoverMegaMenu title="Sicherheit" />
            <HoverMegaMenu title="Service" />
            <HoverMegaMenu title="Polizei" />

            {/* Right Actions */}
            <div className="ml-6 flex items-center gap-3">
              <SearchBar
                variant="desktop"
                size={isScrolled ? "compact" : "default"}
                placeholder="Suchen..."
              />
              <ThemeToggle />
              {renderUserActions()}

              {/* A11y Button (nur wenn Meta-Bar nicht sichtbar) */}
              {isScrolled && (
                <button className="rounded-lg border border-border bg-background/80 p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Mobile Header mit integrierten Meta-Controls
const ResponsiveMobileHeader = ({
  onMenuToggle,
  session,
}: {
  onMenuToggle: () => void;
  session?: Session | null;
}) => {
  const [showMetaControls, setShowMetaControls] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { session: authSession } = useAuth();

  // Verwende externe Session oder Session aus useAuth
  const currentSession = session ?? authSession;

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", pathname ?? "/");
    }
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm lg:hidden">
      {/* Meta Controls Bar (mobile) */}
      {showMetaControls && (
        <div className="bg-slate-900 px-4 py-2 text-white">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-slate-400 hover:text-white">
                <Type className="h-3 w-3" />
                <span>A</span>
              </button>
              <button className="flex items-center gap-1 text-slate-400 hover:text-white">
                <Eye className="h-3 w-3" />
                <span>Kontrast</span>
              </button>
            </div>
            <button
              onClick={() => setShowMetaControls(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Logo className="text-foreground" showLink={true} />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Meta Controls Toggle */}
          <button
            onClick={() => setShowMetaControls(!showMetaControls)}
            className="rounded-lg border border-border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Barrierefreiheit"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* User Actions */}
          {currentSession ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Dashboard"
            >
              <User className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="rounded-lg border border-border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Login"
            >
              <LogIn className="h-4 w-4" />
            </button>
          )}

          {/* Hamburger Menu */}
          <button
            onClick={onMenuToggle}
            className="rounded-lg border border-border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
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
const AdaptiveHeader = ({ session: externalSession }: AdaptiveHeaderProps) => {
  const isScrolled = useAdaptiveScroll(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session: authSession } = useAuth();

  // Verwende externe Session oder Session aus useAuth
  const session = externalSession ?? authSession;

  return (
    <>
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:ring-4 focus:ring-primary/30"
        tabIndex={1}
      >
        Zum Hauptinhalt springen
      </a>

      {/* Meta Accessibility Bar - nur Desktop, verschwindet beim Scrollen */}
      <div className="hidden lg:block">
        <MetaAccessibilityBar isVisible={!isScrolled} />
      </div>

      {/* Adaptive Desktop Header */}
      <AdaptiveDesktopHeader isScrolled={isScrolled} session={session} />

      {/* Mobile Header */}
      <ResponsiveMobileHeader
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        session={session}
      />

      {/* Mobile Menu würde hier kommen - Ihre vorhandene MobileMenu Komponente */}
    </>
  );
};

export default AdaptiveHeader;
