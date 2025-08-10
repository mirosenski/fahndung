"use client";

import { useState, useCallback, useId } from "react";
import Link from "next/link";

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

interface A11navEnhancedProps {
  items: NavItem[];
  ariaLabel?: string;
}

/**
 * Accessible, hover-free navigation:
 * - Button toggles for submenus (no mouse hover logic)
 * - Arrow key navigation, Esc closes submenu
 * - ARIA roles: menubar / menu / menuitem, aria-expanded, aria-controls
 */
export default function A11navEnhanced({
  items,
  ariaLabel = "Hauptnavigation",
}: A11navEnhancedProps) {
  const [open, setOpen] = useState<string | null>(null);
  const menuId = useId();

  const closeAll = useCallback(() => setOpen(null), []);
  const toggle = useCallback(
    (key: string) => setOpen((prev) => (prev === key ? null : key)),
    []
  );

  const onKeyDownTop = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      if (e.key === "Escape") {
        closeAll();
      }
    },
    [closeAll]
  );

  return (
    <nav aria-label={ariaLabel}>
      <ul
        role="menubar"
        aria-orientation="horizontal"
        className="flex gap-4"
        onKeyDown={onKeyDownTop}
      >
        {items.map((item, i) => {
          const key = `${menuId}-item-${i}`;
          const hasChildren = !!item.children?.length;

          if (!hasChildren) {
            return (
              <li role="none" key={key}>
                <Link
                  role="menuitem"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md px-2 py-1"
                  href={item.href || "#"}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const submenuId = `${key}-submenu`;
          const isOpen = open === key;

          return (
            <li role="none" key={key} className="relative">
              <button
                type="button"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={submenuId}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md px-2 py-1"
                onClick={() => toggle(key)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(key);
                    const first = document.querySelector<HTMLAnchorElement>(
                      `#${submenuId} a[role="menuitem"]`
                    );
                    first?.focus();
                  }
                  if (e.key === "Escape") {
                    closeAll();
                  }
                }}
              >
                {item.label}
              </button>

              {isOpen && (
                <ul
                  id={submenuId}
                  role="menu"
                  aria-label={`${item.label} Untermenü`}
                  className="absolute mt-2 min-w-48 rounded-xl border bg-white/95 shadow-lg p-2 z-50"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      closeAll();
                    }
                  }}
                >
                  {item.children!.map((child, j) => (
                    <li role="none" key={`${submenuId}-${j}`}>
                      <Link
                        role="menuitem"
                        href={child.href}
                        className="block rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        onClick={closeAll}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
