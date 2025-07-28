"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronRight, Ellipsis } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { ReactElement } from "react";

/**
 * Interface für die Breadcrumb-Props
 */
interface BreadcrumbProps {
  /**
   * Objekt mit benutzerdefinierten Labels für URL-Segmente
   * @example { "investigations": "Fahndungen", "123": "Fahndung #123" }
   */
  values?: Record<string, string>;

  /**
   * Maximale Anzahl der anzuzeigenden Breadcrumb-Items
   * @default 5
   */
  maxDepth?: number;

  /**
   * Zusätzliche CSS-Klassen für die Breadcrumb-Komponente
   */
  className?: string;

  /**
   * Gibt an, ob der Home-Link angezeigt werden soll
   * @default true
   */
  showHome?: boolean;

  /**
   * Variante des Designs
   * @default "default"
   */
  variant?: "default" | "compact" | "minimal";
}

/**
 * Deutsche Standard-Labels für gängige Pfade
 */
const defaultLabels: Record<string, string> = {
  "": "Startseite",
  dashboard: "Dashboard",
  admin: "Administration",
  login: "Anmeldung",
  register: "Registrierung",
  investigations: "Fahndungen",

  settings: "Einstellungen",
  users: "Benutzer",
  media: "Medien",
  overview: "Übersicht",
  activity: "Aktivitäten",
  "pending-registrations": "Ausstehende Registrierungen",
  "admin-actions": "Admin Aktionen",
  "create-user": "Neuer Benutzer",
};

type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrent: boolean;
};

type EllipsisItem = {
  type: "ellipsis";
};

type ProcessedItem = BreadcrumbItem | EllipsisItem;

/**
 * Breadcrumb-Komponente für Next.js 15 mit App Router
 *
 * @param {BreadcrumbProps} props - Die Props für die Breadcrumb-Komponente
 * @returns {ReactElement | null} Die gerenderte Breadcrumb-Komponente oder null
 */
export function Breadcrumb({
  values = {},
  maxDepth = 5,
  className = "",
  showHome = true,
  variant = "default",
}: BreadcrumbProps): ReactElement | null {
  const pathname = usePathname();

  // Memoized Breadcrumb-Items-Berechnung
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    // Pfad-Segmente aus der URL extrahieren
    if (!pathname) return [];
    const segments = pathname.split("/").filter((segment) => segment !== "");

    // Start-Array für Breadcrumb-Items
    const items: BreadcrumbItem[] = [];

    // Aktueller Pfad für die hrefs
    let currentPath = "";

    // Home-Link hinzufügen, wenn showHome true ist
    if (showHome) {
      items.push({
        label: defaultLabels[""] ?? "Startseite",
        href: "/",
        isCurrent: segments.length === 0,
      });
    }

    // Segmente durchgehen und Breadcrumb-Items erstellen
    segments.forEach((segment, index) => {
      // Wenn maxDepth erreicht ist, abbrechen
      if (items.length >= maxDepth) return;

      currentPath += `/${segment}`;

      // Label bestimmen (zuerst aus values, dann aus defaultLabels, dann Segment selbst)
      const label = values[segment] ?? defaultLabels[segment] ?? segment;

      // Letztes Item als "current page" markieren
      const isCurrent = index === segments.length - 1;

      // Item hinzufügen
      items.push({
        label,
        href: currentPath,
        isCurrent,
      });
    });

    return items;
  }, [pathname, values, maxDepth, showHome]);

  // Breadcrumbs mit Ellipsis für lange Pfade
  const processedItems = useMemo((): ProcessedItem[] => {
    // Wenn weniger als 4 Items, kein Ellipsis benötigt
    if (breadcrumbItems.length <= 4) {
      return breadcrumbItems;
    }

    // Ersten und letzten 2 Items behalten, Rest mit Ellipsis ersetzen
    const firstItem = breadcrumbItems[0];
    const lastTwoItems = breadcrumbItems.slice(-2);

    if (!firstItem) return breadcrumbItems;

    return [firstItem, { type: "ellipsis" }, ...lastTwoItems];
  }, [breadcrumbItems]);

  // CSS-Klassen basierend auf Variante
  const getVariantClasses = (): string => {
    switch (variant) {
      case "compact":
        return "py-2";
      case "minimal":
        return "py-1";
      default:
        return "py-4";
    }
  };

  const getItemClasses = (isCurrent: boolean): string => {
    const baseClasses = "px-3 py-1.5 rounded-md transition-colors";

    if (isCurrent) {
      return `${baseClasses} text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800`;
    }

    return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800`;
  };

  // Seiten, auf denen keine Breadcrumb angezeigt werden soll
  const excludedPaths = [
    "/login", // Login-Seite
    "/register", // Registrierungs-Seite
  ];

  // Prüfen, ob die aktuelle Seite ausgeschlossen ist
  if (!pathname || excludedPaths.includes(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex w-full bg-white dark:bg-gray-900 ${getVariantClasses()} ${className}`}
    >
      <div className="container mx-auto px-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {processedItems.map((item, index) => (
            <Fragment
              key={
                typeof item === "object" && "type" in item
                  ? `ellipsis-${index}`
                  : item.href
              }
            >
              {typeof item === "object" &&
              "type" in item &&
              item.type === "ellipsis" ? (
                <li className="flex items-center">
                  <Ellipsis className="h-4 w-4 text-gray-400" />
                </li>
              ) : (
                <>
                  {index > 0 && (
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </li>
                  )}
                  <li className="flex items-center">
                    {(item as BreadcrumbItem).isCurrent ? (
                      <span
                        aria-current="page"
                        className={getItemClasses(true)}
                      >
                        {(item as BreadcrumbItem).label}
                      </span>
                    ) : (
                      <Link
                        href={(item as BreadcrumbItem).href}
                        className={getItemClasses(false)}
                      >
                        {(item as BreadcrumbItem).label}
                      </Link>
                    )}
                  </li>
                </>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </nav>
  );
}
