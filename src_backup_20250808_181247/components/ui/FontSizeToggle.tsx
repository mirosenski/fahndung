"use client";

import { useState, useEffect } from "react";
import { Type } from "lucide-react";

type FontSize = "normal" | "large";

export function FontSizeToggle() {
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedFontSize = localStorage.getItem("fontSize") as FontSize;
    if (savedFontSize && ["normal", "large"].includes(savedFontSize)) {
      setFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Entferne alle Font-Size-Klassen
    root.classList.remove("text-normal", "text-large");

    // Setze die neue Font-Size-Klasse
    root.classList.add(`text-${fontSize}`);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize, mounted]);

  if (!mounted) return null;

  const handleClick = () => {
    const sizes: FontSize[] = ["normal", "large"];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextFontSize = sizes[nextIndex];
    if (nextFontSize) {
      setFontSize(nextFontSize);
    }
  };

  const getLabel = () => {
    switch (fontSize) {
      case "normal":
        return "A";
      case "large":
        return "A+2";
      default:
        return "A";
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-blue-500 dark:focus:ring-offset-slate-900"
      title={`Schriftgröße: ${fontSize === "normal" ? "Normal" : "Groß (+2)"}`}
      aria-label="Schriftgröße ändern"
    >
      <Type className="h-3 w-3" />
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}
