"use client";
import React, { useEffect, useRef, useState } from "react";
import { AccessibilityIcon } from "../ui/AccessibilityIcon";
import { useTheme } from "next-themes";

interface A11navEnhancedProps {
  isCompact?: boolean;
}

type FontSize = "normal" | "large" | "xlarge";
type AppTheme = "light" | "dark" | "system";
type ContrastMode = "normal" | "high";
type HeaderVariant = "modern" | "primary" | "classic";

export default function A11navEnhanced({
  isCompact = false,
}: A11navEnhancedProps) {
  const { setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [theme, setThemeState] = useState<AppTheme>("system");
  const [contrast, setContrast] = useState<ContrastMode>("normal");
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>("primary");

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Init from localStorage
  useEffect(() => {
    try {
      const savedFontSize =
        (localStorage.getItem("font-size") as FontSize) ?? "normal";
      const savedTheme =
        (localStorage.getItem("theme") as AppTheme) ?? "system";
      const savedContrast =
        (localStorage.getItem("contrast") as ContrastMode) ?? "normal";
      const savedHeaderVariant =
        (localStorage.getItem("header-variant") as HeaderVariant) ?? "primary";

      setFontSize(savedFontSize);
      setThemeState(savedTheme);
      setContrast(savedContrast);
      setHeaderVariant(savedHeaderVariant);
    } catch {
      // ignore
    }
  }, []);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-base", "text-lg", "text-xl");
    if (fontSize === "normal") root.classList.add("text-base");
    if (fontSize === "large") root.classList.add("text-lg");
    if (fontSize === "xlarge") root.classList.add("text-xl");
    root.setAttribute("data-font-size", fontSize);
    localStorage.setItem("font-size", fontSize);
  }, [fontSize]);

  // Apply theme
  useEffect(() => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme, setTheme]);

  // Apply contrast
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("high-contrast");
    if (contrast === "high") root.classList.add("high-contrast");
    root.setAttribute("data-contrast", contrast);
    localStorage.setItem("contrast", contrast);
  }, [contrast]);

  // Apply header variant
  useEffect(() => {
    localStorage.setItem("header-variant", headerVariant);
    // Dispatch auf window, damit globale Listener es zuverlässig empfangen
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<HeaderVariant>("header-variant-change", {
          detail: headerVariant,
        }),
      );
    }
  }, [headerVariant]);

  // Close on outside click
  useEffect(() => {
    const onDown = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggleOpen = () => setOpen((v) => !v);

  const cancelClose = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setIsHovered(true);
        setOpen(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        scheduleClose();
      }}
    >
<<<<<<< HEAD
      {headerVariant === "primary" ? (
        <button
          ref={btnRef}
          type="button"
          onClick={toggleOpen}
          onMouseEnter={() => {
            cancelClose();
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            scheduleClose();
          }}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-transparent backdrop-blur-xl transition-all duration-200 hover:bg-background/20 focus:outline-none"
          aria-label="Barrierefreiheit und Einstellungen"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full group-focus-visible:ring-2 group-focus-visible:ring-primary/50 group-focus-visible:ring-offset-2">
            <AccessibilityIcon
              isActive={isHovered || open}
              variant={isHovered || open ? "filled" : "outline"}
              className="h-8 w-8 transition-all duration-200"
            />
          </span>
        </button>
      ) : (
        <button
          ref={btnRef}
          type="button"
          onClick={toggleOpen}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`
            flex items-center gap-2 rounded-xl border
            border-border/50 bg-background/50 px-4
            py-3 text-sm
            font-medium backdrop-blur-xl transition-all
            duration-200 hover:bg-accent/50
          `}
        >
          <AccessibilityIcon
            isActive={isHovered || open}
            variant={isHovered || open ? "filled" : "outline"}
            className="h-5 w-5"
          />
          <span>{isCompact ? "A11y" : "A11y & Meta"}</span>
        </button>
      )}
=======
      <button
        ref={btnRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-input/50 bg-background/60 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <Accessibility className="h-4 w-4" />
        {isCompact ? "A11y" : "A11y & Meta"}
      </button>
>>>>>>> 12a841d (perf: baseline before audit (Next 15.4.6, React 19.1.1))

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="A11y & Meta Einstellungen"
          className="dropdown-glass absolute right-0 z-50 mt-2 w-64 p-2 text-popover-foreground"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {/* 1) Barrierefreiheit Links */}
          <div className="mb-4 space-y-2">
            <a
              href="/leichte-sprache"
              className="block rounded-md border border-input/50 bg-background/50 px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              Leichte Sprache
            </a>
            <a
              href="/gebaerdensprache"
              className="block rounded-md border border-input/50 bg-background/50 px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              Gebärdensprache
            </a>
          </div>

          {/* 2) Theme-Einstellungen */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium">Theme</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setThemeState("light")}
                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                  theme === "light"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={theme === "light"}
              >
                Hell
              </button>
              <button
                type="button"
                onClick={() => setThemeState("dark")}
                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                  theme === "dark"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={theme === "dark"}
              >
                Dunkel
              </button>
              <button
                type="button"
                onClick={() => setThemeState("system")}
                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                  theme === "system"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={theme === "system"}
              >
                System
              </button>
            </div>
          </div>

          {/* 3) Text-Einstellungen */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium">
              Schriftgröße
            </label>
            <div className="flex gap-1">
              {(
                [
                  { key: "normal", label: "Normal" },
                  { key: "large", label: "Groß" },
                  { key: "xlarge", label: "XL" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFontSize(opt.key)}
<<<<<<< HEAD
                  className={`rounded-md px-2 py-1 text-sm transition-colors ${
=======
                  className={`rounded-md px-2 py-1.5 text-sm transition-colors ${
>>>>>>> 12a841d (perf: baseline before audit (Next 15.4.6, React 19.1.1))
                    fontSize === opt.key
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "hover:bg-accent"
                  }`}
                  aria-pressed={fontSize === opt.key}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium">Kontrast</label>
            <div className="flex gap-1">
=======
          {/* Theme */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Sun className="h-4 w-4" />
              Theme
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeState("light")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  theme === "light"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={theme === "light"}
              >
                <Sun className="h-4 w-4" /> Hell
              </button>
              <button
                type="button"
                onClick={() => setThemeState("dark")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  theme === "dark"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={theme === "dark"}
              >
                <Moon className="h-4 w-4" /> Dunkel
              </button>
              <button
                type="button"
                onClick={() => setThemeState("system")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  theme === "system"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={theme === "system"}
              >
                <Monitor className="h-4 w-4" /> System
              </button>
            </div>
          </div>

          {/* Kontrast */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Contrast className="h-4 w-4" />
              Kontrast
            </div>
            <div className="grid grid-cols-2 gap-2">
>>>>>>> 12a841d (perf: baseline before audit (Next 15.4.6, React 19.1.1))
              <button
                type="button"
                onClick={() => setContrast("normal")}
                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                  contrast === "normal"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={contrast === "normal"}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setContrast("high")}
                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                  contrast === "high"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={contrast === "high"}
              >
                Hoch
              </button>
            </div>
          </div>

          {/* 4) Header-Switch */}
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => {
                const nextVariant = ((): HeaderVariant => {
                  switch (headerVariant) {
                    case "modern":
                      return "primary";
                    case "primary":
                      return "classic";
                    case "classic":
                      return "modern";
                    default:
                      return "primary";
                  }
                })();
                setHeaderVariant(nextVariant);
              }}
              className="rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
              aria-label="Header-Variante wechseln"
            >
              {headerVariant === "modern"
                ? "Zum Primary Header"
                : headerVariant === "primary"
                  ? "Zum Classic Header"
                  : "Zum Modern Header"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
