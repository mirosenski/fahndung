"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamischer Import der Fahndungskarte mit SSR deaktiviert
const ModernFahndungskarte = dynamic(
  () =>
    import("./Fahndungskarte").then((mod) => ({
      default: mod.ModernFahndungskarte,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    ),
  },
);

// Typ-Definitionen für echte Daten aus der Datenbank
interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

// Konvertierung von Datenbank-Daten zu FahndungsData Format
const convertInvestigationToFahndungsData = (investigation: Investigation) => {
  // Fallback-Bilder für verschiedene Kategorien
  const getDefaultImage = (category: string) => {
    switch (category) {
      case "MISSING_PERSON":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      case "WANTED_PERSON":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      case "STOLEN_GOODS":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      case "UNKNOWN_DEAD":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      default:
        return "/images/placeholders/fotos/platzhalterbild.svg";
    }
  };

  // Hilfsfunktion um zu prüfen, ob ein echtes Bild vorhanden ist
  const hasRealImage = (
    images?: Array<{
      id: string;
      url: string;
      alt_text?: string;
      caption?: string;
    }>,
  ) => {
    return (
      images &&
      images.length > 0 &&
      images[0]?.url &&
      images[0].url.trim() !== ""
    );
  };

  return {
    step1: {
      title: investigation.title,
      category: investigation.category as
        | "WANTED_PERSON"
        | "MISSING_PERSON"
        | "UNKNOWN_DEAD"
        | "STOLEN_GOODS",
      caseNumber: investigation.case_number,
    },
    step2: {
      shortDescription:
        investigation.short_description ??
        investigation.description?.substring(0, 100) + "..." ??
        "",
      description: investigation.description ?? "",
      priority: investigation.priority,
      tags: investigation.tags ?? [],
      features: investigation.features ?? "",
    },
    step3: {
      mainImage: hasRealImage(investigation.images)
        ? investigation.images![0]!.url
        : getDefaultImage(investigation.category),
      additionalImages:
        investigation.images?.slice(1).map((img) => img.url) ?? [],
    },
    step4: {
      mainLocation: investigation.location
        ? { address: investigation.location }
        : undefined,
    },
    step5: {
      contactPerson:
        (investigation.contact_info?.["person"] as string) ?? "Polizei",
      contactPhone:
        (investigation.contact_info?.["phone"] as string) ?? "+49 711 8990-0",
      contactEmail: (investigation.contact_info?.["email"] as string) ?? "",
      department: investigation.station ?? "Polizeipräsidium",
      availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
    },
  };
};

interface FahndungskarteGridProps {
  investigations: Investigation[];
  className?: string;
  onAction?: () => void;
  userRole?: string;
  userPermissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canPublish?: boolean;
  };
}

const FahndungskarteGrid: React.FC<FahndungskarteGridProps> = ({
  investigations,
  className = "",
  onAction,
  userRole,
  userPermissions,
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {investigations.map((investigation) => (
        <ModernFahndungskarte
          key={investigation.id}
          data={convertInvestigationToFahndungsData(investigation)}
          investigationId={investigation.id}
          onAction={onAction}
          userRole={userRole}
          userPermissions={userPermissions}
        />
      ))}
    </div>
  );
};

export default FahndungskarteGrid;
