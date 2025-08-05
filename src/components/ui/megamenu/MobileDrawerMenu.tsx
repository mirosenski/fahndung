"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  Users,
  AlertTriangle,
  Package,
  Phone,
  HelpCircle,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "~/hooks/useAuth";

interface MenuItem {
  label: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  subItems?: MenuItem[];
}

interface MobileDrawerMenuProps {
  menuItems?: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawerMenu({
  menuItems,
  isOpen,
  onClose,
}: MobileDrawerMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, logout, session } = useAuth();

  // Default menu items mit Lucide Icons
  const defaultItems: MenuItem[] = [
    {
      label: "Fahndungen",
      href: isAuthenticated ? "/fahndungen" : "/fahndungen",
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
      label: "FAQ",
      href: "/faq",
      description: "Häufig gestellte Fragen",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      label: "Kontakt",
      href: "/kontakt",
      description: "So erreichen Sie uns",
      icon: <Phone className="h-5 w-5" />,
    },
  ];

  const items = menuItems ?? defaultItems;

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        setExpandedItems(new Set());
      } else if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    }
  }, [isOpen]);

  const toggleExpanded = useCallback((path: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setExpandedItems(new Set());
      setSearchQuery("");
    },
    [router, onClose],
  );

  const renderMenuItem = useCallback(
    (item: MenuItem, level = 0, path = "") => {
      const currentPath = path ? `${path}.${item.label}` : item.label;
      const isExpanded = expandedItems.has(currentPath);
      const hasSubItems = item.subItems && item.subItems.length > 0;

      return (
        <div
          key={item.label}
          className="border-b border-gray-200 last:border-b-0 dark:border-gray-700"
        >
          <div className="flex min-h-[44px] items-center justify-between py-3">
            <Link
              href={item.href ?? "#"}
              onClick={() => item.href && handleNavigate(item.href)}
              className="flex min-w-0 flex-1 items-center space-x-3 px-4"
            >
              {item.icon && (
                <span className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                  {item.icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>

            {hasSubItems && (
              <button
                onClick={() => toggleExpanded(currentPath)}
                className="flex-shrink-0 touch-manipulation select-none p-3 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-300 dark:focus:ring-offset-gray-900"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? "Schließen" : "Öffnen"} ${item.label}`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {hasSubItems && (
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden bg-gray-50 dark:bg-gray-800"
                >
                  <div className="space-y-1 py-2">
                    {item.subItems!.map((subItem) =>
                      renderMenuItem(subItem, level + 1, currentPath),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    },
    [expandedItems, handleNavigate, toggleExpanded],
  );

  const filteredItems = items.filter(
    (item) =>
      searchQuery === "" ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      item.subItems?.some(
        (subItem) =>
          (subItem.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subItem.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())) ??
          false,
      ),
  );

  return (
    <>
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => onClose()}
            />

            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-background shadow-2xl md:hidden"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-background p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Navigation
                </h2>
                <button
                  onClick={() => onClose()}
                  className="touch-manipulation select-none p-2 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-300 dark:focus:ring-offset-gray-900"
                  aria-label="Menü schließen"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search Field */}
              <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                    aria-label="Menü durchsuchen"
                  />
                </div>
              </div>

              {/* Menu Items - Scrollable mit Padding für sticky Footer */}
              <div className="flex-1 overflow-y-auto pb-32">
                <nav
                  className="space-y-1 p-4"
                  role="navigation"
                  aria-label="Hauptnavigation"
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => renderMenuItem(item))
                  ) : (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>Keine Ergebnisse gefunden</p>
                    </div>
                  )}
                </nav>
              </div>

              {/* Sticky Footer mit User Section */}
              <div className="sticky bottom-0 border-t border-gray-200 bg-background p-4">
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-5 w-5" />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            Angemeldet als:
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {session?.user?.email ?? "Unbekannt"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          onClose();
                        }}
                        className="flex w-full touch-manipulation select-none items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <Shield className="h-5 w-5" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            onClose();
                          } catch (error) {
                            console.error("Fehler beim Logout:", error);
                            router.push("/login");
                          }
                        }}
                        className="flex w-full touch-manipulation select-none items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Abmelden</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          router.push("/login");
                          onClose();
                        }}
                        className="flex w-full touch-manipulation select-none items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Anmelden</span>
                      </button>
                      <button
                        onClick={() => {
                          router.push("/register");
                          onClose();
                        }}
                        className="flex w-full touch-manipulation select-none items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <UserPlus className="h-5 w-5" />
                        <span>Registrieren</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
