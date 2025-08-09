import { z } from "zod";
import type { WizardData } from "~/components/fahndungen/types/WizardTypes";

// Telefon: Mindestens 7 Ziffern, erlaubt +, -, Leerzeichen, Klammern, Punkte
const phoneRegex =
  /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const phoneDigitsOnly = (phone: string) => phone.replace(/\D/g, "").length >= 7;

// Step 1 Schema
export const step1Schema = z.object({
  title: z
    .string()
    .min(5, "Titel muss mindestens 5 Zeichen haben")
    .max(100, "Titel darf maximal 100 Zeichen haben"),
  category: z.enum([
    "WANTED_PERSON",
    "MISSING_PERSON",
    "UNKNOWN_DEAD",
    "STOLEN_GOODS",
  ]),
  // Pflichtfelder laut Anforderung: 1-5 (ohne Aktenzeichen)
  department: z.string().min(1, "Dienststelle ist erforderlich"),
  caseDate: z.string().min(1, "Fahndungsdatum ist erforderlich"),
  variant: z.string().min(1, "Variante ist erforderlich"),
  // Aktenzeichen (6) ist ausdrücklich NICHT pflicht
  caseNumber: z.string().optional(),
});

// Step 2 Schema
export const step2Schema = z.object({
  shortDescription: z
    .string()
    .min(20, "Kurzbeschreibung muss mindestens 20 Zeichen haben")
    .max(200, "Kurzbeschreibung darf maximal 200 Zeichen haben"),
  description: z
    .string()
    .min(50, "Beschreibung muss mindestens 50 Zeichen haben")
    .max(5000, "Beschreibung darf maximal 5000 Zeichen haben"),
  priority: z.enum(["normal", "urgent", "new"]),
  tags: z.array(z.string()).optional(),
});

// Step 3 Schema
export const step3Schema = z.object({
  mainImage: z.any().refine((val) => val !== null, {
    message: "Hauptbild ist erforderlich",
  }),
  mainImageUrl: z.string().optional(),
});

// Step 4 Schema
export const step4Schema = z.object({
  mainLocation: z
    .object({
      address: z.string().min(1, "Adresse erforderlich"),
      lat: z.number(),
      lng: z.number(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Hauptstandort ist erforderlich",
    }),
  searchRadius: z.number().min(1).max(100),
});

// Step 5 Schema
export const step5Schema = z.object({
  contactPerson: z
    .string()
    .min(3, "Name muss mindestens 3 Zeichen haben")
    .max(100, "Name darf maximal 100 Zeichen haben"),
  contactPhone: z
    .string()
    .regex(phoneRegex, "Ungültige Telefonnummer")
    .refine(
      phoneDigitsOnly,
      "Telefonnummer muss mindestens 7 Ziffern enthalten",
    ),
  contactEmail: z
    .string()
    .email("Ungültige E-Mail-Adresse")
    .or(z.string().length(0))
    .optional(),
  department: z.string().optional(),
  publishStatus: z.enum(["draft", "immediate"]),
});

export const validateStep = (
  step: number,
  data: Partial<WizardData>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  let isValid = false;

  try {
    switch (step) {
      case 1:
        step1Schema.parse(data.step1);
        isValid = true;
        break;
      case 2:
        step2Schema.parse(data.step2);
        isValid = true;
        break;
      case 3:
        step3Schema.parse(data.step3);
        isValid = true;
        break;
      case 4:
        step4Schema.parse(data.step4);
        isValid = true;
        break;
      case 5:
        step5Schema.parse(data.step5);
        isValid = true;
        break;
      default:
        isValid = true;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  return { isValid, errors };
};

// Inline Validierung für einzelne Felder
export const validateField = (
  fieldName: string,
  value: unknown,
  step: number,
): string | null => {
  try {
    switch (step) {
      case 1:
        if (fieldName === "title") {
          step1Schema.shape.title.parse(value);
        }
        break;
      case 2:
        if (fieldName === "shortDescription") {
          step2Schema.shape.shortDescription.parse(value);
        } else if (fieldName === "description") {
          step2Schema.shape.description.parse(value);
        }
        break;
      case 5:
        if (fieldName === "contactPhone") {
          step5Schema.shape.contactPhone.parse(value);
        } else if (fieldName === "contactEmail" && value) {
          step5Schema.shape.contactEmail.parse(value);
        }
        break;
      default:
        break;
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message ?? "Ungültiger Wert";
    }
    return null;
  }
};
