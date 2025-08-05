"use client";

import type { DesktopMegaMenuProps } from "./types";

export function DesktopMegaMenu({}: DesktopMegaMenuProps) {
  return (
    <nav
      className="sticky top-0 z-50 h-20 bg-background/80 backdrop-blur-md"
      role="navigation"
      aria-label="Hauptnavigation"
    ></nav>
  );
}
