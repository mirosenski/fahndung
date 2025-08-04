"use client";

import { useRealtimeSync } from "~/hooks/useRealtimeSync";

interface RealtimeSyncWrapperProps {
  children: React.ReactNode;
}

export function RealtimeSyncWrapper({ children }: RealtimeSyncWrapperProps) {
  // Aktivierung der Supabase Real-time Subscriptions
  useRealtimeSync();

  return <>{children}</>;
}
