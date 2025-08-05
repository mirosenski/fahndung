"use client";

import type { DesktopMegaMenuProps } from "./types";

export function DesktopMegaMenu({ logo }: DesktopMegaMenuProps) {
  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80"
      role="navigation"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          {logo && <div className="flex-shrink-0">{logo}</div>}

          {/* Spacer for centering */}
          <div className="flex-1"></div>
        </div>
      </div>
    </nav>
  );
}
