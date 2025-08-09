"use client";
import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Type, Contrast, Layout } from "lucide-react";
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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        ref={btnRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-input/50 bg-background/60 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <AccessibilityIcon
          isActive={isHovered || open}
          variant={isHovered || open ? "filled" : "outline"}
          className="h-4 w-4"
        />
        {isCompact ? "A11y" : "A11y & Meta"}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="A11y & Meta Einstellungen"
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border/50 bg-popover/95 p-3 text-popover-foreground shadow-xl backdrop-blur-2xl dark:bg-popover/90"
        >
          {/* Schriftgröße */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Type className="h-4 w-4" />
              Schriftgröße
            </div>
            <div className="grid grid-cols-3 gap-2">
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
                  className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
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
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
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
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
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
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
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
              <button
                type="button"
                onClick={() => setContrast("normal")}
                className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
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
                className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
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

          {/* Header Variante */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Layout className="h-4 w-4" />
              Header
            </div>
            <div className="grid grid-cols-1 gap-2">
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
                className="rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
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

          {/* Links */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href="/leichte-sprache"
              className="rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-center text-sm transition-colors hover:bg-accent"
            >
              Leichte Sprache
            </a>
            <a
              href="/gebaerdensprache"
              className="rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-center text-sm transition-colors hover:bg-accent"
            >
              Gebärdensprache
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
