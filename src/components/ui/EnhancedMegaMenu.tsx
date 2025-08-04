"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";

interface MenuItem {
  label: string;
  href?: string;
  subItems?: {
    label: string;
    href: string;
    description?: string;
    subItems?: { label: string; href: string; description?: string }[];
  }[];
}

interface EnhancedMegaMenuProps {
  title: string;
  items?: Array<{
    title: string;
    description?: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export function EnhancedMegaMenu({
  title,
  items: _items = [],
}: EnhancedMegaMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [openSubSubDropdown, setOpenSubSubDropdown] = useState<string | null>(
    null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<string | null>(
    null,
  );
  const [mobileSubSubMenuOpen, setMobileSubSubMenuOpen] = useState<
    string | null
  >(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedSubIndex, setFocusedSubIndex] = useState(-1);
  const [focusedSubSubIndex, setFocusedSubSubIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuth();

  // Standard-Menü-Items basierend auf dem Titel
  const getDefaultItems = (menuTitle: string): MenuItem => {
    switch (menuTitle) {
      case "Sicherheit":
        return {
          label: "Sicherheit",
          href: "/sicherheit",
          subItems: [
            {
              label: "Fahndungen",
              href: isAuthenticated
                ? "/fahndungen/neu/enhanced"
                : "/fahndungen",
              description: isAuthenticated
                ? "Fahndungen verwalten"
                : "Aktuelle Fahndungsfälle",
              subItems: isAuthenticated
                ? []
                : [
                    {
                      label: "Straftäter",
                      href: "/fahndungen/straftaeter",
                      description: "Fahndung nach Straftätern",
                    },
                    {
                      label: "Vermisste",
                      href: "/fahndungen/vermisste",
                      description: "Fahndung nach vermissten Personen",
                    },
                    {
                      label: "Unbekannte Tote",
                      href: "/fahndungen/unbekannte-tote",
                      description: "Fahndung zur Identifizierung",
                    },
                    {
                      label: "Sachen",
                      href: "/fahndungen/sachen",
                      description: "Fahndung nach gestohlenen Sachen",
                    },
                  ],
            },
            {
              label: "Statistiken",
              href: "/statistiken",
              description: "Sicherheitsstatistiken",
            },
            {
              label: "Hinweise",
              href: "/hinweise",
              description: "Sicherheitshinweise",
            },
          ],
        };
      case "Service":
        return {
          label: "Service",
          href: "/service",
          subItems: [
            {
              label: "Kontakt",
              href: "/kontakt",
              description: "Kontaktinformationen",
            },
            { label: "FAQ", href: "/faq", description: "Häufige Fragen" },
            {
              label: "Downloads",
              href: "/downloads",
              description: "Formulare und Dokumente",
            },
          ],
        };
      case "Polizei":
        return {
          label: "Polizei",
          href: "/polizei",
          subItems: [
            {
              label: "Über uns",
              href: "/ueber-uns",
              description: "Informationen zur Polizei BW",
            },
            {
              label: "Karriere",
              href: "/karriere",
              description: "Stellenangebote",
            },
            {
              label: "Presse",
              href: "/presse",
              description: "Pressemitteilungen",
            },
          ],
        };
      default:
        return { label: title, href: "#" };
    }
  };

  const menuItem = getDefaultItems(title);

  const handleItemClick = useCallback(
    (href: string) => {
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
      setMobileMenuOpen(false);
      setFocusedIndex(-1);
      setFocusedSubIndex(-1);
      setFocusedSubSubIndex(-1);
      router.push(href);
    },
    [router],
  );

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setOpenSubDropdown(null);
        setOpenSubSubDropdown(null);
        setFocusedIndex(-1);
        setFocusedSubIndex(-1);
        setFocusedSubSubIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setOpenSubDropdown(null);
        setOpenSubSubDropdown(null);
        setMobileMenuOpen(false);
        setFocusedIndex(-1);
        setFocusedSubIndex(-1);
        setFocusedSubSubIndex(-1);
        return;
      }

      if (!openDropdown) return;

      const currentItem = menuItem;
      if (!currentItem) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (
            openSubSubDropdown &&
            currentItem.subItems?.[focusedSubIndex]?.subItems?.length
          ) {
            const subSubItems = currentItem.subItems[focusedSubIndex]?.subItems;
            if (subSubItems) {
              const nextSubSubIndex = Math.min(
                focusedSubSubIndex + 1,
                subSubItems.length - 1,
              );
              setFocusedSubSubIndex(nextSubSubIndex);
            }
          } else if (openSubDropdown && currentItem.subItems?.length) {
            const subItems = currentItem.subItems;
            const nextSubIndex = Math.min(
              focusedSubIndex + 1,
              subItems.length - 1,
            );
            setFocusedSubIndex(nextSubIndex);
          } else if (currentItem.subItems?.length) {
            setFocusedSubIndex(0);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (
            openSubSubDropdown &&
            currentItem.subItems?.[focusedSubIndex]?.subItems?.length
          ) {
            const prevSubSubIndex = Math.max(focusedSubSubIndex - 1, 0);
            setFocusedSubSubIndex(prevSubSubIndex);
          } else if (openSubDropdown && currentItem.subItems?.length) {
            const prevSubIndex = Math.max(focusedSubIndex - 1, 0);
            setFocusedSubIndex(prevSubIndex);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (openSubDropdown && focusedSubIndex >= 0) {
            const subItem = currentItem.subItems?.[focusedSubIndex];
            if (subItem?.subItems?.length) {
              setOpenSubSubDropdown(subItem.label);
              setFocusedSubSubIndex(0);
            }
          } else if (focusedSubIndex >= 0) {
            const subItem = currentItem.subItems?.[focusedSubIndex];
            if (subItem?.subItems?.length) {
              setOpenSubDropdown(subItem.label);
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (openSubSubDropdown) {
            setOpenSubSubDropdown(null);
            setFocusedSubSubIndex(-1);
          } else if (openSubDropdown) {
            setOpenSubDropdown(null);
            setFocusedSubIndex(-1);
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (openSubSubDropdown && focusedSubSubIndex >= 0) {
            const subSubItem =
              currentItem.subItems?.[focusedSubIndex]?.subItems?.[
                focusedSubSubIndex
              ];
            if (subSubItem) {
              handleItemClick(subSubItem.href);
            }
          } else if (focusedSubIndex >= 0) {
            const subItem = currentItem.subItems?.[focusedSubIndex];
            if (subItem) {
              if (subItem.subItems?.length) {
                setOpenSubDropdown(
                  openSubDropdown === subItem.label ? null : subItem.label,
                );
              } else {
                handleItemClick(subItem.href);
              }
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    openDropdown,
    openSubDropdown,
    openSubSubDropdown,
    focusedIndex,
    focusedSubIndex,
    focusedSubSubIndex,
    handleItemClick,
    menuItem,
  ]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
    setOpenSubDropdown(null);
    setOpenSubSubDropdown(null);
    setFocusedIndex(openDropdown === label ? -1 : 0);
    setFocusedSubIndex(-1);
    setFocusedSubSubIndex(-1);
  };

  const handleMobileSubMenuToggle = (label: string) => {
    console.log(
      "Mobile sub menu toggle:",
      label,
      mobileSubMenuOpen === label ? "closing" : "opening",
    );
    setMobileSubMenuOpen(mobileSubMenuOpen === label ? null : label);
    setMobileSubSubMenuOpen(null);
  };

  const handleMobileSubSubMenuToggle = (label: string) => {
    console.log(
      "Mobile sub-sub menu toggle:",
      label,
      mobileSubSubMenuOpen === label ? "closing" : "opening",
    );
    setMobileSubSubMenuOpen(mobileSubSubMenuOpen === label ? null : label);
  };

  // Get all menu items for mobile navigation
  const allMenuItems = [
    getDefaultItems("Sicherheit"),
    getDefaultItems("Service"),
    getDefaultItems("Polizei"),
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Desktop hover handlers with delay
  const handleMouseEnterDropdown = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
    setFocusedIndex(0);
  };

  const handleMouseLeaveDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
      setFocusedIndex(-1);
      setFocusedSubIndex(-1);
      setFocusedSubSubIndex(-1);
    }, 100);
  };

  const handleMouseEnterSubDropdown = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSubDropdown(label);
  };

  const handleMouseEnterSubSubDropdown = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSubSubDropdown(label);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => {
          console.log("Mobile menu toggle:", !mobileMenuOpen);
          setMobileMenuOpen(!mobileMenuOpen);
        }}
        className="relative z-50 rounded-xl border border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-2 backdrop-blur-sm transition-all duration-300 hover:border-white/40 md:hidden"
        aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={mobileMenuOpen}
      >
        <div className="relative h-6 w-6">
          <Menu
            className={`absolute inset-0 h-6 w-6 text-gray-800 transition-all duration-300 dark:text-white ${mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
          />
          <X
            className={`absolute inset-0 h-6 w-6 text-gray-800 transition-all duration-300 dark:text-white ${mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 md:hidden ${
          mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm transform bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out dark:bg-gray-900/95 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200/50 p-6 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          </div>

          <nav
            className="flex-1 overflow-y-auto px-4 py-6"
            role="navigation"
            aria-label="Mobile Navigation"
          >
            {allMenuItems.map((item) => (
              <div key={item.label} className="mb-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href ?? "#"}
                    onClick={() => item.href && handleItemClick(item.href)}
                    className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-gray-800 transition-all duration-200 hover:bg-gray-100/50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800/50 dark:hover:text-blue-400"
                  >
                    <span className="font-medium">{item.label}</span>
                  </Link>

                  {item.subItems && (
                    <button
                      onClick={() => handleMobileSubMenuToggle(item.label)}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      aria-expanded={mobileSubMenuOpen === item.label}
                      aria-label={`${item.label} Untermenü ${mobileSubMenuOpen === item.label ? "schließen" : "öffnen"}`}
                    >
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform duration-200 dark:text-gray-400 ${
                          mobileSubMenuOpen === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Mobile Submenu */}
                {mobileSubMenuOpen === item.label && item.subItems && (
                  <div className="ml-4 mt-2">
                    {item.subItems.map((subItem) => (
                      <div key={subItem.href} className="mb-2">
                        <div className="flex items-center justify-between">
                          <Link
                            href={subItem.href}
                            onClick={() => handleItemClick(subItem.href)}
                            className="flex-1 rounded-lg py-3 pl-4 pr-4 text-gray-600 transition-all duration-200 hover:bg-gray-50/50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800/30 dark:hover:text-blue-400"
                          >
                            <div>
                              <div className="font-medium">{subItem.label}</div>
                              {subItem.description && (
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                  {subItem.description}
                                </div>
                              )}
                            </div>
                          </Link>

                          {subItem.subItems && (
                            <button
                              onClick={() =>
                                handleMobileSubSubMenuToggle(subItem.label)
                              }
                              className="rounded-lg p-2 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                              aria-expanded={
                                mobileSubSubMenuOpen === subItem.label
                              }
                            >
                              <ChevronRight
                                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                  mobileSubSubMenuOpen === subItem.label
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Mobile Sub-submenu */}
                        {mobileSubSubMenuOpen === subItem.label &&
                          subItem.subItems && (
                            <div className="ml-8 mt-2">
                              {subItem.subItems.map((subSubItem) => (
                                <Link
                                  key={subSubItem.href}
                                  href={subSubItem.href}
                                  onClick={() =>
                                    handleItemClick(subSubItem.href)
                                  }
                                  className="block rounded-lg py-3 pl-4 pr-4 text-gray-500 transition-all duration-200 hover:bg-gray-50/50 hover:text-blue-600 dark:text-gray-500 dark:hover:bg-gray-800/30 dark:hover:text-blue-400"
                                >
                                  <div className="font-medium">
                                    {subSubItem.label}
                                  </div>
                                  {subSubItem.description && (
                                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                                      {subSubItem.description}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Menu */}
      <div
        className="relative"
        ref={menuRef}
        onMouseEnter={() =>
          menuItem.subItems && handleMouseEnterDropdown(menuItem.label)
        }
        onMouseLeave={handleMouseLeaveDropdown}
      >
        <div className="flex items-center">
          {/* Main menu link */}
          <Link
            href={menuItem.href ?? "#"}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-gray-700 transition-all duration-200 hover:bg-gray-100/50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-blue-400"
            onClick={() => menuItem.href && router.push(menuItem.href)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (menuItem.href) {
                  router.push(menuItem.href);
                }
              }
            }}
          >
            <span className="font-medium">{menuItem.label}</span>
          </Link>

          {/* Dropdown Toggle */}
          {menuItem.subItems && (
            <button
              onClick={() => handleDropdownToggle(menuItem.label)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDropdownToggle(menuItem.label);
                }
              }}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-gray-800/50"
              aria-expanded={openDropdown === menuItem.label}
              aria-label={`${menuItem.label} Untermenü ${openDropdown === menuItem.label ? "schließen" : "öffnen"}`}
              tabIndex={0}
            >
              <ChevronDown
                className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-gray-400 ${
                  openDropdown === menuItem.label ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Dropdown Menu */}
        {openDropdown === menuItem.label && menuItem.subItems && (
          <div
            className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95"
            style={{
              left: "0",
              right: "auto",
              transform: "translateX(0)",
              maxWidth: "calc(100vw - 2rem)",
            }}
          >
            <div className="p-2">
              {menuItem.subItems.map((subItem, subIndex) => (
                <div
                  key={subItem.href}
                  className="relative"
                  onMouseEnter={() =>
                    subItem.subItems &&
                    handleMouseEnterSubDropdown(subItem.label)
                  }
                  onMouseLeave={() => setOpenSubDropdown(null)}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={subItem.href}
                      onClick={() => handleItemClick(subItem.href)}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 ${
                        focusedSubIndex === subIndex
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 ring-2 ring-blue-500 dark:from-blue-900/20 dark:to-purple-900/20"
                          : ""
                      }`}
                      tabIndex={openDropdown === menuItem.label ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (subItem.subItems) {
                            setOpenSubDropdown(
                              openSubDropdown === subItem.label
                                ? null
                                : subItem.label,
                            );
                          } else {
                            handleItemClick(subItem.href);
                          }
                        }
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {subItem.label}
                        </span>
                        {subItem.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {subItem.description}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Sub-dropdown indicator */}
                    {subItem.subItems && (
                      <div className="px-2">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Sub-dropdown Menu */}
                  {openSubDropdown === subItem.label && subItem.subItems && (
                    <div
                      className="absolute left-full top-0 z-50 ml-2 w-72 rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95"
                      style={{
                        left: "0",
                        right: "auto",
                        transform: "translateX(0)",
                        maxWidth: "calc(100vw - 2rem)",
                      }}
                    >
                      <div className="p-2">
                        {subItem.subItems.map((subSubItem, subSubIndex) => (
                          <div
                            key={subSubItem.href}
                            className="relative"
                            onMouseEnter={() =>
                              handleMouseEnterSubSubDropdown(subItem.label)
                            }
                            onMouseLeave={() => setOpenSubSubDropdown(null)}
                          >
                            <Link
                              href={subSubItem.href}
                              onClick={() => handleItemClick(subSubItem.href)}
                              className={`block rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 ${
                                focusedSubSubIndex === subSubIndex &&
                                openSubSubDropdown === subItem.label
                                  ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                                  : ""
                              }`}
                              tabIndex={
                                openSubDropdown === subItem.label ? 0 : -1
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleItemClick(subSubItem.href);
                                }
                              }}
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  {subSubItem.label}
                                </span>
                                {subSubItem.description && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {subSubItem.description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
