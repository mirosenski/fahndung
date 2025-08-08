import { useState, useEffect, useCallback } from "react";
import { FahndungsService } from "@/lib/services/fahndungs.service";
import { supabase } from "~/lib/supabase";
import type { InvestigationData } from "@/lib/services/fahndungs.service";
import { getErrorMessage } from "@/types/errors";

export function useFahndungen(filters?: {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const [investigations, setInvestigations] = useState<InvestigationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvestigations = useCallback(async () => {
    try {
      setLoading(true);
      const service = new FahndungsService(supabase);
      const data = await service.getInvestigations(filters);
      setInvestigations(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadInvestigations();
  }, [filters, loadInvestigations]);

  return { investigations, loading, error, refetch: loadInvestigations };
}
