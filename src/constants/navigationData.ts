import type { ComponentType, SVGProps } from "react";
import {
  Shield,
  Users,
  UserCheck,
  Package,
  Eye,
  Plus,
  LayoutDashboard,
  Phone,
  Accessibility,
  ExternalLink,
  Building,
  FileText,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  urgent?: boolean;
  badge?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export type NavSection = "SICHERHEIT" | "SERVICE" | "POLIZEI";

export const navigationData: Record<NavSection, NavItem[]> = {
  SICHERHEIT: [
    {
      label: "Alle Fahndungen",
      href: "/fahndungen/alle",
      description: "Übersicht aller aktiven Fahndungen",
      icon: Eye,
      urgent: false,
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      description: "Fahndungs-Dashboard und Statistiken",
      icon: LayoutDashboard,
      urgent: false,
    },
    {
      label: "Neue Fahndung",
      href: "/fahndungen/neu",
      description: "Neue Fahndung erstellen",
      icon: Plus,
      urgent: true,
      badge: "NEU",
    },
    {
      label: "Straftäter",
      href: "/fahndungen/straftaeter",
      description: "Gesuchte Straftäter",
      icon: Shield,
      urgent: false,
    },
    {
      label: "Vermisste",
      href: "/fahndungen/vermisste",
      description: "Vermisste Personen",
      icon: Users,
      urgent: false,
    },
    {
      label: "Unbekannte Tote",
      href: "/fahndungen/unbekannte-tote",
      description: "Identifizierung unbekannter Verstorbener",
      icon: UserCheck,
      urgent: false,
    },
    {
      label: "Sachen",
      href: "/fahndungen/sachen",
      description: "Vermisste oder gestohlene Gegenstände",
      icon: Package,
      urgent: false,
    },
  ],

  SERVICE: [
    {
      label: "Kontakt zur Polizei",
      href: "/kontakt",
      description: "Notrufnummern und Dienststellen",
      icon: Phone,
      urgent: true,
    },
    {
      label: "Barrierefreiheit",
      href: "/barrierefreiheit",
      description: "Leichte Sprache und Gebärdensprache",
      icon: Accessibility,
      urgent: false,
    },
  ],

  POLIZEI: [
    {
      label: "Extrapolfahndung",
      href: "/extrapolfahndung",
      description: "Extrapolfahndungsseite",
      icon: ExternalLink,
      urgent: false,
    },
    {
      label: "Andere Bundesländer",
      href: "/bundeslaender",
      description: "Fahndungsseiten aller Bundesländer/BKA",
      icon: Building,
      urgent: false,
    },
    {
      label: "Über uns",
      href: "/ueber-uns",
      description: "Organisation und Aufgaben",
      icon: FileText,
      urgent: false,
    },
    {
      label: "Dienststellen",
      href: "/dienststellen",
      description: "Standorte und Öffnungszeiten",
      icon: Building,
      urgent: false,
    },
  ],
};
