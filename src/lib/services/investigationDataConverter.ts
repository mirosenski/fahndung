import {
  UIInvestigationDBSchema,
  UIInvestigationInputSchema,
  type UIInvestigationData,
} from "~/lib/types/investigation.types";
import type { z } from "zod";

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
    // Entferne ungültige Zeichen, behalte aber das Format
    return phone.replace(/[^\d\s\-\+\(\)]/g, "");
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
    // Verwende das strenge Schema nur für Benutzereingaben
    const validation = UIInvestigationInputSchema.safeParse(data);

    if (!validation.success) {
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
    return {
      title: uiData.step1.title ?? undefined,
      description: uiData.step2.description ?? undefined,
      short_description: uiData.step2.shortDescription ?? undefined,
      priority: uiData.step2.priority,
      category: uiData.step1.category,
      tags: uiData.step2.tags.length > 0 ? uiData.step2.tags : undefined,
      location: uiData.step4.mainLocation?.address ?? undefined,
      contact_info: {
        person: uiData.step5.contactPerson ?? undefined,
        phone: this.sanitizePhoneNumber(uiData.step5.contactPhone) ?? undefined,
        email: this.sanitizeEmail(uiData.step5.contactEmail) ?? undefined,
        hours: uiData.step5.availableHours ?? undefined,
      },
      features: uiData.step2.features ?? undefined,
      station: uiData.step5.department ?? undefined,
    };
  }
}
