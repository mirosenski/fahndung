import type { FahndungsData, CategoryType, PriorityType } from "./types";

// Hilfsfunktion für Platzhalterbild
export const getPlaceholderImage = () =>
  "/images/placeholders/fotos/platzhalterbild.svg";

// Sichere Bildquelle-Validierung
export const getSafeImageSrc = (data: FahndungsData, imageError: boolean) => {
  if (imageError) {
    return getPlaceholderImage();
  }

  const mainImageUrl = data.step3.mainImageUrl;
  const mainImage = data.step3.mainImage;

  // Prüfe ob die Bildquellen gültig sind (nicht leer, nicht undefined)
  if (mainImageUrl && mainImageUrl.trim() !== "") {
    return mainImageUrl;
  }

  if (mainImage && mainImage.trim() !== "") {
    return mainImage;
  }

  return getPlaceholderImage();
};

// Sichere Bildquelle-Validierung für zusätzliche Bilder
export const getSafeAdditionalImageSrc = (img: string) => {
  if (!img || img.trim() === "") {
    return getPlaceholderImage();
  }
  return img;
};

// Konvertiere Investigation zu FahndungsData Format
export const convertInvestigationToFahndungsData = (
  investigation: Record<string, unknown>,
): FahndungsData => {
  if (!investigation) return {} as FahndungsData;

  return {
    step1: {
      title: (investigation["title"] as string) ?? "Unbekannte Fahndung",
      category: (investigation["category"] as CategoryType) ?? "MISSING_PERSON",
      caseNumber: (investigation["case_number"] as string) ?? "",
      // Schritt 1 enthält die Priorität im Wizard nicht, Karten-Daten behalten sie in step2
    },
    step2: {
      shortDescription: (investigation["short_description"] as string) ?? "",
      description: (investigation["description"] as string) ?? "",
      priority: (investigation["priority"] as PriorityType) ?? "normal",
      tags: (investigation["tags"] as string[]) ?? [],
      features: (investigation["features"] as string) ?? "",
    },
    step3: {
      mainImage:
        (investigation["images"] as Array<{ url: string }>)?.[0]?.url ?? "",
      additionalImages:
        (investigation["images"] as Array<{ url: string }>)
          ?.slice(1)
          .map((img) => img.url) ?? [],
    },
    step4: {
      mainLocation: investigation["location"]
        ? { address: investigation["location"] as string }
        : undefined,
    },
    step5: {
      contactPerson:
        ((investigation["contact_info"] as Record<string, unknown>)?.[
          "person"
        ] as string) ?? "Polizei",
      contactPhone:
        ((investigation["contact_info"] as Record<string, unknown>)?.[
          "phone"
        ] as string) ?? "+49 711 8990-0",
      contactEmail:
        ((investigation["contact_info"] as Record<string, unknown>)?.[
          "email"
        ] as string) ?? "",
      department:
        ((investigation["contact_info"] as Record<string, unknown>)?.[
          "department"
        ] as string) ?? "Polizeipräsidium",
      availableHours:
        ((investigation["contact_info"] as Record<string, unknown>)?.[
          "hours"
        ] as string) ?? "24/7",
    },
  };
};

// Sichere Datenprüfung mit Fallback-Werten
export const createSafeData = (
  data: FahndungsData | undefined,
  mockData: FahndungsData,
): FahndungsData => {
  return {
    step1: {
      title: data?.step1?.title ?? mockData.step1.title,
      category: data?.step1?.category ?? mockData.step1.category,
      caseNumber: data?.step1?.caseNumber ?? mockData.step1.caseNumber,
      caseDate: data?.step1?.caseDate ?? mockData.step1.caseDate,
      department:
        data?.step1?.department ??
        data?.step5?.department ??
        mockData.step5.department,
      variant: data?.step1?.variant,
    },
    step2: {
      shortDescription:
        data?.step2?.shortDescription ?? mockData.step2.shortDescription,
      description: data?.step2?.description ?? mockData.step2.description,
      priority: data?.step2?.priority ?? mockData.step2.priority,
      tags: data?.step2?.tags ?? mockData.step2.tags,
      features: data?.step2?.features ?? mockData.step2.features,
    },
    step3: {
      mainImage: data?.step3?.mainImage ?? mockData.step3.mainImage,
      additionalImages:
        data?.step3?.additionalImages ?? mockData.step3.additionalImages,
    },
    step4: {
      mainLocation: data?.step4?.mainLocation ?? mockData.step4.mainLocation,
    },
    step5: {
      contactPerson: data?.step5?.contactPerson ?? mockData.step5.contactPerson,
      contactPhone: data?.step5?.contactPhone ?? mockData.step5.contactPhone,
      contactEmail: data?.step5?.contactEmail ?? mockData.step5.contactEmail,
      department: data?.step5?.department ?? mockData.step5.department,
      availableHours:
        data?.step5?.availableHours ?? mockData.step5.availableHours,
    },
  };
};
