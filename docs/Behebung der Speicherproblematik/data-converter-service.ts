// src/lib/services/investigationDataConverter.ts

export interface UIInvestigationData {
  step1: {
    title: string;
    category:
      | "WANTED_PERSON"
      | "MISSING_PERSON"
      | "UNKNOWN_DEAD"
      | "STOLEN_GOODS";
    caseNumber?: string;
  };
  step2: {
    shortDescription: string;
    description: string;
    priority: "normal" | "urgent" | "new";
    tags: string[];
    features: string;
  };
  step3: {
    mainImage: string | null;
    additionalImages: string[];
  };
  step4: {
    mainLocation: { address: string } | null;
  };
  step5: {
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    department: string;
    availableHours: string;
  };
}

export interface DBInvestigationData {
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
  tags: string[];
  contact_info?: Record<string, unknown>;
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

export class InvestigationDataConverter {
  /**
   * Konvertiert Datenbank-Format zu UI-Format
   */
  static toUIFormat(dbData: DBInvestigationData): UIInvestigationData {
    return {
      step1: {
        title: dbData.title,
        category: dbData.category as UIInvestigationData["step1"]["category"],
        caseNumber: dbData.case_number,
      },
      step2: {
        shortDescription: dbData.short_description || "",
        description: dbData.description || "",
        priority: dbData.priority || "normal",
        tags: dbData.tags || [],
        features: dbData.features || "",
      },
      step3: {
        mainImage: dbData.images?.[0]?.url || null,
        additionalImages: dbData.images?.slice(1).map((img) => img.url) || [],
      },
      step4: {
        mainLocation: dbData.location ? { address: dbData.location } : null,
      },
      step5: {
        contactPerson: (dbData.contact_info?.["person"] as string) || "Polizei",
        contactPhone:
          (dbData.contact_info?.["phone"] as string) || "+49 711 8990-0",
        contactEmail: (dbData.contact_info?.["email"] as string) || "",
        department: dbData.station || "Polizeipräsidium",
        availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
      },
    };
  }

  /**
   * Konvertiert UI-Format zu Datenbank-Format (für Updates)
   */
  static toDBFormat(
    uiData: UIInvestigationData,
    id: string,
  ): Partial<DBInvestigationData> {
    return {
      id,
      title: uiData.step1.title,
      description: uiData.step2.description,
      short_description: uiData.step2.shortDescription,
      priority: uiData.step2.priority,
      category: uiData.step1.category,
      location: uiData.step4.mainLocation?.address || "",
      features: uiData.step2.features,
      contact_info: {
        person: uiData.step5.contactPerson,
        phone: uiData.step5.contactPhone,
        email: uiData.step5.contactEmail || "",
      },
      tags: uiData.step2.tags,
      station: uiData.step5.department,
    };
  }

  /**
   * Validiert UI-Daten vor dem Speichern
   */
  static validateUIData(data: UIInvestigationData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Pflichtfelder prüfen
    if (!data.step1.title?.trim()) {
      errors.push("Titel ist ein Pflichtfeld");
    }

    if (!data.step2.description?.trim()) {
      errors.push("Beschreibung ist ein Pflichtfeld");
    }

    if (!data.step1.category) {
      errors.push("Kategorie ist ein Pflichtfeld");
    }

    // Priorität validieren
    const validPriorities = ["normal", "urgent", "new"];
    if (!validPriorities.includes(data.step2.priority)) {
      errors.push("Ungültige Priorität");
    }

    // Kontaktinformationen validieren
    if (!data.step5.contactPerson?.trim()) {
      errors.push("Ansprechpartner ist ein Pflichtfeld");
    }

    if (!data.step5.contactPhone?.trim()) {
      errors.push("Telefonnummer ist ein Pflichtfeld");
    }

    // Telefonnummer-Format prüfen (optional)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (data.step5.contactPhone && !phoneRegex.test(data.step5.contactPhone)) {
      errors.push("Ungültiges Telefonnummer-Format");
    }

    // E-Mail-Format prüfen (wenn vorhanden)
    if (data.step5.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.step5.contactEmail)) {
        errors.push("Ungültiges E-Mail-Format");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extrahiert nur geänderte Felder für partielle Updates
   */
  static getChangedFields(
    original: UIInvestigationData,
    edited: UIInvestigationData,
  ): Partial<DBInvestigationData> {
    const changes: Partial<DBInvestigationData> = {};

    // Step 1 - Grunddaten
    if (original.step1.title !== edited.step1.title) {
      changes.title = edited.step1.title;
    }
    if (original.step1.category !== edited.step1.category) {
      changes.category = edited.step1.category;
    }

    // Step 2 - Beschreibung
    if (original.step2.description !== edited.step2.description) {
      changes.description = edited.step2.description;
    }
    if (original.step2.shortDescription !== edited.step2.shortDescription) {
      changes.short_description = edited.step2.shortDescription;
    }
    if (original.step2.priority !== edited.step2.priority) {
      changes.priority = edited.step2.priority;
    }
    if (
      JSON.stringify(original.step2.tags) !== JSON.stringify(edited.step2.tags)
    ) {
      changes.tags = edited.step2.tags;
    }
    if (original.step2.features !== edited.step2.features) {
      changes.features = edited.step2.features;
    }

    // Step 4 - Ort
    if (
      original.step4.mainLocation?.address !==
      edited.step4.mainLocation?.address
    ) {
      changes.location = edited.step4.mainLocation?.address || "";
    }

    // Step 5 - Kontakt
    const originalContact = {
      person: original.step5.contactPerson,
      phone: original.step5.contactPhone,
      email: original.step5.contactEmail,
    };
    const editedContact = {
      person: edited.step5.contactPerson,
      phone: edited.step5.contactPhone,
      email: edited.step5.contactEmail,
    };

    if (JSON.stringify(originalContact) !== JSON.stringify(editedContact)) {
      changes.contact_info = editedContact;
    }

    if (original.step5.department !== edited.step5.department) {
      changes.station = edited.step5.department;
    }

    return changes;
  }
}
