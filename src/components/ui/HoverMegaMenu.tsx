"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HoverMegaMenuProps {
  title: string;
  items?: Array<{
    title: string;
    description?: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export function HoverMegaMenu({ title, items = [] }: HoverMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Standard-Menü-Items basierend auf dem Titel
  const getDefaultItems = (menuTitle: string) => {
    switch (menuTitle) {
      case "Sicherheit":
        return [
          {
            title: "Fahndungen",
            description: "Aktuelle Fahndungsfälle",
            href: "/fahndungen",
          },
          {
            title: "Statistiken",
            description: "Sicherheitsstatistiken",
            href: "/statistiken",
          },
          {
            title: "Hinweise",
            description: "Sicherheitshinweise",
            href: "/hinweise",
          },
        ];
      case "Service":
        return [
          {
            title: "Kontakt",
            description: "Kontaktinformationen",
            href: "/kontakt",
          },
          { title: "FAQ", description: "Häufige Fragen", href: "/faq" },
          {
            title: "Downloads",
            description: "Formulare und Dokumente",
            href: "/downloads",
          },
        ];
      case "Polizei":
        return [
          {
            title: "Über uns",
            description: "Informationen zur Polizei BW",
            href: "/ueber-uns",
          },
          {
            title: "Karriere",
            description: "Stellenangebote",
            href: "/karriere",
          },
          {
            title: "Presse",
            description: "Pressemitteilungen",
            href: "/presse",
          },
        ];
      default:
        return [];
    }
  };

  const menuItems = items.length > 0 ? items : getDefaultItems(title);

  // Bestimme die URL für den Menütitel basierend auf dem Titel
  const getTitleUrl = (menuTitle: string) => {
    switch (menuTitle) {
      case "Sicherheit":
        return "/sicherheit";
      case "Service":
        return "/service";
      case "Polizei":
        return "/polizei";
      default:
        return "#";
    }
  };

  const titleUrl = getTitleUrl(title);

  // Keyboard Navigation Handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        // Wenn der Fokus auf dem Link ist, navigiere zur Seite
        if (event.currentTarget.tagName === "A") {
          router.push(titleUrl);
        } else {
          // Wenn der Fokus auf dem Toggle-Button ist, öffne/schließe Menü
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        if (isOpen) {
          event.preventDefault();
          const firstMenuItem = menuRef.current?.querySelector(
            "a[href]",
          ) as HTMLElement | null;
          firstMenuItem?.focus();
        }
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onKeyDown={handleKeyDown}
      style={{ position: "relative" }}
    >
      <div className="flex items-center">
        <a
          href={titleUrl}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          tabIndex={0}
          role="button"
          aria-label={`${title} Hauptseite öffnen`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(titleUrl);
            }
          }}
        >
          {title}
        </a>
        <button
          className="flex items-center gap-1 rounded-md px-1 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`${title} Untermenü ${isOpen ? "schließen" : "öffnen"}`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg"
          role="menu"
          aria-label={`${title} Untermenü`}
          style={{
            left: "0",
            right: "auto",
            transform: "translateX(0)",
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          <div className="p-4">
            <div className="grid gap-3">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                  tabIndex={isOpen ? 0 : -1}
                  role="menuitem"
                >
                  {"icon" in item && item.icon && (
                    <div className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary">
                      {item.icon}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
