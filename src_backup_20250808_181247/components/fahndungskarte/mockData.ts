import type { FahndungsData } from "./types";

// Mock data für Demo
export const mockData: FahndungsData = {
  step1: {
    title: "Torben Seiler",
    category: "MISSING_PERSON",
    caseNumber: "POL-2024-K-001234-A",
  },
  step2: {
    shortDescription:
      "Vermisst seit 15.07.2025 in München. Zuletzt gesehen am Marienplatz.",
    description:
      "Torben Seiler wurde zuletzt am 15. Juli 2025 gegen 14:30 Uhr am Münchener Marienplatz gesehen. Er trug eine blaue Jeans und ein weißes T-Shirt. Torben ist 1,78m groß und hat blonde Haare.",
    priority: "urgent",
    tags: ["München", "Marienplatz", "Blonde Haare", "1,78m"],
    features:
      "Auffälliges Tattoo am rechten Unterarm (Adler), trägt meist eine schwarze Armbanduhr",
  },
  step3: {
    mainImage: "/images/torben_seiler.png",
    additionalImages: [
      "/images/platzhalterbild.png",
      "/images/unbekannt_mann.png",
    ],
  },
  step4: {
    mainLocation: { address: "Marienplatz 1, 80331 München" },
  },
  step5: {
    contactPerson: "Kommissar Weber",
    contactPhone: "+49 89 2910-0",
    contactEmail: "weber@polizei.muenchen.de",
    department: "Polizeipräsidium München",
    availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
  },
};
