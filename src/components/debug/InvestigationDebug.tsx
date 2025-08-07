"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  isValidInvestigationId,
  getInvestigationIdType,
} from "~/lib/utils/validation";

// TypeScript-Typen für die Investigation
interface Investigation {
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
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
  published_as_article?: boolean;
  article_slug?: string;
  article_content?: {
    blocks: Array<{
      type: string;
      content: Record<string, unknown>;
      id?: string;
    }>;
  };
  article_meta?: {
    seo_title?: string;
    seo_description?: string;
    og_image?: string;
    keywords?: string[];
    author?: string;
    reading_time?: number;
  };
  article_published_at?: string;
  article_views?: number;
}

interface InvestigationDebugProps {
  investigationId: string;
}

export function InvestigationDebug({
  investigationId,
}: InvestigationDebugProps) {
  const [debugInfo, setDebugInfo] = useState<{
    id: string;
    isValid: boolean;
    type: string;
    length: number;
    trimmed: string;
  }>({
    id: investigationId,
    isValid: false,
    type: "unknown",
    length: 0,
    trimmed: "",
  });

  const {
    data: investigation,
    isLoading,
    error,
    isError,
  } = api.post.getInvestigation.useQuery(
    { id: investigationId },
    {
      enabled: isValidInvestigationId(investigationId),
      retry: false, // Keine Retries für Debug
    },
  );

  useEffect(() => {
    setDebugInfo({
      id: investigationId,
      isValid: isValidInvestigationId(investigationId),
      type: getInvestigationIdType(investigationId),
      length: investigationId?.length ?? 0,
      trimmed: investigationId?.trim() ?? "",
    });
  }, [investigationId]);

  if (process.env.NODE_ENV !== "development") {
    return null; // Nur in Development anzeigen
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-red-300 bg-red-50 p-4 text-xs text-red-800 shadow-lg dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
      <h3 className="mb-2 font-bold">🔍 Investigation Debug</h3>
      <div className="space-y-1">
        <div>
          <strong>ID:</strong> {debugInfo.id || "undefined"}
        </div>
        <div>
          <strong>Valid:</strong> {debugInfo.isValid ? "✅" : "❌"}
        </div>
        <div>
          <strong>Type:</strong> {debugInfo.type}
        </div>
        <div>
          <strong>Length:</strong> {debugInfo.length}
        </div>
        <div>
          <strong>Trimmed:</strong> &quot;{debugInfo.trimmed}&quot;
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? "🔄" : "✅"}
        </div>
        <div>
          <strong>Error:</strong> {isError ? "❌" : "✅"}
        </div>
        {error && (
          <div>
            <strong>Error Message:</strong> {error.message}
          </div>
        )}
        {investigation && (
          <div>
            <strong>Found:</strong> {(investigation as Investigation).title}
          </div>
        )}
      </div>
    </div>
  );
}
