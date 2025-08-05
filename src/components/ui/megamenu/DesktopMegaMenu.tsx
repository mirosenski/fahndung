"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Search,
  Shield,
  Phone,
  HelpCircle,
  Users,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import type { MenuItem, DesktopMegaMenuProps } from "./types";

export function DesktopMegaMenu({ menuItems, logo }: DesktopMegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { isAuthenticated } = useAuth();

  // Default menu items mit Lucide Icons
  const defaultItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Sicherheit",
        href: "/sicherheit",
        description: "Sicherheit und Ordnung",
        icon: <Shield className="h-5 w-5" />,
        subItems: [
          {
            label: "Fahndungen",
            href: isAuthenticated ? "/fahndungen/neu/enhanced" : "/fahndungen",
            description: isAuthenticated
              ? "Fahndungen verwalten"
              : "Aktuelle Fahndungsfälle und Hinweise",
            icon: <Search className="h-5 w-5" />,
            badge: "Neu",
            subItems: isAuthenticated
              ? []
              : [
                  {
                    label: "Straftäter",
                    href: "/fahndungen/straftaeter",
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    label: "Vermisste Personen",
                    href: "/fahndungen/vermisste",
                    icon: <AlertTriangle className="h-4 w-4" />,
                  },
                  {
                    label: "Unbekannte Tote",
                    href: "/fahndungen/unbekannte-tote",
                    icon: <Package className="h-4 w-4" />,
                  },
                  {
                    label: "Gestohlene Sachen",
                    href: "/fahndungen/sachen",
                    icon: <Package className="h-4 w-4" />,
                  },
                ],
          },
          {
            label: "Kontakt",
            href: "/kontakt",
            description: "So erreichen Sie uns",
            icon: <Phone className="h-5 w-5" />,
          },
          {
            label: "FAQ",
            href: "/faq",
            description: "Häufig gestellte Fragen",
            icon: <HelpCircle className="h-5 w-5" />,
          },
        ],
      },
    ],
    [isAuthenticated],
  );

  const items = menuItems ?? defaultItems;

  // Performance-optimierte Event Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!menuRef.current) return;

    const menuItems = menuRef.current.querySelectorAll('[role="menuitem"]');
    const currentIndex = Array.from(menuItems).findIndex(
      (item) => item === document.activeElement,
    );

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % menuItems.length;
        (menuItems[nextIndex] as HTMLElement)?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        const prevIndex =
          currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
        (menuItems[prevIndex] as HTMLElement)?.focus();
        break;
      case "Escape":
        setActiveMenu(null);
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleMouseEnter = useCallback((label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      setActiveMenu(null);
    },
    [router],
  );

  const renderMenuCard = useCallback(
    (item: MenuItem) => (
      <motion.div
        key={item.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex items-start space-x-4">
          {item.icon && (
            <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
              {item.icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {item.label}
              </h3>
              {item.badge && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {item.subItems && item.subItems.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <ul className="space-y-2">
              {item.subItems.map((subItem) => (
                <li key={subItem.label}>
                  <Link
                    href={subItem.href ?? "#"}
                    className="flex items-center space-x-2 text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    onClick={() => handleNavigate(subItem.href ?? "#")}
                  >
                    {subItem.icon && (
                      <span className="text-gray-400 dark:text-gray-500">
                        {subItem.icon}
                      </span>
                    )}
                    <span>{subItem.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    ),
    [handleNavigate],
  );

  return (
    <nav
      ref={menuRef}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80"
      role="navigation"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          {logo && <div className="flex-shrink-0">{logo}</div>}

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            {items.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:text-blue-400 dark:focus:ring-offset-gray-900"
                  role="menuitem"
                  aria-expanded={activeMenu === item.label}
                  aria-haspopup="true"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 rotate-90 transform transition-transform" />
                </button>

                <AnimatePresence>
                  {activeMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-screen max-w-lg transform px-2 sm:px-0 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2"
                    >
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative bg-white px-5 py-6 dark:bg-gray-800 sm:p-8">
                          {/* Fahndungen - Volle Breite oben */}
                          {item.subItems?.find(
                            (subItem) => subItem.label === "Fahndungen",
                          ) && (
                            <div className="mb-6">
                              {renderMenuCard(
                                item.subItems.find(
                                  (subItem) => subItem.label === "Fahndungen",
                                )!,
                              )}
                            </div>
                          )}

                          {/* FAQ und Kontakt - Kleinere Karten unten */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            {item.subItems
                              ?.filter(
                                (subItem) =>
                                  subItem.label === "FAQ" ||
                                  subItem.label === "Kontakt",
                              )
                              .map(renderMenuCard)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="p-2 text-gray-400 transition-colors hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              aria-label="Suche öffnen"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
