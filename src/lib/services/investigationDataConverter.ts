import type { UIInvestigationData } from "~/lib/types/investigation.types";
import {
  UIInvestigationDBSchema,
  UIInvestigationEditSchema,
} from "~/lib/types/investigation.types";
import { z } from "zod";

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error | z.ZodError };

export class InvestigationDataConverter {
  /**
   * Konvertiert und bereinigt Datenbank-Format zu UI-Format
   */
  static toUIFormat(
    dbData: Record<string, unknown>,
  ): Result<UIInvestigationData> {
    try {
      // Bereinige und normalisiere die Daten
      const cleanedContactInfo = this.cleanContactInfo(
        dbData["contact_info"] as Record<string, unknown> | undefined,
      );

      const uiData = {
        step1: {
          title: (dbData["title"] as string) ?? "",
          category: this.validateCategory(dbData["category"] as string),
          caseNumber: dbData["case_number"] as string,
        },
        step2: {
          shortDescription: (dbData["short_description"] as string) ?? "",
          description: (dbData["description"] as string) ?? "",
          priority: this.validatePriority(dbData["priority"] as string),
          tags: Array.isArray(dbData["tags"])
            ? (dbData["tags"] as string[])
            : [],
          features: (dbData["features"] as string) ?? "",
        },
        step3: {
          mainImage:
            (dbData["images"] as Array<{ url: string }>)?.[0]?.url ?? null,
          additionalImages:
            (dbData["images"] as Array<{ url: string }>)
              ?.slice(1)
              .map((img) => img.url) ?? [],
        },
        step4: {
          mainLocation: dbData["location"]
            ? { address: dbData["location"] as string }
            : null,
        },
        step5: {
          contactPerson: cleanedContactInfo.person ?? "Polizei",
          contactPhone: cleanedContactInfo.phone ?? "+49 711 8990-0",
          contactEmail: cleanedContactInfo.email ?? "",
          department: (dbData["station"] as string) ?? "Polizeipräsidium",
          availableHours: cleanedContactInfo.hours ?? "24/7",
        },
        images:
          (dbData["images"] as Array<{
            id: string;
            url: string;
            alt_text?: string;
            caption?: string;
          }>) ?? [],
        contact_info: (dbData["contact_info"] as Record<string, unknown>) ?? {},
      };

      // Verwende das lockere DB-Schema für Validierung mit transform
      const validated = UIInvestigationDBSchema.safeParse(uiData);
      if (!validated.success) {
        console.error("Validierungsfehler:", validated.error.errors);
        return { success: false, error: validated.error };
      }

      return { success: true, data: validated.data };
    } catch (error) {
      return {
        success: false,
        error: new Error(`Konvertierung fehlgeschlagen: ${String(error)}`),
      };
    }
  }

  /**
   * Bereinigt Kontaktinformationen
   */
  private static cleanContactInfo(
    contact: Record<string, unknown> | undefined,
  ): {
    person?: string;
    phone?: string;
    email?: string;
    hours?: string;
  } {
    if (!contact || typeof contact !== "object") return {};

    return {
      person:
        typeof contact["person"] === "string" ? contact["person"] : undefined,
      phone:
        typeof contact["phone"] === "string" ? contact["phone"] : undefined,
      email:
        typeof contact["email"] === "string" ? contact["email"] : undefined,
      hours:
        typeof contact["hours"] === "string" ? contact["hours"] : undefined,
    };
  }

  /**
   * Bereinigt Telefonnummern für DB-Format
   */
  static sanitizePhoneNumber(phone: string): string {
    if (!phone || phone === "null" || phone === "undefined") return "";

    // Entferne ungültige Zeichen, behalte aber das Format
    // Erlaubt: Ziffern, Leerzeichen, -, +, (, ), ., /, :, ,, ;
    return phone.replace(/[^\d\s\-\+\(\)\.\/\:\,\;]/g, "");
  }

  /**
   * Bereinigt E-Mail für DB-Format
   */
  static sanitizeEmail(email: string): string {
    // Wenn leer oder ungültig, return leerer String
    if (!email || email === "null" || email === "undefined") return "";

    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : "";
  }

  /**
   * Validiert Kategorie
   */
  private static validateCategory(
    category: string,
  ): "WANTED_PERSON" | "MISSING_PERSON" | "UNKNOWN_DEAD" | "STOLEN_GOODS" {
    const validCategories = [
      "WANTED_PERSON",
      "MISSING_PERSON",
      "UNKNOWN_DEAD",
      "STOLEN_GOODS",
    ] as const;
    return validCategories.includes(
      category as (typeof validCategories)[number],
    )
      ? (category as
          | "WANTED_PERSON"
          | "MISSING_PERSON"
          | "UNKNOWN_DEAD"
          | "STOLEN_GOODS")
      : "MISSING_PERSON";
  }

  /**
   * Validiert Priorität
   */
  private static validatePriority(
    priority: string,
  ): "normal" | "urgent" | "new" {
    const validPriorities = ["normal", "urgent", "new"] as const;
    return validPriorities.includes(
      priority as (typeof validPriorities)[number],
    )
      ? (priority as "normal" | "urgent" | "new")
      : "normal";
  }

  /**
   * Validiert nur beim Speichern (UI → DB)
   */
  static validateForSave(data: UIInvestigationData): {
    isValid: boolean;
    errors: string[];
  } {
    console.log("🔍 DEBUG: Validiere Daten:", JSON.stringify(data, null, 2));

    // Bereinige Daten vor der Validierung
    const cleanedData = {
      ...data,
      step1: {
        title: data.step1?.title?.trim() ?? "",
        category: data.step1?.category ?? "MISSING_PERSON",
        caseNumber: data.step1?.caseNumber ?? "",
      },
      step2: {
        shortDescription: data.step2?.shortDescription?.trim() ?? "",
        description: data.step2?.description?.trim() ?? "",
        priority: data.step2?.priority ?? "normal",
        tags: data.step2?.tags ?? [],
        features: data.step2?.features ?? "",
      },
      step3: {
        mainImage: data.step3?.mainImage ?? null,
        additionalImages: data.step3?.additionalImages ?? [],
      },
      step4: {
        mainLocation: data.step4?.mainLocation ?? null,
      },
      step5: {
        contactPerson: data.step5?.contactPerson?.trim() ?? "",
        contactPhone: data.step5?.contactPhone?.trim() ?? "",
        contactEmail: data.step5?.contactEmail?.trim() ?? "",
        department: data.step5?.department ?? "",
        availableHours: data.step5?.availableHours ?? "",
      },
    };

    console.log(
      "🔍 DEBUG: Bereinigte Daten:",
      JSON.stringify(cleanedData, null, 2),
    );

    // Verwende das tolerantere Edit-Schema für bestehende Daten
    const validation = UIInvestigationEditSchema.safeParse(cleanedData);

    if (!validation.success) {
      console.log(
        "🔍 DEBUG: Validierungsfehler Details:",
        validation.error.errors,
      );
      const errors = validation.error.errors.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Konvertiert UI-Format zu API-Format für Updates
   */
  static toAPIFormat(uiData: UIInvestigationData): {
    title?: string;
    description?: string;
    short_description?: string;
    priority?: "normal" | "urgent" | "new";
    category?:
      | "WANTED_PERSON"
      | "MISSING_PERSON"
      | "UNKNOWN_DEAD"
      | "STOLEN_GOODS";
    tags?: string[];
    location?: string;
    contact_info?: {
      person?: string;
      phone?: string;
      email?: string;
      hours?: string;
    };
    features?: string;
    station?: string;
  } {
    // Bereinige Daten vor der Konvertierung
    const cleanedData = {
      ...uiData,
      step1: {
        title: uiData.step1?.title?.trim() ?? "",
        category: uiData.step1?.category ?? "MISSING_PERSON",
        caseNumber: uiData.step1?.caseNumber ?? "",
      },
      step2: {
        shortDescription: uiData.step2?.shortDescription?.trim() ?? "",
        description: uiData.step2?.description?.trim() ?? "",
        priority: uiData.step2?.priority ?? "normal",
        tags: uiData.step2?.tags ?? [],
        features: uiData.step2?.features ?? "",
      },
      step3: {
        mainImage: uiData.step3?.mainImage ?? null,
        additionalImages: uiData.step3?.additionalImages ?? [],
      },
      step4: {
        mainLocation: uiData.step4?.mainLocation ?? null,
      },
      step5: {
        contactPerson: uiData.step5?.contactPerson?.trim() ?? "",
        contactPhone: uiData.step5?.contactPhone?.trim() ?? "",
        contactEmail: uiData.step5?.contactEmail?.trim() ?? "",
        department: uiData.step5?.department ?? "",
        availableHours: uiData.step5?.availableHours ?? "",
      },
    };

    return {
      title: cleanedData.step1.title ?? undefined,
      description: cleanedData.step2.description ?? undefined,
      short_description: cleanedData.step2.shortDescription ?? undefined,
      priority: cleanedData.step2.priority,
      category: cleanedData.step1.category,
      tags:
        cleanedData.step2.tags.length > 0 ? cleanedData.step2.tags : undefined,
      location: cleanedData.step4.mainLocation?.address ?? undefined,
      contact_info: {
        person: cleanedData.step5.contactPerson || undefined,
        phone:
          this.sanitizePhoneNumber(cleanedData.step5.contactPhone) || undefined,
        email: ((): string | undefined => {
          const sanitized = this.sanitizeEmail(cleanedData.step5.contactEmail);
          return sanitized ? sanitized : undefined;
        })(),
        hours: cleanedData.step5.availableHours || undefined,
      },
      features: cleanedData.step2.features ?? undefined,
      station: cleanedData.step5.department ?? undefined,
    };
  }
}
