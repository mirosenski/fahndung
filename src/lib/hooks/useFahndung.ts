import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { isValidInvestigationId } from "~/lib/utils/validation";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Ein unbekannter Fehler ist aufgetreten";
}

export function useFahndung(id: string) {
  const [investigation, setInvestigation] =
    useState<UIInvestigationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validiere ID
  const isValidId = isValidInvestigationId(id);

  const {
    data: rawData,
    isLoading,
    error: queryError,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id },
    {
      enabled: isValidId, // Nur ausführen wenn ID gültig ist
      retry: (failureCount, error) => {
        // Retry-Logik verbessern
        if (failureCount < 2) {
          // Reduziert von 3 auf 2
          console.log(
            `🔄 Retry ${failureCount + 1}/2 für getInvestigation (useFahndung)`,
          );
          return true;
        }
        console.error(
          "❌ Max retries erreicht für getInvestigation (useFahndung):",
          error,
        );
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000), // Reduziert
    },
  );

  // Effect to handle investigation data conversion
  useEffect(() => {
    if (rawData) {
      console.log("🔍 Raw tRPC data:", rawData);
      const convertedData: UIInvestigationData = {
        step1: {
          title: rawData.title ?? "",
          category:
            (rawData.category as
              | "WANTED_PERSON"
              | "MISSING_PERSON"
              | "UNKNOWN_DEAD"
              | "STOLEN_GOODS") ?? "MISSING_PERSON",
          caseNumber: rawData.case_number ?? "",
          priority: rawData.priority ?? "normal",
        },
        step2: {
          shortDescription: rawData.short_description ?? "",
          description: rawData.description ?? "",
          priority: rawData.priority ?? "normal",
          tags: rawData.tags ?? [],
          features: rawData.features ?? "",
        },
        step3: {
          mainImage: rawData.images?.[0]?.url ?? null,
          additionalImages:
            rawData.images?.slice(1).map((img: { url: string }) => img.url) ??
            [],
        },
        step4: {
          mainLocation: rawData.location ? { address: rawData.location } : null,
        },
        step5: {
          contactPerson: (rawData.contact_info?.["person"] as string) ?? "",
          contactPhone: (rawData.contact_info?.["phone"] as string) ?? "",
          contactEmail: (rawData.contact_info?.["email"] as string) ?? "",
          department: rawData.station ?? "",
          availableHours: (rawData.contact_info?.["hours"] as string) ?? "",
          publishStatus: "draft" as const,
          urgencyLevel: "medium" as const,
          requiresApproval: false,
          visibility: {
            internal: true,
            regional: false,
            national: false,
            international: false,
          },
          notifications: {
            emailAlerts: false,
            smsAlerts: false,
            appNotifications: false,
            pressRelease: false,
          },
          articlePublishing: {
            publishAsArticle: false,
            generateSeoUrl: false,
            customSlug: "",
            seoTitle: "",
            seoDescription: "",
            keywords: [],
            author: "",
            readingTime: 0,
          },
        },
        images: rawData.images ?? [],
        contact_info: rawData.contact_info ?? {},
      };
      setInvestigation(convertedData);
    }
  }, [rawData]);

  // Effect to handle errors
  useEffect(() => {
    if (queryError) {
      setError(getErrorMessage(queryError));
    }
  }, [queryError]);

  const updateInvestigationMutation = api.post.updateInvestigation.useMutation({
    onSuccess: (updatedData) => {
      const convertedData: UIInvestigationData = {
        step1: {
          title: updatedData.title ?? "",
          category:
            (updatedData.category as
              | "WANTED_PERSON"
              | "MISSING_PERSON"
              | "UNKNOWN_DEAD"
              | "STOLEN_GOODS") ?? "MISSING_PERSON",
          caseNumber: updatedData.case_number ?? "",
          priority: updatedData.priority ?? "normal",
        },
        step2: {
          shortDescription: updatedData.short_description ?? "",
          description: updatedData.description ?? "",
          priority: updatedData.priority ?? "normal",
          tags: updatedData.tags ?? [],
          features: updatedData.features ?? "",
        },
        step3: {
          mainImage: updatedData.images?.[0]?.url ?? null,
          additionalImages:
            updatedData.images
              ?.slice(1)
              .map((img: { url: string }) => img.url) ?? [],
        },
        step4: {
          mainLocation: updatedData.location
            ? { address: updatedData.location }
            : null,
        },
        step5: {
          contactPerson: (updatedData.contact_info?.["person"] as string) ?? "",
          contactPhone: (updatedData.contact_info?.["phone"] as string) ?? "",
          contactEmail: (updatedData.contact_info?.["email"] as string) ?? "",
          department: updatedData.station ?? "",
          availableHours: (updatedData.contact_info?.["hours"] as string) ?? "",
          publishStatus: "draft" as const,
          urgencyLevel: "medium" as const,
          requiresApproval: false,
          visibility: {
            internal: true,
            regional: false,
            national: false,
            international: false,
          },
          notifications: {
            emailAlerts: false,
            smsAlerts: false,
            appNotifications: false,
            pressRelease: false,
          },
          articlePublishing: {
            publishAsArticle: false,
            generateSeoUrl: false,
            customSlug: "",
            seoTitle: "",
            seoDescription: "",
            keywords: [],
            author: "",
            readingTime: 0,
          },
        },
        images: updatedData.images ?? [],
        contact_info: updatedData.contact_info ?? {},
      };
      setInvestigation(convertedData);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  async function updateInvestigation(data: Partial<UIInvestigationData>) {
    try {
      const updated = await updateInvestigationMutation.mutateAsync({
        id,
        ...data,
      });
      return updated;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    }
  }

  return {
    investigation,
    loading: isLoading,
    error: error ?? getErrorMessage(queryError),
    updateInvestigation,
    refetch,
  };
}
