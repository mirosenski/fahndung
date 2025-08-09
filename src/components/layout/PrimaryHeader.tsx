import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Menu, X } from "lucide-react";
import { Logo } from "../ui/Logo";
import A11navEnhanced from "@/components/layout/A11navEnhanced";
import {
  navigationData,
  type NavItem,
  type NavSection,
} from "@/constants/navigationData";

/**
 * PrimaryHeader Component
 * Container-Variante des ModernHeader mit Glassmorphismus
 * - Nicht full-width, max-w 1273px, zentriert
 * - Startet mit Abstand nach oben und kompaktet beim Scrollen
 * - Sticky Verhalten mit beibehaltener Border-Radius
 */
export default function PrimaryHeader() {
  const [isCompact, setIsCompact] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll-Handler für Kompaktierung
  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation Sections
  const navSections: NavSection[] = ["SICHERHEIT", "SERVICE", "POLIZEI"];

  // Dropdown Handlers mit Hover + Click
  const handleMouseEnter = (section: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(section);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownClick = (section: string) => {
    setActiveDropdown(activeDropdown === section ? null : section);
  };

  return (
    <>
      {/* Skip Link für Screenreader */}
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:ring-4 focus:ring-primary/30"
      >
        Zum Hauptinhalt springen
      </a>

      {/* Sticky Bereich mit Container-Header */}
      <header
        className="sticky top-0 z-50"
        role="banner"
        aria-label="Hauptnavigation"
      >
        {/* Glassmorphismus-Container (freistehend) */}
        <div
          className={`
            mx-auto max-w-[1273px] transition-all duration-300
            ${isCompact ? "mt-0 h-16" : "mt-4 h-[106px]"}
            rounded-[10px] border border-white/50
            bg-white/40 shadow-lg
            backdrop-blur-[50px] hover:shadow-xl
          `}
        >
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <nav className="ml-8 hidden items-center space-x-1 lg:flex">
              {navSections.map((section) => (
                <div
                  key={section}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(section)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => handleDropdownClick(section)}
                    className={`
                      flex items-center gap-1.5 rounded-lg px-4 
                      py-2 text-sm font-medium
                      text-foreground/90 transition-all
                      duration-200 hover:bg-accent/50 hover:text-primary
                      focus:outline-none focus:ring-2 focus:ring-primary/50
                      ${activeDropdown === section ? "bg-accent/50 text-primary" : ""}
                    `}
                    aria-expanded={activeDropdown === section}
                    aria-haspopup="true"
                  >
                    {section}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        activeDropdown === section ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === section && (
                    <div
                      className={`
                        animate-in fade-in-0 zoom-in-95 absolute left-0
                        top-full mt-2 w-80
                        rounded-xl border border-border/50
                        bg-popover/95 shadow-xl backdrop-blur-2xl duration-200 dark:bg-popover/90
                      `}
                    >
                      <div className="p-2">
                        {navigationData[section].map((item: NavItem) => {
                          const IconComponent = item.icon;
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              className={`
                                flex items-start gap-3 rounded-lg px-3 py-2.5
                                transition-colors duration-200
                                hover:bg-accent focus:bg-accent focus:outline-none
                                ${item.urgent ? "border border-destructive/20" : ""}
                              `}
                            >
                              <IconComponent
                                className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                                  item.urgent
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <div className="flex-1">
                                <div
                                  className={`text-sm font-medium ${
                                    item.urgent
                                      ? "text-destructive"
                                      : "text-foreground"
                                  }`}
                                >
                                  {item.label}
                                  {item.badge && (
                                    <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <div className="mt-0.5 text-xs text-muted-foreground">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="hidden items-center md:flex">
                <div
                  className={`
                    relative flex items-center
                    rounded-lg border border-input/50
                    bg-background/50 backdrop-blur-xl transition-all
                    duration-200 focus-within:border-primary/50
                    focus-within:bg-background/70 dark:bg-background/30
                    ${isCompact ? "w-48" : "w-64"}
                  `}
                >
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Suche..."
                    className="w-full bg-transparent py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    aria-label="Suche im Fahndungsportal"
                  />
                </div>
              </div>

              {/* Enhanced A11y Dropdown - ALLE Meta-Nav Features */}
              <A11navEnhanced isCompact={isCompact} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 lg:hidden"
                aria-label="Mobilmenü öffnen"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className={`fixed inset-0 z-40 ${
              isCompact ? "top-16" : "top-[106px]"
            } bg-background/95 backdrop-blur-xl lg:hidden`}
          >
            <nav className="space-y-4 p-4">
              {navSections.map((section) => (
                <div key={section}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {section}
                  </h3>
                  <div className="space-y-1">
                    {navigationData[section].map((item: NavItem) => {
                      const IconComponent = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
