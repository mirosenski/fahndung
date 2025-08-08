// src/components/ui/CaseNumberDisplay.tsx
import React from "react";
import { getCaseNumberInfo } from "~/lib/utils/caseNumberGenerator";

interface CaseNumberDisplayProps {
  caseNumber: string;
  showDetails?: boolean;
  className?: string;
}

export default function CaseNumberDisplay({
  caseNumber,
  showDetails = false,
  className = "",
}: CaseNumberDisplayProps) {
  const info = getCaseNumberInfo(caseNumber);

  if (!info) {
    return (
      <div className={`font-mono text-sm text-muted-foreground ${className}`}>
        {caseNumber}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="font-mono text-sm font-medium text-muted-foreground dark:text-white">
        {caseNumber}
      </div>

      {showDetails && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="font-medium">Behörde:</span>
            {info.authority}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">Jahr:</span>
            {info.year}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">Sachgebiet:</span>
            {info.subjectLabel}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">Nr:</span>#{info.sequence}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">Status:</span>
            {info.statusLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// Kompakte Version für Karten
export function CaseNumberBadge({ caseNumber }: { caseNumber: string }) {
  return (
    <div className="rounded-lg bg-black/80 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm">
      #{caseNumber}
    </div>
  );
}

// Detaillierte Version für Listen
export function CaseNumberDetailed({ caseNumber }: { caseNumber: string }) {
  const info = getCaseNumberInfo(caseNumber);

  if (!info) {
    return <div className="font-mono text-sm text-muted-foreground">{caseNumber}</div>;
  }

  return (
    <div className="space-y-1">
      <div className="font-mono text-sm font-medium text-muted-foreground dark:text-white">
        {caseNumber}
      </div>
      <div className="text-xs text-muted-foreground dark:text-muted-foreground">
        {info.authority} • {info.year} • {info.subjectLabel} • #{info.sequence}{" "}
        • {info.statusLabel}
      </div>
    </div>
  );
}
