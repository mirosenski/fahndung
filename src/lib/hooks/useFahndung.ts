import { useState, useEffect, useCallback } from "react";
import { FahndungsService } from "@/lib/services/fahndungs.service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { InvestigationData } from "@/lib/services/fahndungs.service";
import { getErrorMessage } from "@/types/errors";

export function useFahndung(id: string) {
  const [investigation, setInvestigation] = useState<InvestigationData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvestigation = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      const service = new FahndungsService(supabase);
      const data = await service.getInvestigation(id);
      setInvestigation(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void loadInvestigation();
    }
  }, [id, loadInvestigation]);

  async function updateInvestigation(data: Partial<InvestigationData>) {
    try {
      const supabase = createClientComponentClient();
      const service = new FahndungsService(supabase);
      const updated = await service.updateInvestigation(id, data);
      setInvestigation(updated);
      return updated;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    }
  }

  return {
    investigation,
    loading,
    error,
    updateInvestigation,
    refetch: loadInvestigation,
  };
}
