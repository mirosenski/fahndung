import { useRealtimeSync } from "~/hooks/useRealtimeSync";
import { Wifi, WifiOff, AlertCircle, Radio } from "lucide-react";

export function RealtimeStatus() {
  const {
    isConnected,
    connectionAttempts,
    maxReconnectAttempts,
    connectionType,
  } = useRealtimeSync();

  if (isConnected && connectionType === "postgres") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Wifi className="h-4 w-4" />
        <span>Real-time aktiv (Postgres)</span>
      </div>
    );
  }

  if (isConnected && connectionType === "broadcast") {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Radio className="h-4 w-4" />
        <span>Real-time aktiv (Broadcast)</span>
      </div>
    );
  }

  if (connectionAttempts >= maxReconnectAttempts) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Real-time inaktiv (Fallback aktiv)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-yellow-600">
      <WifiOff className="h-4 w-4" />
      <span>
        Verbinde... ({connectionAttempts}/{maxReconnectAttempts})
      </span>
    </div>
  );
}
