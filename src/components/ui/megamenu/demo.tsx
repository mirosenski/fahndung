"use client";

import {
  Shield,
  Search,
  Users,
  AlertTriangle,
  Package,
  TrendingUp,
  Lightbulb,
  Monitor,
  Phone,
  HelpCircle,
  Download,
  Building2,
} from "lucide-react";
import { NavigationWrapper } from "./index";

// Demo Logo Component
const DemoLogo = () => (
  <div className="flex items-center space-x-2">
    <Shield className="h-8 w-8 text-blue-600" />
    <span className="text-xl font-bold text-gray-900 dark:text-white">
      Polizei BW
    </span>
  </div>
);

// Demo Menu Items
const demoMenuItems = [
  {
    label: "Sicherheit",
    href: "/sicherheit",
    description: "Sicherheit und Ordnung",
    icon: <Shield className="h-5 w-5" />,
    subItems: [
      {
        label: "Fahndungen",
        href: "/fahndungen",
        description: "Aktuelle Fahndungsfälle und Hinweise",
        icon: <Search className="h-5 w-5" />,
        badge: "Neu",
        subItems: [
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
        label: "Kriminalstatistik",
        href: "/statistiken",
        description: "Zahlen und Fakten zur Sicherheitslage",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        label: "Prävention",
        href: "/praevention",
        description: "Vorbeugung und Sicherheitstipps",
        icon: <Shield className="h-5 w-5" />,
      },
      {
        label: "Hinweise geben",
        href: "/hinweise",
        description: "Anonyme Hinweise an die Polizei",
        icon: <Lightbulb className="h-5 w-5" />,
      },
    ],
  },
  {
    label: "Service",
    href: "/service",
    description: "Bürgerservice",
    icon: <Building2 className="h-5 w-5" />,
    subItems: [
      {
        label: "Online-Services",
        href: "/online-services",
        description: "Digitale Dienste und Anträge",
        icon: <Monitor className="h-5 w-5" />,
        badge: "24/7",
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
      {
        label: "Downloads",
        href: "/downloads",
        description: "Formulare und Merkblätter",
        icon: <Download className="h-5 w-5" />,
      },
    ],
  },
];

export function MegaMenuDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationWrapper menuItems={demoMenuItems} logo={<DemoLogo />} />

      {/* Demo Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Megamenü Demo
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Eine moderne, responsive Navigation mit Lucide Icons und Framer
            Motion Animationen.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <Shield className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Sicherheit
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vollständige Sicherheitslösungen für Ihre Gemeinde.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <Search className="mb-4 h-8 w-8 text-green-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Fahndungen
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aktuelle Fahndungsfälle und Hinweise.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <Building2 className="mb-4 h-8 w-8 text-purple-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Service
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bürgerservice und Online-Dienste.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
