import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import type {
  InvestigationData,
  InvestigationImage,
  ArticleBlock,
} from "@/lib/services/fahndungs.service";
import { getErrorMessage } from "@/types/errors";

export function useFahndung(id: string) {
  const [investigation, setInvestigation] = useState<InvestigationData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const {
    data: rawData,
    isLoading,
    error: queryError,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id },
    {
      enabled: !!id,
    },
  );

  // Effect to handle investigation data conversion
  useEffect(() => {
    if (rawData) {
      console.log("🔍 Raw tRPC data:", rawData);
      const convertedData: InvestigationData = {
        ...rawData,
        status:
          (rawData.status as "draft" | "active" | "published" | "archived") ??
          "active",
        priority: rawData.priority ?? "normal",
        category:
          (rawData.category as
            | "WANTED_PERSON"
            | "MISSING_PERSON"
            | "UNKNOWN_DEAD"
            | "STOLEN_GOODS") ?? "MISSING_PERSON",
        contact_info: rawData.contact_info ?? {},
        created_by_user: rawData.created_by_user ?? undefined,
        assigned_to_user: rawData.assigned_to_user ?? undefined,
        images: (rawData.images as InvestigationImage[]) ?? [],
        article_content: rawData.article_content
          ? {
              blocks:
                (rawData.article_content.blocks as unknown as ArticleBlock[]) ??
                [],
            }
          : undefined,
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
      const convertedData: InvestigationData = {
        ...updatedData,
        status:
          (updatedData.status as
            | "draft"
            | "active"
            | "published"
            | "archived") ?? "active",
        priority: updatedData.priority ?? "normal",
        category:
          (updatedData.category as
            | "WANTED_PERSON"
            | "MISSING_PERSON"
            | "UNKNOWN_DEAD"
            | "STOLEN_GOODS") ?? "MISSING_PERSON",
        contact_info: updatedData.contact_info ?? {},
        created_by_user: updatedData.created_by_user ?? undefined,
        assigned_to_user: updatedData.assigned_to_user ?? undefined,
        images: (updatedData.images as InvestigationImage[]) ?? [],
        article_content: updatedData.article_content
          ? {
              blocks:
                (updatedData.article_content
                  .blocks as unknown as ArticleBlock[]) ?? [],
            }
          : undefined,
      };
      setInvestigation(convertedData);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  async function updateInvestigation(data: Partial<InvestigationData>) {
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
