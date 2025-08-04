"use client";

import { useState, useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function SystemThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration-Problem vermeiden
  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-3 w-3" />;
    if (theme === "system") {
      return <Monitor className="h-3 w-3" />;
    }
    return resolvedTheme === "dark" ? (
      <Sun className="h-3 w-3" />
    ) : (
      <Moon className="h-3 w-3" />
    );
  };

  const getThemeLabel = () => {
    if (!mounted) return "System";
    switch (theme) {
      case "light":
        return "Hell";
      case "dark":
        return "Dunkel";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  const handleClick = () => {
    if (!mounted) return;
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  if (!mounted) {
    return (
      <button
        className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
        aria-label="Theme wechseln"
      >
        <Monitor className="h-3 w-3" />
        <span className="hidden sm:inline">System</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
      aria-label="Theme wechseln"
      title={`Aktuelles Theme: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
      <span className="hidden sm:inline">{getThemeLabel()}</span>
    </button>
  );
}
