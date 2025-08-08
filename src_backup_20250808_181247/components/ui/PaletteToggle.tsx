"use client";

import { Palette } from "lucide-react";

export function PaletteToggle() {
  const handleClick = () => {
    // Hier könnte die Palette-Funktionalität implementiert werden
    // z.B. ein Modal mit Farbthemen öffnen
    console.log("Palette clicked - implement color themes here");
  };

  return (
    <button
      onClick={handleClick}
      className="rounded p-1 text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
      title="Farbthemen"
      aria-label="Farbthemen"
    >
      <Palette className="h-3 w-3" />
    </button>
  );
}
